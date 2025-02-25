function Arrowed(inputHtml) {
    // 화살표가 있는 마커 패턴
    const startArrowRegex = /-s([\s\S]+?)s-/g;
    const endArrowRegex = /-e([\s\S]+?)e-/g;
    
    // 화살표가 없는 마커 패턴 
    const startNoArrowRegex = /-ns([\s\S]+?)ns-/g;

    // 주석을 붙이는 마커 패턴 (-(location)e ... e(text)-)
    const locationEndRegex = /-\(([\s\S]+?)\)e([\s\S]+?)e\(([\s\S]+?)\)-/g;

    // 임의의 번호로 만드는 paired 패턴
    const numberedStartRegex = /-(\d+)s([\s\S]+?)\1s-/g;  // 앞뒤 숫자가 같아야 함
    const numberedEndRegex = /-(\d+)e([\s\S]+?)\1e-/g;    // 앞뒤 숫자가 같아야 함
    const numberedStartnoarrowRegex = /-(\d+)ns([\s\S]+?)\1ns-/g;  // 앞뒤 숫자가 같아야 함
    const numberedlocationEndRegex = /-(\d+)\(([\s\S]+?)\)e([\s\S]+?)\1\(([\s\S]+?)\)e-/g;
 
    // 화살표 있는 시작 마커 처리
    let result = inputHtml.replace(startArrowRegex, function(match, p1) {
        const uniqueId = `marker_start_${uniqueCounter++}`;
        return `<span class="marker-start" data-type="start" data-arrow="true" data-id="${uniqueId}">${p1}</span>`;
    });
 
    // 화살표 없는 시작 마커 처리
    result = result.replace(startNoArrowRegex, function(match, p1) {
        const uniqueId = `marker_start_${uniqueCounter++}`;
        return `<span class="marker-start" data-type="start" data-arrow="false" data-id="${uniqueId}">${p1}</span>`;
    });
 
    // 종료 마커 처리
    result = result.replace(endArrowRegex, function(match, p1) {
        const uniqueId = `marker_end_${uniqueCounter}`;
        return `<span class="marker-end" data-type="end" data-arrow="none" data-id="${uniqueId}">${p1}</span>`;
    });

    // 주석 있는 종료 마커 처리
    result = result.replace(locationEndRegex, function(match, location, mainText, annotationText) {
        const uniqueId = `marker_end_${uniqueCounter}`;
        return `<span class="marker-end" data-type="end" data-loc="${location}" data-att="${annotationText}" data-id="${uniqueId}">${mainText}</span>`;
    });

    // 시작 마커 (번호 기반)
    result = result.replace(numberedStartRegex, function(match, num, p1, fullMatch) {
        // 앞뒤 숫자가 다른 경우 오류 처리
        const frontNum = match.match(/^-(\d+)s/)[1];
        const backNum = match.match(/(\d+)s-$/)[1];
        if (frontNum !== backNum) {
            return match; // 오류 시 원본 텍스트 반환
        }
        return `<span class="marker-start" data-type="start" data-arrow="true" data-id="Ns_${num}">${p1}</span>`;
    });

    // 시작 마커 (번호 기반, 화살표 없음)
    result = result.replace(numberedStartnoarrowRegex, function(match, num, p1, fullMatch) {
        // 앞뒤 숫자가 다른 경우 오류 처리
        const frontNum = match.match(/^-(\d+)ns/)[1];
        const backNum = match.match(/(\d+)ns-$/)[1];
        if (frontNum !== backNum) {
            return match; // 오류 시 원본 텍스트 반환
        }
        return `<span class="marker-start" data-type="start" data-arrow="false" data-id="Ns_${num}">${p1}</span>`;
    });

    // 종료 마커 (번호 기반)
    result = result.replace(numberedEndRegex, function(match, num, p1, fullMatch) {
        // 앞뒤 숫자가 다른 경우 오류 처리
        const frontNum = match.match(/^-(\d+)e/)[1];
        const backNum = match.match(/(\d+)e-$/)[1];
        if (frontNum !== backNum) {
            return match; // 오류 시 원본 텍스트 반환
        }
        return `<span class="marker-end" data-type="end" data-id="Ne_${num}">${p1}</span>`;
    });

    // 종료 마커 (번호 기반 + 위치 + 주석)
    result = result.replace(numberedlocationEndRegex, function(match, num, location, text, annotation) {
        const frontNum = match.match(/^-(\d+)\(/)[1];
        const backNum = match.match(/(\d+)\(/)[1];
        if (frontNum !== backNum) {
            return match;
        }
        return `<span class="marker-end" data-type="end" data-loc="${location}" data-att="${annotation}" data-id="Ne_${num}">${text}</span>`;
    });
    
    return result;
 }

function drawArrows() {
    const container = document.getElementById(`page_${pagenum}`);
    const svg = document.getElementById(`svg-overlay_${pagenum}`);

    if (!container || !svg) {
        return;
    }

    const existingPaths = svg.querySelectorAll('.arrow');
    const existingAtts = svg.querySelectorAll('.pathtext');
    existingPaths.forEach(path => path.remove());
    existingAtts.forEach(pathtext => pathtext.remove());

    const defs = svg.querySelector('defs');
    if (defs) {
        defs.remove();
    }


    const markerPairs = [];
    const stack = [];
    const numberedMarkers = new Map();
    const allMarkers = Array.from(container.querySelectorAll('.marker-start, .marker-end'));

    // 먼저 번호 기반 마커들을 처리
    allMarkers.forEach(marker => {
    const id = marker.getAttribute('data-id');
    if (id && (id.startsWith('Ns_') || id.startsWith('Ne_'))) {
        const number = id.split('_')[1];  // Ns_1 -> 1 또는 Ne_1 -> 1
        
        if (!numberedMarkers.has(number)) {
            numberedMarkers.set(number, {});
        }
        
        if (id.startsWith('Ns_')) {
            numberedMarkers.get(number).start = marker;
        } else {
            numberedMarkers.get(number).end = marker;
        }
    }
    });

    // 번호 기반 페어들을 markerPairs에 추가
    numberedMarkers.forEach((pair, number) => {
    if (pair.start && pair.end) {
        markerPairs.push({
            start: pair.start,
            end: pair.end,
            startId: pair.start.getAttribute('data-id'),
            endId: pair.end.getAttribute('data-id'),
            startarr: pair.start.getAttribute('data-arrow'),
            endarr: pair.end.getAttribute('data-arrow'),
            loc: pair.end.getAttribute('data-loc'),
            att: pair.end.getAttribute('data-att')
        });
    }
    });

    // 일반 마커들 처리
    allMarkers.forEach(marker => {
    const id = marker.getAttribute('data-id');
    if (!id || (!id.startsWith('Ns_') && !id.startsWith('Ne_'))) {
        if (marker.classList.contains('marker-start')) {
            stack.push(marker);
        } else if (marker.classList.contains('marker-end')) {
            if (stack.length > 0) {
                const startMarker = stack.pop();
                markerPairs.push({
                    start: startMarker,
                    end: marker,
                    startId: startMarker.getAttribute('data-id'),
                    endId: marker.getAttribute('data-id'),
                    startarr: startMarker.getAttribute('data-arrow'),
                    endarr: marker.getAttribute('data-arrow'),
                    loc: marker.getAttribute('data-loc'),
                    att: marker.getAttribute('data-att')
                });
            }
        }
    }
    });

    function getCenter(elem) {
        const rect = elem.getBoundingClientRect();
        const container = document.getElementById(`page_${pagenum}`);
        const containerRect = container.getBoundingClientRect();
        
        // offsetWidth/Height를 사용하여 상대적 위치 계산
        return {
            x: (rect.left - containerRect.left)+ (rect.width / 2),
            y: (rect.top - containerRect.top)+ (rect.height),
            w: rect.width,   // 요소의 너비
            h: rect.height,  // 요소의 높이
            id: elem.getAttribute('data-id'),
            arr: elem.getAttribute('data-arrow'),
            loc: elem.getAttribute('data-loc'),
            att: elem.getAttribute('data-att')
        };
    }



    markerPairs.forEach((pair, index) => {
        let startPos = getCenter(pair.start);
        let endPos = getCenter(pair.end);
        let gaptype = 'none';
        const arradjust = startPos.arr == 'true' ? 1 : 0.3;

        const loc = endPos.loc;
        const att = endPos.att;

        const gapy = startPos.y - endPos.y;
        const gapx = startPos.x - endPos.x;
        
        if (Math.abs(gapx) < 70*v && Math.abs(gapy) < 15*v && gaptype == 'none'){ //일직선 상에 있는 flat에 대한 보정
            gaptype = 'shtflat';
            startPos.y -= (startPos.h / 2) * Math.sin(45);
            endPos.x -= (80/endPos.w);
            endPos.y -= arradjust * ((endPos.h / 0.8)) * Math.sin(45);
        }

        if (Math.abs(gapy) < 15*v && gaptype == 'none'){ //일직선 상에 있는 flat에 대한 보정
            gaptype = 'flat';
            startPos.x += (-gapx/Math.abs(gapx))*(startPos.w / 2) * Math.cos(45);
            startPos.y -= (startPos.h / 2) * Math.sin(45);
            endPos.x += arradjust * ((gapx/Math.abs(gapx))*(endPos.w / 10));
            endPos.y -= arradjust * ((endPos.h / 1)) * Math.sin(45);
        }
        
        if (Math.abs(gapy) < 45*v && Math.abs(gapx) < 30*v && gaptype == 'none'){
            gaptype = 'shtver';
            if (gapx == 0){
                startPos.x += (startPos.w / 2) * Math.cos(45);
                startPos.y += (startPos.h / 1.5) * Math.sin(45);
                endPos.x += arradjust * (endPos.w / 1) * Math.cos(45);
                endPos.y -= arradjust * ((endPos.h / 1.5)) * Math.sin(45);
            }else{
                startPos.x += (startPos.w / 1.2) * Math.cos(45);
                startPos.y += (startPos.h / 1.5) * Math.sin(45);
                endPos.x += arradjust * (endPos.w / 0.7) * Math.cos(45);
                endPos.y -= arradjust * ((endPos.h / 1.5)) * Math.sin(45);
            }

        }

        if (Math.abs(gapx) < 30*v && gaptype == 'none'){
            gaptype = 'ver';
            startPos.y += (startPos.h / 1.5) * 1;
            endPos.y -= arradjust * ((endPos.h / 1) * 1.2);
        }

        if (Math.abs(gapx) < 50*v && gaptype == 'none'){
            gaptype = 'nar';
            startPos.x += (gapx/Math.abs(gapx))*(startPos.w / 2) * Math.cos(45);
            startPos.y += (startPos.h / 1.5) * Math.sin(45);
            endPos.x += arradjust * ((gapx/Math.abs(gapx))*(endPos.w / 1)) * Math.cos(45);
            endPos.y -= arradjust * ((endPos.h / 1.5)) * Math.sin(45);
        }
        
        if (Math.abs(gapx) > 30*v && gaptype == 'none'){ //대각선
            if(Math.abs(gapy) >= 35*v){
                gaptype = 'dia'
                /*startPos.x += (startPos.w / 2);*/
                startPos.y += (startPos.h);
                endPos.x += arradjust * ((gapx/Math.abs(gapx))*(endPos.w)) * Math.cos(45);
                endPos.y -= arradjust * endPos.h * Math.sin(45);
            }else{
                gaptype = 'shtdia'
                /*startPos.x += (startPos.w / 2);*/
                startPos.y += (startPos.h);
                endPos.x += arradjust * ((gapx/Math.abs(gapx))*(endPos.w)) * Math.cos(45);
                endPos.y -= arradjust * endPos.h * Math.sin(45);
            }
        }

        console.log(gaptype);
        let thetabase = Math.round(Math.atan2(endPos.y - startPos.y, endPos.x - startPos.x) * 180 / Math.PI);
        let theta;

        if (gaptype == 'flat'){
            theta = thetabase - (20 * (-gapx/Math.abs(gapx)));
            if (gapx > 0){
                theta -= 160;
            }
        }else if (gaptype == 'shtflat'){
            theta = -10;
        }else if (gaptype == 'dia'){
            theta = thetabase - 120;
            if (gapx < 0){
                theta = theta + 70;
            }
        }else if (gaptype == 'shtdia'){
            theta = thetabase - 120;
            if (gapx < 0){
                theta = theta + 70;
            }
        }else if (gaptype == 'nar'){
            theta = thetabase - (30 * (-gapx/Math.abs(gapx)));
            if (gapx > 0){
                theta -= 160;
            }
        }else if (gaptype == 'shtver'){
                theta = 60 + (thetabase/6);
        }else if (gaptype == 'ver'){
            theta = 0;
        }
        /*theta = thetabase;*/

        // 각 화살표마다 고유한 스타일 정보 설정
        let arrowStyle = startPos.arr;

        drawArrow(startPos, endPos, arrowStyle, index, theta, gaptype, v, loc, att);
    });
}

function drawArrow(start, end, arrowStyle, index, theta, gaptype, v, loc, att) {
    const svg = document.getElementById(`svg-overlay_${pagenum}`);

    if (!svg) {
        return;
    }

    const startId = start.id;
    const markerId = `arrowhead_${pagenum}_${startId}`; // 고유 마커 ID

    if (!svg.querySelector(`#${markerId}`)) {
        let defs = svg.querySelector('defs');
        if (!defs) {
            defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
            svg.appendChild(defs);
        }

        const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
        marker.setAttribute("id", markerId);
        marker.setAttribute("markerUnits", "userSpaceOnUse");
        
        let arrsize;
        if (arrowStyle == 'true'){
            arrsize = 18;
        }else{
            arrsize = 0;
        }
        console.log(arrsize * v);
        marker.setAttribute("markerWidth", String(arrsize * v));
        marker.setAttribute("markerHeight", String(arrsize * v));
        marker.setAttribute("refX", 0);
        marker.setAttribute("refY", 0);  // 수정: refY 값 조정
        marker.setAttribute("orient", theta+90);  // 수정: 방향 속성 변경
        marker.setAttribute("viewBox", `0 0 ${20*v} ${10*v}`);  // 수정: viewBox 조정
        
        // 마커 색상 설정
        marker.setAttribute("fill", "#007bff8d");  // CSS와 동일한 색상으로 설정
        
        const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        polygon.setAttribute("points", `0,${-5*v} ${15*v},${0} 0,${5*v}`);  // 수정: 폴리곤 좌표 조정
        polygon.setAttribute("fill", "#007bff8d");
        
        marker.appendChild(polygon);
        defs.appendChild(marker);
    }

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

// 점1, 점2, 점3 계산
let point1 = { x: start.x, y: start.y };
let point2 = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 }; // 중간점
let point3 = { x: end.x, y: end.y };

const curvecon = Math.abs(start.x-end.x)/12;


// 제어점 설정
let control1 = { x: point1.x, y: point2.y+curvecon }; // 점1 → 점2 제어점
let control2 = { x: point3.x, y: point2.y-curvecon }; // 점2 → 점3 제어점

if (gaptype == 'flat'){
    control1.y -= Math.min(35*v, 2.5 * curvecon);
    control2.y -= Math.min(12*v, 15 * curvecon);
    control2.x += ((start.x-end.x) / Math.abs(start.x-end.x)) * 2 * curvecon;
}else if (gaptype == 'shtflat'){
    control1.y -= Math.min(10*v, 15 * curvecon);
    control2.y -= Math.min(10*v, 15 * curvecon);
    control2.x += ((start.x-end.x) / Math.abs(start.x-end.x)) * 2 * curvecon;
}else if (gaptype == 'dia'){
    control2.x += ((start.x-end.x) / Math.abs(start.x-end.x)) * curvecon;
}else if (gaptype == 'shtdia'){
    control1.y -= 0 * curvecon;
    control2.y += 0 * curvecon;
    control2.x += ((start.x-end.x) / Math.abs(start.x-end.x)) * curvecon;
}else if (gaptype == 'shtver'){
    control1.x = point1.x + 15*v;
    control2.x = point3.x + 15*v;
    control1.y -= 10*v;
    control2.y += 10*v;
}
point2.x = (control1.x + control2.x)/2;
point2.y = (control1.y + control2.y)/2;
    const d = `
        M ${point1.x} ${point1.y}
        Q ${control1.x} ${control1.y}, ${point2.x} ${point2.y}
        Q ${control2.x} ${control2.y}, ${point3.x} ${point3.y}
    `;


    path.setAttribute('d', d);
    path.classList.add('arrow');
    path.setAttribute('marker-end', `url(#${markerId})`);
    
    // 일반 텍스트 요소 생성
    const pathtext = document.createElementNS("http://www.w3.org/2000/svg", "text");

    const arradjust = arrowStyle == 'false' ? 6*v : 0;
    const typeadjust = gaptype == 'shtver' ? 5*v : 0;

    //pathtext의 위치 결정(loc 조건문)
    if (loc == 'MR') { // R = end점 기준 정렬
        pathtext.setAttribute('x', point3.x + 6*v - arradjust);  // x 좌표
        pathtext.setAttribute('y', point3.y + 2*v - arradjust);  // y 좌표
    } else if (loc == 'MC') { // C = point2점 기준 정렬
        pathtext.setAttribute('x', point2.x + 6*v - arradjust + typeadjust);  // x 좌표
        pathtext.setAttribute('y', point2.y);  // y 좌표
    } else if (loc == 'TR') { // 
        pathtext.setAttribute('x', point3.x + 6*v - arradjust);  // x 좌표
        pathtext.setAttribute('y', point3.y - 3*v - arradjust);  // y 좌표
    } else if (loc == 'TCR') { // 
        pathtext.setAttribute('x', control2.x + 8*v - arradjust);  // x 좌표
        pathtext.setAttribute('y', point3.y - 6*v - arradjust);  // y 좌표
    } else{
        pathtext.setAttribute('x', point2.x);  // x 좌표
        pathtext.setAttribute('y', point2.y - arradjust);  // y 좌표
    }

    pathtext.classList.add('pathtext')
    pathtext.textContent = att;
    
    svg.appendChild(path);
    svg.appendChild(pathtext);
}