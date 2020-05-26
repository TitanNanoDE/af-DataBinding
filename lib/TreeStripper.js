import JsdomModule from 'jsdom';
import { checkNode } from './Bind.js';
import BindingRegistry from './BindingRegistry.js';
import getGlobalThis from 'globalThis/polyfill';
import Attr from 'jsdom/lib/jsdom/living/generated/Attr';
import NamedNodeMap from 'jsdom/lib/jsdom/living/generated/NamedNodeMap';
import NodeList from 'jsdom/lib/jsdom/living/generated/NodeList';
import Element from 'jsdom/lib/jsdom/living/generated/Element';
import * as Config from './Config';

import './bindings/AnimationBinding';
import './bindings/AttributeBinding';
import './bindings/AutoBinding';
import './bindings/EventBinding';
import './bindings/StyleBinding';
import './bindings/TemplateRepeatBinding';
import './bindings/TextBinding';

const { JSDOM } = JsdomModule;
const globalThis = getGlobalThis();

const generateBindingTargetId = function() {
    return `afdb-bindID-${Math.round(Date.now() * Math.random())}`;
};

const strip = (texts, ...values) => {
    texts = Array.from(texts);

    let content = texts.shift();

    texts.forEach(part => {
        content += values.shift();
        content += part;
    });

    return content.replace(/\n +/g, '\n');
};

export const TreeStripper = {

    get strippedBindings() {
        return this.strippedBindingsStack[this.strippedBindingsStack.length - 1];
    },

    strippedBindingsStack: [],
    strippedBindingsMap: new Map(),

    stripFile(templateFile) {
        const fragment = JSDOM.fragment(templateFile);

        const templates = Array.from(fragment.children)
            .map(element => {
                if (element.localName !== 'template') {
                    return;
                }

                this.stripTemplate(element);

                const result = [this.strippedBindingsMap, element];

                return result;
            });

        const { scriptParts, templateParts } = templates.map(([bindings, template]) => {
            const bindingsString = Array.from(bindings)
                .map(([template, bindings]) => {
                    return `DataBinding.registerBindings('${template.toJSON().substr(1)}', ${JSON.stringify(bindings)});`;
                }).join('\n\n');

            return [bindingsString, template.outerHTML];
        }).reduce((lists, [script, template]) => {
            lists.scriptParts.push(script);
            lists.templateParts.push(template);

            return lists;
        }, { scriptParts: [], templateParts: [] });

        const script = strip`
                    import DataBinding from '@af-modules/databinding';
                    import templates from './template';

                    ${scriptParts.join('\n\n')}

                    export { templates, templates as default };
                `;

        const html = templateParts.join('\n\n');

        return { bindings: script, template: html };
    },

    stripTemplate(templateNode) {
        this.strippedBindingsStack.push([]);

        checkNode(templateNode.content, {});

        const bindings = this.strippedBindingsStack.pop();

        this.strippedBindingsMap.set(templateNode, bindings);
    },

    init() {
        const stripper = this;

        globalThis.Attr = Attr.interface;
        globalThis.window = globalThis;

        NodeList.interface.prototype.forEach = NamedNodeMap.interface.prototype.forEach = Array.prototype.forEach;
        Element.interface.prototype.toJSON = function() {
            if (!this.hasAttribute('id')) {
                this.setAttribute('id', generateBindingTargetId());
            }

            return `#${this.getAttribute('id')}`;
        };

        Config.enableLogging();

        const ProxyBinding = {
            _make({ node, text, parameter, attribute, variables }) {
                if (attribute.nodeName === '#text' && (!variables || variables.length === 0)) {
                    return;
                }

                if (attribute.nodeName === '#text') {
                    const placeholderNode = attribute.ownerDocument.createElement('span');

                    placeholderNode.dataset.textBinding = true;

                    node.replaceChild(placeholderNode, attribute);

                    const bindingData = {
                        selector: placeholderNode,
                        name: this.name,
                        parameter,
                        value: text
                    };

                    stripper.strippedBindings.push(bindingData);

                    return;
                }

                const bindingData = {
                    selector: node,
                    name: this.name,
                    parameter,
                    value: text
                };

                stripper.strippedBindings.push(bindingData);

                if (this.name === 'bind-repeat') {
                    stripper.stripTemplate(node);
                }

                node.removeAttribute(`${this.name}(${parameter})`);
            }
        };

        for (let [name, binding] of BindingRegistry.getAll()) {
            const proxied = Object.assign({ __proto__: binding, name }, ProxyBinding);

            BindingRegistry.override(proxied);
        }
    },
};

export default TreeStripper;
