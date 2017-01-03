define([], function GeneralConfigurationLoader() {
    return {
        'enableFigureAndTableQuickLinkFor': [
            'figure',
            'table',
            'multiMediaComponentLink'
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
