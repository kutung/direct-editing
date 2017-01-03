define([], function abstractSelectorConfigLoader() {
    function AbstractConfig() {}

    AbstractConfig.prototype.getCommonSelectors = function getCommonSelectors() {
        return [
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'p', 'dl', 'li', 'dt', 'dd'
        ];
    };

    AbstractConfig.prototype.getUniqueAttributeSelector = function getUniqueAttributeSelector() {
        return 'data-section-id';
    };

    AbstractConfig.prototype.getArticleElementSelector = function getArticleElementSelector() {
        return 'article';
    };

    AbstractConfig.prototype.getSectionSelector = function getSectionSelector() {
        return 'section';
    };

    AbstractConfig.prototype.getInstructionPanelSelector = function getInstructionPanelSelector() {
        return '.comments-panel';
    };

    AbstractConfig.prototype.getInstructionBaseSelector = function getInstructionBaseSelector() {
        return 'p';
    };

    AbstractConfig.prototype.getCorrectionIdPrefix = function getCorrectionIdPrefix() {
        return 'opt';
    };

    AbstractConfig.prototype.getWrapperAttributes = function getWrapperAttributes() {
        return {};
    };

    AbstractConfig.prototype.getCorrectionIdAttribute = function getCorrectionIdAttribute() {
        return 'name';
    };

    AbstractConfig.prototype.getOrderingArray = function getOrderingArray() {
        return ['delete'];
    };

    return AbstractConfig;
});
