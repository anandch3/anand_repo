$(window).scroll(function () {
    var scroll = $(window).scrollTop();
    if (scroll >= 200) {
        $(".header").addClass("background");
    }
    else {
        $(".header").removeClass("background");
    }
});