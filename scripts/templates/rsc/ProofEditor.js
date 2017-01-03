define(function ProofEditorTemplate() {
    var template = [
            '<article class="content-list">',
                '<h2>{{landing.page.welcome}} {{!it.actorName}},</h2>',
                '<p class="info">{{landing.page.below.welcome.instruction.editor}}</p>',
                '<h2 class="submit-title">{{landing.page.do.step.before.submit}}</h2>',
                '<section class="welcome-content">',
                    '<ul class="screen-list">',
                        '<li>',
                            '<section class="img-list">',
                                '<img src="/images/landing/img_pc_7.jpg" width="65" height="60" alt="">',
                            '</section>',
                            '<p>',
                                '{{landing.page.editor.instruction.author.name}}',
                            '</p>',
                        '</li>',
                        '<li>',
                            '<section class="img-list">',
                                '<img src="/images/landing/img_pc_2.jpg" width="65" height="60" alt="">',
                            '</section>',
                        '<p>',
                            '{{landing.page.editor.instruction.edit.log}}',
                        '</p>',
                        '</li>',
                        '<li>',
                            '<section class="img-list">',
                                '<img src="/images/landing/img_pc_3.jpg" width="65" height="60" alt="">',
                            '</section>',
                            '<p>',
                                '{{landing.page.editor.instruction.queries}}',
                            '</p>',
                        '</li>',
                        '<li>',
                            '<section class="img-list">',
                                '<img src="/images/landing/img_pc_4.jpg" width="65" height="60" alt="">',
                            '</section>',
                            '<p>',
                                '{{landing.page.editor.instruction.graphics}}',
                            '</p>',
                        '</li>',
                        '{{?it.features.showPaginateProof === true}}',
                        '<li>',
                            '<section class="img-list">',
                                '<img src="/images/landing/img_pc_5.jpg" width="65" height="60" alt="">',
                            '</section>',
                            '<p>',
                                '{{landing.page.instruction.proof}}',
                            '</p>',
                        '</li>',
                        '{{?}}',
                        '{{?it.features.showViewProof === true}}',
                        '<li>',
                            '<section class="img-list">',
                                '<img src="/images/landing/img_pc_6.jpg" width="65" height="60" alt="">',
                            '</section>',
                            '<p>',
                                '{{landing.page.instruction.view.page.proof}}',
                            '</p>',
                        '</li>',
                        '{{?}}',
                    '</ul>',
                '</section>',
            '</article>'
        ];

    return template.join('');
});
