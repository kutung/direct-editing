define(['scripts/Helper'], function tableCharAlignLoader(Helper) {
    function TableCharAlign(win, doc) {
        this.win = win;
        this.doc = doc;
    }

    function wrapCharWithSpan(node, doc) {
        var textNode, value, index, span, charNode, parent,
            char = node.char,
            paddingLeft = node.cell.dataset.paddingLeft,
            treeWalker = doc.createTreeWalker(
                node.cell, NodeFilter.SHOW_ALL, null, false
            );

        while (treeWalker.nextNode() !== null) {
            if (treeWalker.currentNode.nodeType === Node.TEXT_NODE) {
                value = treeWalker.currentNode.nodeValue;
                index = value.indexOf(char);
                if (index !== -1) {
                    textNode = treeWalker.currentNode;
                    break;
                }
            }
        }

        if (Helper.isUndefined(index) === true) {
            return;
        }

        if (index === -1) {
            return;
        }

        // Split the text so that the char is in its own textnode
        textNode.splitText(index);
        textNode.nextSibling.splitText(1);
        charNode = textNode.nextSibling;
        span = doc.createElement('span');
        span.innerHTML = charNode.nodeValue;
        parent = charNode.parentNode;
        parent.insertBefore(span, charNode);
        parent.removeChild(charNode);
        if (paddingLeft !== null) {
            node.cell.style.paddingLeft = paddingLeft;
        }
        node.charOffset = span.offsetLeft;
        node.charNode = span;
    }

    function removeNodeAndPreserveContent(node, doc) {
        var parent, textNode;

        if (node === null) {
            return;
        }
        parent = node.parentNode;
        textNode = doc.createTextNode(node.innerHTML);
        parent.insertBefore(textNode, node);
        parent.removeChild(node);
        parent.normalize();
    }

    TableCharAlign.prototype.align = function alignFn(table) {
        var i = 0,
            rLen = table.rows.length,
            alignCols = {},
            k = 0,
            j = 0,
            colCount = 0,
            rowSpans = [],
            cell, cLen, cells, align, char, col, row, tempTd,
            compStyle, maxOffset, minOffset, offsetDiff, colspan,
            rowspan, position, dataset;

        if (rLen > 0) {
            colCount = table.rows[0].cells.length;
        }

        if (colCount === 0) {
            return;
        }

        // Split columns with colspan
        for (; i < rLen; i += 1) {
            colCount = table.rows[i].cells.length;
            for (j = 0; j < colCount; j += 1) {
                cell = table.rows[i].cells[j];
                colspan = cell.getAttribute('colspan');
                rowspan = cell.getAttribute('rowspan');
                if (rowspan !== null) {
                    cell.dataset.rowspan = rowspan;
                    cell.removeAttribute('rowspan');
                    rowSpans.push({'row': i, 'col': j});
                }
                if (colspan !== null) {
                    colspan = parseInt(colspan, 10);
                    cell.dataset.colspan = colspan;
                    cell.removeAttribute('colspan');
                    for (k = 0; k < colspan - 1; k += 1) {
                        tempTd = this.doc.createElement('td');
                        tempTd.dataset.remove = 'true';
                        cell.parentNode.insertBefore(tempTd, cell.nextSibling);
                    }
                }
            }
        }

        // Split rows with rowspan
        i = 0; j = 0; k = 0;
        if (rowSpans.length > 0) {
            for (i = 0; i < rowSpans.length; i += 1) {
                position = rowSpans[i];
                cell = table.rows[position.row].cells[position.col];
                rowspan = parseInt(cell.dataset.rowspan, 10);
                colspan = parseInt(cell.dataset.colspan, 10);
                for (j = 1; j < rowspan; j += 1) {
                    cell = table.rows[position.row + j].cells[position.col];
                    if (typeof colspan === 'undefined') {
                        colspan = 1;
                    }
                    for (k = 0; k < colspan; k += 1) {
                        tempTd = this.doc.createElement('td');
                        tempTd.dataset.remove = 'true';
                        cell.parentNode.insertBefore(tempTd, cell);
                    }
                }
            }
        }

        i = 0;
        j = 0;
        for (; i < colCount; i += 1) {
            for (j = 0; j < rLen; j += 1) {
                row = table.rows[j];
                if (i in row.cells !== true) {
                    continue;
                }
                cell = table.rows[j].cells[i];
                align = cell.getAttribute('align');
                char = cell.getAttribute('char');
                if (align !== null && align.toLowerCase() === 'char' &&
                    char !== null
                ) {
                    compStyle = this.win.getComputedStyle(cell);
                    cell.dataset.paddingLeft = compStyle.paddingLeft;
                    if (alignCols.hasOwnProperty(i) === false) {
                        alignCols[i] = {
                            'cells': [], 'maxOffset': -1, 'minOffset': -1
                        };
                    }
                    cell.normalize();
                    alignCols[i].cells.push({
                        'cell': cell, 'charOffset': -1, 'charNode': null,
                        'char': char
                    });
                }
            }
        }

        for (col in alignCols) {
            if (alignCols.hasOwnProperty(col) === true) {
                cells = alignCols[col].cells;
                cLen = cells.length;
                for (i = 0; i < cLen; i += 1) {
                    wrapCharWithSpan(
                        cells[i], this.doc, this.win
                    );
                    if (alignCols[col].maxOffset === -1 && alignCols[col].minOffset === -1) {
                        alignCols[col].maxOffset = cells[i].charOffset;
                        alignCols[col].minOffset = cells[i].charOffset;
                    }
                    if (cells[i].charOffset > alignCols[col].maxOffset) {
                        alignCols[col].maxOffset = cells[i].charOffset;
                    }
                    if (cells[i].charOffset < alignCols[col].minOffset) {
                        alignCols[col].minOffset = cells[i].charOffset;
                    }
                }
            }
        }

        for (col in alignCols) {
            if (alignCols.hasOwnProperty(col) === true) {
                cells = alignCols[col].cells;
                maxOffset = alignCols[col].maxOffset;
                minOffset = alignCols[col].minOffset;
                cLen = cells.length;
                for (i = 0; i < cLen; i += 1) {
                    if (maxOffset === minOffset) {
                        removeNodeAndPreserveContent(cells[i].charNode, this.doc);
                        continue;
                    }
                    offsetDiff = maxOffset - cells[i].charOffset;
                    cells[i].cell.style.paddingLeft = offsetDiff + 'px';
                    removeNodeAndPreserveContent(cells[i].charNode, this.doc);
                }
            }
        }

        // Remove tempTds and update rowspan and colspan
        for (i = 0; i < rLen; i += 1) {
            colCount = table.rows[i].cells.length;
            for (j = colCount - 1; j >= 0; j -= 1) {
                cell = table.rows[i].cells[j];
                dataset = cell.dataset;
                rowspan = dataset.rowspan;
                if (typeof rowspan !== 'undefined') {
                    cell.removeAttribute('data-rowspan');
                    cell.setAttribute('rowspan', rowspan);
                }
                colspan = dataset.colspan;
                if (typeof colspan !== 'undefined') {
                    cell.removeAttribute('data-colspan');
                    cell.setAttribute('colspan', colspan);
                }

                if (dataset.remove === 'true') {
                    cell.parentNode.removeChild(cell);
                }
            }
        }
    };

    TableCharAlign.prototype.alignAndReplaceTable = function alignAndReplaceTableFn(
        table
    ) {
        var cloneTable;

        if (table instanceof this.win.HTMLTableElement === false) {
            return;
        }
        cloneTable = table.cloneNode(true);
        try {
            this.align(table);
        }
        catch (e) {
            table.parentNode.insertBefore(cloneTable, table);
            table.parentNode.removeChild(table);
        }
    };

    return TableCharAlign;
});
