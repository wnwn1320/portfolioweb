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

    // 포트폴리오 프로젝트 카드와 상세 모달
    const copy = document.documentElement.lang === 'en'
        ? { tools: 'Tools', contribution: 'Contribution', value: '100%', detail: 'View details', close: 'Close project details', overview: 'Project overview', planningTab: 'Planning', planningLink: 'Open planning deck', tasks: 'Key work', toolTab: 'Tools used', imageTab: 'Full image', pcImageTab: 'Detail image - PC', mobileImageTab: 'Detail image - Mobile', toolsContributionTab: 'Tools · Contribution', wireframeTab: 'Wireframe', mainVideoTab: 'Main video', shortVideoTab: 'Short-form video', animationTab: 'Animation', empty: 'Tool information will be updated soon.', video: 'Video Editing', graphic: 'Graphic Design', logo: 'Logo Design', threeD: '3D Graphic', planning: 'Planning', defaultOverview: 'A project focused on concept development, visual design, and final production.', defaultPlanning: 'Organized the project goals, target audience, concept, content structure, and production direction.', defaultTasks: '<li>Concept planning and visual direction</li><li>Design production and detail refinement</li>' }
        : { tools: '작업 툴', contribution: '개인 기여도', value: '100%', detail: '자세히 보기', close: '프로젝트 상세 닫기', overview: '프로젝트 소개', planningTab: '기획', planningLink: '기획서 열기', tasks: '주요 작업', toolTab: '사용 툴', imageTab: '상세 이미지', pcImageTab: '상세 이미지 - PC', mobileImageTab: '상세 이미지 - 모바일', toolsContributionTab: '사용 툴 · 기여도', wireframeTab: '와이어프레임', mainVideoTab: '메인 영상', shortVideoTab: '숏폼 영상', animationTab: '애니메이션', empty: '사용 툴 정보가 곧 업데이트됩니다.', video: '영상편집', graphic: '그래픽 디자인', logo: '로고 디자인', threeD: '3D 그래픽', planning: '기획', defaultOverview: '콘셉트 기획부터 비주얼 디자인과 최종 결과물 제작까지 진행한 프로젝트입니다.', defaultPlanning: '프로젝트 목표와 타깃, 콘셉트, 콘텐츠 구성 및 제작 방향을 정리했습니다.', defaultTasks: '<li>콘셉트 기획 및 비주얼 방향 설정</li><li>디자인 제작 및 디테일 보정</li>' };
    const projectInfoCopy = document.documentElement.lang === 'en'
        ? { heading: 'Project Information', projectType: 'Project Type', goal: 'Goal', scope: 'Scope', role: 'Role' }
        : { heading: '프로젝트 정보', projectType: '프로젝트 유형', goal: '목표', scope: '작업 범위', role: '담당 역할' };
    const projectGalleryCopy = document.documentElement.lang === 'en'
        ? { adminTab: 'Admin', processTab: 'Page overview' }
        : { adminTab: '관리자 화면', processTab: '페이지 구성' };

    const $modal = $(`
        <div class="project-modal" aria-hidden="true">
            <div class="project-modal__backdrop" data-modal-close></div>
            <section class="project-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="project-modal-title">
                <button class="project-modal__close" type="button" data-modal-close aria-label="${copy.close}">×</button>
                <div class="project-modal__hero"><img src="" alt=""></div>
                <div class="project-modal__body">
                    <p class="project-modal__eyebrow"></p>
                    <h3 id="project-modal-title"></h3>
                    <div class="project-modal__tabs" role="tablist"></div>
                    <div class="project-modal__panels"></div>
                </div>
            </section>
        </div>`).appendTo('body');
    let lastTrigger = null;
    const sampleVideoUrl = 'https://www.youtube.com/embed/HHBsvKnCkwI?si=FdRYDXf0nYGUDKrp';

    function videoEmbedUrl(url) {
        const pageOrigin = window.location.origin && window.location.origin !== 'null'
            ? window.location.origin
            : '';
        return `${url}${url.includes('?') ? '&' : '?'}rel=0${pageOrigin ? `&origin=${encodeURIComponent(pageOrigin)}` : ''}`;
    }

    function videoTabHtml(url, title, isShort) {
        return `<div class="project-tab-video${isShort ? ' project-tab-video--short' : ''}"><iframe class="project-modal__video" src="${url}" data-src="${url}" title="${title}" loading="lazy" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>`;
    }

    function planningTabHtml(data) {
        const planningImage = data.planningImage
            ? `<figure class="project-planning-image"><img src="${data.planningImage}" alt="${data.planningImageAlt}" loading="lazy"></figure>`
            : '';

        const planningLink = data.planningLink
            ? `<a class="project-planning-link" href="${data.planningLink}" target="_blank" rel="noopener noreferrer">${copy.planningLink}</a>`
            : '';

        return `<p>${data.planning}</p>${planningLink}${planningImage}`;
    }

    function overviewTabHtml(data) {
        const infoRows = [
            [projectInfoCopy.projectType, data.projectType],
            [projectInfoCopy.goal, data.projectGoal],
            [projectInfoCopy.scope, data.projectScope],
            [projectInfoCopy.role, data.projectRole]
        ].filter(([, value]) => value);
        const infoBox = infoRows.length
            ? `<section class="project-info-box"><h4>${projectInfoCopy.heading}</h4><dl>${infoRows.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')}</dl></section>`
            : '';

        return `<p>${data.overview}</p>${infoBox}`;
    }

    function detailGalleryHtml(data, label) {
        const images = data.detailImages.length ? data.detailImages : [data.detailImage];
        const labels = data.galleryLabels || [];
        const galleryClass = data.galleryClass ? ` ${data.galleryClass}` : '';
        const isSingle = images.length === 1;

        return `<div class="project-detail-slider${isSingle ? ' is-single' : ''}" data-detail-slider>
            <button class="project-detail-slider__button project-detail-slider__prev" type="button" aria-label="Previous image"><span aria-hidden="true">‹</span></button>
            <div class="project-detail-gallery${galleryClass}">${images.map((src, index) => `<figure>${labels[index] ? `<figcaption><span class="project-detail-gallery__title">${labels[index]}</span><span class="project-detail-gallery__count">${String(index + 1).padStart(2, '0')} / ${String(images.length).padStart(2, '0')}</span></figcaption>` : ''}<img src="${src}" alt="${labels[index] || `${data.title} ${label} ${index + 1}`}" loading="lazy"></figure>`).join('')}</div>
            <button class="project-detail-slider__button project-detail-slider__next" type="button" aria-label="Next image"><span aria-hidden="true">›</span></button>
        </div>`;
    }

    function projectData($slide) {
        const $desc = $slide.find('.web-desc').first();
        const $details = $slide.find('.project-details').first();
        const $skill = $desc.find('.skill').first();
        const $section = $slide.closest('.tab-items > section');
        const index = $slide.index() + 1;
        const isVideo = $section.hasClass('video-editing');
        const isWeb = $section.hasClass('web-design');
        const isGraphic = $section.hasClass('graphic-design');
        const isLogo = $section.hasClass('logo-design');
        const isPlanning = $section.hasClass('planning-design');
        const type = isVideo ? copy.video : isWeb ? 'WEB DESIGN' : isGraphic ? copy.graphic : isLogo ? copy.logo : isPlanning ? copy.planning : copy.threeD;
        const defaultTools = isVideo ? 'Premiere Pro · After Effects' : isGraphic ? 'Photoshop · Illustrator' : isLogo ? 'Illustrator' : isPlanning ? 'PowerPoint · Figma' : 'Blender';
        const rawSrc = $slide.children('img').attr('src') || $slide.find('.project-visual > img').attr('src') || '';
        const detailMainVideo = $details.find('.project-main-video').first().attr('href') || '';
        const detailShortVideo = $details.find('.project-short-video').first().attr('href') || '';
        const baseVideoUrl = detailMainVideo || $slide.attr('data-video') || $slide.attr('data-main-video') || $slide.find('iframe').first().attr('src') || sampleVideoUrl;
        const mainVideoSource = detailMainVideo || $slide.attr('data-main-video') || baseVideoUrl;
        const shortVideoSource = detailShortVideo || $slide.attr('data-short-video') || '';
        const videoUrl = isVideo ? videoEmbedUrl(baseVideoUrl) : '';
        const fileTitle = decodeURIComponent(rawSrc.split('/').pop() || '').replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
        const numberedTitle = `${type} ${String(index).padStart(2, '0')}`;
        const tools = $skill.find('img').map(function () {
            return this.alt.replace(/\s*(logo)?$/i, '').trim();
        }).get().filter(Boolean);
        const gallery = function (name) {
            const $items = $details.find(`.project-gallery--${name} figure`);
            return {
                images: $items.find('img').map(function () { return $(this).attr('src'); }).get().filter(Boolean),
                labels: $items.map(function () {
                    return $.trim($(this).find('figcaption').first().text()) || $(this).find('img').attr('alt') || '';
                }).get()
            };
        };
        const pcGallery = gallery('pc');
        const mobileGallery = gallery('mobile');
        const adminGallery = gallery('admin');
        const processGallery = gallery('process');
        const detailsTitle = $.trim($details.find('.project-title').first().text());
        const detailsOverview = $details.find('.project-overview').first().html();
        const detailsTasks = $details.find('.project-tasks > li').map(function () { return `<li>${$(this).html()}</li>`; }).get().join('');
        const detailsTools = $.trim($details.find('.project-tools').first().text());
        const detailsContribution = $.trim($details.find('.project-contribution').first().text());
        const detailGallery = gallery('detail');
        const detailVideos = $details.find('.project-videos a').map(function () { return $(this).attr('href'); }).get().filter(Boolean);
        const detailVideoLabels = $details.find('.project-videos a').map(function () { return $.trim($(this).text()); }).get();
        const detailPlanning = $details.find('.project-planning').first().html();
        const detailPlanningLink = $details.find('.project-planning-link').first().attr('href') || '';
        const $detailPlanningImage = $details.find('.project-planning-image').first();
        return {
            title: detailsTitle || $slide.attr('data-title') || $.trim($desc.find('strong').first().text()) || (isLogo && !/^https?:/.test(rawSrc) ? fileTitle : numberedTitle),
            type: type,
            isWeb: isWeb,
            isGraphic: isGraphic,
            isLogo: isLogo,
            isThreeD: !isVideo && !isWeb && !isGraphic && !isLogo && !isPlanning,
            isPlanning: isPlanning,
            image: rawSrc,
            isVideo: isVideo,
            videoUrl: videoUrl,
            hasVideoTabs: isVideo && Boolean(shortVideoSource),
            mainVideoUrl: isVideo ? videoEmbedUrl(mainVideoSource) : '',
            shortVideoUrl: shortVideoSource ? videoEmbedUrl(shortVideoSource) : '',
            videos: detailVideos.length ? detailVideos.map(videoEmbedUrl) : ($slide.attr('data-videos') || '').split('|').filter(Boolean).map(videoEmbedUrl),
            videoLabels: detailVideoLabels.length ? detailVideoLabels : ($slide.attr('data-video-labels') || '').split('|').filter(Boolean),
            detailImage: pcGallery.images[0] || $slide.attr('data-detail-image') || rawSrc,
            detailImages: detailGallery.images.length ? detailGallery.images : ($slide.attr('data-detail-images') || '').split('|').filter(Boolean),
            galleryClass: $details.find('.project-gallery--continuous').length ? 'project-detail-gallery--continuous' : '',
            mobileImage: $slide.attr('data-mobile-image') || '',
            pcImages: pcGallery.images.length ? pcGallery.images : ($slide.attr('data-pc-images') || '').split('|').filter(Boolean),
            pcLabels: pcGallery.labels.length ? pcGallery.labels : ($slide.attr('data-pc-labels') || '').split('|').filter(Boolean),
            mobileImages: mobileGallery.images.length ? mobileGallery.images : ($slide.attr('data-mobile-images') || '').split('|').filter(Boolean),
            mobileLabels: mobileGallery.labels.length ? mobileGallery.labels : ($slide.attr('data-mobile-labels') || '').split('|').filter(Boolean),
            adminImages: adminGallery.images.length ? adminGallery.images : ($slide.attr('data-admin-images') || '').split('|').filter(Boolean),
            adminLabels: adminGallery.labels.length ? adminGallery.labels : ($slide.attr('data-admin-labels') || '').split('|').filter(Boolean),
            processImages: processGallery.images.length ? processGallery.images : ($slide.attr('data-process-images') || '').split('|').filter(Boolean),
            processLabels: processGallery.labels.length ? processGallery.labels : ($slide.attr('data-process-labels') || '').split('|').filter(Boolean),
            wireframeImage: $slide.attr('data-wireframe-image') || '',
            hasImageTab: isWeb || isGraphic,
            hasPlanningTab: isVideo || isPlanning,
            overview: detailsOverview || $slide.attr('data-overview') || $desc.find('.web-desc-text > p').first().html() || copy.defaultOverview,
            overviewTabLabel: $slide.attr('data-overview-tab-label') || copy.overview,
            tasksTabLabel: $slide.attr('data-tasks-tab-label') || copy.tasks,
            toolsTabLabel: $slide.attr('data-tools-tab-label') || copy.toolTab,
            projectType: $.trim($details.find('.project-type').first().text()) || $slide.attr('data-project-type') || '',
            projectGoal: $.trim($details.find('.project-goal').first().text()) || $slide.attr('data-project-goal') || '',
            projectScope: $.trim($details.find('.project-scope').first().text()) || $slide.attr('data-project-scope') || '',
            projectRole: $.trim($details.find('.project-role').first().text()) || $slide.attr('data-project-role') || '',
            planning: detailPlanning || $slide.attr('data-planning') || copy.defaultPlanning,
            planningLink: detailPlanningLink || $slide.attr('data-planning-link') || '',
            planningImage: $detailPlanningImage.attr('src') || $slide.attr('data-planning-image') || '',
            planningImageAlt: $detailPlanningImage.attr('alt') || $slide.attr('data-planning-image-alt') || `${detailsTitle || $slide.attr('data-title') || numberedTitle} ${copy.planningTab}`,
            tasks: detailsTasks || $slide.attr('data-tasks') || $desc.find('.web-desc-text > ul > li').not(':has(.skill)').map(function () { return `<li>${$(this).html()}</li>`; }).get().join('') || copy.defaultTasks,
            skill: $skill.length ? $skill.prop('outerHTML') : '',
            tools: detailsTools || $slide.attr('data-tools') || tools.join(' · ') || defaultTools || copy.empty,
            contribution: detailsContribution || $slide.attr('data-contribution') || copy.value
        };
    }

    $('.video-editing .swiper-slide, .web-design .swiper-slide, .graphic-design .swiper-slide, .logo-design .swiper-slide, .threeD-graphic .swiper-slide, .planning-design .swiper-slide').each(function () {
        const $slide = $(this);
        if ($slide.children('.project-visual').length) return;
        const data = projectData($slide);
        let $media = $slide.children('img, iframe').first();
        if (!$media.length) return;
        if (data.isVideo && !$media.is('iframe')) {
            const $iframe = $(`<iframe class="project-video" src="${data.videoUrl}" title="${data.title}" loading="lazy" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`);
            $media.replaceWith($iframe);
            $media = $iframe;
        }
        if (data.isVideo) {
            $media
                .addClass('project-video')
                .attr('referrerpolicy', 'strict-origin-when-cross-origin')
                .attr('src', data.videoUrl);
        }
        $media.wrap('<div class="project-visual"></div>');
        if (data.isGraphic && $media.is('img')) {
            const escapedImage = new URL(data.image, document.baseURI).href.replace(/["\\]/g, '\\$&');
            $slide.children('.project-visual')[0]?.style.setProperty('--project-image', `url("${escapedImage}")`);
        }
        $media.after(`<div class="project-summary"><strong>${data.title}</strong><div class="project-summary__detail"><dl><div><dt>${copy.tools}</dt><dd>${data.tools}</dd></div><div><dt>${copy.contribution}</dt><dd>${data.contribution}</dd></div></dl><button class="project-detail-button" type="button">${copy.detail}</button></div></div>`);
        $slide.children('.project-visual').after(data.isVideo
            ? `<div class="project-card-title project-card-title--video"><span>${data.title}</span><button class="project-detail-button" type="button">${copy.detail}</button></div>`
            : `<p class="project-card-title">${data.title}</p>`);
        $slide.addClass('portfolio-project');
    });

    // 웹디자인 썸네일은 첫 번째 이미지 비율로 통일한다.
    // 세로로 긴 원본은 축소해 전부 노출하지 않고 동일한 프레임 안에서 잘라낸다.
    const webDesignSection = document.querySelector('.web-design');
    const firstWebThumbnail = webDesignSection?.querySelector('.swiper-slide:first-child .project-visual > img');

    function setWebThumbnailRatio() {
        if (!webDesignSection || !firstWebThumbnail?.naturalWidth || !firstWebThumbnail?.naturalHeight) return;
        webDesignSection.style.setProperty(
            '--web-thumbnail-ratio',
            `${firstWebThumbnail.naturalWidth} / ${firstWebThumbnail.naturalHeight}`
        );
        webDesignSection.querySelector('.swiper')?.swiper?.update();
    }

    if (firstWebThumbnail?.complete) {
        setWebThumbnailRatio();
    } else {
        firstWebThumbnail?.addEventListener('load', setWebThumbnailRatio, { once: true });
    }

    // 세로형·가로형 영상의 높이가 달라도 내비게이션은 현재 영상 화면의 중앙에 둔다.
    const videoSwiperElement = document.querySelector('.video-editing .inner.swiper');

    function updateVideoNavigationPosition() {
        if (!videoSwiperElement) return;

        window.requestAnimationFrame(function () {
            const activeVisual = videoSwiperElement.querySelector('.swiper-slide-active .project-visual');
            if (!activeVisual) return;

            const containerRect = videoSwiperElement.getBoundingClientRect();
            const visualRect = activeVisual.getBoundingClientRect();
            const visualCenter = visualRect.top - containerRect.top + (visualRect.height / 2);

            videoSwiperElement.style.setProperty('--video-nav-center', `${visualCenter}px`);
        });
    }

    if (videoSwiperElement && videoSwiperElement.swiper) {
        videoSwiperElement.swiper.on('slideChange', updateVideoNavigationPosition);
        videoSwiperElement.swiper.on('resize', updateVideoNavigationPosition);
        videoSwiperElement.swiper.on('observerUpdate', updateVideoNavigationPosition);
    }

    if (videoSwiperElement && 'ResizeObserver' in window) {
        new ResizeObserver(updateVideoNavigationPosition).observe(videoSwiperElement);
    }

    window.addEventListener('resize', updateVideoNavigationPosition);
    updateVideoNavigationPosition();

    // 그래픽 슬라이더 화살표를 섹션이 아닌 실제 썸네일의 세로 중앙에 맞춘다.
    const graphicSwiperElement = document.querySelector('.graphic-design.swiper');

    function updateGraphicNavigationPosition() {
        if (!graphicSwiperElement) return;

        window.requestAnimationFrame(function () {
            const activeVisual = graphicSwiperElement.querySelector('.swiper-slide-active .project-visual');
            if (!activeVisual) return;

            const containerRect = graphicSwiperElement.getBoundingClientRect();
            const visualRect = activeVisual.getBoundingClientRect();
            const visualCenter = visualRect.top - containerRect.top + (visualRect.height / 2);

            graphicSwiperElement.style.setProperty('--graphic-nav-center', `${visualCenter}px`);
        });
    }

    if (graphicSwiperElement?.swiper) {
        graphicSwiperElement.swiper.on('slideChange', updateGraphicNavigationPosition);
        graphicSwiperElement.swiper.on('resize', updateGraphicNavigationPosition);
        graphicSwiperElement.swiper.on('observerUpdate', updateGraphicNavigationPosition);
    }

    if (graphicSwiperElement && 'ResizeObserver' in window) {
        new ResizeObserver(updateGraphicNavigationPosition).observe(graphicSwiperElement);
    }

    window.addEventListener('resize', updateGraphicNavigationPosition);
    updateGraphicNavigationPosition();

    function openModal($slide, trigger) {
        const data = projectData($slide);
        let tabs;
        $modal.find('.project-modal__hero').toggleClass('project-modal__hero--logo', data.isLogo);
        if (data.isVideo && data.hasVideoTabs) {
            tabs = [
                { label: copy.mainVideoTab, html: videoTabHtml(data.mainVideoUrl, `${data.title} ${copy.mainVideoTab}`, false) },
                { label: copy.shortVideoTab, html: videoTabHtml(data.shortVideoUrl, `${data.title} ${copy.shortVideoTab}`, true) },
                { label: copy.overview, html: overviewTabHtml(data) },
                { label: copy.planningTab, html: planningTabHtml(data) },
                { label: copy.tasks, html: `<ul>${data.tasks}</ul>` },
                { label: copy.toolTab, html: `${data.skill}<p>${data.tools}</p><p>${copy.contribution}: ${data.contribution}</p>` }
            ];
        } else if (data.isWeb) {
            const pcGallery = data.pcImages.length ? data.pcImages : [data.detailImage];
            tabs = [
                { label: copy.pcImageTab, html: detailGalleryHtml({ ...data, detailImages: pcGallery, galleryLabels: data.pcLabels }, copy.pcImageTab) }
            ];
            const mobileGallery = data.mobileImages.length ? data.mobileImages : (data.mobileImage ? [data.mobileImage] : []);
            if (mobileGallery.length) tabs.push({ label: copy.mobileImageTab, html: detailGalleryHtml({ ...data, detailImages: mobileGallery, galleryLabels: data.mobileLabels, galleryClass: 'project-detail-gallery--mobile' }, copy.mobileImageTab) });
            if (data.adminImages.length) tabs.push({ label: projectGalleryCopy.adminTab, html: detailGalleryHtml({ ...data, detailImages: data.adminImages, galleryLabels: data.adminLabels }, projectGalleryCopy.adminTab) });
            if (data.processImages.length) tabs.push({ label: projectGalleryCopy.processTab, html: detailGalleryHtml({ ...data, detailImages: data.processImages, galleryLabels: data.processLabels }, projectGalleryCopy.processTab) });
            tabs.push(
                { label: copy.overview, html: overviewTabHtml(data) },
                { label: copy.toolsContributionTab, html: `${data.skill}<p>${data.tools}</p><p>${copy.contribution}: ${data.contribution}</p>` }
            );
            if (data.wireframeImage) tabs.push({ label: copy.wireframeTab, html: `<div class="project-detail-image"><img src="${data.wireframeImage}" alt="${data.title} ${copy.wireframeTab}"></div>` });
        } else if (data.isGraphic) {
            tabs = [
                { label: copy.imageTab, html: detailGalleryHtml(data, copy.imageTab) },
                { label: copy.overview, html: overviewTabHtml(data) },
                { label: copy.tasks, html: `<ul>${data.tasks}</ul>` },
                { label: copy.toolTab, html: `${data.skill}<p>${data.tools}</p><p>${copy.contribution}: ${data.contribution}</p>` }
            ];
        } else if (data.isPlanning) {
            tabs = [
                { label: copy.overview, html: overviewTabHtml(data) },
                { label: copy.imageTab, html: `<div class="project-detail-image"><img src="${data.detailImage}" alt="${data.title} ${copy.imageTab}"></div>` },
                { label: copy.tasks, html: `<ul>${data.tasks}</ul>` },
                { label: copy.toolTab, html: `${data.skill}<p>${data.tools}</p><p>${copy.contribution}: ${data.contribution}</p>` }
            ];
        } else {
            tabs = [{ label: data.overviewTabLabel, html: overviewTabHtml(data) }];
            if (data.isThreeD && data.videos.length) {
                data.videos.forEach((url, index) => {
                    const label = data.videoLabels[index] || `${copy.animationTab} ${String(index + 1).padStart(2, '0')}`;
                    tabs.push({ label: label, html: videoTabHtml(url, `${data.title} ${label}`, true) });
                });
            }
            if (data.hasPlanningTab) tabs.push({ label: copy.planningTab, html: planningTabHtml(data) });
            tabs.push(
                { label: data.tasksTabLabel, html: `<ul>${data.tasks}</ul>` },
                { label: data.toolsTabLabel, html: `${data.skill}<p>${data.tools}</p><p>${copy.contribution}: ${data.contribution}</p>` }
            );
        }
        if (data.isVideo && !data.hasVideoTabs) {
            $modal.find('.project-modal__hero').removeClass('is-hidden').html(`<iframe class="project-modal__video" src="${data.videoUrl}" title="${data.title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`);
        } else if (data.isLogo || data.isThreeD) {
            $modal.find('.project-modal__hero').removeClass('is-hidden').html(`<img src="${data.image}" alt="${data.title}">`);
        } else {
            $modal.find('.project-modal__hero').addClass('is-hidden').empty();
        }
        $modal.find('.project-modal__eyebrow').text(data.type);
        $modal.find('#project-modal-title').text(data.title);
        $modal.find('.project-modal__tabs').html(tabs.map((tab, i) => `<button type="button" role="tab" aria-selected="${i === 0}" aria-controls="project-panel-${i}" id="project-tab-${i}" tabindex="${i === 0 ? 0 : -1}">${tab.label}</button>`).join(''));
        $modal.find('.project-modal__panels').html(tabs.map((tab, i) => `<div class="project-modal__panel" id="project-panel-${i}" role="tabpanel" aria-labelledby="project-tab-${i}" ${i === 0 ? '' : 'hidden'}>${tab.html}</div>`).join(''));
        $modal.find('.project-modal__panel[hidden] .project-modal__video').attr('src', '');
        lastTrigger = trigger;
        $modal.addClass('is-open').attr('aria-hidden', 'false');
        $('body').addClass('project-modal-open');
        window.requestAnimationFrame(function () {
            $modal.find('.project-modal__panel:not([hidden]) [data-detail-slider]').each(function () {
                updateDetailSlider(this);
            });
        });
        $modal.find('.project-modal__close').trigger('focus');
    }

    function updateDetailSlider(slider) {
        const track = slider.querySelector('.project-detail-gallery');
        const slides = track ? track.querySelectorAll('figure') : [];
        if (!track || !slides.length || !track.clientWidth) return;
        const index = Math.min(slides.length - 1, Math.max(0, Math.round(track.scrollLeft / track.clientWidth)));
        positionDetailSliderArrows(slider);
    }

    function positionDetailSliderArrows(slider) {
        const dialog = slider.closest('.project-modal__dialog');
        const gallery = slider.querySelector('.project-detail-gallery');
        if (!dialog || !gallery) return;

        const dialogRect = dialog.getBoundingClientRect();
        const sliderRect = slider.getBoundingClientRect();
        const galleryRect = gallery.getBoundingClientRect();
        const visibleTop = Math.max(dialogRect.top, galleryRect.top);
        const visibleBottom = Math.min(dialogRect.bottom, galleryRect.bottom);
        const isVisible = visibleBottom > visibleTop;
        const targetY = isVisible ? (visibleTop + visibleBottom) / 2 : galleryRect.top;
        const top = Math.max(54, Math.min(slider.offsetHeight - 54, targetY - sliderRect.top));

        slider.style.setProperty('--detail-arrow-top', `${top}px`);
        slider.classList.toggle('is-outside-view', !isVisible);
    }

    $modal.on('click', '.project-detail-slider__button', function () {
        const slider = this.closest('[data-detail-slider]');
        const track = slider.querySelector('.project-detail-gallery');
        const slides = track.querySelectorAll('figure');
        const direction = this.classList.contains('project-detail-slider__next') ? 1 : -1;
        const currentIndex = Math.min(slides.length - 1, Math.max(0, Math.round(track.scrollLeft / track.clientWidth)));
        const targetIndex = (currentIndex + direction + slides.length) % slides.length;
        track.scrollTo({ left: targetIndex * track.clientWidth, behavior: 'smooth' });
    });

    $modal[0].addEventListener('scroll', function (event) {
        const track = event.target.closest?.('.project-detail-gallery');
        if (track) {
            updateDetailSlider(track.closest('[data-detail-slider]'));
            return;
        }
        if (event.target.classList?.contains('project-modal__dialog')) {
            event.target.querySelectorAll('.project-modal__panel:not([hidden]) [data-detail-slider]').forEach(positionDetailSliderArrows);
        }
    }, true);

    $modal[0].addEventListener('load', function (event) {
        const slider = event.target.closest?.('[data-detail-slider]');
        if (slider) updateDetailSlider(slider);
    }, true);

    window.addEventListener('resize', function () {
        $modal.find('.project-modal__panel:not([hidden]) [data-detail-slider]').each(function () {
            positionDetailSliderArrows(this);
        });
    });

    function closeModal() {
        if (!$modal.hasClass('is-open')) return;
        $modal.removeClass('is-open').attr('aria-hidden', 'true');
        $('body').removeClass('project-modal-open');
        $modal.find('.project-modal__video').attr('src', '');
        $('.portfolio-project').removeClass('is-expanded');
        if (lastTrigger) {
            const trigger = lastTrigger;
            lastTrigger = null;
            trigger.focus({ preventScroll: true });
            trigger.blur();
        }
    }

    $(document).on('click.projectModal', '.project-detail-button', function (e) {
        e.preventDefault(); e.stopPropagation();
        openModal($(this).closest('.swiper-slide'), this);
    });
    $(document).on('click.projectCard', '.project-visual', function (e) {
        if (window.matchMedia('(hover: hover)').matches || $(e.target).closest('.project-detail-button').length) return;
        const $card = $(this).closest('.portfolio-project');
        $('.portfolio-project').not($card).removeClass('is-expanded');
        $card.toggleClass('is-expanded');
    });
    $modal.on('click.projectModal', '[data-modal-close]', closeModal);
    $modal.on('click.projectModal', '[role="tab"]', function () {
        const index = $(this).index();
        $modal.find('[role="tab"]').attr({ 'aria-selected': 'false', tabindex: -1 });
        $(this).attr({ 'aria-selected': 'true', tabindex: 0 });
        const $panels = $modal.find('.project-modal__panel');
        $panels.find('.project-modal__video').attr('src', '');
        const $activePanel = $panels.attr('hidden', true).eq(index).removeAttr('hidden');
        $activePanel.find('.project-modal__video').each(function () {
            $(this).attr('src', $(this).attr('data-src'));
        });
        $activePanel.find('[data-detail-slider]').each(function () {
            const track = this.querySelector('.project-detail-gallery');
            if (track) track.scrollLeft = 0;
            updateDetailSlider(this);
        });
    });
    $(document).on('keydown.projectModal', function (e) { if (e.key === 'Escape') closeModal(); });
});
