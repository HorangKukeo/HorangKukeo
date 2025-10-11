(function() {
    const sfxCache = {}; // 오디오 객체를 저장할 저장소
    const sfxToPreload = [ // 미리 불러올 효과음 파일 이름 목록
        'player-attack-hit',
        'player-attack-miss',
        'player-skillat-hit',
        'player-skillat-miss',
        'player-skillheal-hit',
        'player-skillheal-miss',
        'monster-attack-hit',
        'monster-attack-blocked',
        'monster-skillat-hit',
        'monster-skillat-miss',
        'monster-skillheal-hit',
        'monster-skillheal-miss',
        'item-heal', 'item-damage'
    ];

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function preloadSounds() {
            sfxToPreload.forEach(soundName => {
                const audio = new Audio(`sfx/${soundName}.mp3`);
                audio.load(); // 파일을 미리 로드하도록 브라우저에 요청
                sfxCache[soundName] = audio;
            });
        }

    function playSound(soundName) {
        const audio = sfxCache[soundName];
        if (audio) {
            audio.currentTime = 0; // 소리를 처음부터 다시 재생
            audio.volume = 0.5;
            audio.play();
        } else {
            console.warn(`'${soundName}' 효과음을 찾을 수 없습니다.`);
        }
    }

    function shakeScreen() {
        // 흔들림 효과를 적용할 대상을 gameContainer로 지정
        gameContainer.classList.add('shake');

        // 애니메이션이 끝나면 'shake' 클래스를 자동으로 제거하여 다음을 준비
        gameContainer.addEventListener('animationend', () => {
            gameContainer.classList.remove('shake');
        }, { once: true });
    }

const battleModeContainer = document.querySelector('#battle-mode-container');

    // --- 게임 영역 내부 요소들 ---
    // 게임의 핵심 UI는 battleModeContainer 안의 #game-container에서 찾습니다.
    const gameContainer = battleModeContainer.querySelector('#game-container');
    const monsterImageEl = gameContainer.querySelector('#monster-image');
    const infoBtn = gameContainer.querySelector('#info-btn');
    const monsterNameEl = gameContainer.querySelector('#monster-name');
    const monsterHpBar = gameContainer.querySelector('#monster-hp-bar');
    const monsterHpText = gameContainer.querySelector('#monster-hp-text');
    const playerNameEl = gameContainer.querySelector('#player-name');
    const playerHpBar = gameContainer.querySelector('#player-hp-bar');
    const playerHpText = gameContainer.querySelector('#player-hp-text');
    const playerMpBar = gameContainer.querySelector('#player-mp-bar');
    const playerMpText = gameContainer.querySelector('#player-mp-text');
    const messageBox = gameContainer.querySelector('#message-box');
    const messageTextEl = gameContainer.querySelector('#message-text');
    const quizBox = gameContainer.querySelector('#quiz-box');
    const quizTextEl = gameContainer.querySelector('#quiz-text');
    const quizAnswersEl = gameContainer.querySelector('#quiz-answers');
    const actionMenu = gameContainer.querySelector('#action-menu');
    const actionButtons = gameContainer.querySelectorAll('.action-btn');
    const equippedCardsEl = gameContainer.querySelector('#equipped-cards');
    
    // --- 모달 등 게임 영역 외부 요소들 ---
    // 모달 창들은 battleModeContainer 바로 아래에 있으므로 여기서 찾습니다.
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
    const returnToMainFromGameOverBtn = battleModeContainer.querySelector('#return-to-main-from-gameover-btn');

// === 데이터 로딩 (localStorage에서) ===
const cardDB = JSON.parse(localStorage.getItem('cardDB')) || [];
const skillDB = JSON.parse(localStorage.getItem('skillDB')) || [];
const itemDB = JSON.parse(localStorage.getItem('itemDB')) || [];
const monsterDB = JSON.parse(localStorage.getItem('monsterDB')) || [];
const dungeonDB = JSON.parse(localStorage.getItem('dungeonDB')) || [];
const questionDB = JSON.parse(localStorage.getItem('questionDB')) || [];
const userData = JSON.parse(localStorage.getItem('userData'));
const selectedDungeonId = localStorage.getItem('selectedDungeonId');

// === 데이터 구조 초기화 ===
let player = {};
let monstersInDungeon = [];
let currentMonster;
let currentMonsterIndex = 0;
let dungeonRewards = { gold: 0, points: {} };
let turn = 'player';
let onQuizComplete = null;
let isActionInProgress = false;
let isReturningToMain = false;

// === 헬퍼 및 UI 함수 ===
function calculatePlayerStats() {
    const ownedCardCount = player.ownedCards.length;
    const collectionHpBonus = ownedCardCount * 1;
    const collectionMpBonus = Math.round(ownedCardCount * 0.5);
    const collectionAttackBonus = Math.round(ownedCardCount * 0.5);

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
    playerHpText.textContent = `${player.hp} / ${player.maxHp}`;
    playerHpBar.style.width = `${(player.hp / player.maxHp) * 100}%`;
    playerMpText.textContent = `${player.mp} / ${player.maxMp}`;
    playerMpBar.style.width = `${(player.mp / player.maxMp) * 100}%`;
    monsterHpText.textContent = `${currentMonster.hp} / ${currentMonster.maxHp}`;
    monsterHpBar.style.width = `${(currentMonster.hp / currentMonster.maxHp) * 100}%`;
    const cardSlots = equippedCardsEl.querySelectorAll('.card-slot');
    cardSlots.forEach((slot, index) => {
        const cardId = player.equippedCards[index];
        const card = cardDB.find(c => c.id === cardId);
        if (card) {
            slot.textContent = card.name;
            slot.classList.remove('empty');
        } else {
            slot.textContent = '비어있음';
            slot.classList.add('empty');
        }
    });
}
function shuffleArray(array) { for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[array[i], array[j]] = [array[j], array[i]];} return array;}
function showMessage(text, explanationOrCallback, callback) {
    messageBox.classList.remove('hidden');
    quizBox.classList.add('hidden');
    
    // 두 번째 파라미터가 함수인지 문자열인지 판별
    let explanation = '';
    let finalCallback = null;
    
    if (typeof explanationOrCallback === 'function') {
        // 기존 방식: showMessage(text, callback)
        finalCallback = explanationOrCallback;
    } else if (typeof explanationOrCallback === 'string') {
        // 새 방식: showMessage(text, explanation, callback)
        explanation = explanationOrCallback;
        finalCallback = callback;
    }
    
    let fullMessage = text;
    if (explanation) {
        fullMessage += `<br><br><div style="margin-top: 15px; padding: 10px; background-color: rgba(255,193,7,0.2); border-left: 3px solid var(--accent-color); text-align: left;"><strong>💡 해설:</strong> ${explanation}</div>`;
    }
    
    messageTextEl.innerHTML = fullMessage;
    
    if (finalCallback) { 
        setTimeout(finalCallback, explanation ? 4000 : 1500);
    }
}

let currentQuestion = null;
function parseQuestion(questionString, questionType) {
    const parts = questionString.split('⊥');
    const questionData = { type: questionType };

    if (questionType === '1') { // 객관식
        questionData.prompt = parts[0];
        questionData.context = parts[1];
        questionData.choices = [parts[2], parts[3], parts[4], parts[5]];
        const correctIndex = parseInt(parts[6], 10) - 1;
        if (correctIndex >= 0 && correctIndex < questionData.choices.length) {
            questionData.correctAnswer = questionData.choices[correctIndex];
        } else {
            questionData.correctAnswer = questionData.choices[0]; 
        }
        questionData.explanation = parts[7] || ''; // 해설 추가
    } else if (questionType === '2') { // 주관식
        questionData.prompt = parts[0];
        questionData.context = parts[1];
        questionData.correctAnswer = parts[2];
        questionData.explanation = parts[3] || ''; // 해설 추가
    }
    
    return questionData;
}

function showQuiz(question, callback) {
    messageBox.classList.add('hidden');
    quizBox.classList.remove('hidden');
    onQuizComplete = callback;
    currentQuestion = question;

    const displayContext = question.context.replace(/@(.*?)@/g, '<u>$1</u>');
    quizTextEl.innerHTML = `${question.prompt}<br><br>"${displayContext}"`;
    
    // UI 요소 가져오기
    const quizAnswers = quizBox.querySelector('#quiz-answers');
    const shortAnswerArea = quizBox.querySelector('#quiz-short-answer-area');
    const shortAnswerInput = quizBox.querySelector('#short-answer-input');
    const shortAnswerSubmitBtn = quizBox.querySelector('#short-answer-submit-btn');

    if (question.type === '1') { // 타입 1: 객관식 UI 표시
        quizAnswers.classList.remove('hidden');
        shortAnswerArea.classList.add('hidden');
        quizAnswers.innerHTML = '';
        
        const shuffledChoices = shuffleArray([...question.choices]);
        shuffledChoices.forEach(choice => {
            const button = document.createElement('button');
            button.className = 'quiz-btn';
            button.textContent = choice;
            button.onclick = () => handleQuizAnswer(choice === question.correctAnswer);
            quizAnswers.appendChild(button);
        });

        } else if (question.type === '2') { // 타입 2: 주관식 UI 표시
            quizAnswers.classList.add('hidden');
            shortAnswerArea.classList.remove('hidden');
            
            shortAnswerInput.value = '';
            shortAnswerInput.disabled = false; // 활성화
            shortAnswerInput.focus();
            
            shortAnswerSubmitBtn.disabled = false; // 활성화
            
            const submitAnswer = () => {
                const userAnswer = shortAnswerInput.value.trim();
                handleQuizAnswer(userAnswer === question.correctAnswer);
            };

            // 기존 이벤트 리스너 제거 (중복 방지)
            shortAnswerSubmitBtn.onclick = null;
            shortAnswerInput.onkeypress = null;

            // 새 이벤트 리스너 추가
            shortAnswerSubmitBtn.onclick = submitAnswer;
            shortAnswerInput.onkeypress = (event) => {
                if (event.key === 'Enter') {
                    submitAnswer();
                }
            };
        }
}

function handleQuizAnswer(isCorrect) {
    // 객관식 버튼만 비활성화
    const quizAnswersButtons = quizAnswersEl.querySelectorAll('.quiz-btn');
    quizAnswersButtons.forEach(btn => btn.disabled = true);
    
    // 주관식 입력도 비활성화
    const shortAnswerInput = quizBox.querySelector('#short-answer-input');
    const shortAnswerSubmitBtn = quizBox.querySelector('#short-answer-submit-btn');
    if (shortAnswerInput) shortAnswerInput.disabled = true;
    if (shortAnswerSubmitBtn) shortAnswerSubmitBtn.disabled = true;
    
    if (onQuizComplete) { 
        onQuizComplete(isCorrect);
    }
}

function toggleActionMenu(enabled) { actionButtons.forEach(btn => btn.disabled = !enabled); }
function setMonsterImage(state) {
    // 현재 몬스터의 img 속성 값을 가져오고, 만약 없다면 기본값으로 'monster'를 사용
    const imgBaseName = currentMonster.img || 'monster';
    monsterImageEl.src = `img/${imgBaseName}-${state}.png`;
}
function openModal(modal) { modalBackdrop.classList.remove('hidden'); modal.classList.remove('hidden'); }
function closeModal() { modalBackdrop.classList.add('hidden'); skillModal.classList.add('hidden'); itemModal.classList.add('hidden'); victoryModal.classList.add('hidden'); infoModal.classList.add('hidden'); }
function generateMonsters() {
    const selectedDungeon = dungeonDB.find(d => d.id === selectedDungeonId);
    if (!selectedDungeon) { 
        console.error("선택된 던전 정보 없음:", selectedDungeonId); 
        monstersInDungeon = []; 
        return; 
    }
    const monsterIds = [selectedDungeon.monster1Id, selectedDungeon.monster2Id, selectedDungeon.monster3Id, selectedDungeon.monster4Id, selectedDungeon.monster5Id].filter(id => id);
    monstersInDungeon = monsterIds.map(id => {
        const monsterData = monsterDB.find(monster => monster.id === id);
        if (monsterData) {
            const questionsData = questionDB.find(q => q.id === monsterData.questionId);
            const newMonster = { ...monsterData };
            
            // ✨ 수정: 중복 방지용 배열
            newMonster.usedQuestions = [];
            
            // ✨ 추가: 출제 횟수 카운트용 객체
            newMonster.questionCount = {};
            
            if (questionsData) {
                newMonster.questionSet = questionsData;
            } else {
                console.error(`몬스터 '${newMonster.name}'(ID: ${id})에 대한 Question DB(ID: ${newMonster.questionId})를 찾을 수 없습니다.`);
                newMonster.questionSet = { type: '1', quizBank: [] };
            }
            return newMonster;
        }
        return null;
    }).filter(monster => monster);
}

// === 전투 로직 ===
function startPlayerTurn() {turn = 'player';setMonsterImage('idle');showMessage("당신의 턴입니다.", () => {messageBox.classList.add('hidden');toggleActionMenu(true);isActionInProgress = false;});}
function startEnemyTurn() {
    turn = 'enemy';
    toggleActionMenu(false);
    setMonsterImage('idle');
    showMessage("몬스터의 턴입니다.", () => {
        const randomKey = getRandomQuestion();
        if (!randomKey) {
            showMessage("몬스터가 낼 문제가 없어 행동을 하지 못합니다.", checkBattleEnd);
            return;
        }

        const rawQuestion = currentMonster.questionSet[randomKey];
        const questionType = currentMonster.questionSet.type; // 타입 가져오기
        const question = parseQuestion(rawQuestion, questionType); // 타입과 함께 전달
        const monsterSkills = [currentMonster.skillId1, currentMonster.skillId2, currentMonster.skillId3].filter(id => id).map(id => skillDB.find(s => s.id === id)).filter(skill => skill && parseInt(currentMonster.mp) >= parseInt(skill.mpCost));
        const willUseSkill = monsterSkills.length > 0 && Math.random() < 0.5;
        if (willUseSkill) {
            const skillToUse = monsterSkills[Math.floor(Math.random() * monsterSkills.length)];
            currentMonster.mp -= parseInt(skillToUse.mpCost);
            showQuiz(question, async (isCorrect) => {
            if (isCorrect) {
                // ========== 플레이어가 퀴즈를 맞혔을 경우 (방해 성공) ==========
                setMonsterImage('hurt');

                if (skillToUse.type == 1) { // 몬스터의 공격 스킬
                    playSound('monster-skillat-miss'); // [효과음 추가]
                    await sleep(200);
                    const damage = Math.floor(parseInt(currentMonster.attack) * parseFloat(skillToUse.effect));
                    const finalDamage = Math.floor(damage * 0.5);
                    player.hp = Math.max(0, player.hp - finalDamage);
                    showMessage(`방해 성공! 몬스터의 ${skillToUse.name} 데미지가 ${finalDamage}로 감소!`, currentQuestion.explanation, checkBattleEnd);

                } else if (skillToUse.type == 2) { // 몬스터의 회복 스킬
                    playSound('monster-skillheal-miss'); // [효과음 추가] (동일한 방해 효과음 사용)
                    await sleep(200);
                    const healAmount = Math.floor(parseInt(skillToUse.effect) * 0.5);
                    currentMonster.hp = Math.min(currentMonster.maxHp, currentMonster.hp + healAmount);
                    showMessage(`방해 성공! 몬스터가 ${skillToUse.name}으로 HP를 ${healAmount}만 회복!`, currentQuestion.explanation, checkBattleEnd);
                }

            } else {
                // ========== 플레이어가 퀴즈를 틀렸을 경우 (방해 실패) ==========
                setMonsterImage('happy');

                if (skillToUse.type == 1) { // 몬스터의 공격 스킬
                    playSound('monster-skillat-hit'); // [효과음 추가]
                    await sleep(200);
                    shakeScreen();
                    const damage = Math.floor(parseInt(currentMonster.attack) * parseFloat(skillToUse.effect));
                    const finalDamage = damage;
                    player.hp = Math.max(0, player.hp - finalDamage);
                    showMessage(`몬스터의 ${skillToUse.name}! ${finalDamage}의 데미지!`, currentQuestion.explanation, checkBattleEnd);

                } else if (skillToUse.type == 2) { // 몬스터의 회복 스킬
                    playSound('monster-skillheal-hit'); // [효과음 추가]
                    await sleep(200);
                    const healAmount = parseInt(skillToUse.effect);
                    currentMonster.hp = Math.min(currentMonster.maxHp, currentMonster.hp + healAmount);
                    showMessage(`몬스터가 ${skillToUse.name}으로 HP를 ${healAmount} 회복!`, currentQuestion.explanation, checkBattleEnd);
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
            playSound('monster-attack-blocked'); // [효과음 추가]
            await sleep(200);
            setMonsterImage('hurt');
            const reducedDamage = Math.floor(parseInt(currentMonster.attack) * 0.5);
            player.hp = Math.max(0, player.hp - reducedDamage);
            updateUI();
            showMessage(`방어 성공! ${reducedDamage}의 데미지를 받았다!`, currentQuestion.explanation, checkBattleEnd);
        } else {
            playSound('monster-attack-hit'); // [효과음 추가]
            await sleep(200);
            setMonsterImage('happy');
            shakeScreen();
            player.hp = Math.max(0, player.hp - parseInt(currentMonster.attack));
            updateUI();
            showMessage(`방어 실패! ${currentMonster.attack}의 데미지를 받았다!`, currentQuestion.explanation, checkBattleEnd);
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
    
    // 현재 몬스터에서 아직 사용하지 않은 문제 찾기
    const availableQuestions = allQuestionKeys.filter(
        key => !currentMonster.usedQuestions.includes(key)
    );
    
    // 사용 안 한 문제가 없으면 초기화
    if (availableQuestions.length === 0) {
        /*console.log(`${currentMonster.name}의 모든 문제를 사용했습니다. 문제 목록을 초기화합니다.`);*/
        currentMonster.usedQuestions = [];
        return getRandomQuestion();
    }
    
    // 사용 안 한 문제 중에서 랜덤 선택
    const randomKey = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    currentMonster.usedQuestions.push(randomKey);
    
        // ✨ 추가: 출제 횟수 카운트
    if (!currentMonster.questionCount[randomKey]) {
        currentMonster.questionCount[randomKey] = 0;
    }
    currentMonster.questionCount[randomKey]++;
    
    /*// ✨ 추가: 콘솔에 현재 통계 출력
    console.log(`%c[문제 출제] ${currentMonster.name}`, 'color: #4CAF50; font-weight: bold;');
    console.log(`선택된 문제: ${randomKey} (${currentMonster.questionCount[randomKey]}번째 출제)`);
    console.log(`남은 미출제 문제: ${availableQuestions.length - 1}개`);
    console.table(currentMonster.questionCount);*/

    return randomKey;
}

function handleAction(action) {
    if (turn !== 'player' || isActionInProgress) return;
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
    const questionType = currentMonster.questionSet.type; // 타입 가져오기
    const question = parseQuestion(rawQuestion, questionType); // 타입과 함께 전달

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
                    showMessage(`공격 성공! ${player.attack}의 데미지!`, currentQuestion.explanation, checkBattleEnd);
                } else { 
                    playSound('player-attack-miss');
                    await sleep(200);
                    setMonsterImage('happy');
                    showMessage("공격이 빗나갔다...", currentQuestion.explanation, checkBattleEnd); 
                }
            });
            break;
        case 'skill': openSkillMenu(); break;
        case 'item': openItemMenu(); break;
        case 'flee':
            showQuiz(question, (isCorrect) => {
                if (isCorrect && Math.random() < 0.5) {
                    showMessage("도망치는데 성공했다!", () => { window.location.href = 'main.html'; });
                } else { 
                    showMessage("도망칠 수 없었다...", currentQuestion.explanation, checkBattleEnd); 
                }
            });
            break;
    }
}
function checkBattleEnd() {
    updateUI();
    if (player.hp <= 0) {
        // 1. 페널티 계산 (1~10% 사이의 랜덤 값)
        const penaltyRate = (Math.floor(Math.random() * 10) + 1) / 100; // 0.01 ~ 0.1
        const goldPenalty = Math.floor(player.gold * penaltyRate);
        const pointsPenalty = Math.floor(player.points.partsOfSpeech * penaltyRate);

        // 2. 페널티 적용
        player.gold -= goldPenalty;
        player.points.partsOfSpeech -= pointsPenalty;

        // 3. 변경된 유저 데이터 저장 (던전 보상은 더하지 않음)
        let finalUserData = JSON.parse(localStorage.getItem('userData'));
        finalUserData.gold = player.gold;
        finalUserData.points.partsOfSpeech = player.points.partsOfSpeech;
        localStorage.setItem('userData', JSON.stringify(finalUserData));
        if (finalUserData.id) {
            uploadUserData(finalUserData.id);
        }

        // 4. 게임 오버 메시지 표시
        gameOverMessageEl.textContent = `전투에서 패배하여 골드 ${goldPenalty} G와 품사 포인트 ${pointsPenalty} P를 잃었습니다.`;
        
        gameOverEl.classList.remove('hidden'); 
        return; 
        // [수정 끝]
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
        }

        if (pointTypeKey) {
            // 만약 해당 포인트 종류가 처음 누적되는 것이라면, 초기화
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
function openSkillMenu() {
    skillList.innerHTML = '';
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
    openModal(skillModal);
}
function useSkill(skill) {
    closeModal();
    isActionInProgress = true;
    const randomKey = getRandomQuestion();
    if (!randomKey) {
        showMessage("몬스터가 낼 문제가 없습니다!", () => { startPlayerTurn(); });
        return;
    }
    const rawQuestion = currentMonster.questionSet[randomKey];
    const questionType = currentMonster.questionSet.type; // 타입 가져오기
    const question = parseQuestion(rawQuestion, questionType); // 타입과 함께 전달
    showQuiz(question, async (isCorrect) => {
        player.mp -= skill.mpCost;
        if (isCorrect) {
            setMonsterImage('hurt');
            if (skill.type === 1) {
                playSound('player-skillat-hit');
                await sleep(200);
                shakeScreen();
                const damage = Math.floor(player.attack * skill.effect);
                currentMonster.hp = Math.max(0, currentMonster.hp - damage);
                showMessage(`${skill.name} 발동! ${damage}의 데미지!`, currentQuestion.explanation, checkBattleEnd);
            } else if (skill.type === 2) {
                playSound('player-skillheal-hit');
                await sleep(200);
                player.hp = Math.min(player.maxHp, player.hp + skill.effect);
                showMessage(`${skill.name} 발동! HP를 ${skill.effect} 회복했다!`, currentQuestion.explanation, checkBattleEnd);
            }
        } else {
            setMonsterImage('happy');
                if (skill.type === 1){
                    playSound('player-skillat-miss');
                    await sleep(200);
                } else if (skill.type ===2){
                    playSound('player-skillheal-miss');
                    await sleep(200);
                }
            showMessage("스킬 발동에 실패했다...", currentQuestion.explanation, checkBattleEnd);
        }
        updateUI();
    });
}
function openItemMenu() {
    const usableItems = Object.keys(player.inventory).filter(key => player.inventory[key] > 0);
    if (usableItems.length === 0) {
        showMessage("사용할 아이템이 없습니다.");
        setTimeout(() => { 
            toggleActionMenu(true); 
            isActionInProgress = false;
        }, 1500);
        return;
    }
    itemList.innerHTML = '';
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
    openModal(itemModal);
}
async function useItem(item) {
    closeModal();
    isActionInProgress = true;
    player.inventory[item.id]--;
    if (item.type === 1) {
        playSound('item-heal');
        await sleep(200);
        player.hp = Math.min(player.maxHp, player.hp + item.value);
    } else if (item.type === 2) {
        playSound('item-heal');
        await sleep(200);
        player.mp = Math.min(player.maxMp, player.mp + item.value);
    } else if (item.type === 3) {
        playSound('item-damage');
        await sleep(200);
        setMonsterImage('hurt');
        currentMonster.hp = Math.max(0, currentMonster.hp - item.value);
        shakeScreen();
    }
    updateUI();
    showMessage(`${item.name}을(를) 사용했다!`, checkBattleEnd);
}

// === 게임 초기화 및 시작 ===
function initGame() {
    preloadSounds();

    if (!userData) {
        alert("사용자 정보를 불러올 수 없습니다. 메인 화면으로 돌아갑니다.");
        window.location.href = 'main.html';
        return;
    }
    
    player = { 
        name: userData.nickname || '용사',
        baseHp: userData.baseHp || 80,
        baseMp: userData.baseMp || 50,
        baseAttack: userData.baseAttack || 15,
        ownedCards: userData.ownedCards || [], // [추가] 보유 카드 목록 추가
        equippedCards: userData.equippedCards || [],
        inventory: userData.inventory || {},
        gold: userData.gold || 0,
        points: userData.points || { partsOfSpeech: 0, sentenceComponents: 0 }
    };
    
    calculatePlayerStats();

    const playerImageEl = gameContainer.querySelector('#player-image');
    let conditionsMet = 0;
    // 아래 값들은 main.js와 동일하게 맞춰주어야 합니다.
    if (player.maxHp >= 100) conditionsMet++;
    if (player.maxHp >= 150) conditionsMet++;
    if (player.maxMp >= 70) conditionsMet++;
    if (player.attack >= 50) conditionsMet++;
    if (player.equippedCards.length >= 4) conditionsMet++;
    if (player.equippedCards.length >= 2) conditionsMet++;
    
    playerImageEl.src = `img/player${conditionsMet}.png`;

    player.hp = player.maxHp;
    player.mp = player.maxMp;

    currentMonsterIndex = 0;
    generateMonsters();
    
    if (monstersInDungeon.length === 0) {
        messageTextEl.textContent = "던전에 출현할 몬스터가 없습니다!";
        toggleActionMenu(false);
        return;
    }
    
    const setupMonster = (monsterData) => {
        const newMonster = { ...monsterData };
        newMonster.maxHp = parseInt(newMonster.hp, 10) || 50;
        newMonster.hp = newMonster.maxHp;
        newMonster.mp = parseInt(newMonster.mp, 10) || 10;
        return newMonster;
    };
    currentMonster = setupMonster(monstersInDungeon[currentMonsterIndex]);
     
    playerNameEl.textContent = player.name;
    monsterNameEl.textContent = currentMonster.name;
    
    isActionInProgress = true;
    toggleActionMenu(false);

    actionButtons.forEach(btn => btn.addEventListener('click', () => handleAction(btn.dataset.action)));
    document.querySelectorAll('.modal-close-btn').forEach(btn => btn.addEventListener('click', () => {
        closeModal();
        isActionInProgress = false;
        toggleActionMenu(true);
    }));
    continueBattleBtn.addEventListener('click', () => {
        closeModal();

            /*/ ✨ 추가: 몬스터 처치 시 최종 통계 출력
            console.log(`%c========== ${currentMonster.name} 처치! ==========`, 'color: #FF5722; font-weight: bold; font-size: 14px;');
            console.log(`총 출제된 문제 수: ${Object.values(currentMonster.questionCount).reduce((sum, count) => sum + count, 0)}개`);
            console.log('문제별 출제 횟수:');
            console.table(currentMonster.questionCount);
            console.log('====================================\n');*/
            
        currentMonsterIndex++;
        if (currentMonsterIndex >= monstersInDungeon.length) {
            // [수정 시작] 던전 클리어 시 최종 보상 표시 로직 변경
            
            // 표시할 HTML을 담을 변수
            let rewardsHTML = `<p>💰 골드: ${dungeonRewards.gold} G</p>`;

            // 포인트 종류 영문 key를 한글 이름으로 바꾸기 위한 객체
            const pointTypeNames = {
                partsOfSpeech: '품사 포인트',
                sentenceComponents: '문장 성분 포인트'
                // 나중에 새로운 포인트가 추가되면 여기에 추가하면 됩니다.
            };

            // dungeonRewards.points 객체에 있는 모든 포인트 종류를 순회
            for (const pointType in dungeonRewards.points) {
                const pointAmount = dungeonRewards.points[pointType];
                // 해당 종류의 포인트를 1 이상 획득했을 경우에만 표시
                if (pointAmount > 0) {
                    const pointName = pointTypeNames[pointType] || pointType; // 한글 이름이 없으면 영문 key를 그대로 사용
                    rewardsHTML += `<p>🅿️ ${pointName}: ${pointAmount} P</p>`;
                }
            }

            finalRewardsEl.innerHTML = rewardsHTML;
            dungeonClearEl.classList.remove('hidden');
            // [수정 끝]
        } else {
            currentMonster = setupMonster(monstersInDungeon[currentMonsterIndex]);
            monsterNameEl.textContent = currentMonster.name;

            // ✨ 추가: 새 몬스터 시작 알림
            /*console.log(`%c========== 새 몬스터 등장: ${currentMonster.name} ==========`, 'color: #2196F3; font-weight: bold; font-size: 14px;');*/

            updateUI();
            startPlayerTurn();
        }
    });
    returnToMainBtn.addEventListener('click', async () => {
        if (isReturningToMain) return; // 이미 로직이 실행 중이면 아무것도 하지 않음
        isReturningToMain = true; // 로직 실행 시작 플래그 설정
        returnToMainBtn.disabled = true; // 버튼을 즉시 비활성화

        try {
            const finalUserData = JSON.parse(localStorage.getItem('userData'));
            finalUserData.gold += dungeonRewards.gold;

            if (!finalUserData.points) {
                finalUserData.points = {};
                }

            // dungeonRewards.points 객체에 있는 모든 포인트 종류를 순회하며 합산
            for (const pointType in dungeonRewards.points) {
                // finalUserData에 해당 포인트 종류가 없으면 0으로 초기화
                if (!finalUserData.points[pointType]) {
                    finalUserData.points[pointType] = 0;
                }
            // 누적된 보상 포인트를 더해줌
            finalUserData.points[pointType] += dungeonRewards.points[pointType];
            }
        
            finalUserData.inventory = player.inventory;
            localStorage.setItem('userData', JSON.stringify(finalUserData));
            
            if (finalUserData.id) {
                await uploadUserData(finalUserData.id);
            } else {
                console.error("저장할 사용자 ID가 없습니다.");
            }
        } catch (error) {
            console.error("보상 저장 중 오류 발생:", error);
            // 오류가 발생하더라도 창은 닫히도록 finally 블록으로 이동
        } finally {
            // 페이지 이동 대신, main.js의 endBattle 함수를 호출
            if (window.endBattle) {
                window.endBattle();
            }
        }
    });

    returnToMainFromGameOverBtn.addEventListener('click', () => {
        // 보상을 더하는 로직 없이, 단순히 전투 창을 닫는 함수만 호출합니다.
        if (window.endBattle) {
            window.endBattle();
        }
    });

    infoBtn.addEventListener('click', () => {
        let cardListHTML = '';
        player.equippedCards.forEach(cardId => {
            const card = cardDB.find(c => c.id === cardId);
            if (card) { cardListHTML += `<li>${card.name}</li>`; }
        });
        if (player.equippedCards.length === 0) cardListHTML = '<li>없음</li>';
        
        // [수정] 도감 보너스를 포함하여 공격력 정보를 더 자세히 표시
        const ownedCardCount = player.ownedCards.length;
        const collectionAttackBonus = Math.round(ownedCardCount * 0.5);
        const equippedAttackBonus = player.attack - player.baseAttack - collectionAttackBonus;

        infoList.innerHTML = `
            <p><strong>공격력:</strong> ${player.attack} (기본 ${player.baseAttack} + 도감 ${collectionAttackBonus} + 장착 카드 ${equippedAttackBonus})</p>
            <p><strong>골드:</strong> ${player.gold} G</p>
            <p><strong>품사 포인트:</strong> ${player.points.partsOfSpeech || 0} P</p>
            <p><strong>장착 카드:</strong></p>
            <ul>${cardListHTML}</ul>
        `;
        openModal(infoModal);
    });
    
    updateUI();
    startPlayerTurn();
}

initGame();



function runRandomTest(questionId, iterations = 100) {
    // 1. 테스트할 문제 세트 찾기
    const questionSet = questionDB.find(q => q.id === questionId);
    if (!questionSet) {
        console.error(`'${questionId}' ID를 가진 문제 세트를 찾을 수 없습니다.`);
        return;
    }

    // 2. 유효한 문제 목록 생성 (게임 로직과 동일)
    const questionKeys = Object.keys(questionSet).filter(k => k.startsWith('question') && questionSet[k]);
    if (questionKeys.length === 0) {
        console.error(`'${questionId}' 문제 세트에 유효한 문제가 없습니다.`);
        return;
    }

    console.log(`--- 무작위 추출 테스트 시작 (총 ${iterations}회) ---`);
    console.log(`테스트 대상: ${questionId} (유효 문항 수: ${questionKeys.length}개)`);
    
    // 3. 결과를 기록할 객체 초기화
    const results = {};
    questionKeys.forEach(key => { results[key] = 0; });

    // 4. 지정된 횟수만큼 무작위 추출 시뮬레이션
    for (let i = 0; i < iterations; i++) {
        const randomKey = questionKeys[Math.floor(Math.random() * questionKeys.length)];
        results[randomKey]++;
    }

    // 5. 최종 결과 출력
    console.log("--- 테스트 결과 ---");
    console.log("각 문제가 선택된 횟수:");
    console.table(results); // 결과를 표 형태로 깔끔하게 출력
}
// 테스트 함수를 브라우저 콘솔에서 직접 호출할 수 있도록 window 객체에 등록
window.runRandomTest = runRandomTest;
//runRandomTest('Q001', 10000);
})();