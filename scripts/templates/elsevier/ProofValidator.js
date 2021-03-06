define(function ProofValidatorTemplate() {
    var template = [
            '<article class="content-list">',
                '<h2>Dear {{=it.roleDescription}},</h2>',
                '<p class="info">',
                '{{?it.articleMode == "online"}}',
                    '{{landing.page.below.welcome.instruction.validator}}',
                '{{?}}{{?it.articleMode == "offline"}}',
                    '{{landing.page.below.welcome.instruction.validator.offline}}',
                '{{?}}',
                '</p>',
                '<section class="edit-content">',
                    '<ul class="screen-list">',
                        '{{?it.articleMode == "online"}}',
                        '<li>',
                            '<span class="content">{{landing.page.validator.instruction}}</span>',
                            '<span class="count {{?it.instructions > 0}}red{{?}}">',
                                '{{=it.instructions}}',
                            '</span>',
                        '</li>',
                        '<li>',
                            '<span class="content">{{landing.page.validator.attachments.to.queries}}</span>',
                             '<span class="count {{?it.attachmentToQueries > 0}}red{{?}}">',
                                '{{=it.attachmentToQueries}}',
                            '</span>',
                        '</li>',
                        '<li>',
                            '<span class="content">{{landing.page.validator.total.attachments}}</span>',
                             '<span class="count {{?it.totalAttachment > 0}}red{{?}}">',
                                '{{=it.totalAttachment}}',
                            '</span>',
                        '</li>',
                        '<li>',
                            '<span class="content">{{landing.page.validator.query.response}}</span>',
                             '<span class="count {{?it.queries > 0}}red{{?}}">',
                                '{{=it.queries}}',
                            '</span>',
                        '</li>',
                        '<li>',
                            '<span class="content">{{landing.page.validator.reject}}</span>',
                            '<span class="count {{?it.ceRejects > 0}}red{{?}}">',
                                '{{=it.ceRejects}}',
                            '</span>',
                        '</li>',
                        '<li>',
                            '<span class="content">{{landing.page.validator.edits}}</span>',
                            '<span class="count {{?it.edits > 0}}red{{?}}">',
                                '{{=it.edits}}',
                            '</span>',
                        '</li>',
                        '<li>',
                            '<span class="content">{{landing.page.validator.instrcution.graphics}}</span>',
                             '<span class="count {{?it.instructOnGraphics > 0}}red{{?}}">',
                                '{{=it.instructOnGraphics}}',
                            '</span>',
                        '</li>',
                        '<li>',
                            '<span class="content">{{landing.page.validator.edit.instrcution.equations}}</span>',
                             '<span class="count {{?it.editsInstructionOnEqn > 0}}red{{?}}">',
                                '{{=it.editsInstructionOnEqn}}',
                            '</span>',
                        '</li>',
                        '{{?}}',
                        '{{?it.articleMode == "offline"}}',
                            '<li>',
                                '<span class="content">{{landing.page.validator.total.attachments}}</span>',
                                 '<span class="count {{?it.totalAttachment > 0}}red{{?}}">',
                                    '{{=it.totalAttachment}}',
                                '</span>',
                            '</li>',
                        '{{?}}',
                        '{{?it.instructComment && it.instructComment !== false}}',
                            '<li class="instruct">{{landing.page.specific.instruction}} {{=it.instructComment}}</li>',
                        '{{?}}',
                    '</ul>',
                    '{{?it.articleMode == "online"}}',
                    '<p class="instruction">',
                        '<span class="red"> {{landing.page.red}} </span>',
                         '{{landing.page.attention}} {{=it.roleDescription}}',
                    '</p>',
                    '{{?}}',
                '</section>',
            '</article>'
        ];

    return template.join('');
});
