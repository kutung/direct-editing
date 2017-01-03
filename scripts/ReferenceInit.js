define([
    'scripts/EventBus', 'scripts/Helper', 'scripts/ReferencePanel',
    'scripts/Util', 'customer/Config', 'scripts/ConfigReader'
], function ReferenceInitLoader(
    EventBus, Helper, ReferencePanel, Util, CustomerConfig, Config
) {

    function ReferenceInit(Win, Doc, ReferenceContainer) {
        this.win = Win;
        this.doc = Doc;
        this.referenceContainer = ReferenceContainer;
        this.syncElContainer = null;
    }

    ReferenceInit.prototype.initiate = function initiate(referenceTabPanel) {
            referenceTabPanel.add('Author', this.referenceContainer);
            referencePanel = new ReferencePanel( this.referenceContainer, EventBus, this.win, this.doc );
            referencePanel.render();
    };

    return ReferenceInit;
});
