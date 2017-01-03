({
    'baseUrl': '.',
    'name': 'scripts/appHelp',
    'optimize': 'uglify',
    'paths': {
        'templates': 'scripts/templates/##CUSTOMER##',
        'customer': 'scripts/customer/##CUSTOMER##'
    },
    'map': {
        '*': {
            'css': 'empty:',
            'scripts/polyfills/polyfills': 'phoenix/scripts/polyfills/polyfills',
            'scripts/polyfills/classList': 'phoenix/scripts/polyfills/classList',
            'scripts/polyfills/dataset': 'phoenix/scripts/polyfills/dataset',
            'scripts/polyfills/assign': 'phoenix/scripts/polyfills/assign',
            'scripts/polyfills/beacon': 'phoenix/scripts/polyfills/beacon',
            'dot': 'scripts/libs/doT',
            'scripts/radio': 'phoenix/scripts/radio',
            'scripts/Helper': 'phoenix/scripts/Helper',
            'scripts/Request': 'phoenix/scripts/Request',
            'scripts/RequestBuilder': 'phoenix/scripts/RequestBuilder',
            'scripts/EventBus': 'phoenix/scripts/EventBus',
            'scripts/ConfigReader': 'phoenix/scripts/ConfigReader'
        }
    },
    'out': 'dist/pchelp.js'
})
