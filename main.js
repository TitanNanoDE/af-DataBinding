/**
 * DataBinding Module
 *
 * @module DataBinding
 * @default module:DataBinding.DataBinding
 */
import { makeTemplate, createTemplateInstance } from './lib/Template.js';
import { polyInvoke } from './lib/Util.js';
import ViewPort from './lib/ViewPort.js';
import './lib/IfBinding.js';
import './lib/ElementToScopeBinding.js';
import './lib/AttributeBinding.js';
import './lib/HtmlBinding.js';
import './lib/CloakBinding.js';
import './lib/bindings/AnimationBinding';

NodeList.prototype.forEach = NamedNodeMap.prototype.forEach = Array.prototype.forEach;

let style = document.createElement('style');

style.innerHTML = `
    [bind-display="false"]:not(.animated) {
        display: none !important;
    }

    [bind-visible="false"]:not(.animated) {
        visibility: hidden;
    }
`;

polyInvoke(document.head).appendChild(style);

/**
 * [DataBinding description]
 *
 * @type {module:DataBinding.ModuleInterface}
 */
export let DataBinding = {
    makeTemplate : makeTemplate,
    ViewPort : ViewPort,
    createTemplateInstance: createTemplateInstance,
};

export { ANIMATION_BINDING_LOOPED } from './lib/bindings/AnimationBinding';


export default DataBinding;

/**
 * @interface ModuleInterface
 * @borrows module:DataBinding/Bind.bindNode as bindNode
 * @borrows module:DataBinding/Template.makeTemplate as makeTemplate
 * @borrows module:DataBinding/ViewPort.ViewPort
 * @static
 *
 */
