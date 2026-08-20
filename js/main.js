(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };

    spinner(0);


    // Navbar fixa
    $(window).scroll(function () {

        if ($(window).width() < 992) {

            if ($(this).scrollTop() > 55) {
                $('.fixed-top').addClass('shadow');
            } else {
                $('.fixed-top').removeClass('shadow');
            }

        } else {

            if ($(this).scrollTop() > 55) {
                $('.fixed-top')
                    .addClass('shadow')
                    .css('top', -55);
            } else {
                $('.fixed-top')
                    .removeClass('shadow')
                    .css('top', 0);
            }

        }
    });


    // Voltar ao topo
    $(window).scroll(function () {

        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }

    });


    $('.back-to-top').click(function () {

        $('html, body').animate(
            { scrollTop: 0 },
            1500
        );

        return false;
    });

})(jQuery);