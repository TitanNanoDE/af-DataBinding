import { attributeNames } from '../Mapping.js';
import { polyInvoke } from '../Util.js';
import BindingApi from '../BindingApi.js';
import console from '../Console.js';

/**
 * Compares for changes in the UI in a two way binding
 *
 * @param {string} newValue - the new value to compare
 * @param {ScopePrototype} scope - the scope of the comparison
 * @param {TwoWayBinding} binding - the binding to compare
 *
 * @return {undefined}
 */
const compareTwoWay = function(newValue, scope, binding) {
    if (binding.currentValue !== newValue) {
        BindingApi(binding).parser.assignExpression(binding.properties[0], scope, newValue);
        binding.currentValue = newValue;

        console.log('update from view:', scope);

        scope.__apply__();
    }
};

/**
 * Returns the value of an DOM Node
 *
 * @param {Node} node the node to fetch the value from
 *
 * @return {string} value of this node
 */
const getElementValue = function(node){
    if (node.localName === 'input') {
        return node.value;
    } else {
        return 'UNKNOWN NODE!';
    }
};

export const TwoWayBinding = {

    name: 'bind-model',

    /**
     * the last known view value
     *
     * @type {string}
     */
    currentValue : '',

    /**
     * @type {Node}
     */
    parentNode : null,

    /**
     * @type {boolean}
     */
    indirect : false,

    /**
     * @type {string}
     */
    viewBinding : '',

    _make({ text, attribute: node, parentNode, indirect }){
        const expression = text.replace(/[{}]/g, '');
        const [eventType, viewBinding, eventBinding, preventDefault] =
            (parentNode.getAttribute(attributeNames.get('modelEvent')) || '').split(':');

        this.properties = [expression];
        this.originalNodeValue = text;
        this.node = node;
        this.parentNode = parentNode,
        this.indirect = indirect;
        this.viewBinding = viewBinding;

        if (node.name === attributeNames.get('model')) {
            const getValue = (event) => BindingApi(this).parser.parseExpression(eventBinding, event);

            BindingApi(this).scheduleScopeUpdate(
                this.registerEventHandler(this, eventType, preventDefault === 'true', 300, getValue)
            );
        } else if(node.name === attributeNames.get('value')) {
            const getValue = (event) => getElementValue(event.target);

            BindingApi(this).scheduleScopeUpdate(
                this.registerEventHandler(this, 'keyup', true, 200, getValue)
            );
        }

        BindingApi(this).attachBinding(this);
    },

    registerEventHandler(binding, eventType, preventDefault, timeout, getValue) {
        return (scope) => {
            let debounce = null;

            this.parentNode.addEventListener(eventType, event => {

                if (preventDefault) {
                    event.preventDefault();
                }

                if (debounce) {
                    clearTimeout(debounce);
                }

                debounce = setTimeout(() => {
                    compareTwoWay(getValue(event), scope, binding);
                }, timeout);
            });
        };
    },

    update : function(scope) {
        const { parseExpression, assignExpression } = BindingApi().parser;

        // the current value on the scope
        const value = parseExpression(this.properties[0], scope);

        if (!this.indirect) {
            let attribute = attributeNames.rename(this.node.name);

            polyInvoke(this.parentNode).setAttribute(attribute, value);
        } else {
            // the current view value
            //let viewValue = parseExpression(this.viewBinding, this.parentNode);

            // check if our current scope value is different from the last value.
            // Then check if the view value doesn't have unassigned changes.
            // Only apply the scope value to the view if both rules apply.
            if (value !== this.currentValue) {
                assignExpression(this.viewBinding, this.parentNode, value);

                if (parseExpression(this.viewBinding, this.parentNode) === value) {
                    this.currentValue = value;
                }

                if (document.activeElement === this.parentNode) {
                    let range = document.createRange();
                    let selection = window.getSelection();

                    range.selectNodeContents(this.parentNode);
                    range.collapse(false);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            }
        }
    },

    __proto__: BindingApi().Binding,
};

BindingApi().registerBinding(TwoWayBinding);

export const ValueBinding = {
    name: 'bind-value',

    __proto__: TwoWayBinding,
};

BindingApi().registerBinding(ValueBinding);

export default TwoWayBinding;
