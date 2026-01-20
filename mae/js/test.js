function Arrowed(inputHtml) {
        // 시작 마커 패턴: -s텍스트s-
        const startRegex = /-s([\s\S]+?)s-/g;
        // 종료 마커 패턴: -e텍스트e-
        const endRegex = /-e([\s\S]+?)e-/g;


    // 시작 마커를 <span class="marker-start">로 감싸기
    let result = inputHtml.replace(startRegex, function(match, p1) {
        return `<span class="marker-start" data-type="start">${p1}</span>`;
    });

    // 종료 마커를 <span class="marker-end">로 감싸기
    result = result.replace(endRegex, function(match, p1) {
        return `<span class="marker-end" data-type="end">${p1}</span>`;
    });

    return result;
}

function drawArrows() {
    const container = document.getElementById(`page_${pagenum}`);
    const svg = document.getElementById(`svg-overlay_${pagenum}`);

    if (!container || !svg) {
        console.error('필요한 요소들이 존재하지 않습니다.');
        return;
    }

    const existingPaths = svg.querySelectorAll('.arrow');
    existingPaths.forEach(path => path.remove());

    const markerPairs = [];
    const stack = [];
    const allMarkers = Array.from(container.querySelectorAll('.marker-start, .marker-end'));

    allMarkers.forEach(marker => {
        if (marker.classList.contains('marker-start')) {
            stack.push(marker);
        } else if (marker.classList.contains('marker-end')) {
            if (stack.length > 0) {
                const startMarker = stack.pop();
                markerPairs.push({ start: startMarker, end: marker });
            }
        }
    });

    function getCenter(elem) {
        const rect = elem.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        return {
            x: rect.left - containerRect.left + rect.width / 2,
            y: rect.top - containerRect.top + rect.height / 2
        };
    }

    markerPairs.forEach((pair, index) => {
        let startPos = getCenter(pair.start);
        let endPos = getCenter(pair.end);

        if (startPos.y+5 < endPos.y){
            startPos.y += 20;
        }else{startPos.y = endPos.y
            endPos.y +=4;
        }

        // 각 화살표마다 고유한 스타일 정보 설정
        let arrowStyle = {
            /*curveOffset: (startPos.y-endPos.y)/2.5 // 곡률 증가*/
        };

        drawArrow(startPos, endPos, arrowStyle, index);
    });
}

function drawArrow(start, end, style) {
    const svg = document.getElementById(`svg-overlay_${pagenum}`);

    if (!svg) {
        console.error(`SVG element with ID 'svg-overlay_${pagenum}' not found.`);
        return;
    }

    const markerId = `arrowhead_${pagenum}_${Date.now()}`; // 고유 마커 ID

    if (!svg.querySelector(`#${markerId}`)) {
        let defs = svg.querySelector('defs');
        if (!defs) {
            defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
            svg.appendChild(defs);
        }

        const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
        marker.setAttribute("id", markerId);
        marker.setAttribute("refX", "0");
        marker.setAttribute("refY", "0");
        marker.setAttribute("markerWidth", "10");
        marker.setAttribute("markerHeight", "10");
        marker.setAttribute("orient", "auto");
        marker.setAttribute("viewBox", "-5 -5 10 10");

        const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        polygon.setAttribute("points", "0,0 5,-5 -5,-5");
        polygon.setAttribute("fill", style.color || 'black');
        marker.appendChild(polygon);
        defs.appendChild(marker);
    }

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

    // 점1, 점2, 점3 계산
    let point1 = { x: start.x, y: start.y };
    let point2 = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 }; // 중간점
    let point3 = { x: end.x-3, y: end.y };

    const curvecon = Math.abs(start.x-end.x)/20;

    // 제어점 설정
    let control1 = { x: point1.x, y: point2.y+curvecon }; // 점1 → 점2 제어점
    let control2 = { x: point3.x, y: point2.y-curvecon }; // 점2 → 점3 제어점

        if (Math.abs(point1.y-point3.y) < 6){
            point2.y -= 10;
            control1 = { x: (point1.x + point2.x)/2, y: point2.y };
            control2 = { x: (point2.x + point3.x)/2, y: point2.y };
        }else{
            point3.y += 3;
        }
        
        const d = `
            M ${point1.x} ${point1.y}
            Q ${control1.x} ${control1.y}, ${point2.x} ${point2.y}
            Q ${control2.x} ${control2.y}, ${point3.x} ${point3.y}
        `;


    path.setAttribute('d', d);
    path.classList.add('arrow'); // CSS 클래스 추가
    svg.appendChild(path);
}
