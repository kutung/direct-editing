define([], function GeneralConfigurationLoader() {
    return {
        'enableHigResFor': [
            'figure'
        ],
        'enableFigureAndTableQuickLinkFor': [
            'figure',
            'table',
            'multiMediaComponentLink'
        ],
        'enableAnnotationFor': [
            'figure',
            'inlineFigure',
            'biography',
            'tableCaption',
            'equation',
            'inlineFormula'
        ],
        'enableEditLogFor': {
            'author': true,
            'copyEditor': false
        },
        'referenceLabel': [
            'numberedReferenceLabel',
            'namedReferenceLabel'
        ],
        'appExtension': ['doc', 'docx', 'pdf', 'zip', 'txt', 'ppt', 'xlsx', 'xls'],
        'audioExtension': ['mp3'],
        'videoExtension': ['mp4', 'mov', 'avi', 'mpg', 'mpeg', 'flv', 'mp4', 'mov', 'wmv']
    };
});
