import { Make } from '../af/util/make.js';
import { parseExpression } from './Parser.js';
import Binding from './Binding.js';
import BindingRegistry from './BindingRegistry.js';

let IfBinding = Make(/** @lends module:DataBinding.IfBinding# **/{

    /** @type {string} */
    name: 'bind-if',

    /**
     * @type {Node}
     */
    parentNode: null,

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
     * @extends {Binding}
     * @param {Node} parentNode - this node
     * @param {string} text - the attribute value
     * @param {ScopeInfo} scopeInfo - bindings container
     *
     * @return {void}
     */
    _make: function({ parentNode, text, scopeInfo }) {
        this.node = parentNode;
        this.text = text;
        this.comment = document.createComment(`   If: ${text}   `);

        scopeInfo.bindings.push(this);
    },

    update: function(scope) {
        if (this.comment.parentNode) {
            this.parentNode = this.comment.parentNode;
        }

        if (this.node.parentNode) {
            this.parentNode = this.node.parentNode;
        }

        if (this.parentNode.nodeType === 11) {
            return scope.update();
        }

        let isTrue = parseExpression(this.text, scope);

        if (isTrue) {
            if (!this.parentNode.contains(this.node)) {
                this.parentNode.replaceChild(this.node, this.comment);
            }
        } else {
            if (this.parentNode.contains(this.node)) {
                this.parentNode.replaceChild(this.comment, this.node);
            }
        }
    },

}, Binding).get();

BindingRegistry.register(IfBinding);

export default IfBinding;
