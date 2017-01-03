define(['scripts/Helper'], function ConfigurationLoader(Helper) {
    var config = {
        'actorRoleMapping': {
            'proofCorrector': ['au'],
            'proofEditor': ['ed'],
            'proofValidator': ['mc'],
            'queryReplier': ['jm']
        },
        'selectors': {
            'generatedText': 'x',
            'figure': 'figure',
            'title': 'ce_title',
            'label': 'ce_label',
            'ellipsis': 'sb_ellipsis',
            'unicodeCharacter': 'unicode-char',
            'inlineFigure': 'ce_inline-figure',
            'biography': 'ce_biography',
            'inlineFormula': 'inline-formula',
            'tableCaption': 'tablecaption',
            'equation': 'eqn-container',
            'fullEquationContainer': 'formula',
            'copyEditorDelete': 'cpedel',
            'copyEditorInsert': 'cpeins',
            'interReferenceTitle': 'ce_inter-ref-title',
            'interReference': 'ce_inter-ref',
            'interReferences': 'ce_inter-refs',
            'collaboration': 'ce_collaboration',
            'authorGroup': 'ce_author-group',
            'alternativeText': 'ce_alt-text',
            'keywords': 'ce_keywords',
            'ceAffiliation': 'ce_affiliation',
            'saAffiliation': 'sa_affiliation',
            'documentObjectIdentifier': 'ce_doi',
            'researchGroup': null,
            'reference': 'ce_bib-reference',
            'table': 'table',
            'caption': 'ce_caption'
        },
        'enableFigureAndTableQuickLinkFor': [
            'figure',
            'table'
        ],
        'enableEquationQuickLinkFor': [
            'equation',
            'fullEquationContainer'
        ],
        'enableAnnotationFor': [
            'figure',
            'inlineFigure',
            'biography',
            'tableCaption'
        ],
        'enableHigResFor': [
            'figure'
        ],
        'enableEditLogFor': {
            'author': true,
            'copyEditor': true,
            'instruct': true
        }
    };

    function Configuration() {

    }

    Configuration.get = function get(key) {
        if (Helper.objectHasKey(config, key) === false) {
            throw new Error('error.key.missing ' + key);
        }
        return config[key];
    };

    return Configuration;
});
