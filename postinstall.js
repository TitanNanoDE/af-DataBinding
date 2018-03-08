/* eslint-env node */
const fs = require('fs');
const path = require('path');

const linkModule = function(source, target) {
    source = path.dirname(require.resolve('application-frame/core/Application'));
    source = path.relative(__dirname, path.dirname(source));

    fs.symlinkSync(source, target, 'dir');
};

console.log('creating system links...');

// remove existing soft links
if (fs.existsSync('./af')) {
    fs.unlinkSync('./af');
}

// create all soft links
linkModule('application-frame', 'af');
