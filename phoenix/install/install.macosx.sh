#!/bin/bash

mkdir -p ../scripts/libs
mkdir -p ../scripts/polyfills
mkdir -p ../tests/libs

if [ ! -f ../scripts/libs/require-2.1.16.js ]; then
    echo 'Installing requirejs version 2.1.16'
    curl -XGET -o ../scripts/libs/require-2.1.16.js 'http://requirejs.org/docs/release/2.1.16/minified/require.js'
fi

if [ ! -f ../scripts/polyfills/classList.js ]; then
    echo 'Installing classList polyfill'
    curl -XGET -o ../scripts/polyfills/classList.js 'https://raw.githubusercontent.com/remy/polyfills/master/classList.js'
fi

if [ ! -f ../scripts/libs/require-domready-2.0.1.js ]; then
    echo 'Installing requirejs dom-ready version 2.0.1'
    curl -XGET -o ../scripts/libs/require-domready-2.0.1.js 'https://raw.githubusercontent.com/requirejs/domReady/2.0.1/domReady.js'
fi

if [ ! -f ../scripts/libs/sax-0.6.1.js ]; then
    echo 'Installing HtmlEntities 0.5.0'
    curl -XGET -o ../scripts/libs/sax-0.6.1.js 'https://raw.githubusercontent.com/isaacs/sax-js/v0.6.1/lib/sax.js'
fi

if [ ! -f ../scripts/libs/he-0.5.0.js ]; then
    echo 'Installing HtmlEntities 0.5.0'
    curl -XGET -o ../scripts/libs/he-0.5.0.js 'https://raw.githubusercontent.com/mathiasbynens/he/v0.5.0/he.js'
fi

if [ ! -f ../styles/normalize.3.0.2.css ]; then
    echo 'Installing normalize css version 3.0.2'
    curl -XGET -o ../styles/normalize.3.0.2.css 'http://necolas.github.com/normalize.css/3.0.2/normalize.css'
fi

if [ ! -d ../tests/libs/jasmine-standalone-2.2.1 ]; then
    echo 'Installing Jasmine BDD version 2.2.1'
    curl -XGET -o ../tests/libs/jasminev2.1.1.zip 'https://github.com/jasmine/jasmine/archive/v2.2.1.zip'
    unzip -d ../tests/libs ../tests/libs/jasminev2.1.1.zip
    mv ../tests/libs/jasmine-2.2.1/dist/jasmine-standalone-2.2.1.zip ../tests/libs
    rm -fr ../tests/libs/jasmine-2.2.1
    rm ../tests/libs/jasminev2.1.1.zip
    unzip -d ../tests/libs/jasmine-standalone-2.2.1 ../tests/libs/jasmine-standalone-2.2.1.zip
    rm ../tests/libs/jasmine-standalone-2.2.1.zip
fi

if [ ! -f ../tests/libs/jasmine-ajax-3.0.0.js ]; then
    echo 'Installing Jasmine Ajax Plugin version 3.0.0'
    curl -XGET -o ../tests/libs/jasmine-ajax-3.0.0.js 'https://raw.githubusercontent.com/jasmine/jasmine-ajax/v3.0.0/lib/mock-ajax.js'
fi

if [ ! -f ../scripts/libs/diff.js ]; then
    echo 'Installing diffjs'
    curl -XGET -O ../scripts/libs/diff.js 'https://raw.githubusercontent.com/components/jsdiff/master/diff.min.js'
fi

if [ ! -f ../scripts/libs/undo.js ]; then
    echo 'Installing undojs'
    curl -XGET -O ../scripts/libs/undo.js 'https://raw.githubusercontent.com/jzaefferer/undo/v0.2.0/undo.js'
fi

if [ ! -f ../scripts/libs/random-color.min.js ]; then
    echo 'Installing Random Color 0.4.4'
    curl -XGET -O ../scripts/libs/random-color.js 'https://cdnjs.cloudflare.com/ajax/libs/randomcolor/0.4.4/randomColor.min.js'
fi
