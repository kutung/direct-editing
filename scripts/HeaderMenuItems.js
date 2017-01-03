/* global define */
define(['scripts/Helper', 'scripts/EventBus', 'scripts/ConfigReader'
], function HeaderMenuItemsLoader(Helper, EventBus, Config) {
    var proofViewBtn, editorViewBtn, pdfDownloadBtn, pageProofViewBtn,
        modeBtn, modeLabel, proofEditorViewBtn, paginateProofViewBtn,
        xmlEditorBtn;

    function registerButtons(doc) {
        modeBtn = doc.querySelector('.container .mode-buttons');
        modeLabel = doc.querySelector('.container .mode-buttons .label');
        proofViewBtn = doc.querySelector('.container .mode-buttons .proofBtn');
        paginateProofViewBtn = doc.querySelector('.proofview .mode-buttons .proofBtn');
        pageProofViewBtn = doc.querySelector('.container .action-buttons .pageProofBtn');
        editorViewBtn = doc.querySelector('.container .mode-buttons .editorBtn');
        xmlEditorBtn = doc.querySelector('.container .mode-buttons .xmlEditorBtn');
        proofEditorViewBtn = doc.querySelector('.proofview .mode-buttons .editorBtn');
        pdfDownloadBtn = doc.querySelector('.proofview .mode-buttons .downloadBtn');
    }

    function HeaderMenuItems(Doc) {
        this.doc = Doc;
        registerButtons(this.doc);
    }

    HeaderMenuItems.prototype.showDownloadProof = function showDownloadProof() {
        pdfDownloadBtn.classList.add('show');
    };

    HeaderMenuItems.prototype.showPaginateProof = function showPaginateProof() {
        proofViewBtn.classList.add('show');
        paginateProofViewBtn.classList.add('show');
        proofEditorViewBtn.classList.add('show');
        modeBtn.classList.add('show');
        editorViewBtn.classList.add('show');
        modeLabel.classList.add('show');
        EventBus.publish('Proof:Enabled');
    };

    HeaderMenuItems.prototype.showViewProof = function showViewProofFn() {
        pageProofViewBtn.classList.remove('hide');
        pageProofViewBtn.addEventListener('click', function clickPageProof() {
            EventBus.publish('Download:ViewPageProof');
        });
        EventBus.publish('PageProof:Enabled');
    };

    HeaderMenuItems.prototype.showXmlEditor = function showXmlEditorFn() {
        xmlEditorBtn.classList.add('show');
        modeBtn.classList.add('show');
        editorViewBtn.classList.add('show');
        modeLabel.classList.add('show');
        paginateProofViewBtn.classList.add('show');
        proofEditorViewBtn.classList.add('show');
    };

    return HeaderMenuItems;
});
