({
    'baseUrl': '.',
    'name': 'scripts/SessionPageApp',
    'optimize': 'uglify2',
    'generateSourceMaps': false,
    'preserveLicenseComments': false,
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
            'scripts/polyfills/dialog': 'phoenix/scripts/polyfills/dialog',
            'scripts/polyfills/beacon': 'phoenix/scripts/polyfills/beacon',
            'scripts/polyfills/assign': 'phoenix/scripts/polyfills/assign',
            'dot': 'scripts/libs/doT',
            'scripts/radio': 'phoenix/scripts/radio',
            'scripts/Helper': 'phoenix/scripts/Helper',
            'scripts/Request': 'phoenix/scripts/Request',
            'scripts/RequestBuilder': 'phoenix/scripts/RequestBuilder',
            'scripts/Logger': 'phoenix/scripts/Logger',
            'scripts/ServerLogger': 'phoenix/scripts/ServerLogger',
            'scripts/EventBus': 'phoenix/scripts/EventBus',
            'scripts/ConfigReader': 'phoenix/scripts/ConfigReader'
        }
    },
    'out': 'dist/pcsessionlandingpage.js'
})
