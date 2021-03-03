import BindingApi from '../BindingApi.js';
import { RenderEngine } from 'application-frame/rendering';

let ClassBinding = {

    name: 'bind-class',

    /**
     * @type {Object}
     */
    classes : null,

    /**
     * @type {Node}
     */
    parentNode: null,

    /**
     * The class binding adds and removes classes from an element depending
     * on the value of the associated expression.
     *
     * @constructs
     * @extends module:DataBinding.Binding
     * @return {undefined}
     */
    _make({ node, text }) {
        this.classes = BindingApi(this).parser.ObjectParser(text);
        this.parentNode = node;

        BindingApi(this).attachBinding(this);
    },

    /**
     * applies a class to the parent node, based on the binding values.
     *
     * @param  {module:DataBinding.ScopePrototype} scope the scope to operate on.
     * @param  {Object} classes class-expression-map
     * @param  {string} key     the class name to apply
     *
     * @return {void}
     */
    applyClass(scope, classes, key) {
        let expression = classes[key];
        let value = BindingApi(this).parser.parseExpression(expression, scope);

        key = (key[0] === '!') ? key.substr(1) : key;

        if (value) {
            this.parentNode.classList.add(key);
        } else {
            this.parentNode.classList.remove(key);
        }
    },

    update(scope){
        let classes = JSON.parse(JSON.stringify(this.classes));

        Object.keys(classes)
            .filter(key => key.indexOf('!') === 0)
            .forEach(this.applyClass.bind(this, scope, classes));

        let applyAssync = Object.keys(classes).filter(key => key.indexOf('!') !== 0);

        if (applyAssync.length > 0) {
            RenderEngine.scheduleRenderTask(() => {
                applyAssync.forEach(this.applyClass.bind(this, scope, classes));
            });
        }
    },

    __proto__: BindingApi().Binding,
};

BindingApi().registerBinding(ClassBinding);

export default ClassBinding;
