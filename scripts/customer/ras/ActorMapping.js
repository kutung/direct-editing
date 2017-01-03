define([], function ConfigurationLoader() {
    return {
        'actorRoleMapping': {
            'proofCorrector': ['au'],
            'proofValidator': ['mc'],
            'queryReplier': ['jm']
        },
        'actorMapping': {
            'au': 'Author',
            'mc': 'Master Copier',
            'jm': 'Journal Manager'
        }
    };
});
