({
    'baseUrl': '.',
    'name': 'scripts/appValidate',
    'optimize': 'uglify',
    'paths': {
        'customer-proof-validate': 'pagination/validator/config/##CUSTOMER##'
    },
    'map': {
        '*': {
            'css': 'empty:',
            'ckeditor': 'empty:',
            'he': 'empty:',
            'sax': 'empty:',
            'rangy': 'empty:',
            'jquery': 'empty:',
            'jquery-hyphenation': 'empty:',
            'jquery-en-us': 'empty:',
            'pagination/scripts/ColumnBreaker': 'empty:',
            'pagination/scripts/ContentHandler': 'empty:',
            'pagination/scripts/FlowTemplate': 'empty:',
            'pagination/scripts/LineBreaker': 'empty:',
            'scripts/polyfills/classList': 'phoenix/scripts/polyfills/classList',
            'scripts/polyfills/dataset': 'phoenix/scripts/polyfills/dataset',
            'scripts/polyfills/assign': 'phoenix/scripts/polyfills/assign',
            'scripts/polyfills/polyfills': 'phoenix/scripts/polyfills/polyfills',
            'scripts/polyfills/beacon': 'phoenix/scripts/polyfills/beacon',
            'scripts/polyfills/dialog': 'phoenix/scripts/polyfills/dialog',
            'scripts/radio': 'phoenix/scripts/radio',
            'scripts/Helper': 'phoenix/scripts/Helper',
            'scripts/Request': 'phoenix/scripts/Request',
            'scripts/RequestBuilder': 'phoenix/scripts/RequestBuilder',
            'scripts/Panel': 'phoenix/scripts/Panel',
            'scripts/TabPanel': 'phoenix/scripts/TabPanel',
            'scripts/TableCharAlign': 'phoenix/scripts/TableCharAlign',
            'scripts/Logger': 'phoenix/scripts/Logger',
            'scripts/ServerLogger': 'phoenix/scripts/ServerLogger',
            'scripts/AbstractMenuItem': 'phoenix/scripts/AbstractMenuItem',
            'scripts/Annotate': 'phoenix/scripts/Annotate',
            'scripts/EventBus': 'phoenix/scripts/EventBus',
            'scripts/ContextualMenu': 'phoenix/scripts/ContextualMenu',
            'scripts/SelectBox': 'phoenix/scripts/SelectBox',
            'scripts/DialogPopupPanel': 'scripts/ModalDialog',
            'scripts/ConfigReader': 'phoenix/scripts/ConfigReader'
        }
    },
    'out': 'dist/pcValidate.js'
})
