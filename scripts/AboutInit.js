define(['scripts/Helper'], function AboutInitLoader(Helper) {
    var aboutTag = '#item-info';

    function AboutInit(Win, Doc, ArticleContainer) {
        this.win = Win;
        this.doc = Doc;
        this.articleContainer = ArticleContainer;
    }

    AboutInit.prototype.load = function load(aboutContainer, actorDateDetails) {
        var aboutTabWrapper, actorDetailKey, parentNode, spanNode,
            doc = this.doc,
            aboutNode = this.articleContainer.querySelector(aboutTag);

        if (Helper.isObject(actorDateDetails) === true) {
            aboutTabWrapper = doc.createElement('div');
            aboutTabWrapper.classList.add('submittedInfo');
            for (actorDetailKey in actorDateDetails) {
                if (actorDateDetails.hasOwnProperty(actorDetailKey) === true) {
                    parentNode = doc.createElement('div');
                    spanNode = doc.createElement('span');
                    spanNode.setAttribute('class', 'x');
                    spanNode.innerHTML = actorDetailKey;
                    parentNode.appendChild(spanNode);
                    parentNode.insertAdjacentHTML(
                        'beforeEnd', ': ' + actorDateDetails[actorDetailKey]
                    );
                    aboutTabWrapper.appendChild(parentNode);
                }
            }
            aboutNode.appendChild(aboutTabWrapper);
        }
        aboutContainer.appendChild(aboutNode.cloneNode(true));
    };

    return AboutInit;
});
