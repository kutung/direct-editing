define(function MainTemplate() {
    var template = [
            '<section class="wrapper">',
            '{{#def.header || ""}}',
            '<div class="flash-message-container hide"></div>',
            '<section class="top-menu">',
            '<section class="localization">',
                '{{#def.locale || ""}}',
            '</section>',
                '{{?it.page == "online"}}',
                    '<section class="help">',
                        '<a class="help-link" href="#" target="_blank">{{landing.page.top.menu.help}}</a>',
                    '</section>',
                '{{?}}',
            '</section>',
            '<section class="main-content">',
                '<section class="container">',
                '{{#def.articleDetails || ""}}',
                '<section class="right-content">',
                    '{{#def.actorContent || ""}}',
                    '{{#def.footer || ""}}',
                '</section>',
               '</section>',
            '</section>',
        '</section>'
    ];

    return template.join('');
});
