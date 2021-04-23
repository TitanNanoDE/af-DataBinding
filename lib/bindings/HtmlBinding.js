import { sanitizeText, polyInvoke } from '../Util.js';
import BindingApi from '../BindingApi.js';


/**
 * @extends Binding
 *
 * @type {Object}
 */
const HtmlBinding = {

    name: 'bind-html',

    /**
     * @type {Element}
     */
    node: null,


    _make({ node, text }) {
        this.node = node;
        this.text = text;

        BindingApi(this).attachBinding(this);
    },

    update(scope) {
        let text = BindingApi(this).parser.parseExpression(this.text, scope, this.node);

        text = sanitizeText(text);

        if (this.node.innerHTML !== text) {
            polyInvoke(this.node).innerHTML = text;
        }
    },

    __proto__: BindingApi().Binding,
};

BindingApi().registerBinding(HtmlBinding);

export default HtmlBinding;
