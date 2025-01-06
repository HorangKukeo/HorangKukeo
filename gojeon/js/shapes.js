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
