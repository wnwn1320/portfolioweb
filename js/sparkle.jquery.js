(function ($, window, document) {

  $.fn.sparkle = function (options) {

    return this.each(function () {

      const $this = $(this);

      $.destroySparkle = $.destroySparkle || {};

      const id =
        $this.data("sparkle-id") ||
        Date.now() + Math.random();

      // 반짝이 제거
      if (options === "destroy") {
        $.destroySparkle[id] = true;
        $this.data("sparkle-id", null);
        $(".my-sparkle").remove();
        return;
      }

      const settings = $.extend({

        fill: "#ffffff",
        stroke: "#999999",

        // 반짝이 크기 범위
        sizeMin: 12,
        sizeMax: 28,

        // 한 번에 생성되는 반짝이 개수
        countMin: 3,
        countMax: 4,

        // 처음 나타나는 시간
        fadeInDuration: 700,

        // 완전히 나타난 상태로 머무는 시간
        holdDuration: 1800,

        // 천천히 사라지는 시간
        fadeOutDuration: 1600,

        // 다음 반짝이 묶음까지 기다리는 시간
        pause: 700,

        // 첫 실행 대기 시간
        delay: 0,

        // 반짝이가 나오지 않을 영역
        exclude: ".no-sparkle",

        // 제외 영역 주변 여백
        excludeGap: 5,

        // 반짝이끼리 떨어지는 간격
        starGap: 10

      }, options);

      // 랜덤 정수 생성
      function randomNumber(min, max) {
        return Math.floor(
          Math.random() * (max - min + 1)
        ) + min;
      }

      // 제외 영역과 겹치는지 확인
      function isOverExcludedArea(left, top, size) {

        const starRect = {
          left: left,
          top: top,
          right: left + size,
          bottom: top + size
        };

        let overlapping = false;

        $(settings.exclude).each(function () {

          const rect = this.getBoundingClientRect();
          const gap = settings.excludeGap;

          const excludeRect = {
            left: rect.left - gap,
            top: rect.top - gap,
            right: rect.right + gap,
            bottom: rect.bottom + gap
          };

          const overlaps =
            starRect.left < excludeRect.right &&
            starRect.right > excludeRect.left &&
            starRect.top < excludeRect.bottom &&
            starRect.bottom > excludeRect.top;

          if (overlaps) {
            overlapping = true;
            return false;
          }

        });

        return overlapping;
      }

      // 같은 묶음의 다른 반짝이와 겹치는지 확인
      function isOverOtherStar(left, top, size, positions) {

        const gap = settings.starGap;

        return positions.some(function (position) {

          return (
            left < position.left + position.size + gap &&
            left + size + gap > position.left &&
            top < position.top + position.size + gap &&
            top + size + gap > position.top
          );

        });
      }

      // 안전한 위치 생성
      function getSafeCoordinates(size, positions) {

        const maxLeft = Math.max(
          window.innerWidth - size,
          0
        );

        const maxTop = Math.max(
          window.innerHeight - size,
          0
        );

        for (let i = 0; i < 150; i++) {

          const left = Math.random() * maxLeft;
          const top = Math.random() * maxTop;

          const overExcluded =
            isOverExcludedArea(left, top, size);

          const overOtherStar =
            isOverOtherStar(left, top, size, positions);

          if (!overExcluded && !overOtherStar) {
            return {
              left: left,
              top: top,
              size: size
            };
          }

        }

        return null;
      }

      // 반짝이 SVG 생성
      function createStar(size) {

        return $(`
          <svg
            class="my-sparkle"
            viewBox="0 0 50 50"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              fill="${settings.fill}"
              stroke="${settings.stroke}"
              stroke-width="1"
              stroke-linejoin="round"
              d="
                M 0.622 25
                L 20.690 20.677
                L 25 0.543
                L 29.309 20.677
                L 49.378 25
                L 29.309 29.323
                L 25 49.457
                L 20.690 29.323
                Z
              "
            />
          </svg>
        `).css({
          position: "fixed",
          width: size + "px",
          height: size + "px",
          zIndex: 9999,
          pointerEvents: "none",
          display: "block",
          opacity: 0,
          transform: "scale(0.3) rotate(0deg)",
          transformOrigin: "center",
          willChange: "opacity, transform"
        });
      }

      // 반짝이 하나 애니메이션
      function animateStar(position) {

        const $star = createStar(position.size);

        $star.css({
          left: position.left + "px",
          top: position.top + "px"
        });

        $this.append($star);

        // 애니메이션 재실행
        void $star[0].offsetWidth;

        // 천천히 나타나기
        $star.css({
          transition:
            "opacity " + settings.fadeInDuration + "ms ease-out, " +
            "transform " + settings.fadeInDuration + "ms ease-out",
          opacity: 1,
          transform: "scale(1) rotate(120deg)"
        });

        // 나타난 상태로 머문 뒤 천천히 사라지기
        window.setTimeout(function () {

          $star.css({
            transition:
              "opacity " + settings.fadeOutDuration + "ms ease-in-out, " +
              "transform " + settings.fadeOutDuration + "ms ease-in-out",
            opacity: 0,
            transform: "scale(0.75) rotate(220deg)"
          });

        }, settings.fadeInDuration + settings.holdDuration);

        // 완전히 사라진 뒤 요소 제거
        window.setTimeout(function () {

          $star.remove();

        },
        settings.fadeInDuration +
        settings.holdDuration +
        settings.fadeOutDuration);

      }

      // 반짝이 묶음 생성
      function createSparkleGroup() {

        if ($.destroySparkle[id]) {
          $(".my-sparkle").remove();
          return;
        }

        const count = randomNumber(
          settings.countMin,
          settings.countMax
        );

        const positions = [];

        for (let i = 0; i < count; i++) {

          const randomSize = randomNumber(
            settings.sizeMin,
            settings.sizeMax
          );

          const coordinates =
            getSafeCoordinates(randomSize, positions);

          if (coordinates) {
            positions.push(coordinates);
          }

        }

        positions.forEach(function (position) {
          animateStar(position);
        });

        const totalAnimationTime =
          settings.fadeInDuration +
          settings.holdDuration +
          settings.fadeOutDuration +
          settings.pause;

        window.setTimeout(function () {

          if (!$.destroySparkle[id]) {
            createSparkleGroup();
          }

        }, totalAnimationTime);

      }

      $.destroySparkle[id] = false;
      $this.data("sparkle-id", id);

      window.setTimeout(function () {
        createSparkleGroup();
      }, settings.delay);

    });

  };

})(jQuery, window, document);


// body 전체에 반짝이 실행
$(function () {

  $("body").sparkle({

    fill: "#ffffff",
    stroke: "#999999",

    // 각 반짝이 크기
    sizeMin: 12,
    sizeMax: 28,

    // 한 번에 3개~5개
    countMin: 3,
    countMax: 5,

    // 나타나는 데 1초
    fadeInDuration: 1000,

    // 나타난 상태로 1초 머무름
    holdDuration: 1000,

    // 1.6초 동안 천천히 사라짐
    fadeOutDuration: 1600,

    // 다음 묶음까지 0.7초 대기
    pause: 700,

    delay: 0,

    exclude: ".no-sparkle",
    excludeGap: 5,
    starGap: 10

  });

});