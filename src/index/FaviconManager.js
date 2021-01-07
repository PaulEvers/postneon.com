export default class FaviconAnimator {
    constructor() {
        this.characters = "pqstneqn";
    }
    changeFavicon(index) {
        let favoLinks = "pqstneqn";
        var link = document.createElement('link'),
            oldLink = document.getElementById('dynamic-favicon');
        link.id = 'dynamic-favicon';
        link.rel = 'shortcut icon';
        link.href = "http://www.post-neon.com/favicons/favicon_" + this.characters[index] + ".png";
        if (oldLink) document.head.removeChild(oldLink);
        document.head.appendChild(link);
        index = index++ % favoLinks.length;
        setTimeout(() => {
            this.changeFavicon(index);
        }, 5000)
    }
    init() {
        setTimeout(() => {
            this.changeFavicon(1);
        }, 5000);
    }
}