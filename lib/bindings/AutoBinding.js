import async from '../../af/core/async';
import BindingApi from '../BindingApi';

const AutoBinding = {

    name: 'bind',

    /** @type {boolean} */
    _isBound : false,

    scopeName: '',

    /**
     * [template description]
     * @type {HTMLTemplateElement}
     */
    template: null,

    /**
     * An auto binding instanciates a template and binds it
     * to a property of the current scope.
     *
     * @constructs
     * @extends module:DataBinding.Binding
     * @return {void}
     */
    _make({ text, node }) {
        if (node.localName !== 'template') {
            console.error('auto bindings can only be used on template elements!');
            return;
        }

        this.scopeName = text;
        this.template = node;

        BindingApi(this).attachBinding(this);
    },

    /** @type module:DataBinding.ScopePrototype */
    _scope : null,

    update(scope) {
        if (!this._isBound) {
            let subScope = BindingApi(this).parser.parseExpression(this.scopeName, scope);

            async(() => {
                const result = BindingApi(this).template.createTemplateInstance({
                    template: this.template,
                    scope: subScope,
                });

                this._scope = result.scope;
                BindingApi(this).parser.assignExpression(this.scopeName, scope, result.scope);
            });

            this._isBound = true;
        }
    },

    /**
     * destroys this binding. This binding needs to be destroied before
     * it is deleted, since it creates a new scope.
     *
     * @return {void}
     */
    destory() {
        if (this._scope) {
            return this._scope.__destroy__(true);
        } else {
            return [0, 0];
        }
    },

    __proto__: BindingApi().Binding,

};

BindingApi().registerBinding(AutoBinding);

export default AutoBinding;
