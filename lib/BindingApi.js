import { scheduleScopeUpdate } from './Bind';
import Binding from './Binding';
import BindingRegistry from './BindingRegistry';
import * as Parser from './Parser';

let currentScopeInfo = null;

const scheduledScopeUpdates = new Map();
const instanceMap = new WeakMap();

let updateScheduled = false;

const BindingApiPrototype = {

    _binding: null,

    _scopeInfo: null,

    registerBinding(binding) {
        return BindingRegistry.register(binding);
    },

    attachBinding(bindingInstance) {
        currentScopeInfo.bindings.push(bindingInstance);
    },

    parser: Parser,

    Binding,

    scheduleScopeUpdate(callback) {

        const { binding: identifier } = this;

        if (!this._scopeInfo) {
            console.error('[DataBinding API]', '"scheduleScopeUpdate" has to be called on an api instance! No scope context present!');
            return;
        }

        if (!identifier || typeof identifier.update !== 'function' || typeof identifier.test !== 'function') {
            console.log('[DataBinding API]',
                'unable to schedule scope update! identifier does not match the Binidng trait!');

            return;
        }

        if (!updateScheduled) {
            scheduleScopeUpdate(this._scopeInfo, (scope) => {
                scheduledScopeUpdates.forEach(callback => callback(scope));

                updateScheduled = false;
            });

            updateScheduled = true;
        }

        scheduledScopeUpdates.set(identifier, callback);
    }
};

const BindingApi = function(binding) {
    if (!binding) {
        return BindingApiPrototype;
    }

    if (currentScopeInfo) {
        if (instanceMap.has(binding)) {
            return instanceMap.get(binding);
        } else {
            const instance = { _binding: binding, _scopeInfo: currentScopeInfo, __proto__: BindingApiPrototype };

            instanceMap.set(binding, instance);
            return instance;
        }
    }

    console.error('No scope context present! Unable to return api instance!');
    return null;
};

export default BindingApi;

export const setScopeInfo = function(newScopeInfo) {
    currentScopeInfo = newScopeInfo;
};
