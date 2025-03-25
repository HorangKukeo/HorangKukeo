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

//////////////////////////////////////////////////////////////////////////////////////////////////
// 전역 스코프에 유틸리티 함수 정의
let setWithExpiry, getWithExpiry;

function answer_reload() {
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
    } catch (e) {
        console.error('localStorage를 사용할 수 없습니다:', e);
        return; // localStorage 사용 불가 시 함수 종료
    }
    
    // 유틸리티 함수 전역으로 설정
    // 만료 시간과 함께 저장하는 함수 (3시간 = 10,800,000ms)
    setWithExpiry = function(key, value) {
        const TTL = 3 * 60 * 60 * 1000; // 3시간
        const item = {
            value: value,
            expiry: new Date().getTime() + TTL
        };
        localStorage.setItem(key, JSON.stringify(item));
    };

    // 만료 확인하며 가져오는 함수 - 예외 처리 추가
    getWithExpiry = function(key) {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) return null;
        
        try {
            // JSON 파싱 시도
            const item = JSON.parse(itemStr);
            
            // 유효한 형식인지 확인 (value와 expiry 속성이 있는지)
            if (item && typeof item === 'object' && 'value' in item && 'expiry' in item) {
                if (new Date().getTime() > item.expiry) {
                    localStorage.removeItem(key);
                    return null;
                }
                return item.value;
            } else {
                // 형식은 JSON이지만 우리가 원하는 구조가 아님
                localStorage.removeItem(key); // 문제가 있는 항목 삭제
                return null;
            }
        } catch (e) {
            // JSON 파싱 실패 - 일반 문자열로 저장된 경우일 수 있음
            console.warn(`저장된 항목 "${key}"의 형식이 올바르지 않습니다. 로컬스토리지를 정리합니다.`);
            localStorage.removeItem(key); // 문제가 있는 항목 삭제
            return null;
        }
    };

    // 기존 로컬스토리지 데이터 정리 (옵션)
    function cleanupLocalStorage() {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('input_') || key.startsWith('choice_')) {
                getWithExpiry(key); // 이 함수 내에서 잘못된 항목 정리
            }
        }
    }
    
    // 시작 시 로컬스토리지 정리 실행
    cleanupLocalStorage();

    // 모든 userinput 타입 input 요소 선택
    const inputs = document.querySelectorAll('input[data-type="userinput"]');
    
    // 먼저 선택형 문제 처리
    choice_reload();

    // 기존 코드에서 input 처리 부분만 수정
    inputs.forEach((input, index) => {
        const storageKey = 'input_' + index;
        
        // 저장된 값 복원
        const savedValue = getWithExpiry(storageKey);
        if (savedValue !== null) {
            // 1. input 값 설정
            input.value = savedValue;
            
            // 2. userAnswers 직접 업데이트 - 이 부분이 핵심
            const questionContainer = findQuestionContainer(input);
            if (questionContainer && questionContainer.id) {
                
                // userAnswers 직접 업데이트
                if (userAnswers[questionContainer.id]) {
                    userAnswers[questionContainer.id].userAnswer = savedValue;
                }
            }
            
            // 3. 다양한 이벤트 트리거 (이벤트 캡처 확률 높이기)
            setTimeout(() => {
                // 약간의 지연 후 이벤트 발생 (DOM 완전 로드 후)
                ['input', 'change', 'blur'].forEach(eventType => {
                    const event = new Event(eventType, { bubbles: true });
                    input.dispatchEvent(event);
                });
                
                // 추가: 키보드 이벤트 시뮬레이션
                const keyEvent = new KeyboardEvent('keyup', { bubbles: true });
                input.dispatchEvent(keyEvent);
            }, 100);
        }
        
        // 입력 시 자동 저장 (기존과 동일)
        input.addEventListener('input', function() {
            setWithExpiry(storageKey, this.value);
        });
    });

    // 개발용 디버깅 함수 (문제 해결 후 제거 가능)
    function debugUserAnswers() {
        document.querySelectorAll('input[data-type="userinput"]').forEach((input, i) => {
            const container = findQuestionContainer(input);
        });
    }

    // 페이지 로드 완료 후 디버깅 실행 (선택적)
    setTimeout(debugUserAnswers, 500);
}

// 입력 필드가 속한 문제 컨테이너 찾기 (전역으로 이동)
function findQuestionContainer(element) {
    // 부모 요소 중에서 id 속성을 가진 가장 가까운 요소 찾기
    let current = element;
    while (current) {
        if (current.id && current.id.length > 0) {
            return current;
        }
        current = current.parentElement;
    }
    return null;
}

// 선택형 문제에 대한 로컬 스토리지 설정
function choice_reload() {
    // 함수가 정의되었는지 확인
    if (typeof getWithExpiry !== 'function' || typeof setWithExpiry !== 'function') {
        console.error('getWithExpiry 또는 setWithExpiry 함수가 정의되지 않았습니다');
        return;
    }

    // 모든 선택형 컨테이너 가져오기
    const choiceContainers = document.querySelectorAll('.choice-container');
    
    choiceContainers.forEach(container => {
        const containerId = container.id;
        if (!containerId) return; // ID가 없으면 건너뜀
        
        // 컨테이너 내 모든 선택 옵션
        const options = container.querySelectorAll('.choice-option');
        
        // 각 옵션에 클릭 이벤트 핸들러 추가 (기존 핸들러 보존)
        options.forEach(option => {
            // 기존 클릭 핸들러 보존
            const originalClickHandler = option.onclick;
            
            option.onclick = function(event) {
                // 기존 핸들러가 있으면 실행
                if (originalClickHandler) {
                    originalClickHandler.call(this, event);
                }
                
                // 단일 선택 문제인 경우(data-type="b")
                if (container.dataset.type === 'b') {
                    // 같은 컨테이너 내 모든 옵션에서 selected 제거
                    options.forEach(opt => opt.classList.remove('selected'));
                    // 클릭된 옵션에만 selected 추가
                    option.classList.add('selected');
                    
                    // 선택 상태 저장
                    const selectedIndex = Array.from(options).indexOf(option);
                    setWithExpiry(`choice_${containerId}`, selectedIndex);
                    
                    // userAnswers 업데이트
                    if (userAnswers[containerId]) {
                        userAnswers[containerId].userAnswer = option.textContent.trim();
                    }
                }
                // 복수 선택 문제인 경우(data-type="bb")
                else if (container.dataset.type === 'bb') {
                    // 클릭된 옵션의 selected 상태 토글
                    option.classList.toggle('selected');
                    
                    // 선택된 모든 옵션의 인덱스 배열 저장
                    const selectedIndices = Array.from(options)
                        .map((opt, idx) => opt.classList.contains('selected') ? idx : -1)
                        .filter(idx => idx !== -1);
                    
                    setWithExpiry(`choice_${containerId}`, selectedIndices);
                    
                    // userAnswers 업데이트 (선택된 모든 옵션 텍스트)
                    if (userAnswers[containerId]) {
                        const selectedTexts = Array.from(options)
                            .filter(opt => opt.classList.contains('selected'))
                            .map(opt => opt.textContent.trim());
                        
                        userAnswers[containerId].userAnswer = selectedTexts;
                    }
                }
            };
        });
        
        // 저장된 선택 상태 복원
        const savedChoice = getWithExpiry(`choice_${containerId}`);
        if (savedChoice !== null) {
            // 단일 선택 문제
            if (container.dataset.type === 'b' && typeof savedChoice === 'number') {
                if (options[savedChoice]) {
                    // 모든 옵션에서 selected 제거
                    options.forEach(opt => opt.classList.remove('selected'));
                    // 저장된 인덱스의 옵션에 selected 추가
                    options[savedChoice].classList.add('selected');
                    
                    // userAnswers 업데이트
                    if (userAnswers[containerId]) {
                        userAnswers[containerId].userAnswer = options[savedChoice].textContent.trim();
                    }
                    
                    // 이벤트 발생시켜 다른 코드에도 알림
                    const clickEvent = new MouseEvent('click', { bubbles: true });
                    options[savedChoice].dispatchEvent(clickEvent);
                }
            }
            // 복수 선택 문제
            else if (container.dataset.type === 'bb' && Array.isArray(savedChoice)) {
                // 모든 옵션에서 selected 제거
                options.forEach(opt => opt.classList.remove('selected'));
                
                // 선택된 텍스트 배열 준비
                const selectedTexts = [];
                
                // 저장된 인덱스의 옵션들에 selected 추가
                savedChoice.forEach(index => {
                    if (options[index]) {
                        options[index].classList.add('selected');
                        selectedTexts.push(options[index].textContent.trim());
                        
                        // 이벤트 발생시켜 다른 코드에도 알림
                        const clickEvent = new MouseEvent('click', { bubbles: true });
                        options[index].dispatchEvent(clickEvent);
                    }
                });
                
                // userAnswers 업데이트
                if (userAnswers[containerId]) {
                    userAnswers[containerId].userAnswer = selectedTexts;
                }
            }
        }
    });
}

// localStorage 데이터 초기화 함수
function local_Remove() {
    // localStorage에서 input_ 및 choice_로 시작하는 모든 키 찾기
    const keysToRemove = [];
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('input_') || key.startsWith('choice_'))) {
            keysToRemove.push(key);
        }
    }
    
    // 찾은 키들 모두 삭제
    keysToRemove.forEach(key => {
        localStorage.removeItem(key);
    });
    
    return keysToRemove.length; // 삭제된 항목 수 반환
}

// 이미지 경로 결정 함수
function getImagePath(relativePath) {
    // Electron 환경인지 확인
    if (window.electron || typeof process !== 'undefined' && process.versions && process.versions.electron) {
        // Electron 환경 - exe 파일과 같은 디렉토리의 image 폴더 사용
        const path = window.require('path');
        const app = window.require('@electron/remote').app || window.require('electron').remote.app;
        
        // 앱 실행 디렉토리 (exe 파일 위치)
        const appPath = app.getAppPath();
        const exePath = path.dirname(app.getPath('exe'));
        
        // 개발환경인지 패키징된 환경인지 확인
        const isPackaged = app.isPackaged;
        
        // 패키징된 환경이면 exe 파일 위치, 아니면 개발 환경의 경로 사용
        const basePath = isPackaged ? exePath : appPath;
        return path.join(basePath, 'image', relativePath);
    } else {
        // 일반 웹 환경 - HTML 파일과 같은 디렉토리의 image 폴더 사용
        return `image/${relativePath}`;
    }
}