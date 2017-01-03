define(function ArticleDetailsTemplate() {
    var template = [
                '<aside class="article-details">',
                    '<section class="article-cover-img">',
                    '<img data-src="/images/landing/no_thumbnail.png" class="js-journal-img overlay-image" src="{{=it.journalImage}}" width="132" height="178" alt="">',
                    '</section>',
                '<dl>',
                    '<dt>{{landing.page.article}}</dt>',
                        '<dd>{{=it.title || "--"}}</dd>',
                    '<dt class="author-title">{{landing.page.corresponding.author}}</dt>',
                        '<dd>{{!it.correspondingAuthor || "--"}}</dd>',
                    '<dt>{{landing.page.journal}}</dt>',
                        '<dd>{{=it.journalExpansion || "--"}}</dd>',
                    '<dt>{{landing.page.our.reference}}</dt>',
                        '<dd>{{=it.jid || "-"}} {{=it.aid || "-"}}</dd>',
                    '<dt>{{landing.page.date.article.posted}}</dt>',
                        '<dd>{{=it.articlePostedDate || "--"}}</dd>',
                    '{{?it.authorSubmissionDate}}',
                    '<dt>{{landing.page.author.submission.date}}</dt>',
                        '<dd>{{=it.authorSubmissionDate || "--"}}</dd>',
                    '{{?}}',
                    '{{?it.finalSubmissionDate}}',
                    '<dt>{{landing.page.final.submission.date}}</dt>',
                        '<dd>{{=it.finalSubmissionDate || "--"}}</dd>',
                    '{{?}}',
                '</dl>',
                '</aside>'
    ];

    return template.join('');
});

