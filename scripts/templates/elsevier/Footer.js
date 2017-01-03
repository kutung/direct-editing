define(function FooterTemplate() {
    var template = [
                '<footer>',
                '{{?it.page == "online"}}',
                '{{?it.actorMode == "proofCorrector" || it.actorMode == "proofEditor"}}',
                    '<span class="author-help">',
                        '{{landing.page.footer.popup.blocker.text}}. {{landing.page.footer.general}}',
                         '{{?it.actorMode == "proofCorrector"}} {{landing.page.footer.author}} {{?}} {{landing.page.footer.help}}, ',
                        '<a href="http://www.elsevier.com/supportcenter/publishing" target="_blank">{{landing.page.footer.click.here}}</a>',
                    '</span>',
                    '{{?}}',
                    '<input type="button" value="{{landing.page.proceed}}" class="btn proceed">',
                    '{{?}}',
                    '{{?it.page == "offline" && it.readOnly == false}}',
                        '<div class="buttons">',
                            '<input type="button" value="{{offline.page.footer.submit}}" class="btn submit">',
                        '</div>',
                    '{{?}}',
                '</footer>'
    ];

    return template.join('');
});
