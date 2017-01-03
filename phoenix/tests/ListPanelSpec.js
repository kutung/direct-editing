define(['scripts/ListPanel', 'scripts/Helper', 'scripts/EventBus'], function(
    ListPanel, Helper, EventBus
) {
    describe('List Panel suite', function() {
        var listPanel, listPanelContainer;

        beforeEach(function() {
            listPanelContainer = document.createElement('div');
            listPanel = new ListPanel(listPanelContainer, document, window, EventBus);
        });

        afterEach(function() {
            listPanelContainer.innerHTML = '';
            listPanelContainer = null;
            try {
                listPanel.destroy();
            }
            catch(e) {}
        });

        describe('Ensures', function() {
            it('Class must to be defined', function() {
                 expect(ListPanel).toBeDefined();
            });
            it('Constructor must to be set properly', function() {
                    expect(listPanel.global).toEqual(window);
                    expect(listPanel.htmlDoc).toEqual(document);
                    expect(listPanel.eBus).toEqual(EventBus);
                    expect(listPanel.panelContainer).toEqual(listPanelContainer);
                    expect(listPanel.panel).toEqual(null);
                    expect(listPanel.panelContent).toEqual(null);
                    expect(listPanel.onPanelHeaderClick).toEqual(null);
                    expect(listPanel.ignoreHeaderToggle).toEqual(false);
            });
            it('Public methods to be defined', function() {
                expect(ListPanel.prototype.add).toBeDefined();
                expect(ListPanel.prototype.render).toBeDefined();
                expect(ListPanel.prototype.destroy).toBeDefined();
            });
            it('Neccessary dependencies to be Initialized', function() {
                var failContainerFn = function () {
                    var listPanelContainer = document.createElement('div');
                    new ListPanel('', document, window, EventBus);
                },
                successFn = function () {
                    var listPanelContainer = document.createElement('div');
                    new ListPanel(listPanelContainer, document, window, EventBus);
                };

                expect(failContainerFn).toThrow(new Error('list.panel.requires.htmlelement'));
                expect(successFn).not.toThrow();
            });
        });

        describe('Render', function() {
            it('Should load the panel into the container successfully', function() {
                listPanel.render();
                expect(listPanelContainer.hasChildNodes()).toBeTruthy();
            });
        });

        describe('Execute', function() {

            it('set title to the list panel', function setTitle() {
                var listPanelTitle = 'List Panel title Here',
                    failSetTitle = function () {
                        listPanel.setTitle(listPanelTitle);
                    },
                    successSetTitle = function () {
                        listPanel.render();
                        listPanel.setTitle(listPanelTitle);
                    };

                expect(failSetTitle).toThrow(new Error('list.panel.not.rendered'));
                expect(successSetTitle).not.toThrow();
                expect(listPanel.panelContainer.querySelector('.panel-header .text').innerHTML).toEqual(listPanelTitle);
            });

            it('set name to list panel', function setName() {
                var listPanelName = 'List Panel title Here',
                    failSetName = function () {
                        listPanel.setName(listPanelName);
                    },
                    successSetName = function () {
                        listPanel.render();
                        listPanel.setName(listPanelName);
                    };

                expect(failSetName).toThrow(new Error('list.panel.not.rendered'));
                expect(successSetName).not.toThrow();
                expect(listPanel.panelName).toEqual(listPanelName);
            });

            it('add item to list panel', function add() {
                var listItem = '<p>New List Item</p>',
                    listProp = {'sectionId': 'item1'},
                    failAddNode = function () {
                        listPanel.add(listItem, listProp);
                    },
                    successAddNode = function () {
                        listPanel.render();
                        listPanel.add(listItem, listProp);
                    };

                expect(failAddNode).toThrow(new Error('list.panel.not.rendered'));
                expect(successAddNode).not.toThrow();
                expect(listPanel.panelContainer.querySelector('ul').hasChildNodes()).toBeTruthy();
            });

            it('fetch element from list panel', function getElement() {
                var listItem = '<p>New List Item</p>',
                    listProp = {'sectionId': 'item1'},
                    elemListPanel,
                    sampleList = [
                        '<div class="panel-header no-selection">',
                            '<span class="icon">&nbsp;</span>',
                            '<span class="text"></span>',
                        '</div>',
                        '<div class="panel-overlay"></div>',
                        '<ul style="display: block;">',
                            '<li data-section-id="item1" tabindex="0">',
                                '<p>New List Item</p>',
                            '</li>',
                        '</ul>'
                    ];

                listPanel.render();
                listPanel.add(listItem, listProp);
                elemListPanel = listPanel.getElement();

                expect(elemListPanel.innerHTML).toEqual(sampleList.join(''));
            });

            it('set list panel header ignore click', function ignoreHeaderClick() {
                var ignoreHeaderClick = true;

                listPanel.ignoreHeaderClick(ignoreHeaderClick);
                expect(listPanel.ignoreHeaderToggle).toEqual(ignoreHeaderClick);
            });

            it('set list panel loader', function setLoading() {
                var loader = true;

                listPanel.render();
                listPanel.setLoading(loader);
                expect(listPanel.loading).toEqual(loader);
            });

            it('Must execute node clickAction', function () {
                clickMethod = spyOn(listPanel, 'onClick');
                listPanel.onClick();
                expect(clickMethod).toHaveBeenCalled();
            });

            it('Must execute node keyAction', function () {
                keyMethod = spyOn(listPanel, 'onKeyDown');
                listPanel.onKeyDown();
                expect(keyMethod).toHaveBeenCalled();
            });
        });
    });
});
