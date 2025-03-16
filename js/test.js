function tablemaker(passage) {
    const lines = passage.split('\n'); // 텍스트를 줄 단위로 분리
    const table = document.createElement('table'); // 테이블 생성


    // 이전 행의 셀 정보를 저장 (rowspan 적용용)
    const prevRowCells = [];

    lines.forEach((line, rowIndex) => {
        const row = document.createElement('tr'); // 테이블 행 생성
        const cells = line.match(/\[(.*?)\]/g);

        if (cells) {
            cells.forEach((cellContent, cellIndex) => {
                const content = cellContent.slice(1, -1); // {} 제거
                let cell;
                

                // 가로 병합(<++) 처리
                if (content === '<++') {
                    const prevCell = row.lastChild;
                    if (prevCell) {
                        prevCell.colSpan = (prevCell.colSpan || 1) + 1;
                    }
                }
                // 세로 병합(u++) 처리
                else if (content === 'u++') {
                    // 이전 행의 셀에 rowspan 증가
                    const prevCell = prevRowCells[cellIndex];
                    if (prevCell) {
                        prevCell.rowSpan = (prevCell.rowSpan || 1) + 1;
                    }
                }
                // 줄바꿈 처리(//) + 정렬 + 대각선
                else if (content.includes('//')) {
                    cell = document.createElement('td');
                    const [line1, line2] = content.split('//');

                    let hbase = 60;
                    if (/\*.\*/.test(line1.trim())) {
                        hbase += 25; // hbase 값을 25 증가
                    }
                    if (/\*.\*/.test(line2.trim())) {
                        hbase += 25; // hbase 값을 25 증가
                    }
                    
                    
                    // 대각선과 텍스트를 포함한 스타일 적용
                    cell.innerHTML = `<div style="
                    position: relative;
                    width: 101%;
                    height: calc(${hbase}/16 * var(--base));
                    text-align: center;
                 ">
                    <svg style="
                        position: absolute;
                        width: 100%;
                        height: 102%;
                        left: calc(0.5/16 * var(--base));
                        top: calc(-2/16 * var(--base));
                        z-index: -1;
                        
                    ">
                        <line x1="-2%" 
                              y1="-2%" 
                              x2="100%" 
                              y2="103%" 
                              stroke="rgb(0, 0, 0)"
                              stroke-width="calc(1 / 16 * var(--base))"
                              vector-effect="non-scaling-stroke"/>
                    </svg>
                    <span style="
                        position: absolute;
                        top: 2px;
                        right: 4px;
                        text-align: right;
                        padding: 2px;
                    ">${line1.trim()}</span>
                    <span style="
                        position: absolute;
                        bottom: 2px;
                        left: 4px;
                        text-align: left;
                        padding: 2px;
                    ">${line2.trim()}</span>
                </div>`;
                }
                // 일반 셀
                else {
                    cell = document.createElement('td');
                    cell.innerHTML = content; // textContent에서 innerHTML로 변경
                    /*cell.textContent = content;*/
                    // 이전 행 정보에 추가 (rowspan 처리용)
                    prevRowCells[cellIndex] = cell;
                }

                if (cell) {
                    // 셀 스타일
                    cell.classList.add('cells');
                    row.classList.add('rows');
                    row.appendChild(cell);
                }
            });
        }

        table.appendChild(row);
    });

    return table;
}
