import { UrlManager } from "./UrlManager";

class CursorModes {
  DOM = document.querySelector(".cursor");
  set = (mode) => {

    switch (mode) {
      case "pointer":
        this.DOM.classList.remove("cross-on");
        this.DOM.classList.remove("pointer-left");
        this.DOM.classList.remove("pointer-right");
        break;
      case "cross":
        this.DOM.classList.add("cross-on");
        this.DOM.classList.remove("pointer-left");
        this.DOM.classList.remove("pointer-right");
        break;
      case "left":
        this.DOM.classList.remove("cross-on");
        this.DOM.classList.add("pointer-left");
        this.DOM.classList.remove("pointer-right");
        break;
      case "right":
        this.DOM.classList.remove("cross-on");
        this.DOM.classList.add("pointer-right");
        this.DOM.classList.remove("pointer-left");
        break;
    }
  };
}

class TopMenuMode {
  DOM = document.querySelector(".UI-container");
  set = (mode) => {
    switch (mode) {
      case "menu":
        this.DOM.classList.add("menu-mode");
        this.DOM.classList.remove("project-mode");
        this.DOM.classList.remove("info-mode");
        break;
      case "project":
        this.DOM.classList.remove("menu-mode");
        this.DOM.classList.add("project-mode");
        this.DOM.classList.remove("info-mode");
        break;
      case "info":
        this.DOM.classList.remove("menu-mode");
        this.DOM.classList.remove("project-mode");
        this.DOM.classList.add("info-mode");
        break;
    }
  };
}

class GUIManager {
  constructor({ app }) {
    this.app = app;

    this.__ = {
      cursorMode: new CursorModes(),
      topMenuMode: new TopMenuMode(),
      isHovering: false,
      cursor: {
        activated: false,
      },
      isMuted: false,
    };

    this.DOM = {
      cursor: document.querySelector(".cursor"),
      canvas: document.querySelector("#threejs"),
      UIContainer: document.querySelector(".UI-container"),
      buttons: {
        // about: document.querySelector(".about-button"),
        // contact: document.querySelector(".contact-button"),
        volume: document.querySelector(".volume-button"),
        // back: document.querySelector(".back-button"),
        // menu: document.querySelector(".menu-button"),
        // info: document.querySelector(".info-button"),
      },
      project: {
        length: document.querySelector(".project-length"),
        index: document.querySelector(".media-index"),
        title: document.querySelector(".project-title"),
      },
      about: document.querySelector(".about-container"),
      info: {
        container: document.querySelector(".info-container"),
        big: document.querySelector(".info-container").querySelector(".big"),
        small: document
          .querySelector(".info-container")
          .querySelector(".small"),
      },
    };
    this.init();
  }

  setCursorPosition = (x, y) => {
    this.DOM.cursor.style.transform = `translateX(${x}px) translateY(${y}px)`;
    if (!this.__.cursor.activated) {
      this.__.cursor.activated = true;
      setTimeout(() => {
        this.DOM.cursor.classList.add("activated");
      }, 0);
    }
  };

  setCursorMode = (mode) => {
    this.__.cursorMode.set(mode);
  };
  setTopMenuMode = (mode) => {
    this.__.topMenuMode.set(mode);
  };
  setProjectTitle = (project_name) => {
    if (this.DOM.project.title.innerHTML != project_name) {
      this.DOM.project.title.innerHTML = project_name;
    }
    if (this.DOM.project.title.classList.contains("hidden"))
      this.DOM.project.title.classList.remove("hidden");
  };

  hideProjectTitle = () => {
    this.DOM.project.title.classList.add("hidden");
  };

  hideCursor = () => {
    this.DOM.cursor.classList.add("hidden");
  };

  showCursor = () => {
    this.DOM.cursor.classList.remove("hidden");
    this.DOM.cursor.style.opacity = "1";
  };
  setProjectUI = (project) => {
    this.DOM.project.index.innerHTML = project.__.index + 1;
    this.DOM.project.title.innerHTML = project.__.name;
    this.DOM.project.title.classList.remove("hidden");
  };

  updateTweenedCanvas = () => {
    console.log(" this happens?");
    const max = {
      canvas: window.innerWidth < 600 ? 100 : 50,
      projectTitle: window.innerWidth < 600 ? 150 : 75,
      textContainer: window.innerWidth < 600 ? 100 : 50,
    };

    this.DOM.canvas.style.left = max.canvas + "vw";
    this.DOM.canvas.children[0].style.transform = `translateX(-${
      max.canvas / 2
    }%)`;
    this.DOM.project.title.style.left = max.projectTitle + "%";
  };

  tweenCanvas = () => {
    let tweener = this.app._tween.add(500);
    if (!tweener) return;

    const max = {
      canvas: window.innerWidth < 600 ? 100 : 50,
      projectTitle: window.innerWidth < 600 ? 150 : 75,
      textContainer: window.innerWidth < 600 ? 100 : 50,
    };

    let shouldOpen = this.app.__.infoMode;
    let canvas = {
      now: shouldOpen ? 0 : max.canvas,
      next: shouldOpen ? max.canvas : 0,
    };
    let projectTitle = {
      now: shouldOpen ? 50 : max.projectTitle,
      next: shouldOpen ? max.projectTitle : 50,
    };

    tweener.addEventListener("update", ({ detail }) => {
      this.DOM.canvas.style.left = this.app._tween.lerp(canvas, detail) + "vw";
      this.DOM.canvas.children[0].style.transform = `translateX(-${
        this.app._tween.lerp(canvas, detail) / 2
      }%)`;

      this.DOM.project.title.style.left =
        this.app._tween.lerp(projectTitle, detail) + "%";
    });
    tweener.addEventListener("complete", ({ detail }) => {
      //console.log("COMPLETE!!!");
      this.app.__.infoOpen = !this.app.__.infoOpen;
      //console.log("INFO OPEN IS ", this.app.__.infoOpen);
    });
  };

  getMuted = () => {
    return this.__.isMuted;
  };
  setVideoUI = (bool) => {
    bool
      ? this.DOM.buttons.volume.classList.remove("hidden")
      : this.DOM.buttons.volume.classList.add("hidden");
  };

  showVolume = () => {
    this.DOM.buttons.volume.classList.remove("hidden");
  };

  hideVolume = () => {
    this.DOM.buttons.volume.classList.add("hidden");
  };

  closeInfo = (e) => {
    e.stopPropagation();
    UrlManager.removeParams();
    console.log("CLOSE INFO!!!!");
    this.app.__.infoMode = false;

    document.querySelector(".scroll-container").classList.remove("hidden");
    this.tweenCanvas();
    this.setCursorMode("pointer");
    setTimeout(() => {
      if (this.app.__.menu.isOpen) {
        this.setTopMenuMode("menu");
      } else {
        this.setTopMenuMode("project");
      }
    }, 500);

    this.DOM.canvas.removeEventListener("mouseup", this.closeInfo);
    window.removeEventListener("resize", this.updateTweenedCanvas);

    e.stopPropagation();
    e.preventDefault();
  };


  openInfo = () => {
    console.log("open that info!");
    this.app.__.infoMode = true;
    console.log(this.app.__.focus);
    this.setTopMenuMode("info");
    this.tweenCanvas();
    window.addEventListener("resize", this.updateTweenedCanvas);
    document.querySelector(".scroll-container").classList.add("hidden");
    this.DOM.canvas.addEventListener("mouseup", this.closeInfo);
    console.log("open that info ja!");

    /* if (this.app.__.isMobile && this.app.__.focus.media && this.app.__.focus.media.userData.type === 'video') {
            this.app.__.focus.media.material.map.image.pause();
        } */
  };

  openAbout = () => {
      this.DOM.info.container.classList.remove("hidden");
      this.DOM.info.big.innerHTML = this.app.__.data.about.big;
      this.DOM.info.small.innerHTML = this.app.__.data.about.small;

      this.openInfo();
      UrlManager.setSearchParams('page', 'about');
  }

  openContact = () => {
    this.DOM.info.container.classList.remove("hidden");

    this.DOM.info.big.innerHTML = this.app.__.data.contact.big;
    this.DOM.info.big.innerHTML = `
          <a href="https://instagram.com/post.neon" target="_blank" rel="noopener noreferrer" class="social-link">
              <input onClick="this.setSelectionRange(0, this.value.length)" class="link" readonly>instagram.com/post.neon</input>
          </a>
          <br>
          <a href="mailto:info@post-neon.com" class="social-link">
              <input onClick="this.setSelectionRange(0, this.value.length)" class="link" readonly>info@post-neon.com</input>
          </a>
          <br>
          `;
    this.DOM.info.small.innerHTML = this.app.__.data.contact.small;

    this.openInfo();
    UrlManager.setSearchParams('page', 'contact');


    if (this.app.__.menu.isOpen) {
      this.app._three.resizeCanvas();
    }
  };

  init = () => {

    document.querySelectorAll("button").forEach((b) => {
      b.addEventListener("mouseenter", () => {
        this.__.isHovering = true;
      });
      b.addEventListener("mouseout", () => {
        this.__.isHovering = false;
      });
    });

    this.DOM.buttons.volume.addEventListener("mousedown", (e) => {
      if (this.__.isMuted) {
        this.DOM.buttons.volume.innerHTML = "mute";
        this.__.isMuted = false;
      } else {
        this.DOM.buttons.volume.innerHTML = "muted";
        this.__.isMuted = true;
      }
      const videos =  document.querySelectorAll("video");
      videos.forEach(video => {
        video.muted = this.__.isMuted;
      });
    });
  };
}

export default GUIManager;
