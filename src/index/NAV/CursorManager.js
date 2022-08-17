import RayCastManager from "../3D/RayCastManager.js";

export default class CursorManager {
  constructor({ app }) {
    this.app = app;

    this._ray = new RayCastManager();

    this.DOM = {
      projectTitle: document.querySelector(".project-title"),
      buttons: {
        back: document.querySelector(".back-button"),
      },
      scroll: document.querySelector(".scroll-container"),
    };

    this.__ = {
      vector: new THREE.Vector2(),
      hideTitle: null,
      cursor: {
        temp: { x: null, y: null },
        now: { x: null, y: null },
        timestamp: null,
        isDragging: false,
      },
    };

    this.init();
  }

  init() {
    if (!this.app.__.isMobile) {
      window.addEventListener("mousemove", this.onCursorMove.bind(this), false);
      this.DOM.scroll.addEventListener(
        "mousedown",
        this.onCursorDown.bind(this),
        false
      );
      this.DOM.scroll.addEventListener(
        "mouseup",
        this.onCursorUp.bind(this),
        false
      );
      window.addEventListener("mouseout", () => {
        this.app._gui.hideCursor();
      });
    } else {
      this.DOM.scroll.addEventListener(
        "touchstart",
        this.onCursorDown.bind(this),
        false
      );
      window.addEventListener("touchmove", this.onCursorMove.bind(this), false);
      this.DOM.scroll.addEventListener(
        "touchend",
        this.onCursorUp.bind(this),
        false
      );
    }
  }

  getCursorPosition(event) {
    if (!!event.touches) {
      return { x: event.touches[0].clientX, y: event.touches[0].clientY };
    } else {
      return { x: event.clientX, y: event.clientY };
    }
  }

  getCursorArray() {
    return [
      this.__.cursor.now.x / window.innerWidth,
      this.__.cursor.now.y / window.innerHeight,
    ];
  }

  onCursorDown(event) {
    if (this.app.__.infoMode) return;
    if (!!this.__.focusBack) {
      clearTimeout(this.__.focusBack);
      this.__.focusBack = false;
    }
    // document.querySelector('.log').innerHTML = JSON.stringify(event.target.classList) + performance.now();

    // console.log('isdragging');
    // document.querySelector('.log').innerHTML = performance.now();
    this.__.cursor.isDragging = true;
    this.__.cursor.now = this.getCursorPosition(event);
    this.__.cursor.timestamp = performance.now();
    this.__.cursor.start = this.__.cursor.now;
  }

  onCursorMove(event) {
    this.__.cursor.temp = this.getCursorPosition(event);
    this.app._gui.setCursorPosition(
      this.__.cursor.temp.x,
      this.__.cursor.temp.y
    );
    this.app._gui.showCursor();

    if (!this.app.__.menu.isOpen) {
      this.hoverProject();
    } else {
      this.app._gui.setCursorMode("pointer");
    }

    if (
      this.__.cursor.isDragging &&
      this.__.cursor.temp.x &&
      this.app.__.menu.isOpen
    ) {
      // alert('drag');
      this.dragMenu(this.__.cursor.temp);
    }

    if (this.app.__.infoMode) {
      if (event.target.classList.contains("scroll-content")) {
        this.DOM.buttons.back.classList.add("active");
        this.app._gui.setCursorMode("cross");
      } else {
        this.DOM.buttons.back.classList.remove("active");
        this.app._gui.setCursorMode("pointer");
      }
    }
    this.__.cursor.now = this.__.cursor.temp;
  }

  s_event(type, data) {
    return new CustomEvent("click", { detail: { type: type, ...data } });
  }

  onCursorUp(event) {
    if (!this.__.cursor.isDragging) return;

    this.__.cursor.isDragging = false;
    this.__.intersection = this.getIntersects();

    clearTimeout(this.__.hideTitle);

    let toMenu = true;

    if (this.app.__.menu.isOpen) {
      if (
        Math.abs(this.__.cursor.timestamp - performance.now()) < 200 &&
        !!this.__.intersection
      ) {
        this.__.intersection.userData.project.click(this.__.cursor.now.x);
        toMenu = false;
      }
    } else {
      if (
        this.app.__.orientation === "landscape" &&
        Math.abs(this.__.cursor.start.x - this.__.cursor.now.x) > 75
      ) {
        let direction = this.__.cursor.start.x > this.__.cursor.now.x ? -1 : 1;
        this.app._interaction.scrollToNextProject(direction * -1);
        toMenu = false;
      } else if (
        this.app.__.orientation === "portrait" &&
        Math.abs(this.__.cursor.start.y - this.__.cursor.now.y) > 75
      ) {
        let direction = this.__.cursor.start.y > this.__.cursor.now.y ? -1 : 1;
        this.app._interaction.scrollToNextProject(direction * -1);
        toMenu = false;
      } else if (
        Math.abs(this.__.cursor.timestamp - performance.now()) < 200 &&
        !!this.__.intersection
      ) {
        this.__.intersection.userData.project.click(this.__.cursor.now.x);
        toMenu = false;
      }
    }

    if (!this.__.intersection && toMenu) {
      if (!this.app.__.menu.isOpen) this.app._three.tweenToMenu();
      return;
    }

    this.__.cursor.start = this.__.cursor.now;
  }

  getIntersects() {
    let cursorArray = this.getCursorArray();
    if (!cursorArray) return;
    this.__.vector.fromArray(cursorArray);
    let intersections = this._ray.getIntersects(
      this.app._three._3d.camera,
      this.__.vector,
      this.app._three._3d.collisions
    );
    if (intersections.length > 0) {
      return intersections[0].object;
    } else {
      return false;
    }
  }

  hoverMenu() {
    if (this.app._tween.__.isTweening || this.__.cursor.isDragging) return;

    this.__.intersection = this.getIntersects();
    if (this.__.intersection) {
      this.app._gui.setProjectTitle(
        this.__.intersection.userData.project.__.name
      );
      return;
    }

    this.app._gui.hideProjectTitle();
  }

  hoverProject() {
    if (this.app._tween.__.isTweening) return;
    this.__.intersection = this.getIntersects();
    if (this.__.intersection) {
      this.__.intersection.userData.project.hover(this.__.cursor.now.x);
      return;
    }
    if (!this.app._gui.__.isHovering) this.app._gui.setCursorMode("cross");
    else this.app._gui.setCursorMode("pointer");
  }

  dragMenu(cursor) {
    this.__.hideTitle = setTimeout(() => {
      this.DOM.projectTitle.classList.add("hidden");
    }, 250);

    let delta;

    if (this.app.__.orientation === "landscape") {
      delta = this.__.cursor.now.x - cursor.x;
      this.app.__.menu.lerpTo += delta / -5000;
    } else {
      delta = this.__.cursor.now.y - cursor.y;
      this.app.__.menu.lerpTo += delta / -5000;
    }
    this.app.__.menu.direction = delta < 0 ? 1 : -1;

    this.__.cursor.isDragging = true;
  }
}
