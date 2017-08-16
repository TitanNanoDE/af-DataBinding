import BindingApi from '../BindingApi';

const EventBinding = {

    name: 'bind-event',

    constructor({ node, text, parameter }) {
        super.constructor();

        this.node = node;
        this.text = text;
        this.parameter = parameter;

        BindingApi(this).scheduleScopeUpdate(this.registerEventHandler.bind(this));

        return this;
    },

    _make(...args) {
        this.constructor(...args);
    },

    registerEventHandler(scope) {
        const handler = BindingApi(this).parser.parseExpression(this.text, scope);

        this.node.addEventListener(this.parameter, (event) => {
            let preventRecycle = false;

            event.preventRecycle = () => preventRecycle = true;

            handler(event, scope);

            if (!preventRecycle) {
                scope.update();
            }
        });
    },

    update() {
        return true;
    },

    __proto__: BindingApi().Binding,
};

BindingApi().registerBinding(EventBinding);

export default EventBinding;
