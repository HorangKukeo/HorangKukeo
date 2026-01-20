function parseAndDisplayPassage(index) {

    const passage = allPassages[index][1]; // 두 번째 열의 데이터
    if (allPassages[index][0] == 'split'){
        const regex = /\*(\w)\*\((.*?)\)/g;

        
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
            return arr
        });

        

        const passageWithLineBreaks = processedLines.join('<br>');
        const replacedPassage = passageWithLineBreaks.replace(regex, (match, type, content) => {
            let questionNumber = globalQuestionCounter;
            let questionHTML = '';

            if (type === 'a') {
                const [hint, answer] = content.split('_');
                const inputId = `input-${questionNumber}`;
                userAnswers[inputId] = { userAnswer: '', correctAnswer: answer };

                const inputSize = Math.max(answer.length, 3)*1.7;

                questionHTML = `<span class="highlight-container" id="${inputId}" data-answer="${answer}" data-type="a">
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
                const [hint, answer] = content.split('_');
                const inputId = `input-${questionNumber}`;
                userAnswers[inputId] = { userAnswer: '', correctAnswer: answer };

                const inputSize = 50;

                questionHTML = `<span class="highlight-container" id="${inputId}" data-answer="${answer}" data-type="a">
                                    <span class="question-number">${questionNumber}</span>
                                    <input type="text" placeholder="" size="${inputSize}" />
                                </span>`;
            } else if (type === 'd') {
                questionHTML = `<span class="multiple-select">${content}</span>`;
            }

            globalQuestionCounter++;
            return questionHTML;
        });



        // passageContext 생성
        const passageContext = document.createElement('div');
        passageContext.classList.add('passage');
        passageContext.innerHTML = replacedPassage;
            if (allPassages[index][0].charAt(0) === 'C') {
                passageContext.style.textIndent = "calc(-10 / 16 * 1em)";
                const submark = document.createElement('span');
                submark.textContent = '#';
                submark.className = 'submark';
                passageContext.prepend(submark);
                
            }else if(allPassages[index][0].charAt(0) === 'D') {
                passageContext.style.textIndent = "calc(-50 / 16 * 1em)";
                passageContext.style.paddingLeft = "calc(30 / 16 * 1em)";
                const submark = document.createElement('span');
                submark.textContent = '-';
                submark.className = 'submark_small';
                passageContext.prepend(submark);
                
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
        document.getElementById(`passage_${pagenum}`).appendChild(passageBox);

        const boxHeight = passageBox.offsetHeight;

            totalHeight += boxHeight; // 누적 높이 계산
            percentage = (totalHeight / height * 100).toFixed(2); // 비율 계산 (소수점 두 자리까지)

            

            

            if (percentage >= 80) {
                console.log(`누적 비율 ${percentage}%로 70%를 초과했습니다. 현재 passage: ${currentPassage}`);

                // 가장 최근에 추가된 passageBox를 삭제
                const lastPassageBox = document.getElementById(`passage_${pagenum}`).lastChild;
                if (lastPassageBox) {
                    lastPassageBox.remove();
                    console.log("가장 최근에 추가된 passageBox가 제거되었습니다.");
                }

                currentPassage --;
                checkman = 1;

            }

        // 이벤트 연결
        passageContext.querySelectorAll('.highlight-container').forEach(container => {
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