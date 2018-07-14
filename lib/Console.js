import { useLogging, useVerboseLogging } from './Config';

const console = self.console;

const Console = {
    _verbose: false,

    _print(name, ...args) {
        if (!useLogging()) {
            return;
        }

        if (this._verbose && !useVerboseLogging()) {
            return;
        }

        return console[name](...args);
    },

    error(...args) { return console.error(...args); },

    debug(...args) { return this._print('debug', ...args); },

    dir(...args) { return this._print('dir', ...args); },

    info(...args) { return this._print('info', ...args); },

    count(...args) { return this._print('count', ...args); },

    countReset(...args) { return this._print('countReset', ...args); },

    group(...args) { return this._print('group', ...args); },

    groupCollapsed(...args) { return this._print('groupCollapsed', ...args); },

    groupend(...args) { return this._print('groupEnd', ...args); },

    table(...args) { return this._print('table', ...args); },

    time(...args) { return this._print('time', ...args); },

    timeEnd(...args) { return this._print('timeEnd', ...args); },

    timeLog(...args) { return this._print('timeLog', ...args); },

    warn(...args) { return this._print('warn', ...args); },

    profile(...args) { return console.profile(...args); },

    profileEnd(...args) { return console.profileEnd(...args); },

    verbose() {
        return { _verbose: true, __proto__: this };
    }
};

export default Console;
