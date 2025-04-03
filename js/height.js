function heightCalculator(pH){
    if(mobile == 0){
        const boxHeight = pH;
        totalHeight += boxHeight; // 누적 높이 계산
        percentage = (totalHeight / height * 100).toFixed(2); // 비율 계산 (소수점 두 자리까지)

        if (percentage >= 84) {
            // 가장 최근에 추가된 passageBox를 삭제
            const lastPassageBox = document.getElementById(`passage_${pagenum}`).lastChild;
            

            if (lastPassageBox) {
                const imgElements = lastPassageBox.querySelectorAll('img');
                const imgCount = imgElements.length;
                const questionElements = lastPassageBox.querySelectorAll('.question-number');
                const questionCount = questionElements.length;

                    currentImage -= imgCount;
                    globalQuestionCounter -= questionCount;

                lastPassageBox.remove();
            }

            currentPassage --;
            checkman = 1;

        }
    }
}