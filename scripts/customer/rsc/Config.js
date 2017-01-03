define(['scripts/Helper'], function ConfigurationLoader(Helper) {
    var config = {
        'actorRoleMapping': {
            'proofCorrector': ['au'],
            'proofValidator': ['pr'],
            'queryReplier': ['ed']
        },
        'selectors': {
            'generatedText': 'x',
            'figure': 'figure',
            'title': null,
            'label': 'ce_label',
            'ellipsis': 'sb_ellipsis',
            'unicodeCharacter': 'unicode-char',
            'inlineFigure': 'ce_inline-figure',
            'biography': 'biography',
            'inlineFormula': 'inline-formula',
            'tableCaption': 'tablecaption',
            'equation': 'eqn-container',
            'fullEquationContainer': 'formula',
            'copyEditorDelete': 'cpedel',
            'copyEditorInsert': 'cpeins',
            'interReferenceTitle': 'ce_inter-ref-title',
            'interReference': 'ce_inter-ref',
            'interReferences': 'ce_inter-refs',
            'collaboration': null,
            'authorGroup': 'authgrp',
            'alternativeText': null,
            'keywords': 'keyword',
            'ceAffiliation': 'aff',
            'saAffiliation': null,
            'documentObjectIdentifier': 'doi',
            'researchGroup': 'orcresearchgrp',
            'reference': 'ce_bib-reference',
            'table': 'table',
            'caption': 'title'
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
            'inlineFormula',
            'inlineFigure',
            'biography',
            'tableCaption',
            'equation'
        ],
        'enableHigResFor': [
            'figure'
        ],
        'enableEditLogFor': {
            'author': true,
            'copyEditor': false,
            'instruct': false
        }
    };
define(['scripts/Helper', 'customer/Selectors', 'customer/ActorMapping',
    'customer/DirectEditing'], function ConfigurationLoader(
        Helper, Selectors, ActorMapping, DirectEditing
) {
    var config = {
            'enableFigureAndTableQuickLinkFor': [
                'figure',
                'table'
            ],
            'enableAnnotationFor': [
                'figure',
                'inlineFormula',
                'inlineFigure',
                'biography',
                'tableCaption',
                'equation'
            ],
            'enableHigResFor': [
                'figure'
            ],
            'enableEditLogFor': {
                'author': true,
                'copyEditor': false
            },
            'referenceLabel': [
                'numberedReferenceLabel',
                'namedReferenceLabel'
            ],
            'citationReferenceId': 'data-refid'
        },
        configurations = Object.assign(
            {}, config, Selectors, ActorMapping, DirectEditing
        );

    configurations = Helper.deepFreeze(configurations);

    function Configuration() {

    }

    Configuration.get = function get(key) {
        if (Helper.objectHasKey(config, key) === false) {
            throw new Error('error.selector.key.missing ' + key);
        }
        return config[key];
    };

    return Configuration;
});
