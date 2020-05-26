export const BindingDefinitions = {
    templateMap: new Map(),

    register(templateId, binding) {
        this.templateMap.set(templateId, binding);
    },

    get(templateId) {
        return this.templateMap.get(templateId);
    },
};

export default BindingDefinitions;
