function renderSVG(svgText, targetElement, IDs, trg) {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
    const svgElement = svgDoc.documentElement;
    const pageElement = document.querySelector(`#page_${pagenum}`);

    const diaID = `dia${IDs}`;
    if (!pageElement) {
        console.error('.page 요소가 존재하지 않습니다.');
        return; // .page 요소가 없으면 중단
    }

    const pW = pageElement.offsetWidth; // .page의 실제 width(px)
    /*const k = 2 * (1/16) * (pW / 100);*/
 
    // 1. viewBox 값 가져오기
    const [x, y, viewW, viewH] = svgElement.getAttribute('viewBox').split(' ').map(Number);
 
    // 2. 원하는 height 설정
    const targetH = trg; // 예시 값
 
    // 3. 새로운 viewBox 값 계산
    const newViewH = viewH;
    const newViewW = viewW;
    
    // 4. 새로운 viewBox 설정
    svgElement.setAttribute('viewBox', `${x} ${y} ${newViewW} ${newViewH}`);
    svgElement.setAttribute('id', diaID);
    /*svgElement.dataset.trg = viewH * viewH / targetH;*/

    // onclick 속성 제거 (불필요한 이벤트 핸들러 제거)
    svgElement.removeAttribute('onclick');
    
    // 5. width와 height 설정
    svgElement.style.width = '100%';
    svgElement.style.maxHeight = ''; // max-height 속성 제거
    svgElement.style.height = `calc((${targetH} / 2 / 16 * var(--base))`;
    svgElement.style.transform = 'translateY(0%)'; // Y축으로 50px 아래로 이동
    targetElement.style.height = `calc((0 + ${targetH}) / 2 / 16 * var(--base))`;
    targetElement.appendChild(svgElement);

 }