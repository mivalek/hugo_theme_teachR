// make invisible while things are loading
$("d-article").css("visibility", "hidden");

// local storage variable name to save MCQ and SAQ user input
const storageVarName = window.location.pathname.replace(/\//g, "");
const quizzes = JSON.parse(localStorage.getItem(storageVarName));
let storeQuizzes,
    neverStore = false;
if (storageVarName.includes("html")) {
    storeQuizzes = false;
    neverStore = true;
} else if (quizzes) {
    storeQuizzes = quizzes.saving;
} else {
    storeQuizzes = true;
}

// from https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript //
function copyTextToClipboard(text) {
    var textArea = document.createElement("textarea");

    //
    // *** This styling is an extra step which is likely not required. ***
    //
    // Why is it here? To ensure:
    // 1. the element is able to have focus and selection.
    // 2. if the element was to flash render it has minimal visual impact.
    // 3. less flakyness with selection and copying which **might** occur if
    //    the textarea element is not visible.
    //
    // The likelihood is the element won't even render, not even a
    // flash, so some of these are just precautions. However in
    // Internet Explorer the element is visible whilst the popup
    // box asking the user for permission for the web page to
    // copy to the clipboard.
    //

    // Place in the top-left corner of screen regardless of scroll position.
    textArea.style.position = "fixed";
    textArea.style.top = 0;
    textArea.style.left = 0;

    // Ensure it has a small width and height. Setting to 1px / 1em
    // doesn't work as this gives a negative w/h on some browsers.
    textArea.style.width = "2em";
    textArea.style.height = "2em";

    // We don't need padding, reducing the size if it does flash render.
    textArea.style.padding = 0;

    // Clean up any borders.
    textArea.style.border = "none";
    textArea.style.outline = "none";
    textArea.style.boxShadow = "none";

    // Avoid flash of the white box if rendered for any reason.
    textArea.style.background = "transparent";

    textArea.value = text;

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        success = document.execCommand("copy");
        console.log("Copied");
    } catch (err) {
        console.log("Oops, unable to copy");
    }

    document.body.removeChild(textArea);
}

const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

const hideBox = (classes) => {
    for (cls of classes) {
        let box = document.querySelectorAll(cls);
        if (box.length > 0) {
            for (let i = 0; i < box.length; i++) {
                if (cls == ".extra") {
                    let firstP = box[i].firstElementChild;
                    firstP.innerHTML =
                        '<strong class="prefix">EXTRA</strong> ' +
                        '<span class="extra-title">' +
                        firstP.innerHTML +
                        "</span>";
                    firstP.classList.add("label");
                    let pHeight = firstP.scrollHeight + 13 + "px";
                    box[i].collapsedHeight = pHeight;
                    box[i].style.maxHeight = pHeight;
                } else {
                    let label = "";
                    switch (cls) {
                        case ".r-box":
                            label = "<code>R</code> know-how";
                            break;
                        case ".hint":
                            label = "Hint";
                            break;
                        case ".more":
                            label = "gimme mo<code>R!</code>";
                            break;
                    }
                    let node = document.createElement("DIV");
                    node.innerHTML = label;
                    node.classList.add("label");
                    box[i].insertBefore(node, box[i].firstChild);
                }
                box[i].style.height = box[i].scrollHeight + "px";
                box[i].classList.add("collapsible");
                if (cls == ".extra") {
                    box[i].addEventListener("click", toggleExtra);
                } else {
                    box[i].addEventListener("click", toggleBox);
                }
            }
        }
    }
};

toggleBox = function () {
    this.classList.toggle("active");
    var content = this;
    if (content.style.maxHeight) {
        content.style.maxHeight = null;
    } else {
        content.style.maxHeight = content.style.height;
    }
};

toggleExtra = function () {
    this.classList.toggle("active");
    if (this.style.maxHeight == this.style.height) {
        this.style.maxHeight = this.collapsedHeight;
    } else {
        this.style.maxHeight = this.style.height;
    }
};

function setAttributes(el, attrs) {
    for (var key in attrs) {
        el.setAttribute(key, attrs[key]);
    }
}

function plotsToPanels() {
    const codePanels = document.querySelectorAll(".codePanel");
    let tabNames = ["Plot", "R code"],
        copyWhat = [".figure", ".sourceCode"],
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
            if (codePanels[p].getElementsByTagName("img").length == 1) {
                ulTag = document.createElement("ul");
                setAttributes(ulTag, { class: "panel-tabs", role: "tablist" });
                for (let i = 0; i < tabNames.length; i++) {
                    currentName = tabNames[i].toLowerCase().replace(" ", "-");
                    aTag = document.createElement("a");

                    setAttributes(aTag, {
                        href:
                            "?panelset=" +
                            currentName +
                            "#panelset_" +
                            currentName,
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

                    content =
                        codePanels[p].querySelector(copyWhat[i]) ||
                        codePanels[p].querySelector("img"); // if fig.cap= isn't given, there's not .figure and so select <img>

                    sections[i].appendChild(content);
                    liTag.appendChild(aTag);
                    ulTag.appendChild(liTag);
                }

                codePanels[p].appendChild(ulTag);
                codePanels[p].appendChild(sections[0]);
                codePanels[p].appendChild(sections[1]);

                setAttributes(codePanels[p], {
                    class: "panelset",
                    id: "panelset",
                });
            }
        }
    }
}

// solutions
const urlParams = new URLSearchParams(window.location.search);
const isSol = urlParams.get("sol") === "true" || ["docs", "tutorials"].includes(section);

let solutionChunks = document.querySelectorAll(".sol-chunk");
let solutionDivs = document.querySelectorAll(".sol");

(function () {
    if (isSol) {
        if (solutionChunks.length > 0) {
            for (i = 0; i < solutionChunks.length; i++) {
                let button = document.createElement("button");
                button.classList.add("btn", "btn-primary", "sol-btn");
                button.innerHTML = "Solution";
                solutionChunks[i].before(button);
                button.onclick = function () {
                    let content;
                    if (this.nextElementSibling) {
                        content = this.nextElementSibling;
                    } else {
                        content =
                            this.parentElement.nextElementSibling.childNodes[0];
                    }
                    content.classList.toggle("collapsed");
                    if (content.style.maxHeight) {
                        content.style.height = content.style.maxHeight;
                        content.style.maxHeight = null;
                        sleep(300).then(() =>
                            content.classList.toggle("invisible")
                        );
                    } else {
                        content.style.maxHeight = content.style.height;
                        content.style.height = null;
                        content.classList.toggle("invisible");
                    }
                };

                let codeBlocks = solutionChunks[i].querySelectorAll("pre.r");
                for (j = 0; j < codeBlocks.length; j++) {
                    codeBlocks[j].classList.add("copy");
                }
            }
        }
        if (solutionDivs.length > 0) {
            for (i = 0; i < solutionDivs.length; i++) {
                let button = document.createElement("button");
                button.classList.add("btn", "btn-primary", "sol-btn");
                button.innerHTML = "Solution";
                solutionDivs[i].before(button);
                button.onclick = function () {
                    const content = this.nextElementSibling;
                    content.classList.toggle("collapsed");
                    if (content.style.maxHeight) {
                        content.style.height = content.style.maxHeight;
                        content.style.maxHeight = null;
                        sleep(300).then(() =>
                            content.classList.toggle("invisible")
                        );
                    } else {
                        content.style.maxHeight = content.style.height;
                        content.style.height = null;
                        content.classList.toggle("invisible");
                    }
                };

                let codeBlocks = solutionDivs[i].querySelectorAll("pre.r");
                for (j = 0; j < codeBlocks.length; j++) {
                    codeBlocks[j].classList.add("copy");
                }
            }
        }
    } else {
        if (solutionChunks.length > 0) {
            for (i = 0; i < solutionChunks.length; i++) {
                solutionChunks[i].remove();
            }
        }
        if (solutionDivs.length > 0) {
            for (i = 0; i < solutionDivs.length; i++) {
                solutionDivs[i].remove();
            }
        }
    }
})();

editPanels = function () {
    const panels = document.querySelectorAll(".panelset > .panel-tabs");

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

                    // I don't think there's need to keep code blocks same max height as plots in worksheets (unlike slides)
                    // panels[i].querySelector(".panel code").style.maxHeight = panels[i].getElementsByClassName("panel")[0].scrollHeight + "px"
                }
            }
        }
    }
};

function resetGif() {
    $(this).parent().removeClass("init");
    gifSrc = this.getAttribute("gif");
    gifSrc = gifSrc.split(" ");
    currentSrc = this.getAttribute("src");
    this.setAttribute("src", gifSrc.shift());
    gifSrc.push(currentSrc);
    this.setAttribute("gif", gifSrc.join(" "));
}

function resetGifParent() {
    $(this).removeClass("init");
    gif = $(this).children()[0];
    gifSrc = gif.getAttribute("gif");
    gifSrc = gifSrc.split(" ");
    currentSrc = gif.getAttribute("src");
    gif.setAttribute("src", gifSrc.shift());
    gifSrc.push(currentSrc);
    gif.setAttribute("gif", gifSrc.join(" "));
    $(this).off("click touch");
}

// vars to save user input for local storage
let saq = [],
    mcq = [];
function checkAns() {
    saq = [];
    mcq = [];
    const qu = this.parentElement.parentElement.parentElement;
    let corrAns, userAns;
    if (qu.classList.contains("mcq")) {
        qu.querySelector(".correct").classList.remove("show");
        qu.querySelector(".incorrect").classList.remove("show");
        if (this.classList.contains("selected") && click) {
            this.classList.remove("selected");
            // get all MCQ and SAQ user input
            $(".quizInput").each(function () {
                return saq.push($(this).val());
            });
            $(".opts").each(function () {
                return mcq.push($(this).find(".selected").val() || "");
            });
            if (storeQuizzes) {
                // save into local storage under name corresponding to tutorial/handout
                window[storageVarName] = { mcq: mcq, saq: saq, saving: true };
                localStorage.setItem(
                    storageVarName,
                    JSON.stringify(eval(storageVarName))
                );
            }
            return;
        }
        qu.querySelectorAll("input").forEach((el) =>
            el.classList.remove("selected")
        );
        this.classList.add("selected");
        corrAns = qu.querySelector(".corrAns > p").innerHTML;
        userAns = this.value;
        corrAns = corrAns.replace(/’/g, "'"); // apostrophes get rendered as quotes in .corrAns and need replacing
        corrAns = [corrAns.replace(/[“”]/g, '"')]; // double quotes need replacing too
    } else {
        corrAns = qu.querySelector(".corrAns > p").innerHTML.split(" | ");
        if (qu.querySelector(".str")) {
            (corrAns = corrAns.map((e) => e.replace(/’/g, "'"))), // apostrophes get rendered differenctly in input value and .corrAns div
                (corrAns = corrAns.map((e) => e.replace(/[“”]/g, '"'))), // double quotes need replacing too
                (userAns = qu.querySelector("input").value);
        } else {
            corrAns = corrAns.map((e) => +e);
            userAns = +qu.querySelector("input").value;
        }
    }
    if (corrAns.some((possAns) => possAns === userAns)) {
        qu.querySelector(".correct").classList.add("show");
    } else {
        qu.querySelector(".incorrect").classList.add("show");
    }
    // get all MCQ and SAQ user input
    $(".quizInput").each(function () {
        return saq.push($(this).val());
    });
    $(".opts").each(function () {
        return mcq.push($(this).find(".selected").val() || "");
    });
    if (storeQuizzes) {
        // save into local storage under name corresponding to tutorial/handout
        window[storageVarName] = { mcq: mcq, saq: saq, saving: true };
        localStorage.setItem(
            storageVarName,
            JSON.stringify(eval(storageVarName))
        );
    }
}

function hideMsg() {
    const qu = this.parentElement;
    qu.querySelector(".correct").classList.remove("show");
    qu.querySelector(".incorrect").classList.remove("show");
}

function stopPropagation() {
    let codeCopy = document.querySelectorAll(
        ".r-box button.copy-btn, .more button.copy-btn"
    );
    for (let i = 0; i < codeCopy.length; i++) {
        codeCopy[i].addEventListener("click", function (event) {
            event.stopPropagation();
        });
    }
    let links = document.querySelectorAll("*:not(.panel-tab) > a");
    for (let i = 0; i < links.length; i++) {
        links[i].addEventListener("click", function (event) {
            event.stopPropagation();
        });
    }
}

// shuffle mcq
$(".shuffle .opts.shuffle").each(function () {
    x = $(this)[0];
    for (let i = x.children.length; i >= 0; i--) {
        x.appendChild(x.children[(Math.random() * i) | 0]);
    }
});

function truncateToc() {
    const subheadings = $("#TOC li > ul");
    if ($(window).width() > 982) {
        if ($(window).height() < fullTocHeight) {
            subheadings.addClass("collapsed");
        } else {
            subheadings.removeClass("collapsed");
            sleep(400).then(() => {
                fullTocHeight = toc.clientHeight + 80;
            });
        }
    }
}

function setTocTop() {
  const toc = $("#toc-container");
  toc.css("top", $("d-header").outerHeight() + 10 + "px");
}

function noScroll() {
    window.scrollTo(0, freezeScroll);
}

let fullTocHeight, click, freezeScroll;
var oldOnload = document.body.onload;

function addCopyButtons() {
    let copyCode = document.querySelectorAll(
        ".copy pre.r, .r-box pre.r, .panelset pre.r, .copy pre.git"
    );
    if (copyCode.length > 0) {
        for (let i = 0; i < copyCode.length; i++) {
            copyCode[i].classList.add("copy");
        }
    }

    let copyDivs = document.querySelectorAll("pre.sourceCode.copy, .git.copy");
    if (copyDivs.length > 0) {
        for (let i = 0; i < copyDivs.length; i++) {
            let icon = document.createElement("i");
            icon.classList.add("far", "fa-copy");
            let copyBttn = document.createElement("button");
            copyBttn.classList.add("btn", "btn-primary", "copy-btn");
            copyBttn.appendChild(icon);
            copyDivs[i].parentElement.appendChild(copyBttn);
            copyBttn.onclick = function () {
                textToCopy = this.parentElement.children[0].textContent;
                let success = false;
                copyTextToClipboard(textToCopy);
                if (success) {
                } else {
                }
            };
        }
        stopPropagation();
    }
}

function resizeFootnotes() {
    $("d-article").width();
}

function taskDiff() {
    const diff = [
        {
            name: "easy",
            label: "punk!",
            desc: "Easy task or a task that you will have encountered again and again",
        },
        {
            name: "medium",
            label: "Prog-rocK",
            desc: "Medium difficulty task; requires a little thinking",
        },
        {
            name: "hard",
            label: "jazz...",
            desc: "Hard task; you might not get it right the first time round",
        },
        {
            name: "death",
            label: "death metal",
            desc: "Very hard or complex task that requires self-help and advanced problem-solving",
        },
    ];

    let i;

    for (i = 0; i < diff.length; i++) {
        let x = document.querySelectorAll(
            "h2." +
                diff[i].name +
                ", h3." +
                diff[i].name +
                ", h4." +
                diff[i].name +
                ", h5." +
                diff[i].name
        );
        for (j = 0; j < x.length; j++) {
            let node = document.createElement("SPAN"),
                tooltip = document.createElement("SPAN");
            node.innerHTML = diff[i].label;
            node.setAttribute(
                "aria-label",
                i == 3 ? "very hard" : diff[i].name
            );
            node.setAttribute("ttip", diff[i].desc);
            node.classList.add("difficulty", diff[i].name);
            node.onmouseenter = ttOffset;
            x[j].appendChild(node);
        }
    }
}

function ttOffset() {
    spanOffset = $(this).offset().left;
    if (spanOffset < 45) {
        document.documentElement.style.setProperty(
            "--tt-translate",
            45 - spanOffset + "px"
        );
    } else {
        const w = $(document).width(),
            limit = w > 365 ? 325 : 285,
            offset = w - limit - spanOffset;
        if (offset < 0) {
            document.documentElement.style.setProperty(
                "--tt-translate",
                offset + "px"
            );
        } else {
            document.documentElement.style.setProperty("--tt-translate", "0px");
        }
    }
}

document.body.onload = function () {
    oldOnload && oldOnload();
    
    setTocTop();
    
    if (isSol) {
        if (!["docs", "tutorials"].includes(section)) {
            let title = document.querySelector("d-title h1");
            title.innerHTML =
                title.innerHTML +
                '<div class="sol-title">...with solutions</div>';
        }
        if (solutionChunks.length > 0) {
            for (let i = 0; i < solutionChunks.length; i++) {
                solutionChunks[i].style.height =
                    solutionChunks[i].scrollHeight + 20 + "px";
                solutionChunks[i].classList.add(
                    "invisible",
                    "collapsed",
                    "solution"
                );
            }
        }
        if (solutionDivs.length > 0) {
            for (let i = 0; i < solutionDivs.length; i++) {
                solutionDivs[i].style.height =
                    solutionDivs[i].style.height ||
                    solutionDivs[i].scrollHeight + 20 + "px";
                solutionDivs[i].classList.add(
                    "invisible",
                    "collapsed",
                    "solution"
                );
            }
        }
    }

    // append a container for one-off quiz save message
    if (!localStorage.length) {
        $("#toc-container").after('<div id="save-sticky"></div>');
        saveSticky = $("#save-sticky");
    }

    if ($(".quiz").length && !neverStore) {
        // save progress button
        $("d-header").append(
            '<div id="save-progress"><div id="floppy"><i class="far fa-save"></i><i class="fas fa-save"></i></div><div id="ttip">Your progress on quizzes is <span></span>being saved!</div></div>'
        );
        if (!localStorage.length) {
            $("#save-progress").addClass("hide");
        }
        if (storeQuizzes) {
            $("#save-progress").addClass("saving");
        } else {
            $("#ttip span").html("NOT ");
        }
        $("#save-progress").click(function () {
            $(this).toggleClass("saving");
            storeQuizzes = !storeQuizzes;
            if (storeQuizzes) {
                $("#ttip span").html("");
                if (!neverStore) {
                    // save into local storage under name corresponding to tutorial/handout
                    window[storageVarName] = {
                        mcq: mcq,
                        saq: saq,
                        saving: true,
                    };
                    localStorage.setItem(
                        storageVarName,
                        JSON.stringify(eval(storageVarName))
                    );
                }
            } else {
                $("#ttip span").html("NOT ");
                if (!neverStore) {
                    localStorage.setItem(
                        storageVarName,
                        JSON.stringify({ mcq: [""], saq: [""], saving: false })
                    );
                }
            }
        });
    }

    let iconOffset;
    // quizzes
   $(".quiz:not(.no-check) .quizSubmit").each(function () {
        $(this).on("click touch", checkAns);
        if (!localStorage.length) {
            $(this).click(() => {
                // add listener to disable scroll
                freezeScroll = $(window).scrollTop();
                window.addEventListener("scroll", noScroll);
                saveSticky.append(
                    '<div id="save-msg"><i class="fas fa-save hide" id="save-msg__icon"></i><div id="save-msg__content" class="hide"><div id="save-msg__text"><p>Your progress on quiz questions will be saved in this browser even if you close the tab</p><p>To disable progress saving, click on this save icon in the upper-right corner</p><button id="save-msg__btn" class="btn btn-primary">Got it</button></div></div></div>'
                );
                iconOffset = $("#save-msg__icon").offset();
                $("#save-msg__btn").click(() => {
                    $("#save-progress").removeClass("pull-up");
                    $("#save-msg__content").addClass("hide");
                    icon = $("#save-msg__icon");
                    floppyOffsetLeft = $("#floppy").offset().left;
                    targetTop = freezeScroll + $(".header .nav").height() + 3;
                    moveY = targetTop - iconOffset.top;
                    moveX = floppyOffsetLeft - iconOffset.left;
                    icon.addClass("hide");
                    icon.css("transform", `translate(${moveX}px, ${moveY}px)`);

                    $("#save-progress").removeClass("hide");
                    sleep(700).then(() =>
                        $("d-header").removeClass("header-hidden")
                    );
                    sleep(2000).then(() => {
                        saveSticky.remove();
                        window.removeEventListener("scroll", noScroll);
                    });
                    $(".quizSubmit").each(function () {
                        $(this).off("click").on("click", checkAns);
                    });
                });
                sleep(50).then(() => {
                    $("#save-msg__icon").removeClass("hide");
                    $("#save-msg__content").removeClass("hide");
                });
            });
        }
    });

    $(".quiz:not(.no-check) .quizInput").each(function () {
        $(this).val("");
        $(this).on("input", hideMsg);
        $(this).keydown((e) => {
            if (e.key === "Enter") e.target.nextElementSibling.click();
        });
    });

    $(".gif").each(function () {
        $(this).parent().addClass("init");
        $(this).parent().on("click touch", resetGifParent);
        $(this).on("click touch", resetGif);
        $(this).on("click touch", function (event) {
            event.stopPropagation();
        });
    });

    taskDiff();
    hideBox([".extra", ".r-box", ".more", ".hint"]);
    editPanels();

    $("d-footnote-list > ol").append($(".footnotes > ol").contents());
    $("d-footnote-list").css("display", "");
    $("section.footnotes").remove();

    // collapse TOC if height larger than viewport
    toc = document.querySelector("#TOC");

    if (toc) {
        fullTocHeight = toc.clientHeight + 80;
        truncateToc();
    }

    $(window).on("resize", () => {
      truncateToc();
      setTocTop();
    });

    // retrieve previous user input from local storage and fill/select quiz questions
    if (quizzes) {
        // hack so that initial checking of pre-selected answers doesn't deselect MCQs
        // this problem was introduced by adding deselect MCQ functionality in checkAns()
        click = false;
        // select user-selected MCQ options
        $(".opts").each(function (i) {
            const ind = i;
            $(this)
                .find(".quizSubmit")
                .each(function () {
                    if ($(this).val() === quizzes.mcq[ind]) {
                        $(this).addClass("selected");
                    }
                })
                .filter(function () {
                    return this.value === quizzes.mcq[ind];
                })
                .each(checkAns); // check answer
        });

        // fill SAQs with user input
        $(".quizInput")
            .each(function (i) {
                $(this).val(quizzes.saq[i]);
            })
            .filter(function () {
                return this.value;
            })
            .each(checkAns); // check answers
    }
    click = true;

    // add on-hover footnote text
    if ($("a.footnote-ref").length) {
        $("a.footnote-ref").each(function () {
            $(this)
                .append(
                    $($(this).attr("href") + " > p")
                        .clone()
                        .find(".footnote-back")
                        .remove()
                        .end()
                        .addClass("footnote-text")
                )
                .hover(function () {
                    $(this)
                        .find(".footnote-container")
                        .css("width", $("h1").width());
                });
        });
        $(".footnote-text").wrap(
            "<div class='footnote-container'><div class='footnote-box'></div></div>"
        );
    } else if (!$("d-citation-list").text().length) {
        $("d-appendix").addClass("hidden");
    }
    $("d-article").removeAttr("style");
    
    // Intersection observer to fix TOC before it disappears behind d-appendix
    let stuckOpts = {
      root: document.querySelector('d-article'),
      rootMargin: '-30px',
      threshold: 1.0
    };
    
    let stuckObs = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
          const toc = $("#toc-container");
          const tocBottom = $("#TOC").outerHeight() + 30 + "px";
        if (!entry.isIntersecting) {
          toc.addClass("stuck");
          toc.css("top", "");
          toc.css("bottom", tocBottom);
        }
      });
    }, stuckOpts);
    
    stuckObs.observe(document.querySelector("#TOC"));
    
    let unstuckOpts = {
      rootMargin: -$("d-header").outerHeight() - 10 + "px",
      threshold: 1
    };
    
    let unstuckObs = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        const toc = $("#toc-container");
        if (entry.isIntersecting) {
          toc.removeClass("stuck");
          toc.css("bottom", "");
          setTocTop();
        }
      })
    }, unstuckOpts);
    
    unstuckObs.observe(document.querySelector("#toc-container"));
};
