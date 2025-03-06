function renderSVG(svgText, targetElement) {
    // SVG 문자열을 DOM 요소로 파싱
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
    
    // 파싱된 SVG 요소 가져오기
    const svgElement = svgDoc.documentElement;
    
    // 스타일 조정
    svgElement.style.maxWidth = '100%';
    svgElement.style.height = 'auto';
    svgElement.style.display = 'block';
    svgElement.style.margin = 'calc(25 / 16 * var(--base)) auto';
    svgElement.style.position = 'relative';  // 추가
    
    // 컨테이너 스타일 조정
    targetElement.style.position = 'relative';
    targetElement.style.width = '100%';
    targetElement.style.display = 'block';
    targetElement.style.overflow = 'hidden'; // 추가
    
    // onclick 속성 제거 (불필요한 이벤트 핸들러 제거)
    svgElement.removeAttribute('onclick');
    
    // 기존 내용을 지우고 새로운 SVG 추가
    targetElement.innerHTML = '';
    targetElement.appendChild(svgElement);
}

function parseAndDisplayPassage(index) {

    const passage = allPassages[index][1]; // 두 번째 열의 데이터
    if (allPassages[index][0] == 'sub'){

    }else if(allPassages[index][0] =='answer'){
        

    }else if(allPassages[index][0] =='table'){
        

        const lines = passage.split('\n');
        
        const processedLines = lines.map(line => {
            // [[내용]] 스타일 적용
            const bolding = Bolding(line); // 먼저 bolding 적용
        
            // ## 주석 처리
            const annot = Annot(bolding);

            // underline 처리
            const underlined = undered(annot);

            // 덧말 처리
            const att = Att(underlined);

            const arr = Arrowed(att);
            return arr
        });
        let tables = tablemaker(passage);
        tables.classList.add('tables');
        let tableHTML = tables.outerHTML; // 또는 tables.innerHTML;
        const parser = new DOMParser();
        const tableDoc = parser.parseFromString(tableHTML, "text/html");
        const targetTable = tableDoc.querySelector("table");


        Array.from(targetTable.querySelectorAll("td")).forEach((cell) => {
            const regex = /\*(\w+)\*\{(.*?)\}/g;
            const originalContent = cell.innerHTML;
            cell.innerHTML = originalContent.replace(regex, (match, type, content) => {
                let questionNumber = globalQuestionCounter;
                let questionHTML = "";
                if (type === "a") { /// 표는 정신이 너무 없어서 question-number를 일단 지움.
                    const [hint, answer] = content.split("_");
                    const inputId = `input-${questionNumber}`;
                    userAnswers[inputId] = { userAnswer: "", correctAnswer: answer };
        
                    const inputSize = Math.round(Math.max(answer.length, 3) * 1.7);
        
                    questionHTML = `<div class="hint-container" id="${inputId}" data-answer="${answer}" data-type="a">
                                        <span class="question-number" style="display: none;">${questionNumber}</span>
                                        <span class="hint-text">${hint}</span>
                                        <input type="text" placeholder="" data-type="userinput" size="${inputSize}"/>
                                    </div>`;
                    globalQuestionCounter++;
                    return questionHTML;
                }else if (type === "c"){
                    const inputId = `input-${questionNumber}`;
                    userAnswers[inputId] = { userAnswer: '', correctAnswer: content };
    
                    const inputSize =  Math.round(Math.max(content.length, 3)*1.7);
    
                    questionHTML = `<div class="input-container" id="${inputId}" data-answer="${content}" data-type="c">
                                        <span class="question-number" style="display: none;">${questionNumber}</span>
                                        <input type="text" placeholder="" data-type="userinput" size="${inputSize}"/>
                                    </div>`;
                    globalQuestionCounter++;
                    return questionHTML

                } else {
                    questionHTML = match; // 패턴이 다르면 원본 그대로 유지
                    return questionHTML;
                }
            });
            // 2. 일반 텍스트의 '_'를 <br>로 변환
            const regexUnderscore = /_/g;
            cell.innerHTML = cell.innerHTML.replace(regexUnderscore, "<br>");
        });


        
        let replacedPassage = document.createElement('div');
        replacedPassage.innerHTML = targetTable.outerHTML;
        replacedPassage.classList.add('tables-Container');
        let passageContext = document.createElement('div');
        passageContext.classList.add('passage');
        passageContext.appendChild(replacedPassage);
        passageContext.style.justifyContent = 'center'; // 가로 중앙 정렬
        passageContext.style.alignItems = 'center'; // 세로 중앙 정렬 (필요 시)
        passageContext.style.display = 'flex';
        document.getElementById(`passage_${pagenum}`).appendChild(passageContext);
        heightCalculator(passageContext.offsetHeight * 0.9);
    
    }else if(allPassages[index][0] =='diaq'){

        // 지문을 줄 단위로 분리
        const lines = passage.split('\n');
        let bracketPassage = '';
        
        const processedLines = lines.map(line => {
            return line
        });

        const regex = /\*(\w+)\*\{(.*?)\}/g;
        const filteredLines = processedLines.filter(line => line !== null); //bracket 값이 null인 경우 공백을 삭제함.
        const passageWithLineBreaks = filteredLines.join('<br>');
        let target;
        let replacedPassage = passageWithLineBreaks.replace(regex, (match, type, content) => { 
            let questionNumber = globalQuestionCounter;
            let questionHTML = '';

            if (type === 'p') { //초성형 문제 - diagram
                const [tar, mark] = content.split('_');
                questionHTML = `<div class="white-box"
                                style="
                                display: none;    
                                position: absolute;
                                    background-color: white;
                                    text-align: center;
                                    z-index: 1000;
                                    top: 0;
                                    left: 0;
                                ">
                                ${mark}
                            </div>`;
                target = tar;
            }else if (type === 'a'){
                const [hint, answer, tar] = content.split('_');
                const inputId = `input-${questionNumber}`;
                userAnswers[inputId] = { userAnswer: '', correctAnswer: answer };

                const inputSize =  Math.round(Math.max(answer.length, 3)*1.7);

                questionHTML = `<div class="hint-container" id="${inputId}" data-answer="${answer}" data-type="a">
                                    <span class="question-number">${questionNumber}</span>
                                    <span class="hint-text">${hint}</span>
                                    <input type="text" placeholder="" data-type="userinput" size="${inputSize}"/>
                                </div>`;
                globalQuestionCounter++;
                target = tar;
            }
            return questionHTML;
        });


        let passageContext = document.createElement('div');
        passageContext.setAttribute('id', `diaq_${svgID}_${target}`);
        passageContext.innerHTML = replacedPassage;
        
        document.getElementById(`passage_${pagenum}`).appendChild(passageContext);

    }else if(allPassages[index][0].includes('dia_')){
        // SVG 코드 처리
        const idcheck = allPassages[index][0].split('_');
        const svgContent = allPassages[index][1];
        svgID++;
            
        // passageContext 생성
        let passageContext = document.createElement('div');
        passageContext.classList.add('passage');

        // SVG를 담을 컨테이너 생성
        const diagramContainer = document.createElement('div');
        diagramContainer.classList.add('diagram-container');

        const targetH = idcheck[1]; // '_' 뒤의 값;

        // SVG 렌더링
        renderSVG(svgContent, diagramContainer, svgID, targetH);

        passageContext.appendChild(diagramContainer);

        // passageBox 생성 및 처리
        const passageBox = document.createElement('div');
        passageBox.classList.add('passage-box');
        passageBox.appendChild(passageContext);
        /*document.getElementById(`passage_${pagenum}`).appendChild(passageBox);*/

        const parentElement = document.getElementById(`passage_${pagenum}`);
        if (doubled == 1) {
            // doubled가 1이면, id가 "double_${doublenum}_L" 인 요소를 찾음
            let leftElem = document.getElementById(`double_${doublenum}_L`);
                if (leftElem) {
                leftElem.appendChild(passageBox);
                } else {
                console.warn(`Element with id double_${doublenum}_L not found.`);
                }
                if (double_fix == 'false'){
                doubled = 2;
                }
        } else if (doubled == 2) {
        // doubled가 2이면, id가 "double_${doublenum}_R" 인 요소를 찾음
            let rightElem = document.getElementById(`double_${doublenum}_R`);
                if (rightElem) {
                    rightElem.appendChild(passageBox);
                } else {
                    console.warn(`Element with id double_${doublenum}_R not found.`);
                }
                if (double_fix == 'false'){
                doubled = 1;
                }
        } else {
        // 그 외에는 parentElement에 추가
        parentElement.appendChild(passageBox);
        }

        heightCalculator(passageBox.offsetHeight);

    }else if(allPassages[index][0] == 'split'){
        console.log(allPassages[index][0]);
    }else{
    
        // 지문을 줄 단위로 분리
        const lines = passage.split('\n');
        
        const processedLines = lines.map(line => {
            // ## 주석 처리
            const annot = Annot(line);

            // 정렬 처리(중앙)
            const aligned = Align(annot);

            // underline 처리
            const underlined = undered(aligned);

            // [[내용]] 스타일 적용
            const bolding = Bolding(underlined); // 먼저 bolding 적용

            // 덧말 처리
            const att = Att(bolding);

            const arr = Arrowed(att);

            let fin = arr;

            if (bracket == 'none') {
                // Check if there are any bracket patterns
                if (/\/\[[^\]]\]\//.test(arr)) {
                    // Get all bracket patterns in the line
                    const matches = Array.from(arr.matchAll(/\/\[[^\]]\]\//g));
                    if (matches.length >= 2 && matches[0][0] === matches[matches.length - 1][0]) {
                        // If we have matching brackets at start and end
                        const bracketType = arr.match(/\[[^\]]\]/)?.[0];
                        // Remove the bracket patterns and get the content
                        const content = arr.replace(/\/\[[^\]]\]\//g, '');
                        
                        fin = `<div class="bracket">
                            <div class="bracket-label">${bracketType}</div>
                                <span class="bracket-single"></span>
                                <span class="bracket-blank"></span>
                                <div class="bracket-content" style="text-indent: calc(6 / 16 * var(--base))">
                                    ${content}
                                </div>
                            </div>
                        </div>`;
                        
                        return fin;
                    } else {
                        // If we only found opening bracket
                        bracket = arr.match(/\[[^\]]\]/)?.[0];
                        bracketHtml += arr.replace(/\/\[[^\]]\]\//g, '') + '<br>';
                        return null;
                    }
                }
            } else if (/\/\[[^\]]\]\//.test(arr) && bracket == arr.match(/\[[^\]]\]/)?.[0]) {
                // bracket 엔딩
                bracketHtml += arr.replace(/\/\[[^\]]\]\//g, '');
                fin = `<div class="bracket">
                    <div class="bracket-top"></div>
                    <div class="bracket-label">${bracket}</div>
                    <div class="bracket-bot"></div>
                    <div class="bracket-content" style="text-indent: calc(6 / 16 * var(--base))">
                        ${bracketHtml}
                    </div>
                </div>`;
                bracket = 'none';
                bracketHtml = '';
                return fin;
            } else if (bracket != 'none') {
                bracketHtml += arr + '<br>';
                return null;
            } else {
                bracketHtml = '';
                bracket = 'none';
                return arr;
            }
            
            return arr;
        });
        
        const regex = /\*(\w+)\*\{(.*?)\}/g;
        const filteredLines = processedLines.filter(line => line !== null); //bracket 값이 null인 경우 공백을 삭제함.
        // filteredLines를 join하면서, <div> 뒤에 <br>이 추가되지 않도록 처리
        const passageWithLineBreaks = filteredLines.reduce((acc, current, index) => {
            // 이전 줄(문자열)을 가져오고, 선행 <br> 태그를 제거
            let previous = (acc[acc.length - 1] || '').replace(/^(<br\s*\/?>\s*)+/, '');
            
            // 문자열을 임시 DOM 요소로 변환하여 첫 번째 요소를 가져옴
            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = previous;
            const previousElement = tempContainer.firstElementChild;
            
            // 이전 요소가 존재하고, 그 클래스 리스트에 'bracket'이 포함되어 있는지 확인
            const isPreviousBracket = previousElement && previousElement.classList.contains('bracket');
            
            // 현재 요소가 div로 시작하는지 확인
            const isCurrentDiv = current.trim().startsWith('<div');
            
            // 들여쓰기 요소 생성
            const indentSpan = `<span class="indent_${psgnum}"></span>`;
            
            if (isPreviousBracket) {
                // 이전 요소의 클래스가 'bracket'인 경우, 현재 줄을 바로 추가 (줄바꿈 없이)
                // div 요소가 아닌 경우에만 들여쓰기 요소 추가
                acc.push(isCurrentDiv ? current : indentSpan + current);
            } else {
                // 그렇지 않으면, 첫 번째 라인이 아니라면 <br> 태그를 추가해서 결합
                // div 요소가 아닌 경우에만 들여쓰기 요소 추가
                if (index > 0) {
                    acc.push(isCurrentDiv ? `<br>${current}` : `<br>${indentSpan}${current}`);
                } else {
                    acc.push(isCurrentDiv ? current : indentSpan + current);
                }
            }
            return acc;
        }, []).join('');
        
        
        let replacedPassage = passageWithLineBreaks.replace(regex, (match, type, content) => {
            
            
            let questionNumber = globalQuestionCounter;
            let questionHTML = '';

            if (type === 'a') { //초성형 문제
                const [hint, answer] = content.split('_');
                const inputId = `input-${questionNumber}`;
                userAnswers[inputId] = { userAnswer: '', correctAnswer: answer };

                if (qndisplay == 0){
                    const inputSize =  Math.round(Math.max(answer.length, 2)*1.7);
    
                    questionHTML = `<span class="hint-container" id="${inputId}" data-answer="${answer}" data-type="a">
                                        <span class="question-number">${questionNumber}</span>
                                        <span class="hint-text">${hint}</span>
                                        <input type="text" placeholder="" data-type="userinput" size="${inputSize}"/>
                                    </span>`;
                    }else{
                        let inputSize;
                        if(mobile == 0){
                            let effectiveLength = 0;
                            for (const char of answer) {
                            effectiveLength += (char === ' ' ? 0.3 : 1);
                            }
                            inputSize = Math.round(Math.max(effectiveLength, 2) * 14);
                        }else if(mobile == 1){
                            let effectiveLength = 0;
                            for (const char of answer) {
                            effectiveLength += (char === ' ' ? 0.3 : 1);
                            }
                            inputSize = Math.round(Math.max(effectiveLength, 2) * 14);
                        }
    
                        questionHTML = `<span class="hint-container" id="${inputId}" data-answer="${answer}" data-type="a">
                                            <span class="question-number">${questionNumber}</span>
                                            <span class="hint-text" style="width: 85%;">${hint}</span>
                                            <input type="text" placeholder="" data-type="userinput" style="width: calc(${inputSize} / 16 * var(--base));"/>
                                        </span>`;
                    }
            } else if (type === 'fa') { //초성형 문제
                const [hint, answer0] = content.split('_');
                const [answer, size] = answer0.split('@');
                const inputId = `input-${questionNumber}`;
                userAnswers[inputId] = { userAnswer: '', correctAnswer: answer };

                if (qndisplay == 0){
                    const inputSize =  Math.round(size*1.7);
    
                    questionHTML = `<span class="hint-container" id="${inputId}" data-answer="${answer}" data-type="a">
                                        <span class="question-number">${questionNumber}</span>
                                        <span class="hint-text">${hint}</span>
                                        <input type="text" placeholder="" data-type="userinput" size="${inputSize}"/>
                                    </span>`;
                    }else{
                        const inputSize =  Math.round(size*1.4);
    
                        questionHTML = `<span class="hint-container" id="${inputId}" data-answer="${answer}" data-type="a">
                                            <span class="question-number">${questionNumber}</span>
                                            <span class="hint-text" style="width: 85%;">${hint}</span>
                                            <input type="text" placeholder="" data-type="userinput" size="${inputSize}"/>
                                        </span>`;
                    }
            } else if (type === 'sa') { //초성형 문제
                const [hint, answer] = content.split('_');
                const inputId = `input-${questionNumber}`;
                userAnswers[inputId] = { userAnswer: '', correctAnswer: answer };

                const inputSize =  Math.round(Math.max(hint.length, 3)*1.7);

                questionHTML = `<span class="hint-container-small" id="${inputId}" data-answer="${answer}" data-type="a">
                                    <span class="question-number">${questionNumber}</span>
                                    <span class="hint-text">${hint}</span>
                                    <input type="text" placeholder="" data-type="userinput" size="${inputSize}"/>
                                </span>`;
            } else if (type === 'b') {
                const options = content.split('@');
                const choiceId = `choice-${questionNumber}`;
                const correctOption = options.find(o => o.endsWith('_')).replace(/_$/, '');
                userAnswers[choiceId] = { userAnswer: '', correctAnswer: correctOption };

                const optionsHTML = options.map(option => {
                    const isCorrect = option.endsWith('_');
                    const text = option.replace(/_$/, '');
                    return `<span class="choice-option" data-correct="${isCorrect}">${text}</span>`;
                }).join('');

                questionHTML = `<span class="choice-container" id="${choiceId}" data-type="b">
                                    <span class="question-number">${questionNumber}</span>
                                    ${optionsHTML}
                                </span>`;
                                
            } else if (type === 'bb') {
                const options = content.split('@');
                const choiceId = `choice-${questionNumber}`;
                const correctOptions = options
                .filter(o => o.endsWith('_')) // `_`로 끝나는 모든 선택지를 배열로 추출
                .map(option => option.replace(/_$/, '')); // `_` 제거 후 순수 텍스트만 남김
                userAnswers[choiceId] = { userAnswer: [], correctAnswer: correctOptions };

                const optionsHTML = options.map(option => {
                    const isCorrect = option.endsWith('_');
                    const text = option.replace(/_$/, '');
                    return `<span class="choice-options" data-correct="${isCorrect}">${text}</span>`;
                }).join('');

                questionHTML = `<span class="choice-container" id="${choiceId}" data-type="bb">
                                    <span class="question-number">${questionNumber}</span>
                                    ${optionsHTML}
                                </span>`;
                                
            } else if (type === 'c') {
                const inputId = `input-${questionNumber}`;
                userAnswers[inputId] = { userAnswer: '', correctAnswer: content };

                const inputSize =  Math.max(content.length, 1)*1.5;
                questionHTML = `<span class="input-container" id="${inputId}" data-answer="${content}" data-type="c" >
                                    <span class="question-number">${questionNumber}</span>
                                    <span class="hint-text" style = "display: none;">${content}</span>
                                    <input type="text" placeholder="" data-type="userinput" size="${inputSize}"/>
                                </span>`;
            } else if (type === 'fc') { //초성형 문제
                const [answer, size] = content.split('@');
                const inputId = `input-${questionNumber}`;
                userAnswers[inputId] = { userAnswer: '', correctAnswer: answer };

                if (qndisplay == 0){
                    const inputSize = size*1.5;
    
                    questionHTML = `<span class="input-container" id="${inputId}" data-answer="${answer}" data-type="c">
                                        <span class="question-number">${questionNumber}</span>
                                        <input type="text" placeholder="" data-type="userinput" size="${inputSize}"/>
                                    </span>`;
                }else{
                    const inputSize = size*1.5; //아직 지정 안함.
                    questionHTML = `<span class="input-container" id="${inputId}" data-answer="${answer}" data-type="c">
                                        <span class="question-number">${questionNumber}</span>
                                        <input type="text" placeholder="" data-type="userinput" size="${inputSize}"/>
                                    </span>`;
                }
            } else if (type === 'cc') {
                const inputId = `input-${questionNumber}`;
                userAnswers[inputId] = { userAnswer: '', correctAnswer: content };

                const inputSize =  Math.round(Math.max(content.length, 1)*1.5);

                questionHTML = `<span class="input-container" id="${inputId}" data-answer="${content}" data-type="c" style="margin-left: 0px;">
                                    <span class="question-number">${questionNumber}</span>
                                    <input type="text" placeholder="" data-type="userinput" size="${inputSize}"/>
                                </span>`;
            } else if (type === 'd') {
                const inputId = `input-${questionNumber}`;
                userAnswers[inputId] = { userAnswer: '', correctAnswer: content };

                questionHTML = `<div class="short-container" id="${inputId}" data-answer="${content}" data-type="a">
                                    <span class="question-number">${questionNumber}</span>
                                    <input type="text" placeholder="" data-type="userinput"/>
                                </div>`;
            } else if (type === 'i') {
                    const key = `img${currentImage}`;     // 예: "img1"
                    const thisImageInfo = imageInfoMap[key];
                    const dimgsrc   = thisImageInfo.src;
                    const dimgcap   = thisImageInfo.caption;
                    const dimgwidth = thisImageInfo.naturalWidth;
                    const dimgheight= thisImageInfo.naturalHeight;
                    const dimgposi = thisImageInfo.position;

                    let dimgsize;
                    if (thisImageInfo.size == 'big'){
                        dimgsize = 350;
                    }else if (thisImageInfo.size == 'mid'){
                        dimgsize = 200;
                    }else{
                        dimgsize = 160;
                    }
                    if(mobile == 0){
                    questionHTML = `
                        <div class="image-container" data-posi = ${dimgposi}>
                            <img id='dimg${currentImage}' src="${dimgsrc}" alt="${dimgcap}" class="embedded-image" data-width = ${dimgwidth} data-height = ${dimgheight}
                            style="height: calc(${dimgsize} / 16 * var(--base));"/>
                            <div class="image-caption">${dimgcap}</div>
                        </div>
                    `;
                    }else{
                    }
                    imageWidth = dimgwidth; // 전역 변수 설정해둠.
                    imageHeight = dimgheight; // 전역 변수 설정해둠.
                    currentImage++;
                    globalQuestionCounter--;
            }

            globalQuestionCounter++;
            return questionHTML;
        });

        // 모든 .choice-option 및 .choice-options 요소를 검사
        document.querySelectorAll('.choice-option, .choice-options').forEach(option => {
            if (!option.textContent.trim()) {
                // 텍스트가 비어있는 경우
                option.style.backgroundColor = '#0000005f'; // 배경 투명
                option.style.pointerEvents = 'none'; // 선택 불가
                option.style.width = 'calc(3/ 16 * 1em)'; // 너비를 1px로 설정
                option.style.height = 'calc(25/ 16 * 1em)'; // 너비를 1px로 설정
                option.style.minWidth = '0'; // 최소 너비 제한 해제
                option.style.padding = '0'; // 내부 여백 제거
                option.style.whiteSpace = 'nowrap'; // 텍스트 줄바꿈 방지
                option.style.verticalAlign = 'middle';
            }
        });

        // passageContext 생성
        let passageContext = document.createElement('div');
        passageContext.innerHTML = replacedPassage;
        let posi = '';
        

        const dataposi = passageContext.querySelector('[data-posi]');
        if (dataposi) {
            posi = dataposi.getAttribute('data-posi');
        }else{
            passageContext.classList.add('passage');
        }

            if (allPassages[index][0] === 'C') {
                passageContext.style.textIndent = "calc(-10 / 16 * 1em)";
                const submark = document.createElement('span');
                submark.textContent = '#';
                submark.className = 'submark';
                passageContext.prepend(submark);

            }else if (allPassages[index][0] === 'BB') {
                passageContext.style.textIndent = "calc(0 / 16 * 1em)";
                
            }else if(allPassages[index][0] === 'D') {
                passageContext.style.textIndent = "calc(-50 / 16 * 1em)";
                passageContext.style.paddingLeft = "calc(40 / 16 * 1em)";
                passageContext.style.width = "90%";
                const submark = document.createElement('span');
                submark.textContent = '-';
                submark.className = 'submark_small';
                passageContext.prepend(submark);

            }else if(allPassages[index][0] === 'E') {
                passageContext.style.textIndent = "calc(-60 / 16 * 1em)";
                passageContext.style.paddingLeft = "calc(60 / 16 * 1em)";
                passageContext.style.width = "85%";
                const submark = document.createElement('span');
                submark.textContent = '▸';
                submark.className = 'submark_small';
                passageContext.prepend(submark);

            }else if(allPassages[index][0] === 'N') {
                passageContext.style.textIndent = "calc(-50 / 16 * 1em)";
                passageContext.style.paddingLeft = "calc(0 / 16 * 1em)";
                if(mobile == 0){
                    passageContext.style.marginLeft = "calc(40 / 16 * 1em)";   
                }else{
                    passageContext.style.marginLeft = "calc(25 / 16 * 1em)";
                }
                passageContext.style.width = "90%";
                        if (ENum_doubled === 'L') {
                            // 'L'인 경우, 해당 L 프레임 내부에서 .nummark_small 요소 찾기
                            let container = document.getElementById(`double_${ENum_doublenum}_L`);
                            if (container) {
                            const nummarks = container.querySelectorAll('.nummark');
                            if (nummarks.length > 0) {
                                const lastNum = parseInt(nummarks[nummarks.length - 1].textContent.trim(), 10);
                                ENum = lastNum;
                            } else {
                                // 만약 해당 컨테이너에 .nummark_small 요소가 없다면, 기본 처리
                                const nummarksAll = document.querySelectorAll('.nummark');
                                if (nummarksAll.length > 0) {
                                const lastNum = parseInt(nummarksAll[nummarksAll.length - 1].textContent.trim(), 10);
                                ENum = lastNum;
                                }
                            }
                            } else {
                            // container를 찾지 못하면 전체 DOM에서 찾기
                            const nummarksAll = document.querySelectorAll('.nummark');
                            if (nummarksAll.length > 0) {
                                const lastNum = parseInt(nummarksAll[nummarksAll.length - 1].textContent.trim(), 10);
                                ENum = lastNum;
                            }
                            }
                        } else {
                            // 'L'이 아닌 경우 전체 DOM에서 마지막 .nummark_small 요소 사용
                            const nummarks = document.querySelectorAll('.nummark');
                            if (nummarks.length > 0) {
                            const lastNum = parseInt(nummarks[nummarks.length - 1].textContent.trim(), 10);
                            ENum = lastNum;
                            }
                        }
                const nummark = document.createElement('span');
                nummark.textContent = `${ENum+1}.`;
                nummark.className = 'nummark';
                passageContext.prepend(nummark);
                ENum++;
                passageENum++;

                    if (doubled == 1){
                        ENum_doubled = 'L';
                        ENum_doublenum = doublenum;
                    }else if (doubled == 2){
                        ENum_doubled = 'R';
                        ENum_doublenum = doublenum;
                    }else if (doubled == 0){
                        ENum_doubled = 'single';
                    }

            }else if(allPassages[index][0] === 'NF') {
                passageContext.style.textIndent = "calc(-50 / 16 * 1em)";
                passageContext.style.paddingLeft = "calc(0 / 16 * 1em)";
                if(mobile == 0){
                    passageContext.style.marginLeft = "calc(40 / 16 * 1em)";   
                }else{
                    passageContext.style.marginLeft = "calc(25 / 16 * 1em)";
                }
                ENum = 0;
                passageENum = 0;
                passageContext.style.width = "90%";
                const nummark = document.createElement('span');
                nummark.textContent = `${ENum+1}.`;
                nummark.className = 'nummark';
                passageContext.prepend(nummark);
                ENum++;
                passageENum++;

            }else if(allPassages[index][0] === 'M') {
                passageContext.style.textIndent = "calc(-50 / 16 * 1em)";
                passageContext.style.paddingLeft = "calc(0 / 16 * 1em)";
                passageContext.style.marginLeft = "calc(70 / 16 * 1em)";
                
                passageContext.style.width = "85%";
                const nummarks = document.querySelectorAll('.nummark_small');
                if (nummarks.length === 0) {
                    // 요소가 없을 경우 처리
                }else{
                    const lastNum = parseInt(nummarks[nummarks.length - 1].textContent.trim(), 10);
                    EMum = lastNum;
                }
                const nummark = document.createElement('span');
                nummark.textContent = `${EMum+1}.`;
                nummark.className = 'nummark_small';
                passageContext.prepend(nummark);
                EMum++;
                passageEMum++;

            }else if(allPassages[index][0] === 'MF') {
                passageContext.style.textIndent = "calc(-50 / 16 * 1em)";
                passageContext.style.paddingLeft = "calc(0 / 16 * 1em)";
                passageContext.style.marginLeft = "calc(70 / 16 * 1em)";
                EMum = 0;
                passageEMum = 0;
                passageContext.style.width = "85%";
                const nummark = document.createElement('span');
                nummark.textContent = `${EMum+1}.`;
                nummark.className = 'nummark_small';
                passageContext.prepend(nummark);
                EMum++;
                passageEMum++;
                
            }else if(allPassages[index][0] === 'A') {
                passageContext.style.textIndent = "calc(0 / 16 * 1em)";
                passageContext.style.paddingLeft = "calc(0 / 16 * 1em)";
                
                const mainPara = document.createElement('div');
                mainPara.innerHTML = passageContext.innerHTML
                passageContext.innerHTML = '';
                mainPara.classList.add('mainPara');
                passageContext.style.width = "80%";
                mainPara.style.lineHeight = "2";
                passageContext.appendChild(mainPara);

            }else if(allPassages[index][0] === 'AP') {
                passageContext.style.textIndent = "calc(0 / 16 * 1em)";
                passageContext.style.paddingLeft = "calc(0 / 16 * 1em)";
                const mainPara = document.createElement('div');
                mainPara.innerHTML = passageContext.innerHTML
                passageContext.innerHTML = '';
                mainPara.classList.add('mainPara');
                passageContext.style.width = "80%";
                mainPara.style.lineHeight = "3";
                passageContext.appendChild(mainPara);

            }else if(allPassages[index][0] === 'AA') {
                passageContext.style.textIndent = "calc(0 / 16 * 1em)";
                passageContext.style.paddingLeft = "calc(0 / 16 * 1em)";
                passageContext.style.marginTop = "calc(-50 / 16 * 1em)";
                passageContext.style.marginBottom = "calc(40 / 16 * 1em)";
                
                const mainPara = document.createElement('div');
                mainPara.innerHTML = passageContext.innerHTML
                passageContext.innerHTML = '';
                mainPara.classList.add('mainPara');
                passageContext.style.width = "80%";
                mainPara.style.lineHeight = "2";
                mainPara.style.paddingLeft = "calc(10 / 16 * 1em)";
                passageContext.appendChild(mainPara);

            }else if(allPassages[index][0] === 'T') { // 문항 출제 등 Title을 사용하는 경우
                passageContext.style.textIndent = "calc(0 / 16 * 1em)";
                passageContext.style.paddingLeft = "calc(0 / 16 * 1em)";
                
                const mainPara = document.createElement('div');
                mainPara.innerHTML = passageContext.innerHTML
                passageContext.innerHTML = '';
                mainPara.classList.add('titlePara');
                passageContext.style.width = "80%";
                passageContext.appendChild(mainPara);

            }else if(allPassages[index][0] === 'Q') {
                const tableCont = document.createElement('div');
                tableCont.innerHTML = createTableWithHTML(passageContext.innerHTML);
                tableCont.className = 'q_table_cont';
                passageContext.innerHTML = '';

                const rowCount = tableCont.getElementsByTagName('table').length;
    
                const baseHeight = 0; // 기본 여백
                let rowHeight = 60; // 행당 높이

                // 모든 td 요소를 순회
                const tds = tableCont.querySelectorAll('td');
                tds.forEach(td => {
                    // td.innerHTML을 기준으로 교체
                    if (td.innerHTML.includes('|')) {
                        td.innerHTML = td.innerHTML.replace(/\|/g, '<br>');
                        rowHeight += 0;
                    }
                    
                });
                // 행 수에 따라 컨테이너 높이 설정
                // 예: 기본 높이 + (행당 높이 * 행 수)
                const totalHeight = baseHeight + (rowHeight * rowCount);
                /*tableCont.style.height = `calc(${totalHeight} / 16 * var(--base))`;*/
 

                passageContext.appendChild(tableCont);
            }

        // passageBox 생성
        const passageBox = document.createElement('div');
        passageBox.classList.add('passage-box');
        passageBox.setAttribute('id', `psgbox_${psgnum + 1}`);
        

        // type이 onebyone인 경우 N(문항 번호) passageBox의 display를 none으로 바꿈.
        if(type == 'onebyone'){
            if(allPassages[index][0].startsWith('N')){
                if (firstcheck == 0){
                    firstcheck = psgnum + 1;
                    nowQ = firstcheck;
                }else{
                    passageBox.style.display = 'none';
                }
            }else if(allPassages[index][0].startsWith('A')){
                passageBox.setAttribute('contextType', 'passage');
                    if (firstcheck !== 0){
                    passageBox.style.display = 'none';
                    }else{
                        nowP = psgnum + 1; //처음 등장하는 passage를 nowP에 미리 저장함.
                        firstP = nowP; //처음 등장하는 passage를 firstP로 저장함.
                    }
            }else if(allPassages[index][0].startsWith('img')){ // img는 출력하지 않도록 설정
                passageBox.remove;
                return;
            }
            
        }
        passageBox.appendChild(passageContext);

        // 조건을 만족하는 경우 indent 요소에 너비를 추가.
        if (allPassages[index][0].startsWith('A')){
            const indentElements = passageBox.querySelectorAll(`.indent_${psgnum}`);
            if (indentElements.length > 0) {
                
                // 모든 요소에 너비 적용
                indentElements.forEach(element => {
                    element.style.display = 'inline-block';
                    element.style.width = 'calc(8 / 16 * var(--base))';
                });
            }
        }

        /*/ 높이 합계 표시 요소 생성 및 passageBox에 추가 (지금까지 이게 존재했는데 왜 존재하는지 잘 모르는 상황이 되어벌임;;)
        const heightTotalDisplay = document.createElement('div');
        heightTotalDisplay.classList.add('height-total');
        passageBox.appendChild(heightTotalDisplay);*/

        // passageBox를 #passage에 추가
        const parentElement = document.getElementById(`passage_${pagenum}`);
        if (parentElement && posi != '') {
            const lastman = document.querySelector(`#psg_${psgnum}`);
            if (lastman) {
                // `passageBox`를 새로 만든 요소를 `lastman`에 추가
                passageContext.style.position = 'absolute';
                if (posi == 'TR'){
                    passageContext.style.top = 'calc(40 / 16 * var(--base))';
                    passageContext.style.right = 'calc(15 / 16 * var(--base))';
                }
                lastman.appendChild(passageContext);
            }
        } else {
            psgnum++;
            passageContext.setAttribute('id', `psg_${psgnum}`);
        }
        posi = '';

        if (doubled == 1) {
            // doubled가 1이면, id가 "double_${doublenum}_L" 인 요소를 찾음
            let leftElem = document.getElementById(`double_${doublenum}_L`);
            if (leftElem) {
              leftElem.appendChild(passageBox);
            } else {
              console.warn(`Element with id double_${doublenum}_L not found.`);
            }
            if (double_fix == 'false'){
            doubled = 2;
            }
          } else if (doubled == 2) {
            // doubled가 2이면, id가 "double_${doublenum}_R" 인 요소를 찾음
            let rightElem = document.getElementById(`double_${doublenum}_R`);
            if (rightElem) {
              rightElem.appendChild(passageBox);
            } else {
              console.warn(`Element with id double_${doublenum}_R not found.`);
            }
            if (double_fix == 'false'){
            doubled = 1;
            }
          } else {
            // 그 외에는 parentElement에 추가
            parentElement.appendChild(passageBox);
            heightCalculator(passageBox.offsetHeight);
        }
        
        if (allPassages[index][2]){
            let passageNotation = document.createElement('div');
            passageNotation.classList.add('passageNotation');
            passageNotation.textContent = allPassages[index][2];
            passageContext.appendChild(passageNotation);
        }
        
        if (qndisplay == 1){
            const qns = passageBox.querySelectorAll(".question-number");
            qns.forEach(div => {
                div.style.display = "none";
              });
        }

        // 이벤트 연결
        passageContext.querySelectorAll('.hint-container').forEach(container => {
            const input = container.querySelector('input');
            container.addEventListener('click', function () {
                input.focus();
            });

            input.addEventListener('blur', function () {
                const userAnswer = this.value;
                userAnswers[container.id].userAnswer = userAnswer;
            });

            input.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') {
                    const userAnswer = this.value;
                    userAnswers[container.id].userAnswer = userAnswer;
                    this.blur();
                }
            });
        });

        passageContext.querySelectorAll('.input-container').forEach(container => {
            const input = container.querySelector('input');
            container.addEventListener('click', function () {
                input.focus();
            });

            input.addEventListener('blur', function () {
                const userAnswer = this.value;
                userAnswers[container.id].userAnswer = userAnswer;
            });

            input.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') {
                    const userAnswer = this.value;
                    userAnswers[container.id].userAnswer = userAnswer;
                    this.blur();
                }
            });
        });

        passageContext.querySelectorAll('.choice-container .choice-option').forEach(option => {
            option.addEventListener('click', function () {
                const container = option.parentElement;
                container.querySelectorAll('.choice-option').forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');

                const selectedAnswer = option.textContent;
                userAnswers[container.id].userAnswer = selectedAnswer;
            });
        });

        passageContext.querySelectorAll('.choice-container .choice-options').forEach(option => {
            option.addEventListener('click', function () {
                const container = option.parentElement;
                const selectedAnswer = option.textContent;
        
                // 이미 선택된 경우 선택 해제
                if (option.classList.contains('selected')) {
                    option.classList.remove('selected');
                    userAnswers[container.id].userAnswer = userAnswers[container.id].userAnswer.filter(
                        answer => answer !== selectedAnswer
                    );
                } else {
                    // 새로 선택된 경우 추가
                    option.classList.add('selected');
                    userAnswers[container.id].userAnswer.push(selectedAnswer);
                }
        
                console.log(userAnswers); // 현재 선택 상태 확인
            });
        });
    }
}