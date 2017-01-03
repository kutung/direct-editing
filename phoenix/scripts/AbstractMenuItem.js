define([], function abstractMenuItemLoader() {
    function AbstractMenuItem() {
        this.contextualMenu = null;
    }

    AbstractMenuItem.prototype.setContextualMenu = function setContextualMenu(ContextualMenu) {
        this.contextualMenu = ContextualMenu;
    };

    AbstractMenuItem.prototype.setAction = function setAction() {
    };

    AbstractMenuItem.prototype.setActive = function setActive() {
    };

    AbstractMenuItem.prototype.render = function render() {
    };

    AbstractMenuItem.prototype.show = function show() {
    };

    AbstractMenuItem.prototype.hide = function hide() {
    };

    AbstractMenuItem.prototype.destroy = function destroy() {
        this.contextualMenu = null;
    };

    return AbstractMenuItem;
});
