define(['scripts/libs/random-color'], function SvgLineLoader(randomColor) {
    'use strict';

    var svgLineTemplate = [
        '<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">',
            '<defs>',
                '<marker id="markerCircle" markerWidth="8" markerHeight="8" refX="5" refY="5">',
                    '<circle cx="5" cy="5" r="3" style="stroke: none; fill:#000000;"/>',
                '</marker>',
                '<marker id="markerArrow" markerWidth="13" markerHeight="13" refX="2" refY="6"',
                    'orient="auto">',
                    '<path d="M2,2 L2,11 L10,6 L2,2" style="fill: #000000;"/>',
                '</marker>',
            '</defs>',
            '<path d="{d}" style="stroke: {strokeColor}; stroke-width: {strokeWidth}; fill: none;',
                'marker-start: url(#markerCircle); marker-end: url(#markerArrow);"/>',
        '</svg>'
    ];

    function initVariables(instance) {
        var obj = instance;

        Object.defineProperty(obj, 'win', {
            'value': null,
            'writable': true
        });
        Object.defineProperty(obj, 'doc', {
            'value': null,
            'writable': true
        });
        Object.defineProperty(obj, 'svg', {
            'value': null,
            'writable': true
        });
        Object.defineProperty(obj, 'strokeWidth', {
            'value': '1px',
            'writable': false
        });
        Object.defineProperty(obj, 'strokeColor', {
            'value': randomColor({'luminosity': 'bright', 'format': 'rgb', 'hue': 'random'}),
            'writable': true
        });
        Object.defineProperty(obj, 'breakLineAtX', {
            'value': 40,
            'writable': true
        });
    }

    function SvgLine(win, doc) {
        initVariables(this);
        this.win = win;
        this.doc = doc;
    }

    function leftToRightAndDown(from, to, breakLineAtX) {
        var width, height, dVal, boxLeft = from.x, boxTop = from.y;

        width = to.x - from.x;
        height = (to.y - from.y) + 10;
        height = height > 10 ? height : 8;
        width = width > 18 ? width : 18;

        dVal = 'M0,5 L' + breakLineAtX + ',5';
        dVal += ' L' + breakLineAtX + ',' + (height - 4);
        dVal += ' L' + (width - 18) + ',' + (height - 4);
        dVal += ' L' + (width - 8) + ',' + (height - 6);

        return {
            'dVal': dVal,
            'width': width,
            'height': height,
            'boxLeft': boxLeft,
            'boxTop': boxTop
        };
    }

    function leftToRightAndUp(from, to, breakLineAtX) {
        var width, height, dVal, boxLeft = from.x, boxTop = from.y;

        width = to.x - from.x;
        height = from.y - to.y;
        boxTop -= height;
        width = width > 18 ? width : 18;

        dVal = 'M0,' + (height - 5) + ' L' + breakLineAtX + ',' + (height - 5);
        dVal += ' L' + breakLineAtX + ',8';
        dVal += ' L' + (width - 15) + ',8';
        dVal += ' L' + (width - 7) + ',4';

        height = height > 10 ? height : 10;
        return {
            'dVal': dVal,
            'width': width,
            'height': height,
            'boxLeft': boxLeft,
            'boxTop': boxTop
        };
    }

    function leftToRight(from, to) {
        var width, height, dVal, distanceX, boxLeft = from.x, boxTop = from.y;

        width = to.x - from.x;
        distanceX = width - 8;
        height = Math.abs(from.y - to.y);
        height = height > 10 ? height : 10;
        width = width > 18 ? width : 18;
        dVal = 'M0,5 L' + distanceX + ',5';

        return {
            'dVal': dVal,
            'width': width,
            'height': height,
            'boxLeft': boxLeft,
            'boxTop': boxTop
        };
    }

    function rectOverlaps(from, to, scrollX, scrollY) {
        var result = true;

        result = to.left > from.right || to.right < from.left;
        result = result || to.top + scrollY > from.bottom + scrollY || to.bottom + scrollY < from.top + scrollY;

        return !result;
    }

    function getClosestCorner(from, to, scrollX, scrollY) {
        var fromX = (from.left + scrollX), fromY = (from.top + scrollY + (from.height / 2)),
            d1, d2, d3, d4, closest;

        // distance from 'from' to top-left-corner of 'to'
        d1 = Math.sqrt(
            Math.pow(((fromX + scrollX) - to.left), 2) + Math.pow(((fromY + scrollY) - to.top), 2)
        );
        // distance from 'from' to bottom-left-corner of 'to'
        d2 = Math.sqrt(
            Math.pow(((fromX + scrollX) - to.left), 2) +
            Math.pow(((fromY + scrollY) - to.bottom), 2)
        );
        // distance from 'from' to top-right-corner of 'to'
        d3 = Math.sqrt(
            Math.pow(((fromX + scrollX) - to.right), 2) + Math.pow(((fromY + scrollY) - to.top), 2)
        );
        // distance from 'from' to bottom-right-corner of 'to'
        d4 = Math.sqrt(
            Math.pow(((fromX + scrollX) - to.right), 2) +
            Math.pow(((fromY + scrollY) - to.bottom), 2)
        );

        closest = Math.min(d1, d2, d3, d4);

        if (closest === d1) {
            return {'x': (to.left + scrollX), 'y': (to.top + scrollY)};
        }
        /* istanbul ignore else */
        else if (closest === d2) {
            return {'x': (to.left + scrollX), 'y': (to.bottom + scrollY)};
        }
        else if (closest === d3) {
            return {'x': (to.right + scrollX), 'y': (to.top + scrollY)};
        }

        return {'x': (to.right + scrollX), 'y': (to.bottom + scrollY)};
    }

    SvgLine.prototype.connect = function connect(from, to, scrollX, scrollY) {
        var svg, frag, path, lineData, closestCorner, lineFrom;

        if (rectOverlaps(from, to, scrollX, scrollY) === true) {
            return;
        }

        closestCorner = getClosestCorner(from, to, scrollX, scrollY);
        lineFrom = {'x': (from.right + scrollX), 'y': (from.top + scrollY + (from.height / 2))};

        if (lineFrom.x < closestCorner.x && lineFrom.y === closestCorner.y) {
            lineData = leftToRight(lineFrom, closestCorner);
        }
        else if (lineFrom.x < closestCorner.x && lineFrom.y < closestCorner.y) {
            lineData = leftToRightAndDown(lineFrom, closestCorner, this.breakLineAtX);
        }
        /* istanbul ignore else */
        else if (lineFrom.x < closestCorner.x && lineFrom.y > closestCorner.y) {
            lineData = leftToRightAndUp(lineFrom, closestCorner, this.breakLineAtX);
        }

        /* istanbul ignore else */
        if (this.svg === null) {
            svg = svgLineTemplate.join('');
            svg = svg.replace('{strokeColor}', this.strokeColor);
            svg = svg.replace('{strokeWidth}', this.strokeWidth);
            svg = svg.replace('{width}', lineData.width);
            svg = svg.replace('{height}', lineData.height);
            svg = svg.replace('{d}', lineData.dVal);

            frag = this.doc.createElement('div');
            frag.innerHTML = svg;
            this.svg = frag.firstElementChild;
        }
        else {
            path = this.svg.querySelector('path');
            path.setAttribute('d', lineData.dVal);
            this.svg.setAttribute('width', lineData.width);
            this.svg.setAttribute('height', lineData.height);
        }

        this.svg.style.position = 'absolute';
        this.svg.style.top = lineData.boxTop + 'px';
        this.svg.style.left = lineData.boxLeft + 'px';
        this.svg.style.zIndex = '-3';
    };

    SvgLine.prototype.renderTo = function renderTo(elem) {
        elem.appendChild(this.svg);
    };

    SvgLine.prototype.destroy = function destroy() {
        this.svg.parentNode.removeChild(this.svg);
        initVariables(this);
    };

    return SvgLine;
});
