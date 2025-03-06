function AnswerSheet() {
    console.log('답지를 출력합니다');

    // userAnswers를 순회하면서 각 문제의 container, 정답 등을 찾음
    Object.keys(userAnswers).forEach((key) => {
        const answerData = userAnswers[key];
        if (!answerData || typeof answerData.correctAnswer === 'undefined') {
            console.warn(`Invalid data for key: ${key}`, answerData);
            return;
        }

        // 정답 가져오기
        const { correctAnswer } = answerData;
        // HTML 컨테이너 가져오기
        const container = document.getElementById(key);
        if (!container) {
            console.warn(`Container not found for key: ${key}`);
            return;
        }

        document.querySelectorAll('.passageNotation').forEach(function(element) {
            element.style.display = 'inline-block';
        });
        
        // 문제 유형에 따라 처리
        if (container.dataset.type === 'a') {
            // (1) 단답형
            const userInput = container.querySelector('[data-type="userinput"]');
            if (userInput) {
                // userInput에 정답 채워 넣기
                userInput.value = String(correctAnswer).trim();
            }
        } else if (container.dataset.type === 'c') {
            // (1) 단답형
            const userInput = container.querySelector('[data-type="userinput"]');
            if (userInput) {
                // userInput에 정답 채워 넣기
                userInput.value = String(correctAnswer).trim();
            }

        } else if (container.dataset.type === 'b') {
            // (2) 단일 객관식
            const choiceOptions = container.querySelectorAll('.choice-option');

            // 1) 모든 선택 항목 초기화
            choiceOptions.forEach(opt => {
                opt.classList.remove('selected');
                opt.style.backgroundColor = '';
                opt.style.color = '';
            });

            // 2) data-correct="true"만 초록색 표시
            const correctElements = container.querySelectorAll('.choice-option[data-correct="true"]');
            correctElements.forEach(opt => {
                opt.style.backgroundColor = 'var(--green)';
                opt.style.color = 'white';
            });

            // 만약 정답 표시된 요소가 여러 개라면, 컨테이너 배경을 빨간색으로
            if (correctElements.length > 1) {
                container.style.backgroundColor = 'var(--red)';
            }
            // 4) 선택지 클릭 방지
            choiceOptions.forEach(opt => {
                opt.style.pointerEvents = 'none';
            });

        } else if (container.dataset.type === 'bb') {
            console.log('bb');
            // (3) 복수 정답 객관식
            const choiceOptions = container.querySelectorAll('.choice-options');

            // 1) 모든 선택 항목 초기화
            choiceOptions.forEach(opt => {
                opt.classList.remove('selected');
                opt.style.backgroundColor = '';
                opt.style.color = '';
            });

            // 2) data-correct="true"만 초록색 표시
            const correctElements = container.querySelectorAll('.choice-options[data-correct="true"]');
            correctElements.forEach(opt => {
                opt.style.backgroundColor = 'var(--green)';
                opt.style.color = 'white';
            });

            // 3) 선택지 클릭 방지
            choiceOptions.forEach(opt => {
                opt.style.pointerEvents = 'none';
            });
        }
    });

    console.log('답지 보기가 완료되었습니다.');
}
