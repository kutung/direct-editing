(function beaconPolyfill() {
    'use strict';

    if (!('sendBeacon' in navigator)) {
        navigator.sendBeacon = function sendBeacon(url, data) {
            var xhr = new XMLHttpRequest();

            xhr.open('POST', url, false);
            xhr.setRequestHeader('Accept', '*/*');
            if (typeof data === 'string') {
                xhr.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8');
                xhr.responseType = 'text/plain';
            }
            else if (Object.prototype.toString.call(data) === '[object Blob]') {
                if (data.type) {
                    xhr.setRequestHeader('Content-Type', data.type);
                }
            }
            xhr.send(data);

            return true;
        };
    }
})();
