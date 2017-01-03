define(function QueryReplierTemplate() {
    var template = [
            '<article class="content-list">',
                '<h2>Dear {{=it.roleDescription}},</h2>',
                '<p class="info">{{landing.page.below.welcome.instruction.replier}}</p>',
                '<section class="edit-content">',
                    '<ul class="screen-list">',
                        '<li>',
                            '<span class="content">{{landing.page.replier.query.from.mc}}</span>',
                           '<span class="count {{?it.validatorQueryCount > 0}}red{{?}}">',
                                '{{=it.validatorQueryCount}}',
                            '</span>',
                        '</li>',
                        '<li>',
                            '<span class="content">{{landing.page.replier.attachments.to.queries}}</span>',
                           '<span class="count {{?it.attachmentToQueries > 0}}red{{?}}">',
                                '{{=it.attachmentToQueries}}',
                            '</span>',
                        '</li>',
                        '<li>',
                            '<span class="content">{{landing.page.replier.total.attachments}}</span>',
                           '<span class="count {{?it.totalAttachment > 0}}red{{?}}">',
                                '{{=it.totalAttachment}}',
                            '</span>',
                    '</ul>',
                    '<p class="instruction">',
                        '<span class="red"> {{landing.page.red}} </span>',
                         '{{landing.page.attention}} {{=it.roleDescription}}',
                    '</p>',
                '</section>',
            '</article>'
        ];

    return template.join('');
});
