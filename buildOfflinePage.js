({
    'baseUrl': '.',
    'name': 'scripts/OfflinePageApp',
    'optimize': 'uglify2',
    'generateSourceMaps': false,
    'preserveLicenseComments': false,
    'paths': {
        'templates': 'scripts/templates/##CUSTOMER##',
        'customer': 'scripts/customer/##CUSTOMER##'
    },
    'map': {
        '*': {
            'scripts/polyfills/classList': 'phoenix/scripts/polyfills/classList',
            'scripts/polyfills/dataset': 'phoenix/scripts/polyfills/dataset',
            'scripts/polyfills/polyfills': 'phoenix/scripts/polyfills/polyfills',
            'scripts/polyfills/beacon': 'phoenix/scripts/polyfills/beacon',
            'scripts/polyfills/dialog': 'phoenix/scripts/polyfills/dialog',
            'scripts/polyfills/assign': 'phoenix/scripts/polyfills/assign',
            'dot': 'scripts/libs/doT',
            'scripts/radio': 'phoenix/scripts/radio',
            'scripts/Helper': 'phoenix/scripts/Helper',
            'scripts/Request': 'phoenix/scripts/Request',
            'scripts/RequestBuilder': 'phoenix/scripts/RequestBuilder',
            'scripts/Logger': 'phoenix/scripts/Logger',
            'scripts/Annotate': 'phoenix/scripts/Annotate',
            'scripts/ServerLogger': 'phoenix/scripts/ServerLogger',
            'scripts/EventBus': 'phoenix/scripts/EventBus',
            'scripts/Dialog': 'phoenix/scripts/Dialog',
            'scripts/ConfigReader': 'phoenix/scripts/ConfigReader'
        }
    },
    'out': 'dist/pcofflinepage.js'
})
