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
        return { view: Object.create(this) };
    },

    isActive: false,

    isRoutedPeristently: false,

    onRouteEnter() {
        this.isActive = true;
        this.scope.__apply__();
    },

    onRouteLeave() {
        this.isActive = false;
        this.scope.__apply__();
    }
};

export default ViewController;
