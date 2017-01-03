define([], function contextualMenuRules() {
    var menuRules = {
        'onDelete': [
            {
                'name': 'delete',
                'show': true,
                'disable': false,
                'active': true
            },
            {
                'name': 'subScript',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'bold',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'italic',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'superScript',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'insert',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'instruct',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'editInsert',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'editInstruct',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'deleteReference',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'smallCaps',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'monospace',
                'show': false,
                'disable': true,
                'active': false
            }
        ],
        'onEllipsis': [
            {
                'name': 'delete',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'subScript',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'bold',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'italic',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'superScript',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'insert',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'editInsert',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'editInstruct',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'deleteReference',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'smallCaps',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'monospace',
                'show': false,
                'disable': true,
                'active': false
            }
        ],
        'onBold': [
            {
                'name': 'bold',
                'show': true,
                'disable': false,
                'active': true
            },
            {
                'name': 'insert',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'instruct',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'subScript',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'italic',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'superScript',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'delete',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'editInsert',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'editInstruct',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'deleteReference',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'smallCaps',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'monospace',
                'show': true,
                'disable': false,
                'active': false
            }
        ],
        'onItalic': [
            {
                'name': 'italic',
                'show': true,
                'disable': false,
                'active': true
            },
            {
                'name': 'bold',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'insert',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'instruct',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'subScript',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'superScript',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'delete',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'editInsert',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'editInstruct',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'deleteReference',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'smallCaps',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'monospace',
                'show': true,
                'disable': false,
                'active': false
            }
        ],
        'onSuperscript': [
            {
                'name': 'superScript',
                'show': true,
                'disable': false,
                'active': true
            },
            {
                'name': 'italic',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'bold',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'insert',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'instruct',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'subScript',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'delete',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'editInsert',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'editInstruct',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'deleteReference',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'smallCaps',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'monospace',
                'show': true,
                'disable': false,
                'active': false
            }
        ],
        'onSubscript': [
            {
                'name': 'subScript',
                'show': true,
                'disable': false,
                'active': true
            },
            {
                'name': 'italic',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'bold',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'insert',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'instruct',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'superScript',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'delete',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'editInsert',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'editInstruct',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'deleteReference',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'smallCaps',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'monospace',
                'show': true,
                'disable': false,
                'active': false
            }
        ],
        'onTitle': [
            {
                'name': 'bold',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'editInsert',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'editInstruct',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'deleteReference',
                'show': false,
                'disable': false,
                'active': false
            }
        ],
        'onInstruct': [
            {
                'name': 'instruct',
                'show': true,
                'disable': false,
                'active': true
            },
            {
                'name': 'reject',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'insert',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'subScript',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'bold',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'italic',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'superScript',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'delete',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'editInsert',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'editInstruct',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'deleteReference',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'smallCaps',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'monospace',
                'show': false,
                'disable': false,
                'active': false
            }
        ],
        'onInsert': [
            {
                'name': 'instruct',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'insert',
                'show': true,
                'disable': false,
                'active': true
            },
            {
                'name': 'subScript',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'bold',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'italic',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'superScript',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'delete',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'instruct',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'reject',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'editInsert',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'editInstruct',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'deleteReference',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'smallCaps',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'monospace',
                'show': false,
                'disable': true,
                'active': false
            }
        ],
        'onCpeInsert': [
            {
                'name': 'reject',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'insert',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'delete',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'instruct',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'editInsert',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'editInstruct',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'deleteReference',
                'show': false,
                'disable': false,
                'active': false
            }
        ],
        'onCpeReplace': [
            {
                'name': 'reject',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'insert',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'delete',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'subScript',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'bold',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'italic',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'superScript',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'editInsert',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'editInstruct',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'deleteReference',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'smallCaps',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'monospace',
                'show': true,
                'disable': false,
                'active': false
            }
        ],
        'onCpeDel': [
            {
                'name': 'reject',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'insert',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'subScript',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'bold',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'italic',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'superScript',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'delete',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'instruct',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'editInsert',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'editInstruct',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'deleteReference',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'smallCaps',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'monospace',
                'show': false,
                'disable': true,
                'active': false
            }
        ],
        'onReject': [
            {
                'name': 'reject',
                'show': true,
                'disable': false,
                'active': true
            },
            {
                'name': 'insert',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'subScript',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'bold',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'italic',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'superScript',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'delete',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'editInsert',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'editInstruct',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'deleteReference',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'smallCaps',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'monospace',
                'show': false,
                'disable': true,
                'active': false
            }
        ],
        'onCpeDelonReject': [
            {
                'name': 'reject',
                'show': true,
                'disable': false,
                'active': true
            },
            {
                'name': 'insert',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'subScript',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'bold',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'italic',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'superScript',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'delete',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'editInsert',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'editInstruct',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'deleteReference',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'smallCaps',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'monospace',
                'show': true,
                'disable': false,
                'active': false
            }
        ],
        'onCpeInsertonReject': [
            {
                'name': 'reject',
                'show': true,
                'disable': false,
                'active': true
            },
            {
                'name': 'insert',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'subScript',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'bold',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'italic',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'superScript',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'delete',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'editInsert',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'editInstruct',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'deleteReference',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'smallCaps',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'monospace',
                'show': false,
                'disable': true,
                'active': false
            }
        ],
        'onGenBank': [
            {
                'name': 'insert',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'subScript',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'bold',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'italic',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'superScript',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'delete',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'editInsert',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'editInstruct',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'deleteReference',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'smallCaps',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'monospace',
                'show': false,
                'disable': true,
                'active': false
            }
        ],
        'onClick': [
            {
                'name': 'insert',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'instruct',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'subScript',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'bold',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'italic',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'superScript',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'delete',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'editInsert',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'editInstruct',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'deleteReference',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'smallCaps',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'monospace',
                'show': false,
                'disable': true,
                'active': false
            }
        ],
        'onSelect': [
            {
                'name': 'insert',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'instruct',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'subScript',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'bold',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'italic',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'superScript',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'delete',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'editInsert',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'editInstruct',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'deleteReference',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'smallCaps',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'monospace',
                'show': true,
                'disable': false,
                'active': false
            }
        ],
        'deleteReference': [
            {
                'name': 'insert',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'instruct',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'subScript',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'bold',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'italic',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'superScript',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'delete',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'editInsert',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'editInstruct',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'deleteReference',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'smallCaps',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'monospace',
                'show': false,
                'disable': false,
                'active': false
            }
        ],
        'onDeleteReference': [
            {
                'name': 'insert',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'instruct',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'subScript',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'bold',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'italic',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'superScript',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'delete',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'editInsert',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'editInstruct',
                'show': false,
                'disable': true,
                'active': false
            },
            {
                'name': 'deleteReference',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'smallCaps',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'monospace',
                'show': false,
                'disable': false,
                'active': false
            }
        ],
        'onSmallcaps': [
            {
                'name': 'smallCaps',
                'show': true,
                'disable': false,
                'active': true
            },
            {
                'name': 'monospace',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'bold',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'insert',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'instruct',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'subScript',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'italic',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'superScript',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'delete',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'editInsert',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'editInstruct',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'deleteReference',
                'show': false,
                'disable': false,
                'active': false
            }
        ],
        'onMonospace': [
            {
                'name': 'monospace',
                'show': true,
                'disable': false,
                'active': true
            },
            {
                'name': 'smallCaps',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'bold',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'insert',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'instruct',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'subScript',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'italic',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'superScript',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'delete',
                'show': true,
                'disable': false,
                'active': false
            },
            {
                'name': 'editInsert',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'editInstruct',
                'show': false,
                'disable': false,
                'active': false
            },
            {
                'name': 'deleteReference',
                'show': false,
                'disable': false,
                'active': false
            }
        ]
    };

    return menuRules;
});
