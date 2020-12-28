import TWEEN from '@tweenjs/tween.js'
export default function (type) {
    //console.log("open or close about");
    // eId("threejs").style.cursor = "pointer";
    if (eId("threejs").offsetWidth != window.innerWidth) {

    }


    let start, end;
    if (g.menuOpen) {
        if (!this.app.state.about.isOpen) {
            if (type === "contact") {
                eId("about").children[0].children[0].children[0].innerHTML = g.scene.userData.contactBig;
                eId("about").children[0].children[0].children[1].innerHTML = g.scene.userData.contactSmall;
            } else {
                eId("about").children[0].children[0].children[0].innerHTML = this.app.state.data.about.big;
                eId("about").children[0].children[0].children[1].innerHTML = this.app.state.data.about.small;
            }
        }

    } else {
        ////console.log(g.focusedProject);
        eId("about").children[0].children[0].children[0].innerHTML = g.focusedProject.userData.infoBig;
        eId("about").children[0].children[0].children[1].innerHTML = g.focusedProject.userData.infoSmall;
    }
    ////console.log(this.app.state.about.isOpen);


    if (!this.app.state.about.isOpen) {
        this.app.state.about.isOpen = true;
        if (window.innerWidth < 600) {
            ////console.log("THIS HAPPENS");
            start = { canvas: 0 };
            end = { canvas: 100 };
        } else {
            start = { canvas: 0 };
            end = { canvas: 50 };
        }
        eId("contactButton").style.display = "none";
        eId("subTitle").style.display = "none";
        eId("about").children[0].scrollTop = "0px";
        eId("about").style.display = "inline-block";
        eId("aboutButton").children[0].innerHTML = "back";
        eId("threejs").children[0].style.cursor = "pointer";
    } else {
        this.app.state.about.isOpen = false;
        eId("cross").style.display = "";
        eId("pointer").style.display = "";
        if (window.innerWidth < 600) {
            ////console.log("THIS HAPPENS");
            end = { canvas: 0 };
            start = { canvas: 100 };
        } else {
            end = { canvas: 0 };
            start = { canvas: 50 };
        }
        eId("contactButton").style.display = "inline-block";
        eId("about").style.display = "inline-block";
        eId("aboutButton").children[0].style.color = "";
        eId("aboutButton").children[0].style.background = "";
        eId("threejs").children[0].style.cursor = "";
        if (g.menuOpen) {
            eId("subTitle").style.display = "";
            eId("aboutButton").children[0].innerHTML = "about";
        } else {
            eId("aboutButton").children[0].innerHTML = "info";
        }
    }
    ////console.log(eId("threejs").style.cursor);
    g.aboutTrans = true;
    var tween = new TWEEN.Tween(start)
        .to(end, 375)
        .onUpdate(function () {
            eId("threejs").style.left = start.canvas + "vw";
            // eId("projectTitle").style.left = start.left +"vw";
            if (g.menuOpen) {
                chooseLogo();
            }
        })
        .onComplete(function () {
            eId("threejs").style.left = start.canvas + "vw";
            // eId("projectTitle").style.left = start.left +"vw";
            g.aboutTrans = false;
            ////console.log("aboutOpen is " + this.app.state.about.isOpen);
            if (g.menuOpen) {
                chooseLogo();
            }
        })
        .start();
}