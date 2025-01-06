async function bankload(excel, sheet) {
    const bankresponse = await fetch(`bank/${excel}.xlsm`);
    const bankdata = await bankresponse.arrayBuffer();
    const targetExcel = XLSX.read(bankdata, { type: 'array' });
    const targetSheet = targetExcel.Sheets[sheet];
    const targetRows = XLSX.utils.sheet_to_json(targetSheet, { header: 1 });

    targetRows.forEach(row => {
        // 두 번째 열이 비어 있고 행의 길이가 2 이상인 경우
        if (row[0] && (!row[1] || row[1].trim() === '')) {
            row[1] = 'blank'; // 두 번째 열에 "blank" 추가
        }
    });

    return targetRows;
}