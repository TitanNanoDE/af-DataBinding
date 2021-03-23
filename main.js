/**
 * DataBinding Module
 *
 * @module DataBinding
 * @default module:DataBinding.DataBinding
 */
import { makeTemplate, createTemplateInstance } from './lib/Template.js';
import { attachBindings } from './lib/Bind';
import { polyInvoke } from './lib/Util.js';
import ViewPort from './lib/ViewPort.js';
import * as Config from './lib/Config';
import './lib/bindings/IfBinding.js';
import './lib/ElementToScopeBinding.js';
import './lib/HtmlBinding.js';
import './lib/CloakBinding.js';
import './lib/bindings/AttributeBinding';
import './lib/bindings/AnimationBinding';
import './lib/bindings/TemplateRepeatBinding';
import './lib/bindings/EventBinding';
import './lib/bindings/StyleBinding';
import './lib/bindings/AutoBinding';
import './lib/bindings/ClassBinding';
import './lib/bindings/EnabledBinding';
import './lib/bindings/TwoWayBinding.js';


NodeList.prototype.forEach = NamedNodeMap.prototype.forEach = Array.prototype.forEach;

let style = document.createElement('style');

style.innerHTML = `
    :not(.animated) > :not(.animated) > :not(.animated) > [bind-display="false"]:not(.animated) {
        display: none !important;
    }

    :not(.animated) > :not(.animated) > :not(.animated) > [bind-visible="false"]:not(.animated) {
        visibility: hidden;
    }
`;

polyInvoke(document.head).appendChild(style);

export const DataBindingMeta = {
    enableLogging: Config.enableLogging,
    enableVerboseLogging: Config.enableVerboseLogging,

    get object() { return DataBinding; }
};

/**
 * [DataBinding description]
 *
 * @type {module:DataBinding.ModuleInterface}
 */
// [meta*]
export let DataBinding = {
    makeTemplate : makeTemplate,
    ViewPort : ViewPort,
    createTemplateInstance: createTemplateInstance,
    attachBindings,
};

export { ANIMATION_BINDING_LOOPED } from './lib/bindings/AnimationBinding';
export { default as BindingApi } from './lib/BindingApi';

export default DataBinding;

/**
 * @interface ModuleInterface
 * @borrows module:DataBinding/Bind.bindNode as bindNode
 * @borrows module:DataBinding/Template.makeTemplate as makeTemplate
 * @borrows module:DataBinding/ViewPort.ViewPort
 * @static
 *
 */
