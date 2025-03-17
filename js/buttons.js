let test = 0;

function normalizeAnswer(answer) {
    // 1. 무시할 문자들 제거 (공백, 쉼표, 마침표, 작은따옴표, 큰따옴표, 하이픈)
    let normalized = answer.replace(/[\s,.'":\\-]/g, '');
    
    // 2. 원문자와 일반 숫자 정규화
    // 원문자 ①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳ → 일반 숫자 1-20으로 변환
    const circledNumbers = {
        '①': '1', '②': '2', '③': '3', '④': '4', '⑤': '5',
        '⑥': '6', '⑦': '7', '⑧': '8', '⑨': '9', '⑩': '10',
        '⑪': '11', '⑫': '12', '⑬': '13', '⑭': '14', '⑮': '15',
        '⑯': '16', '⑰': '17', '⑱': '18', '⑲': '19', '⑳': '20'
    };
    
    for (const [circled, normal] of Object.entries(circledNumbers)) {
        normalized = normalized.replace(new RegExp(circled, 'g'), normal);
    }
    
    // 3. 자음 조합 정규화 - 분리된 자음을 결합된 형태와 동일하게 처리
    const jamoMappings = {
        'ㄹㄱ': 'ㄺ',
        'ㄱㅅ': 'ㄳ',
        'ㄴㅈ': 'ㄵ',
        'ㄴㅎ': 'ㄶ',
        'ㄹㅁ': 'ㄻ',
        'ㄹㅂ': 'ㄼ',
        'ㄹㅅ': 'ㄽ',
        'ㄹㅌ': 'ㄾ',
        'ㄹㅍ': 'ㄿ',
        'ㄹㅎ': 'ㅀ',
        'ㅂㅅ': 'ㅄ'
    };
    
    for (const [separated, combined] of Object.entries(jamoMappings)) {
        normalized = normalized.replace(new RegExp(separated, 'g'), combined);
    }
    
    return normalized;
}

// 제출 버튼 클릭 시 동작
function submitAnswers() {
    Object.keys(userAnswers).forEach((key) => {
        const answerData = userAnswers[key];
        
        // answerData가 없거나, correctAnswer 속성이 없으면 채점할 수 없으므로 return
        if (!answerData || typeof answerData.correctAnswer === 'undefined') {
            return;
        }

        const { userAnswer, correctAnswer } = answerData;

        // HTML 컨테이너 가져오기
        const container = document.getElementById(key);
        if (!container) {
            return;
        }

        document.querySelectorAll('.passageNotation').forEach(function(element) {
            element.style.display = 'inline-block';
        });

        if(mobile == 1 && type == 'onebyone'){
            document.getElementById(`psgbox_${nowQ}`).style.display = 'none';
            document.getElementById(`psgbox_${nowP}`).style.display = 'none';
            document.getElementById(`psgbox_${firstP}`).style.display = 'block';
            document.getElementById(`psgbox_${firstcheck}`).style.display = 'block';
            nowQ = firstcheck;
            nowP = firstP;
            const submitButton = document.getElementById('submitq');
            if (submitButton) {
                submitButton.remove();
            }
        }

        // ---- 1) 정답 비교 (단일 vs. 복수 구분 없이 배열 형태로 통일) ----
        let userAnswerArray = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
        let correctAnswerArray = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];
        
        // 정규화된 배열 생성
        userAnswerArray = userAnswerArray.map(ans => normalizeAnswer(ans)).sort();
        correctAnswerArray = correctAnswerArray.map(ans => normalizeAnswer(ans)).sort();

        // 배열끼리 JSON 문자열로 비교 → 완전히 동일하면 정답
        let isCorrect = JSON.stringify(userAnswerArray) == JSON.stringify(correctAnswerArray);

        // ---- 2) 아이콘(○ / ×) 생성 및 추가: 정답(O) or 오답(X) ----
        const resultIcon = isCorrect ? createGreenCircle() : createRedCheck();
        resultIcon.classList.add("result-icon");
        container.style.position = "relative";
        container.appendChild(resultIcon);

        // ---- 3) 모든 input을 입력 불가 처리 (추가 입력 막기) ----
        const removes = document.querySelectorAll('input');
        removes.forEach((element) => {
            element.disabled = true;
        });
        
        // ---- 4) 제출 버튼 삭제 ----
        const submitButton = document.getElementById('submit-button');
        if (submitButton) {
            submitButton.remove();
        }
        const submitQ = document.getElementById('submitq');
        if (submitQ) {
            submitQ.remove();
        }

        // ---- 5) 정답/오답 시 시각 피드백 ----
        if (!isCorrect) {
            // ============= 오답 처리 =============
            if (container.dataset.type === 'a') {
                // (예) 단답형 문제: 정답 텍스트를 직접 표시
                const correctAnswerText = container.querySelectorAll('.hint-text');
                correctAnswerText.forEach(element => {
                    container.style.backgroundColor = 'var(--redt)';
                    element.textContent = correctAnswerArray.join(', ');
                    element.className = 'answer-text-wrong';
                });
            } else if (container.dataset.type === 'c') {
                // (예) 단답형 문제: 정답 텍스트를 직접 표시
                const correctAnswerText = container.querySelectorAll('.hint-text');
                correctAnswerText.forEach(element => {
                    container.style.backgroundColor = 'var(--redt)';
                    element.style.display = 'block';
                    element.className = 'answer-text-wrong';
                });
            } else if (container.dataset.type === 'b') {
                // (예) 단일 정답 객관식 문제
                const choiceOptions = Array.from(container.querySelectorAll('.choice-option'));
                const selectedOption = choiceOptions.find(opt => opt.classList.contains('selected'));
                const correctOption = choiceOptions.find(opt => 
                    correctAnswerArray.includes(opt.textContent.trim())
                );
                if (correctOption) {
                    correctOption.style.backgroundColor = 'green';
                    correctOption.style.color = 'white';
                }
                if (selectedOption && !correctAnswerArray.includes(selectedOption.textContent.trim())) {
                    selectedOption.style.backgroundColor = 'red';
                    selectedOption.style.color = 'white';
                }
                container.classList.add('wrong');
                choiceOptions.forEach(option => {
                    option.style.pointerEvents = 'none';
                });
            } else if (container.dataset.type === 'bb') {
                // (예) 복수 정답 객관식 문제
                const choiceOptions = Array.from(container.querySelectorAll('.choice-option'));
                const selectedOptions = choiceOptions.filter(opt => opt.classList.contains('selected'));
                const correctOptions = choiceOptions.filter(opt => {
                    const text = opt.textContent.trim();
                    return correctAnswerArray.includes(text);
                });
                correctOptions.forEach(opt => {
                    opt.style.backgroundColor = 'green';
                    opt.style.color = 'white';
                });
                selectedOptions.forEach(opt => {
                    const text = opt.textContent.trim();
                    if (!correctAnswerArray.includes(text)) {
                        opt.style.backgroundColor = 'red';
                        opt.style.color = 'white';
                    }
                });
                container.classList.add('wrong');
                choiceOptions.forEach(option => {
                    option.style.pointerEvents = 'none';
                });
            }

        } else {
            // ============= 정답 처리 =============
            if (container.dataset.type === 'a') {
                const correctAnswerText = container.querySelectorAll('.hint-text');
                correctAnswerText.forEach(element => {
                    container.style.backgroundColor = 'var(--greent)';
                    element.style.backgroundColor = 'var(--greent)';
                });
            } else if (container.dataset.type === 'c') {
                const correctAnswerText = container.querySelectorAll('.hint-text');
                correctAnswerText.forEach(element => {
                    container.style.backgroundColor = 'var(--greent)';
                    element.style.backgroundColor = 'var(--greent)';
                });
            } else if (container.dataset.type === 'b') {
                container.classList.add('correct');
                const options = container.querySelectorAll('.choice-option');
                options.forEach(option => {
                    option.classList.add('correct');
                    option.style.pointerEvents = 'none';
                });
            } else if (container.dataset.type === 'bb') {
                container.classList.add('correct');
                const options = container.querySelectorAll('.choice-option');
                options.forEach(option => {
                    option.classList.add('correct');
                    option.style.pointerEvents = 'none';
                });
            }
        }
    });

    // ---- 6) 최종 점수 계산 ----
    const score = Object.values(userAnswers)
    .filter(answerData => answerData && (answerData.userAnswer !== undefined) && (answerData.correctAnswer !== undefined))
    // 점수 계산 부분 수정
    .map(({ userAnswer, correctAnswer }) => {
        let userArr = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
        let correctArr = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];
        
        // 수정된 부분: normalizeAnswer 함수 적용
        userArr = userArr.map(x => normalizeAnswer(x || '')).sort();
        correctArr = correctArr.map(x => normalizeAnswer(x || '')).sort();
        
        return JSON.stringify(userArr) === JSON.stringify(correctArr);
    })
    .reduce((acc, curr) => acc + (curr ? 1 : 0), 0);


    // ---- 7) 최종 점수 표시 ----
    const scoreDisplay = document.createElement('div');
    scoreDisplay.classList.add('score');
    scoreDisplay.textContent = `점수 : ${score} / ${Object.keys(userAnswers).length}`;
    document.body.appendChild(scoreDisplay);

    // ---- 8) make.com에 데이터 전송 ----
    const makeWebhookUrl = "https://hook.us2.make.com/soggglgczejg0jipiq2usaodkomro9cx"; // 여러분의 make.com webhook URL로 교체
    const payload = {
        school : schoolname,
        name: studentname,
        mission: sheetName,
        score: score,
        total: Object.keys(userAnswers).length,
        timestamp: new Date().toISOString()
        // 필요에 따라 추가 데이터를 넣을 수 있습니다.
    };
    
    fetch(makeWebhookUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
        console.log("Make.com 전송 성공:", data);
    })
    .catch(error => {
        console.error("Make.com 전송 오류:", error);
    });
}


function createGreenCircle() {
    const Color = getComputedStyle(document.documentElement).getPropertyValue('--greentt').trim();
    const vbase = getComputedStyle(document.documentElement).getPropertyValue('--base').trim();
    const v = parseFloat(vbase)
    const size = (12 / 16)*v;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", "0%");
    circle.setAttribute("cy", "-28%");
    circle.setAttribute("r", `${size}px`);
    circle.setAttribute("stroke", Color);
    circle.setAttribute("stroke-width", "2");
    circle.setAttribute("fill", "none");
    svg.appendChild(circle);
    return svg;
}

function createRedCheck() {
    const Color = getComputedStyle(document.documentElement).getPropertyValue('--redtt').trim();
    const vbase = getComputedStyle(document.documentElement).getPropertyValue('--base').trim();
    const v = parseFloat(vbase)
    const size = (20 / 16)*v;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

    
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", "0%");
    text.setAttribute("y", "-40%");
    text.setAttribute("fill", Color);
    text.setAttribute("font-size", `${size}px`);
    text.setAttribute("font-weight", "bold");
    text.setAttribute("text-anchor", "middle");        // 수평 가운데 정렬
    text.setAttribute("dominant-baseline", "middle");  // 수직 가운데 정렬
    text.textContent = "V";  // 또는 "∨" 또는 "v"
    
    svg.appendChild(text);
    return svg;
}

function printPage() {
    window.print();
}