const starsregex = /\*(\w+)\*\{(.*?)\}/g;
let tablestar;

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

                let effectiveLength = 0;
                for (const char of answer) {
                effectiveLength += (char === ' ' ? 0.3 : 1);
                }
                let minimums;
                let inputSize;
                let hintwidth;
                let multiple;
                let fontSize;

                if (qndisplay == 0){
                    minimums = 2.5;
                    hintwidth = 68;
                }else{
                    minimums = 1.5;
                    hintwidth = 85;
                }
                
                if (mobile == 0){ //desktop 모드에서
                    if (tablestar == 0){ //table이 아닌 일반적인 경우
                        multiple = 15;
                        fontSize = 12;
                    }else{ //table이 사용된 경우
                        multiple = 11;
                        fontSize = 10;
                    }
                    
                }else{
                    if (tablestar == 0){ //table이 아닌 일반적인 경우
                        multiple = 14;
                        fontSize = 11;
                    }else{ //table이 사용된 경우
                        multiple = 11;
                        fontSize = 10;
                    }
                }

                    inputSize = Math.round(Math.max(effectiveLength, minimums) * multiple);

                    questionHTML = `<span class="hint-container" id="${inputId}" data-answer="${answer}" data-type="a">
                                        <span class="question-number">${questionNumber}</span>
                                        <span class="hint-text" style="width: ${hintwidth}%;">${hint}</span>
                                        <input type="text" placeholder="" data-type="userinput" style="width: calc(${inputSize} / 16 * var(--base)); font-size: calc(${fontSize} / 16 * var(--base));"/>
                                    </span>`;
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


            let effectiveLength = 0;
            for (const char of answer) {
            effectiveLength += (char === ' ' ? 0.3 : 1);
            }
            let inputSize;
            let hintwidth;
            let multiple;
            let fontSize;

            if (qndisplay == 0){
                hintwidth = 68;
            }else{
                hintwidth = 85;
            }
            
            if (mobile == 0){ //desktop 모드에서
                if (tablestar == 0){ //table이 아닌 일반적인 경우
                    multiple = 15;
                    fontSize = 12;
                }else{ //table이 사용된 경우
                    multiple = 11;
                    fontSize = 10;
                }
                
            }else{
                if (tablestar == 0){ //table이 아닌 일반적인 경우
                    multiple = 14;
                    fontSize = 11;
                }else{ //table이 사용된 경우
                    multiple = 11;
                    fontSize = 10;
                }
            }

                inputSize = size * multiple;

                questionHTML = `<span class="hint-container" id="${inputId}" data-answer="${answer}" data-type="a">
                                    <span class="question-number">${questionNumber}</span>
                                    <span class="hint-text" style="width: ${hintwidth}%;">${hint}</span>
                                    <input type="text" placeholder="" data-type="userinput" style="width: calc(${inputSize} / 16 * var(--base)); font-size: calc(${fontSize} / 16 * var(--base));"/>
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
            let effectiveLength = 0;
            for (const char of content) {
            effectiveLength += (char === ' ' ? 0.3 : 1);
            }
            let minimums;
            let inputSize;
            let hintwidth;
            let multiple;
            let fontSize;

            if (qndisplay == 0){
                minimums = 2.5;
                hintwidth = 68;
            }else{
                minimums = 1.5;
                hintwidth = 85;
            }
            
            if (mobile == 0){ //desktop 모드에서
                if (tablestar == 0){ //table이 아닌 일반적인 경우
                    multiple = 15;
                    fontSize = 12;
                }else{ //table이 사용된 경우
                    multiple = 11;
                    fontSize = 10;
                }
                
            }else{
                if (tablestar == 0){ //table이 아닌 일반적인 경우
                    multiple = 14;
                    fontSize = 11;
                }else{ //table이 사용된 경우
                    multiple = 11;
                    fontSize = 10;
                }
            }

                inputSize = Math.round(Math.max(effectiveLength, minimums) * multiple);

                questionHTML = `<span class="hint-container" id="${inputId}" data-answer="${content}" data-type="c">
                                    <span class="question-number">${questionNumber}</span>
                                    <span class="hint-text" style="width: ${hintwidth}%; display: none;">${content}</span>
                                    <input type="text" placeholder="" data-type="userinput" style="width: calc(${inputSize} / 16 * var(--base)); font-size: calc(${fontSize} / 16 * var(--base));"/>
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

            let effectiveLength = 0;
                for (const char of answer) {
                effectiveLength += (char === ' ' ? 0.3 : 1);
                }
                let inputSize;
                let hintwidth;
                let multiple;
                let fontSize;

                if (qndisplay == 0){
                    hintwidth = 68;
                }else{
                    hintwidth = 85;
                }
                
                if (mobile == 0){ //desktop 모드에서
                    if (tablestar == 0){ //table이 아닌 일반적인 경우
                        multiple = 15;
                        fontSize = 12;
                    }else{ //table이 사용된 경우
                        multiple = 11;
                        fontSize = 10;
                    }
                    
                }else{
                    if (tablestar == 0){ //table이 아닌 일반적인 경우
                        multiple = 14;
                        fontSize = 11;
                    }else{ //table이 사용된 경우
                        multiple = 11;
                        fontSize = 10;
                    }
                }

                    inputSize = size * multiple;

                    questionHTML = `<span class="hint-container" id="${inputId}" data-answer="${answer}" data-type="c">
                                        <span class="question-number">${questionNumber}</span>
                                        <span class="hint-text" style="width: ${hintwidth}%; display: none;">${answer}</span>
                                        <input type="text" placeholder="" data-type="userinput" style="width: calc(${inputSize} / 16 * var(--base)); font-size: calc(${fontSize} / 16 * var(--base));"/>
                                    </span>`;

        } else if (type === 'cc') {
            const inputId = `input-${questionNumber}`;
            userAnswers[inputId] = { userAnswer: '', correctAnswer: content };
            if (noneQuestion == 1){
                questionHTML = `<span class="Bolding">${content}</span>`;
                globalQuestionCounter++;
                return questionHTML;
            }
            let effectiveLength = 0;
            for (const char of content) {
            effectiveLength += (char === ' ' ? 0.3 : 1);
            }
            let minimums;
            let inputSize;
            let hintwidth;
            let multiple;
            let fontSize;

            if (qndisplay == 0){
                minimums = 2.5;
                hintwidth = 68;
            }else{
                minimums = 1.5;
                hintwidth = 85;
            }
            
            if (mobile == 0){ //desktop 모드에서
                if (tablestar == 0){ //table이 아닌 일반적인 경우
                    multiple = 15;
                    fontSize = 12;
                }else{ //table이 사용된 경우
                    multiple = 11;
                    fontSize = 10;
                }
                
            }else{
                if (tablestar == 0){ //table이 아닌 일반적인 경우
                    multiple = 14;
                    fontSize = 11;
                }else{ //table이 사용된 경우
                    multiple = 11;
                    fontSize = 10;
                }
            }

                inputSize = Math.round(Math.max(effectiveLength, minimums) * multiple);

                questionHTML = `<span class="hint-container" id="${inputId}" data-answer="${content}" data-type="c" style="margin-left: 0px;">
                                    <span class="question-number">${questionNumber}</span>
                                    <span class="hint-text" style="width: ${hintwidth}%; display: none;">${content}</span>
                                    <input type="text" placeholder="" data-type="userinput" style="width: calc(${inputSize} / 16 * var(--base)); font-size: calc(${fontSize} / 16 * var(--base));"/>
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
                }else if (thisImageInfo.size == 'small'){
                    dimgsize = 140;
                }else if (thisImageInfo.size == ''){
                    dimgsize = 200;
                }else{
                    if(Number(thisImageInfo.size) >= 700){
                        dimgsize = 700;
                    }else{
                        dimgsize = thisImageInfo.size;
                    }
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