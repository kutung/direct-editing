define([], function DirectEditingLoader() {
    return {
        'directEditing': {
            'commonSelectors': [
                'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                'ul', 'ol', 'p', 'dl', 'li', 'dt', 'dd', 'div', 'td', 'th', 'tr'
            ],
            'NonEditableSelectors': [
                'glyph', 'reference', 'citation', 'interReference',
                'figure', 'inlineFigure', 'biography', 'inlineFormula', 'equation',
                'supplementaryText'
            ],
            'baseSelector': 'div',
            'uniqueSelector': 'name'
        }
    };
});
