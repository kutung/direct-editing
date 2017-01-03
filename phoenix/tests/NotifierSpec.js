define(['scripts/Notifier', 'scripts/EventBus'], function (Notifier, EB) {
    describe('Notifier suite', function() {
        beforeEach(function () {
            spyOn(EB, 'publish');
            spyOn(EB, 'subscribe');
            spyOn(EB, 'unsubscribe');
        });

        it('Class must be defined', function () {
            expect(Notifier).toBeDefined();
        });

        it('Must have public methods defined', function () {
            var publicMethods = ['success', 'error', 'info',
            'warning', 'destroy'],
             NotifierPrototype = Notifier.prototype;

            publicMethods.forEach(function eachMethod(method) {
                  expect(NotifierPrototype[method]).toBeDefined();
            });
        });

        it('Must create div based on user given position', function(){
            var notifier,
                positions = ['top-right', 'top-left', 'bottom-right', 'bottom-left'];
            positions.forEach(function eachMethod(method) {
                notifier = new Notifier(window, document, EB, {'position': method});
                pos = method.split('-');
                expect(document.querySelectorAll(
                    '.notifier-' + pos[0] + '.notifier-' + pos[1]
                    ).length
                ).toEqual(1);
                notifier.destroy();
             });
        });

        it('Must add notification div with corresponding class ', function () {
            var notifier, publicMethods = ['success', 'error', 'info', 'warning'];

            publicMethods.forEach(function eachMethod(method) {
                  notifier = new Notifier(window, document, EB);
                  notifier[method]('sample');
                  expect(document.querySelectorAll(
                    '.notifier-' + method
                    ).length
                ).toEqual(1);
                notifier.destroy();
            });
        });

        it('Must dismiss all when we pass dismiss true', function () {
            notifier = new Notifier(window, document, EB);
            notifier.error('sample1');
            notifier.error('sample2');
            notifier.error('sample3', {'delay': 0, 'dismiss': true});
            expect(document.querySelectorAll('.notifier-visible').length).toEqual(1);
            notifier.destroy();
        });

    });
});
