import { scheduleScopeUpdate } from './Bind';
import Binding from './Binding';
import * as template from './Template';
import BindingRegistry from './BindingRegistry';
import * as Parser from './Parser';
import console from './Console';

let currentScopeInfo = null;
let currentScope = null;

const instanceMap = new WeakMap();

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

    template,

    Binding,

    scheduleScopeUpdate(callback) {

        const { _binding: identifier } = this;

        if (!this._scopeInfo) {
            console.error('[DataBinding API]', '"scheduleScopeUpdate" has to be called on an api instance! No scope context present!');
            return;
        }

        if (!identifier || typeof identifier.update !== 'function' || typeof identifier.test !== 'function') {
            console.log('[DataBinding API]',
                'unable to schedule scope update! identifier does not match the Binidng trait!');

            return;
        }

        if (!this.updateScheduled) {
            scheduleScopeUpdate(this._scope, (scope) => {
                this.scheduledScopeUpdates.forEach(callback => callback(scope));
                this.scheduledScopeUpdates.length = 0;
                this.updateScheduled = false;
            });

            this.updateScheduled = true;
        }

        this.scheduledScopeUpdates.set(identifier, callback);
    }
};

/**
 * [description]
 *
 * @param  {Binding} binding     [description]
 * @return {BindingApiPrototype} [description]
 */
const BindingApi = function(binding) {
    if (!binding) {
        return BindingApiPrototype;
    }

    if (instanceMap.has(binding)) {
        return instanceMap.get(binding);
    } else if (currentScopeInfo) {
        const instance = {
            _binding: binding,
            _scopeInfo: currentScopeInfo,
            _scope: currentScope,
            scheduledScopeUpdates: new Map(),
            updateScheduled: false,

            __proto__: BindingApiPrototype,
        };

        instanceMap.set(binding, instance);
        return instance;
    }

    console.error('No scope context present! Unable to return api instance!');
    return null;
};

export default BindingApi;

export const setScopeInfo = function(newScopeInfo, newScope) {
    currentScopeInfo = newScopeInfo;
    currentScope = newScope;
};
