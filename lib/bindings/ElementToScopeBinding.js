import BindingApi from '../BindingApi.js';

const ElementToScopeBinding = {

    /**
     * @type {string}
     */
    name: 'scope-id',

    /**
     * @type {Node}
     */
    parentNode: null,

    /**
     * @constructs
     * @extends {module:DataBinding.Binding}
     *
     * @param  {Node} parentNode   parent node of this binding
     * @param  {Object} scopeInfo  scope metadata object
     * @param  {string} text       original text value of the binding
     *
     * @return {void}
     */
    _make({ node, text }) {
        super._make.apply(this);

        this.parentNode = node;
        this.text = text;

        BindingApi(this).attachBinding(this);
    },

    update(scope) {
        /** @type {Node} */
        let currentValue = BindingApi(this).parser.parseExpression(this.text, scope);

        if (currentValue !== this.parentNode) {
            BindingApi(this).parser.assignExpression(this.text, scope, this.parentNode);
            scope.update();
        }
    },

    __proto__: BindingApi().Binding,
};

BindingApi().registerBinding(ElementToScopeBinding);

export default ElementToScopeBinding;
