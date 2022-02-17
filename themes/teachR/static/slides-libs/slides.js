const urlParams = new URLSearchParams(window.location.search);
const isLive = urlParams.get("live") === "true";

function setAttributes(el, attrs) {
    for (var key in attrs) {
        el.setAttribute(key, attrs[key]);
    }
}

function plotsToPanels() {
    const codePanels = document.querySelectorAll(
        ".remark-slides-area .codePanel"
    );
    let tabNames = ["Plot", "R code"],
        copyWhat = ["p", "pre"],
        ulTag = [],
        liTag = [],
        aTag = [],
        currentName = [],
        sections = [],
        active = [" panel-active", ""],
        content = [],
        slide = [],
        isCurrentSlide = false;

    if (codePanels.length > 0) {
        for (let p = 0; p < codePanels.length; p++) {
            ulTag = document.createElement("ul");
            setAttributes(ulTag, { class: "panel-tabs", role: "tablist" });
            for (let i = 0; i < tabNames.length; i++) {
                currentName = tabNames[i].toLowerCase().replace(" ", "-");
                aTag = document.createElement("a");

                setAttributes(aTag, {
                    href:
                        "?panelset=" + currentName + "#panelset_" + currentName,
                    onclick: "return false;",
                    tabindex: "-1",
                    "aria-controls": currentName,
                });
                aTag.innerHTML = tabNames[i];

                liTag = document.createElement("li");
                setAttributes(liTag, {
                    class: "panel-tab",
                    role: "tab",
                    tabindex: "0",
                    id: "panelset_" + currentName,
                });

                sections[i] = document.createElement("section");
                setAttributes(sections[i], {
                    class: "panel" + active[i],
                    role: "tabpanel",
                    id: tabNames[i],
                    "aria-labelledby": tabNames[i],
                });

                content = codePanels[p].querySelector(copyWhat[i]);

                sections[i].appendChild(content);
                liTag.appendChild(aTag);
                ulTag.appendChild(liTag);
            }

            codePanels[p].appendChild(ulTag);
            codePanels[p].appendChild(sections[0]);
            codePanels[p].appendChild(sections[1]);

            setAttributes(codePanels[p], { class: "panelset", id: "panelset" });
        }
    }
}

const live = function () {
    if (isLive) {
        const bodySlides = document.querySelectorAll(
            ".remark-slide-content:not(.title-slide):not(.last-slide)"
        );
        for (i = 0; i < bodySlides.length; i++) {
            let footer = document.createElement("DIV");
            footer.classList.add("slide-msg");
            footer.innerHTML = slideMessage;
            bodySlides[i].appendChild(footer);
        }
    }
};

remark.macros.live = function () {
    return !isLive;
};

remark.macros.notLive = function () {
    return isLive;
};

editPanels = function () {
    const panels = document.querySelectorAll(".panelset");

    let tabs = [],
        names = [];
    if (panels.length > 0) {
        for (let i = 0; i < panels.length; i++) {
            tabs = panels[i].getElementsByTagName("a");
            if (tabs.length == 2) {
                names = ["Panel"];
                for (let j = 0; j < 2; j++) {
                    names.push(tabs[j].innerHTML);
                }
                if (names.every((val, j, arr) => val === arr[0])) {
                    tabs[0].innerHTML = "Plot";
                    tabs[1].innerHTML = "<code>R</code> code";

                    slide =
                        panels[i].parentElement.parentElement.parentElement
                            .parentElement;
                    isCurrentSlide = slide.classList[1] == "remark-visible";
                    slide.classList.add("remark-visible");
                    panels[i].querySelector(".panel code").style.maxHeight =
                        panels[i].getElementsByClassName("panel")[0]
                            .scrollHeight + "px";
                    if (!isCurrentSlide) {
                        slide.classList.remove("remark-visible");
                    }
                }
            }
        }
    }
};

addLogos = function () {
    const slides = document.querySelectorAll(
        ".remark-slide-content:not(.last-slide):not(.slide-zero)"
    );
    let logo = document.getElementById("slide-institution-logo");

    slides[0].appendChild(logo);
    logo.classList.remove("hidden");

    logo = document.getElementById("slide-module-logo");
    for (let i = 0; i < slides.length; i++) {
        const logoCopy = logo.cloneNode(true);
        slides[i].appendChild(logoCopy);
        logoCopy.classList.remove("hidden");
    }
    logo.remove();
};

let nKeyPresses = 0;
function resetGif(img) {
    let gifSrc = img.getAttribute("gif");
    gifSrc = gifSrc.split(" ");

    currentSrc = img.getAttribute("src");
    img.setAttribute("src", gifSrc.shift());
    gifSrc.push(currentSrc);
    img.setAttribute("gif", gifSrc.join(" "));
}

function resetGifKey(event, nkp) {
    let gifSrc = event.target.getAttribute("gif");
    gifSrc = gifSrc.split(" ");

    if (nkp < gifSrc.length) {
        event.stopPropagation();
        nKeyPresses++;
        console.log(nKeyPresses);
        currentSrc = event.target.getAttribute("src");
        event.target.setAttribute("src", gifSrc.shift());
        gifSrc.push(currentSrc);
        event.target.setAttribute("gif", gifSrc.join(" "));
    } else {
        nKeyPresses = 0;
    }
}

let cssTag = document.createElement("link");
cssTag.rel = "stylesheet";
cssTag.href = "../../../../css/slides.css";
document.head.appendChild(cssTag);

var oldOnload = document.body.onload;
document.body.onload = function () {
    oldOnload && oldOnload();

    const gifs = document.querySelectorAll(".gif");

    if (gifs.length) {
        for (let i = 0; i < gifs.length; i++) {
            ["click", "touch"].forEach((eventType) => {
                gifs[i].addEventListener(eventType, function (ev) {
                    resetGif(ev.target);
                    ev.stopPropagation();
                });
            });
            gifs[i].addEventListener("touchend", function (ev) {
                ev.stopPropagation();
            });
            // gifs[i].addEventListener('keydown', function (ev, nkp = nKeyPresses) {
            // console.log(ev)
            // if (ev.code === 'ArrowRight') {
            // resetGifKey(ev, nkp = nkp)
            // }
            // })
        }
    }

    addLogos();
    editPanels();
};
