import { Make } from '../../af/util/make.js';
import { bindNode } from '../Bind.js';
import BindingApi from '../BindingApi';

const { parseExpression } = BindingApi().parser;


const TemplateRepeatBinding = {

    name: 'bind-repeat',

    /**
     * @type {WeakMap}
     */
    itemNodeList : null,

    /**
     * @type {WeakMap}
     */
    itemScopeList : null,

    /**
     * @type {Node}
     */
    template : null,

    /**
     * @type {Node}
     */
    marker : null,

    /**
     * @type {Array}
     */
    modelBackup : null,

    model: null,

    /**
     * @type {Boolean}
     */
    fast: false,

    /**
     * @constructs
     * @extends {Binding}
     * @return {void}
     */
    _make({ node: template, text, parameter }) {
        super._make();

        const marker = document.createComment(`repeat ${template.id} with ${text}`);

        if (template.nodeName !== 'TEMPLATE') {
            console.error('[Repeat Binding] binding can only be used with template elements!');
            return;
        }

        this.originalNodeValue = text;
        this.template = template;
        this.marker = marker;

        if (parameter === 'fast') {
            this.itemNodeList = [];
            this.itemScopeList = [];
            this.fast = true;
        } else {
            this.itemNodeList = new Map();
            this.itemScopeList = new Map();
        }

        this.modelBackup = [];

        console.log('replace template with marker');
        template.parentNode.replaceChild(marker, template);

        BindingApi(this).attachBinding(this);

        return this;
    },

    /**
     * renders one model item to the DOM
     *
     * @param  {ScopePrototype} scope      [description]
     * @param  {string} itemName   [description]
     * @param  {number} index      [description]
     * @return {void}            [description]
     */
    renderItemFast(scope, itemName, index) {
        let childScope = Make({
            $first : index === 0,
            $last : this.model.length-1 === index,
            $index : index,
            __parentScope__ : scope,
        }, scope).get();

        Object.defineProperty(childScope, itemName, {
            get:() => {
                return this.model[index];
            }
        });

        const node = document.importNode(this.template.content, true).firstElementChild;
        bindNode(node, childScope, true);

        this.itemNodeList[index] = node;
        this.itemScopeList[index] = childScope;

        return node;
    },

    /**
     * renders one model item to the DOM
     *
     * @param  {*} model      [description]
     * @param  {ScopePrototype} scope      [description]
     * @param  {string} itemName   [description]
     * @param  {DocumentFragment} fragment   [description]
     * @param  {Node} polyParent [description]
     * @param  {Object} item       [description]
     * @param  {number} index      [description]
     * @return {void}            [description]
     */
    renderItemStable(model, scope, itemName, fragment, item, index) {
        let node = null;

        if (this.itemNodeList.has(item)) {
            node = this.itemNodeList.get(item);
            let childScope = this.itemScopeList.get(item);

            childScope.$first = index === 0;
            childScope.$last = model.length -1 === index;
            childScope.$index = index;

            childScope.update();
        } else {
            let childScope = Make({
                $first : index === 0,
                $last : model.length-1 === index,
                $index : index,
                __parentScope__ : scope,
            }, scope).get();

            childScope[itemName] = item;

            node = document.importNode(this.template.content, true).firstElementChild;
            bindNode(node, childScope, true);

            this.itemNodeList.set(item, node);
            this.itemScopeList.set(item, childScope);
        }

        fragment.appendChild(node);
    },

    updateFast(scope) {
        const [itemName, link, expression] = this.originalNodeValue.split(' ');

        this.model = parseExpression(expression, scope);

        if (link !== 'in') {
            console.console.error('DataBinding: invalide expression', this.originalNodeValue);
            return;
        }

        if (!Array.isArray(this.model)) {
            console.warn('A repeat binding can only consume arrays!', this.model);
            this.model = [];
        }

        while (this.itemNodeList.length > this.model.length) {
            const node = this.itemNodeList.pop();
            const scope = this.itemScopeList.pop();

            node.parentNode.removeChild(node);
            scope.__destroy__();
        }

        this.itemScopeList.forEach(scope => scope.update());

        while (this.itemNodeList.length < this.model.length) {
            const marker = this.itemNodeList.length ? this.itemNodeList[this.itemNodeList.length-1] : this.marker;

            const node = this.renderItemFast(scope, itemName, this.itemNodeList.length);

            if (marker.nextElementSibling) {
                marker.parentNode.insertBefore(node, marker.nextElementSibling);
            } else {
                marker.parentNode.appendChild(node);
            }
        }
    },

    updateStable(scope) {
        let [itemName, link, expression] = this.originalNodeValue.split(' ');
        let model = parseExpression(expression, scope);
        let dirty = false;

        if (link !== 'in') {
            console.console.error('DataBinding: invalide expression', this.originalNodeValue);
            return;
        }

        if (!Array.isArray(model)) {
            console.warn('A repeat binding can only consume arrays!', model);
            model = [];
        }

        dirty = this.modelBackup.length !== model.length;

        if (!dirty) {
            for (let i = 0; i < model.length; i++) {
                if (model[i] !== this.modelBackup[i]) {
                    dirty = true;
                    break;
                }
            }
        }

        if (dirty) {
            // clean out items that where removed.
            this.modelBackup.forEach(item => {
                if (model.indexOf(item) < 0) {
                    const node = this.itemNodeList.get(item);

                    // if the node doesn't exist something went totally wrong... but it happens :/
                    if (node) {
                        this.marker.parentNode.removeChild(node);
                    }

                    this.itemScopeList.delete(item);
                    this.itemNodeList.delete(item);
                }
            });

            this.modelBackup = model.slice();

            if (window.Polymer) {
                window.Polymer.dom.flush();
            }

            /** @type {DocumentFragment} */
            const fragment = document.createDocumentFragment();

            model.forEach(this.renderItemStable.bind(this, model, scope, itemName, fragment));

            if (this.marker.nextElementSibling) {
                this.marker.parentNode.insertBefore(fragment, this.marker.nextElementSibling);
            } else {
                this.marker.parentNode.appendChild(fragment);
            }
        }
    },

    update(scope) {
        if (this.fast) {
            return this.updateFast(scope);
        } else {
            return this.updateStable(scope);
        }
    },

    destory() {
        let count = this.modelBackup.reduce((prev, item) => {
            let [scopes, bindings] = prev;
            let scope = this.itemScopeList.get(item);
            let [scopes_add, bindings_add] = scope.__destroy__(true);

            return [scopes + scopes_add, bindings + bindings_add];
        }, [0, 0]);

        this.itemScopeList = null;
        this.itemNodeList = null;

        return count;
    },

    __proto__: BindingApi().Binding,
};

BindingApi().registerBinding(TemplateRepeatBinding);

export default TemplateRepeatBinding;
