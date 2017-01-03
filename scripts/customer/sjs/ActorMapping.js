define([], function ConfigurationLoader() {
    return {
        'actorRoleMapping': {
            'proofCorrector': ['au'],
            'proofEditor': ['ed'],
            'proofValidator': ['mc'],
            'queryReplier': ['jm']
        },
        'actorMapping': {
            'au': 'Author',
            'ed': 'Editor',
            'mc': 'Master Copier',
            'jm': 'Journal Manager'
        }
    };
});
