import { downloads } from 'thousandeyes';

runScript();

async function runScript() {
    // This will wait up to 60 seconds for MyFilename.pdf to finish downloading.
    // If it's already been downladed, it will finish immediately.
    // If it's not currently downloading, it will wait for the download to start 
    await downloads.waitForDownload('MyFilename.pdf', 60 * 1000);
};
