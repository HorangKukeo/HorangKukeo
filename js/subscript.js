function styled(line, bracket, bracketHtml) {
    // 기본 텍스트 처리
    let processing = Annot(line);
    processing = Align(processing);
    processing = undered(processing);
    processing = Bolding(processing);
    processing = Att(processing);
    processing = Arrowed(processing);
    processing = Mobiled(processing);
    
    // 결과 객체 초기화
    let result = {
        output: processing,
        bracket: bracket,
        bracketHtml: bracketHtml,
        skip: false
    };
    
    // bracket 처리 로직
    if (bracket == 'none') {
        if (/\/\[[^\]]\]\//.test(processing)) {
            const matches = Array.from(processing.matchAll(/\/\[[^\]]\]\//g));
            if (matches.length >= 2 && matches[0][0] === matches[matches.length - 1][0]) {
                // 한 라인에 시작과 끝 대괄호가 모두 있는 경우
                const bracketType = processing.match(/\[[^\]]\]/)?.[0];
                const content = processing.replace(/\/\[[^\]]\]\//g, '');
                
                result.output = `<div class="bracket">
                    <div class="bracket-label">${bracketType}</div>
                        <span class="bracket-single"></span>
                        <span class="bracket-blank"></span>
                        <div class="bracket-content" style="text-indent: calc(0 / 16 * var(--base))">
                            ${content}
                        </div>
                    </div>
                </div>`;
            } else {
                // 여는 대괄호만 발견된 경우
                result.bracket = processing.match(/\[[^\]]\]/)?.[0];
                result.bracketHtml = processing.replace(/\/\[[^\]]\]\//g, '') + '<br>';
                result.skip = true; // 이 라인은 출력하지 않음을 표시
            }
        }
    } else if (/\/\[[^\]]\]\//.test(processing) && bracket == processing.match(/\[[^\]]\]/)?.[0]) {
        // bracket 엔딩
        result.bracketHtml = bracketHtml + processing.replace(/\/\[[^\]]\]\//g, '');
        const indentSpan = `<span class="indent_${psgnum}"></span>`;
        result.bracketHtml = indentSpan + result.bracketHtml;
        result.bracketHtml = result.bracketHtml.replace(/<br\s*\/?>/gi, function(match, offset, string) {
            return (offset + match.length >= string.length) ? match : match + indentSpan;
        });
        
        result.output = `<div class="bracket">
            <div class="bracket-top"></div>
            <div class="bracket-label">${bracket}</div>
            <div class="bracket-bot"></div>
            <div class="bracket-content" style="text-indent: calc(0 / 16 * var(--base))">
                ${result.bracketHtml}
            </div>
        </div>`;
        
        result.bracket = 'none';
        result.bracketHtml = '';
    } else if (bracket != 'none') {
        // 대괄호 내부 컨텐츠 누적
        result.bracketHtml = bracketHtml + processing + '<br>';
        result.skip = true; // 이 라인은 출력하지 않음을 표시
    }
    
    return result;
}


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
    if (mobile == 1 && type == 'onebyone'){
        blankblock.style.display = 'none';
    }
}

function blanking_small(){
    blankblock = document.createElement('div');
    blankblock.className = 'blank-block_small';
    if (mobile == 1 && type == 'onebyone'){
        blankblock.style.display = 'none';
    }
}

function Bolding(inputText) {
    const boldRegex = /\{\{(.*?)\}\}/g;
    const ExtraboldRegex = /\[\[(.*?)\]\]/g;
    const BlockRegex = /\{\%}(.*?)\{\%}/g;
    const BlockSRegex = /\{\%s\}(.*?)\{\%s\}/g;
    const BlockMRegex = /\{\%m\}(.*?)\{\%m\}/g;
    const BlockCRegex = /\{\%c\}(.*?)\{\%c\}/g;


    // 먼저 {{내용}}을 처리
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

    processedText = processedText.replace(BlockSRegex, (match, content) => {
        // 매칭된 부분을 <span class="innerbox">로 감싸서 반환
        return `<span class="innerbox_small">${content}</span>`;
    });

    processedText = processedText.replace(BlockMRegex, (match, content) => {
        // 매칭된 부분을 <span class="innerbox">로 감싸서 반환
        return `<span class="innerbox_medium">${content}</span>`;
    });
    processedText = processedText.replace(BlockCRegex, (match, content) => {
        // 매칭된 부분을 <span class="innerbox">로 감싸서 반환
        return `<span class="innerbox_center">${content}</span>`;
    });

    return processedText; // 최종 결과 반환
}


function undered(inputText) {
    const underRegex = /\{\_(.*?)\_\}/g;
    const circleRegex = /\{\○(.*?)\○\}/g;
    const rectangleRegex = /\{\□(.*?)\□\}/g;
    const triRegex = /\{\△(.*?)\△\}/g;
    const highlightRegex = /\{\▷(.*?)\◁\}/g;
    const cancelRegex = /\{\!(.*?)\!\}/g;

    // 먼저 <<내용>>을 처리
    let processedText = inputText.replace(underRegex, (match, content) => {
        return `<span class="undered">${content}</span>`;
    });

    processedText = processedText.replace(circleRegex, (match, content) => {
        return `<span class="circled">${content}</span>`;
    });

    processedText = processedText.replace(rectangleRegex, (match, content) => {
        return `<span class="rectangled">${content}</span>`;
    });

    processedText = processedText.replace(triRegex, (match, content) => {
        return `<span class="triangled">${content}</span>`;
    });

    processedText = processedText.replace(highlightRegex, (match, content) => {
        return `<span class="highlighted">${content}</span>`;
    });

    processedText = processedText.replace(cancelRegex, (match, content) => {
        return `<span class="cancel">${content}</span>`;
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
    const newRegex = /\\(!?(?:U|UU|D|UR|UUR|UL|UUL|DR|DL|DDL|DDR))\\([^\\]+)\\/g;
    return inputText.replace(newRegex, (match, style, content) => {
        const [context, att] = content.split(';');
        let noline = 0; // line을 생성하지 않도록 컨트롤.
            // style이 '!'로 시작하는지 확인
            if (style.startsWith('!')) {
                noline = 1;
                // '!' 문자 제거
                style = style.substring(1);
            } else {
                noline = 0;
            }
        const styleClass = 'att' + style;
        const lined = style.includes('U') ? 'over' : (style.includes('D') ? 'under' : '');
        const passage_type = allPassages[currentPassage][0];
        

        const borderStyle = noline === 1
            ? 'border: none;'
            : (lined === 'over'
            ? 'border-top: calc(2 / 16 * var(--base)) solid var(--blue); margin-top: calc(-2 / 16 * var(--base));'
            : 'border-bottom: calc(2 / 16 * var(--base)) solid var(--blue); margin-bottom: calc(-2 / 16 * var(--base));');

        let att_rev = att.trim().replace(/(\s+)(<span[^>]*>)/g, (match, spaces, spanTag) => {
            // 공백을 thin space로 대체
            return '\u2009' + spanTag;
        });
        
        // </span> 태그 뒤의 공백 처리
        att_rev = att_rev.trim().replace(/(<\/span>)(\s+)/g, (match, spanEndTag, spaces) => {
            // 공백을 thin space로 대체
            return spanEndTag + '\u2009';
        });

        let context_rev = context.trim().replace(/(\s+)(<span[^>]*>)/g, (match, spaces, spanTag) => {
            // 공백을 thin space로 대체
            return '\u2009' + spanTag;
        });
        
        // </span> 태그 뒤의 공백 처리
        context_rev = context_rev.trim().replace(/(<\/span>)(\s+)/g, (match, spanEndTag, spaces) => {
            // 공백을 thin space로 대체
            return spanEndTag + '\u2009';
        });
        
        if (passage_type == 'sub'){
            blanking_small();
            document.getElementById(`page_${pagenum-1}`).appendChild(blankblock);
            blanking_small();
            document.getElementById(`page_${pagenum-1}`).appendChild(blankblock);
            
            return `<span class="attContainer_sub">${context_rev}
            <span class="${styleClass}_sub">${att_rev}</span>
            </span>`;    
        }else{
            return `<span class="attContainer" style="${borderStyle}">${context_rev}
            <span class="${styleClass}">${att_rev}</span>
            </span>`;
        }
    });
    return inputText; // 최종 결과 반환
}


function Mobiled(inputText){
        // 정규식 패턴: 〔로 시작하고 〕로 끝나는 패턴 찾기
        const pattern = /〔([^〔〕]+)〕/g;
        const pattern2 = /【([^【】]+)】/g;

            // 조건에 따라 패턴 처리
            if (mobile === 0) {
                // 데스크톱: 패턴을 빈 문자열로 대체(삭제)
                inputText = inputText.replace(pattern, '');
                inputText = inputText.replace(pattern2, '$1');
            } else {
                // 모바일: 패턴에서 〔〕 기호를 제거하고 내용만 유지
                inputText = inputText.replace(pattern, '$1');
                inputText = inputText.replace(pattern2, '');
            }
        return inputText
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