import DataBinding from '../main';

const ViewController = {
    template: '',

    scope: null,

    _getNewScope() {
        return { view: this };
    },

    constructor() {
        let template = this.template;

        if (typeof template === 'string' && template.indexOf('#') !== 0) {
            template = `#${template}`;
        }

        this.scope = DataBinding.makeTemplate(template, this._getNewScope()).scope;
    },

    useInAutoBinding() {
        return { view: Object.create(this) };
    },

    isActive: false,

    isRoutedPeristently: false,

    onRouteEnter() {
        this.isActive = true;
    },

    onRouteLeave() {
        this.isActive = false;
    }
};

export default ViewController;
