/* eslint-env node */

const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs');
const virtualConsole = new VirtualConsole();

virtualConsole.sendTo(console);

const options = {
    virtualConsole: virtualConsole,
    runScripts: 'outside-only'
};

const nodeRenderer = function({ document, code }) {
    JSDOM.fromFile(document, options).then(dom => {
        const source = fs.readFileSync(code, 'utf8');

        // localStorage shim
        dom.window.localStorage = { getItem() { return undefined; }, setItem(key, value) { return value; } };

        // requestAnimationFrame shim
        dom.window.requestAnimationFrame = function(callback) { dom.window.setTimeout(() => callback(0), 0); };

        // performance shim
        dom.window.performance = {
            now() { return Date.now(); }
        };

        // set document to dehytraton mode
        dom.window.DEHYDRATION_MODE = true;

        const promise = new Promise((done) => {
            dom.window.addEventListener('dehydrationDone', () => done(dom.serialize()));
        });

        dom.window.eval(source);

        // WebComponentsReady shim
        dom.window.dispatchEvent(new dom.window.CustomEvent('WebComponentsReady'));

        return promise;
    });
};

export default nodeRenderer;
