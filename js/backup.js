const processedLines = lines.map(line => {
    // ## 주석 처리
    let processing = Annot(line);

    // 정렬 처리(중앙)
    processing = Align(processing);

    // underline 및 다양한 텍스트 도형 처리
    processing = undered(processing);

    // [[내용]] 스타일 적용
    processing = Bolding(processing); // 먼저 bolding 적용

    // 덧말 처리
    processing = Att(processing);


    processing = Arrowed(processing);
    processing = Mobiled(processing);

    let fin = processing;

    if (bracket == 'none') {
        // Check if there are any bracket patterns
        if (/\/\[[^\]]\]\//.test(processing)) {
            // Get all bracket patterns in the line
            const matches = Array.from(processing.matchAll(/\/\[[^\]]\]\//g));
            if (matches.length >= 2 && matches[0][0] === matches[matches.length - 1][0]) {
                // If we have matching brackets at start and end
                const bracketType = processing.match(/\[[^\]]\]/)?.[0];
                // Remove the bracket patterns and get the content
                const content = processing.replace(/\/\[[^\]]\]\//g, '');
                
                fin = `<div class="bracket">
                    <div class="bracket-label">${bracketType}</div>
                        <span class="bracket-single"></span>
                        <span class="bracket-blank"></span>
                        <div class="bracket-content" style="text-indent: calc(0 / 16 * var(--base))">
                            ${content}
                        </div>
                    </div>
                </div>`;
                
                return fin;
            } else {
                // If we only found opening bracket
                bracket = processing.match(/\[[^\]]\]/)?.[0];
                bracketHtml += processing.replace(/\/\[[^\]]\]\//g, '') + '<br>';
                return null;
            }
        }
    } else if (/\/\[[^\]]\]\//.test(processing) && bracket == processing.match(/\[[^\]]\]/)?.[0]) {
        // bracket 엔딩
        bracketHtml += processing.replace(/\/\[[^\]]\]\//g, '');
        const indentSpan = `<span class="indent_${psgnum}"></span>`;
        bracketHtml = indentSpan + bracketHtml;
        bracketHtml = bracketHtml.replace(/<br\s*\/?>/gi, function(match, offset, string) {
            // 문서의 끝에 있는 <br> 태그인지 확인
            if (offset + match.length >= string.length) {
                // 문서의 마지막 <br>은 그대로 유지
                return match;
            } else {
                // 나머지 모든 <br>에는 indentSpan 추가
                return match + indentSpan;
            }
        });
        fin = `<div class="bracket">
            <div class="bracket-top"></div>
            <div class="bracket-label">${bracket}</div>
            <div class="bracket-bot"></div>
            <div class="bracket-content" style="text-indent: calc(0 / 16 * var(--base))">
                ${bracketHtml}
            </div>
        </div>`;
        bracket = 'none';
        bracketHtml = '';
        return fin;
    } else if (bracket != 'none') {
        bracketHtml += processing + '<br>';
        return null;
    } else {
        bracketHtml = '';
        bracket = 'none';
        return processing;
    }
    
    return processing;
});

 /*cell.innerHTML = originalContent.replace(regex, (match, type, content) => {
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

                } else if (type === 'v') {
                    questionHTML = `<span class="v-mark-container">
                                    <span>${content}</span>
                                    <span class="v-mark-top">ˇ</span>
                                    </span>`;
                    return questionHTML;
                } else {
                    questionHTML = match; // 패턴이 다르면 원본 그대로 유지
                    return questionHTML;
                }
            });*/