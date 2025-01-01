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
}

function blanking_small(){
    blankblock = document.createElement('div');
    blankblock.className = 'blank-block_small';
}

function Bolding(inputText) {
    const boldRegex = /\<\<(.*?)\>\>/g;
    const ExtraboldRegex = /\[\[(.*?)\]\]/g;

    // 먼저 <<내용>>을 처리
    let processedText = inputText.replace(boldRegex, (match, content) => {
        return `<span class="Bolding">${content}</span>`;
    });

    // 그 다음 [[내용]]을 처리
    processedText = processedText.replace(ExtraboldRegex, (match, content) => {
        return `<span class="ExtraBolding">${content}</span>`;
    });

    return processedText; // 최종 결과 반환
}


function undered(inputText) {
    const underRegex = /\<\_(.*?)\_\>/g;
    const circleRegex = /\<\((.*?)\)\>/g;

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
    const annotR = inputText.match(/^\s*##>(.*)/); // boldedLine에서 주석 처리
    const annotL = inputText.match(/^\s*<##(.*)/); // boldedLine에서 주석 처리
    let processedText = inputText



    if (annotR) {
        const annotedR = annotR[1].trim();
        const arrow = '<span class="arrow_small">→</span>';
        return `<div class="annot_box"><span class="annotR">${arrow}${annotedR}</span></div>`;
    } else if (annotL) {
        const annotedL = annotL[1].trim();
        const arrow = '<span class="arrow_small">→</span>';
        return `<div class="annot_box"><span class="annotL">${arrow}${annotedL}</span></div>`;
    }
    

    return processedText; // 최종 결과 반환
}

function Att(inputText) {
    return inputText.replace(/\*(att[UD])\*\(((?:[^()]|\([^()]*\))*)\)/g, (match, style, content) => {
        const [context, att] = content.split('_');
        const styleClass = style === "attU" ? "attU" : "attD";
        const passage_type = allPassages[currentPassage][0];

        if (passage_type == 'split'){
            blanking_small();
            document.getElementById(`page_${pagenum-1}`).appendChild(blankblock);
            blanking_small();
            document.getElementById(`page_${pagenum-1}`).appendChild(blankblock);
            
            return `<span class="attContainer_split">${context.trim()}
            <span class="${styleClass}_split">${att.trim()}</span>
            </span>`;    
        }else{
            return `<span class="attContainer">${context.trim()}
            <span class="${styleClass}">${att.trim()}</span>
            </span>`;
        }
    });
    return inputText; // 최종 결과 반환
}


function Pagemerging(){
    if (
        !allPassages[currentPassage + 1] || // 다음 인덱스가 존재하지 않거나
        allPassages[currentPassage + 1][0] === 'sub' // 값이 'split'인 경우
    ) {
        
        if (pagenum > 1){
            const mergingHeight = document.getElementById(`passage_${pagenum}`).offsetHeight + preHeight;
            const prepage = document.getElementById(`page_${pagenum-1}`);
            const nowpage = document.getElementById(`page_${pagenum}`);
            percentage = (mergingHeight / height * 100).toFixed(2); // 비율 계산 (소수점 두 자리까지)


            if (percentage <= 70 && prepage.dataset.sheet == nowpage.dataset.sheet) {
            document.getElementById(`page_${pagenum-1}`).querySelectorAll('.nextmark_box').forEach(child => child.remove());
            blanking();
            document.getElementById(`page_${pagenum-1}`).appendChild(blankblock);
            document.getElementById(`page_${pagenum-1}`).appendChild(document.getElementById(`passage_${pagenum}`));
            document.getElementById(`page_${pagenum}`).remove();
            document.getElementById(`passage_${pagenum-1}`).id = `passage_${pagenum-1.5}`;
            document.getElementById(`passage_${pagenum}`).id = `passage_${pagenum-1}`;

            console.log('합치기' + document.getElementById(`passage_${pagenum-1}`).innerHTML);
            pagenum--;
            
            
            totalHeight = mergingHeight
            preHeight = totalHeight
            }
        }
    }
}