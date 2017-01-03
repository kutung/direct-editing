define(function SessionPageDetailsTemplate() {
    var template = [
                '<aside class="sessionpage-details">',
                    '<section class="article-cover-img">',
                    '<h2 class="session-message">',
                        '{{session.login.message1}}',
                    '<h2>',
                    '<p>{{session.login.message2}}',
                        '"<a href="#" class="facade-link" target="_blank">',
                            '{{session.link.message}}',
                        '</a>"',
                    '</p>',
                    '</section>',
                '</aside>'
    ];

    return template.join('');
});
