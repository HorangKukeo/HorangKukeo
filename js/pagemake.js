let doubled = 0;
let doublenum = 0;
let double_fix = 'false';
let ENum_doubled = 'single';
let ENum_doublenum = 0;

function createPageElements() {
    
        pagenum++; // 새로운 페이지로 이동
        // 1. 페이지 컨테이너 생성 및 DOM에 추가
        const page = document.createElement('div');
        page.className = 'page';
        page.id = `page_${pagenum}`;
        page.dataset.sheet = nowSetting + 1;
        document.body.appendChild(page); // DOM에 추가!

        // 1-2. 높이 얻기
        height = page.offsetHeight;

        // 2. 헤더 컨테이너 생성
        const headerContainer = document.createElement('div');
        headerContainer.className = 'header-container';
        headerContainer.id = 'headerdeck';

        // 2.1 헤더 상단 라인 생성
        const headerTopLine = document.createElement('div');
        headerTopLine.className = 'header-top-line';

        // 2.2 헤더 양쪽 수직 라인 생성
        const headerVerticalLineLeft = document.createElement('div');
        headerVerticalLineLeft.className = 'header-vertical-line left';
        const headerVerticalLineRight = document.createElement('div');
        headerVerticalLineRight.className = 'header-vertical-line right';

        // 2.3 헤더 텍스트 컨텐츠 생성
        const headerContent = document.createElement('div');
        headerContent.className = 'header-content';

        const headerText1 = document.createElement('div');
        headerText1.className = 'header-text';
        headerText1.textContent = head1;

        const headerText2 = document.createElement('div');
        headerText2.className = 'header-text';
        headerText2.textContent = head2;

        // 헤더 컨텐츠에 텍스트 추가
        headerContent.appendChild(headerText1);
        headerContent.appendChild(headerText2);

        // 헤더 컨테이너에 모든 요소 추가
        headerContainer.appendChild(headerTopLine);
        headerContainer.appendChild(headerVerticalLineLeft);
        headerContainer.appendChild(headerVerticalLineRight);
        headerContainer.appendChild(headerContent);

            // 3. 제목 프레임 생성
            const titleFrame = document.createElement('div');
        if (headOX == 0){
            titleFrame.className = 'title-frame';
            // 3.1 왼쪽 블록 (로고)
            const leftBlock = document.createElement('div');
            leftBlock.className = 'left-block';
            const logoImg = document.createElement('img');
            logoImg.src = logo; // 로고 이미지 경로 설정!
            logoImg.alt = '외솔교육 로고';
            leftBlock.appendChild(logoImg);

            // 3.2 중앙 블록 (제목)
            const centerBlock = document.createElement('div');
            centerBlock.className = 'center-block';
            const smallTitle = document.createElement('div');
            smallTitle.className = 'small-title';
            smallTitle.textContent = sheetTitle_sub;
            const bigTitle = document.createElement('div');
            bigTitle.className = 'big-title';
            bigTitle.textContent = sheetTitle;
            centerBlock.appendChild(smallTitle);
            centerBlock.appendChild(bigTitle);

            // 3.3 오른쪽 블록 (이름, 학습일 입력)
            const rightBlock = document.createElement('div');
            rightBlock.className = 'right-block';

            const row1 = document.createElement('div');
            row1.className = 'row';
            const right1 = document.createElement('div');
            right1.className = 'right-1';
            right1.textContent = R1;
            const whiteLineV1 = document.createElement('div');
            whiteLineV1.className = 'white-line-V';
            const right2 = document.createElement('div');
            right2.className = 'right-2';
            const input1 = document.createElement('input');
            input1.type = 'text';
            input1.className = 'inputbox';
            right2.appendChild(input1);
            row1.appendChild(right1);
            row1.appendChild(whiteLineV1);
            row1.appendChild(right2);

            const whiteLineH = document.createElement('div');
            whiteLineH.className = 'white-line-H';

            const row2 = document.createElement('div');
            row2.className = 'row';
            const right3 = document.createElement('div');
            right3.className = 'right-3';
            right3.textContent = R2;
            const whiteLineV2 = document.createElement('div');
            whiteLineV2.className = 'white-line-V';
            const right4 = document.createElement('div');
            right4.className = 'right-4';
            const input2 = document.createElement('input');
            input2.type = 'text';
            input2.className = 'inputbox';
            right4.appendChild(input2);
            row2.appendChild(right3);
            row2.appendChild(whiteLineV2);
            row2.appendChild(right4);

            rightBlock.appendChild(row1);
            rightBlock.appendChild(whiteLineH);
            rightBlock.appendChild(row2);

            // 제목 프레임에 모든 블록 추가
            titleFrame.appendChild(leftBlock);
            titleFrame.appendChild(centerBlock);
            titleFrame.appendChild(rightBlock);
            headOX = 1;
            titleFrameAdjust = 50;

        } else{
            titleFrame.className = '';
            blanking();
            titleFrame.appendChild(blankblock);
            titleFrameAdjust = 0;
        };

        // ***중요***: page에 headerContainer와 titleFrame을 먼저 추가해야 함!
        page.appendChild(headerContainer);
        page.appendChild(titleFrame);
        
        if(mobile == 1){
        titleFrame.style.display = 'none';
        headerContainer.style.marginBottom = 'calc(15 / 16 * var(--base))';
        }

        const titleHeight = titleFrame.offsetHeight + titleFrameAdjust;
        totalHeight += titleHeight; // 누적 높이 계산
        
        if(mobile == 0){
        const footer = document.createElement('div');
        footer.className = 'page-footer';
        footer.textContent = pagenum;
        const footerline = document.createElement('div');
        footerline.className = 'page-footer-line';
        footer.appendChild(footerline);
        page.appendChild(footer);
        }
        
        //svg 추가//
        const SVG_NS = "http://www.w3.org/2000/svg";
        const svgOverlay = document.createElementNS(SVG_NS, "svg");
        svgOverlay.setAttribute("id", `svg-overlay_${pagenum}`);
        page.appendChild(svgOverlay);

        // 4. 지문 컨테이너 생성 (#passage) 및 titleFrame 바로 다음에 추가 (핵심!)
        const passageContainer = document.createElement('div');
        passageContainer.id = `passage_${pagenum}`;
        passageContainer.className = 'passageContainer'

        // 이제 titleFrame의 부모(page)가 DOM에 추가되었으므로 insertBefore 사용 가능
        titleFrame.parentNode.insertBefore(passageContainer, titleFrame.nextSibling);

        // 5. 페이지를 body에 추가
        document.body.appendChild(page);
        


            while (currentPassage < passagenum) {
                if (currentPassage >= passagenum) {
                    break; // 루프 종료
                } else {
                        if (checkman === 1) {
                                break;
                            }
                            
                        if (allPassages[currentPassage][0] == 'sub'){
                            
                                if (kkkk == 0){  
                                    const passage = allPassages[currentPassage][1];
                                    const regex = /\*(\w)\*\((.*?)\)/g;
                                    // 지문을 줄 단위로 분리
                                    const lines = passage.split('\n');
                                    const processedLines = lines.map(line => {
                                        // 덧말 처리
                                        const att = Att(line);
                                        return att
                                    });

                                    const splits = document.createElement('div');
                                    splits.innerHTML = processedLines;
                                    splits.classList.add('dotted-lines');
                                    
                                    if (attsplitCheck == 1){
                                        attsplitCheck = 0;
                                        blanking_small();
                                        document.getElementById(`page_${pagenum-1}`).appendChild(blankblock);
                                    }


                                    blanking_small();
                                    document.getElementById(`passage_${pagenum}`).appendChild(splits);
                                    document.getElementById(`passage_${pagenum}`).appendChild(blankblock);
                                    
                                    kkkk = 1;
                                    currentPassage++; // 다음 passage로 이동
                                    }else{
                                        checkman = 1;
                                        kkkk = 0;
                                        break;
                                        
                                    }
                            }else if (allPassages[currentPassage][0] == 'noq'){
                                qndisplay = 1;
                                currentPassage++; // 다음 passage로 이동
                                checkman = 0;
                            }else if (allPassages[currentPassage][0] == 'yesq'){
                                qndisplay = 0;
                                currentPassage++; // 다음 passage로 이동
                                checkman = 0;
                            }else if (allPassages[currentPassage][0] == 'double'){
                                doubled = 1;
                                double_fix = 'false';
                                doublenum++;
                                // doubleFrame 생성 (좌측, 우측 박스를 포함한)
                                const doubleFrame = createDoubleFrame(doublenum);
                                document.getElementById(`passage_${pagenum}`).appendChild(doubleFrame);
                                currentPassage++; // 다음 passage로 이동
                                checkman = 0;
                            }else if (allPassages[currentPassage][0] == 'doubleL'){
                                doubled = 1;
                                double_fix = 'true';
                                currentPassage++; // 다음 passage로 이동
                                checkman = 0;
                            }else if (allPassages[currentPassage][0] == 'doubleR'){
                                doubled = 2;
                                double_fix = 'true';
                                currentPassage++; // 다음 passage로 이동
                                checkman = 0;
                            }else if (allPassages[currentPassage][0] == 'single'){
                                doubled = 0;
                                currentPassage++; // 다음 passage로 이동
                                checkman = 0;
                            }else if (allPassages[currentPassage][0] == 'split'){
                                /*const splits = document.createElement('div');
                                splits.innerHTML = '';
                                blanking_small();
                                document.getElementById(`passage_${pagenum}`).appendChild(splits);
                                document.getElementById(`passage_${pagenum}`).appendChild(blankblock);*/
                                if(mobile == 0){
                                    currentPassage++; // 다음 passage로 이동
                                    totalHeight = height;
                                    checkman = 1;
                                    checker = 1;
                                    break;
                                }else{
                                    currentPassage++; // 다음 passage로 이동
                                    checkman = 0;
                                }
                            
                            }else if (allPassages[currentPassage][0] == 'blks'){
                                blanking_small();
                                document.getElementById(`passage_${pagenum}`).appendChild(blankblock);
                                currentPassage++; // 다음 passage로 이동
                                checkman = 0;
                            
                            }else if (allPassages[currentPassage][0] == 'blkm'){
                                blanking_small();
                                document.getElementById(`passage_${pagenum}`).appendChild(blankblock);
                                blanking_small();
                                document.getElementById(`passage_${pagenum}`).appendChild(blankblock);
                                currentPassage++; // 다음 passage로 이동
                                checkman = 0;
                            
                            }else{
                                parseAndDisplayPassage(currentPassage); // 현재 passage 표시
                                Pagemerging();
                                currentPassage++; // 다음 passage로 이동

                            }

                }
            }    

            if (currentPassage >= passagenum) {
                        currentPassage = 0;
                        if(mobile == 1){
                            const spacer = document.createElement('div');
                            spacer.style.height = 'calc(300 / 16 * var(--base))';
                            page.appendChild(spacer);
                        }

                                
            } else {
                if (checkman == 1) { //페이지를 넘기는 것은 checkman ==1로 체크. pagenum은 이 다음에 다시 createPageElements를 불러올 때 증가함.
                        preHeight = totalHeight;
                        totalHeight = 0;
                        percentage = 0;
                        checkman = 0;
                        

                        /* 강제로 페이지를 넘길 경우, '다음 페이지에서' 표시를 추가.*/
                        nextmark();

                        // 페이지 다시 만들기
                        createPageElements();
                }else{

                }
            }

    }