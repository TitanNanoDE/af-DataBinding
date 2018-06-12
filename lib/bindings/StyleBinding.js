import BindingAPI from '../BindingApi';

/**
 * @param {StyleBinding} container - binding container
 * @param {ScopePrototype} scope - the scope for this binding
 * @return {void}
 */
let readStyleProperties = function(container, scope) {
    Object.keys(container.bindings).forEach(styleKey => {
        let style = window.getComputedStyle(container.parentNode);
        let dimensions = container.parentNode.getBoundingClientRect();

        if(styleKey.split('.')[0] === 'dimensions') {
            let value = dimensions[styleKey.split('.')[1]];

            BindingAPI(this).parser.assignExpression(container.bindings[styleKey], scope, value);
        } else {
            BindingAPI(this).parser.assignExpression(container.bindings[styleKey], scope, style[styleKey]);
        }
    });
};

const StyleBinding = {
    bindings: null,
    parentNode: null,

    name: 'bind-style',

    /**
     * @return {StyleBinding}
     */
    constructor({ text: bindings, node }) {
        this.parentNode = node;
        this.bindings = BindingAPI(this).parser.ObjectParser(bindings);

        BindingAPI(this).attachBinding(this);

        return this;
    },

    update(scope) {
        BindingAPI(this).scheduleScopeUpdate(readStyleProperties.bind(null, this, scope));
    },

    _make(...args) {
        return this.constructor(...args);
    },

    __proto__: BindingAPI().Binding,
};

BindingAPI().registerBinding(StyleBinding);

export default StyleBinding;
