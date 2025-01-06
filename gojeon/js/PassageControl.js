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
    svgElement.style.margin = '30px auto';
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
            const regex = /\*([a-z])\*\((.*)\)/g;
            const originalContent = cell.innerHTML;
            cell.innerHTML = originalContent.replace(regex, (match, type, content) => {
                let questionNumber = globalQuestionCounter;
                let questionHTML = "";
                if (type === "a") {
                    const [hint, answer] = content.split("_");
                    const inputId = `input-${questionNumber}`;
                    userAnswers[inputId] = { userAnswer: "", correctAnswer: answer };
        
                    const inputSize = Math.max(answer.length, 3) * 1.7;
        
                    questionHTML = `<div class="hint-container" id="${inputId}" data-answer="${answer}" data-type="a">
                                        <span class="question-number">${questionNumber}</span>
                                        <span class="hint-text">${hint}</span>
                                        <input type="text" placeholder="" size="${inputSize}" />
                                    </div>`;
                    globalQuestionCounter++;
                    return questionHTML;
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
        heightCalculator(passageContext.offsetHeight);
    
    }else if(allPassages[index][0] =='diaq'){

        // 지문을 줄 단위로 분리
        const lines = passage.split('\n');
        let bracketPassage = '';
        
        const processedLines = lines.map(line => {
            return line
        });

        const regex = /\*([a-z])\*\((.*)\)/;
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
                                    background-color: white;
                                    text-align: center;
                                    z-index: 1000;
                                ">
                                (${mark})
                            </div>`;
                target = tar;
            }else if (type === 'a'){
                const [hint, answer, tar] = content.split('_');
                const inputId = `input-${questionNumber}`;
                userAnswers[inputId] = { userAnswer: '', correctAnswer: answer };

                const inputSize = Math.max(answer.length, 3)*1.7;

                questionHTML = `<div class="hint-container" id="${inputId}" data-answer="${answer}" data-type="a">
                                    <span class="question-number">${questionNumber}</span>
                                    <span class="hint-text">${hint}</span>
                                    <input type="text" placeholder="" size="${inputSize}" />
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
        document.getElementById(`passage_${pagenum}`).appendChild(passageBox);

        heightCalculator(passageBox.offsetHeight);

    }else if(allPassages[index][0] == 'split'){
        console.log(allPassages[index][0]);
    }else{
    
        const regex = /\*(\w)\*\((.*?)\)/g;

        // 지문을 줄 단위로 분리
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

            let fin = arr;
                if (/\/\[A\]\//.test(arr) && bracket == 'none'){
                    bracket = arr.match(/\[A\]/)?.[0];
                    bracketHtml += arr.replace(/\/\[A\]\//g, '') + '<br>';
                    return null;
                }else if(/\/\[A\]\//.test(arr) && bracket == arr.match(/\[A\]/)?.[0]){ //bracket 엔딩
                    bracketHtml += arr.replace(/\/\[A\]\//g, '');
                    fin = `<div class="bracket">
                                <div class="bracket-top"></div>
                                <div class="bracket-label">${bracket}</div>
                                <div class="bracket-bot"></div>
                            <div class="bracket-content">
                                ${bracketHtml}
                            </div>
                        </div>`;
                   bracket = 'none';
                   bracketHtml = '';
                   
                   return fin
                }else if(bracket != 'none'){
                    bracketHtml += arr + '<br>';
                    return null;
                }else{
                    bracketHtml = '';
                    bracket = 'none';
                    return arr;
                }
            return arr
        });


        const filteredLines = processedLines.filter(line => line !== null); //bracket 값이 null인 경우 공백을 삭제함.
        const passageWithLineBreaks = filteredLines.join('<br>');
        let replacedPassage = passageWithLineBreaks.replace(regex, (match, type, content) => {
            let questionNumber = globalQuestionCounter;
            let questionHTML = '';

            if (type === 'a') { //초성형 문제
                const [hint, answer] = content.split('_');
                const inputId = `input-${questionNumber}`;
                userAnswers[inputId] = { userAnswer: '', correctAnswer: answer };

                const inputSize = Math.max(answer.length, 3)*1.7;

                questionHTML = `<span class="hint-container" id="${inputId}" data-answer="${answer}" data-type="a">
                                    <span class="question-number">${questionNumber}</span>
                                    <span class="hint-text">${hint}</span>
                                    <input type="text" placeholder="" size="${inputSize}" />
                                </span>`;
            } else if (type === 'b') {
                const options = content.split('/');
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
            } else if (type === 'c') {
                const inputId = `input-${questionNumber}`;
                userAnswers[inputId] = { userAnswer: '', correctAnswer: content };

                const inputSize = Math.max(content.length, 3)*1.7;

                questionHTML = `<span class="input-container" id="${inputId}" data-answer="${content}" data-type="a">
                                    <span class="question-number">${questionNumber}</span>
                                    <input type="text" placeholder="" size="${inputSize}" />
                                </span>`;
            } else if (type === 'd') {
                const inputId = `input-${questionNumber}`;
                userAnswers[inputId] = { userAnswer: '', correctAnswer: content };

                questionHTML = `<div class="short-container" id="${inputId}" data-answer="${content}" data-type="a">
                                    <span class="question-number">${questionNumber}</span>
                                    <input type="text" placeholder="">
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
                        dimgsize = 650;
                    }else if (thisImageInfo.size == 'mid'){
                        dimgsize = 150;
                    }else{
                        dimgsize = thisImageInfo.size;
                    }

                    questionHTML = `
                        <div class="image-container" data-posi = ${dimgposi}>
                            <img id='dimg${currentImage}' src="${dimgsrc}" alt="${dimgcap}" class="embedded-image" data-width = ${dimgwidth} data-height = ${dimgheight}
                            style="height: calc(${dimgsize} / 16 * var(--base));"/>
                            <div class="image-caption">${dimgcap}</div>
                        </div>
                    `;
                    imageWidth = dimgwidth; // 전역 변수 설정해둠.
                    imageHeight = dimgheight; // 전역 변수 설정해둠.
                    currentImage++;
                    globalQuestionCounter--;
            }

            globalQuestionCounter++;
            return questionHTML;
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

            if (allPassages[index][0].charAt(0) === 'C') {
                passageContext.style.textIndent = "calc(-10 / 16 * 1em)";
                const submark = document.createElement('span');
                submark.textContent = '#';
                submark.className = 'submark';
                passageContext.prepend(submark);
                ENum = 0;
                passageENum = 0;
                
            }else if(allPassages[index][0].charAt(0) === 'D') {
                passageContext.style.textIndent = "calc(-50 / 16 * 1em)";
                passageContext.style.paddingLeft = "calc(40 / 16 * 1em)";
                const submark = document.createElement('span');
                submark.textContent = '-';
                submark.className = 'submark_small';
                passageContext.prepend(submark);
                ENum = 0;
                passageENum = 0;

            }else if(allPassages[index][0].charAt(0) === 'E') {
                passageContext.style.textIndent = "calc(-50 / 16 * 1em)";
                passageContext.style.paddingLeft = "calc(0 / 16 * 1em)";
                passageContext.style.marginLeft = "calc(40 / 16 * 1em)";
                
                passageContext.style.width = "90%";
                const nummark = document.createElement('span');
                nummark.textContent = `${ENum+1}.`;
                nummark.className = 'nummark_small';
                passageContext.prepend(nummark);
                ENum++;
                passageENum++;
                
            }else if(allPassages[index][0].charAt(0) === 'A') {
                passageContext.style.textIndent = "calc(0 / 16 * 1em)";
                passageContext.style.paddingLeft = "calc(0 / 16 * 1em)";
                
                const mainPara = document.createElement('div');
                mainPara.innerHTML = passageContext.innerHTML
                passageContext.innerHTML = '';
                mainPara.classList.add('mainPara');
                passageContext.style.width = "80%";
                passageContext.appendChild(mainPara);

            }else if(allPassages[index][0].charAt(0) === 'Q') {
                const tableCont = document.createElement('div');
                tableCont.innerHTML = createTableWithHTML(passageContext.innerHTML);                
                tableCont.className = 'q_table_cont';
                passageContext.innerHTML = '';

                const rowCount = tableCont.getElementsByTagName('table').length;
    
                // 행 수에 따라 컨테이너 높이 설정
                // 예: 기본 높이 + (행당 높이 * 행 수)
                const baseHeight = 0; // 기본 여백
                const rowHeight = 60; // 행당 높이
                const totalHeight = baseHeight + (rowHeight * rowCount);
                
                tableCont.style.height = `calc(${totalHeight} / 16 * var(--base))`;
                passageContext.appendChild(tableCont);
            }

        // passageBox 생성
        const passageBox = document.createElement('div');
        passageBox.classList.add('passage-box');

        // 높이 합계 표시 요소 생성 및 passageBox에 추가
        const heightTotalDisplay = document.createElement('div');
        heightTotalDisplay.classList.add('height-total');
        passageBox.appendChild(heightTotalDisplay);

        // passageContext를 passageBox에 추가
        passageBox.appendChild(passageContext);


        // passageBox를 #passage에 추가
        const parentElement = document.getElementById(`passage_${pagenum}`);
        if (parentElement && posi != '') {
            const lastman = document.querySelector(`#psg_${psgnum}`);
            if (lastman) {
                // `passageBox`를 새로 만든 요소를 `lastman`에 추가
                passageContext.style.position = 'absolute';
                if (posi == 'TR'){
                    passageContext.style.top = '3%';
                    passageContext.style.right = '5%';
                }
                lastman.appendChild(passageContext);
            }
        } else {
            psgnum++;
            passageContext.setAttribute('id', `psg_${psgnum}`);
        }
        posi = '';
        parentElement.appendChild(passageBox);

        
        heightCalculator(passageBox.offsetHeight);

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

        passageContext.querySelectorAll('.choice-container .choice-option').forEach(option => {
            option.addEventListener('click', function () {
                const container = option.parentElement;
                container.querySelectorAll('.choice-option').forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');

                const selectedAnswer = option.textContent;
                userAnswers[container.id].userAnswer = selectedAnswer;
            });
        });
    }
}