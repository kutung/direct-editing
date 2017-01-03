define(function HeaderTemplate() {
    var template = [
        '<header class="header clearfix">',
          '<section class="header-container">',
                '<section class="header-inner clearfix">',
                      '<h1><a href="javascript:void(0);"></a></h1>',
                      '<p class="caption">',
                            '<span></span>',
                            '{{landing.page.header.slogan}}',
                      '</p>',
                      '<p class="customer-logo">',
                            '<img src="{{=it.customerLogo}}">',
                      '</p>',
                '</section>',
          '</section>',
          '</header>'
    ];

    return template.join('');
});
