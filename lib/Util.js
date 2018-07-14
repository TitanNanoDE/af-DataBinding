/**
 * selects a dom node by the given query.
 *
 * @function
 * @deprecated don't use this anymore, polyMask is deprecated.
 *
 * @param {string} query the query selector to search for on the DOM
 * @param {Node} [context] the node to start the searching on
 *
 * @return {Node} the first node that matches the selector
 */
export let selectElement = function(query, context){
    let node = null;

    if (context) {
        node = context.querySelector(query);
    } else {
        node = document.querySelector(query);
    }

    return node;
};

/**
 * @function
 * @deprecated don't use anymore. Use {@link document.querySelectorAll}
 *
 * @param {string} query the query to look for
 * @param {Node} context the node to start the searching on
 *
 * @return {NodeList} the node list with all matching nodes
 */
export let selectAllElements = function(query, context) {
    let nodeList = null;

    if (context) {
        nodeList = context.querySelectorAll(query);
    } else {
        nodeList = document.querySelectorAll(query);
    }

    return nodeList;
};

/**
 * Tries to call Polymers dom() function if available, to keep them in the loop.
 *
 * @param {Node} node the node we want to take care of.
 * @return {Node} the dom node, maybe wrapped.
 */
export let polyInvoke = function(node) {

    if (window.Polymer) {
        node = window.Polymer.dom(node);
    }

    return node;
};

/**
 * attempts to find a parent node with a particular node name
 *
 * @function
 *
 * @param {Node} node the base node
 * @param {string} parentName the node name to search for
 *
 * @return {Node} the node we where searching for
 */
export let getPolyParent = function(node, parentName){
    while (node && node.localName !== parentName) {
        node = node.parentNode;
    }

    return node;
};

export let sanitizeText = function(rawText) {
    let text = rawText.replace(/&nbsp;/g, '\u00a0').replace(/<br>/, '\n');

    // html escape
    text = document.createTextNode(text).textContent;

    //fix legal HTML
    text = text.replace(/\n/g, '<br>').replace(/ {2}/g, ' &nbsp;');

    return text;
};

/**
 * checks if a node is currenty visible on the viewport
 *
 * @param  {Node} node - the node to check
 * @return {boolean} - the visibility status of the node
 */
export let nodeIsVisible = function(node) {
    return node.offsetHeight === 0 && node.offsetWidth === 0;
};
