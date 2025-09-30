// === DOM 요소 가져오기 ===
const monsterImageEl = document.getElementById('monster-image');
const infoBtn = document.getElementById('info-btn');
const infoModal = document.getElementById('info-modal');
const infoList = document.getElementById('info-list');
const monsterNameEl = document.getElementById('monster-name');
const monsterHpBar = document.getElementById('monster-hp-bar');
const monsterHpText = document.getElementById('monster-hp-text');
const playerNameEl = document.getElementById('player-name');
const playerHpBar = document.getElementById('player-hp-bar');
const playerHpText = document.getElementById('player-hp-text');
const playerMpBar = document.getElementById('player-mp-bar');
const playerMpText = document.getElementById('player-mp-text');
const messageBox = document.getElementById('message-box');
const messageTextEl = document.getElementById('message-text');
const quizBox = document.getElementById('quiz-box');
const quizTextEl = document.getElementById('quiz-text');
const quizAnswersEl = document.getElementById('quiz-answers');
const actionMenu = document.getElementById('action-menu');
const actionButtons = document.querySelectorAll('.action-btn');
const gameOverEl = document.getElementById('game-over');
const dungeonClearEl = document.getElementById('dungeon-clear');
const finalRewardsEl = document.getElementById('final-rewards');
const returnToMainBtn = document.getElementById('return-to-main-btn');
const modalBackdrop = document.getElementById('modal-backdrop');
const skillModal = document.getElementById('skill-modal');
const skillList = document.getElementById('skill-list');
const itemModal = document.getElementById('item-modal');
const itemList = document.getElementById('item-list');
const victoryModal = document.getElementById('victory-modal');
const victoryMessageEl = document.getElementById('victory-message');
const continueBattleBtn = document.getElementById('continue-battle-btn');
const equippedCardsEl = document.getElementById('equipped-cards');

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
let dungeonRewards = { gold: 0, points: { partsOfSpeech: 0 } };
let turn = 'player';
let onQuizComplete = null;
let isActionInProgress = false;

// === 헬퍼 및 UI 함수 ===
function calculatePlayerStats() {
    player.maxHp = player.baseHp;
    player.maxMp = player.baseMp;
    player.attack = player.baseAttack;
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
function showMessage(text, callback) {messageBox.classList.remove('hidden');quizBox.classList.add('hidden');messageTextEl.textContent = text;if (callback) { setTimeout(callback, 1500); }}
function parseQuestion(questionString) {
    const parts = questionString.split('⊥');
    const questionData = {
        prompt: parts[0],
        context: parts[1],
        choices: [parts[2], parts[3], parts[4], parts[5]],
    };
    questionData.correctAnswer = questionData.choices[parseInt(parts[6], 10) - 1];
    return questionData;
}
function showQuiz(question, callback) {
    messageBox.classList.add('hidden');
    quizBox.classList.remove('hidden');
    onQuizComplete = callback;
    const displayContext = question.context.replace(/@(.*?)@/g, '<u>$1</u>');
    quizTextEl.innerHTML = `${question.prompt}<br><br>"${displayContext}"`;
    quizAnswersEl.innerHTML = '';
    const shuffledChoices = shuffleArray([...question.choices]);
    shuffledChoices.forEach(choice => {
        const button = document.createElement('button');
        button.className = 'quiz-btn';
        button.textContent = choice;
        button.onclick = () => handleQuizAnswer(choice === question.correctAnswer);
        quizAnswersEl.appendChild(button);
    });
}
function handleQuizAnswer(isCorrect) {document.querySelectorAll('.quiz-btn').forEach(btn => btn.disabled = true);if (onQuizComplete) { onQuizComplete(isCorrect); }}
function toggleActionMenu(enabled) { actionButtons.forEach(btn => btn.disabled = !enabled); }
function setMonsterImage(state) { monsterImageEl.src = `img/monster-${state}.png`;}
function openModal(modal) { modalBackdrop.classList.remove('hidden'); modal.classList.remove('hidden'); }
function closeModal() { modalBackdrop.classList.add('hidden'); skillModal.classList.add('hidden'); itemModal.classList.add('hidden'); victoryModal.classList.add('hidden'); infoModal.classList.add('hidden'); }
function generateMonsters() {
    const selectedDungeon = dungeonDB.find(d => d.id === selectedDungeonId);
    if (!selectedDungeon) { console.error("선택된 던전 정보 없음:", selectedDungeonId); monstersInDungeon = []; return; }
    const monsterIds = [selectedDungeon.monster1Id, selectedDungeon.monster2Id, selectedDungeon.monster3Id, selectedDungeon.monster4Id, selectedDungeon.monster5Id].filter(id => id);
    monstersInDungeon = monsterIds.map(id => {
        const monsterData = monsterDB.find(monster => monster.id === id);
        if (monsterData) {
            const questionsData = questionDB.find(q => q.id === monsterData.questionId);
            const newMonster = { ...monsterData };
            if (questionsData) {
                newMonster.quizBank = Object.keys(questionsData).filter(key => key.startsWith('question')).map(key => questionsData[key]).filter(q => q);
            } else {
                console.error(`몬스터 '${newMonster.name}'(ID: ${id})에 대한 Question DB(ID: ${newMonster.questionId})를 찾을 수 없습니다.`);
                newMonster.quizBank = [];
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
        if (!currentMonster.quizBank || currentMonster.quizBank.length === 0) {
            showMessage("몬스터가 낼 문제가 없어 행동을 하지 못합니다.", checkBattleEnd);
            return;
        }
        const monsterSkills = [currentMonster.skillId1, currentMonster.skillId2, currentMonster.skillId3].filter(id => id).map(id => skillDB.find(s => s.id === id)).filter(skill => skill && parseInt(currentMonster.mp) >= parseInt(skill.mpCost));
        const willUseSkill = monsterSkills.length > 0 && Math.random() < 0.5;
        const rawQuestion = currentMonster.quizBank[Math.floor(Math.random() * currentMonster.quizBank.length)];
        const question = parseQuestion(rawQuestion);
        if (willUseSkill) {
            const skillToUse = monsterSkills[Math.floor(Math.random() * monsterSkills.length)];
            currentMonster.mp -= parseInt(skillToUse.mpCost);
            showQuiz(question, (isCorrect) => {
                setMonsterImage(isCorrect ? 'hurt' : 'happy');
                if (skillToUse.type == 1) {
                    const damage = Math.floor(parseInt(currentMonster.attack) * parseFloat(skillToUse.effect));
                    const finalDamage = isCorrect ? Math.floor(damage * 0.5) : damage;
                    player.hp = Math.max(0, player.hp - finalDamage);
                    showMessage(isCorrect ? `방해 성공! 몬스터의 ${skillToUse.name} 데미지가 ${finalDamage}로 감소!` : `몬스터의 ${skillToUse.name}! ${finalDamage}의 데미지!`, checkBattleEnd);
                } else if (skillToUse.type == 2) {
                    const healAmount = isCorrect ? Math.floor(parseInt(skillToUse.effect) * 0.5) : parseInt(skillToUse.effect);
                    currentMonster.hp = Math.min(currentMonster.maxHp, currentMonster.hp + healAmount);
                    showMessage(isCorrect ? `방해 성공! 몬스터가 ${skillToUse.name}으로 HP를 ${healAmount}만 회복!` : `몬스터가 ${skillToUse.name}으로 HP를 ${healAmount} 회복!`, checkBattleEnd);
                }
                updateUI();
            });
        } else {
            enemyBasicAttack(question);
        }
    });
}
function enemyBasicAttack(question) {
    showQuiz(question, (isCorrect) => {
        if (isCorrect) {
            setMonsterImage('hurt');
            const reducedDamage = Math.floor(parseInt(currentMonster.attack) * 0.5);
            player.hp = Math.max(0, player.hp - reducedDamage);
            updateUI();
            showMessage(`방어 성공! ${reducedDamage}의 데미지를 받았다!`, checkBattleEnd);
        } else {
            setMonsterImage('happy');
            player.hp = Math.max(0, player.hp - parseInt(currentMonster.attack));
            updateUI();
            showMessage(`방어 실패! ${currentMonster.attack}의 데미지를 받았다!`, checkBattleEnd);
        }
    });
}
function handleAction(action) {
    if (turn !== 'player' || isActionInProgress) return;
    isActionInProgress = true;
    toggleActionMenu(false);
    if (!currentMonster.quizBank || currentMonster.quizBank.length === 0) {
        showMessage("몬스터가 낼 문제가 없습니다! (DB 확인 필요)", () => { startPlayerTurn(); });
        return;
    }
    const rawQuestion = currentMonster.quizBank[Math.floor(Math.random() * currentMonster.quizBank.length)];
    const question = parseQuestion(rawQuestion);
    switch(action) {
        case 'attack':
            showQuiz(question, (isCorrect) => {
                if (isCorrect) {
                    setMonsterImage('hurt');
                    currentMonster.hp = Math.max(0, currentMonster.hp - player.attack);
                    updateUI();
                    showMessage(`공격 성공! ${player.attack}의 데미지!`, checkBattleEnd);
                } else { 
                    setMonsterImage('happy');
                    showMessage("공격이 빗나갔다...", checkBattleEnd); 
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
                    showMessage("도망칠 수 없었다...", checkBattleEnd); 
                }
            });
            break;
    }
}
function checkBattleEnd() {
    updateUI();
    if (player.hp <= 0) { gameOverEl.classList.remove('hidden'); return; }
    if (currentMonster.hp <= 0) {
        const goldReward = parseInt(currentMonster.goldReward, 10) || 0;
        const pointReward = parseInt(currentMonster.pointReward, 10) || 0;
        dungeonRewards.gold += goldReward;
        dungeonRewards.points.partsOfSpeech += pointReward;
        const rewardText = `보상으로 ${goldReward} 골드와 ${pointReward} 포인트를 획득했다!`;
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
    const rawQuestion = currentMonster.quizBank[Math.floor(Math.random() * currentMonster.quizBank.length)];
    const question = parseQuestion(rawQuestion);
    showQuiz(question, (isCorrect) => {
        player.mp -= skill.mpCost;
        if (isCorrect) {
            setMonsterImage('hurt');
            if (skill.type === 1) {
                const damage = Math.floor(player.attack * skill.effect);
                currentMonster.hp = Math.max(0, currentMonster.hp - damage);
                showMessage(`${skill.name} 발동! ${damage}의 데미지!`, checkBattleEnd);
            } else if (skill.type === 2) {
                player.hp = Math.min(player.maxHp, player.hp + skill.effect);
                showMessage(`${skill.name} 발동! HP를 ${skill.effect} 회복했다!`, checkBattleEnd);
            }
        } else {
            setMonsterImage('happy');
            showMessage("스킬 발동에 실패했다...", checkBattleEnd);
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
function useItem(item) {
    closeModal();
    isActionInProgress = true;
    player.inventory[item.id]--;
    if (item.type === 1) {
        player.hp = Math.min(player.maxHp, player.hp + item.value);
    } else if (item.type === 2) {
        player.mp = Math.min(player.maxMp, player.mp + item.value);
    } else if (item.type === 3) {
        setMonsterImage('hurt');
        currentMonster.hp = Math.max(0, currentMonster.hp - item.value);
    }
    updateUI();
    showMessage(`${item.name}을(를) 사용했다!`, checkBattleEnd);
}

// === 게임 초기화 및 시작 ===
function initGame() {
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
        equippedCards: userData.equippedCards || [],
        inventory: userData.inventory || {},
        gold: userData.gold || 0,
        points: userData.points || { partsOfSpeech: 0, sentenceComponents: 0 }
    };
    calculatePlayerStats();
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
        currentMonsterIndex++;
        if (currentMonsterIndex >= monstersInDungeon.length) {
            finalRewardsEl.innerHTML = `<p>💰 골드: ${dungeonRewards.gold} G</p><p>🅿️ 품사 포인트: ${dungeonRewards.points.partsOfSpeech} P</p>`;
            dungeonClearEl.classList.remove('hidden');
        } else {
            currentMonster = setupMonster(monstersInDungeon[currentMonsterIndex]);
            monsterNameEl.textContent = currentMonster.name;
            updateUI();
            startPlayerTurn();
        }
    });
    returnToMainBtn.addEventListener('click', async () => {
        const finalUserData = JSON.parse(localStorage.getItem('userData'));
        finalUserData.gold += dungeonRewards.gold;
        if (!finalUserData.points) finalUserData.points = {};
        finalUserData.points.partsOfSpeech = (finalUserData.points.partsOfSpeech || 0) + dungeonRewards.points.partsOfSpeech;
        finalUserData.inventory = player.inventory;
        localStorage.setItem('userData', JSON.stringify(finalUserData));
        if (finalUserData.id) {
            await uploadUserData(finalUserData.id);
        } else {
            console.error("저장할 사용자 ID가 없습니다.");
        }
        window.location.href = 'main.html';
    });
    infoBtn.addEventListener('click', () => {
        let cardListHTML = '';
        player.equippedCards.forEach(cardId => {
            const card = cardDB.find(c => c.id === cardId);
            if (card) { cardListHTML += `<li>${card.name}</li>`; }
        });
        if (player.equippedCards.length === 0) cardListHTML = '<li>없음</li>';
        
        infoList.innerHTML = `
            <p><strong>공격력:</strong> ${player.attack} (${player.baseAttack} + ${player.attack - player.baseAttack})</p>
            <p><strong>골드:</strong> ${player.gold} G</p>
            <p><strong>품사 포인트:</strong> ${player.points.partsOfSpeech || 0} P</p>
            <p><strong>문장 성분 포인트:</strong> ${player.points.sentenceComponents || 0} P</p>
            <p><strong>장착 카드:</strong></p>
            <ul>${cardListHTML}</ul>
        `;
        openModal(infoModal);
    });
    
    updateUI();
    startPlayerTurn();
}

initGame();