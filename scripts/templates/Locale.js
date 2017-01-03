define(function LocaleTemplate() {
    var template = [
      '<div class="locale-container">',
          '{{~it.data :locale:index}}',
            '{{?locale.enable == true }}',
              '<a href="#" class="locale-link" data-name="{{=locale.name}}" title="{{=locale.title}}">',
                '<img src="{{=locale.imageUrl}}" />',
              '</a>',
          '{{?}}{{~}}',
      '</div>'
    ];

    return template.join('');
});
