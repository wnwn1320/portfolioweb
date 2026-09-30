// HTML 화면이 모두 준비된 뒤 실행
$(function () {

    // 언어 선택 영역 전체 가져와서 $languageSwitcher에 저장하기
    const $languageSwitcher = $('.language-switcher');

    // KO 또는 EN 언어 버튼 가져오기
    const $languageButton = $('.language-button');

    // 버튼 안의 현재 언어 글자 가져오기
    const $languageCurrent = $('.language-current');

    // 한국어와 영어 링크 모두 가져오기
    const $languageLinks = $('.language-menu a[data-lang]');


    // 언어 메뉴 닫기
    function closeLanguageMenu() {

        // is-open 클래스 제거
        // 메뉴 숨기기
        $languageSwitcher.removeClass('is-open');

        // 메뉴가 닫힌 상태로 변경
        $languageButton.attr('aria-expanded', 'false');
    }


    // 언어 메뉴 열기
    function openLanguageMenu() {

        // is-open 클래스 추가
        // 메뉴 보이기
        $languageSwitcher.addClass('is-open');

        // 메뉴가 열린 상태로 변경
        $languageButton.attr('aria-expanded', 'true');
    }


    // KO 또는 EN 버튼 클릭
    $languageButton.on('click', function (event) {

        // 클릭 이벤트가 문서 전체로 전달되는 것 막기
        event.stopPropagation();

        // 메뉴가 현재 열려 있는지 확인
        const isOpen = $languageSwitcher.hasClass('is-open');

        // 메뉴가 열려 있을 때
        if (isOpen) {

            // 메뉴 닫기
            closeLanguageMenu();

        } else {

            // 메뉴가 닫혀 있을 때 메뉴 열기
            openLanguageMenu();
        }
    });


    // 페이지 전체 클릭
    $(document).on('click', function (event) {

        // 언어 선택 영역 바깥을 클릭했는지 확인
        if (!$(event.target).closest('.language-switcher').length) {

            // 메뉴 닫기
            closeLanguageMenu();
        }
    });


    // HTML의 lang 속성 가져오기
    // lang 속성이 없을 경우 ko 사용
    const htmlLanguage = $('html').attr('lang') || 'ko';


    // 현재 페이지 언어 확인
    // en이면 영어, 아니면 한국어
    const currentLanguage =
        htmlLanguage.toLowerCase() === 'en' ? 'en' : 'ko';


    // 현재 언어에 맞게 버튼 글자 변경
    if (currentLanguage === 'en') {

        // 영어 페이지에서 EN 표시
        $languageCurrent.text('EN');

    } else {

        // 한국어 페이지에서 KO 표시
        $languageCurrent.text('한국어');
    }


    // 언어 링크 하나씩 확인
    $languageLinks.each(function () {

        // 현재 확인 중인 링크 가져오기
        const $link = $(this);

        // 링크의 data-lang 값 가져오기
        const linkLanguage = $link.attr('data-lang');


        // 링크 언어와 현재 페이지 언어가 같을 때
        if (linkLanguage === currentLanguage) {

            // active 클래스 추가
            $link.addClass('active');

            // 현재 페이지 표시 추가
            $link.attr('aria-current', 'page');

        } else {

            // active 클래스 제거
            $link.removeClass('active');

            // 현재 페이지 표시 제거
            $link.removeAttr('aria-current');
        }
    });

});