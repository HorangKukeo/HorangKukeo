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

//제출 버튼 클릭시 동작
function submitAnswers() {
    Object.keys(userAnswers).forEach((key) => {
        const answerData = userAnswers[key];

        if (!answerData || typeof answerData.correctAnswer === 'undefined') {
            return;
        }

        const { userAnswer, correctAnswer } = answerData;
        const isCorrect = userAnswer.trim() === correctAnswer.trim();
        const container = document.getElementById(key);
        if (!container) {
            return;
        }

        // 아이콘 생성 및 추가
        const resultIcon = isCorrect ? createGreenCircle() : createRedCheck();
        resultIcon.classList.add("result-icon");
        container.style.position = "relative";
        container.appendChild(resultIcon);

        // 정답 입력 불가 처리
        const removes = document.querySelectorAll('input');
        removes.forEach((element) => {
            element.disabled = true; // input box 입력 불가 처리
        });
        
        // 제출 버튼 삭제
        const submitButton = document.getElementById('submit-button');
        if (submitButton) {
            submitButton.remove();
        } else {
        }

        // 틀린 경우 정답 표시 (줄바꿈 포함)
        if (!isCorrect) {
            if (container.dataset.type === 'a') { // Type이 'a'인 경우
                const correctAnswerText = container.querySelectorAll('.hint-text');
                correctAnswerText.forEach(element => {
                    element.textContent = `${correctAnswer}`; // 각 요소의 텍스트를 업데이트
                    element.className = 'answer-text-wrong';
                });

            } else if (container.dataset.type === 'b') { // Type이 'b'인 경우
                const selectedOption = Array.from(container.querySelectorAll('.choice-option')).find(option =>
                    option.classList.contains('selected')
                );

                // 정답에 해당하는 .choice-option 찾기
                const correctOption = Array.from(container.querySelectorAll('.choice-option')).find(option =>
                    option.textContent.trim() === correctAnswer.trim()
                );

                if (correctOption) {
                    correctOption.style.backgroundColor = 'green'; // 정답 배경을 초록색으로 변경
                    correctOption.style.color = 'white'; // 텍스트를 흰색으로 변경 (가독성)
                }

                // 잘못 선택한 경우에만 빨간색으로 표시
                if (selectedOption && selectedOption.textContent.trim() !== correctAnswer.trim()) {
                    selectedOption.style.backgroundColor = 'red'; // 잘못 선택한 옵션 배경을 빨간색으로 변경
                    selectedOption.style.color = 'white'; // 텍스트를 흰색으로 변경 (가독성)
                }
                // 선택지 클릭 방지
                container.classList.add('wrong');
                const options = container.querySelectorAll('.choice-option');
                if (options.length > 0) {
                    options.forEach(option => {
                        option.classList.add('wrong');
                        option.style.pointerEvents = 'none';
                    });
                }
            }
            //정답시 추가 처리
        }else if(isCorrect){
            if (container.dataset.type === 'b') {
                container.classList.add('correct');
                const options = container.querySelectorAll('.choice-option');
                if (options.length > 0) {
                    options.forEach(option => {
                        option.classList.add('correct');
                        option.style.pointerEvents = 'none';
                    });
                }
            }
        }


    });




    // 점수 표시
    const score = Object.values(userAnswers)
        .filter(answerData => answerData && answerData.userAnswer && answerData.correctAnswer)
        .filter(({ userAnswer, correctAnswer }) => userAnswer.trim() === correctAnswer.trim()).length;

    const scoreDisplay = document.createElement('div');
    scoreDisplay.classList.add('score');
    scoreDisplay.textContent = `최종 점수: ${score} / ${Object.keys(userAnswers).length}`;
    document.body.appendChild(scoreDisplay);
}

function printPage() {
    window.print();
}