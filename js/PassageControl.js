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
        
        let bracket = 'none';
        let bracketHtml = '';
        
        const processedLines = lines.map(line => {
            // styled 함수가 텍스트 처리와 bracket 처리를 모두 수행
            const result = styled(line, bracket, bracketHtml);
            
            // 상태 업데이트
            bracket = result.bracket;
            bracketHtml = result.bracketHtml;
            
            // skip이 true면 해당 라인은 건너뜀 (나중에 filter로 제거)
            return result.skip ? null : result.output;
        }).filter(line => line !== null);

        const combinedContent = processedLines.join('\n')

        let tables = tablemaker(combinedContent);
        tables.classList.add('tables');
        console.log(tables);

        let tableHTML = tables.outerHTML; // 또는 tables.innerHTML;
        const parser = new DOMParser();
        const tableDoc = parser.parseFromString(tableHTML, "text/html");
        const targetTable = tableDoc.querySelector("table");


        Array.from(targetTable.querySelectorAll("td")).forEach((cell) => {
            const originalContent = cell.innerHTML;
            cell.innerHTML = stars(originalContent);
            cell.innerHTML = cell.innerHTML.replace(/\|/g, '<br>');
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

        const passageBox = document.createElement('div');
        passageBox.classList.add('passage-box');
        passageBox.setAttribute('id', `psgbox_${psgnum + 1}`);
        passageBox.appendChild(passageContext);
        psgnum++;
        passageContext.setAttribute('inAnswer', `${inAnswer}`);
        passageContext.setAttribute('id', `psg_${psgnum}`);
        
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
            heightCalculator(passageBox.offsetHeight);
        }

        if (qndisplay == 1){
            const qns = passageBox.querySelectorAll(".question-number");
            qns.forEach(div => {
                div.style.display = "none";
              });
        }
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
        passageContext.setAttribute('inAnswer', `${inAnswer}`);

        if (inAnswer == 1){
            passageContext.style.visibility = 'hidden';
        }
        
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
        
        let bracket = 'none';
        let bracketHtml = '';
        
        const processedLines = lines.map(line => {
            // styled 함수가 텍스트 처리와 bracket 처리를 모두 수행
            const result = styled(line, bracket, bracketHtml);
            
            // 상태 업데이트
            bracket = result.bracket;
            bracketHtml = result.bracketHtml;
            
            // skip이 true면 해당 라인은 건너뜀 (나중에 filter로 제거)
            return result.skip ? null : result.output;
        }).filter(line => line !== null);

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
        
        let replacedPassage = stars(passageWithLineBreaks);


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
        /*passageContext.innerHTML = passageContext.innerHTML.replace(/\|/g, '<br>');*/
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
                passageContext.style.marginBottom = `calc(${gap} / 16 * 1em)`;
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
                passageContext.style.marginBottom = `calc(${gap} / 16 * 1em)`;
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
                passageContext.style.marginBottom = "calc(10 / 16 * 1em)";
                
                const mainPara = document.createElement('div');
                mainPara.innerHTML = passageContext.innerHTML
                passageContext.innerHTML = '';
                mainPara.classList.add('mainPara');
                passageContext.style.width = "85%";
                mainPara.style.lineHeight = "2";
                passageContext.appendChild(mainPara);

            }else if(allPassages[index][0] === 'AP') {
                passageContext.style.textIndent = "calc(0 / 16 * 1em)";
                passageContext.style.paddingLeft = "calc(0 / 16 * 1em)";
                const mainPara = document.createElement('div');
                mainPara.innerHTML = passageContext.innerHTML
                passageContext.innerHTML = '';
                mainPara.classList.add('mainPara');
                passageContext.style.width = "85%";
                mainPara.style.lineHeight = "3";

                passageContext.appendChild(mainPara);
            }else if(allPassages[index][0] === 'APP') {
                passageContext.style.textIndent = "calc(0 / 16 * 1em)";
                passageContext.style.paddingLeft = "calc(0 / 16 * 1em)";
                const mainPara = document.createElement('div');
                mainPara.innerHTML = passageContext.innerHTML
                passageContext.innerHTML = '';
                mainPara.classList.add('mainPara');
                passageContext.style.width = "85%";
                mainPara.style.lineHeight = "3.3";
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
                passageContext.style.width = "85%";
                mainPara.style.lineHeight = "2";
                mainPara.style.paddingLeft = "calc(10 / 16 * 1em)";
                passageContext.appendChild(mainPara);

            }else if(allPassages[index][0] === 'OAA') {
                passageContext.style.textIndent = "calc(0 / 16 * 1em)";
                passageContext.style.paddingLeft = "calc(0 / 16 * 1em)";
                passageContext.style.marginTop = "calc(-50 / 16 * 1em)";
                passageContext.style.marginBottom = "calc(40 / 16 * 1em)";
                
                const mainPara = document.createElement('div');
                mainPara.innerHTML = passageContext.innerHTML
                passageContext.innerHTML = '';
                mainPara.classList.add('mainPara');
                passageContext.style.width = "85%";
                mainPara.style.lineHeight = "2";
                mainPara.style.paddingLeft = "calc(30 / 16 * 1em)";
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

                    if(mobile == 1){
                        tableCont.style.width = '100%';
                    }

                passageContext.innerHTML = '';

                const rowCount = tableCont.getElementsByTagName('table').length;
    
                const baseHeight = 0; // 기본 여백
                let rowHeight = 60; // 행당 높이

                const totalHeight = baseHeight + (rowHeight * rowCount);
                /*tableCont.style.height = `calc(${totalHeight} / 16 * var(--base))`;*/
                passageContext.appendChild(tableCont);
            }else if(allPassages[index][0].startsWith('inbox_')){
                posi = 'inbox';
                // allPassages[index][0]에서 문자열 가져오기
                const inboxId = allPassages[index][0];
                        
                // 유효성 검사
                if (!inboxId || !inboxId.startsWith("inbox_") || !inboxId.includes("@")) {
                    throw new Error(`Invalid format at index ${index}. Expected: inbox_A@B`);
                }

                // 파싱 로직
                const withoutPrefix = inboxId.substring(inboxId.indexOf("_") + 1);
                const parts = withoutPrefix.split("@");

                if (parts.length !== 2) {
                    throw new Error(`Invalid format at index ${index}. Expected: inbox_A@B`);
                }

                // 결과 저장
                inboxX = parts[0];
                inboxY = parts[1];
                passageContext.style.width = "auto";
            }
            
        passageContext.innerHTML = passageContext.innerHTML.replace(/\|/g, '<br>');
        // passageBox 생성
        const passageBox = document.createElement('div');
        passageBox.classList.add('passage-box');
        passageBox.setAttribute('id', `psgbox_${psgnum + 1}`);
        passageContext.setAttribute('inAnswer', `${inAnswer}`);

        if (inAnswer == 1){
            passageContext.style.visibility = 'hidden';
        }

        // type이 onebyone인 경우 N(문항 번호) passageBox의 display를 none으로 바꿈.
        if(type == 'onebyone'){
            if(allPassages[index][0].startsWith('N')){
                if (firstcheck == 0){
                    firstcheck = psgnum + 1;
                    nowQ = firstcheck;
                }else{
                    passageBox.style.display = 'none';
                }
            }else if(allPassages[index][0].startsWith('A') || allPassages[index][0].startsWith('OA')){
                passageBox.setAttribute('contextType', 'passage');
                    if (nowP !== 0){
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
                    element.style.height = 'calc(2 / 16 * var(--base))';
                });
            }
        } else if (allPassages[index][0].startsWith('OA')){
            const indentElements = passageBox.querySelectorAll(`.indent_${psgnum}`);
            if (indentElements.length > 0) {
                
                // 모든 요소에 너비 적용
                indentElements.forEach(element => {
                    element.style.display = 'inline-block';
                    element.style.width = 'calc(1 / 16 * var(--base))';
                    element.style.height = 'calc(2 / 16 * var(--base))';
                    element.style.marginLeft = 'calc(-10 / 16 * var(--base))';
                });
            }
            const bracketElements = passageContext.querySelectorAll('.bracket');
            if (bracketElements.length > 0) {
                bracketElements.forEach(element => {
                element.style.marginLeft = 'calc(5 / 16 * var(--base))';
                });
            }
            
            // bracket-content 클래스 요소의 padding-left 설정
            const bracketContentElements = passageContext.querySelectorAll('.bracket-content');
            if (bracketContentElements.length > 0) {
                bracketContentElements.forEach(element => {
                  element.style.paddingLeft = 'calc(10 / 16 * var(--base))';
                });
            }
        }

        /*/ 높이 합계 표시 요소 생성 및 passageBox에 추가 (지금까지 이게 존재했는데 왜 존재하는지 잘 모르는 상황이 되어벌임;;)
        const heightTotalDisplay = document.createElement('div');
        heightTotalDisplay.classList.add('height-total');
        passageBox.appendChild(heightTotalDisplay);*/

        // img 요소나 inbox 요소를 이전에 위치한 문단 안에 삽입함.
        // passageBox를 #passage에 추가
        const parentElement = document.getElementById(`passage_${pagenum}`);
        if (parentElement && posi != '') {
            const lastman = document.querySelector(`#psg_${psgnum}`);
            if (lastman) {
                // `passageBox`를 새로 만든 요소를 `lastman`에 추가
                passageContext.style.position = 'absolute';
                if (posi == 'TR'){
                    passageContext.style.top = 'calc(40 / 16 * var(--base))';
                    passageContext.style.right = 'calc(25 / 16 * var(--base))';
                }else if (posi == 'inbox'){
                    passageContext.style.right = `calc(${Number(inboxX) + 15}/ 16 * var(--base))`;
                    passageContext.style.top = `calc(${Number(inboxY) + 40}/ 16 * var(--base))`;
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
            const hasNummark = passageContext.querySelector('span.nummark') !== null;
                // nummark가 있으면 추가 클래스 적용 또는 직접 스타일 지정
                if (hasNummark) {
                    passageNotation.style.transform = 'translateY(calc(-25 / 16 * var(--base)))';
                }
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