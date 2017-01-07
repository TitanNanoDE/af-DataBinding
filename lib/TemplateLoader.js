import { Make } from '../af/util/make.js';
import NetworkRequest from '../af/core/prototypes/NetworkRequest.js';
//import { polyInvoke } from './Util.js';


/*let FakeTemplate = {
    _markup : '',
    _fragment: null,

    _make : function(markup) {
        this._markup = markup;
    },

    get content() {
        if (!this._fragment) {
            this._fragment = new DocumentFragment();
            let container = document.createElement('div');

            polyInvoke(container).innerHTML = this._markup;

            [].forEach.apply(container.childNodes, [element => {
                polyInvoke(this._fragment).appendChild(element);
            }]);
        }
        return this._fragment;
    }
};*/

/**
 * imports a template node from an external HTML file.
 *
 * @function
 *
 * @param {string} source the url of the file that holds the template to import
 * @param {HTMLTemplateElement} template the template element to contain the import
 *
 * @return {HTMLTemplateElement} returns the provided template node, but now holding the imported nodes.
 */
export let importTemplate = function(source, template) {
    let request = Make(NetworkRequest)(source, {});

    return request.send().then(markup => {
        template.innerHTML = markup;

        return template;
    });
};
