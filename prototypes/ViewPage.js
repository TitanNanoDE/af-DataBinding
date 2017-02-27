import ViewController from './ViewController';

const ViewPage = {

    route: null,

    _awaitTransitionEnd(element) {
        const promise = new Promise(done => element.addEventListener('tranistionend', function callback() {
            element.removeEventListener(callback);

            done();
        }));

        return promise;
    },

    isActive: false,

    animatePageIntoView(element) {
        const promise = this._awaitTransitionEnd(element);

        element.classList.add('movePageIn');

        return promise;
    },

    animatePageOutOfView(element) {
        const promise = this._awaitTransitionEnd();

        element.classList.remove('movePageIn');

        return promise;
    },

    __proto__: ViewController,
};

// add styles to the document
const styleELemen = document.createElement('style');

styleELemen.innerHTML = `
    [page] {
        transition: transform .3s ease-out;
    }

    [page]:not(.movePageIn) {
        transition: transform .3s ease-in;
        transform: translate3d(-100%, 0, 0);
    }
`;

document.body.appendChild(styleELemen);

export default ViewPage;
export { ViewPage };
