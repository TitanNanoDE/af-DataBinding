import ViewController from './ViewController';
import { RenderEngine } from 'application-frame/rendering';

const ViewPage = {

    route: null,

    _awaitTransitionEnd(element) {
        const promise = new Promise(done => element.addEventListener('transitionend', function callback() {
            element.removeEventListener('transitionend', callback);

            done();
        }));

        return promise;
    },

    isActive: false,

    _forceVisible: false,

    get isVisible() {
        return this.isActive || this._forceVisible;
    },

    animateSlideIn(element) {
        const promise = this._awaitTransitionEnd(element);

	this._forceVisible = true;

        RenderEngine.scheduleRenderTask(() => {
            element.classList.add('movePageIn');
        });

        return promise;
    },

    animateSlideOut(element) {

        if (!element.classList.contains('movePageIn')) {
            return true;
        }

        const promise = this._awaitTransitionEnd(element)
            .then(() => {
                this._forceVisible = false;
                this.scope.__apply__();
            });

        // make sure the page stays visible until we are done.
        this._forceVisible = true;
        this.scope.__apply__();

        RenderEngine.schedulePostRenderTask(() => {
            element.classList.remove('movePageIn');
        });

        return promise;
    },

    __proto__: ViewController,
};

// add styles to the document
const styleELemen = document.createElement('style');

styleELemen.innerHTML = `
    [slide-page] {
        transition: transform .3s ease-out;
    }

    [slide-page]:not(.movePageIn) {
        transition: transform .3s ease-in;
        transform: translate3d(100%, 0, 0);
    }
`;

document.body.appendChild(styleELemen);

export default ViewPage;
export { ViewPage };
