import { polyInvoke } from '../Util.js';
import BindingApi from '../BindingApi.js';


/**
 * [CloakBinding description]
 *
 * @lends module:DataBinding.CloakBinding#
 * @extends module:DataBinding.Binding
 *
 * @type {Object}
 */
const CloakBinding = {

    name: 'bind-cloak',

    _make({ parentNode }) {
        this.parentNode = parentNode;

        BindingApi(this).attachBinding(this);
    },

    update() {
        polyInvoke(this.parentNode).removeAttribute(this.name);
        BindingApi(this).detachBinding(this);
    },

    __proto__: BindingApi().Binding,
};

let style = document.createElement('style');

style.id = 'cloak-binding';

style.innerHTML = `
    [bind-cloak] {
        visibility: hidden;
    }
`;

document.head.appendChild(style);

BindingApi(CloakBinding).registerBinding(CloakBinding);

export default CloakBinding;
