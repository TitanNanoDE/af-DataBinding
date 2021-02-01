import BindingApi from '../BindingApi';

const AttributeBinding = {

    name: 'bind-attr',

    config: null,

    currentValue: null,

    constructor({ node: parentNode, text, parameter }) {
        super._make(this);

        this.parentNode = parentNode;

        if (parameter && parameter != '') {
            const [expression, eventName] = text.split('=');

            this.config = {
                isNewBinding: true,
                expression: expression.trim(),
                eventName: (eventName && eventName.trim()) || '',
                attributeName: parameter,
            };

            if (eventName && eventName !== '') {
                parentNode.addEventListener(eventName, this.onViewUpdate.bind(this));
            }
        } else {
            this.config = BindingApi(this).parser.ObjectParser(text);
        }

        BindingApi(this).attachBinding(this);

        return this;
    },

    _make(...args) {
        return this.constructor(...args);
    },

    update(scope) {
        if (this.config.isNewBinding) {
            return this.updateNew(scope);
        } else {
            return this.updateOld(scope);
        }
    },

    updateOld(scope) {
        const { parser } = BindingApi(this);
        const { parseExpression } = parser;
        const attrName = this.config.name;
        const attrValue = this.config.value ? parseExpression(this.config.value, scope) : '';
        const attrEnabled = this.config.enabled ? parseExpression(this.config.enabled, scope) : true;


        if (attrEnabled) {
            this.parentNode.setAttribute(attrName, attrValue);
        } else {
            this.parentNode.removeAttribute(attrName);
        }
    },

    updateNew(scope) {
        const { parseExpression } = BindingApi(this).parser;
        const value = parseExpression(this.config.expression, scope);

        // check if our current scope value is different from the last value.
        // Then check if the view value doesn't have unassigned changes.
        // Only apply the scope value to the view if both rules apply.
        if (value !== this.currentValue) {
            this.setValue(value);

            if (this.findValue() === value) {
                this.currentValue = value;
            }

            if (document.activeElement === this.parentNode) {
                if (this.parentNode.setSelectionRange) {
                    this.parentNode.focus();

                    if (!this.parentNode.selectionStart) {
                        return;
                    }

                    const size = this.parentNode.value.length;

                    this.parentNode.setSelectionRange(size, size);

                    return;
                }

                const range = document.createRange();
                const selection = window.getSelection();

                range.selectNodeContents(this.parentNode);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
    },

    findValue() {
        if (this.config.attributeName in this.parentNode) {
            return this.parentNode[this.config.attributeName];
        } else {
            return this.parentNode.getAttribute(this.config.attributeName);
        }
    },

    setValue(value) {
        this.currentValue = value;

        if (this.config.attributeName in this.parentNode) {
            this.parentNode[this.config.attributeName] = value;
        } else {
            if (typeof value === 'boolean') {
                if (value) {
                    this.parentNode.setAttribute(this.config.attributeName, '');
                } else {
                    this.parentNode.removeAttribute(this.config.attributeName);
                }

                return;
            }

            this.parentNode.setAttribute(this.config.attributeName, value);
        }
    },

    onViewUpdate() {
        const value = this.findValue();

        if (this.currentValue !== value) {
            BindingApi(this).scheduleScopeUpdate((scope) => {
                BindingApi(this).parser.assignExpression(this.config.expression, scope, value);
                this.currentValue = value;
            });
        }
    },

    __proto__: BindingApi().Binding,
};

BindingApi().registerBinding(AttributeBinding);

export default AttributeBinding;
