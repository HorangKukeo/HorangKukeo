function AnswerSheet() {
    Object.keys(userAnswers).forEach((key) => {
        const answerData = userAnswers[key];

        if (!answerData || typeof answerData.correctAnswer === 'undefined') {
            console.warn(`Invalid data for key: ${key}`, answerData);
            return;
        }

        const { userAnswer, correctAnswer } = answerData;
        const isCorrect = userAnswer.trim() === correctAnswer.trim();
        const container = document.getElementById(key);
        if (!container) {
            console.warn(`Container not found for key: ${key}`);
            return;
        }


        // 정답 입력 불가 처리
        const removes = document.querySelectorAll('input, .hint-text');
        removes.forEach((element) => {
            element.remove(); // 각 요소를 삭제
        });
        
            // 제출 버튼 삭제
            // 제출 버튼 삭제
            const submitButton = document.getElementById('answer-button');
            if (submitButton) {
                console.log('버튼이 존재합니다. 제거합니다.');
                submitButton.remove();
            } else {
                console.log('submit-button이 존재하지 않습니다.');
            }
    

        // 틀린 경우 정답 표시 (줄바꿈 포함)
        if (!isCorrect) {
            if (container.dataset.type === 'a') { // Type이 'a'인 경우
                const correctAnswerText = document.createElement('div'); // 줄바꿈을 위해 div 사용
                correctAnswerText.classList.add('correct-answer');
                correctAnswerText.textContent = `${correctAnswer}`;
                container.appendChild(correctAnswerText);
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
            }
        }

        // 선택지 클릭 방지
        const options = container.querySelectorAll('.choice-option');
        if (options.length > 0) {
            options.forEach(option => {
                option.classList.add('disabled');
                option.style.pointerEvents = 'none';
            });
        }
    });

    const elements = document.querySelectorAll('.multiple-select');
    
    // 각 요소의 색상을 변경
    elements.forEach(element => {
        element.classList.remove('multiple-select'); // 기존 클래스 제거
        element.classList.add('multiple-select_answer'); // 새로운 클래스 추가
    });

}