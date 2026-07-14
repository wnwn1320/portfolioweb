// HTML 화면 준비 후 실행
document.addEventListener('DOMContentLoaded', function () {

    // 모바일에서는 키링 기능 실행하지 않기
    if (window.matchMedia('(max-width: 767px)').matches) {
        return;
    }


    // 배너 영역 가져오기
    const banner =
        document.querySelector('.banner');

    // 키링 위치 영역 가져오기
    const keyringPosition =
        document.querySelector('.keyring-position');

    // 키링 파츠 전체 묶음 가져오기
    const keyringSet =
        document.querySelector('.keyring-set');

    // 키링 전체를 움직일 메인 고리 가져오기
    const keyringHandle =
        document.querySelector('.keyring-handle');

    // 개별로 움직일 참 모두 가져오기
    const charms =
        document.querySelectorAll('.keyring-charm');

    // 드래그 안내 말풍선 가져오기
    const dragTooltip =
        document.querySelector('.drag-tooltip');

    // 필요한 HTML 요소가 없을 경우 실행 끝내기
    if (
        !banner ||
        !keyringPosition ||
        !keyringSet ||
        !keyringHandle
    ) {
        return;
    }


    // 숫자를 최소값과 최대값 사이로 제한하기
    function limitNumber(number, min, max) {
        return Math.max(
            min,
            Math.min(max, number)
        );
    }


    // 각도를 -60도부터 60도 사이로 정리하기
    function normalizeAngle(angle) {

        while (angle > 180) {
            angle -= 360;
        }

        while (angle < -180) {
            angle += 360;
        }

        return angle;
    }



    /* ==================================================
       메인 고리로 키링 전체 움직이기
    ================================================== */

    // 키링 전체 현재 이동값
    let keyringX = 0;
    let keyringY = 0;

    // 키링 전체 드래그 상태
    let isKeyringDragging = false;

    // 드래그 시작 마우스 위치
    let startPointerX = 0;
    let startPointerY = 0;

    // 드래그 시작 당시 키링 위치
    let startKeyringX = 0;
    let startKeyringY = 0;

    // 키링 이동 가능 범위
    let minKeyringX = 0;
    let maxKeyringX = 0;
    let minKeyringY = 0;
    let maxKeyringY = 0;


    // 키링 전체 위치 화면에 적용하기
    function drawKeyring() {

        keyringSet.style.transform =
            `translate3d(
                ${keyringX}px,
                ${keyringY}px,
                0
            )`;
    }


    // 메인 고리 누르기
    keyringHandle.addEventListener(
        'pointerdown',
        function (event) {

            // 마우스 왼쪽 버튼만 사용하기
            if (
                event.pointerType === 'mouse' &&
                event.button !== 0
            ) {
                return;
            }


            // 기본 이미지 드래그 막기
            event.preventDefault();

            // 드래그 안내 말풍선 숨기기
            if (dragTooltip) {
                dragTooltip.classList.add('hide');
            }
            // 키링 전체 드래그 시작
            isKeyringDragging = true;

            
            // 드래그 상태 클래스 추가
            keyringSet.classList.add('is-dragging');


            // 시작 마우스 위치 저장
            startPointerX = event.clientX;
            startPointerY = event.clientY;


            // 현재 키링 이동값 저장
            startKeyringX = keyringX;
            startKeyringY = keyringY;


            // 배너 위치와 크기 가져오기
            const bannerRect =
                banner.getBoundingClientRect();

            // 키링 위치와 크기 가져오기
            const keyringRect =
                keyringSet.getBoundingClientRect();


            // transform 적용 전 키링 위치 계산하기
            const originalLeft =
                keyringRect.left - keyringX;

            const originalTop =
                keyringRect.top - keyringY;


            // 키링이 배너 밖으로 나가지 않도록 범위 계산하기
            minKeyringX =
                bannerRect.left - originalLeft;

            maxKeyringX =
                bannerRect.right -
                originalLeft -
                keyringRect.width;

            minKeyringY =
                bannerRect.top - originalTop;

            maxKeyringY =
                bannerRect.bottom -
                originalTop -
                keyringRect.height;


            // 최대값이 최소값보다 작아지는 상황 방지하기
            if (maxKeyringX < minKeyringX) {
                maxKeyringX = minKeyringX;
            }

            if (maxKeyringY < minKeyringY) {
                maxKeyringY = minKeyringY;
            }


            // 고리 밖으로 마우스가 나가도 드래그 유지하기
            keyringHandle.setPointerCapture(
                event.pointerId
            );
        }
    );


    // 메인 고리 움직이기
    keyringHandle.addEventListener(
        'pointermove',
        function (event) {

            // 드래그 중이 아닐 경우 실행 끝내기
            if (!isKeyringDragging) {
                return;
            }


            // 마우스가 움직인 거리 계산하기
            const moveX =
                event.clientX - startPointerX;

            const moveY =
                event.clientY - startPointerY;


            // 키링의 새로운 위치 계산하기
            keyringX = limitNumber(
                startKeyringX + moveX,
                minKeyringX,
                maxKeyringX
            );

            keyringY = limitNumber(
                startKeyringY + moveY,
                minKeyringY,
                maxKeyringY
            );


            // 키링 위치 화면에 적용하기
            drawKeyring();
        }
    );


    // 키링 전체 드래그 끝내기
    function stopKeyringDrag(event) {

        // 드래그 중이 아닐 경우 실행 끝내기
        if (!isKeyringDragging) {
            return;
        }


        // 드래그 상태 끝내기
        isKeyringDragging = false;

        // 드래그 상태 클래스 제거
        keyringSet.classList.remove('is-dragging');


        // 잡고 있던 포인터 해제하기
        if (
            keyringHandle.hasPointerCapture(
                event.pointerId
            )
        ) {
            keyringHandle.releasePointerCapture(
                event.pointerId
            );
        }
    }


    // 마우스 놓기
    keyringHandle.addEventListener(
        'pointerup',
        stopKeyringDrag
    );

    // 드래그 강제 취소
    keyringHandle.addEventListener(
        'pointercancel',
        stopKeyringDrag
    );

    // 포인터 연결이 끊긴 경우
    keyringHandle.addEventListener(
        'lostpointercapture',
        function () {

            isKeyringDragging = false;

            keyringSet.classList.remove(
                'is-dragging'
            );
        }
    );



    /* ==================================================
       각 참을 연결점 기준으로 움직이기
    ================================================== */

    charms.forEach(function (charm) {

        // HTML의 기본 회전값 가져오기
        const baseRotate =
            Number(charm.dataset.rotate) || 0;


        // 참 움직임 상태
        const state = {

            // 기본 각도에서 추가로 회전할 값
            angle: 0,

            // 놓았을 때 흔들리는 속도
            speed: 0,

            // 드래그 상태
            dragging: false,

            // 흔들림 애니메이션 번호
            animation: null
        };


        // 참이 연결된 실제 화면 좌표
        let pivotX = 0;
        let pivotY = 0;

        // 드래그 시작 당시 마우스 각도
        let startPointerAngle = 0;

        // 드래그 시작 당시 참 각도
        let startCharmAngle = 0;

        // 이전 프레임의 참 각도
        let previousAngle = 0;


        // 참 회전 화면에 적용하기
        function drawCharm() {

            charm.style.transform =
                `rotate(
                    ${baseRotate + state.angle}deg
                )`;
        }


        // 참의 연결점 좌표 계산하기
        function updatePivotPosition() {

            // 키링 전체 위치 가져오기
            const keyringRect =
                keyringSet.getBoundingClientRect();


            // CSS에 작성한 transform-origin 값 가져오기
            const originValue =
                getComputedStyle(charm)
                    .transformOrigin
                    .split(' ');


            // 회전 중심의 가로 위치
            const originX =
                parseFloat(originValue[0]) || 0;

            // 회전 중심의 세로 위치
            const originY =
                parseFloat(originValue[1]) || 0;


            // 화면 안에서 실제 연결점 좌표 계산하기
            pivotX =
                keyringRect.left +
                charm.offsetLeft +
                originX;

            pivotY =
                keyringRect.top +
                charm.offsetTop +
                originY;
        }


        // 연결점에서 마우스까지의 각도 계산하기
        function getPointerAngle(event) {

            const distanceX =
                event.clientX - pivotX;

            const distanceY =
                event.clientY - pivotY;


            return Math.atan2(
                distanceY,
                distanceX
            ) * 180 / Math.PI;
        }


        // 기본 회전값 적용하기
        drawCharm();


        // 참 누르기
        charm.addEventListener(
            'pointerdown',
            function (event) {

                // 마우스 왼쪽 버튼만 사용하기
                if (
                    event.pointerType === 'mouse' &&
                    event.button !== 0
                ) {
                    return;
                }


                // 기본 이미지 드래그 막기
                event.preventDefault();

                // 드래그 안내 말풍선 숨기기
                if (dragTooltip) {
                    dragTooltip.classList.add('hide');
                }

                // 메인 고리 드래그로 전달되지 않게 막기
                event.stopPropagation();


                // 기존 흔들림 애니메이션 멈추기
                cancelAnimationFrame(
                    state.animation
                );


                // 드래그 상태 시작
                state.dragging = true;

                // 드래그 클래스 추가
                charm.classList.add(
                    'is-dragging'
                );


                // 실제 연결점 위치 다시 계산하기
                updatePivotPosition();


                // 드래그 시작 마우스 각도 저장하기
                startPointerAngle =
                    getPointerAngle(event);


                // 드래그 시작 당시 참 각도 저장하기
                startCharmAngle =
                    state.angle;


                // 이전 각도 저장하기
                previousAngle =
                    state.angle;


                // 참 밖으로 마우스가 나가도 드래그 유지하기
                charm.setPointerCapture(
                    event.pointerId
                );
            }
        );


        // 참 움직이기
        charm.addEventListener(
            'pointermove',
            function (event) {

                // 드래그 중이 아닐 경우 실행 끝내기
                if (!state.dragging) {
                    return;
                }


                // 현재 마우스 각도 계산하기
                const currentPointerAngle =
                    getPointerAngle(event);


                // 드래그 시작점에서 회전한 각도 계산하기
                let angleDifference =
                    currentPointerAngle -
                    startPointerAngle;


                // 각도값 정리하기
                angleDifference =
                    normalizeAngle(
                        angleDifference
                    );


                // 참의 새로운 회전값 계산하기
                let nextAngle =
                    startCharmAngle +
                    angleDifference;


                // 너무 많이 회전하지 않게 제한하기
                nextAngle = limitNumber(
                    nextAngle,
                    -15,
                    15
                );


                // 놓았을 때 사용할 회전 속도 계산하기
                state.speed =
                    normalizeAngle(
                        nextAngle -
                        previousAngle
                    ) * 0.65;


                // 현재 각도 저장하기
                state.angle = nextAngle;

                // 이전 각도 변경하기
                previousAngle = nextAngle;


                // 화면에 적용하기
                drawCharm();
            }
        );


        // 놓은 뒤 달랑거리며 돌아가기
        function swingBack() {

            // 원래 각도로 돌아가려는 힘 더하기
            state.speed +=
                -state.angle * 0.075;


            // 흔들림을 서서히 줄이는 마찰 적용하기
            state.speed *= 0.89;


            // 현재 각도 변경하기
            state.angle += state.speed;


            // 화면에 적용하기
            drawCharm();


            // 거의 멈췄는지 확인하기
            const angleStopped =
                Math.abs(state.angle) < 0.1;

            const speedStopped =
                Math.abs(state.speed) < 0.1;


            // 흔들림이 끝났을 경우 원래 상태로 정리하기
            if (
                angleStopped &&
                speedStopped
            ) {

                state.angle = 0;
                state.speed = 0;

                drawCharm();

                return;
            }


            // 다음 화면에서도 흔들림 계속 실행하기
            state.animation =
                requestAnimationFrame(
                    swingBack
                );
        }


        // 참 드래그 끝내기
        function stopCharmDrag(event) {

            // 드래그 중이 아닐 경우 실행 끝내기
            if (!state.dragging) {
                return;
            }


            // 드래그 상태 끝내기
            state.dragging = false;

            // 드래그 클래스 제거
            charm.classList.remove(
                'is-dragging'
            );


            // 잡고 있던 포인터 해제하기
            if (
                charm.hasPointerCapture(
                    event.pointerId
                )
            ) {
                charm.releasePointerCapture(
                    event.pointerId
                );
            }


            // 달랑거리며 원래 각도로 돌아가기
            swingBack();
        }


        // 마우스 놓기
        charm.addEventListener(
            'pointerup',
            stopCharmDrag
        );

        // 드래그 강제 취소
        charm.addEventListener(
            'pointercancel',
            stopCharmDrag
        );

        // 포인터 연결이 끊긴 경우
        charm.addEventListener(
            'lostpointercapture',
            function () {

                if (!state.dragging) {
                    return;
                }

                state.dragging = false;

                charm.classList.remove(
                    'is-dragging'
                );

                swingBack();
            }
        );
    });

});