export class UrlManager {

    static protocol = window.location.protocol;
    static host = window.location.host;
    static pathname = window.location.pathname;

    static setSearchParams = (param, value) => {
        if (history.pushState) {
            const query = `${param}=${value}`;
            const newUrl = `${this.protocol}//${this.host}${this.pathname}?${query}`;
            window.history.pushState({ path: newUrl }, '' , newUrl);
        }
    }

    static removeParams = () => {
        if (history.pushState) {
            const newUrl = `${this.protocol}//${this.host}${this.pathname}`;
            window.history.pushState({ path: newUrl }, '' , newUrl);
        }
    }
}