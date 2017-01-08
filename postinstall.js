/* eslint-env node */
const fs = require('fs');

console.log('creating system links...');

// remove existing soft links
if (fs.existsSync('./af')) {
    fs.unlinkSync('./af');
}

// create all soft links
fs.symlinkSync('./node_modules/application-frame', 'af', 'dir');
