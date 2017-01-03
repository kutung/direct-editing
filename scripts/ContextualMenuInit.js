define([
    'scripts/EventBus', 'scripts/ContextualMenu', 'scripts/BoldMenuItem',
    'scripts/ItalicMenuItem', 'scripts/SuperscriptMenuItem',
    'scripts/SubscriptMenuItem', 'scripts/DeleteMenuItem',
    'scripts/RejectMenuItem', 'scripts/InsertMenuItem',
    'scripts/InstructMenuItem', 'scripts/ContextualMenuRules',
    'scripts/InsertEditMenuItem', 'scripts/InstructEditMenuItem', 'scripts/RangeHelper',
    'scripts/SmallCapsMenuItem', 'scripts/MonospaceMenuItem', 'scripts/FeatureToggle',
    'scripts/DeleteReferenceMenuItem'
], function contextualmenuLoader(
    EventBus, ContextualMenu, BoldMenuItem, ItalicMenuItem,
    SuperscriptMenuItem, SubscriptMenuItem,
    DeleteMenuItem, RejectMenuItem, InsertMenuItem,
    InstructMenuItem, ContextualMenuRules, InsertEditMenuItem, InstructEditMenuItem, RangeHelper,
    SmallCapsMenuItem, MonospaceMenuItem, Features, DeleteReferenceMenuItem
) {
    var contextualMenu;

    function ContextualMenuInit(Win, Doc, editorInst) {
        this.win = Win;
        this.doc = Doc;
        this.editorInst = editorInst;
        this.articleContainer = null;
    }

    ContextualMenuInit.prototype.load = function load() {
        var menuContainer,
            win = this.win,
            doc = this.doc,
            editorInst = this.editorInst,
            rangeHelper = new RangeHelper();

        if (this.articleContainer instanceof win.HTMLElement === false) {
            throw new Error('contextualmenu.htmlElement.missing');
        }

        if (Features.isFeatureEnabled('Editor.Format.Bold') === true) {
            contextualMenu.add(
                'bold', new BoldMenuItem(EventBus, win, doc, rangeHelper)
            );
        }
        if (Features.isFeatureEnabled('Editor.Format.Italic') === true) {
            contextualMenu.add(
                'italic', new ItalicMenuItem(EventBus, win, doc, rangeHelper)
            );
        }
        if (Features.isFeatureEnabled('Editor.Format.Superscript') === true) {
            contextualMenu.add(
                'superScript', new SuperscriptMenuItem(
                    EventBus, win, doc, rangeHelper
                )
            );
        }
        if (Features.isFeatureEnabled('Editor.Format.Subscript') === true) {
            contextualMenu.add(
                'subScript', new SubscriptMenuItem(EventBus, win, doc, rangeHelper)
            );
        }
        if (Features.isFeatureEnabled('Editor.Format.SmallCaps') === true) {
            contextualMenu.add(
                'smallCaps', new SmallCapsMenuItem(EventBus, win, doc, rangeHelper)
            );
        }
        if (Features.isFeatureEnabled('Editor.Format.Monospace') === true) {
            contextualMenu.add(
                'monospace', new MonospaceMenuItem(EventBus, win, doc, rangeHelper)
            );
        }
        if (Features.isFeatureEnabled('Editor.Format.Delete') === true) {
            contextualMenu.add(
                'delete', new DeleteMenuItem(EventBus, win, doc, rangeHelper)
            );
        }
        if (Features.isFeatureEnabled('Editor.Format.Reject') === true) {
            contextualMenu.add(
                'reject', new RejectMenuItem(EventBus, win, doc, rangeHelper)
            );
        }
        if (Features.isFeatureEnabled('Editor.Insert') === true) {
            contextualMenu.add(
                'insert', new InsertMenuItem(EventBus, win, doc, rangeHelper)
            );
        }
        if (Features.isFeatureEnabled('Editor.Instruct.Enable') === true) {
            contextualMenu.add(
                'instruct', new InstructMenuItem(EventBus, doc, win, rangeHelper)
            );
        }
        if (Features.isFeatureEnabled('Editor.Insert') === true) {
            contextualMenu.add(
                'editInsert', new InsertEditMenuItem(EventBus, win, doc, rangeHelper)
            );
        }
        if (Features.isFeatureEnabled('Editor.Instruct.Enable') === true) {
            contextualMenu.add(
                'editInstruct', new InstructEditMenuItem(EventBus, win, doc, rangeHelper)
            );
        }
        if (Features.isFeatureEnabled('Editor.ReferenceManagement.Delete') === true) {
            contextualMenu.add(
                'deleteReference', new DeleteReferenceMenuItem(
                    EventBus, win, doc, rangeHelper, editorInst
                )
            );
        }

        menuContainer = contextualMenu.render();
        this.articleContainer.appendChild(menuContainer);
    };

    ContextualMenuInit.prototype.initiate = function initiate(container) {
        this.articleContainer = container;
        contextualMenu = new ContextualMenu(
            this.win, this.doc, EventBus, ContextualMenuRules
        );
        return contextualMenu;
    };
    return ContextualMenuInit;
});
