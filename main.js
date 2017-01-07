/**
 * DataBinding Module
 *
 * @module DataBinding
 * @default module:DataBinding.DataBinding
 */
import { makeTemplate } from './lib/Template.js';
import { polyInvoke } from './lib/Util.js';
import { bindNode } from './lib/Bind.js';
import ViewPort from './lib/ViewPort.js';
import './lib/IfBinding.js';
import './lib/ElementToScopeBinding.js';
import './lib/AttributeBinding.js';
import './lib/HtmlBinding.js';
import './lib/CloakBinding.js';

NodeList.prototype.forEach = NamedNodeMap.prototype.forEach = Array.prototype.forEach;

let style = document.createElement('style');

style.innerHTML = `
    [bind-display="false"] {
        display: none !important;
    }

    [bind-visible="false"] {
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
    bindNode : bindNode,
    ViewPort : ViewPort,
};

export default DataBinding;

/**
 * @interface ModuleInterface
 * @borrows module:DataBinding/Bind.bindNode as bindNode
 * @borrows module:DataBinding/Template.makeTemplate as makeTemplate
 * @borrows module:DataBinding/ViewPort.ViewPort
 * @static
 *
 */
