import { Make } from '../af/util/make.js';
import Binding from './Binding.js';
import { parseExpression } from './Parser.js';
import { bindNode } from './Bind.js';

let TemplateRepeatBinding = {

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

    /**
     * @constructs
     * @extends {Binding}
     * @return {void}
     */
    _make({ node: template, text, scopeInfo }) {
        Binding._make.apply(this);

        const marker = document.createComment(`repeat ${template.id} with ${text}`);

        this.originalNodeValue = text;
        this.template = template;
        this.marker = marker;

        this.itemNodeList = new Map();
        this.itemScopeList = new Map();
        this.modelBackup = [];

        console.log('replace template with marker');
        template.parentNode.replaceChild(marker, template);

        scopeInfo.bindings.push(this);
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
    renderItem(model, scope, itemName, fragment, item, index) {
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

    update(scope) {
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

            model.forEach(this.renderItem.bind(this, model, scope, itemName, fragment));

            if (this.marker.nextElementSibling) {
                this.marker.parentNode.insertBefore(fragment, this.marker.nextElementSibling);
            } else {
                this.marker.parentNode.appendChild(fragment);
            }
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

    __proto__: Binding,
};

BindingRegistry.register(TemplateRepeatBinding);

export default TemplateRepeatBinding;
