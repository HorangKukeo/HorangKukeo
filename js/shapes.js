function createTableWithHTML(passageText) {
    const rows = passageText.split('<br>'); // 줄바꿈으로 행 분리
    const tableContainer = document.createElement('div'); // 전체 테이블 컨테이너
    let rowCount = 0;

    rows.forEach((rowText, index) => {
        const table = document.createElement('table');

        // 테이블의 위치에 따라 클래스를 적용
        if (index === 0) {
            table.classList.add('q_table_top'); // 첫 번째 테이블
        } else if (index === rows.length - 1) {
            table.classList.add('q_table_bot'); // 마지막 테이블
        } else {
            table.classList.add('q_table_mid'); // 중간 테이블
        }
        rowCount = index + 1;

        const tr = document.createElement('tr');
        const cols = rowText.split('///'); // "///"로 열 분리

        cols.forEach(colText => {
            const td = document.createElement('td');
            td.classList.add('td')
            td.style.width = `${100 / cols.length}%`; // 열 너비 계산

            // HTML 태그가 포함된 경우에도 제대로 렌더링
            td.innerHTML = colText.trim();

            tr.appendChild(td);
        });

        table.appendChild(tr); // 행 추가
        tableContainer.appendChild(table); // 테이블 컨테이너에 추가
    });

    return tableContainer.outerHTML; // 컨테이너 반환
}



// double 프레임 생성 함수 (예: allPassages[currentPassage][0] == 'double' 일 때 호출)
function createDoubleFrame(doublenum) {
    // 전체 double 컨테이너 생성
    const doubleFrame = document.createElement('div');
    doubleFrame.id = `double_${doublenum}`;
    // 전체 컨테이너 스타일: 너비 95%, 좌우를 나란히 배치 (flex)
    doubleFrame.style.width = '100%';
    doubleFrame.style.display = 'flex';
    doubleFrame.style.justifyContent = 'space-between';
    doubleFrame.style.border = 'none';
    doubleFrame.style.backgroundColor = 'transparent';
    
    // 좌측 박스 생성
    const leftBox = document.createElement('div');
    leftBox.id = `double_${doublenum}_L`;
    leftBox.style.width = '50%';
    leftBox.style.border = 'none';
    leftBox.style.backgroundColor = 'transparent';
    
    // 우측 박스 생성
    const rightBox = document.createElement('div');
    rightBox.id = `double_${doublenum}_R`;
    rightBox.style.width = '50%';
    rightBox.style.border = 'none';
    rightBox.style.backgroundColor = 'transparent';
    
    // 좌측과 우측 박스를 doubleFrame에 추가
    doubleFrame.appendChild(leftBox);
    doubleFrame.appendChild(rightBox);
    console.log(doublenum);
    return doubleFrame;
  }
  