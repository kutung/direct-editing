#!/bin/bash

if [ ! -e /usr/bin/wget ]; then
    echo 'Installing wget...'
    sudo apt-get install wget
fi

if [ ! -e /usr/bin/git ]; then
    echo 'Installing git...'
    sudo apt-get install git-core
fi

if [ ! -e /usr/bin/java ]; then
    sudo apt-get install default-jre openjdk-7-jre
fi

if [ ! -e /usr/bin/node ]; then
    echo 'Installing node and npm...'
    sudo apt-get install nodejs npm
fi

mkdir -p ../scripts/libs
mkdir -p ../scripts/libs/uri
mkdir -p ../tests/libs
mkdir -p ../scripts/libs/jquery

if [ ! -f ../scripts/libs/jquery/jquery-1.10.1.min.js ]; then
    echo 'Installing jquery version 1.10.1'
    wget -O ../scripts/libs/jquery/jquery-1.10.1.min.js https://raw.githubusercontent.com/jquery/jquery/1.10.1/jquery.min.js
fi

if [ ! -f ../scripts/libs/jquery/en-us.js ]; then
    echo 'Installing jquery hyphenatin pattern "en-us" plugin version 0.2.1'
    wget -O ../scripts/libs/jquery/en-us.js https://raw.githubusercontent.com/bramstein/hyphenation-patterns/v0.2.1/dist/browser/en-us.js
fi

if [ ! -f ../scripts/libs/jquery/hyphenation-plugin.js ]; then
    echo 'Installing jquery hypher plugin version 0.2.3'
    wget -O ../scripts/libs/jquery/hyphenation-plugin.js https://raw.githubusercontent.com/bramstein/hypher/v0.2.3/lib/hypher.browser.pre.js https://raw.githubusercontent.com/bramstein/hypher/v0.2.3/lib/hypher.js https://raw.githubusercontent.com/bramstein/hypher/v0.2.3/lib/hypher.browser.post.js
fi

if [ ! -f ../scripts/libs/css.js ]; then
    echo 'Installing requirecss minified version 0.1.8'
    wget -O ../scripts/libs/css.js https://raw.githubusercontent.com/guybedford/require-css/0.1.8/css.min.js
    wget -O ../scripts/libs/css-builder.js https://raw.githubusercontent.com/guybedford/require-css/master/css-builder.js
    wget -O ../scripts/libs/normalize.js https://raw.githubusercontent.com/guybedford/require-css/master/normalize.js
fi

if [ ! -f ../scripts/libs/rangy-core.js ]; then
    echo 'Installing Rangy 1.3.0'
    wget -O ../scripts/libs/rangy-core.js https://raw.githubusercontent.com/timdown/rangy/1.3.0/lib/rangy-core.js
fi

if [ ! -f ../scripts/libs/rangy-selectionsaverestore.js ]; then
    echo 'Installing Rangy Selection Save and Restore'
    wget -O ../scripts/libs/rangy-selectionsaverestore.js https://raw.githubusercontent.com/timdown/rangy/1.3.0/lib/rangy-selectionsaverestore.js
fi

if [ ! -f ../scripts/libs/doT.js ]; then
    echo 'Installing Rangy Selection Save and Restore'
    wget -O ../scripts/libs/doT.js https://raw.githubusercontent.com/olado/doT/master/doT.js
fi

if [ ! -f ../scripts/libs/require-i18n-2.0.4.js ]; then
    echo 'Installing requirejs i18n version 2.0.4'
    wget -O ../scripts/libs/require-i18n-2.0.4.js https://raw.githubusercontent.com/requirejs/i18n/2.0.4/i18n.js
fi

if [ ! -f ../styles/normalize.3.0.2.css ]; then
    echo 'Installing normalize css version 3.0.2'
    wget -O ../styles/normalize.3.0.2.css http://necolas.github.com/normalize.css/3.0.2/normalize.css
fi

if [ ! -f ../scripts/libs/uri/uri-1.17.0.js ]; then
    echo 'Installing uri version 1.17.0'
    wget -O ../scripts/libs/uri/URI.js-gh-pages.zip https://github.com/medialize/URI.js/archive/gh-pages.zip
    unzip -d ../scripts/libs/uri ../scripts/libs/uri/URI.js-gh-pages.zip
    mv ../scripts/libs/uri/URI.js-gh-pages/src/URI.js ../scripts/libs/uri/uri-1.17.0.js
    mv ../scripts/libs/uri/URI.js-gh-pages/src/URI.min.js ../scripts/libs/uri/uri-min.1.17.0.js
    mv ../scripts/libs/uri/URI.js-gh-pages/src/punycode.js ../scripts/libs/uri/
    mv ../scripts/libs/uri/URI.js-gh-pages/src/IPv6.js ../scripts/libs/uri/
    mv ../scripts/libs/uri/URI.js-gh-pages/src/SecondLevelDomains.js ../scripts/libs/uri/
    rm -fr ../scripts/libs/uri/URI.js-gh-pages
    rm ../scripts/libs/uri/URI.js-gh-pages.zip
fi

if [ ! -d ../tests/libs/jasmine-standalone-2.4.1 ]; then
    echo 'Installing Jasmine BDD version 2.4.1'
    wget -O ../tests/libs/jasmine-standalone-2.4.1.zip https://github.com/jasmine/jasmine/releases/download/v2.4.1/jasmine-standalone-2.4.1.zip
    unzip -d ../tests/libs/jasmine-standalone-2.4.1 ../tests/libs/jasmine-standalone-2.4.1.zip
    rm ../tests/libs/jasmine-standalone-2.4.1.zip
fi

if [ ! -f ../tests/libs/jasmine-ajax-3.0.0.js ]; then
    echo 'Installing Jasmine Ajax Plugin version 3.0.0'
    wget -O ../tests/libs/jasmine-ajax-3.0.0.js https://raw.githubusercontent.com/jasmine/jasmine-ajax/v3.0.0/lib/mock-ajax.js
fi

if [ ! -d ../scripts/libs/ckeditor-4.5.9 ]; then
    if [ ! -d ckeditor-dev ]; then
        git clone https://github.com/ckeditor/ckeditor-dev.git
        cd ckeditor-dev
        git checkout 4.5.9
        cd ..
    fi

    if [ ! -d ./ckeditor-dev/dev/builder/release/ckeditor ]; then
        echo "" > ./ckeditor-dev/dev/builder/build-config.js
        echo 'var CKBUILDER_CONFIG = {' >> ./ckeditor-dev/dev/builder/build-config.js
        echo "    skin: 'moono'," >> ./ckeditor-dev/dev/builder/build-config.js
        echo "    preset: 'basic'," >> ./ckeditor-dev/dev/builder/build-config.js
        echo "    ignore: [" >> ./ckeditor-dev/dev/builder/build-config.js
        echo "        '.bender'," >> ./ckeditor-dev/dev/builder/build-config.js
        echo "        'bender.js'," >> ./ckeditor-dev/dev/builder/build-config.js
        echo "        'bender-err.log'," >> ./ckeditor-dev/dev/builder/build-config.js
        echo "        'bender-out.log'," >> ./ckeditor-dev/dev/builder/build-config.js
        echo "        'dev'," >> ./ckeditor-dev/dev/builder/build-config.js
        echo "        '.DS_Store'," >> ./ckeditor-dev/dev/builder/build-config.js
        echo "        '.editorconfig'," >> ./ckeditor-dev/dev/builder/build-config.js
        echo "        '.gitattributes'," >> ./ckeditor-dev/dev/builder/build-config.js
        echo "        '.gitignore'," >> ./ckeditor-dev/dev/builder/build-config.js
        echo "        'gruntfile.js'," >> ./ckeditor-dev/dev/builder/build-config.js
        echo "        '.idea'," >> ./ckeditor-dev/dev/builder/build-config.js
        echo "        '.jscsrc'," >> ./ckeditor-dev/dev/builder/build-config.js
        echo "        '.jshintignore'," >> ./ckeditor-dev/dev/builder/build-config.js
        echo "        '.jshintrc'," >> ./ckeditor-dev/dev/builder/build-config.js
        echo "        '.mailmap'," >> ./ckeditor-dev/dev/builder/build-config.js
        echo "        'node_modules'," >> ./ckeditor-dev/dev/builder/build-config.js
        echo "        'package.json'," >> ./ckeditor-dev/dev/builder/build-config.js
        echo "        'README.md'," >> ./ckeditor-dev/dev/builder/build-config.js
        echo "        'tests'" >> ./ckeditor-dev/dev/builder/build-config.js
        echo "    ]," >> ./ckeditor-dev/dev/builder/build-config.js
        echo "    plugins : {" >> ./ckeditor-dev/dev/builder/build-config.js
        echo "        'about' : 1," >> ./ckeditor-dev/dev/builder/build-config.js
        echo "        'basicstyles' : 1," >> ./ckeditor-dev/dev/builder/build-config.js
        echo "        'clipboard' : 1," >> ./ckeditor-dev/dev/builder/build-config.js
        echo "        'enterkey' : 1," >> ./ckeditor-dev/dev/builder/build-config.js
        echo "        'entities' : 1," >> ./ckeditor-dev/dev/builder/build-config.js
        echo "        'indentlist' : 1," >> ./ckeditor-dev/dev/builder/build-config.js
        echo "        'specialchar' : 1," >> ./ckeditor-dev/dev/builder/build-config.js
        echo "        'pastefromword' : 1," >> ./ckeditor-dev/dev/builder/build-config.js
        echo "        'link' : 1," >> ./ckeditor-dev/dev/builder/build-config.js
        echo "        'list' : 1," >> ./ckeditor-dev/dev/builder/build-config.js
        echo "        'toolbar' : 1," >> ./ckeditor-dev/dev/builder/build-config.js
        echo "        'wysiwygarea' : 1" >> ./ckeditor-dev/dev/builder/build-config.js
        echo "    }," >> ./ckeditor-dev/dev/builder/build-config.js
        echo "    languages : {" >> ./ckeditor-dev/dev/builder/build-config.js
        echo "        'en' : 1" >> ./ckeditor-dev/dev/builder/build-config.js
        echo "    }" >> ./ckeditor-dev/dev/builder/build-config.js
        echo "};" >> ./ckeditor-dev/dev/builder/build-config.js

        ./ckeditor-dev/dev/builder/build.sh && mv ckeditor-dev/dev/builder/release/ckeditor ../scripts/libs/ckeditor-4.5.9 && rm -fr ckeditor-dev
    fi
fi
