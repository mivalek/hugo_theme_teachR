
// expand menu in navbar
$('.nav-dropbtn').click(function() {
		$(this).parent().toggleClass("nav-dropdown-active")
    $(this).parent().siblings('.nav-dropdown').removeClass('nav-dropdown-active');
})
$("#menu-icon").click(function() {
  $('.nav-right').toggleClass('nav-right-active')
})
$("body").click(function() {
    $('.nav-dropdown').removeClass('nav-dropdown-active')
});
$(".nav-dropdown").click(function(e) {
    e.stopPropagation();
});
let prevTop = $(document).scrollTop();
if (prevTop !== 0) { $(".header").addClass("header-hidden"); }
$(document).scroll( function(evt) {
    const currentTop = $(this).scrollTop();
    if (prevTop < currentTop) {
        $(".header").addClass("header-hidden");
        $("#save-progress").addClass("pull-up");
    } else {
        $(".header").removeClass("header-hidden");
        $("#save-progress").removeClass("pull-up");
    }
    prevTop = currentTop;
});


if (localStorage.getItem("darkTheme") === "true") $("#dark-toggle").toggleClass("dark")
  
$("#dark-toggle").on("click touch", e => {
  const darkToggle = $("#dark-toggle")
  darkToggle.toggleClass("dark")
  localStorage.setItem("darkTheme", darkToggle.hasClass("dark"))
  if (localStorage.getItem("darkTheme") === "true") {
    document.documentElement.setAttribute("data-theme", "dark");
  } else 
    document.documentElement.setAttribute("data-theme", "");
})

// add padding if height of doc is less than screen height
function paddBoddy() {
  const bodyPadding = ~~($(window).height() - ($("d-title").outerHeight() + $("dt-footer").outerHeight() + $("d-article").height()));
  $("d-article").css("padding-bottom", Math.max(50, bodyPadding))
};

paddBoddy();
$( window ).resize(paddBoddy);
