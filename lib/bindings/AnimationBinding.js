import BindingRegistry from '../BindingRegistry';
import Binding from '../Binding';
import { ObjectParser, parseExpression } from '../Parser';
import EventTarget from '../../af/core/EventTarget';
import { hasPrototype } from '../../af/util/make';

export const ANIMATION_BINDING_LOOPED = Symbol('ANIMATION_BINDING_LOOPED');

/**
 * [AnimationBinding description]
 *
 * @lends {AnimationBinding#}
 * @extends {module:DataBinding.Binding}
 */
const AnimationBinding = {

    name: 'bind-animation',

    /**
     * [animations description]
     *
     * @type {Object}
     */
    animations: null,

    /**
     * @type {node}
     */
    parentNode: null,

    playing: null,

    lastConditionStatus: null,

    /**
     *
     * @constructs
     * @extends {Binding}
     * @param {Node} parentNode - this node
     * @param {string} text - the attribute value
     * @param {ScopeInfo} scopeInfo - bindings container
     *
     * @return {void}
     */
    _make({ parentNode, text, scopeInfo }) {
        this.animations = ObjectParser(text);
        this.parentNode = parentNode;
        this.playing = {};
        this.lastConditionStatus = {};

        scopeInfo.bindings.push(this);
    },

    /**
     * @param {module:DataBinding.ScopePrototype} scope
     */
    update(scope) {
        Object.keys(this.animations).forEach(conditionExpression => {
            const conditionValue = parseExpression(conditionExpression, scope);
            const conditionValueChanged = conditionValue !== this.lastConditionStatus[conditionExpression];

            this.lastConditionStatus[conditionExpression] = conditionValue;

            if (!conditionValueChanged && conditionValue !== ANIMATION_BINDING_LOOPED) {
                return;
            }

            const animationExpression = this.animations[conditionExpression];
            const animation = parseExpression(animationExpression, scope);

            if (conditionValue && animation && !this.playing[conditionExpression]) {
                let parent = animationExpression.split('.');

                parent.pop();
                parent = parent.join('.');
                parent = parseExpression(parent, scope);

                if (!parent) {
                    parent = scope;
                }

                this.playing[conditionExpression] = true;

                let result = animation.apply(parent, [this.parentNode]);

                if (!scope.$animation) { 
                    let a = Object.create(EventTarget);

                    a._make();
                    scope.$animation = a;
                }

                if (hasPrototype(result, Promise)) {
                    result.then(() => {
                        this.playing[conditionExpression] = false;
                        scope.$animation.emit(animation.name, null);
                    });
                } else {
                    this.playing[conditionExpression] = false;
                    scope.$animation.emit(animation.name, null);
                }
            }
        });
    },

    __proto__: Binding,
};

BindingRegistry.register(AnimationBinding);
