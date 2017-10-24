import DataBinding from '../main';

const ViewController = {
    template: '',

    scope: null,

    constructor() {
        let template = this.template;

        if (typeof template === 'string' && template.indexOf('#') !== 0) {
            template = `#${template}`;
        }

        this.scope = DataBinding.createTemplateInstance({ template, scope: this }).scope;
    },

    useInAutoBinding() {
        return Object.create(this);
    },

    isActive: false,

    isRoutedPeristently: false,

    onRouteEnter() {
        this.isActive = true;
        this.scope.update();
    },

    onRouteLeave() {
        this.isActive = false;
        this.scope.update();
    }
};

export default ViewController;
