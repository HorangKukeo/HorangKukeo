function updateViewBoxes() {
    const pelements = document.querySelectorAll('[id^="diaq_"]');

    pelements.forEach((pelement) => {
        const pageElement = pelement.closest('.page');
        
        // CSS 변수 '--base' 값 가져오기 (px 단위)
        const computedStyles = getComputedStyle(document.documentElement);
        const baseValue = computedStyles.getPropertyValue('--base').trim();

        const idParts = pelement.id.split('_'); // '_'를 기준으로 나누기
        const dianum = idParts[1]; // 2번 (num 부분)
        const target = idParts[2]; // 3번 (target 부분)
        const svg = document.querySelector(`#dia${dianum}`);
        const texts = svg.querySelectorAll('text');

            texts.forEach((text) => {
                if (text.textContent.trim() === target) {
                    const div = document.getElementById(`diaq_${dianum}_${target}`);
                    text.textContent = div.textContent;
                    div.remove();
                }
            });
    });
}

function updateViewBoxes2() { ///미사용 (테스트용)
    const pelements = document.querySelectorAll('[id^="diaq_"]');

    pelements.forEach((pelement) => {
        const pageElement = pelement.closest('.page');
        
        // CSS 변수 '--base' 값 가져오기 (px 단위)
        const computedStyles = getComputedStyle(document.documentElement);
        const baseValue = computedStyles.getPropertyValue('--base').trim();

        // 'baseValue'가 'px' 단위로 되어 있다고 가정하고 숫자만 추출
        const basePx = parseFloat(baseValue) || 1; // 기본값 1px

        // .page 요소의 bounding rect
        const pageRect = pageElement.getBoundingClientRect();

        const idParts = pelement.id.split('_'); // '_'를 기준으로 나누기
        const dianum = idParts[1]; // 2번 (num 부분)
        const target = idParts[2]; // 3번 (target 부분)
        console.log(idParts);
        const svg = document.querySelector(`#dia${dianum}`);
        const texts = svg.querySelectorAll('text');

            texts.forEach((text) => {
                if (text.textContent.trim() === target) {
                    // text 요소의 bounding rect
                    const textRect = text.getBoundingClientRect();

                    // '.page' 요소와의 상대 좌표 계산
                    const leftPx = textRect.left - pageRect.left;
                    const topPx = textRect.top - pageRect.top;
                    const widthPx = textRect.width;
                    const heightPx = textRect.height;

                    // 상대 좌표 계산 (basePx 기준)
                    const left = leftPx / basePx;
                    const top = topPx / basePx;
                    const width = widthPx / basePx;
                    const height = heightPx / basePx;

                    // HTML 요소 생성
                    const div = document.getElementById(`diaq_${dianum}_${target}`);
                    div.style.position = 'absolute';
                    div.style.left = `calc(${left} * var(--base))`;
                    div.style.top = `calc(${top} * var(--base))`;
                    div.style.width = `calc(${width} * var(--base))`;
                    div.style.height = `calc(${height} * var(--base))`;
                    div.style.zIndex = 200; // SVG 위로
                    text.textContent = '';

                    // .page 요소를 기준으로 위치 설정
                    pageElement.appendChild(div);
                }
            });
    });
}

                    /*
                    
                    */