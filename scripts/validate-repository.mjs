import { spawnSync } from 'node:child_process';
import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const examplesRoot = path.join(repositoryRoot, 'examples');
const templatesRoot = path.join(repositoryRoot, 'templates');
const examplesReadmePath = path.join(examplesRoot, 'README.md');
const customizableValuesComment = 'This section contains the customizable values.';
const failures = [];

const exampleScripts = await collectFiles(examplesRoot, '.js');
const templateScripts = await collectFiles(templatesRoot, '.js');
const scripts = [...exampleScripts, ...templateScripts].sort();
const markdownFiles = (await collectFiles(repositoryRoot, '.md'))
  .filter((filePath) => !filePath.includes(`${path.sep}.git${path.sep}`));

await checkJavaScriptSyntax(scripts);
await checkCustomizableValuesSections(scripts);
await checkSafeDiagnosticPatterns([...scripts, ...markdownFiles]);
await checkMarkdownLinks(markdownFiles);
await checkExampleIndexCoverage();

if (failures.length > 0) {
  console.error('Repository validation failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log(`Repository validation passed: ${scripts.length} JavaScript files and ${markdownFiles.length} Markdown files checked.`);
}

async function collectFiles(directory, extension) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...await collectFiles(entryPath, extension));
    } else if (entry.isFile() && entry.name.endsWith(extension)) {
      files.push(entryPath);
    }
  }

  return files;
}

async function checkJavaScriptSyntax(filePaths) {
  for (const filePath of filePaths) {
    const result = spawnSync(process.execPath, ['--check', filePath], {
      encoding: 'utf8',
    });

    if (result.status !== 0) {
      failures.push(`${relativePath(filePath)} does not pass Node.js syntax validation: ${result.stderr.trim()}`);
    }
  }
}

async function checkCustomizableValuesSections(filePaths) {
  for (const filePath of filePaths) {
    const source = await readFile(filePath, 'utf8');
    const hasTopLevelValues = /^(?:const|let|var)\s+/m.test(source);

    if (hasTopLevelValues && !source.includes(customizableValuesComment)) {
      failures.push(`${relativePath(filePath)} has top-level values but no customizable-values comment`);
    }
  }
}

async function checkSafeDiagnosticPatterns(filePaths) {
  const unsafePatterns = [
    {
      pattern: /Transaction failed: \$\{error\.message\}/,
      description: 'raw error messages in diagnostics',
    },
    {
      pattern: /console\.log\(`Current URL:/,
      description: 'full URLs in diagnostics',
    },
    {
      pattern: /console\.log\(`Page title:/,
      description: 'page titles in diagnostics',
    },
  ];

  for (const filePath of filePaths) {
    const source = await readFile(filePath, 'utf8');

    for (const { pattern, description } of unsafePatterns) {
      if (pattern.test(source)) {
        failures.push(`${relativePath(filePath)} contains ${description}`);
      }
    }
  }
}

async function checkMarkdownLinks(filePaths) {
  const markdownLinkPattern = /!?\[[^\]]*\]\(([^)]+)\)/g;

  for (const filePath of filePaths) {
    const source = await readFile(filePath, 'utf8');

    for (const match of source.matchAll(markdownLinkPattern)) {
      const target = match[1].trim();
      if (isExternalLink(target)) {
        continue;
      }

      const localTarget = target
        .replace(/^<|>$/g, '')
        .split('#', 1)[0]
        .split('?', 1)[0];

      if (!localTarget) {
        continue;
      }

      let decodedTarget;
      try {
        decodedTarget = decodeURIComponent(localTarget);
      } catch (error) {
        failures.push(`${relativePath(filePath)} contains an invalid encoded link target: ${target}`);
        continue;
      }

      const resolvedTarget = path.resolve(path.dirname(filePath), decodedTarget);
      if (!existsSync(resolvedTarget)) {
        failures.push(`${relativePath(filePath)} links to missing path: ${target}`);
      }
    }
  }
}

async function checkExampleIndexCoverage() {
  const examplesReadme = await readFile(examplesReadmePath, 'utf8');
  const categoryEntries = await readdir(examplesRoot, { withFileTypes: true });

  for (const categoryEntry of categoryEntries) {
    if (!categoryEntry.isDirectory() || !/^\d\d-/.test(categoryEntry.name)) {
      continue;
    }

    const categoryPath = path.join(examplesRoot, categoryEntry.name);
    const categoryReadmePath = path.join(categoryPath, 'README.md');

    if (!existsSync(categoryReadmePath)) {
      failures.push(`${relativePath(categoryPath)} is missing README.md`);
      continue;
    }

    if (!examplesReadme.includes(`(${categoryEntry.name}/)`)) {
      failures.push(`examples/README.md does not link to ${categoryEntry.name}/`);
    }

    const categoryReadme = await readFile(categoryReadmePath, 'utf8');
    const categoryScripts = (await readdir(categoryPath, { withFileTypes: true }))
      .filter((entry) => entry.isFile() && entry.name.endsWith('.js'))
      .map((entry) => entry.name);

    for (const scriptName of categoryScripts) {
      if (!categoryReadme.includes(`(${scriptName})`)) {
        failures.push(`${relativePath(categoryReadmePath)} does not link to ${scriptName}`);
      }
    }
  }
}

function isExternalLink(target) {
  return /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(target);
}

function relativePath(filePath) {
  return path.relative(repositoryRoot, filePath) || '.';
}
