import BindingApi from '../BindingApi.js';


const IfBinding = {

    /**
     * @type {string}
     */
    name: 'bind-if',

    /**
     * @type {Node}
     */
    node: null,

    /**
     * @type {Node}
     */
    comment: null,

    /**
     *
     * @constructs
     *
     * @param {Node} node this node
     * @param {string} text the attribute value
     *
     * @return {void}
     */
    _make: function({ node, text }) {
        this.node = node;
        this.text = text;
        this.comment = document.createComment(`   If: ${text}   `);

        BindingApi(this).attachBinding(this);
    },

    getParentNode() {
        if (this.comment.parentNode) {
            return this.comment.parentNode;
        }

        return this.node.parentNode;
    },

    update(scope) {
        const currentHost = this.getParentNode();

        if (currentHost.nodeType === 11 && !currentHost.host) {
            return scope.update();
        }

        const isTrue = BindingApi(this).parser.parseExpression(this.text, scope);
        const target = isTrue ? this.node : this.comment;
        const counterTarget = isTrue ? this.comment : this.node;

        if (currentHost.contains(target)) {
            return;
        }

        currentHost.replaceChild(target, counterTarget);
    },

    __proto__: BindingApi().Binding,
};

BindingApi().registerBinding(IfBinding);

export default IfBinding;
