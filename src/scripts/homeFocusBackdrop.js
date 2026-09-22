import layoutManager from '../components/layoutManager';

// Android TV style: the focused home card's artwork becomes a blurred backdrop.
//
// This intentionally does NOT use setBackdropImages() from components/backdrop/backdrop.js.
// That system is built for slow (~10s) rotation: each call schedules a delayed
// cleanup of the previously-shown image 1600ms later. Home focus changes can
// fire many times per second while navigating with a remote, and a stale
// cleanup timer from an earlier focus can delete the still-displayed image
// before the new one has finished loading, flashing black. Instead we own a
// single persistent element and just swap its background-image directly, so
// the browser keeps painting the old image until the new one is decoded.
function getCardImage(card) {
    const img = card.querySelector('.cardImageContainer');
    if (!img) return null;
    const bg = img.style.backgroundImage || '';
    const m = /url\(["']?(.*?)["']?\)/.exec(bg);
    return m ? m[1] : null;
}

function getBackdropElem() {
    const container = document.querySelector('.backdropContainer');
    if (!container) return null;

    let elem = container.querySelector('.lumafinHomeBackdropImg');
    if (!elem) {
        elem = document.createElement('div');
        elem.className = 'backdropImage lumafinHomeBackdropImg';
        container.appendChild(elem);
    }
    return elem;
}

document.addEventListener('focusin', (e) => {
    if (!layoutManager.tv) return;

    const target = e.target;
    if (!(target instanceof Element)) return;
    const card = target.closest('.card');
    if (!card || !card.closest('.homePage, .homeSectionsContainer')) return;

    const url = getCardImage(card);
    if (!url) return;

    const elem = getBackdropElem();
    if (!elem || elem.getAttribute('data-url') === url) return;

    elem.style.backgroundImage = `url('${url}')`;
    elem.setAttribute('data-url', url);
    document.body.classList.add('lumafin-home-backdrop');
});

window.addEventListener('viewshow', () => {
    if (document.querySelector('.homePage:not(.hide)')) return;

    document.body.classList.remove('lumafin-home-backdrop');
    const elem = document.querySelector('.lumafinHomeBackdropImg');
    if (elem) elem.remove();
});
