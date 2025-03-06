function nextmark(){
    const nextmark_box = document.createElement('div');
    nextmark_box.classList.add('nextmark_box');
    document.getElementById(`page_${pagenum}`).appendChild(nextmark_box);
    
    const nextmark = document.createElement('div');
    nextmark.classList.add('nextmark');
    nextmark.textContent = '다음 페이지 ▶';
    nextmark_box.appendChild(nextmark);
}

function blanking(){
    blankblock = document.createElement('div');
    blankblock.className = 'blank-block';
    if (mobile == 1){
        blankblock.style.display = 'none';
    }
}

function blanking_small(){
    blankblock = document.createElement('div');
    blankblock.className = 'blank-block_small';
    if (mobile == 1){
        blankblock.style.display = 'none';
    }
}

function Bolding(inputText) {
    const boldRegex = /\{\{(.*?)\}\}/g;
    const ExtraboldRegex = /\[\[(.*?)\]\]/g;
    const BlockRegex = /\{\%}(.*?)\{\%}/g;
    const BlockSRegex = /\{\%s\}(.*?)\{\%s\}/g;
    const BlockMRegex = /\{\%m\}(.*?)\{\%m\}/g;


    // 먼저 <<내용>>을 처리
    let processedText = inputText.replace(boldRegex, (match, content) => {
        return `<span class="Bolding">${content}</span>`;
    });

    // 그 다음 [[내용]]을 처리
    processedText = processedText.replace(ExtraboldRegex, (match, content) => {
        return `<span class="ExtraBolding">${content}</span>`;
    });

    processedText = processedText.replace(BlockRegex, (match, content) => {
        // 매칭된 부분을 <span class="innerbox">로 감싸서 반환
        return `<span class="innerbox">${content}</span>`;
    });

    processedText = processedText.replace(BlockMRegex, (match, content) => {
        // 매칭된 부분을 <span class="innerbox">로 감싸서 반환
        return `<span class="innerbox_medium">${content}</span>`;
    });

    return processedText; // 최종 결과 반환
}


function undered(inputText) {
    const underRegex = /\{\_(.*?)\_\}/g;
    const circleRegex = /\{\[(.*?)\]\}/g;

    // 먼저 <<내용>>을 처리
    let processedText = inputText.replace(underRegex, (match, content) => {
        return `<span class="undered">${content}</span>`;
    });

    processedText = processedText.replace(circleRegex, (match, content) => {
        return `<span class="circled">${content}</span>`;
    });
    
    return processedText; // 최종 결과 반환
}




function Annot(inputText) {
    const annotR = inputText.match(/^\s*##}(.*)/); // boldedLine에서 주석 처리
    const annotL = inputText.match(/^\s*{##(.*)/); // boldedLine에서 주석 처리
    const annotB = inputText.match(/^\s*###(.*)/); // boldedLine에서 주석 처리
    let processedText = inputText

    if (annotR) {
        const annotedR = annotR[1].trim();
        const arrow = '<span class="arrow_small">→</span>';
        return `<div class="annot_box"><span class="annotR">${arrow}${annotedR}</span></div>`;
    } else if (annotL) {
        const annotedL = annotL[1].trim();
        const arrow = '<span class="arrow_small">→</span>';
        return `<div class="annot_box"><span class="annotL">${arrow}${annotedL}</span></div>`;
    } else if (annotB) {
        const annotedB = annotB[1].trim();
        return `<div class="annot_box"><span class="annotB">${annotedB}</span></div>`;
    }

    return processedText; // 최종 결과 반환
}

function Align(inputText) {
    // 정규식: 줄 맨 앞에 '$C$'로 시작하는 경우
    const match = inputText.match(/^\s*\$(.+?)\$(.*)/);

    // 초기 값은 원본 텍스트 그대로 반환
    let processedText = inputText;

    if (match) {
            if (match[1].trim() === 'C') {
                const proContent = match[2].trim();
                processedText = `<div class="center-cont">${proContent}</div>`;
            } else if (match[1].trim() === 'CT') {
                const proContent = match[2].trim();
                processedText = `<div class="center-title-cont">${proContent}</div>`;
            } else if (match[1].trim() === 'L') {
                const proContent = match[2].trim();
                processedText = `<div class="left-cont">${proContent}</div>`;
            } else if (match[1].trim() === 'TT') {
                const proContent = match[2].trim();
                processedText = `<div class="title-cont">${proContent}</div>`;
            } else {
                // '$' 사이의 값이 다른 경우 다른 동작 수행
                console.log(`Unknown type: ${match[1]}`);
            }
    }

    return processedText; // 최종 결과 반환
}



function Att(inputText) {
    const newRegex = /\\(U|D|UR|UUR|UL|DR|DL|DDL)\\([^\\]+)\\/g;
    return inputText.replace(newRegex, (match, style, content) => {
        const [context, att] = content.split(';');
        /*const styleClass = style === "attU" ? "attU" : "attD";*/
        const styleClass = 'att' + style;
        const lined = style.includes('U') ? 'over' : (style.includes('D') ? 'under' : '');
        const passage_type = allPassages[currentPassage][0];

        const borderStyle = lined === 'over'
        ? 'border-top: calc(2 / 16 * var(--base)) solid var(--blue); margin-top: calc(-2 / 16 * var(--base));'
        : 'border-bottom: calc(2 / 16 * var(--base)) solid var(--blue); margin-bottom: calc(-2 / 16 * var(--base));';
      

        if (passage_type == 'sub'){
            blanking_small();
            document.getElementById(`page_${pagenum-1}`).appendChild(blankblock);
            blanking_small();
            document.getElementById(`page_${pagenum-1}`).appendChild(blankblock);
            
            return `<span class="attContainer_sub">${context.trim()}
            <span class="${styleClass}_sub">${att.trim()}</span>
            </span>`;    
        }else{
            return `<span class="attContainer" style="${borderStyle}">${context.trim()}
            <span class="${styleClass}">${att.trim()}</span>
            </span>`;
        }
    });
    return inputText; // 최종 결과 반환
}


function Pagemerging(){
    if (
        !allPassages[currentPassage + 1] || // 다음 인덱스가 존재하지 않거나
        allPassages[currentPassage + 1][0] === 'sub' // 값이 'sub'인 경우
    ) {
        if (pagenum > 1){
            /*const mergingHeight = document.getElementById(`passage_${pagenum}`).offsetHeight + preHeight;*/
            const mergingHeight = totalHeight + preHeight;
            const prepage = document.getElementById(`page_${pagenum-1}`);
            const nowpage = document.getElementById(`page_${pagenum}`);
            percentage = (mergingHeight / height * 100).toFixed(2); // 비율 계산 (소수점 두 자리까지)

            if (percentage <= 80 && prepage.dataset.sheet == nowpage.dataset.sheet) {
                console.log(percentage);
                console.log(allPassages);
                console.log(allPassages[currentPassage][1]);
                console.log('pageMerging');
                document.getElementById(`page_${pagenum-1}`).querySelectorAll('.nextmark_box').forEach(child => child.remove());
                blanking();
                document.getElementById(`page_${pagenum-1}`).appendChild(blankblock);
                document.getElementById(`page_${pagenum-1}`).appendChild(document.getElementById(`passage_${pagenum}`));
                document.getElementById(`page_${pagenum}`).remove();
                document.getElementById(`passage_${pagenum-1}`).id = `passage_${pagenum-1.5}`;
                document.getElementById(`passage_${pagenum}`).id = `passage_${pagenum-1}`;
                pagenum--;
                
                ENum = passageENum;
                EMum = passageEMum;
                
                totalHeight = mergingHeight
                preHeight = totalHeight

            }
        }
    }
}