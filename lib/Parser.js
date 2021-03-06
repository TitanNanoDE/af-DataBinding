/**
 * @module DataBinding/Parser
 */

/**
 * Parses an object expression
 *
 * @param {string} source - the string to parse.
 * @return {Object} the parsed result.
 */
export let ObjectParser = function(source){
    let target = null;
    let key = false;
    let keyBuffer = '';
    let valueBuffer = '';
    let run = true;

    source.split('').forEach((char) => {
        if (run) {
            if (char === '{') {
                target = {};
                key = true;
            } else if(char === ':') {
                key = false;
            } else if(char === ',') {
                target[keyBuffer.trim()] = valueBuffer.trim();
                keyBuffer = valueBuffer = '';
                key = true;
            } else if(char === '}') {
                target[keyBuffer.trim()] = valueBuffer.trim();
                run = false;
            } else if(key) {
                keyBuffer += char;
            } else if(!key) {
                valueBuffer += char;
            }
        }
    });

    return target;
};

/**
 * Parses a given expression in the context of the given scope.
 *
 * @param {string} expression - the expression to parse.
 * @param {ScopePrototype} scope - the scope on which the expression should be parsed.
 * @return {*} the result value.
 */
export let parseExpression = function(expression, ...contexts) {
    expression = expression.trim();
    let chain = expression.match(/[\w$]+(?:\([^)]*\))*/g) || [];
    let scope = null;
    let functionTest = /\(([^)]*)\)/;

    if (!isNaN(expression)) {
        return parseFloat(expression);
    }

    if (chain.length === 0) {
        return undefined;
    }

    for (let i = 0; i < contexts.length; i++) {
        scope = contexts[i];

        chain.forEach((item) => {
            if (!scope) {
                return;
            }

            const pos = item.search(functionTest);
            const propertyName = item.substring(0, (pos > 0 ? pos : item.length));
            const value = scope[propertyName];
            const isFunction = typeof value === 'function';

            scope = isFunction ? value.bind(scope) : value;

            if (pos > 0 && isFunction) {
                const args = item.match(functionTest)[1]
                    .split(',')
                    .map(arg => parseExpression(arg.trim(), ...contexts));

                scope = scope(...args);
            }
        });

        if (scope !== null && scope !== undefined) {
            break;
        }
    }

    return (scope !== null && typeof scope !== 'undefined') ? scope : '';
};

export const parseAttributeName = function(attributeName) {
    const regExp = /^([a-zA-Z0-9-]+)(?:$|\((.*)\)$)/;
    const result = attributeName.match(regExp) || [];

    result.shift();

    return result;
};

/**
 * Assings an value to an expression in an given scope
 *
 * @param {string} expression the expression on whith the value should be assigned
 * @param {ScopePrototype} scope the scope to operate on
 * @param {string} value the value to assign
 *
 * @return {void}
 */
export let assignExpression = function(expression, context, value){
    expression = expression.trim();
    let chain = expression.match(/[\w$]+(?:\([^)]*\))*/g) || [];
    let scope = context;
    let functionTest = /\(([^)]*)\)/;

    chain.forEach((item, index) => {
        if (chain.length -1 !== index) {
            let pos = item.search(functionTest);

            if (pos > 0) {
                let args = item.match(functionTest)[1].split(',').map(item => item.trim());
                let scopeChild = scope[item.substring(0, pos)];

                if (scopeChild) {
                    args = args.map(arg => parseExpression(arg, context));
                    scope = scopeChild.apply(scope, args);
                } else {
                    scope = null;
                }
            } else {
                scope = scope[item];
            }
        } else {
            scope[item] = value;
        }
    });
};
