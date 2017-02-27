import { parseExpression } from './Parser';
import { recycle, watcherList, destoryScope } from './Bind.js';

/**
 * @class ScopePrototype
 * @memberof module:DataBinding
 */

/**
 * @lends module:DataBinding.ScopePrototype.prototype
 */
let ScopePrototype = {

    _make: function() {
        this.__apply__ = this.__apply__.bind(this);
    },

    /**
    * will apply the current state of the bound model.
    *
    * @param {function} [fn]            function to execute before rendering
    * @param {boolean} [localRecycle]   only recycle the current scope
    *
    * @return {void}
    */
    __apply__ : function(fn, localRecycle){
        if (fn && typeof fn === 'function') {
            fn();
        }

        return recycle(localRecycle ? this : null);
    },

    /**
     * starts to watch the given expression and fires when the value changes.
     *
     * @param  {string}   expression the expression to watch
     * @param  {Function} cb         will be called once the value changes
     *
     * @return {void}
     */
    __watch__ : function(expression, cb) {
        if (!watcherList.has(this)) {
            watcherList.set(this, []);
        }

        watcherList.get(this).push({
            expression : expression,
            cb : cb
        });
    },

    /**
     * destorys a scope
     *
     * @param  {boolean} inProgress whenever this is an initial call or not
     *
     * @return {boolean} status
     */
    __destroy__ : function(inProgress) {
        return destoryScope(this, inProgress);
    },

    /**
    * resolves when the expression returns not undefined or null
    *
    * @param  {string|Function}   expression the expression to evaluate
    *
    * @return {Promise}                      resolves when stable
    */
    require: function(expression) {
        return new Promise((done) => {
            let value = null;

            if (typeof expression === 'function') {
                value = expression();
            } else {
                value = parseExpression(expression, this);
            }

            if (value !== undefined && value !== null) {
                done(value);
            }
        });
    }
};

export default ScopePrototype;
