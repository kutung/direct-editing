define(function OfflineProofCorrectorTemplate() {
    var template = [
            '<article class="content-list">',
                '<h2>{{offline.page.heading}}</h2>',
                '<p class="steps-annotate-title">{{offline.page.steps.heading}}</p>',
                '<ol class="off-line-content-list">',
                    '<li>',
                        '<p>1. {{offline.page.proofvalidator.download.pdf}}</p>',
                            '<section class="upload-corrections">',
                                '<h3>Corrected proof and associated files</h3>',
                                '{{?it.readOnly == false}}',
                                    '<p class="clearfix">',
                                        '<input type="file" name="file" class="attach-file">',
                                        '<span class="limit">* {{offline.page.upload.limit}}</span>',
                                    '</p>',
                                '{{?}}',
                                '<ul class="uploaded-file-list">',
                                '</ul>',
                            '</section>',
                    '</li>',
                    '<li>',
                        '<p>2. {{offline.page.review.pdf}}</p>',
                        '<section class="steps-annotate">',
                            '<ul>',
                                '<li>{{offline.page.annoatate.pdf.instruction}} <a target="_blank" href="http://get.adobe.com/reader/">{{offline.page.click.here}}</a>. {{offline.page.annoatate.pdf.instruction.help}} <a href="{{=it.instructionsPdf}}" target="_blank">{{offline.page.click.here}}</a>.</li>',
                                '<li>{{offline.page.annoatate.pdf.instruction.ipad}} <a href="{{=it.instructionsIpadPdf}}" target="_blank">{{offline.page.click.here}}</a>.</li>',
                            '</ul>',
                        '</section>',

                    '</li>',
                    '<li><p>3. {{offline.page.proofvalidator.upload.annotate}}</p></li>',
                '</ol>',
            '</article>'
        ];

    return template.join('');
});
