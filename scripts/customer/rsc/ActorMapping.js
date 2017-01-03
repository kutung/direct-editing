define([], function ConfigurationLoader() {
    return {
        'actorRoleMapping': {
            'proofCorrector': ['au'],
            'proofValidator': ['pr'],
            'queryReplier': ['ed']
        },
        'actorMapping': {
            'au': 'Author',
            'pr': 'Proof Reader',
            'ed': 'Editor'
        }
    };
});
