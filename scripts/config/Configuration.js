var Configuration = {};

Configuration = {
    'Environment': 'dev',
    'codeVersion': 'Edit-View-1.8',
    'Log': {
        'Level': 'info',
        'PersistOnServer': true
    },
    'currentLocale': 'en-US',
    'Plugins': {
        'Interface': {
            'Routes': '/scripts/config/routes.json',
            'Config': '/scripts/config/interface.json',
            'Locale': '/locale/en-US.json'
        },
        'Paginate': {
            'enable': true,
            'Routes': '/pagination/config/proof_routes.json',
            'Config': '/pagination/config/proof.json'
        }
    }
};
