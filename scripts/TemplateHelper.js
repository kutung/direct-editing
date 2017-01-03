define(['scripts/Helper', 'dot'], function TemplateHelperLoader(Helper, DOT) {
    function TemplateHelper() {

    }

    TemplateHelper.compile = function compile(template, def, config) {
        var con = config || null;

        if (Helper.isString(template) === false) {
            throw new Error('template.helper.template.not.string');
        }
        if (Helper.isObject(def) === false) {
            throw new Error('template.helper.def.not.object');
        }
        return DOT.template(template, con, def);
    };

    TemplateHelper.render = function render(
        template, def, data, config
    ) {
        var con = config || null,
            templateFn;

        if (Helper.isString(template) === false) {
            throw new Error('template.helper.template.not.string');
        }
        if (Helper.isObject(def) === false) {
            throw new Error('template.helper.def.not.object');
        }
        if (Helper.isObject(data) === false) {
            throw new Error('template.helper.data.not.object');
        }
        templateFn = DOT.template(template, con, def);

        if (Helper.isFunction(templateFn) === false) {
            throw new Error('template.helper.template.compile.error');
        }
        return templateFn(data);
    };
    return TemplateHelper;
});
