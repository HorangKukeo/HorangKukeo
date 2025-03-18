const starsregex = /\*(\w+)\*\{(.*?)\}/g;

function stars(passageWithLineBreaks){
    let replacedPassage = passageWithLineBreaks.replace(starsregex, (match, type, content) => {
            
            
        let questionNumber = globalQuestionCounter;
        let questionHTML = '';

        if (type === 'a') { //초성형 문제
            const [hint, answer] = content.split('_');
            const inputId = `input-${questionNumber}`;
            userAnswers[inputId] = { userAnswer: '', correctAnswer: answer };
                if (noneQuestion == 1){
                    questionHTML = `<span class="Bolding">${answer}</span>`;
                    globalQuestionCounter++;
                    return questionHTML;
                }

            if (qndisplay == 0){
                const inputSize =  Math.round(Math.max(answer.length, 2)*1.7);

                questionHTML = `<span class="hint-container" id="${inputId}" data-answer="${answer}" data-type="a">
                                    <span class="question-number">${questionNumber}</span>
                                    <span class="hint-text">${hint}</span>
                                    <input type="text" placeholder="" data-type="userinput" size="${inputSize}"/>
                                </span>`;
                                console.log(questionHTML);
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
            if (noneQuestion == 1){
                questionHTML = `<span class="Bolding">${answer}</span>`;
                globalQuestionCounter++;
                return questionHTML;
            }

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
            if (noneQuestion == 1){
                questionHTML = `<span class="Bolding">${answer}</span>`;
                globalQuestionCounter++;
                return questionHTML;
            }

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
            if (noneQuestion == 1){
                questionHTML = `<span class="Bolding">${correctOption}</span>`;
                globalQuestionCounter++;
                return questionHTML;
            }

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
            if (noneQuestion == 1){
                questionHTML = `<span class="Bolding">${correctOptions}</span>`;
                globalQuestionCounter++;
                return questionHTML;
            }

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
            if (noneQuestion == 1){
                questionHTML = `<span class="Bolding">${content}</span>`;
                globalQuestionCounter++;
                return questionHTML;
            }
            const inputSize =  Math.max(content.length, 1)*14;
            questionHTML = `<span class="input-container" id="${inputId}" data-answer="${content}" data-type="c" >
            <span class="question-number">${questionNumber}</span>
            <span class="hint-text" style = "display: none;">${content}</span>
            <input type="text" placeholder="" data-type="userinput" style="width: calc(${inputSize} / 16 * var(--base));""/>
            </span>`;
        } else if (type === 'fc') { //초성형 문제
            const [answer, size] = content.split('@');
            const inputId = `input-${questionNumber}`;
            userAnswers[inputId] = { userAnswer: '', correctAnswer: answer };
            if (noneQuestion == 1){
                questionHTML = `<span class="Bolding">${answer}</span>`;
                globalQuestionCounter++;
                return questionHTML;
            }

            if (qndisplay == 0){
                const inputSize = size*1.5;

                questionHTML = `<span class="input-container" id="${inputId}" data-answer="${answer}" data-type="c">
                                    <span class="question-number">${questionNumber}</span>
                                    <input type="text" placeholder="" data-type="userinput" size="${inputSize}"/>
                                </span>`;
            }else{
                let inputSize;
                if(mobile == 0){
                    inputSize = size * 13;
                }else if(mobile == 1){
                    inputSize = size * 13;
                }
                questionHTML = `<span class="input-container" id="${inputId}" data-answer="${answer}" data-type="c" >
                                    <span class="question-number">${questionNumber}</span>
                                    <span class="hint-text" style = "display: none;">${answer}</span>
                                    <input type="text" placeholder="" data-type="userinput" style="width: calc(${inputSize} / 16 * var(--base));""/>
                                </span>`;
            }
        } else if (type === 'cc') {
            const inputId = `input-${questionNumber}`;
            userAnswers[inputId] = { userAnswer: '', correctAnswer: content };
            if (noneQuestion == 1){
                questionHTML = `<span class="Bolding">${content}</span>`;
                globalQuestionCounter++;
                return questionHTML;
            }

            const inputSize =  Math.round(Math.max(content.length, 1)*1.5);

            questionHTML = `<span class="input-container" id="${inputId}" data-answer="${content}" data-type="c" style="margin-left: 0px;">
                                <span class="question-number">${questionNumber}</span>
                                <input type="text" placeholder="" data-type="userinput" size="${inputSize}"/>
                            </span>`;
        } else if (type === 'd') {
            const inputId = `input-${questionNumber}`;
            userAnswers[inputId] = { userAnswer: '', correctAnswer: content };
            if (noneQuestion == 1){
                questionHTML = `<span class="Bolding">${content}</span>`;
                globalQuestionCounter++;
                return questionHTML;
            }

            questionHTML = `<div class="short-container" id="${inputId}" data-answer="${content}" data-type="a">
                                <span class="question-number">${questionNumber}</span>
                                <input type="text" placeholder="" data-type="userinput"/>
                            </div>`;
        } else if (type === 'v') {
            questionHTML = `<span class="v-mark-container">
                            <span>${content}</span>
                            <span class="v-mark-top">ˇ</span>
                            </span>`;
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
    return replacedPassage;
}