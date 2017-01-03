define([], function NormalizerLoader() {
    var emptyNodeToIgnore = ['img', 'b', 'i', 'sub', 'sup'],
        classesNotToMerge = ['pc_cpereplace', 'optcomment', 'optreplace'];

    function initializeVariables(instance) {
    }

    function Normalizer() {
        initializeVariables(this);
    }

    function hasIdenticalClasses(prevClass, currClass) {
        var re, prevClasses, currClasses, len,
            i = 0;

        if (prevClass === null || currClass === null) {
            return false;
        }
        re = /\s+/;
        prevClasses = prevClass.split(re);
        currClasses = currClass.split(re);

        if (prevClasses.length !== currClasses.length) {
            return false;
        }

        prevClasses = prevClasses.sort();
        currClasses = currClasses.sort();
        len = prevClasses.length;

        for (; i < len; i += 1) {
            if (prevClasses[i] !== currClasses[i] ||
                classesNotToMerge.indexOf(currClasses[i]) !== -1
            ) {
                return false;
            }
        }

        return true;
    }

    function mergeNodes(node1, node2) {
        var firstChildOfNode2 = node2.firstChild;

        while (firstChildOfNode2 !== null) {
            node1.appendChild(firstChildOfNode2);
            firstChildOfNode2 = node2.firstChild;
        }
        node1.normalize();
        node2.parentNode.removeChild(node2);

        return node1;
    }

    Normalizer.prototype.normalize = function normalize(node) {
        var prevNode = null, currNode = node.firstChild, hasSameClass = false,
            classes = '', name = '', tmpNode, tagname,
            areSameKindOfNodes = function (prev, curr) {
                var hasSameClass = false;

                if (prev === null) {
                    return false;
                }
                if (prev.nodeType !== 1 || curr.nodeType !== 1) {
                    return false;
                }
                if (prev.nodeName !== curr.nodeName) {
                    return false;
                }

                return hasIdenticalClasses(
                    prev.getAttribute('class'),
                    curr.getAttribute('class')
                );
            };

        while (currNode !== null) {
            if (currNode.nodeType === Node.ELEMENT_NODE) {
                classes = currNode.getAttribute('class');
                name = currNode.getAttribute('name');
                if (classes === null) {
                    classes = '';
                }
                if (name === null) {
                    name = '';
                }
                classes = classes.replace(/^\s+|\s+$/g, '');
                name = name.replace(/^\s+|\s+$/g, '');
                tagname = currNode.tagName.toLowerCase();
                if (classes === '' && name === '' &&
                    emptyNodeToIgnore.indexOf(tagname) === -1) {
                    tmpNode = currNode;
                    if (tmpNode.tagName.toLowerCase() === 'img') {
                        currNode = tmpNode.nextSibling;
                        continue;
                    }
                    tmpNode.insertAdjacentHTML('afterEnd', tmpNode.innerHTML);
                    currNode = tmpNode.nextSibling;
                    tmpNode.parentNode.removeChild(tmpNode);
                }
            }

            if (prevNode !== null && prevNode.tagName === currNode.tagName) {
                if (areSameKindOfNodes(prevNode, currNode) === true) {
                    mergeNodes(prevNode, currNode);
                    currNode = prevNode;
                    prevNode = prevNode.previousSibling;
                }
            }

            prevNode = currNode;
            currNode = currNode.nextSibling;
        }

        node.normalize();

        return node;
    };

    return Normalizer;
});
