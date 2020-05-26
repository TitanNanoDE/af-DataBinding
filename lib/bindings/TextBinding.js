import { hasPrototype } from 'application-frame/util/make';
import Binding from '../Binding';
import BindingApi from '../BindingApi';

const ATTRIBUTE_NODE = 2;

const TextBinding = {
    name: '#text',

    /**
     * @type {string[]}
     */
    properties : null,

    /**
     * @type {string}
     */
    originalNodeValue : '',

    /**
     * @type {Node}
     */
    node : null,

    /**
     * @type {Node}
     */
    parentNode : null,

    singleExpression: false,

    _make({ parentNode, attribute, text, variables, singleExpression }) {
        this.originalNodeValue = text;
        this.parentNode = parentNode;
        this.properties = (!singleExpression) ? variables.map(item => item.replace(/[{}]/g, '')) : [];
        this.singleExpression = singleExpression;

        if (parentNode.dataset && parentNode.dataset.textBinding) {
            const textNode = document.createTextNode('');

            parentNode.parentNode.replaceChild(textNode, parentNode);

            attribute = textNode;
            parentNode = textNode.parentNode;
        }

        if (hasPrototype(attribute, Attr)) {
            parentNode.setAttribute(attribute.name, '');
        } else {
            attribute.textContent = '';
        }

        this.node = attribute;

        BindingApi(this).attachBinding(this);
    },

    update(scope) {
        const { parseExpression } = BindingApi(this).parser;

        const normalizedText = this.originalNodeValue.toString().trim().split(/\s+/).join(' ');
        const localNode = { element: this.parentNode };
        const values = this.properties.map(key => {
            const item = { name : key, value : parseExpression(key, localNode, scope) };

            return item;
        });

        const text = this.singleExpression ?
            parseExpression(this.originalNodeValue, localNode, scope) :
            values.reduce((text, pair) => {
                return text.replace(`{{${pair.name}}}`, pair.value);
            }, normalizedText);

        if (!this.isOutdated(text)) {
            return;
        }

        this.updateNodeValue(text);
    },

    test({ variables }) {
        return !!variables && variables.length > 0;
    },

    get isAttribute() {
        return this.node.nodeType === ATTRIBUTE_NODE;
    },

    get currentNodeValue() {
        return this.isAttribute ? this.parentNode.getAttribute(this.node.name) : this.node.textContent;
    },

    isOutdated(newText) {
        return this.currentNodeValue !== newText;
    },

    updateNodeValue(value) {
        this.isAttribute ? this.parentNode.setAttribute(this.node.name, value) : (this.node.textContent = value);
    },

    __proto__: Binding,
};

BindingApi().registerBinding(TextBinding);

export default TextBinding;
