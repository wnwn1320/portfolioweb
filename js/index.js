$(function () {
    const $window = $(window);
    const $header = $('header');
    const $tabSection = $('.tab');
    const $sections = $('.tab-items > section');

    // 처음 메뉴를 눌렀을 때 콘텐츠 시작점보다 더 내려갈 값
    const SCROLL_EXTRA = 50;

    // 처음 내려가는 속도
    const SCROLL_SPEED = 100;


    //모바일 메뉴 열기·닫기

    function openMobileMenu() {
        $('.mobile-menu').addClass('active');
        $('.menu-overlay').addClass('active');
        $('body').addClass('menu-open');
    }

    function closeMobileMenu() {
        $('.mobile-menu').removeClass('active');
        $('.menu-overlay').removeClass('active');
        $('body').removeClass('menu-open');
    }


    // 모바일 햄버거 메뉴 열기
    $('.header-right').on('click.mobileMenu', function (e) {
        if ($window.width() <= 767) {
            e.preventDefault();
            openMobileMenu();
        }
    });


    // X 버튼으로 닫기
    $('.menu-close').on('click.mobileMenu', function (e) {
        e.preventDefault();
        e.stopPropagation();

        closeMobileMenu();
    });


    // 검은 배경 클릭 시 닫기
    $('.menu-overlay').on('click.mobileMenu', function () {
        closeMobileMenu();
    });


    // ESC 키로 닫기
    $(document).on('keyup.mobileMenu', function (e) {
        if (e.key === 'Escape') {
            closeMobileMenu();
        }
    });


    //Swiper 다시 계산

    function updateSectionSwiper($activeSection) {
        setTimeout(function () {

            // section 자체가 swiper인 경우
            if ($activeSection[0] && $activeSection[0].swiper) {
                $activeSection[0].swiper.update();

                if (
                    typeof $activeSection[0].swiper.slideToLoop
                    === 'function'
                ) {
                    $activeSection[0].swiper.slideToLoop(0, 0);
                } else {
                    $activeSection[0].swiper.slideTo(0, 0);
                }
            }


            // section 내부에 swiper가 있는 경우
            $activeSection.find('.swiper').each(function () {
                if (!this.swiper) return;

                this.swiper.update();

                if (typeof this.swiper.slideToLoop === 'function') {
                    this.swiper.slideToLoop(0, 0);
                } else {
                    this.swiper.slideTo(0, 0);
                }
            });

        }, 50);
    }


    //탭과 콘텐츠 변경

    function changePortfolioTab(index) {
        const $activeSection = $sections.eq(index);

        if (!$activeSection.length) {
            return $();
        }


        // 상단 PC 메뉴 활성화
        $('.header-right .menu li')
            .removeClass('on')
            .eq(index)
            .addClass('on');


        // 가운데 탭 메뉴 활성화
        $('.tab-menu li')
            .removeClass('on')
            .eq(index)
            .addClass('on');


        // 모바일 메뉴 활성화
        $('.mobile-menu li')
            .removeClass('on active')
            .eq(index)
            .addClass('on active');


        // 해당 콘텐츠만 표시
        $sections.removeClass('on');
        $activeSection.addClass('on');


        // Swiper 다시 계산
        updateSectionSwiper($activeSection);

        return $activeSection;
    }


    //스크롤 위치 고정 

    function keepScrollPosition(scrollTop) {
        $('html, body').stop(true);

        requestAnimationFrame(function () {
            window.scrollTo(0, scrollTop);

            // Swiper와 이미지 크기 재계산 후 한 번 더 고정
            setTimeout(function () {
                window.scrollTo(0, scrollTop);
            }, 80);
        });
    }


    //상단 메뉴를 통한 콘텐츠 변경

    function changeFromHeaderMenu(index) {
        const currentScroll = $window.scrollTop();
        const headerHeight = $header.outerHeight() || 0;

        // 탭 영역 시작 위치
        const tabTop =
            $tabSection.offset().top - headerHeight;


        // 변경 전 현재 활성화된 콘텐츠
        let $currentSection = $sections.filter('.on').first();

        if (!$currentSection.length) {
            $currentSection = $sections.eq(0);
        }


        // 현재 콘텐츠 내부에서 얼마나 내려와 있는지 저장
        const currentSectionTop =
            $currentSection.offset().top;

        const relativeScroll =
            currentScroll - currentSectionTop;


        // 콘텐츠 변경
        const $activeSection =
            changePortfolioTab(index);

        if (!$activeSection.length) return;


        // 현재 위치가 탭 영역보다 위일 때만 콘텐츠까지 내려감
        if (currentScroll < tabTop) {
            requestAnimationFrame(function () {
                const targetTop =
                    $activeSection.offset().top
                    - headerHeight
                    + SCROLL_EXTRA;

                $('html, body')
                    .stop(true)
                    .animate(
                        {
                            scrollTop: targetTop
                        },
                        SCROLL_SPEED
                    );
            });

        } else {
            // 이미 콘텐츠까지 내려온 상태라면
            // 기존에 보고 있던 콘텐츠 내부 위치를 유지
            requestAnimationFrame(function () {
                const activeSectionTop =
                    $activeSection.offset().top;

                let targetTop =
                    activeSectionTop + relativeScroll;

                const maxScroll =
                    $(document).height()
                    - $window.height();

                targetTop = Math.max(
                    0,
                    Math.min(targetTop, maxScroll)
                );

                keepScrollPosition(targetTop);
            });
        }
    }


    //상단 PC 메뉴 클릭

    $('.header-right .menu li')
        .off('click.portfolio')
        .on('click.portfolio', function (e) {
            if ($window.width() <= 767) return;

            e.preventDefault();
            e.stopPropagation();

            const index = $(this).index();

            changeFromHeaderMenu(index);
        });


    //가운데 탭 메뉴 클릭

    $('.tab-menu li')
        .off('click.portfolio')
        .on('click.portfolio', function (e) {
            e.preventDefault();

            const index = $(this).index();

            // 클릭하기 전 현재 스크롤 위치 저장
            const currentScroll = $window.scrollTop();

            // 콘텐츠만 변경
            changePortfolioTab(index);

            // 가운데 탭을 눌렀을 때는 스크롤 이동 금지
            keepScrollPosition(currentScroll);
        });


    //모바일 메뉴 항목 클릭*/

    $('.mobile-menu li')
        .off('click.portfolio')
        .on('click.portfolio', function (e) {
            e.preventDefault();
            e.stopPropagation();

            const index = $(this).index();

            closeMobileMenu();
            changeFromHeaderMenu(index);
        });


    // 화면 크기 변경
    

    $window.on('resize.mobileMenu', function () {
        if ($window.width() > 767) {
            closeMobileMenu();
        }
    });
});