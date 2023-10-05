import { By } from 'selenium-webdriver';
import { driver } from 'thousandeyes';
import assert from 'assert';

runScript();

async function runScript() {
    
    await driver.get('https://www.x-rates.com/table/?from=USD&amount=1');

    const usdToEuroRateCell = await driver.findElement(By.css(`[href="https://www.x-rates.com/graph/?from=USD&to=EUR"]`));
    const currentUsdToEuroRate = Number(usdToEuroRateCell.getText());

    const isOneEuroWorthMoreThanTwoUsd = currentUsdToEuroRate < 0.5;
    assert(isOneEuroWorthMoreThanTwoUsd, 'One Euro is not worth more than 2 USD!');
}
