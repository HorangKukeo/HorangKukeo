// === DOM 요소 가져오기 (이전과 동일) ===
const playerLevelEl = document.getElementById('player-level');
const playerHpBar = document.getElementById('player-hp-bar');
const playerHpText = document.getElementById('player-hp-text');
const playerExpBar = document.getElementById('player-exp-bar');
const playerExpText = document.getElementById('player-exp-text');
const monsterNameEl = document.getElementById('monster-name');
const monsterHpBar = document.getElementById('monster-hp-bar');
const monsterHpText = document.getElementById('monster-hp-text');
const questionArea = document.getElementById('question-area');
const questionTextEl = document.getElementById('question-text');
const actionButtonsEl = document.getElementById('action-buttons');
const messageLogEl = document.querySelector('#message-log p');
const gameOverEl = document.getElementById('game-over');
const gameClearEl = document.getElementById('game-clear');
const restartButton = document.getElementById('restart-button');
const restartButtonClear = document.getElementById('restart-button-clear');
const continueContainer = document.getElementById('continue-container');
const continueButton = document.getElementById('continue-button');

// === 🔥 변경점: 일상, 학습 어휘 중심의 신규 단어 DB ===
// Lv. 1
const wordDB_lv1 = [
    { sentence: '맑은 @하늘@이 보인다.', pos: '명사' }, { sentence: '나는 @학생@이다.', pos: '명사' },
    { sentence: '@이것@은 연필이다.', pos: '대명사' }, { sentence: '@우리@는 친구다.', pos: '대명사' },
    { sentence: '사과 @하나@ 주세요.', pos: '수사' }, { sentence: '@두@ 사람이 걷는다.', pos: '관형사' },
    { sentence: '밥을 @먹다@.', pos: '동사' }, { sentence: '책을 @읽다@.', pos: '동사' },
    { sentence: '날씨가 @좋다@.', pos: '형용사' }, { sentence: '가방이 @무겁다@.', pos: '형용사' },
    { sentence: '@새@ 신을 신었다.', pos: '관형사' }, { sentence: '@이@ 사람은 누구야?', pos: '관형사' },
    { sentence: '차가 @빨리@ 달린다.', pos: '부사' }, { sentence: '공부를 @열심히@ 한다.', pos: '부사' },
    { sentence: '@와@, 정말 멋지다!', pos: '감탄사' }, { sentence: '@네@, 맞아요.', pos: '감탄사' },
    { sentence: '학교@에@ 간다.', pos: '조사' }, { sentence: '빵@과@ 우유를 먹었다.', pos: '조사' },
    { sentence: '@저@ 산은 한라산이다.', pos: '관형사' }, { sentence: '@예쁜@ 꽃이 피었구나.', pos: '형용사' }
];
// Lv. 2
const wordDB_lv2 = [
    { sentence: '우리 @가족@은 행복하다.', pos: '명사' }, { sentence: '@여름@은 덥다.', pos: '명사' },
    { sentence: '@거기@에 누가 있니?', pos: '대명사' }, { sentence: '@너희@는 어디 가니?', pos: '대명사' },
    { sentence: '@셋째@ 아이가 똑똑하다.', pos: '관형사' }, { sentence: '@다섯@의 사람이 있다.', pos: '수사' },
    { sentence: '음악을 @듣는구나@.', pos: '동사' }, { sentence: '창문을 @열어라@.', pos: '동사' },
    { sentence: '방이 @깨끗하네@.', pos: '형용사' }, { sentence: '동생은 @착하더라@.', pos: '형용사' },
    { sentence: '@헌@ 옷은 버렸다.', pos: '관형사' }, { sentence: '@여러@ 나라를 여행했다.', pos: '관형사' },
    { sentence: '밥을 @아주@ 많이 먹었다.', pos: '부사' }, { sentence: '버스가 @천천히@ 움직인다.', pos: '부사' },
    { sentence: '@아차@, 숙제를 잊었다.', pos: '감탄사' }, { sentence: '@응@, 나도 갈게.', pos: '감탄사' },
    { sentence: '도서관@에서@ 책을 읽는다.', pos: '조사' }, { sentence: '너@를@ 좋아해.', pos: '조사' },
    { sentence: '@푸르게@ 빛나는 별.', pos: '형용사' }, { sentence: '@모든@ 사람은 소중하다.', pos: '관형사' }
];
// Lv. 3
const wordDB_lv3 = [
    { sentence: '건강한 @정신@이 중요하다.', pos: '명사' }, { sentence: '나는 @곧@ 여행을 떠난다.', pos: '부사' },
    { sentence: '@무엇@을 도와드릴까요?', pos: '대명사' }, { sentence: '@앞@으로 나와서 자신을 소개해보세요.', pos: '명사' },
    { sentence: '@일곱@ 빛깔 무지개.', pos: '관형사' }, { sentence: '@첫째@로 건강이 최고다.', pos: '수사' },
    { sentence: '친구와 @놀고@ 집으로 돌아왔다.', pos: '동사' }, { sentence: '편지를 @쓰는@ 학생들.', pos: '동사' },
    { sentence: '밤하늘이 @아름답네@.', pos: '형용사' }, { sentence: '그의 목소리는 @부드러웠다@.', pos: '형용사' },
    { sentence: '@어떤@ 색을 좋아하니?', pos: '관형사' }, { sentence: '@옛날@ 옛적에 호랑이가 살았다.', pos: '명사' },
    { sentence: '동생이 @갑자기@ 울었다.', pos: '부사' }, { sentence: '나는 @자주@ 영화를 본다.', pos: '부사' },
    { sentence: '@어머나@, 벌써 시간이 이렇게 됐네.', pos: '감탄사' }, { sentence: '@글쎄@, 잘 모르겠는데.', pos: '감탄사' },
    { sentence: '서울@까지@ 걸어갔다.', pos: '조사' }, { sentence: '너@와@ 나는 친구야.', pos: '조사' },
    { sentence: '그는 참 @재미있었어@.', pos: '형용사' }, { sentence: '그녀는 @친절하다@.', pos: '형용사' }
];
// Lv. 4
const wordDB_lv4 = [
    { sentence: '정확한 정보를 찾아야@만@ 한다.', pos: '조사' }, { sentence: '우리 @사회@는 발전하고 있다.', pos: '명사' },
    { sentence: '@누구@든지 환영합니다.', pos: '대명사' }, { sentence: '@아무@도 그 사실을 몰랐다.', pos: '대명사' },
    { sentence: '@열@ 명의 학생이 결석했다.', pos: '관형사' }, { sentence: '@여덟@ 시에 만나자.', pos: '관형사' },
    { sentence: '@새로운@ 사실을 알게 되었어.', pos: '형용사' }, { sentence: '친구를 @도왔다@.', pos: '동사' },
    { sentence: '그는 @정직하다@.', pos: '형용사' }, { sentence: '시험 문제가 @어렵네@.', pos: '형용사' },
    { sentence: '@다른@ 의견 있나요?', pos: '관형사' }, { sentence: '@웬@ 빵이야?', pos: '관형사' },
    { sentence: '우리는 @서로@ 협동했다.', pos: '부사' }, { sentence: '나는 @가끔@ 산책을 한다.', pos: '부사' },
    { sentence: '@자@, 이제 시작해볼까?', pos: '감탄사' }, { sentence: '@에이@, 그건 아니지.', pos: '감탄사' },
    { sentence: '부모님@께서@ 오셨다.', pos: '조사' }, { sentence: '나@보다@ 키가 크다.', pos: '조사' },
    { sentence: '꿈을 @이루었어요@.', pos: '동사' }, { sentence: '학생 @셋@이 걸어가고 있네.', pos: '수사' }
];
// Lv. 5
const wordDB_lv5 = [
    { sentence: '꾸준한 @노력@이 결실을 맺었다.', pos: '명사' }, { sentence: '언제나 @환경@을 보호해야 한다.', pos: '명사' },
    { sentence: '@어디@에 사는지 물어봐도 될까요?', pos: '대명사' }, { sentence: '@우리@도 슬슬 밥 먹을까요?', pos: '대명사' },
    { sentence: '@아홉@ 시 뉴스를 본다.', pos: '관형사' }, { sentence: '학생들을 @모두@ 불러모았다.', pos: '부사' },
    { sentence: '새로운 집을 @지어라@.', pos: '동사' }, { sentence: '자전거를 @배운다@.', pos: '동사' },
    { sentence: '그의 생각은 @자유로웠어@.', pos: '형용사' }, { sentence: '오늘은 날씨가 @따뜻하게@ 바뀌었네.', pos: '형용사' },
    { sentence: '@몇@ 명이나 왔나요?', pos: '관형사' }, { sentence: '@온@ 세상이 하얗게 변했다.', pos: '관형사' },
    { sentence: '@결코@ 포기하지 않겠어!', pos: '부사' }, { sentence: '@함께@ 노래를 불렀지.', pos: '부사' },
    { sentence: '@옳지@, 바로 그거야!', pos: '감탄사' }, { sentence: '@천만에@, 별말씀을요.', pos: '감탄사' },
    { sentence: '너@처럼@ 되고 싶어.', pos: '조사' }, { sentence: '약속@은@ 지켜야 한다.', pos: '조사' },
    { sentence: '먹을 @것@이 전혀 없어.', pos: '명사' }, { sentence: '그녀는 @서럽게@ 울었다.', pos: '형용사' }
];

const allWordDBs = [wordDB_lv1, wordDB_lv2, wordDB_lv3, wordDB_lv4, wordDB_lv5];
const posList = ['명사', '대명사', '수사', '동사', '형용사', '관형사', '부사', '감탄사', '조사'];
let player = {};
let monsters = [];
let currentMonsterIndex = 0;
let isBattlePhase = true;

// === 헬퍼 함수 및 몬스터 생성 함수 ===
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function generateNewQuestion(monster) {
    const level = parseInt(monster.name.match(/\d+/)[0]); // "품사 Lv. 10"에서 숫자(10) 추출
    const currentWordBank = allWordDBs[level - 1];
    const sentenceData = currentWordBank[Math.floor(Math.random() * currentWordBank.length)];
    const sentenceParts = sentenceData.sentence.split('@');
    const targetWord = sentenceParts[1];
    const questionSentence = `${sentenceParts[0]}<u>${targetWord}</u>${sentenceParts[2]}`;
    monster.question = `다음 문장에서 밑줄 친 단어의 품사는?<br><br>"${questionSentence}"`;
    monster.correctAnswer = sentenceData.pos;
    const wrongAnswers = posList.filter(p => p !== monster.correctAnswer);
    shuffleArray(wrongAnswers);
    const choices = [monster.correctAnswer, ...wrongAnswers.slice(0, 4)];
    monster.answers = shuffleArray(choices);
}

function generateMonsters() {
    monsters = [];
    for (let level = 1; level <= 5; level++) {
        const monster = {
            name: `품사 Lv. ${level}`,
            hp: 25 + 5 * level, 
            maxHp: 25 + 5 * level,
            attack: 0 + 8 * level, 
            exp: 0 + 10 * level,
        };
        generateNewQuestion(monster);
        monsters.push(monster);
    }
}

// === 게임 핵심 로직 (이하 이전과 동일) ===

function updateUI() {
    playerLevelEl.textContent = player.level;
    playerHpText.textContent = `${player.hp} / ${player.maxHp}`;
    playerExpText.textContent = `${player.exp} / ${player.maxExp}`;
    playerHpBar.style.width = `${(player.hp / player.maxHp) * 100}%`;
    playerExpBar.style.width = `${(player.exp / player.maxExp) * 100}%`;

    const currentMonster = monsters[currentMonsterIndex];
    monsterNameEl.textContent = currentMonster.name;
    monsterHpText.textContent = `${currentMonster.hp} / ${currentMonster.maxHp}`;
    monsterHpBar.style.width = `${(currentMonster.hp / currentMonster.maxHp) * 100}%`;
}

function setupMonster() {
    const monster = monsters[currentMonsterIndex];
    questionTextEl.innerHTML = monster.question;
    actionButtonsEl.innerHTML = '';
    monster.answers.forEach(answer => {
        const button = document.createElement('button');
        button.className = 'attack-btn';
        button.textContent = answer;
        button.addEventListener('click', handleAnswerClick);
        actionButtonsEl.appendChild(button);
    });
    updateUI();
    isBattlePhase = true;
}

function handleAnswerClick(event) {
    if (!isBattlePhase) return;
    isBattlePhase = false;
    document.querySelectorAll('#action-buttons .attack-btn').forEach(btn => btn.disabled = true);

    const selectedAnswer = event.target.textContent;
    const monster = monsters[currentMonsterIndex];

    if (selectedAnswer === monster.correctAnswer) {
        const damage = player.attack + Math.floor(Math.random() * 5);
        monster.hp = Math.max(0, monster.hp - damage);
        logMessage(`정답! ${monster.name}에게 ${damage}의 데미지를 입혔다!`, 'green');
    } else {
        const damage = monster.attack + Math.floor(Math.random() * 3);
        player.hp = Math.max(0, player.hp - damage);
        logMessage(`오답! ${monster.name}에게 ${damage}의 데미지를 받았다...`, 'red');
    }
    updateUI();
    setTimeout(() => {
        if (player.hp <= 0) {
            gameOver();
            return;
        }
        if (monster.hp <= 0) {
            gainExp(monster.exp);
        } else {
            logMessage(`${monster.name}가 다음 문제를 낸다!`);
            generateNewQuestion(monster);
            setupMonster();
        }
    }, 1500);
}

function gainExp(exp) {
    logMessage(`${monsters[currentMonsterIndex].name}를 쓰러트렸다!`, 'yellow');
    player.exp += exp;
    logMessage(`경험치 ${exp}를 획득했다!`);
    if (player.exp >= player.maxExp) {
        levelUp();
    }
    questionArea.classList.add('hidden');
    actionButtonsEl.classList.add('hidden');
    continueContainer.classList.remove('hidden');
    continueButton.classList.remove('hidden');
}

function handleContinueClick() {
    continueContainer.classList.add('hidden');
    continueButton.classList.add('hidden');
    questionArea.classList.remove('hidden');
    actionButtonsEl.classList.remove('hidden');
    currentMonsterIndex++;
    if (currentMonsterIndex >= monsters.length) {
        gameClear();
    } else {
        logMessage(`새로운 몬스터, ${monsters[currentMonsterIndex].name}가 나타났다!`);
        setupMonster();
    }
}

function levelUp() {
    while (player.exp >= player.maxExp) {
        player.level++;
        player.exp -= player.maxExp;
        player.maxHp += 5;
        player.hp = player.maxHp;
        player.maxExp = Math.floor(player.maxExp * 1.5);
        logMessage(`레벨 업! LV.${player.level}이 되었다!`, 'cyan');
    }
}

function gameOver() {
    isBattlePhase = false;
    logMessage('쓰러지고 말았다...', 'red');
    gameOverEl.classList.remove('hidden');
}

function gameClear() {
    isBattlePhase = false;
    logMessage('모든 몬스터를 물리쳤다! 평화가 찾아왔다!', 'lime');
    gameClearEl.classList.remove('hidden');
}

function logMessage(msg, color = 'white') {
    messageLogEl.textContent = msg;
    messageLogEl.style.color = color;
}

function initGame() {
    player = { level: 1, hp: 30, maxHp: 30, exp: 0, maxExp: 20, attack: 10 };
    generateMonsters();
    currentMonsterIndex = 0;
    gameOverEl.classList.add('hidden');
    gameClearEl.classList.add('hidden');
    continueContainer.classList.add('hidden');
    continueButton.classList.add('hidden');
    questionArea.classList.remove('hidden');
    actionButtonsEl.classList.remove('hidden');
    logMessage(`야생의 ${monsters[0].name}가 나타났다!`);
    setupMonster();
}

// === 이벤트 리스너 ===
restartButton.addEventListener('click', initGame);
restartButtonClear.addEventListener('click', initGame);
continueButton.addEventListener('click', handleContinueClick);

// === 게임 시작 ===
initGame();