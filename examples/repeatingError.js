/*
    Sometimes you just need to test your alerting workflow with a test that throws out
    errors in a predictable way. This is it.

    Author: primoz@thousandeyes.com
*/

import { test } from 'thousandeyes';

const errorRounds = 1;
const errorOutOfRounds = 2;

runScript();

async function runScript() {

    const settings = test.getSettings();
    let interval = settings.interval
    // Interval is NaN in IDE or instant test.
    if (isNaN(interval)) {
        interval = 300;
    }

    let timestamp = Math.floor(Date.now() / 1000);
    let roundNo = Math.floor(timestamp / interval);
    let currentRound = roundNo % errorOutOfRounds;

    console.log('Round ' + (currentRound+1) + ' of ' + errorOutOfRounds);
    if (currentRound < errorRounds) {
        console.log('Throw error');
        throw Error ('This error is thrown for ' + errorRounds + ' rounds every ' + errorOutOfRounds + ' rounds.');
    }

};
