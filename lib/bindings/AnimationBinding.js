import BindingRegistry from '../../af/modules/DataBinding/BindingRegistry';
import Binding from '../../af/modules/DataBinding/Binding';
import { ObjectParser, parseExpression } from '../../af/modules/DataBinding/Parser';
import EventTarget from '../EventTarget';
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

            if (animation && !this.playing[conditionExpression]) {
                let parent = animationExpression.split('.');

                parent.pop();
                parent = parent.join('.');
                parent = parseExpression(parent, scope);

                if (!parent) {
                    parent = scope;
                }

                this.playing[conditionExpression] = true;

                let result = animation.apply(parent, [this.parentNode]);

                scope.$animation = scope.$animation || Object.create(EventTarget).constructor();

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
