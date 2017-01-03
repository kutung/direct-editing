define(function AttachmentsTemplate() {
    var template = [
        '{{~it.attachments :file:index}}',
        '<li>',
            '<span class="attachments-name">',
                '<span title="{{=file.name}}" class="file-name">{{=file.name}}</span>',
                '<span class="size">{{=file.size}}</span>',
            '</span>',
            '{{?it.readOnly == false && (it.actor == "AU" || (it.actor != "AU" && it.annotateFileName != file.name))}}',
                '<span><button data-id="{{=file.id}}" class="delete">{{offline.page.delete}}</button></span>',
            '{{?}}',,
            '<span><a target="_blank" href="{{=file.url}}" class="button">{{?it.actor == "AU"}}{{offline.page.view}}{{??}}{{offline.page.download}}{{?}}</a></span>',
        '</li>',
        '{{~}}'
    ];

    return template.join('');
});
