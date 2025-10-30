(function() {
    const sfxCache = {};
    const sfxToPreload = [
        'player-attack-hit', 'player-attack-miss', 'player-skillat-hit', 'player-skillat-miss',
        'player-skillheal-hit', 'player-skillheal-miss', 'monster-attack-hit', 'monster-attack-blocked',
        'monster-skillat-hit', 'monster-skillat-miss', 'monster-skillheal-hit', 'monster-skillheal-miss',
        'item-heal', 'item-damage'
    ];

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function preloadSounds() {
        sfxToPreload.forEach(soundName => {
            const audio = new Audio(`sfx/${soundName}.mp3`);
            audio.load();
            sfxCache[soundName] = audio;
        });
    }

    function playSound(soundName) {
        const audio = sfxCache[soundName];
        if (audio) {
            audio.currentTime = 0;
            audio.volume = 0.5;
            audio.play();
        } else {
            console.warn(`'${soundName}' 효과음을 찾을 수 없습니다.`);
        }
    }

    function shakeScreen() {
        gameContainer.classList.add('shake');
        gameContainer.addEventListener('animationend', () => {
            gameContainer.classList.remove('shake');
        }, { once: true });
    }

const battleModeContainer = document.querySelector('#battle-mode-container');
const gameContainer = battleModeContainer.querySelector('#game-container');
const monsterImageEl = gameContainer.querySelector('#monster-image');
const infoBtn = gameContainer.querySelector('#info-btn');
const monsterNameEl = gameContainer.querySelector('#monster-name');
const monsterHpBar = gameContainer.querySelector('#monster-hp-bar');
const playerNameEl = gameContainer.querySelector('#player-name');
const playerHpBar = gameContainer.querySelector('#player-hp-bar');
const playerMpBar = gameContainer.querySelector('#player-mp-bar');
const messageBox = gameContainer.querySelector('#message-box');
const messageTextEl = gameContainer.querySelector('#message-text');
const quizBox = gameContainer.querySelector('#quiz-box');
const quizTextPromptEl = gameContainer.querySelector('#quiz-text-prompt');
const quizTextContextEl = gameContainer.querySelector('#quiz-text-context');
const quizAnswersEl = gameContainer.querySelector('#quiz-answers');
const actionMenu = gameContainer.querySelector('#action-menu');
const actionButtons = gameContainer.querySelectorAll('.action-btn');
const uiArea = gameContainer.querySelector('#ui-area');
const turnIndicator = gameContainer.querySelector('#turn-indicator');
const progressBarFill = gameContainer.querySelector('#progress-bar-fill');
const progressText = gameContainer.querySelector('#progress-text');
const battleLog = gameContainer.querySelector('#battle-log');
const playerBox = gameContainer.querySelector('#player-box');
const monsterBox = gameContainer.querySelector('#monster-box');

const infoModal = battleModeContainer.querySelector('#info-modal');
const infoList = battleModeContainer.querySelector('#info-list');
const gameOverEl = battleModeContainer.querySelector('#game-over');
const dungeonClearEl = battleModeContainer.querySelector('#dungeon-clear');
const finalRewardsEl = battleModeContainer.querySelector('#final-rewards');
const returnToMainBtn = battleModeContainer.querySelector('#return-to-main-btn');
const modalBackdrop = battleModeContainer.querySelector('#modal-backdrop');
const skillModal = battleModeContainer.querySelector('#skill-modal');
const skillList = battleModeContainer.querySelector('#skill-list');
const itemModal = battleModeContainer.querySelector('#item-modal');
const itemList = battleModeContainer.querySelector('#item-list');
const victoryModal = battleModeContainer.querySelector('#victory-modal');
const victoryMessageEl = battleModeContainer.querySelector('#victory-message');
const continueBattleBtn = battleModeContainer.querySelector('#continue-battle-btn');
const gameOverMessageEl = battleModeContainer.querySelector('#game-over-message');
/*const returnToMainFromGameOverBtn = battleModeContainer.querySelector('#return-to-main-from-gameover-btn');*/

const reviewAllBtn = battleModeContainer.querySelector('#review-all-btn');
const reviewWrongBtn = battleModeContainer.querySelector('#review-wrong-btn');
const quizReviewModal = battleModeContainer.querySelector('#quiz-review-modal');
const quizReviewTitle = battleModeContainer.querySelector('#quiz-review-title');
const quizReviewList = battleModeContainer.querySelector('#quiz-review-list');

const cardDB = JSON.parse(localStorage.getItem('cardDB')) || [];
const skillDB = JSON.parse(localStorage.getItem('skillDB')) || [];
const itemDB = JSON.parse(localStorage.getItem('itemDB')) || [];
const monsterDB = JSON.parse(localStorage.getItem('monsterDB')) || [];
const dungeonDB = JSON.parse(localStorage.getItem('dungeonDB')) || [];
const questionDB = JSON.parse(localStorage.getItem('questionDB')) || [];
const userData = JSON.parse(localStorage.getItem('userData'));
const selectedDungeonId = localStorage.getItem('selectedDungeonId');

let player = {};
let monstersInDungeon = [];
let currentMonster;
let currentMonsterIndex = 0;
let dungeonRewards = { gold: 0, points: {} };
let turn = 'player';
let onQuizComplete = null;
let isActionInProgress = false;
let isReturningToMain = false;
let isBattleLost = false;

let dungeonQuestionHistory = [];

// [신규] 튜토리얼 전투 상태 변수
let isTutorialBattle = false;
let tutorialBattleStep = 1;

// 튜토리얼 오버레이 요소
const tutorialOverlay = document.createElement('div');
tutorialOverlay.id = 'ui-curtain';

/**
 * 튜토리얼 오버레이를 표시하고 특정 요소를 하이라이트합니다.
 * @param {string} text - 설명 텍스트
 * @param {string} targetSelector - 하이라이트할 요소의 CSS 선택자
 */
function showTutorialOverlay(text, targetSelector) {
    const targetElement = document.querySelector(targetSelector);
    if (!targetElement) {
        console.warn("Tutorial target not found:", targetSelector);
        return;
    }

    // 1. 오버레이(커튼) 설정
    tutorialOverlay.innerHTML = ''; // 내용 초기화
    tutorialOverlay.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        z-index: 10000;
        pointer-events: none;
    `;
    gameContainer.appendChild(tutorialOverlay);

    // 2. 부모 요소(action-menu)도 z-index 높이기
    const actionMenu = document.getElementById('action-menu');
    if (actionMenu) {
        actionMenu.style.position = 'relative';
        actionMenu.style.zIndex = '25000';
    }

    // 3. 타겟 요소 하이라이트 (커튼 위로 올리기)
    targetElement.style.position = 'relative';
    targetElement.style.zIndex = '10001';
    targetElement.classList.add('tutorial-focus');

    // 4. 이전 설명 박스 제거 (중첩 방지)
    const oldTextBoxes = document.querySelectorAll('.tutorial-textbox');
    oldTextBoxes.forEach(box => box.remove());

    // 5. 새로운 설명 박스 생성
    const textBox = document.createElement('div');
    textBox.className = 'tutorial-textbox';
    textBox.innerHTML = `<p>${text}</p>`;

    // body에 직접 추가하여 독립적인 stacking context 생성
    gameContainer.appendChild(textBox);
}

/**
 * 오버레이와 하이라이트를 제거합니다.
 */
function removeTutorialOverlay(targetSelector) {
    // 오버레이 제거
    if (tutorialOverlay.parentNode) {
        tutorialOverlay.parentNode.removeChild(tutorialOverlay);
    }

    // textBox 제거
    const oldTextBoxes = document.querySelectorAll('.tutorial-textbox');
    oldTextBoxes.forEach(box => box.remove());

    // action-menu z-index 원래대로
    const actionMenu = document.getElementById('action-menu');
    if (actionMenu) {
        actionMenu.style.position = '';
        actionMenu.style.zIndex = '';
    }

    // 타겟 요소 하이라이트 제거
    if (targetSelector) {
        const targetElement = document.querySelector(targetSelector);
        if (targetElement) {
            targetElement.style.position = '';
            targetElement.style.zIndex = '';
            targetElement.style.pointerEvents = '';
            targetElement.classList.remove('tutorial-focus');
        }
    }
}

// 🎯 새로운 기능: 전투 로그 추가 함수
function addBattleLog(message, icon = '⚔️') {
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    logEntry.textContent = `${icon} ${message}`;
    
    battleLog.appendChild(logEntry);
    
    const logs = battleLog.querySelectorAll('.log-entry');
    if (logs.length > 10) {
        logs[0].remove();
    }
    
    battleLog.scrollTop = battleLog.scrollHeight;
}

// 🎯 새로운 기능: 턴 표시 업데이트
function updateTurnIndicator(currentTurn) {
    if (currentTurn === 'player') {
        turnIndicator.className = 'player-turn';
        turnIndicator.innerHTML = '🗡️ 당신의 턴입니다';
        playerBox.classList.add('active-turn');
        monsterBox.classList.remove('active-turn');
    } else {
        turnIndicator.className = 'enemy-turn';
        turnIndicator.innerHTML = '👹 몬스터의 턴입니다';
        monsterBox.classList.add('active-turn');
        playerBox.classList.remove('active-turn');
    }
}

// 🎯 새로운 기능: 진행도 바 업데이트
function updateProgressBar() {
    const currentIndex = currentMonsterIndex + 1;
    const totalMonsters = monstersInDungeon.length;
    const percentage = (currentIndex / totalMonsters) * 100;
    
    progressText.textContent = `몬스터 ${currentIndex} / ${totalMonsters}`;
    progressBarFill.style.width = `${percentage}%`;
}

function calculatePlayerStats() {
        const ownedCardCount = player.ownedCards.length;
        const tierBonuses = [
            { hp: 10, mp: 5, att: 10 },   // 10개 이상
            { hp: 20, mp: 10, att: 15 }, // 20개 이상
            { hp: 30, mp: 15, att: 20 },  // 30개 이상
            { hp: 40, mp: 20, att: 25 },  // 40개 이상
            { hp: 70, mp: 40, att: 50 },  // 50개 이상
            { hp: 60, mp: 30, att: 35 },  // 60개 이상
            { hp: 70, mp: 35, att: 40 },  // 70개 이상
            { hp: 80, mp: 40, att: 45 },  // 80개 이상
            { hp: 90, mp: 45, att: 50 },  // 90개 이상
            { hp: 120, mp: 70, att: 70 }  // 100개 이상
        ];


        // 1. 기본 보너스를 계산합니다.
        let collectionHpBonus = ownedCardCount * 1;
        let collectionMpBonus = Math.round(ownedCardCount * 0.5);
        let collectionAttackBonus = Math.round(ownedCardCount * 0.5);

        // 2. 10개 단위 티어(tier)를 계산합니다.
        // (예: 35개면 3티어, 9개면 0티어)
        const tiers = Math.floor(ownedCardCount / 10);
        
        // 3. 달성한 티어만큼 설정 배열을 순회하며 보너스를 누적합니다.
        for (let i = 0; i < tiers; i++) {
            
            // 설정 배열에 해당 티어의 보너스가 정의되어 있는지 확인
            if (tierBonuses[i]) {
                collectionHpBonus += tierBonuses[i].hp;
                collectionMpBonus += tierBonuses[i].mp;
                collectionAttackBonus += tierBonuses[i].att;
            }
        }

    player.maxHp = player.baseHp + collectionHpBonus;
    player.maxMp = player.baseMp + collectionMpBonus;
    player.attack = player.baseAttack + collectionAttackBonus;

    player.equippedCards.forEach(cardId => {
        const card = cardDB.find(c => c.id === cardId);
        if (card) {
            player.maxHp += card.hpBonus;
            player.maxMp += card.mpBonus;
            player.attack += card.attackBonus;
        }
    });
}

function updateUI() {
    player.hp = Math.min(player.maxHp, player.hp);
    player.mp = Math.min(player.maxMp, player.mp);
    
    // ✅ 플레이어 HP 바 업데이트
    const hpPercent = Math.round((player.hp / player.maxHp) * 100);
    playerHpBar.style.width = `${hpPercent}%`;
    document.getElementById('player-hp-text').textContent = `${player.hp} / ${player.maxHp}`;
    
    // ✅ 플레이어 MP 바 업데이트
    const mpPercent = Math.round((player.mp / player.maxMp) * 100);
    playerMpBar.style.width = `${mpPercent}%`;
    document.getElementById('player-mp-text').textContent = `${player.mp} / ${player.maxMp}`;
    
    // ✅ 몬스터 HP 바 업데이트
    const monsterHpPercent = Math.round((currentMonster.hp / currentMonster.maxHp) * 100);
    monsterHpBar.style.width = `${monsterHpPercent}%`;
    document.getElementById('monster-hp-text').textContent = `${currentMonster.hp} / ${currentMonster.maxHp}`;
}

function shuffleArray(array) { 
    for (let i = array.length - 1; i > 0; i--) { 
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    } 
    return array;
}

function showMessage(text, detailsOrCallback, callback) {
    uiArea.classList.remove('hidden'); // 👈 [추가]
    messageBox.classList.remove('hidden');
    quizBox.classList.add('hidden');
    
    let explanation = '';
    let finalCallback = null;
    let isAfterQuiz = false;
    let isCorrect = false;
    
    if (typeof detailsOrCallback === 'function') {
        finalCallback = detailsOrCallback;
    } else if (typeof detailsOrCallback === 'object' && detailsOrCallback !== null) {
        isAfterQuiz = true;
        isCorrect = detailsOrCallback.isCorrect;
        explanation = detailsOrCallback.explanation || '';
        finalCallback = callback;
    } else if (detailsOrCallback === undefined && callback === undefined) {
        finalCallback = null;
    }
    
    let fullMessage = text;
    
    if (isAfterQuiz) {
        let answerHTML = '';
        let explanationHTML = '';

        if (currentQuestion && currentQuestion.correctAnswer) {
            // 🔽 --- 수정된 부분 --- 🔽
            const formattedAnswer = currentQuestion.correctAnswer.replace(/@(.*?)@/g, '<u>$1</u>');
            // 🔼 --- 수정된 부분 --- 🔼

            if (isCorrect) {
                answerHTML = `<div style="margin-top: 15px; padding: 10px; background-color: rgba(76, 175, 80, 0.2); border-left: 3px solid var(--hp-color); text-align: left;"><strong>✔️ 정답:</strong> ${formattedAnswer}</div>`; // ◀ 변수 사용
            } else {
                answerHTML = `<div style="margin-top: 15px; padding: 10px; background-color: rgba(199, 67, 67, 0.2); border-left: 3px solid #c74343; text-align: left;"><strong>❌ 정답:</strong> ${formattedAnswer}</div>`; // ◀ 변수 사용
            }
        }
        
        if (explanation) {
            explanationHTML = '';
            /*explanationHTML = `<div style="margin-top: 10px; padding: 10px; background-color: rgba(255,193,7,0.2); border-left: 3px solid var(--accent-color); text-align: left;"><strong>💡 해설:</strong> ${explanation}</div>`;*/
        }
        
        fullMessage += `<br><br>${answerHTML}${explanationHTML}`;
    }
    
    messageTextEl.innerHTML = fullMessage;
    
    if (isAfterQuiz) {
        setTimeout(() => {
            messageBox.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 50); // 50ms 지연
    }

    if (finalCallback) { 
        let waitTime = 1200;
        if (isAfterQuiz) {
            if (explanation) {
                waitTime = 1500;
            } else {
                waitTime = 1500; 
            }
        }
        setTimeout(finalCallback, waitTime);
    }
}

let currentQuestion = null;

function parseQuestion(questionString, questionType) {
    const parts = questionString.split('⊥');
    const questionData = { type: questionType };

    if (questionType === '1') {
        questionData.prompt = parts[0];
        questionData.context = parts[1];
        let isFixedOrder = false;
        if (parts[2] && parts[2].startsWith('#')) {
            isFixedOrder = true;
        }
        questionData.isFixedOrder = isFixedOrder; // 셔플 방지 플래그 저장

        // 2. '#' 플래그를 제거한 선지 배열 생성
        questionData.choices = [
            parts[2] ? parts[2].replace('#', '') : '', // # 제거
            parts[3], 
            parts[4], 
            parts[5]
        ];

        const correctIndex = parseInt(parts[6], 10) - 1;
        if (correctIndex >= 0 && correctIndex < questionData.choices.length) {
            questionData.correctAnswer = questionData.choices[correctIndex];
        } else {
            questionData.correctAnswer = questionData.choices[0]; 
        }
        questionData.explanation = parts[7] || '';
    } else if (questionType === '2') {
        questionData.prompt = parts[0];
        questionData.context = parts[1];
        questionData.correctAnswer = parts[2];
        questionData.explanation = parts[3] || '';
    }
    
    return questionData;
}

function showQuiz(question, callback) {
    uiArea.classList.remove('hidden');
    messageBox.classList.add('hidden');
    quizBox.classList.remove('hidden');
    onQuizComplete = callback;
    currentQuestion = question;

    const displayPrompt = question.prompt.replace(/@(.*?)@/g, '<u>$1</u>').replace(/▽/g, '<br>');
    const displayContext = question.context.replace(/@(.*?)@/g, '<u>$1</u>').replace(/▽/g, '<br>');
    
    quizTextPromptEl.innerHTML = displayPrompt;
    quizTextContextEl.innerHTML = displayContext;
    
    const quizAnswers = quizBox.querySelector('#quiz-answers');
    const shortAnswerArea = quizBox.querySelector('#quiz-short-answer-area');
    const shortAnswerInput = quizBox.querySelector('#short-answer-input');
    const shortAnswerSubmitBtn = quizBox.querySelector('#short-answer-submit-btn');

    if (question.type === '1') {
        quizAnswers.classList.remove('hidden');
        shortAnswerArea.classList.add('hidden');
        quizAnswers.innerHTML = '';
        
        let choicesToDisplay;
        if (question.isFixedOrder) {
            // isFixedOrder가 true이면, 순서 고정 (셔플 안 함)
            choicesToDisplay = [...question.choices];
        } else {
            // isFixedOrder가 false(undefined)이면, 기존대로 셔플
            choicesToDisplay = shuffleArray([...question.choices]);
        }

        choicesToDisplay.forEach(choice => {
            const button = document.createElement('button');
            button.className = 'quiz-btn';
            button.innerHTML = choice.replace(/@(.*?)@/g, '<u>$1</u>').replace(/▽/g, '<br>');
            button.onclick = () => handleQuizAnswer(choice === question.correctAnswer);
            quizAnswers.appendChild(button);
        });
    } else if (question.type === '2') {
        quizAnswers.classList.add('hidden');
        shortAnswerArea.classList.remove('hidden');
        
        shortAnswerInput.value = '';
        shortAnswerInput.disabled = false;
        shortAnswerInput.focus();
        
        shortAnswerSubmitBtn.disabled = false;
        
        const submitAnswer = () => {
            const userAnswer = shortAnswerInput.value.trim();
            const correctAnswer = question.correctAnswer;
            const normalizedUserAnswer = userAnswer.replace(/\s/g, '');
            const normalizedCorrectAnswer = correctAnswer.replace(/\s/g, '');
            handleQuizAnswer(normalizedUserAnswer === normalizedCorrectAnswer);
        };

        shortAnswerSubmitBtn.onclick = null;
        shortAnswerInput.onkeypress = null;
        shortAnswerSubmitBtn.onclick = submitAnswer;
        shortAnswerInput.onkeypress = (event) => {
            if (event.key === 'Enter') {
                submitAnswer();
            }
        };
    }

        setTimeout(() => {
            const isMobile = window.matchMedia("(max-width: 600px)").matches;

            if (question.type === '2' && isMobile && 'visualViewport' in window) {
                // [수정된 방법: 모바일 + 주관식]
                const shortAnswerInput = quizBox.querySelector('#short-answer-input');
                
                // 🎯 리스너 함수들을 명시적으로 정의 (재사용 가능)
                const onViewportResize = () => {
                    quizBox.scrollIntoView({
                        behavior: 'smooth',
                        block: 'end'
                    });
                };
                
                const onFocus = () => {
                    // focus될 때마다 resize 리스너 등록
                    window.visualViewport.addEventListener('resize', onViewportResize);
                };
                
                const onBlur = () => {
                    // blur될 때 resize 리스너 제거
                    window.visualViewport.removeEventListener('resize', onViewportResize);
                };
                
                // 🔄 기존 리스너 제거 후 새로 등록 (중복 방지)
                shortAnswerInput.removeEventListener('focus', onFocus);
                shortAnswerInput.removeEventListener('blur', onBlur);
                shortAnswerInput.addEventListener('focus', onFocus);
                shortAnswerInput.addEventListener('blur', onBlur);
                
                // 턴 구분 없이 항상 작동하도록
                if (turn === 'player') {
                    // 플레이어 턴: 자동 포커스 (즉시 키보드 팝업)
                    shortAnswerInput.focus();
                } else {
                    // 몬스터 턴: 리스너만 등록 (사용자가 탭할 때 작동)
                    // 초기 위치는 일단 하단으로 (키보드 없는 상태 기준)
                    quizBox.scrollIntoView({ behavior: 'smooth', block: 'end' });
                }

            } else {
                // [방법 2: PC 또는 객관식]
                quizBox.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }
        }, 50);
}

function handleQuizAnswer(isCorrect) {
    const quizAnswersButtons = quizAnswersEl.querySelectorAll('.quiz-btn');
    quizAnswersButtons.forEach(btn => btn.disabled = true);
    
    const shortAnswerInput = quizBox.querySelector('#short-answer-input');
    const shortAnswerSubmitBtn = quizBox.querySelector('#short-answer-submit-btn');
    if (shortAnswerInput) shortAnswerInput.disabled = true;
    if (shortAnswerSubmitBtn) shortAnswerSubmitBtn.disabled = true;

    // (요구사항 7) [신규] 튜토리얼 오답 처리
    if (isTutorialBattle && !isCorrect) {
        let penaltyDesc = (turn === 'player')
            ? "실제 전투였다면 당신의 행동이 실패했을 겁니다!"
            : "실제 전투였다면 몬스터의 공격을 그대로 받았을 겁니다!";
        
        // 정답/해설을 먼저 보여주고 '다시 시도' 안내
        showMessage(
            `정답이 아닙니다! (${penaltyDesc})`, 
            { isCorrect: false, explanation: currentQuestion.explanation }, 
            () => {
                // 해설 메시지가 닫힌 후, 퀴즈 UI를 다시 활성화
                quizBox.classList.remove('hidden');
                messageBox.classList.add('hidden');
                
                quizAnswersButtons.forEach(btn => btn.disabled = false);
                if (shortAnswerInput) shortAnswerInput.disabled = false;
                if (shortAnswerSubmitBtn) shortAnswerSubmitBtn.disabled = false;
            }
        );
        return; // onQuizComplete를 호출하지 않고 종료 (턴이 안 넘어감)
    }

    if (currentQuestion) {
        dungeonQuestionHistory.push({ question: currentQuestion, isCorrect: isCorrect });
    }
    
    // [기존] 정답 또는 일반 전투
    if (onQuizComplete) { 
        onQuizComplete(isCorrect);
    }
}

function toggleActionMenu(enabled) { 
    actionButtons.forEach(btn => btn.disabled = !enabled); 
}

function setMonsterImage(state) {
    const imgBaseName = currentMonster.img || 'monster';
    monsterImageEl.src = `img/${imgBaseName}-${state}.png`;
}

function openModal(modal) { 
    modalBackdrop.classList.remove('hidden'); 
    modal.classList.remove('hidden'); 
}

function closeModal() { 
    modalBackdrop.classList.add('hidden'); 
    // backdrop 안의 모든 모달을 숨깁니다.
    skillModal.classList.add('hidden'); 
    itemModal.classList.add('hidden'); 
    victoryModal.classList.add('hidden'); 
    infoModal.classList.add('hidden');
    gameOverEl.classList.add('hidden');
    dungeonClearEl.classList.add('hidden');
    quizReviewModal.classList.add('hidden');
}

/**
 * Question Pool 문자열(예: "Q001, Q003~Q005")을 파싱하여 ID 배열 반환
 * @param {string} poolString - 파싱할 문자열
 * @returns {string[]} 파싱된 문제 세트 ID 배열 (예: ['Q001', 'Q003', 'Q004', 'Q005'])
 */
function parseQuestionPool(poolString) {
    if (!poolString) return [];
    const ids = new Set();
    const parts = poolString.split(',');
    let prefix = '';
    let padLength = 0;

    for (const part of parts) {
        const trimmedPart = part.trim();
        if (trimmedPart.includes('~')) {
            const [startStr, endStr] = trimmedPart.split('~');
            // ID 형식(예: Q001)에서 문자 부분과 숫자 부분을 분리
            const matchStart = startStr.match(/([a-zA-Z]*)(\d+)/);
            const matchEnd = endStr.match(/([a-zA-Z]*)(\d+)/);

            if (matchStart && matchEnd && matchStart[1] === matchEnd[1]) { // Prefix가 같아야 함
                 prefix = matchStart[1];
                 padLength = matchStart[2].length; // 숫자 부분 길이 (0 채우기용)
                 const startNum = parseInt(matchStart[2], 10);
                 const endNum = parseInt(matchEnd[2], 10);

                 if (!isNaN(startNum) && !isNaN(endNum) && startNum <= endNum) {
                    for (let i = startNum; i <= endNum; i++) {
                         ids.add(prefix + String(i).padStart(padLength, '0'));
                     }
                 } else {
                     console.warn(`잘못된 범위 형식: ${trimmedPart}`);
                 }
            } else {
                console.warn(`범위 지정 오류 또는 Prefix 불일치: ${trimmedPart}`);
            }
        } else {
             // 단일 ID 형식 검사 (선택 사항)
             const matchSingle = trimmedPart.match(/([a-zA-Z]*)(\d+)/);
             if (matchSingle) {
                 ids.add(trimmedPart);
             } else {
                  console.warn(`잘못된 ID 형식: ${trimmedPart}`);
             }
        }
    }
    return Array.from(ids);
}

function generateMonsters() {
    const selectedDungeon = dungeonDB.find(d => d.id === selectedDungeonId);
    if (!selectedDungeon) {
        console.error("선택된 던전 정보 없음:", selectedDungeonId);
        monstersInDungeon = [];
        return;
    }
    const monsterIds = [
        selectedDungeon.monster1Id, selectedDungeon.monster2Id, selectedDungeon.monster3Id,
        selectedDungeon.monster4Id, selectedDungeon.monster5Id
    ].filter(id => id);

    monstersInDungeon = monsterIds.map(id => {
        const monsterData = monsterDB.find(monster => monster.id === id);
        if (monsterData) {
            // ▼ Question Pool 파싱 및 랜덤 선택 로직 시작 ▼
            const possibleQuestionSetIds = parseQuestionPool(monsterData.questionPool);
            let selectedQuestionSetId = null;
            let questionsData = null;

            if (possibleQuestionSetIds.length > 0) {
                // 목록에서 랜덤하게 하나 선택
                selectedQuestionSetId = possibleQuestionSetIds[Math.floor(Math.random() * possibleQuestionSetIds.length)];
                // 선택된 ID로 questionDB에서 데이터 찾기
                questionsData = questionDB.find(q => q.id === selectedQuestionSetId);
            }
            // ▲ Question Pool 파싱 및 랜덤 선택 로직 끝 ▲

            const newMonster = { ...monsterData };
            newMonster.usedQuestions = [];
            newMonster.questionCount = {};

            if (questionsData) {
                newMonster.questionSet = questionsData; // 선택된 문제 세트 할당
                console.log(`몬스터 '${newMonster.name}'(ID: ${id})가 이번 전투에서 문제 세트 '${selectedQuestionSetId}'를 사용합니다.`);
            } else {
                console.error(`몬스터 '${newMonster.name}'(ID: ${id})에 사용할 유효한 Question DB를 찾을 수 없습니다. Pool: "${monsterData.questionPool}", Selected: "${selectedQuestionSetId}"`);
                // 오류 발생 시 기본 문제 세트 또는 빈 세트 할당 (게임 멈춤 방지)
                newMonster.questionSet = { id: 'error', name: '오류', type: '1', /* ... 빈 문제들 ... */ };
            }
            return newMonster;
        }
        return null;
    }).filter(monster => monster);
}

function startPlayerTurn() {
    battleModeContainer.scrollTo({ top: 0, behavior: 'smooth' });
    turn = 'player';
    setMonsterImage('idle');
    updateTurnIndicator('player');
    showMessage("당신의 턴입니다.", () => {
        uiArea.classList.add('hidden'); // 👈 [수정]
        toggleActionMenu(true);
        isActionInProgress = false;
    });
}

function startEnemyTurn(forceSkillId = null) { // [수정] 파라미터 추가
    turn = 'enemy';
    toggleActionMenu(false);
    setMonsterImage('idle');
    updateTurnIndicator('enemy');
    
    showMessage("몬스터의 턴입니다.", () => {
        const randomKey = getRandomQuestion();
        if (!randomKey) {
            showMessage("몬스터가 낼 문제가 없어 행동을 하지 못합니다.", checkBattleEnd);
            return;
        }

        const rawQuestion = currentMonster.questionSet[randomKey];
        const questionType = currentMonster.questionSet.type;
        const question = parseQuestion(rawQuestion, questionType);
        
        let selectedAction = null;

        // [신규] (요구사항 6) 튜토리얼 스킬 강제
        if (isTutorialBattle && forceSkillId) {
            const skillToUse = skillDB.find(s => s.id === forceSkillId);
            if (skillToUse && parseInt(currentMonster.mp) >= parseInt(skillToUse.mpCost)) {
                selectedAction = { action: 'skill', skill: skillToUse };
            } else if (skillToUse) {
                console.warn(`튜토리얼: 몬스터 MP 부족 (${skillToUse.name})`);
            }
        }
        
        // 튜토리얼 스킬 강제가 아니면 기존 랜덤 로직
        if (!selectedAction) {
                const monsterSkills = [
                currentMonster.skillId1, currentMonster.skillId2, currentMonster.skillId3
            ].filter(id => id).map(id => skillDB.find(s => s.id === id))
            .filter(skill => skill && parseInt(currentMonster.mp) >= parseInt(skill.mpCost));
            
            let actionWeights = [];
            
            if (monsterSkills.length === 0) {
                actionWeights = [{ action: 'attack', weight: 100 }];
            } else if (monsterSkills.length === 1) {
                actionWeights = [
                    { action: 'skill', skill: monsterSkills[0], weight: 40 },
                    { action: 'attack', weight: 60 }
                ];
            } else if (monsterSkills.length === 2) {
                actionWeights = [
                    { action: 'skill', skill: monsterSkills[0], weight: 30 },
                    { action: 'skill', skill: monsterSkills[1], weight: 25 },
                    { action: 'attack', weight: 45 }
                ];
            } else {
                actionWeights = [
                    { action: 'skill', skill: monsterSkills[0], weight: 35 },
                    { action: 'skill', skill: monsterSkills[1], weight: 25 },
                    { action: 'skill', skill: monsterSkills[2], weight: 10 },
                    { action: 'attack', weight: 30 }
                ];
            }
            
            const totalWeight = actionWeights.reduce((sum, item) => sum + item.weight, 0);
            let random = Math.random() * totalWeight;
            
            for (const item of actionWeights) {
                if (random < item.weight) {
                    selectedAction = item;
                    break;
                }
                random -= item.weight;
            }
        }
        
        if (selectedAction && selectedAction.action === 'skill') {
            const skillToUse = selectedAction.skill;
            currentMonster.mp -= parseInt(skillToUse.mpCost);
            showQuiz(question, async (isCorrect) => {
                if (isCorrect) {
                    setMonsterImage('happy');
                    if (skillToUse.type == 1) {
                        playSound('monster-skillat-miss');
                        await sleep(200);
                        const damage = Math.floor(parseInt(currentMonster.attack) * parseFloat(skillToUse.effect));
                        const finalDamage = Math.floor(damage * player.interferenceMultiplier);
                        player.hp = Math.max(0, player.hp - finalDamage);
                        addBattleLog(`방해 성공! ${skillToUse.name} 데미지 감소!`, '🛡️');
                        showMessage(`방해 성공! 몬스터의 ${skillToUse.name} 데미지가 ${finalDamage}(으)로 감소!`, { isCorrect: isCorrect, explanation: currentQuestion.explanation }, checkBattleEnd);
                    } else if (skillToUse.type == 2) {
                        playSound('monster-skillheal-miss');
                        await sleep(200);
                        const healAmount = Math.floor(parseInt(skillToUse.effect) * player.interferenceMultiplier);
                        currentMonster.hp = Math.min(currentMonster.maxHp, currentMonster.hp + healAmount);
                        addBattleLog(`방해 성공! ${skillToUse.name} 회복량 감소!`, '🛡️');
                        showMessage(`방해 성공! 몬스터가 ${skillToUse.name}(으)로 HP를 ${healAmount}만 회복!`, { isCorrect: isCorrect, explanation: currentQuestion.explanation }, checkBattleEnd);
                    } else if (skillToUse.type == 3) { // Type 3: 공격력 상승 (방해 배율 적용)
                        // 0.5 대신 player.interferenceMultiplier 사용
                        const effectValue = Math.floor(skillToUse.effect * player.interferenceMultiplier); 
                        currentMonster.attack += effectValue;
                        playSound('monster-skillheal-miss'); // (임의 효과음)
                        await sleep(200);
                        // [수정] 로그 메시지 (방해율 표시)
                        const blockPercent = (1 - player.interferenceMultiplier) * 100;
                        addBattleLog(`방해 성공! ${skillToUse.name} 효과 ${blockPercent.toFixed(0)}% 감소!`, '🛡️');
                        showMessage(`방해 성공! 몬스터의 공격력이 ${effectValue}만 증가했다!`, { isCorrect: isCorrect, explanation: currentQuestion.explanation }, checkBattleEnd);

                    } else if (skillToUse.type == 4) { // Type 4: HP 상승 (방해 배율 적용, 비율 유지)
                        // 0.5 대신 player.interferenceMultiplier 사용
                        const effectValue = Math.floor(skillToUse.effect * player.interferenceMultiplier);
                        const hpPercent = currentMonster.hp / currentMonster.maxHp;
                        currentMonster.maxHp += effectValue;
                        currentMonster.hp = Math.round(currentMonster.maxHp * hpPercent);
                        playSound('monster-skillheal-miss'); // (임의 효과음)
                        await sleep(200);
                        // [수정] 로그 메시지 (방해율 표시)
                        const blockPercent = (1 - player.interferenceMultiplier) * 100;
                        addBattleLog(`방해 성공! ${skillToUse.name} 효과 ${blockPercent.toFixed(0)}% 감소!`, '🛡️');
                        showMessage(`방해 성공! 몬스터의 최대 HP가 ${effectValue}만 증가했다!`, { isCorrect: isCorrect, explanation: currentQuestion.explanation }, checkBattleEnd);

                    } else if (skillToUse.type == 5) { // Type 5: 방해 효과 감소 (방해 배율 적용)
                        // 0.5 대신 player.interferenceMultiplier 사용
                        const effectValue = skillToUse.effect * player.interferenceMultiplier; 
                        const effectDecreasePercent = (effectValue * 100).toFixed(0); // 1. 방해 효과 감소량
                        
                        player.interferenceMultiplier += effectValue;
                        player.interferenceMultiplier = Math.min(1.0, player.interferenceMultiplier);

                        const totalBlockPercent = (1 - player.interferenceMultiplier) * 100; // 2. 총 방해 효과
                        
                        playSound('monster-skillat-miss'); // (임의 효과음)
                        await sleep(200);
                        // [수정] 로그 메시지 (방해율 표시)
                        const blockPercent = (1 - player.interferenceMultiplier) * 100;
                        addBattleLog(`방해 성공! ${skillToUse.name} 효과 ${blockPercent.toFixed(0)}% 감소!`, '🛡️');
                        // 3. 메시지 수정 (UI용)
                        showMessage(`방해 성공! 방해/방어 효과가 ${effectDecreasePercent}%만 감소했다!<br>현재 방해/방어 효과: ${totalBlockPercent.toFixed(0)}%`, { isCorrect: isCorrect, explanation: currentQuestion.explanation }, checkBattleEnd);
                    }
                } else {
                    setMonsterImage('happy');
                    if (skillToUse.type == 1) {
                        playSound('monster-skillat-hit');
                        await sleep(200);
                        shakeScreen();
                        const damage = Math.floor(parseInt(currentMonster.attack) * parseFloat(skillToUse.effect));
                        const finalDamage = damage;
                        player.hp = Math.max(0, player.hp - finalDamage);
                        addBattleLog(`${skillToUse.name}! ${finalDamage} 데미지!`, '💥');
                        showMessage(`몬스터의 ${skillToUse.name}! ${finalDamage}의 데미지!`, { isCorrect: isCorrect, explanation: currentQuestion.explanation }, checkBattleEnd);
                    } else if (skillToUse.type == 2) {
                        playSound('monster-skillheal-hit');
                        await sleep(200);
                        const healAmount = parseInt(skillToUse.effect);
                        currentMonster.hp = Math.min(currentMonster.maxHp, currentMonster.hp + healAmount);
                        addBattleLog(`${skillToUse.name}! HP ${healAmount} 회복!`, '💚');
                        showMessage(`몬스터가 ${skillToUse.name}(으)로 HP를 ${healAmount} 회복!`, { isCorrect: isCorrect, explanation: currentQuestion.explanation }, checkBattleEnd);
                    } else if (skillToUse.type == 3) { // Type 3: 공격력 상승 (100% 적용)
                        const effectValue = skillToUse.effect;
                        currentMonster.attack += effectValue;
                        playSound('monster-skillheal-hit'); // (임의 효과음)
                        await sleep(200);
                        addBattleLog(`${skillToUse.name} 발동! 공격력 ${effectValue} 증가!`, '🔥');
                        showMessage(`방해 실패! 몬스터의 공격력이 ${effectValue} 증가했다!`, { isCorrect: isCorrect, explanation: currentQuestion.explanation }, checkBattleEnd);

                    } else if (skillToUse.type == 4) { // Type 4: HP 상승 (100% 적용, 비율 유지)
                        const effectValue = skillToUse.effect;
                        const hpPercent = currentMonster.hp / currentMonster.maxHp;
                        currentMonster.maxHp += effectValue;
                        currentMonster.hp = Math.round(currentMonster.maxHp * hpPercent);
                        playSound('monster-skillheal-hit'); // (임의 효과음)
                        await sleep(200);
                        addBattleLog(`${skillToUse.name} 발동! 최대 HP ${effectValue} 증가!`, '💪');
                        showMessage(`방해 실패! 몬스터의 최대 HP가 ${effectValue} 증가했다!`, { isCorrect: isCorrect, explanation: currentQuestion.explanation }, checkBattleEnd);

                    } else if (skillToUse.type == 5) { // Type 5: 방해 효과 감소 (100% 적용)
                        const effectValue = skillToUse.effect; // 100% 적용
                        const effectDecreasePercent = (effectValue * 100).toFixed(0); // 1. 방해 효과 감소량 (예: 10%)

                        player.interferenceMultiplier += effectValue;
                        player.interferenceMultiplier = Math.min(1.0, player.interferenceMultiplier);
                        
                        const totalBlockPercent = (1 - player.interferenceMultiplier) * 100; // 2. 총 방해 효과 (예: 40%)

                        playSound('monster-skillheal-hit'); // (임의 효과음)
                        await sleep(200);
                        addBattleLog(`${skillToUse.name} 발동! 방해 효과 감소!`, '📉');
                        // 3. 메시지 수정 (UI용)
                        showMessage(`방해 실패! 방해/방어 효과가 ${effectDecreasePercent}% 감소했다!<br>현재 방해/방어 효과: ${totalBlockPercent.toFixed(0)}%`, { isCorrect: isCorrect, explanation: currentQuestion.explanation }, checkBattleEnd);
                    }
                }
                updateUI();
            });
        } else {
            enemyBasicAttack(question);
        }
    });
}

function enemyBasicAttack(question) {
    showQuiz(question, async (isCorrect) => {
        if (isCorrect) {
            playSound('monster-attack-blocked');
            await sleep(200);
            setMonsterImage('happy');
            const reducedDamage = Math.floor(parseInt(currentMonster.attack) * player.interferenceMultiplier);
            player.hp = Math.max(0, player.hp - reducedDamage);
            updateUI();
            addBattleLog(`방어 성공! ${reducedDamage}의 데미지!`, '🛡️');
            showMessage(`방어 성공! ${reducedDamage}의 데미지를 받았다!`, { isCorrect: isCorrect, explanation: currentQuestion.explanation }, checkBattleEnd);
        } else {
            playSound('monster-attack-hit');
            await sleep(200);
            setMonsterImage('happy');
            shakeScreen();
            player.hp = Math.max(0, player.hp - parseInt(currentMonster.attack));
            updateUI();
            addBattleLog(`방어 실패! ${currentMonster.attack}의 데미지!`, '💥');
            showMessage(`방어 실패! ${currentMonster.attack}의 데미지를 받았다!`, { isCorrect: isCorrect, explanation: currentQuestion.explanation }, checkBattleEnd);
        }
    });
}

function getRandomQuestion() {
    const questionSet = currentMonster.questionSet;
    const allQuestionKeys = Object.keys(questionSet)
        .filter(k => k.startsWith('question') && questionSet[k]);
    
    if (allQuestionKeys.length === 0) {
        console.error("사용 가능한 문제가 없습니다!");
        return null;
    }
    
    const availableQuestions = allQuestionKeys.filter(
        key => !currentMonster.usedQuestions.includes(key)
    );
    
    if (availableQuestions.length === 0) {
        currentMonster.usedQuestions = [];
        return getRandomQuestion();
    }
    
    const randomKey = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    currentMonster.usedQuestions.push(randomKey);
    
    if (!currentMonster.questionCount[randomKey]) {
        currentMonster.questionCount[randomKey] = 0;
    }
    currentMonster.questionCount[randomKey]++;

    return randomKey;
}

function handleAction(action) {
    if (turn !== 'player' || isActionInProgress) return;

    if (isTutorialBattle) {
        removeTutorialOverlay(`button[data-action="${action}"]`);
    }

    isActionInProgress = true;
    toggleActionMenu(false);

    if (action === 'skill') {
        openSkillMenu();
        return;
    }
    if (action === 'item') {
        openItemMenu();
        return;
    }

    const randomKey = getRandomQuestion();
    if (!randomKey) {
        showMessage("몬스터가 낼 문제가 없습니다! (DB 확인 필요)", () => { startPlayerTurn(); });
        return;
    }
    const rawQuestion = currentMonster.questionSet[randomKey];
    const questionType = currentMonster.questionSet.type;
    const question = parseQuestion(rawQuestion, questionType);

    switch(action) {
        case 'attack':
            showQuiz(question, async (isCorrect) => {
                if (isCorrect) {
                    playSound('player-attack-hit');
                    await sleep(200);
                    shakeScreen();
                    setMonsterImage('hurt');
                    currentMonster.hp = Math.max(0, currentMonster.hp - player.attack);
                    updateUI();
                    addBattleLog(`공격 성공! ${player.attack}의 데미지!`, '⚔️');
                    showMessage(`공격 성공! ${player.attack}의 데미지!`, { isCorrect: isCorrect, explanation: currentQuestion.explanation }, checkBattleEnd);
                } else { 
                    playSound('player-attack-miss');
                    await sleep(200);
                    setMonsterImage('happy');
                    addBattleLog('공격이 빗나갔다...', '❌');
                    showMessage("공격이 빗나갔다...", { isCorrect: isCorrect, explanation: currentQuestion.explanation }, checkBattleEnd); 
                }
            });
            break;
        case 'skill': openSkillMenu(); break;
        case 'item': openItemMenu(); break;
        case 'flee':
            showQuiz(question, (isCorrect) => {
                if (isCorrect && Math.random() < 0.5) {
                    showMessage("도망치는데 성공했다!", () => { 
                        if (window.endBattle) {
                            window.endBattle();
                        }
                    });
                } else { 
                    showMessage("도망칠 수 없었다...", { isCorrect: isCorrect, explanation: currentQuestion.explanation }, checkBattleEnd); 
                }
            });
            break;
    }
}

function checkBattleEnd() {
    updateUI();
    
    if (isTutorialBattle) {
        if (player.hp <= 0) {
            gameOverMessageEl.textContent = "튜토리얼 전투에서 패배했습니다. 다시 시도해주세요.";
            gameOverEl.classList.remove('hidden'); 
            return;
        }
        if (currentMonster.hp <= 0) { // 승리
            tutorialBattleStep = 6; // ⭐ 6단계(전투 종료)로 강제 이동
            runTutorialBattleStep(tutorialBattleStep);
            return;
        }
        
        // 승패가 안 났으면, 다음 튜토리얼 스크립트로 이동
        setTimeout(() => {
            nextTutorialBattleStep();
        }, 1500);

    } else {
        if (player.hp <= 0) {
                isBattleLost = true; // [신규] 전투 패배 플래그 설정
                const penaltyRate = (Math.floor(Math.random() * 10) + 1) / 100;
                const goldPenalty = Math.floor(player.gold * penaltyRate);
                
                let pointsPenalty = 0;
                let pointTypeKey = '';
                let pointTypeName = '';

                if (currentMonster.affiliation === '품사') {
                    pointTypeKey = 'partsOfSpeech';
                    pointTypeName = '품사';
                } else if (currentMonster.affiliation === '문장 성분') {
                    pointTypeKey = 'sentenceComponents';
                    pointTypeName = '문장 성분';
                } else if (currentMonster.affiliation === '문장의 짜임') {
                    pointTypeKey = 'sentenceStructure';
                    pointTypeName = '문장의 짜임';
                } else if (currentMonster.affiliation === '형태소') {
                    pointTypeKey = 'morpheme';
                    pointTypeName = '형태소';
                }

                if (pointTypeKey && player.points[pointTypeKey] > 0) {
                    pointsPenalty = Math.floor(player.points[pointTypeKey] * penaltyRate);
                    player.points[pointTypeKey] -= pointsPenalty;
                }
                player.gold -= goldPenalty;

                let finalUserData = JSON.parse(localStorage.getItem('userData'));
                finalUserData.gold = player.gold;
                finalUserData.points = player.points;
                localStorage.setItem('userData', JSON.stringify(finalUserData));
                if (finalUserData.id) {
                    uploadUserData(finalUserData.id);
                }

                let penaltyMessage = `전투에서 패배하여 골드 ${goldPenalty} G`;
                if (pointsPenalty > 0) {
                    penaltyMessage += `와 ${pointTypeName} 포인트 ${pointsPenalty} P`;
                }
                penaltyMessage += '를 잃었습니다.';
                gameOverMessageEl.textContent = penaltyMessage;
                
                openModal(gameOverEl); 
                return;
            }
            
            if (currentMonster.hp <= 0) {
                const goldReward = parseInt(currentMonster.goldReward, 10) || 0;
                const pointReward = parseInt(currentMonster.pointReward, 10) || 0;
                dungeonRewards.gold += goldReward;

                let pointTypeKey = '';
                let pointTypeName = '';

                if (currentMonster.affiliation === '품사') {
                    pointTypeKey = 'partsOfSpeech';
                    pointTypeName = '품사';
                } else if (currentMonster.affiliation === '문장 성분') {
                    pointTypeKey = 'sentenceComponents';
                    pointTypeName = '문장 성분';
                } else if (currentMonster.affiliation === '문장의 짜임') {
                    pointTypeKey = 'sentenceStructure';
                    pointTypeName = '문장의 짜임';
                } else if (currentMonster.affiliation === '형태소') {
                    pointTypeKey = 'morpheme';
                    pointTypeName = '형태소';
                }

                if (pointTypeKey) {
                    if (!dungeonRewards.points[pointTypeKey]) {
                        dungeonRewards.points[pointTypeKey] = 0;
                    }
                    dungeonRewards.points[pointTypeKey] += pointReward;
                }

                const rewardText = `보상으로 ${goldReward} 골드와 ${pointTypeName} 포인트 ${pointReward} P를 획득했다!`;
                victoryMessageEl.innerHTML = `${currentMonster.name}를 쓰러트렸다!<br>${rewardText}`;
                openModal(victoryModal);
                return;
            }
            
            if (turn === 'player') startEnemyTurn();
            else startPlayerTurn();
    }
}

function openSkillMenu() {
    skillList.innerHTML = '';
    
    if (isTutorialBattle) {
        // (요구사항 6) 튜토리얼: S998 스킬만 표시 (DB에서 로드)
        const skill = skillDB.find(s => s.id === 'S998');
        if (!skill) {
             skillList.innerHTML = '<p>튜토리얼 스킬(S998)을 DB에서 찾을 수 없습니다.</p>';
        } else {
            const button = document.createElement('button');
            button.className = 'menu-item-btn';
            button.innerHTML = `${skill.name} <span class="item-quantity">MP ${skill.mpCost}</span><br><small>${skill.desc}</small>`;
            button.disabled = player.mp < skill.mpCost;
            button.onclick = () => useSkill(skill); // useSkill은 정상 호출
            skillList.appendChild(button);
            // (요구사항 4) 하이라이트
            button.style.boxShadow = '0 0 10px 3px var(--accent-color)';
        }
    } else {
        // [기존] 일반 모드
        player.equippedCards.forEach(cardId => {
            const card = cardDB.find(c => c.id === cardId);
            if (!card || !card.skillId) return;
            const skill = skillDB.find(s => s.id === card.skillId);
            if(!skill) return;
            const button = document.createElement('button');
            button.className = 'menu-item-btn';
            button.innerHTML = `${skill.name} <span class="item-quantity">MP ${skill.mpCost}</span><br><small>${skill.desc}</small>`;
            button.disabled = player.mp < skill.mpCost;
            button.onclick = () => useSkill(skill);
            skillList.appendChild(button);
        });
    }
    openModal(skillModal);
}

function useSkill(skill) {
    if (isTutorialBattle) {
        removeTutorialOverlay('.menu-item-btn'); // 스킬/아이템 모달의 버튼 선택자
    }

    closeModal();
    isActionInProgress = true;
    const randomKey = getRandomQuestion();
    if (!randomKey) {
        showMessage("몬스터가 낼 문제가 없습니다!", () => { startPlayerTurn(); });
        return;
    }
    const rawQuestion = currentMonster.questionSet[randomKey];
    const questionType = currentMonster.questionSet.type;
    const question = parseQuestion(rawQuestion, questionType);
    showQuiz(question, async (isCorrect) => {
        player.mp -= skill.mpCost;
        if (isCorrect) {
            setMonsterImage('hurt');
            if (skill.type === 1) { // Type 1: 공격
                playSound('player-skillat-hit');
                await sleep(200);
                shakeScreen();
                const damage = Math.floor(player.attack * skill.effect);
                currentMonster.hp = Math.max(0, currentMonster.hp - damage);
                addBattleLog(`${skill.name} 발동! ${damage} 데미지!`, '✨');
                showMessage(`${skill.name} 발동! ${damage}의 데미지!`, { isCorrect: isCorrect, explanation: currentQuestion.explanation }, checkBattleEnd);

            } else if (skill.type === 2) { // Type 2: 회복
                playSound('player-skillheal-hit');
                await sleep(200);
                player.hp = Math.min(player.maxHp, player.hp + skill.effect);
                addBattleLog(`${skill.name} 발동! HP ${skill.effect} 회복!`, '💚');
                showMessage(`${skill.name} 발동! HP를 ${skill.effect} 회복했다!`, { isCorrect: isCorrect, explanation: currentQuestion.explanation }, checkBattleEnd);

            } else if (skill.type === 3) { // Type 3: 공격력 일시 상승
                player.attack += skill.effect;
                playSound('player-skillheal-hit'); // (회복 효과음 재사용)
                await sleep(200);
                addBattleLog(`${skill.name} 발동! 공격력 ${skill.effect} 증가!`, '🔥');
                showMessage(`${skill.name} 발동! 공격력이 일시적으로 ${skill.effect}만큼 증가했다!`, { isCorrect: isCorrect, explanation: currentQuestion.explanation }, checkBattleEnd);

            } else if (skill.type === 4) { // Type 4: HP 일시 상승 (비율 유지)
                const hpPercent = player.hp / player.maxHp; // 현재 HP 비율 계산
                player.maxHp += skill.effect; // 최대 HP 증가
                player.hp = Math.round(player.maxHp * hpPercent); // 비율에 맞춰 현재 HP 증가
                playSound('player-skillheal-hit'); // (회복 효과음 재사용)
                await sleep(200);
                addBattleLog(`${skill.name} 발동! 최대 HP ${skill.effect} 증가!`, '💪');
                showMessage(`${skill.name} 발동! 최대 HP가 일시적으로 ${skill.effect}만큼 증가했다!`, { isCorrect: isCorrect, explanation: currentQuestion.explanation }, checkBattleEnd);

            } else if (skill.type === 5) { // Type 5: 방해/방어 효과 일시 상승
                const effectIncreasePercent = (skill.effect * 100).toFixed(0); // 1. 방해 효과 증가량 (예: 10%)

                player.interferenceMultiplier -= skill.effect;
                // 0% 미만으로 떨어지지 않도록 Clamping
                player.interferenceMultiplier = Math.max(0.2, player.interferenceMultiplier);
                
                const totalBlockPercent = (1 - player.interferenceMultiplier) * 100; // 2. 총 방해 효과 (예: 60%)

                playSound('player-skillheal-hit'); // (임의 효과음)
                await sleep(200);
                addBattleLog(`${skill.name} 발동! 방해/방어 효과 강화!`, '🛡️');
                // 3. 메시지 수정 (UI용)
                showMessage(`${skill.name} 발동! 방해/방어 효과가 ${effectIncreasePercent}% 상승했다!<br>현재 방해/방어 효과: ${totalBlockPercent.toFixed(0)}%`, { isCorrect: isCorrect, explanation: currentQuestion.explanation }, checkBattleEnd);
            }
        } else {
            setMonsterImage('happy');
            if (skill.type === 1){
                playSound('player-skillat-miss');
                await sleep(200);
            } else { /*일단 type 1(공격 스킬) 제외하고는 동일한 효과음 사용.*/
                playSound('player-skillheal-miss');
                await sleep(200);
            }
            addBattleLog('스킬 발동 실패...', '❌');
            showMessage("스킬 발동에 실패했다...", { isCorrect: isCorrect, explanation: currentQuestion.explanation }, checkBattleEnd);
        }
        updateUI();
    });
}

function openItemMenu() {
    itemList.innerHTML = ''; // [수정] 목록 초기화를 위로 이동

    if (isTutorialBattle) {
        // (요구사항 6) 튜토리얼: I001 아이템만 표시
        const item = itemDB.find(i => i.id === 'I001');
        const quantity = player.inventory[item.id] || 0;
        
        if (item && quantity > 0) {
             const button = document.createElement('button');
             button.className = 'menu-item-btn';
             button.innerHTML = `${item.name} <span class="item-quantity">x${quantity}</span><br><small>${item.desc}</small>`;
             button.onclick = () => useItem(item); // useItem은 정상 호출
             itemList.appendChild(button);
             // (요구사항 4) 하이라이트
             button.style.boxShadow = '0 0 10px 3px var(--accent-color)';
        } else {
             itemList.innerHTML = '<p>포션이 없습니다. (튜토리얼 오류)</p>';
        }

    } else {
        // [기존] 일반 모드
        const usableItems = Object.keys(player.inventory).filter(key => player.inventory[key] > 0);
        if (usableItems.length === 0) {
            showMessage("사용할 아이템이 없습니다.");
            setTimeout(() => { 
                toggleActionMenu(true); 
                isActionInProgress = false;
            }, 1500);
            return; // [수정] 모달을 열지 않고 리턴
        }
        
        usableItems.forEach(key => {
            const item = itemDB.find(i => i.id === key);
            if (!item) return;
            const quantity = player.inventory[key];
            const button = document.createElement('button');
            button.className = 'menu-item-btn';
            button.innerHTML = `${item.name} <span class="item-quantity">x${quantity}</span><br><small>${item.desc}</small>`;
            button.onclick = () => useItem(item);
            itemList.appendChild(button);
        });
    }
    openModal(itemModal);
}

async function useItem(item) {
    if (isTutorialBattle) {
        removeTutorialOverlay('.menu-item-btn'); // 스킬/아이템 모달의 버튼 선택자
    }

    closeModal();
    isActionInProgress = true;
    player.inventory[item.id]--;
    if (item.type === 1) {
        playSound('item-heal');
        await sleep(200);
        player.hp = Math.min(player.maxHp, player.hp + item.value);
        addBattleLog(`${item.name} 사용! HP ${item.value} 회복!`, '💊');
    } else if (item.type === 2) {
        playSound('item-heal');
        await sleep(200);
        player.mp = Math.min(player.maxMp, player.mp + item.value);
        addBattleLog(`${item.name} 사용! MP ${item.value} 회복!`, '💊');
    } else if (item.type === 3) {
        playSound('item-damage');
        await sleep(200);
        setMonsterImage('hurt');
        currentMonster.hp = Math.max(0, currentMonster.hp - item.value);
        shakeScreen();
        addBattleLog(`${item.name} 사용! ${item.value} 데미지!`, '💣');
    }
    updateUI();
    showMessage(`${item.name}을(를) 사용했다!`, checkBattleEnd);
}

function initGame() {
    preloadSounds();

    // [신규] 튜토리얼 플래그 확인
    isTutorialBattle = localStorage.getItem('isTutorialBattle') === 'true';
    localStorage.removeItem('isTutorialBattle'); // 플래그 즉시 제거

    if (!userData) {
        alert("사용자 정보를 불러올 수 없습니다. 메인 화면으로 돌아갑니다.");
        window.location.href = 'main.html';
        return;
    }
    
    // 튜토리얼 전투일 때는 가상 스펙 사용
    if (isTutorialBattle) {
        // 튜토리얼용 임시 데이터 로드
        const tutorialUserData = JSON.parse(localStorage.getItem('tutorialUserData'));
        
        player = { 
            name: userData.nickname || '용사',
            baseHp: 40,  // 튜토리얼 기본 HP
            baseMp: 20,  // 튜토리얼 기본 MP
            baseAttack: 10,  // 튜토리얼 기본 ATK
            ownedCards: tutorialUserData ? tutorialUserData.ownedCards : ['C001'],
            equippedCards: tutorialUserData ? tutorialUserData.equippedCards : ['C001'],
            inventory: tutorialUserData ? tutorialUserData.inventory : { 'I001': 1 },
            gold: 0,
            points: { partsOfSpeech: 0, sentenceComponents: 0 }
        };
    } else {
        // 일반 전투는 실제 유저 데이터 사용
        player = { 
            name: userData.nickname || '용사',
            baseHp: userData.baseHp || 80,
            baseMp: userData.baseMp || 50,
            baseAttack: userData.baseAttack || 15,
            ownedCards: userData.ownedCards || [],
            equippedCards: userData.equippedCards || [],
            inventory: userData.inventory || {},
            gold: userData.gold || 0,
            points: userData.points || { partsOfSpeech: 0, sentenceComponents: 0 }
        };
    }
    
    calculatePlayerStats();

    // conditionsMet 계산 (플레이어 성장 단계)
    let conditionsMet = 0;
    if (player.maxHp >= 50) conditionsMet++;
    if (player.maxHp >= 80) conditionsMet++;
    if (player.maxHp >= 160) conditionsMet++;
    if (player.maxHp >= 250) conditionsMet++;
    if (player.maxHp >= 350) conditionsMet++;
    if (player.maxHp >= 500) conditionsMet++;
    
    if (player.maxMp >= 50) conditionsMet++;
    if (player.maxMp >= 80) conditionsMet++;
    if (player.maxMp >= 160) conditionsMet++;
    if (player.maxMp >= 190) conditionsMet++;
    if (player.maxMp >= 250) conditionsMet++;
    if (player.maxMp >= 350) conditionsMet++;
    
    if (player.attack >= 30) conditionsMet++;
    if (player.attack >= 45) conditionsMet++;
    if (player.attack >= 70) conditionsMet++;
    if (player.attack >= 100) conditionsMet++;
    if (player.attack >= 140) conditionsMet++;
    if (player.attack >= 190) conditionsMet++;

    const playerImageEl = gameContainer.querySelector('#player-image');
    playerImageEl.src = `img/player${conditionsMet}.png`;

    player.hp = player.maxHp;
    player.mp = player.maxMp;
    player.interferenceMultiplier = 0.5;

    currentMonsterIndex = 0;
    dungeonQuestionHistory = []; // [추가] 던전 시작 시 문제 기록 초기화

    // 튜토리얼 전투일 때는 M998 몬스터만 사용
    if (isTutorialBattle) {
        const tutorialMonster = monsterDB.find(m => m.id === 'M998');
        if (tutorialMonster) {
            const possibleQuestionSetIds = parseQuestionPool(tutorialMonster.questionPool);
            let selectedQuestionSetId = null;

            if (possibleQuestionSetIds.length > 0) {
                // 2. 튜토리얼은 랜덤이 아니므로, 목록의 첫 번째 ID를 사용합니다.
                selectedQuestionSetId = possibleQuestionSetIds[0]; 
            }
            const questionsData = questionDB.find(q => q.id === selectedQuestionSetId);
            const newMonster = { ...tutorialMonster };
            newMonster.usedQuestions = [];
            newMonster.questionCount = {};
            newMonster.maxHp = newMonster.hp;
            
            if (questionsData) {
                newMonster.questionSet = questionsData;
            } else {
                console.error(`튜토리얼 몬스터 '${newMonster.name}'에 대한 Question DB를 찾을 수 없습니다.`);
                newMonster.questionSet = { type: '1', quizBank: [] };
            }
            
            monstersInDungeon = [newMonster];
        } else {
            alert("튜토리얼 몬스터(M998)를 찾을 수 없습니다.");
            window.location.href = 'main.html';
            return;
        }
    } else {
        // 일반 전투는 기존 로직 사용
        generateMonsters();
    }

    if (monstersInDungeon.length === 0) {
        messageTextEl.textContent = "던전에 출현할 몬스터가 없습니다!";
        toggleActionMenu(false);
        return;
    }

        // ⭐ setupMonster 함수 추가
    const setupMonster = (monsterData) => {
        const newMonster = { ...monsterData };
        newMonster.maxHp = parseInt(newMonster.hp, 10) || 50;
        newMonster.hp = newMonster.maxHp;
        newMonster.mp = parseInt(newMonster.mp, 10) || 10;
        newMonster.attack = parseInt(newMonster.attack, 10) || 10;
        return newMonster;
    };

    // ⭐ 튜토리얼이 아닐 때만 setupMonster 사용
    if (!isTutorialBattle) {
        currentMonster = setupMonster(monstersInDungeon[currentMonsterIndex]);
    } else {
        // 튜토리얼은 이미 설정됨
        currentMonster = monstersInDungeon[currentMonsterIndex];
        currentMonster.attack = parseInt(currentMonster.attack, 10) || 10;
    }
     
    playerNameEl.textContent = player.name;
    monsterNameEl.textContent = currentMonster.name;
    
    isActionInProgress = true;
    toggleActionMenu(false);

    // 이벤트 리스너 설정
    actionButtons.forEach(btn => btn.addEventListener('click', () => handleAction(btn.dataset.action)));
    
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
        btn.addEventListener('click', (event) => {
            const isInfoModalClose = event.target.closest('#info-modal');
            closeModal();
            
            // [수정] 튜토리얼 중이 아닐 때만 액션 메뉴 활성화
            if (!isInfoModalClose && !isTutorialBattle) {
                isActionInProgress = false;
                toggleActionMenu(true);
            }
        });
    });
    
    continueBattleBtn.addEventListener('click', () => {
        closeModal();
        currentMonsterIndex++;
        if (currentMonsterIndex >= monstersInDungeon.length) {
            let rewardsHTML = `<p>💰 골드: ${dungeonRewards.gold} G</p>`;
            const pointTypeNames = {
                partsOfSpeech: '품사',
                sentenceComponents: '문장 성분',
                morpheme: '형태소 포인트',
                sentenceStructure : '문장의 짜임'
            };
            for (const pointType in dungeonRewards.points) {
                const pointAmount = dungeonRewards.points[pointType];
                if (pointAmount > 0) {
                    const pointName = pointTypeNames[pointType] || pointType;
                    rewardsHTML += `<p>🅿️ ${pointName}: ${pointAmount} P</p>`;
                }
            }
            finalRewardsEl.innerHTML = rewardsHTML;
            openModal(dungeonClearEl);
        } else {
            currentMonster = setupMonster(monstersInDungeon[currentMonsterIndex]);
            monsterNameEl.textContent = currentMonster.name;
            updateProgressBar();
            addBattleLog(`${currentMonster.name} 등장!`, '👹');
            updateUI();
            startPlayerTurn();
        }
    });
    
returnToMainBtn.addEventListener('click', async () => {
        if (isReturningToMain) return;
        isReturningToMain = true;
        returnToMainBtn.disabled = true;

        try {
            // [수정] 전투 승리 시(isBattleLost === false)에만 보상 정산 로직 실행
            if (!isBattleLost) {
                const finalUserData = JSON.parse(localStorage.getItem('userData'));
                finalUserData.gold += dungeonRewards.gold;
                if (!finalUserData.points) {
                    finalUserData.points = {};
                }
                for (const pointType in dungeonRewards.points) {
                    if (!finalUserData.points[pointType]) {
                        finalUserData.points[pointType] = 0;
                    }
                    finalUserData.points[pointType] += dungeonRewards.points[pointType];
                }
                finalUserData.inventory = player.inventory;
                localStorage.setItem('userData', JSON.stringify(finalUserData));
                
                if (finalUserData.id) {
                    await uploadUserData(finalUserData.id);
                } else {
                    console.error("저장할 사용자 ID가 없습니다.");
                }
            }
            // 패배 시(isBattleLost === true)에는 이 try 블록을 건너뜀
            // 패널티 적용은 checkBattleEnd에서 이미 완료되었음
        } catch (error)
        {
            // [수정] 승리/패배 관계없이 오류가 발생할 수 있으므로 catch 블록은 유지
            console.error("보상 저장 또는 전투 종료 중 오류 발생:", error);
        } finally {
            if (window.endBattle) {
                window.endBattle();
            }
        }
    });

    reviewAllBtn.addEventListener('click', () => showQuizReview('all'));
    reviewWrongBtn.addEventListener('click', () => showQuizReview('wrong'));

    // [신규] 게임 오버 모달의 리뷰 버튼 리스너 추가
    const reviewAllGameOverBtn = battleModeContainer.querySelector('#review-all-gameover-btn');
    const reviewWrongGameOverBtn = battleModeContainer.querySelector('#review-wrong-gameover-btn');

    if (reviewAllGameOverBtn) {
        reviewAllGameOverBtn.addEventListener('click', () => showQuizReview('all', false)); // [신규] 패배(false) 플래그 전달
    }
    if (reviewWrongGameOverBtn) {
        reviewWrongGameOverBtn.addEventListener('click', () => showQuizReview('wrong', false)); // [신규] 패배(false) 플래그 전달
    }

    // [수정] infoBtn 리스너 (튜토리얼 5단계 처리를 위해)
    infoBtn.addEventListener('click', () => {
            const ownedCardCount = player.ownedCards.length;
        // --- (1) 보너스 설정 배열 (이 부분만 수정하세요) ---
        const tierBonuses = [
            { hp: 10, mp: 5, att: 10 },   // 10개 이상
            { hp: 20, mp: 10, att: 15 }, // 20개 이상
            { hp: 30, mp: 15, att: 20 },  // 30개 이상
            { hp: 40, mp: 20, att: 25 },  // 40개 이상
            { hp: 70, mp: 40, att: 50 },  // 50개 이상
            { hp: 60, mp: 30, att: 35 },  // 60개 이상
            { hp: 70, mp: 35, att: 40 },  // 70개 이상
            { hp: 80, mp: 40, att: 45 },  // 80개 이상
            { hp: 90, mp: 45, att: 50 },  // 90개 이상
            { hp: 120, mp: 70, att: 70 }  // 100개 이상
        ];

        // 1. 기본 보너스를 계산합니다.
        let collectionHpBonus = ownedCardCount * 1;
        let collectionMpBonus = Math.round(ownedCardCount * 0.5);
        let collectionAttackBonus = Math.round(ownedCardCount * 0.5);

        // 2. 10개 단위 티어(tier)를 계산합니다.
        // (예: 35개면 3티어, 9개면 0티어)
        const tiers = Math.floor(ownedCardCount / 10);
        
        // 3. 달성한 티어만큼 설정 배열을 순회하며 보너스를 누적합니다.
        for (let i = 0; i < tiers; i++) {
            
            // 설정 배열에 해당 티어의 보너스가 정의되어 있는지 확인
            if (tierBonuses[i]) {
                collectionHpBonus += tierBonuses[i].hp;
                collectionMpBonus += tierBonuses[i].mp;
                collectionAttackBonus += tierBonuses[i].att;
            }
        }
        let equippedHpBonus = 0;
        let equippedMpBonus = 0;
        let equippedAttackBonus = 0;

        player.equippedCards.forEach(cardId => {
            const card = cardDB.find(c => c.id === cardId);
            if (card) {
                equippedHpBonus += card.hpBonus;
                equippedMpBonus += card.mpBonus;
                equippedAttackBonus += card.attackBonus;
            }
        });

        const buffHp = player.maxHp - player.baseHp - collectionHpBonus - equippedHpBonus;
        const buffMp = player.maxMp - player.baseMp - collectionMpBonus - equippedMpBonus;
        const buffAttack = player.attack - player.baseAttack - collectionAttackBonus - equippedAttackBonus;

        // ✅ (5) 장착 카드 목록 HTML 생성
        let equippedCardsHTML = '';
        if (player.equippedCards.length === 0) {
            equippedCardsHTML = '<div class="empty-state">장착된 카드가 없습니다</div>';
        } else {
            equippedCardsHTML = '<div class="card-list">';
            player.equippedCards.forEach(cardId => {
                const card = cardDB.find(c => c.id === cardId);
                if (card) {
                    equippedCardsHTML += `<div class="card-tag">${card.name}</div>`;
                }
            });
            equippedCardsHTML += '</div>';
        }

        // ✅ (5) 구조화된 정보 표시
        infoList.innerHTML = `
            <div class="info-section">
                <div class="section-title">⚔️ 전투 능력치</div>
                <div class="info-row">
                    <span class="info-label">최대 HP</span>
                    <span class="info-value">${player.maxHp}</span>
                </div>
                <div class="info-row" style="font-size: 0.85em; color: #999; padding-left: 20px; padding-top: 0;">
                    <span>기본 ${player.baseHp} + 도감 ${collectionHpBonus} + 장착 ${equippedHpBonus} + 부가 ${buffHp}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">최대 MP</span>
                    <span class="info-value">${player.maxMp}</span>
                </div>
                <div class="info-row" style="font-size: 0.85em; color: #999; padding-left: 20px; padding-top: 0;">
                    <span>기본 ${player.baseMp} + 도감 ${collectionMpBonus} + 장착 ${equippedMpBonus} + 부가 ${buffMp}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">공격력</span>
                    <span class="info-value">${player.attack}</span>
                </div>
                <div class="info-row" style="font-size: 0.85em; color: #999; padding-left: 20px; padding-top: 0;">
                    <span>기본 ${player.baseAttack} + 도감 ${collectionAttackBonus} + 장착 ${equippedAttackBonus} + 부가 ${buffAttack}</span>
                </div>
            </div>

            <div class="info-section">
                <div class="section-title">💰 보유 자원</div>
                <div class="info-row">
                    <span class="info-label">골드</span>
                    <span class="info-value">${player.gold} G</span>
                </div>
                <div class="info-row">
                    <span class="info-label">품사</span>
                    <span class="info-value">${player.points.partsOfSpeech || 0} P</span>
                </div>
                <div class="info-row">
                    <span class="info-label">문장 성분</span>
                    <span class="info-value">${player.points.sentenceComponents || 0} P</span>
                </div>
                <div class="info-row">
                    <span class="info-label">형태소</span>
                    <span class="info-value">${player.points.morpheme || 0} P</span>
                </div>
                    <div class="info-row">
                    <span class="info-label">문장의 짜임</span>
                    <span class="info-value">${player.points.sentenceStructure || 0} P</span>
                </div>
            </div>

            <div class="info-section">
                <div class="section-title">🎴 장착 카드 (${player.equippedCards.length}/4)</div>
                ${equippedCardsHTML}
            </div>

            <div class="info-section">
                <div class="section-title">📊 컬렉션</div>
                <div class="info-row">
                    <span class="info-label">보유 카드 수</span>
                    <span class="info-value">${ownedCardCount}장</span>
                </div>
            </div>
        `;
        
        openModal(infoModal);
    });
    
    updateProgressBar();
    updateUI();
    
    // [수정] 턴 시작 로직
    if (isTutorialBattle) {
        tutorialBattleStep = 1;
        runTutorialBattleStep(tutorialBattleStep); // 튜토리얼 1단계 시작
    } else {
        startPlayerTurn(); // 일반 전투 시작
    }
}

initGame();

// ... initGame(); 바로 아래에 추가 ...

function runTutorialBattleStep(step) {
    toggleActionMenu(false);
    isActionInProgress = false;
    turn = 'player';
    updateTurnIndicator('player');
    let message = "";
    
    switch(step) {
        case 1: // (1) 유저 공격
            actionButtons.forEach(btn => {
                if (btn.dataset.action === 'attack') {
                    btn.disabled = false;
                    showTutorialOverlay("전투 시작! '공격' 버튼을 눌러 몬스터를 공격하세요.", `button[data-action="attack"]`);
                }
            });
            break;
        case 2: // (2) 몬스터 공격(방어)
            message = "몬스터가 반격합니다! 문제를 맞추면 '방어'에 성공해 피해가 50% 줄어듭니다!";
            setTimeout(() => startEnemyTurn(null), 2500);
            break;
        case 3: // (3) 유저 아이템 사용(회복)
            actionButtons.forEach(btn => {
                if (btn.dataset.action === 'item') {
                    btn.disabled = false;
                    showTutorialOverlay("피해를 너무 많이 입었네요. '아이템'을 사용해서 HP를 회복하세요.", `button[data-action="item"]`);
                }
            });
            break;
        case 4: // (4) 몬스터 스킬 사용(방해)
            message = "몬스터가 스킬을 사용합니다! 문제를 맞추면 '방해'에 성공해 피해나 회복량이 50% 줄어듭니다!";
            setTimeout(() => startEnemyTurn('S997'), 2500);
            break;
        case 5: // (5) 유저 스킬 사용 (끝)
            actionButtons.forEach(btn => {
                if (btn.dataset.action === 'skill') {
                    btn.disabled = false;
                    showTutorialOverlay("마지막입니다! '스킬'을 사용해서 몬스터를 쓰러뜨리세요!", `button[data-action="skill"]`);
                }
            });
            break;
        case 6: // (6) 전투 종료
            message = "튜토리얼 전투에서 승리했습니다! 메인 화면으로 돌아갑니다.";
            setTimeout(() => {
                if (window.endBattle) window.endBattle(true);
            }, 1500);
            break;
    }
    
    if (message) {
        showMessage(message);
    }
}

/** 튜토리얼 전투 다음 단계로 진행 */
function nextTutorialBattleStep() {
    if (!isTutorialBattle) return;
    tutorialBattleStep++;
    runTutorialBattleStep(tutorialBattleStep);
}


function runRandomTest(questionId, iterations = 100) {
    const questionSet = questionDB.find(q => q.id === questionId);
    if (!questionSet) {
        console.error(`'${questionId}' ID를 가진 문제 세트를 찾을 수 없습니다.`);
        return;
    }

    const questionKeys = Object.keys(questionSet).filter(k => k.startsWith('question') && questionSet[k]);
    if (questionKeys.length === 0) {
        console.error(`'${questionId}' 문제 세트에 유효한 문제가 없습니다.`);
        return;
    }

    console.log(`--- 무작위 추출 테스트 시작 (총 ${iterations}회) ---`);
    console.log(`테스트 대상: ${questionId} (유효 문항 수: ${questionKeys.length}개)`);
    
    const results = {};
    questionKeys.forEach(key => { results[key] = 0; });

    for (let i = 0; i < iterations; i++) {
        const randomKey = questionKeys[Math.floor(Math.random() * questionKeys.length)];
        results[randomKey]++;
    }

    console.log("--- 테스트 결과 ---");
    console.log("각 문제가 선택된 횟수:");
    console.table(results);
}

window.runRandomTest = runRandomTest;
// [임시 디버그 기능]
    window.matk = function() {
        if (currentMonster) {
            console.log(`현재 몬스터(${currentMonster.name})의 공격력: ${currentMonster.attack}`);
        } else {
            console.log("현재 몬스터가 없습니다.");
        }
    };

    /**
     * [신규] 문제 리뷰 모달을 생성하고 표시하는 함수
     * @param {'all' | 'wrong'} filter - 'all' (모든 문제) 또는 'wrong' (오답 문제만)
     */
    function showQuizReview(filter, isVictory = true) {
        // 1. 필터링
        let questionsToShow = [];
        if (filter === 'all') {
            quizReviewTitle.textContent = `모든 문제 다시보기 (${dungeonQuestionHistory.length}개)`;
            questionsToShow = dungeonQuestionHistory;
        } else { // 'wrong'
            questionsToShow = dungeonQuestionHistory.filter(item => !item.isCorrect);
            quizReviewTitle.textContent = `오답 문제 다시보기 (${questionsToShow.length}개)`;
        }
    
        // 2. HTML 생성
        quizReviewList.innerHTML = '';
        if (questionsToShow.length === 0) {
            quizReviewList.innerHTML = '<p style="text-align: center; padding: 20px 0;">해당하는 문제가 없습니다.</p>';
        } else {
            questionsToShow.forEach((item, index) => {
                const q = item.question;
                const isCorrect = item.isCorrect;
    
                const itemEl = document.createElement('div');
                itemEl.className = 'quiz-review-item';
                itemEl.style.cssText = `
                    padding: 15px; 
                    margin-bottom: 10px; 
                    border: 1px solid ${isCorrect ? 'var(--hp-color)' : '#c74343'}; 
                    border-left-width: 5px; 
                    background: none; /* [수정] (5) 배경색 제거 */
                    border-radius: 5px;
                `;
    
                const displayPrompt = q.prompt.replace(/@(.*?)@/g, '<u>$1</u>').replace(/▽/g, '<br>');
                const displayContext = q.context ? q.context.replace(/@(.*?)@/g, '<u>$1</u>').replace(/▽/g, '<br>') : '';
                const formattedAnswer = q.correctAnswer.replace(/@(.*?)@/g, '<u>$1</u>');
                const explanation = q.explanation || '';
    
                itemEl.innerHTML = `
                    <p style="font-weight: bold; margin-bottom: 8px;">Q${index + 1}. ${displayPrompt}</p>
                    ${displayContext ? `<p style="background: #2a2a2a; padding: 8px; border-radius: 4px; margin-bottom: 8px;">${displayContext}</p>` : ''}
                    
                    <div style="margin-top: 10px; padding: 10px; background-color: rgba(76, 175, 80, 0.1); border-left: 3px solid var(--hp-color); text-align: left;">
                        <strong>정답:</strong> ${formattedAnswer}
                    </div>
                    ${explanation ? `
                    <div style="margin-top: 8px; padding: 10px; background-color: rgba(255,193,7,0.1); border-left: 3px solid var(--accent-color); text-align: left;">
                        <strong>해설:</strong> ${explanation}
                    </div>
                    ` : ''}
                `;
                quizReviewList.appendChild(itemEl);
            });
        }
    
        // 3. 모달 전환
        if (isVictory) {
            dungeonClearEl.classList.add('hidden'); // '던전 클리어' 모달 숨기기
            returnToMainBtn.textContent = '돌아가기'; // [수정] 승리 시 텍스트
        } else {
            gameOverEl.classList.add('hidden'); // [신규] '게임 오버' 모달 숨기기
            returnToMainBtn.textContent = '돌아가기'; // [수정] 패배 시 텍스트
        }
        openModal(quizReviewModal); // '리뷰' 모달 열기
    }

})();