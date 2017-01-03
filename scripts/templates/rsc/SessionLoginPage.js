define(function SessionLoginPageTemplate() {
    var template = [
            '<section class="wrapper">',
            '{{#def.header || ""}}',
            '<div class="flash-message-container hide"></div>',
            '<section class="top-menu">',
            '<section class="localization">',
                '{{#def.locale || ""}}',
            '</section>',
            '</section>',
            '<section class="main-content">',
                '<section class="container">',
                '{{#def.sessionPageDetails || ""}}',
               '</section>',
            '</section>',
        '</section>'
    ];

    return template.join('');
});
