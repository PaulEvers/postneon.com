import normalizeWheel from 'normalize-wheel'

export default class ScrollValidator {
    constructor({ app }) {
        this.app = app;
        this.state = {
            lastWheel: null,
            sumDeltay: 0,
            lastFalse: 1000,
            lastDidScrollUp: null,
            direction: null,
            now: null,
            skipAveraging: false,
            averageScroll: null,
            peak: {
                value: null,
                timestamp: null,
                safeSpan: 750
            }
        }
    }

    setAverageScroll(deltaY) {
        if (!this.state.lastWheel) {
            this.state.lastWheel = this.state.now;
            return;
        }

        this.deltaTime = this.state.now - this.state.lastWheel;
        if (this.deltaTime > 500) {
            this.state.lastWheel = this.state.now;
            this.state.peak.value = 0;
        } else
            if (this.deltaTime > 25) {
                this.state.averageScroll = Math.abs(this.state.sumDeltaY) / this.deltaTime;
                this.state.sumDeltaY = 0;
                this.state.lastWheel = this.state.now;
            }
            else {
                this.state.sumDeltaY += deltaY;
            }

    }
    getPeak(deltaY) {
        if (this.state.peak.timestamp) {
            if ((performance.now() - this.state.peak.timestamp) > this.state.peak.safeSpan) {
                this.state.peak.timestamp = performance.now();
                this.state.peak.value = deltaY;

            }
        } else {
            this.state.peak.timestamp = performance.now();
        }
        if (Math.abs(this.state.peak.value) < Math.abs(deltaY)) {
            this.state.peak.value = deltaY;
            this.state.peak.timestamp = performance.now();
            return true
        }

    }
    detect(event) {

        if (this.app.state.about.isOpen)
            return false;

        const normalized = normalizeWheel(event);
        this.state.now = performance.now();


        this.state.direction = event.deltaY > 0;

        this.state.lastDirection = this.state.direction;


        let realScroll = Math.abs(normalized.pixelY) > 5;

        return { success: realScroll, y: normalized.pixelY };
    }
}