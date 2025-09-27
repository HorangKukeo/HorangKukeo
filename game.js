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
const gameClearEl = document.getElementById('game-clear');
const modalBackdrop = document.getElementById('modal-backdrop');
const skillModal = document.getElementById('skill-modal');
const skillList = document.getElementById('skill-list');
const itemModal = document.getElementById('item-modal');
const itemList = document.getElementById('item-list');
const victoryModal = document.getElementById('victory-modal');
const victoryMessageEl = document.getElementById('victory-message');
const continueBattleBtn = document.getElementById('continue-battle-btn');
const equippedCardsEl = document.getElementById('equipped-cards');

// === 데이터 구조 초기화 ===
let cardDB = {};
let skillDB = {};
let itemDB = {};
let player = {};
let monsters = [];
let currentMonster;
let currentMonsterIndex = 0;
let turn = 'player';
let onQuizComplete = null;

// (단어 DB는 생략)
const wordDB_lv1 = [{ sentence: '맑은 @하늘@이 보인다.', pos: '명사' }, { sentence: '나는 @학생@이다.', pos: '명사' },{ sentence: '@이것@은 연필이다.', pos: '대명사' }, { sentence: '@우리@는 친구다.', pos: '대명사' },{ sentence: '사과 @하나@ 주세요.', pos: '수사' }, { sentence: '@두@ 사람이 걷는다.', pos: '관형사' },{ sentence: '밥을 @먹다@.', pos: '동사' }, { sentence: '책을 @읽다@.', pos: '동사' },{ sentence: '날씨가 @좋다@.', pos: '형용사' }, { sentence: '가방이 @무겁다@.', pos: '형용사' },{ sentence: '@새@ 신을 신었다.', pos: '관형사' }, { sentence: '@이@ 사람은 누구야?', pos: '관형사' },{ sentence: '차가 @빨리@ 달린다.', pos: '부사' }, { sentence: '공부를 @열심히@ 한다.', pos: '부사' },{ sentence: '@와@, 정말 멋지다!', pos: '감탄사' }, { sentence: '@네@, 맞아요.', pos: '감탄사' },{ sentence: '학교@에@ 간다.', pos: '조사' }, { sentence: '빵@과@ 우유를 먹었다.', pos: '조사' },{ sentence: '@저@ 산은 한라산이다.', pos: '관형사' }, { sentence: '@예쁜@ 꽃이 피었구나.', pos: '형용사' }];
const wordDB_lv2 = [{ sentence: '우리 @가족@은 행복하다.', pos: '명사' }, { sentence: '@여름@은 덥다.', pos: '명사' },{ sentence: '@거기@에 누가 있니?', pos: '대명사' }, { sentence: '@너희@는 어디 가니?', pos: '대명사' },{ sentence: '@셋째@ 아이가 똑똑하다.', pos: '관형사' }, { sentence: '@다섯@의 사람이 있다.', pos: '수사' },{ sentence: '음악을 @듣는구나@.', pos: '동사' }, { sentence: '창문을 @열어라@.', pos: '동사' },{ sentence: '방이 @깨끗하네@.', pos: '형용사' }, { sentence: '동생은 @착하더라@.', pos: '형용사' },{ sentence: '@헌@ 옷은 버렸다.', pos: '관형사' }, { sentence: '@여러@ 나라를 여행했다.', pos: '관형사' },{ sentence: '밥을 @아주@ 많이 먹었다.', pos: '부사' }, { sentence: '버스가 @천천히@ 움직인다.', pos: '부사' },{ sentence: '@아차@, 숙제를 잊었다.', pos: '감탄사' }, { sentence: '@응@, 나도 갈게.', pos: '감탄사' },{ sentence: '도서관@에서@ 책을 읽는다.', pos: '조사' }, { sentence: '너@를@ 좋아해.', pos: '조사' },{ sentence: '@푸르게@ 빛나는 별.', pos: '형용사' }, { sentence: '@모든@ 사람은 소중하다.', pos: '관형사' }];
const wordDB_lv3 = [{ sentence: '건강한 @정신@이 중요하다.', pos: '명사' }, { sentence: '나는 @곧@ 여행을 떠난다.', pos: '부사' },{ sentence: '@무엇@을 도와드릴까요?', pos: '대명사' }, { sentence: '@앞@으로 나와서 자신을 소개해보세요.', pos: '명사' },{ sentence: '@일곱@ 빛깔 무지개.', pos: '관형사' }, { sentence: '@첫째@로 건강이 최고다.', pos: '수사' },{ sentence: '친구와 @놀고@ 집으로 돌아왔다.', pos: '동사' }, { sentence: '편지를 @쓰는@ 학생들.', pos: '동사' },{ sentence: '밤하늘이 @아름답네@.', pos: '형용사' }, { sentence: '그의 목소리는 @부드러웠다@.', pos: '형용사' },{ sentence: '@어떤@ 색을 좋아하니?', pos: '관형사' }, { sentence: '@옛날@ 옛적에 호랑이가 살았다.', pos: '명사' },{ sentence: '동생이 @갑자기@ 울었다.', pos: '부사' }, { sentence: '나는 @자주@ 영화를 본다.', pos: '부사' },{ sentence: '@어머나@, 벌써 시간이 이렇게 됐네.', pos: '감탄사' }, { sentence: '@글쎄@, 잘 모르겠는데.', pos: '감탄사' },{ sentence: '서울@까지@ 걸어갔다.', pos: '조사' }, { sentence: '너@와@ 나는 친구야.', pos: '조사' },{ sentence: '그는 참 @재미있었어@.', pos: '형용사' }, { sentence: '그녀는 @친절하다@.', pos: '형용사' }];
const wordDB_lv4 = [{ sentence: '정확한 정보를 찾아야@만@ 한다.', pos: '조사' }, { sentence: '우리 @사회@는 발전하고 있다.', pos: '명사' },{ sentence: '@누구@든지 환영합니다.', pos: '대명사' }, { sentence: '@아무@도 그 사실을 몰랐다.', pos: '대명사' },{ sentence: '@열@ 명의 학생이 결석했다.', pos: '관형사' }, { sentence: '@여덟@ 시에 만나자.', pos: '관형사' },{ sentence: '@새로운@ 사실을 알게 되었어.', pos: '형용사' }, { sentence: '친구를 @도왔다@.', pos: '동사' },{ sentence: '그는 @정직하다@.', pos: '형용사' }, { sentence: '시험 문제가 @어렵네@.', pos: '형용사' },{ sentence: '@다른@ 의견 있나요?', pos: '관형사' }, { sentence: '@웬@ 빵이야?', pos: '관형사' },{ sentence: '우리는 @서로@ 협동했다.', pos: '부사' }, { sentence: '나는 @가끔@ 산책을 한다.', pos: '부사' },{ sentence: '@자@, 이제 시작해볼까?', pos: '감탄사' }, { sentence: '@에이@, 그건 아니지.', pos: '감탄사' },{ sentence: '부모님@께서@ 오셨다.', pos: '조사' }, { sentence: '나@보다@ 키가 크다.', pos: '조사' },{ sentence: '꿈을 @이루었어요@.', pos: '동사' }, { sentence: '학생 @셋@이 걸어가고 있네.', pos: '수사' }];
const wordDB_lv5 = [{ sentence: '꾸준한 @노력@이 결실을 맺었다.', pos: '명사' }, { sentence: '언제나 @환경@을 보호해야 한다.', pos: '명사' },{ sentence: '@어디@에 사는지 물어봐도 될까요?', pos: '대명사' }, { sentence: '@우리@도 슬슬 밥 먹을까요?', pos: '대명사' },{ sentence: '@아홉@ 시 뉴스를 본다.', pos: '관형사' }, { sentence: '학생들을 @모두@ 불러모았다.', pos: '부사' },{ sentence: '새로운 집을 @지어라@.', pos: '동사' }, { sentence: '자전거를 @배운다@.', pos: '동사' },{ sentence: '그의 생각은 @자유로웠어@.', pos: '형용사' }, { sentence: '오늘은 날씨가 @따뜻하게@ 바뀌었네.', pos: '형용사' },{ sentence: '@몇@ 명이나 왔나요?', pos: '관형사' }, { sentence: '@온@ 세상이 하얗게 변했다.', pos: '관형사' },{ sentence: '@결코@ 포기하지 않겠어!', pos: '부사' }, { sentence: '@함께@ 노래를 불렀지.', pos: '부사' },{ sentence: '@옳지@, 바로 그거야!', pos: '감탄사' }, { sentence: '@천만에@, 별말씀을요.', pos: '감탄사' },{ sentence: '너@처럼@ 되고 싶어.', pos: '조사' }, { sentence: '약속@은@ 지켜야 한다.', pos: '조사' },{ sentence: '먹을 @것@이 전혀 없어.', pos: '명사' }, { sentence: '그녀는 @서럽게@ 울었다.', pos: '형용사' }];
const allWordDBs = [wordDB_lv1, wordDB_lv2, wordDB_lv3, wordDB_lv4, wordDB_lv5];
const posList = ['명사', '대명사', '수사', '동사', '형용사', '관형사', '부사', '감탄사', '조사'];

async function fetchGameData() {
    const GAME_DATA_URL = 'https://hook.us2.make.com/9a5ve7598e6kci7tchidj4669axhbw91';
    try {
        const rawText = await fetch(GAME_DATA_URL).then(res => res.text());
        const outerObject = JSON.parse(rawText);

        if (outerObject.Cards) {
            const cardHeaders = ['id', 'name', 'hpBonus', 'mpBonus', 'attackBonus', 'skillId'];
            const cleanCards = outerObject.Cards.map(cardString => {
                const rawCard = JSON.parse(cardString);
                const newCard = {};
                cardHeaders.forEach((header, index) => { newCard[header] = rawCard[index]; });
                return newCard;
            });
            cleanCards.forEach(card => {
                card.hpBonus = parseInt(card.hpBonus, 10) || 0;
                card.mpBonus = parseInt(card.mpBonus, 10) || 0;
                card.attackBonus = parseInt(card.attackBonus, 10) || 0;
                cardDB[card.id] = card;
            });
        }

        if (outerObject.Skills) {
            const skillHeaders = ['id', 'name', 'type', 'effect', 'mpCost', 'desc'];
            const cleanSkills = outerObject.Skills.map(skillString => {
                const rawSkill = JSON.parse(skillString);
                const newSkill = {};
                skillHeaders.forEach((header, index) => { newSkill[header] = rawSkill[index]; });
                return newSkill;
            });
            cleanSkills.forEach(skill => {
                skill.type = parseInt(skill.type, 10) || 0;
                skill.effect = parseFloat(skill.effect) || 0;
                skill.mpCost = parseInt(skill.mpCost, 10) || 0;
                skillDB[skill.id] = skill;
            });
        }

        if (outerObject.Items) {
            const itemHeaders = ['id', 'name', 'type', 'value', 'desc'];
            const cleanItems = outerObject.Items.map(itemString => {
                const rawItem = JSON.parse(itemString);
                const newItem = {};
                itemHeaders.forEach((header, index) => { newItem[header] = rawItem[index]; });
                return newItem;
            });
            cleanItems.forEach(item => {
                item.type = parseInt(item.type, 10) || 0;
                item.value = parseInt(item.value, 10) || 0;
                itemDB[item.id] = item;
            });
        }
        
        return true;

    } catch (error) {
        console.error('게임 데이터를 파싱하는 중 오류 발생:', error);
        alert('게임 데이터를 불러오는 데 실패했습니다.');
        return false;
    }
}

function calculatePlayerStats() {
    player.maxHp = player.baseHp;
    player.maxMp = player.baseMp;
    player.attack = player.baseAttack;
    player.equippedCards.forEach(cardId => {
        const card = cardDB[cardId];
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
        if (cardId && cardDB[cardId]) {
            slot.textContent = cardDB[cardId].name;
            slot.classList.remove('empty');
        } else {
            slot.textContent = '비어있음';
            slot.classList.add('empty');
        }
    });
}
function shuffleArray(array) { for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[array[i], array[j]] = [array[j], array[i]];} return array;}
function showMessage(text, callback) {messageBox.classList.remove('hidden');quizBox.classList.add('hidden');messageTextEl.textContent = text;if (callback) { setTimeout(callback, 1500); }}
function showQuiz(quizData, callback) {messageBox.classList.add('hidden');quizBox.classList.remove('hidden');onQuizComplete = callback;const sentenceParts = quizData.sentence.split('@');const targetWord = sentenceParts[1];const questionSentence = `${sentenceParts[0]}<u>${targetWord}</u>${sentenceParts[2]}`;quizTextEl.innerHTML = `다음 문장에서 밑줄 친 단어의 품사는?<br><br>"${questionSentence}"`;quizAnswersEl.innerHTML = '';const correctAnswer = quizData.pos;const wrongAnswers = posList.filter(p => p !== correctAnswer);shuffleArray(wrongAnswers);const choices = [correctAnswer, ...wrongAnswers.slice(0, 4)];const shuffledChoices = shuffleArray(choices);shuffledChoices.forEach(choice => {const button = document.createElement('button');button.className = 'quiz-btn';button.textContent = choice;button.onclick = () => handleQuizAnswer(choice === correctAnswer);quizAnswersEl.appendChild(button);});}
function handleQuizAnswer(isCorrect) {document.querySelectorAll('.quiz-btn').forEach(btn => btn.disabled = true);if (onQuizComplete) { onQuizComplete(isCorrect); }}
function toggleActionMenu(enabled) { actionButtons.forEach(btn => btn.disabled = !enabled); }
function setMonsterImage(state) { monsterImageEl.src = `img/monster-${state}.png`;}
function openModal(modal) { modalBackdrop.classList.remove('hidden'); modal.classList.remove('hidden'); }
function closeModal() { modalBackdrop.classList.add('hidden'); skillModal.classList.add('hidden'); itemModal.classList.add('hidden'); victoryModal.classList.add('hidden'); infoModal.classList.add('hidden'); }
function generateMonsters() {monsters = [];for (let level = 1; level <= 5; level++) {monsters.push({ name: `품사 Lv. ${level}`, hp: 25 + 5 * level, maxHp: 25 + 5 * level, attack: 0 + 8 * level, quizBank: allWordDBs[level - 1] });}}
function startPlayerTurn() {turn = 'player';setMonsterImage('idle');showMessage("당신의 턴입니다.", () => {messageBox.classList.add('hidden');toggleActionMenu(true);});}
function startEnemyTurn() {turn = 'enemy';toggleActionMenu(false);setMonsterImage('idle');showMessage("몬스터의 턴입니다.", () => {const quiz = currentMonster.quizBank[Math.floor(Math.random() * currentMonster.quizBank.length)];showQuiz(quiz, (isCorrect) => {if (isCorrect) {setMonsterImage('hurt');const reducedDamage = Math.floor(currentMonster.attack * 0.5);player.hp = Math.max(0, player.hp - reducedDamage);updateUI();showMessage(`방어 성공! ${reducedDamage}의 데미지를 받았다!`, checkBattleEnd);} else {setMonsterImage('happy');player.hp = Math.max(0, player.hp - currentMonster.attack);updateUI();showMessage(`방어 실패! ${currentMonster.attack}의 데미지를 받았다!`, checkBattleEnd);}});});}
function handleAction(action) {if (turn !== 'player') return;toggleActionMenu(false);const quiz = currentMonster.quizBank[Math.floor(Math.random() * currentMonster.quizBank.length)];switch(action) {case 'attack':showQuiz(quiz, (isCorrect) => {if (isCorrect) {setMonsterImage('hurt');currentMonster.hp = Math.max(0, currentMonster.hp - player.attack);updateUI();showMessage(`공격 성공! ${player.attack}의 데미지!`, checkBattleEnd);} else { setMonsterImage('happy'); showMessage("공격이 빗나갔다...", checkBattleEnd); }});break;case 'skill': openSkillMenu(); break;case 'item': openItemMenu(); break;case 'flee':showQuiz(quiz, (isCorrect) => {if (isCorrect && Math.random() < 0.5) {showMessage("도망치는데 성공했다!", () => gameClearEl.classList.remove('hidden'));} else { showMessage("도망칠 수 없었다...", checkBattleEnd); }});break;}}
function checkBattleEnd() {updateUI();if (player.hp <= 0) { gameOverEl.classList.remove('hidden'); return; }if (currentMonster.hp <= 0) { victoryMessageEl.textContent = `${currentMonster.name}를 쓰러트렸다!`; openModal(victoryModal); return; }if (turn === 'player') startEnemyTurn();else startPlayerTurn();}
function openSkillMenu() {skillList.innerHTML = '';player.equippedCards.forEach(cardId => {const card = cardDB[cardId];if (!card || !card.skillId) return;const skill = skillDB[card.skillId];if(!skill) return;const button = document.createElement('button');button.className = 'menu-item-btn';button.innerHTML = `${skill.name} <span class="item-quantity">MP ${skill.mpCost}</span><br><small>${skill.desc}</small>`;button.disabled = player.mp < skill.mpCost;button.onclick = () => useSkill(skill);skillList.appendChild(button);});openModal(skillModal);}
function useSkill(skill) {closeModal();const quiz = currentMonster.quizBank[Math.floor(Math.random() * currentMonster.quizBank.length)];showQuiz(quiz, (isCorrect) => {player.mp -= skill.mpCost;if (isCorrect) {setMonsterImage('hurt');if (skill.type === 1) {const damage = Math.floor(player.attack * skill.effect);currentMonster.hp = Math.max(0, currentMonster.hp - damage);showMessage(`${skill.name} 발동! ${damage}의 데미지!`, checkBattleEnd);} else if (skill.type === 2) {player.hp += skill.effect;showMessage(`${skill.name} 발동! HP를 ${skill.effect} 회복했다!`, checkBattleEnd);}} else {setMonsterImage('happy');showMessage("스킬 발동에 실패했다...", checkBattleEnd);}updateUI();});}
function openItemMenu() {const usableItems = Object.keys(player.inventory).filter(key => player.inventory[key] > 0);if (usableItems.length === 0) {showMessage("사용할 아이템이 없습니다.");setTimeout(() => { toggleActionMenu(true); }, 1500);return;}itemList.innerHTML = '';usableItems.forEach(key => {const item = itemDB[key];if (!item) return;const quantity = player.inventory[key];const button = document.createElement('button');button.className = 'menu-item-btn';button.innerHTML = `${item.name} <span class="item-quantity">x${quantity}</span><br><small>${item.desc}</small>`;button.onclick = () => useItem(item);itemList.appendChild(button);});openModal(itemModal);}
function useItem(item) {closeModal();player.inventory[item.id]--;let message = '';if (item.type === 1) {player.hp += item.value;message = `${item.name} 사용! HP를 ${item.value} 회복했다.`;} else if (item.type === 2) {player.mp += item.value;message = `${item.name} 사용! MP를 ${item.value} 회복했다.`;} else if (item.type === 3) {setMonsterImage('hurt');currentMonster.hp = Math.max(0, currentMonster.hp - item.value);message = `${item.name} 사용! 몬스터에게 ${item.value}의 데미지를 주었다!`;}updateUI();showMessage(message, checkBattleEnd);}
async function initGame() {
    messageTextEl.textContent = "게임 데이터를 불러오는 중...";
    const dataLoaded = await fetchGameData();
    if (!dataLoaded) return;

    player = { 
        name: '용사', baseHp: 80, baseMp: 40, baseAttack: 10,
        hp: 80, mp: 40, attack: 10, maxHp: 80, maxMp: 40,
        equippedCards: ['C001'],
        inventory: { 'I001': 2, 'I002': 2, 'I003': 1 },
    };
    calculatePlayerStats();
    player.hp = player.maxHp;
    player.mp = player.maxMp;

    currentMonsterIndex = 0;
    generateMonsters();
    currentMonster = { ...monsters[currentMonsterIndex] }; 
    playerNameEl.textContent = player.name;
    monsterNameEl.textContent = currentMonster.name;
    
    actionButtons.forEach(btn => btn.addEventListener('click', () => handleAction(btn.dataset.action)));
    document.querySelectorAll('.modal-close-btn').forEach(btn => btn.addEventListener('click', () => {
        closeModal();
        if(turn === 'player') toggleActionMenu(true);
    }));
    continueBattleBtn.addEventListener('click', () => {
        closeModal();
        currentMonsterIndex++;
        if (currentMonsterIndex >= monsters.length) {
            gameClearEl.classList.remove('hidden');
        } else {
            currentMonster = { ...monsters[currentMonsterIndex] };
            monsterNameEl.textContent = currentMonster.name;
            updateUI();
            startPlayerTurn();
        }
    });
    infoBtn.addEventListener('click', () => {
        let cardListHTML = '';
        player.equippedCards.forEach(cardId => {
            if (cardDB[cardId]) {
                cardListHTML += `<li>${cardDB[cardId].name}</li>`;
            }
        });
        if (player.equippedCards.length === 0) cardListHTML = '<li>없음</li>';
        infoList.innerHTML = `
            <p><strong>최대 HP:</strong> ${player.maxHp} (${player.baseHp} + ${player.maxHp - player.baseHp})</p>
            <p><strong>최대 MP:</strong> ${player.maxMp} (${player.baseMp} + ${player.maxMp - player.baseMp})</p>
            <p><strong>공격력:</strong> ${player.attack} (${player.baseAttack} + ${player.attack - player.baseAttack})</p>
            <p><strong>장착 카드:</strong></p>
            <ul>${cardListHTML}</ul>
        `;
        openModal(infoModal);
    });
    
    updateUI();
    startPlayerTurn();
}

initGame();