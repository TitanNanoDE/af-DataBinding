import templates from './template.bindings';
import DataBinding from '@af-modules/databinding';

const fragment = document.createElement('template');

fragment.innerHTML = templates;

const [template] = Array.from(document.importNode(fragment.content, true).children);

const { node } = DataBinding.createTemplateInstance({ template, scope: {
    currentGoal: {
        title: 'test Title',
    },

    previousSteps: [{
        title: 'step 1',
        noteData: 'step note text'
    }]
} });

document.body.appendChild(node);
