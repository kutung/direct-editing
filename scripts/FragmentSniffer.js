define(['scripts/Helper', 'scripts/Util'],
function FragmentSnifferLoader(Helper, Util) {
    var classArray = ['generatedText', 'title', 'copyEditorInsert',
            'copyEditorDelete', 'ellipsis', 'interReference',
            'interReferenceTitle', 'alternativeText'
        ],
        classMatchers = [
            '.optbold', '.optitalic', '.optsup', '.optsub', '.optinsert',
            '.optinsert', '.optcomment', '.optdel', '.optreject', '.optreplace',
            '.optsmallcaps', '.optmono', '.optdelreference'
        ],
        tagMatchers = ['div', 'table', 'th', 'td'],
        titleClass = Util.selectorToClass('title'),
        ellipsisClass = Util.selectorToClass('ellipsis'),
        interReferenceClass = Util.selectorToClass('interReference'),
        interReferenceTitleClass = Util.selectorToClass('interReferenceTitle'),
        copyEditorDeleteClass = Util.selectorToClass('copyEditorDelete'),
        copyEditorInsertClass = Util.selectorToClass('copyEditorInsert'),
        generatedTextClass = Util.selectorToClass('generatedText');

    function initializeVariables(instance) {
        instance.sniffedHash = null;
        instance.classesMatched = null;
        instance.tagsMatched = null;
        instance.results = [];
        instance.win = null;
        classMatchers = Util.selectorToArray(
            classArray, classMatchers
        );
    }

    function FragmentSniffer(win) {
        initializeVariables(this);
        this.win = win;
    }

    function getContextFromClassList(classList) {
        var list = [];

        if (classList.contains('optbold') === true) {
            list.push('onBold');
        }
        if (classList.contains('optitalic') === true) {
            list.push('onItalic');
        }
        if (classList.contains('optsup') === true) {
            list.push('onSuperscript');
        }
        if (classList.contains('optsub') === true) {
            list.push('onSubscript');
        }
        if (classList.contains('optinsert') === true) {
            list.push('onInsert');
        }
        if (classList.contains('optcomment') === true) {
            list.push('onInstruct');
        }
        if (classList.contains('optdel') === true) {
            list.push('onDelete');
        }
        if (classList.contains('optsmallcaps') === true) {
            list.push('onSmallcaps');
        }
        if (classList.contains('optmono') === true) {
            list.push('onMonospace');
        }
        if (classList.contains(titleClass) === true) {
            list.push('onTitle');
        }
        if (classList.contains(copyEditorInsertClass) === true) {
            list.push('onCpeInsert');
        }
        if (classList.contains(copyEditorDeleteClass) === true) {
            list.push('onCpeDel');
        }
        if (classList.contains('optreplace') === true) {
            list.push('onReplace');
        }
        if (classList.contains('optreject') === true) {
            list.push('onReject');
        }
        if (classList.contains(ellipsisClass) === true) {
            list.push('onEllipsis');
        }
        if (classList.contains(interReferenceTitleClass) === true) {
            list.push('onGenBank');
        }
        if (classList.contains('optdelreference') === true) {
            list.push('onDeleteReference');
        }
        return list;
    }

    function getContextFromTag(tagName) {
        tagName = tagName.toLowerCase();
        if (tagName === 'div') {
            return 'onParagraph';
        }
        if (tagName === 'table' || tagName === 'td' || tagName === 'th') {
            return 'onTablecell';
        }
        return null;
    }

    FragmentSniffer.prototype.getTagContext = function getTagContext(DOMFragment) {
        var tagsMatched, tagList, context, tagMathchLength,
            j = 0,
            sniffedHash = [];

        tagsMatched = DOMFragment.querySelectorAll(tagMatchers);
        tagMathchLength = tagsMatched.length;
        for (; j < tagMathchLength; j += 1) {
            tagList = tagsMatched[j].nodeName;
            context = getContextFromTag(tagList);
            if (context !== null && sniffedHash.indexOf(context) === -1) {
                sniffedHash.push(context);
            }
        }
        return sniffedHash;
    };

    FragmentSniffer.prototype.getContext = function getContext(domFragment) {
        var classList, context, tagList, notAllowed, relNode,
            i = 0,
            j = 0;

        if (domFragment instanceof this.win.DocumentFragment === false) {
            throw new Error('error.fragment_missing');
        }
        this.sniffedHash = [];
        //TODO: need to find a better way to handle ctrl+a selection
        notAllowed = domFragment.querySelectorAll('article, aside');
        if (notAllowed.length >= 1) {
            return ['onParagraph'];
        }

        this.classesMatched = domFragment.querySelectorAll(classMatchers);
        for (; i < this.classesMatched.length; i += 1) {
            classList = this.classesMatched[i].classList;
            relNode = this.classesMatched[i].hasAttribute('rel');
            context = getContextFromClassList(classList);
            this.sniffedHash = this.sniffedHash.concat(context);
        }
        this.tagsMatched = domFragment.querySelectorAll(tagMatchers);
        for (; j < this.tagsMatched.length; j += 1) {
            tagList = this.tagsMatched[j].nodeName;
            context = getContextFromTag(tagList);
            if (context !== null && this.sniffedHash.indexOf(context) === -1) {
                this.sniffedHash.push(context);
            }
        }

        if (this.sniffedHash.indexOf('onDelete') !== -1) {
            if (this.sniffedHash.indexOf('onReplace') === -1 &&
                this.sniffedHash.indexOf('onInstruct') === -1
            ) {
                this.sniffedHash = [];
                this.sniffedHash.push('onDelete');
            }
        }
        if (this.sniffedHash.indexOf('onDeleteReference') !== -1 &&
            this.sniffedHash.length > 1) {
            this.sniffedHash = [];
            this.sniffedHash.push('onDeleteReference');
        }

        if (domFragment.childNodes.length > 1) {
            this.sniffedHash.push('hasChild');
        }

        if (relNode === true) {
            this.sniffedHash.push('onGenBank');
        }

        if (this.sniffedHash.indexOf('onCpeDel') !== -1 &&
            this.sniffedHash.indexOf('onCpeInsert') !== -1
        ) {
            this.sniffedHash.push('onCpeReplace');
        }

        if (this.sniffedHash.indexOf('onCpeDel') !== -1 &&
            this.sniffedHash.indexOf('onReject') !== -1 &&
            this.sniffedHash.indexOf('onCpeReplace') === -1
        ) {
            this.sniffedHash.push('onCpeDelonReject');
        }

        if (this.sniffedHash.indexOf('onCpeInsert') !== -1 &&
            this.sniffedHash.indexOf('onReject') !== -1 &&
            this.sniffedHash.indexOf('onCpeReplace') === -1
        ) {
            this.sniffedHash.push('onCpeInsertonReject');
        }

        if (this.sniffedHash.indexOf('onEllipsis') !== -1) {
            if (this.sniffedHash.indexOf('onGeneratedContent') === -1) {
                this.sniffedHash = Helper.removeValFromArray(
                    this.sniffedHash, 'onEllipsis'
                );
            }
        }

        if (this.sniffedHash.indexOf('onReplace') !== -1 &&
            this.sniffedHash.indexOf('onCpeReplace') !== -1
        ) {
            this.sniffedHash = Helper.removeValFromArray(
                this.sniffedHash, 'onCpeReplace'
            );
            this.sniffedHash = Helper.removeValFromArray(
                this.sniffedHash, 'onCpeDel'
            );
            this.sniffedHash = Helper.removeValFromArray(
                this.sniffedHash, 'onCpeInsert'
            );
        }

        this.sniffedHash = Helper.uniqueArray(this.sniffedHash);
        return this.sniffedHash;
    };

    FragmentSniffer.prototype.destroy = function destroy() {
        initializeVariables(this);
    };

    return FragmentSniffer;
});
