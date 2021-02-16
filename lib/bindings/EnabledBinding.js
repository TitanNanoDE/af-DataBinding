import { polyInvoke } from '../Util.js';
import BindingApi from '../BindingApi.js';

let EnabledBinding = {

    name: 'bind-enabled',

    /**
     * @type {string}
     */
    originalNodeValue: null,

    /**
     * @type {Node}
     */
    parentNode: null,

    /**
     * @constructs
     * @extends {module:DataBinding.Binding}
     */
    _make({ node, text }) {
        this.parentNode = node;
        this.originalNodeValue = text;

        BindingApi(this).attachBinding(this);
    },

    /**
     * @param {module:DataBinding.ScopePrototype} scope the scope to work on
     * @return {void}
     */
    update(scope) {
        let value = BindingApi(this).parser.parseExpression(this.originalNodeValue, scope);

        if (!value) {
            polyInvoke(this.parentNode).setAttribute('disabled', '');
        } else {
            polyInvoke(this.parentNode).removeAttribute('disabled');
        }
    },

    __proto__: BindingApi().Binding,
};

BindingApi().registerBinding(EnabledBinding);

export default EnabledBinding;
