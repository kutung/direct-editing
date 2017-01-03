define(function SupportLinks() {
    var template = [
            '<ul>',
                '<li>',
                    '<a href="#" class="gen-author" target="_blank" >{{general.author.help}}</a>',
                '</li>',
                '<li>',
                    '<a href="#" class="online-proof" target="_blank" >{{online.proofing.help}}</a>',
                '</li>',
            '</ul>'
    ];

    return template.join('');
});
