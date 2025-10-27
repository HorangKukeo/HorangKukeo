// === DOM 요소 가져오기 ===
const cardDexModal = document.getElementById('card-dex-modal');
const equippedCardsSection = document.getElementById('equipped-cards-section');
const cardDexSection = document.getElementById('card-dex-section');
const cardDetailModal = document.getElementById('card-detail-modal');
const detailCardNumberEl = document.getElementById('card-detail-number');
const detailCardNameEl = document.getElementById('card-detail-name'); // ID 확인
const detailCardInfoEl = document.getElementById('card-detail-info');
const detailCardStatsEl = document.getElementById('card-detail-stats');
const detailCardSkillEl = document.getElementById('card-detail-skill');
const detailCardDescEl = document.getElementById('card-detail-desc');
const dexFilterButtons = document.getElementById('dex-filter-buttons');
const fullScreenLoader = document.getElementById('full-screen-loader'); // 👈 [신규]
const fullScreenLoaderMessage = document.getElementById('full-screen-loader-message'); // 👈 [신규]
const dungeonListEl = document.getElementById('dungeon-list');
const dungeonCategoryListEl = document.getElementById('dungeon-category-list'); // [추가]
const userNicknameEl = document.getElementById('user-nickname');
const userGoldEl = document.getElementById('user-gold');
const userPosPointsEl = document.getElementById('user-pos-points');
const userScPointsEl = document.getElementById('user-sc-points');
const userCardCountEl = document.getElementById('user-card-count');
const playerHpBar = document.getElementById('player-hp-bar');
const playerHpValue = document.getElementById('player-hp-value');
const playerHpDetails = document.getElementById('player-hp-details');
const playerMpBar = document.getElementById('player-mp-bar');
const playerMpValue = document.getElementById('player-mp-value');
const playerMpDetails = document.getElementById('player-mp-details');
const playerAttackBar = document.getElementById('player-attack-bar');
const playerAttackValue = document.getElementById('player-attack-value');
const playerAttackDetails = document.getElementById('player-attack-details');
const cardViewBtn = document.getElementById('card-view-btn');
const itemViewBtn = document.getElementById('item-view-btn');
const modalBackdrop = document.getElementById('modal-backdrop');
const cardManagementModal = document.getElementById('card-management-modal');
const equippedCardManageList = document.getElementById('equipped-card-manage-list');
const ownedCardManageList = document.getElementById('owned-card-manage-list');
const itemViewModal = document.getElementById('item-view-modal');
const itemViewList = document.getElementById('item-view-list');
const mainMenuEl = document.getElementById('main-menu');
const exploreBtn = document.getElementById('explore-btn');
const shopBtn = document.getElementById('shop-btn');
const gachaBtn = document.getElementById('gacha-btn');
const dungeonModal = document.getElementById('dungeon-modal');
const shopModal = document.getElementById('shop-modal');
const shopItemList = document.getElementById('shop-item-list');
const shopUserGold = document.getElementById('shop-user-gold');
const gachaModal = document.getElementById('gacha-modal');
const gachaPackList = document.getElementById('gacha-pack-list');
const gachaResultView = document.getElementById('gacha-result-view');
const gachaResultCard = document.getElementById('gacha-result-card');
const gachaConfirmBtn = document.getElementById('gacha-confirm-btn');
const detailModalCloseBtn = document.getElementById('detail-modal-close-btn');
const gachaCategoryListEl = document.getElementById('gacha-category-list');
const goalsBtn = document.getElementById('goals-btn');
const growthGoalsModal = document.getElementById('growth-goals-modal');
const goalsAchievedCountEl = document.getElementById('goals-achieved-count');
const goalListEl = document.getElementById('goal-list');
let currentDexPage = '1-10';

// [신규] 튜토리얼 상태 변수
let isTutorialActive = false;
let tutorialStep = 0;
let tutorialUserData = null;

// [신규] (요구사항 4) 튜토리얼 오버레이(커튼) 요소 생성
const tutorialOverlay = document.createElement('div');
tutorialOverlay.id = 'ui-curtain'; // ID 변경

const GACHA_CATEGORIES = {
    '품사 ①': ['CP001', 'CP002', 'CP003'],
    '품사 ②': ['CP004', 'CP005', 'CP006', 'CP007', 'CP008','CP010'],
    '문장 성분 ①': ['CP021', 'CP022', 'CP023'],
    '문장 성분 ②': ['CP024', 'CP025', 'CP026', 'CP027', 'CP028','CP030']
    // 추후 새로운 카테고리와 카드팩 ID를 여기에 추가하면 됩니다.
};

// Webhook URL
const GAME_DATA_URL = 'https://hook.us2.make.com/9a5ve7598e6kci7tchidj4669axhbw91';
const VISIBLE_DUNGEON_IDS = ['D001', 'D002', 'D003', 'D004', 'D005', 'D006', 'D007', 'D008', 'D009', 'D011','D012','D013',
    'D021','D022','D023','D024','D025','D026','D027','D028',
    'D029', 'D030','D031','D032'];

// [신규] 로딩 지연을 위한 sleep 함수
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchAndStoreGameData() {
    try {
        fullScreenLoaderMessage.textContent = "게임 데이터를 서버에서 불러오는 중...";
        const response = await fetch(GAME_DATA_URL);
        if (!response.ok) throw new Error(`서버 응답 오류: ${response.status}`);
        const data = await response.json();

        // ▼ [수정] 데이터 처리 시작
        fullScreenLoaderMessage.textContent = "데이터 처리 중... (0/7)";
        await sleep(150); // (표시를 위한 약간의 지연)

        const parseDB = (rawData, headers) => {
            if (!rawData) return [];
            return rawData.map(s => JSON.parse(s)).map(rawObj => {
                const newObj = {};
                headers.forEach((header, index) => { newObj[header] = rawObj[index]; });
                return newObj;
            });
        };

        // 1. 카드 DB
        const cards = parseDB(data.Cards, ['id', 'name', 'hpBonus', 'mpBonus', 'attackBonus', 'skillId', 'description', 'class']);
        cards.forEach(card => {
            card.hpBonus = parseInt(card.hpBonus, 10) || 0;
            card.mpBonus = parseInt(card.mpBonus, 10) || 0;
            card.attackBonus = parseInt(card.attackBonus, 10) || 0;
        });
        localStorage.setItem('cardDB', JSON.stringify(cards));
        fullScreenLoaderMessage.textContent = "카드 데이터 처리 완료 (1/7)";
        await sleep(150);

        // 2. 스킬 DB
        const skills = parseDB(data.Skills, ['id', 'name', 'type', 'effect', 'mpCost', 'desc']);
        skills.forEach(skill => {
            skill.type = parseInt(skill.type, 10) || 0;
            skill.effect = parseFloat(skill.effect) || 0;
            skill.mpCost = parseInt(skill.mpCost, 10) || 0;
        });
        localStorage.setItem('skillDB', JSON.stringify(skills));
        fullScreenLoaderMessage.textContent = "스킬 데이터 처리 완료 (2/7)";
        await sleep(150);

        // 3. 아이템 DB
        const items = parseDB(data.Items, ['id', 'name', 'type', 'value', 'price', 'forSale', 'desc']);
        items.forEach(item => {
            item.type = parseInt(item.type, 10) || 0;
            item.value = parseInt(item.value, 10) || 0;
            item.price = parseInt(item.price, 10) || 0;
            item.forSale = parseInt(item.forSale, 10) || 0;
        });
        localStorage.setItem('itemDB', JSON.stringify(items));
        fullScreenLoaderMessage.textContent = "아이템 데이터 처리 완료 (3/7)";
        await sleep(150);
        
        // 4. 카드팩 DB
        const cardPacks = parseDB(data.CardPacks, ['id', 'name', 'priceGold', 'pricePoints', 'description', 'forSale', 'cardPool']);
        cardPacks.forEach(pack => {
            pack.priceGold = parseInt(pack.priceGold, 10) || 0;
            try {
                pack.pricePoints = pack.pricePoints ? JSON.parse(pack.pricePoints) : {};
            } catch (e) {
                console.error(`카드팩(${pack.id})의 pricePoints JSON 파싱 오류:`, pack.pricePoints);
                pack.pricePoints = {};
            }
            pack.forSale = parseInt(pack.forSale, 10) || 0;
        });
        localStorage.setItem('cardPackDB', JSON.stringify(cardPacks));
        fullScreenLoaderMessage.textContent = "카드팩 데이터 처리 완료 (4/7)";
        await sleep(150);

        // 5. 던전 DB
        localStorage.setItem('dungeonDB', JSON.stringify(parseDB(data.Dungeons, ['id', 'name', 'area', 'recommendedLevel', 'monster1Id', 'monster2Id', 'monster3Id', 'monster4Id', 'monster5Id'])));
        fullScreenLoaderMessage.textContent = "던전 데이터 처리 완료 (5/7)";
        await sleep(150);

        // 6. 몬스터 DB
        localStorage.setItem('monsterDB', JSON.stringify(parseDB(data.Monsters, ['id', 'name', 'level', 'hp', 'mp', 'attack', 'goldReward', 'pointReward', 'affiliation', 'questionPool', 'skillId1', 'skillId2', 'skillId3', 'img'])));
        fullScreenLoaderMessage.textContent = "몬스터 데이터 처리 완료 (6/7)";
        await sleep(150);

        // 7. 문제 DB
        localStorage.setItem('questionDB', JSON.stringify(parseDB(data.Questions, ['id', 'name', 'type', 'question1', 'question2', 'question3', 'question4', 'question5', 'question6', 'question7', 'question8', 'question9', 'question10', 'question11', 'question12', 'question13', 'question14', 'question15', 'question16', 'question17', 'question18', 'question19', 'question20'])));
        fullScreenLoaderMessage.textContent = "문제 데이터 처리 완료 (7/7)";
        await sleep(200); // 마지막 단계는 조금 더 길게
        
        return true;
    } catch (error) {
        console.error('게임 데이터를 불러오는 중 오류 발생:', error);
        fullScreenLoaderMessage.textContent = '데이터 로딩 실패! 페이지를 새로고침 해주세요.';
        return false;
    }
}

function displayUserData() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    const cardDB = JSON.parse(localStorage.getItem('cardDB'));
    if (!userData || !cardDB) {
        document.body.innerHTML = "<h1>사용자 데이터를 불러오는 데 실패했습니다. 다시 로그인해주세요.</h1>";
        return;
    }

    const playerPortraitImg = document.querySelector('.player-portrait img');

    // --- 1. 기본 스탯 ---
    const baseHp = userData.baseHp;
    const baseMp = userData.baseMp;
    const baseAttack = userData.baseAttack;

    // --- 2. 도감(보유 카드) 보너스 계산 ---
    const ownedCardCount = userData.ownedCards.length;

        // --- (1) 보너스 설정 배열 (이 부분만 수정하세요) ---
        const tierBonuses = [
            { hp: 10, mp: 5, att: 5 },   // 10개 이상
            { hp: 15, mp: 8, att: 7 }, // 20개 이상
            { hp: 20, mp: 12, att: 13 }  // 30개 이상
            // 40개 이상 보너스를 추가하려면 여기에 { hp: X, mp: Y, att: Z } 추가
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


    // --- 3. 장착 카드 보너스 계산 ---
    let equippedHpBonus = 0;
    let equippedMpBonus = 0;
    let equippedAttackBonus = 0;
    
    userData.equippedCards.forEach(cardId => {
        const card = cardDB.find(c => c.id === cardId);
        if (card) {
            equippedHpBonus += card.hpBonus;
            equippedMpBonus += card.mpBonus;
            equippedAttackBonus += card.attackBonus;
        }
    });

    // --- 4. 최종 스탯 계산 ---
    const maxHp = baseHp + collectionHpBonus + equippedHpBonus;
    const maxMp = baseMp + collectionMpBonus + equippedMpBonus;
    const totalAttack = baseAttack + collectionAttackBonus + equippedAttackBonus;

    // --- 5. 플레이어 이미지 변경 로직 ---
    let conditionsMet = 0;
    if (maxHp >= 50) conditionsMet++;
    if (maxHp >= 80) conditionsMet++;
    if (maxHp >= 160) conditionsMet++;
    if (maxHp >= 250) conditionsMet++;
    if (maxHp >= 350) conditionsMet++;
    if (maxHp >= 500) conditionsMet++;

    if (maxMp >= 50) conditionsMet++;
    if (maxMp >= 80) conditionsMet++;
    if (maxMp >= 160) conditionsMet++;
    if (maxMp >= 190) conditionsMet++;
    if (maxMp >= 250) conditionsMet++;
    if (maxMp >= 350) conditionsMet++;

    if (totalAttack >= 30) conditionsMet++;
    if (totalAttack >= 45) conditionsMet++;
    if (totalAttack >= 70) conditionsMet++;
    if (totalAttack >= 100) conditionsMet++;
    if (totalAttack >= 140) conditionsMet++;
    if (totalAttack >= 190) conditionsMet++;
    
    playerPortraitImg.src = `img/player${conditionsMet}.png`;

    // --- 6. UI 텍스트 표시 ---
    userNicknameEl.textContent = userData.nickname;
    userGoldEl.textContent = userData.gold;
    userPosPointsEl.textContent = userData.points.partsOfSpeech || 0;
    userScPointsEl.textContent = userData.points.sentenceComponents || 0;
    
    userCardCountEl.textContent = ownedCardCount;
    
    // [수정] HP 바 내부 텍스트 업데이트
    playerHpBar.style.width = '100%';
    playerHpValue.textContent = maxHp;
    playerHpDetails.textContent = `(기본 ${baseHp} + 도감 ${collectionHpBonus} + 장착 ${equippedHpBonus})`;

    // [수정] MP 바 내부 텍스트 업데이트
    playerMpBar.style.width = '100%';
    playerMpValue.textContent = maxMp;
    playerMpDetails.textContent = `(기본 ${baseMp} + 도감 ${collectionMpBonus} + 장착 ${equippedMpBonus})`;

    playerAttackBar.style.width = '100%'; // 공격력 바도 항상 100%로 표시 (값만 표시)
    playerAttackValue.textContent = totalAttack;
    playerAttackDetails.textContent = `(기본 ${baseAttack} + 도감 ${collectionAttackBonus} + 장착 ${equippedAttackBonus})`;
}

function openCardDetailModal(cardId) {const cardDB = JSON.parse(localStorage.getItem('cardDB'));
    const skillDB = JSON.parse(localStorage.getItem('skillDB'));
    const card = cardDB.find(c => c.id === cardId);
    if (!card) return;

    // --- 상단 헤더 정보 설정 (변경 없음) ---
    detailCardNumberEl.textContent = `#${card.id.replace('C', '')}`;
    detailCardNameEl.textContent = card.name;

    // --- [수정] 카드 정보 영역 내용 (2x2 Grid) ---
    detailCardInfoEl.innerHTML = `
        <h4>카드 정보</h4>
        <div class="info-grid">
            <div class="grid-item">
                <span class="label">HP</span>
                <span class="value">+${card.hpBonus}</span>
            </div>
            <div class="grid-item">
                <span class="label">등급</span>
                <span class="value">${card.class || '미분류'}</span>
            </div>
            <div class="grid-item">
                <span class="label">MP</span>
                <span class="value">+${card.mpBonus}</span>
            </div>
            <div class="grid-item">
                <span class="label">ATK</span>
                <span class="value">+${card.attackBonus}</span>
            </div>
        </div>
    `;

    // --- [삭제] 능력치 보너스 영역 처리 코드 삭제 ---
    // detailCardStatsEl.innerHTML = `...`; 부분 삭제

    // --- 스킬 정보 영역 내용 (변경 없음, 단 info-item 클래스 적용) ---
    const skill = skillDB.find(s => s.id === card.skillId);
    if (skill) {
        detailCardSkillEl.innerHTML = `
            <h4>스킬 정보</h4>
            <div class="info-item">
                <span class="label" style="width: auto; text-align: left;">이름</span> <span class="value">${skill.name} (MP ${skill.mpCost})</span>
            </div>
            <div class="info-item">
                <span class="label" style="width: auto; text-align: left;">효과</span> <span class="value">${skill.desc || '설명 없음'}</span>
            </div>
        `;
        detailCardSkillEl.classList.remove('hidden');
    } else {
        detailCardSkillEl.innerHTML = `<h4>스킬 정보</h4><p class="value" style="text-align: left;">없음</p>`; // 스킬 없을 때
    }

    // --- 설명 영역 내용 (변경 없음) ---
    detailCardDescEl.innerHTML = `
        <h4>설명</h4>
        <p>${card.description || '알려진 바가 없다.'}</p>
    `;

    // 상세보기 모달 열기
    openModal(cardDetailModal);
}

function renderCardDex(isTutorial = false) {
    // 튜토리얼 모드일 때는 임시 데이터 사용, 아니면 실제 데이터 사용
    const userData = isTutorial ? tutorialUserData : JSON.parse(localStorage.getItem('userData'));
    const cardDB = JSON.parse(localStorage.getItem('cardDB'));
    const skillDB = JSON.parse(localStorage.getItem('skillDB'));

    equippedCardsSection.innerHTML = '';
    cardDexSection.innerHTML = '';

    // 카드 아이템 HTML을 생성하는 헬퍼 함수
    const createCardHTML = (card, isEquipped) => {
        const skill = skillDB.find(s => s.id === card.skillId);
        const skillName = skill ? skill.name : "없음";
        
        const cardNumber = card.id.replace('C', '');
        
        // 등급별 클래스 추가
        const gradeClass = card.class ? `grade-${card.class}` : '';

        let actionsHTML = '';
        if (isEquipped) {
            actionsHTML = `<button class="unequip-btn" onclick="unequipCard('${card.id}')">해제</button>`;
        } else {
            actionsHTML = `<button class="equip-btn" onclick="equipCard('${card.id}')" ${userData.equippedCards.length >= 4 ? 'disabled' : ''}>장착</button>`;
        }
        actionsHTML += `<button class="detail-btn" onclick="openCardDetailModal('${card.id}')">자세히</button>`;

        return `
            <div class="card-item ${gradeClass}" data-card-id="${card.id}">
                <div class="card-header">
                    <span class="card-name">${card.name}</span>
                    <span class="card-number">#${cardNumber}</span>
                </div>
                <div class="card-stats">
                    <p>HP: ${card.hpBonus}</p><p>MP: ${card.mpBonus}</p>
                    <p>ATK: ${card.attackBonus}</p><p>SKL: ${skillName}</p>
                </div>
                <div class="card-actions">${actionsHTML}</div>
            </div>
        `;
    };
    
    // 튜토리얼 모드일 때는 장착 섹션 숨기기
    if (isTutorial) {
        if (equippedCardsSection.parentElement) {
            equippedCardsSection.parentElement.style.display = 'none';
        }
    } else {
        // 일반 모드에서는 장착 섹션 보이기
        if (equippedCardsSection.parentElement) {
            equippedCardsSection.parentElement.style.display = '';
        }
        
        // 장착된 카드 섹션 채우기
        userData.equippedCards.forEach(cardId => {
            const card = cardDB.find(c => c.id === cardId);
            if (card) {
                equippedCardsSection.innerHTML += createCardHTML(card, true);
            }
        });
        for (let i = userData.equippedCards.length; i < 4; i++) {
            equippedCardsSection.innerHTML += `<div class="card-item locked"><div class="card-name">비어있음</div></div>`;
        }
    }

    // 도감 섹션 채우기
    if (isTutorial) {
        // 튜토리얼 모드: C001만 표시
        const card = cardDB.find(c => c.id === 'C001');
        if (card) {
            const isOwned = userData.ownedCards.includes('C001');
            const isEquipped = userData.equippedCards.includes('C001');
            if (isOwned) {
                cardDexSection.innerHTML = createCardHTML(card, isEquipped);
            }
        }
    } else {
        // 일반 모드: 현재 페이지의 모든 카드 표시
        const [start, end] = currentDexPage.split('-').map(Number);
        for (let i = start; i <= end; i++) {
            const cardId = 'C' + String(i).padStart(3, '0');
            const card = cardDB.find(c => c.id === cardId);

            if (card) {
                const isOwned = userData.ownedCards.includes(card.id);
                const isEquipped = userData.equippedCards.includes(card.id);

                if (isOwned) {
                    cardDexSection.innerHTML += createCardHTML(card, isEquipped);
                } else {
                    // 소유하지 않은 카드
                    cardDexSection.innerHTML += `
                        <div class="card-item locked">
                            <div class="card-header">
                                <span class="card-name">???</span>
                                <span class="card-number">#${String(i).padStart(3, '0')}</span>
                            </div>
                            <div class="card-stats">
                                <p>HP: ???</p><p>MP: ???</p>
                                <p>ATK: ???</p><p>SKL: ???</p>
                            </div>
                        </div>
                    `;
                }
            }
        }
    }
    
    // 필터 버튼 활성화 상태 업데이트 (튜토리얼 모드에서는 스킵)
    if (!isTutorial) {
        dexFilterButtons.querySelectorAll('.dex-filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.range === currentDexPage) {
                btn.classList.add('active');
            }
        });
    }
}

// 도감 모달을 여는 함수 (초기화 역할)
function openCardDexModal(isTutorial = false) {
    currentDexPage = '1-10'; // 열 때마다 기본 페이지로 초기화
    renderCardDex(isTutorial); // 내용물 그리기
    openModal(cardDexModal); // 모달 보이기

    // (요구사항 4) 튜토리얼 모드일 때 DOM 조작
    if (isTutorial) {
        // 튜토리얼 중에는 다른 버튼 비활성화
            cardDexModal.querySelectorAll('button').forEach(btn => {
                if (btn.classList.contains('close-btn') || btn.classList.contains('dex-filter-btn')) {
                    btn.disabled = true;
                }
            });
        
        setTimeout(() => {
            // C001 카드의 '장착' 버튼만 찾아서 활성화 및 하이라이트
            const equipBtn = cardDexSection.querySelector('.card-item[data-card-id="C001"] .equip-btn');
            
            if (equipBtn) {
                equipBtn.disabled = false;
                equipBtn.disabled = false;
                equipBtn.classList.add('tutorial-focus'); // í•˜ì´ë¼ì´íŠ¸ í´ëž˜ìŠ¤ ì¶"ê°€
                equipBtn.style.position = 'relative';
                equipBtn.style.zIndex = '10001'; // 오버레이 위로
                
                // 클릭 이벤트 재정의
                equipBtn.onclick = () => {
                    removeTutorialOverlay(`.card-item[data-card-id="C001"] .equip-btn`);
                    equipCard('C001'); // 실제 장착 함수 사용
                    closeModal();
                    nextTutorialStep(); // 3단계(상점)로 이동
                };

                // [추가] (요구사항 4) C001 장착 버튼 하이라이트용 오버레이
                showTutorialOverlay("획득한 '명사' 카드의 [장착] 버튼을 누르세요.", `.card-item[data-card-id="C001"] .equip-btn`);

            } else {
                alert("튜토리얼 오류: C001 카드를 찾을 수 없습니다.");
            }
        }, 100); // 렌더링 대기
    }
}

function equipCard(cardId) {
    // 튜토리얼 모드일 때는 임시 데이터 사용
    if (isTutorialActive) {
        if (tutorialUserData.equippedCards.length < 4) {
            if (!tutorialUserData.equippedCards.includes(cardId)) {
                tutorialUserData.equippedCards.push(cardId);
                renderCardDex(true); // 튜토리얼 모드로 재렌더링
            }
        } else {
            alert("카드는 최대 4개까지만 장착할 수 있습니다.");
        }
    } else {
        // 일반 모드
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (userData.equippedCards.length < 4) {
            if (!userData.equippedCards.includes(cardId)) {
                userData.equippedCards.push(cardId);
                localStorage.setItem('userData', JSON.stringify(userData));
                uploadUserData(userData.id);
                renderCardDex(); // 일반 모드로 재렌더링
                displayUserData();
            }
        } else {
            alert("카드는 최대 4개까지만 장착할 수 있습니다.");
        }
    }
}

function unequipCard(cardId) {
    let userData = JSON.parse(localStorage.getItem('userData'));
    userData.equippedCards = userData.equippedCards.filter(id => id !== cardId);
    localStorage.setItem('userData', JSON.stringify(userData));
    uploadUserData(userData.id);
    renderCardDex(); // [수정] 모달을 다시 여는 대신, 내용물만 새로고침
    displayUserData();
}

function closeModal() {
    // 모든 모달창과 배경을 숨깁니다.
    modalBackdrop.classList.add('hidden');
    cardDexModal.classList.add('hidden');
    cardDetailModal.classList.add('hidden');
    itemViewModal.classList.add('hidden');
    dungeonModal.classList.add('hidden'); // dungeonModal 포함 확인
    shopModal.classList.add('hidden');    // shopModal 포함 확인
    gachaModal.classList.add('hidden');   // gachaModal 포함 확인
    growthGoalsModal.classList.add('hidden'); // growthGoalsModal 포함 확인

    const tutorialPromptModal = document.getElementById('tutorial-prompt-modal');
    if (tutorialPromptModal) tutorialPromptModal.classList.add('hidden');
    
    const tutorialCompleteModal = document.getElementById('tutorial-complete-modal');
    if (tutorialCompleteModal) tutorialCompleteModal.classList.add('hidden');
}

function openModal(modal) {
    closeModal();
    modalBackdrop.classList.remove('hidden');
    modal.classList.remove('hidden');
}

function openItemViewModal() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    const itemDB = JSON.parse(localStorage.getItem('itemDB'));
    itemViewList.innerHTML = '';
    const ownedItems = Object.keys(userData.inventory).filter(id => userData.inventory[id] > 0);
    if (ownedItems.length === 0) {
        itemViewList.innerHTML = '<p>소유한 아이템이 없습니다.</p>';
    } else {
        ownedItems.forEach(itemId => {
            const item = itemDB.find(i => i.id === itemId);
            if (item) {
                const itemEl = document.createElement('div');
                itemEl.className = 'item-list-item';
                const priceInfo = item.forSale === 1 ? `판매 가격: ${item.price} G` : '판매 불가';
                itemEl.innerHTML = `<div><div class="item-name">${item.name}</div><div class="item-desc">${item.desc}</div><div class="item-price">${priceInfo}</div></div><div class="item-quantity">x${userData.inventory[itemId]}</div>`;
                itemViewList.appendChild(itemEl);
            }
        });
    }
    modalBackdrop.classList.remove('hidden');
    itemViewModal.classList.remove('hidden');
}

function openDungeonModal(isTutorial = false) {
    const allDungeons = JSON.parse(localStorage.getItem('dungeonDB') || '[]');
    
    let visibleDungeons;
    let categories;

    // (요구사항 5) 튜토리얼 모드일 때
    if (isTutorial) {
        // D998 던전만 필터링
        visibleDungeons = allDungeons.filter(dungeon => dungeon.id === 'D998');
        // D998의 카테고리('품사')만 추출
        categories = [...new Set(visibleDungeons.map(dungeon => dungeon.area))];
        
        if (categories.length === 0) {
             dungeonCategoryListEl.innerHTML = '<p>튜토리얼 던전(D998)을 DB에서 찾을 수 없습니다.</p>';
             dungeonListEl.innerHTML = '';
             openModal(dungeonModal);
             return;
        }

    } else {
        // [기존] 일반 모드
        visibleDungeons = allDungeons.filter(dungeon => VISIBLE_DUNGEON_IDS.includes(dungeon.id));
        categories = [...new Set(visibleDungeons.map(dungeon => dungeon.area))];
    }
    
    // 카테고리 버튼 생성 (튜토리얼이면 '품사' 하나만 생성됨)
    dungeonCategoryListEl.innerHTML = '';
    categories.forEach(category => {
        const button = document.createElement('button');
        button.className = 'dungeon-category-btn';
        button.textContent = category;
        button.addEventListener('click', () => {
            document.querySelectorAll('.dungeon-category-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // 튜토리얼 플래그 전달
            renderDungeonsByCategory(category, visibleDungeons, isTutorial);
        });
        dungeonCategoryListEl.appendChild(button);
    });

    dungeonListEl.innerHTML = '';
    dungeonListEl.classList.add('hidden');
    openModal(dungeonModal);

    // (요구사항 4) 튜토리얼 모드이고 카테고리가 하나면 자동 하이라이트
    if (isTutorial && categories.length === 1) {
        setTimeout(() => {
            showTutorialOverlay("'품사' 카테고리를 선택하세요.", ".dungeon-category-btn");
        }, 100);
    }
}

function renderDungeonsByCategory(category, allVisibleDungeons, isTutorial = false) {
    let dungeonsToDisplay;

    // (요구사항 5) 튜토리얼 모드 필터링
    if (isTutorial) {
        dungeonsToDisplay = allVisibleDungeons.filter(dungeon => 
            dungeon.area === category && dungeon.id === 'D998'
        );
        // 튜토리얼 오버레이 제거 (카테고리 버튼)
        removeTutorialOverlay(".dungeon-category-btn"); 
    } else {
        dungeonsToDisplay = allVisibleDungeons.filter(dungeon => 
            dungeon.area === category
        );
    }

    if (!dungeonsToDisplay || dungeonsToDisplay.length === 0) {
        dungeonListEl.innerHTML = "<p>해당 카테고리의 던전이 없습니다.</p>";
    } else {
        dungeonListEl.innerHTML = ''; 
        dungeonsToDisplay.forEach(dungeon => {
            const card = document.createElement('div');
            card.className = 'dungeon-card';
            card.setAttribute('data-dungeon-id', dungeon.id); // [신규] ID 추가
            
            // D998의 이름이 '튜토리얼'이 아닐 수 있으니, 튜토리얼 이름 강제
            if (isTutorial) {
                card.innerHTML = `<h2>튜토리얼 전투</h2><p>테마: ${dungeon.area}</p><p>난이도: ${dungeon.recommendedLevel}</p>`;
            } else {
                card.innerHTML = `<h2>${dungeon.name}</h2><p>테마: ${dungeon.area}</p><p>난이도: ${dungeon.recommendedLevel}</p>`;
            }
            
            card.addEventListener('click', () => {
                if (isTutorial) {
                    removeTutorialOverlay('.dungeon-card[data-dungeon-id="D998"]');
                }
                modalBackdrop.classList.add('hidden');
                dungeonModal.classList.add('hidden'); 
                startBattle(dungeon.id); // D998 ID로 전투 시작
            }); 
            dungeonListEl.appendChild(card);

            // (요구사항 4) 튜토리얼 던전 하이라이트
            if (isTutorial) {
                setTimeout(() => {
                    showTutorialOverlay("'튜토리얼 전투'를 선택하여 시작하세요.", '.dungeon-card[data-dungeon-id="D998"]');
                }, 100);
            }
        });
    }
    dungeonListEl.classList.remove('hidden');
}

function endBattle(tutorialCompleted = false) {
    const battleContainer = document.getElementById('battle-mode-container');
    
    // [추가] 전투 BGM을 찾아 정지
    const battleBGM = battleContainer.querySelector('#bgm-battle');
    if (battleBGM) {
        battleBGM.pause();
    }
    
    battleContainer.innerHTML = '';
    battleContainer.style.display = 'none';

    document.getElementById('battle-style')?.remove();
    document.getElementById('battle-script')?.remove();

    // [수정] 메인 BGM 다시 재생
    document.getElementById('bgm-main')?.play();

    displayUserData();

    // [수정] 튜토리얼 완료 처리
    if (isTutorialActive && tutorialCompleted) {
        nextTutorialStep(); // 5단계(마무리) 안내 시작
    }
}
// endBattle 함수를 battle.js에서 호출할 수 있도록 전역 함수로 등록
window.endBattle = endBattle;

// 전투 시작 함수
async function startBattle(dungeonId) {
    if (dungeonId === 'D998') {
        localStorage.setItem('isTutorialBattle', 'true');
    }
    localStorage.setItem('selectedDungeonId', dungeonId);
    const battleContainer = document.getElementById('battle-mode-container');
    battleContainer.innerHTML = '<h2>Loading...</h2>';
    battleContainer.style.display = 'flex'; // 'block' 대신 'flex'로 변경

    // [수정] 메인 BGM 정지
    document.getElementById('bgm-main')?.pause();

    try {
        const response = await fetch('battle.html');
        if (!response.ok) throw new Error('battle.html을 불러올 수 없습니다.');
        const battleHtmlText = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(battleHtmlText, 'text/html');
        battleContainer.innerHTML = doc.body.innerHTML;

        // [추가] 전투 BGM을 찾아 재생
        const battleBGM = battleContainer.querySelector('#bgm-battle');
        if (battleBGM) {
            battleBGM.volume = 0.2;
            battleBGM.play();
        }

        const battleStyle = document.createElement('link');
        battleStyle.id = 'battle-style';
        battleStyle.rel = 'stylesheet';
        battleStyle.href = 'css/battlestyle.css';
        document.head.appendChild(battleStyle);

        const battleScript = document.createElement('script');
        battleScript.id = 'battle-script';
        battleScript.src = 'js/battle.js';
        battleScript.defer = true;
        document.body.appendChild(battleScript);

    } catch (error) {
        console.error("전투 시작 중 오류 발생:", error);
        alert("전투 화면을 불러오는 데 실패했습니다.");
        endBattle();
    }
}

// [추가] 성장 목표 정의 배열
// displayUserData 함수의 if문 순서와 동일하게 정의
const growthGoals = [
    { description: "최대 HP 50 달성", key: 'maxHp', value: 50 },
    { description: "최대 HP 80 달성", key: 'maxHp', value: 80 },
    { description: "최대 HP 160 달성", key: 'maxHp', value: 160 },
    { description: "최대 HP 250 달성", key: 'maxHp', value: 250 },
    { description: "최대 HP 350 달성", key: 'maxHp', value: 350 },
    { description: "최대 HP 500 달성", key: 'maxHp', value: 500 },
    { description: "최대 MP 50 달성", key: 'maxMp', value: 50 },
    { description: "최대 MP 80 달성", key: 'maxMp', value: 80 },
    { description: "최대 MP 160 달성", key: 'maxMp', value: 160 },
    { description: "최대 MP 190 달성", key: 'maxMp', value: 190 },
    { description: "최대 MP 250 달성", key: 'maxMp', value: 250 },
    { description: "최대 MP 350 달성", key: 'maxMp', value: 350 },
    { description: "공격력 30 달성", key: 'totalAttack', value: 30 },
    { description: "공격력 45 달성", key: 'totalAttack', value: 45 },
    { description: "공격력 70 달성", key: 'totalAttack', value: 70 },
    { description: "공격력 100 달성", key: 'totalAttack', value: 100 },
    { description: "공격력 140 달성", key: 'totalAttack', value: 140 },
    { description: "공격력 190 달성", key: 'totalAttack', value: 190 }
];

// [교체] openGrowthGoalsModal 함수
function openGrowthGoalsModal() {

    const userData = JSON.parse(localStorage.getItem('userData'));
    const cardDB = JSON.parse(localStorage.getItem('cardDB'));
    if (!userData || !cardDB) return; // 데이터 없으면 중단

    // --- displayUserData와 동일한 스탯 계산 로직 ---
    const baseHp = userData.baseHp;
    const baseMp = userData.baseMp;
    const baseAttack = userData.baseAttack;
    const ownedCardCount = userData.ownedCards.length;
    // --- (1) 보너스 설정 배열 (이 부분만 수정하세요) ---
    const tierBonuses = [
        { hp: 10, mp: 5, att: 5 },   // 10개 이상
        { hp: 20, mp: 10, att: 10 }, // 20개 이상
        { hp: 30, mp: 15, att: 15 }  // 30개 이상
        // 40개 이상 보너스를 추가하려면 여기에 { hp: X, mp: Y, att: Z } 추가
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

            console.log(tierBonuses);
        }
    }

    let equippedHpBonus = 0;
    let equippedMpBonus = 0;
    let equippedAttackBonus = 0;
    userData.equippedCards.forEach(cardId => {
        const card = cardDB.find(c => c.id === cardId);
        if (card) {
            equippedHpBonus += card.hpBonus;
            equippedMpBonus += card.mpBonus;
            equippedAttackBonus += card.attackBonus;
        }
    });
    const maxHp = baseHp + collectionHpBonus + equippedHpBonus;
    const maxMp = baseMp + collectionMpBonus + equippedMpBonus;
    const totalAttack = baseAttack + collectionAttackBonus + equippedAttackBonus;
    const equippedCardCount = userData.equippedCards.length;
    // --- 스탯 계산 끝 ---

    let achievedCount = 0;
    // ▼▼▼ [수정] 달성/미달성 목표 HTML을 저장할 배열 추가 ▼▼▼
    let achievedGoalsHTML = [];
    let unachievedGoalsHTML = [];
    // ▲▲▲ [수정] 여기까지 ▲▲▲

    goalListEl.innerHTML = ''; // 목록 초기화 (이 줄은 이제 필요 없음)

    // 정의된 목표 순서대로 확인
    growthGoals.forEach(goal => {
        let isAchieved = false;
        // 목표 타입에 따라 달성 여부 확인
        switch (goal.key) {
            case 'maxHp':
                isAchieved = maxHp >= goal.value;
                break;
            case 'maxMp':
                isAchieved = maxMp >= goal.value;
                break;
            case 'totalAttack':
                isAchieved = totalAttack >= goal.value;
                break;
            case 'equippedCards':
                isAchieved = equippedCardCount >= goal.value;
                break;
        }

        // ▼▼▼ [수정] 목표 항목 HTML 문자열 생성 ▼▼▼
        const goalClass = isAchieved ? 'achieved' : 'unachieved';
        const goalHTML = `<div class="goal-item ${goalClass}">${goal.description}</div>`;
        // ▲▲▲ [수정] 여기까지 ▲▲▲

        if (isAchieved) {
            achievedCount++;
            // ▼▼▼ [수정] 달성 목표 배열에 추가 ▼▼▼
            achievedGoalsHTML.push(goalHTML);
        } else {
            // ▼▼▼ [수정] 미달성 목표 배열에 추가 ▼▼▼
            unachievedGoalsHTML.push(goalHTML);
        }
    });

    // 달성 개수 업데이트
    goalsAchievedCountEl.textContent = achievedCount;

    // ▼▼▼ [수정] 달성 목표와 미달성 목표 HTML을 합쳐서 목록에 삽입 ▼▼▼
    goalListEl.innerHTML = achievedGoalsHTML.join('') + unachievedGoalsHTML.join('');
    // ▲▲▲ [수정] 여기까지 ▲▲▲

    // 모달 열기
    openModal(growthGoalsModal);
}

// 튜토리얼 프롬프트 모달 버튼 이벤트 등록 함수
function setupTutorialPromptButtons() {
    const startBtn = document.getElementById('tutorial-start-btn');
    const skipBtn = document.getElementById('tutorial-skip-btn');
    
    // 기존 리스너 제거 (중복 방지)
    const newStartBtn = startBtn.cloneNode(true);
    const newSkipBtn = skipBtn.cloneNode(true);
    startBtn.parentNode.replaceChild(newStartBtn, startBtn);
    skipBtn.parentNode.replaceChild(newSkipBtn, skipBtn);
    
    // 진행하기 버튼
    document.getElementById('tutorial-start-btn').onclick = () => {
        closeModal();
        isTutorialActive = true;
        tutorialStep = 1;
        
        tutorialUserData = {
            ownedCards: [],
            equippedCards: [],
            inventory: {}
        };
        
        runTutorialStep(tutorialStep);
    };
    
    // 다음에 하기 버튼
    document.getElementById('tutorial-skip-btn').onclick = () => {
        closeModal();
        isTutorialActive = false;
        const userData = JSON.parse(localStorage.getItem('userData'));
        userData.tutorial = '1';
        localStorage.setItem('userData', JSON.stringify(userData));
        if (userData.id) uploadUserData(userData.id);
    };
}

async function initializeMainScreen() {
    // localStorage에 cardDB가 없으면 서버에서 모든 게임 DB를 불러옴
    if (!localStorage.getItem('cardDB')) {
        const success = await fetchAndStoreGameData();
        if (!success) return; // 데이터 로딩 실패 시 함수 중단
    }
    

    // ✨ 수정됨: 데이터 로딩이 끝난 후, 로딩 메시지를 숨기고 메인 메뉴를 표시
    fullScreenLoader.style.display = 'none'; // 👈 [신규]
    mainMenuEl.classList.remove('hidden');

    // 사용자 정보와 던전 목록 표시
    displayUserData();

    // (요구사항 2) 튜토리얼 시작 여부 확인
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData && userData.tutorial === '0') {
        const promptModal = document.getElementById('tutorial-prompt-modal');
        openModal(promptModal); // 튜토리얼 진행 확인 모달 표시
        setupTutorialPromptButtons(); // 함수 호출

        document.getElementById('tutorial-start-btn').onclick = () => {
            closeModal();
            isTutorialActive = true;
            tutorialStep = 1;
            
            // 튜토리얼용 임시 데이터 생성 (빈 상태로 시작)
            tutorialUserData = {
                ownedCards: [],
                equippedCards: [],
                inventory: {}
            };
            
            runTutorialStep(tutorialStep); // 1단계(카드 뽑기) 안내 시작
        };
        
        document.getElementById('tutorial-skip-btn').onclick = () => {
            closeModal();
            isTutorialActive = false;
            userData.tutorial = '1'; // 튜토리얼 '완료(스킵)' 처리
            localStorage.setItem('userData', JSON.stringify(userData));
            if (userData.id) uploadUserData(userData.id);
            alert("튜토리얼을 건너뜁니다. '튜토리얼' 버튼을 누르면 언제든 다시 시작할 수 있습니다.");
        };
    }

    // --- [수정] 모든 이벤트 리스너에 튜토리얼 분기 처리 ---

    cardViewBtn.addEventListener('click', () => {
        if (isTutorialActive) {
            if (tutorialStep !== 2) return; // 2단계가 아니면 무시
            removeTutorialOverlay("#card-view-btn");
            openCardDexModal(true); // 튜토리얼 모드
        } else {
            openCardDexModal(false); // 일반 모드
        }
    });

    itemViewBtn.addEventListener('click', () => {
        if (isTutorialActive) return; // 튜토리얼 중 비활성화
        openItemViewModal();
    });

    exploreBtn.addEventListener('click', () => {
        if (isTutorialActive) {
            if (tutorialStep !== 4) return;
            removeTutorialOverlay("#explore-btn");
            openDungeonModal(true); // 튜토리얼 모드
        } else {
            openDungeonModal(false);
        }
    });

    goalsBtn.addEventListener('click', () => {
        if (isTutorialActive) return; // 튜토리얼 중 비활성화
        openGrowthGoalsModal();
    });
    
    gachaBtn.addEventListener('click', () => {
        if (isTutorialActive) {
            if (tutorialStep !== 1) return;
            removeTutorialOverlay("#gacha-btn");
            openGachaModal(true); // 튜토리얼 모드
        } else {
            openGachaModal(false);
        }
    });

    shopBtn.addEventListener('click', () => {
        if (isTutorialActive) {
            if (tutorialStep !== 3) return;
            removeTutorialOverlay("#shop-btn");
            openShopModal(true); // 튜토리얼 모드
        } else {
            openShopModal(false);
        }
    });
    
    document.getElementById('guidebook-btn').addEventListener('click', () => {
        // 가이드북(튜토리얼 모달) 열기
        if (window.gameTutorial) {
            window.gameTutorial.openTutorial();
        }
    });

    document.getElementById('guidebook-btn').addEventListener('click', () => {
        // 가이드북(튜토리얼 모달) 열기
        if (window.gameTutorial) {
            window.gameTutorial.openTutorial();
        }
    });
    
    // 튜토리얼 버튼 리스너 추가
    document.getElementById('tutorial-btn').addEventListener('click', () => {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (userData.tutorial === '1') {
            // 이미 완료한 경우 - 튜토리얼 프롬프트 모달 표시
            const tutorialPromptModal = document.getElementById('tutorial-prompt-modal');
            openModal(tutorialPromptModal);
            setupTutorialPromptButtons(); // 함수 호출 추가
        } else {
            // 미완료 상태라면 바로 시작
            isTutorialActive = true;
            tutorialStep = 1;
            tutorialUserData = {
                ownedCards: [],
                equippedCards: [],
                inventory: {}
            };
            runTutorialStep(1);
        }
    });
    
    // 튜토리얼 완료 버튼 리스너
    document.getElementById('tutorial-complete-btn').addEventListener('click', () => {
        // 튜토리얼 완료 처리
        isTutorialActive = false;
        tutorialStep = 0;
        
        // 튜토리얼용 임시 데이터 삭제
        tutorialUserData = null;
        
        let userData = JSON.parse(localStorage.getItem('userData'));
        userData.tutorial = '1'; // '완료' 처리
        localStorage.setItem('userData', JSON.stringify(userData));
        if (userData.id) uploadUserData(userData.id);
        
        // 모달 닫기
        closeModal();
    });
    // 이벤트 리스너 설정 (기존 코드)
    shopItemList.addEventListener('click', function(event) {
        if (isTutorialActive) return; // 튜토리얼 중에는 상점 아이템 클릭 방지
        if (event.target.classList.contains('buy-btn')) {
            const itemId = event.target.dataset.itemId;
            buyItem(itemId);
        }
    });

    gachaConfirmBtn.addEventListener('click', () => {
        if (isTutorialActive) return; // 튜토리얼 전용 버튼을 사용하므로 기존 버튼 방지
        gachaResultView.classList.add('hidden');
        openGachaModal();
    });

    detailModalCloseBtn.addEventListener('click', () => {
        cardDetailModal.classList.add('hidden');
        cardDexModal.classList.remove('hidden');
    });

    document.querySelectorAll('.modal-close-btn').forEach(btn => {
        // 튜토리얼 프롬프트 모달과 튜토리얼 완료 모달의 버튼은 별도 처리했으므로 제외
        if (!btn.closest('#tutorial-prompt-modal') && !btn.closest('#tutorial-complete-modal')) {
            btn.addEventListener('click', closeModal);
        }
    });

    dexFilterButtons.addEventListener('click', (event) => {
        if (isTutorialActive) return; // 튜토리얼 중 필터 클릭 방지
        if (event.target.classList.contains('dex-filter-btn')) {
            currentDexPage = event.target.dataset.range;
            renderCardDex();
        }
    });
}

// [신규] 튜토리얼 제어 함수 5개 추가
/**
 * (요구사항 4) 튜토리얼 오버레이(커튼)를 표시하고 특정 요소를 하이라이트합니다.
 * @param {string} text - 설명 텍스트
 * @param {string} targetSelector - 하이라이트할 요소의 CSS 선택자
 */
function showTutorialOverlay(text, targetSelector, position = 'bottom') {
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
    `;
    // 모달창이 떠 있다면 그 위에 오버레이를 띄워야 함
    if (modalBackdrop.classList.contains('hidden')) {
        document.body.appendChild(tutorialOverlay);
    } else {
        modalBackdrop.appendChild(tutorialOverlay);
    }


    // 2. 타겟 요소 하이라이트 (커튼 위로 올리기)
    targetElement.style.position = 'relative'; // z-index 적용을 위해 필요
    targetElement.style.zIndex = '10001';
    targetElement.classList.add('tutorial-focus'); // [수정] CSS 클래스 사용

    // 3. 이전 설명 박스 제거 (중첩 방지)
    const oldTextBoxes = document.querySelectorAll('.tutorial-textbox');
    oldTextBoxes.forEach(box => box.remove());

    // 4. 새로운 설명 박스 생성
    const textBox = document.createElement('div');
    textBox.className = position === 'top' ? 'tutorial-textbox tutorial-textbox-top' : 'tutorial-textbox';
    textBox.innerHTML = `<p>${text}</p>`;

    // tutorialOverlay가 아닌 body에 직접 추가하여 독립적인 stacking context 생성
    document.body.appendChild(textBox);
}

/** (요구사항 4) 오버레이와 하이라이트 제거 */
function removeTutorialOverlay(targetSelector) {
    // [수정] 부모 노드가 있으면 거기서 제거
    if (tutorialOverlay.parentNode) {
        tutorialOverlay.parentNode.removeChild(tutorialOverlay);
    }

    // textBox도 제거 (body에 직접 추가되었으므로)
    const oldTextBoxes = document.querySelectorAll('.tutorial-textbox');
    oldTextBoxes.forEach(box => box.remove());

    const targetElement = document.querySelector(targetSelector);
    if (targetElement) {
        targetElement.style.position = ''; // position 속성 초기화
        targetElement.style.zIndex = ''; // z-index 초기화
        targetElement.classList.remove('tutorial-focus'); // 하이라이트 클래스 제거
    }
}

/** 튜토리얼 다음 단계로 진행 */
function nextTutorialStep() {
    if (!isTutorialActive) return;
    tutorialStep++;
    runTutorialStep(tutorialStep);
}

/** 튜토리얼 특정 단계 실행 (안내 시작) */
function runTutorialStep(step) {
    switch(step) {
        case 1: // (1) 카드 뽑기 유도
            showTutorialOverlay("환영합니다! '카드 뽑기'로 튜토리얼 카드를 획득해봅시다.", "#gacha-btn");
            break;
        case 2: // (2) 카드 장착 유도
            showTutorialOverlay("좋습니다! '카드 보기'로 이동해 방금 뽑은 카드를 장착해봅시다.", "#card-view-btn", "top");
            break;
        case 3: // (3) 아이템 구매 유도
            showTutorialOverlay("잘했습니다! 카드를 장착하거나 보유하면 캐릭터가 점점 강해집니다.<br>이제 '상점'에서 전투에 필요한 물약을 구매해봅시다.", "#shop-btn");
            break;
        case 4: // (4) 전투 시작 유도
            showTutorialOverlay("준비가 끝났습니다. '탐험하기'를 눌러 튜토리얼 전투를 시작하세요!", "#explore-btn");
            break;
        case 5: // (5) 튜토리얼 종료 (전투 완료 후)
            // 오버레이 제거
            removeTutorialOverlay();
            // 튜토리얼 완료 모달 표시
            const tutorialCompleteModal = document.getElementById('tutorial-complete-modal');
            openModal(tutorialCompleteModal);
            break;
    }
}

function purchaseCardPackTutorial(packId) {
    // 오버레이 제거
    removeTutorialOverlay(".dungeon-card .buy-btn");

    const cardDB = JSON.parse(localStorage.getItem('cardDB'));
    const drawnCardId = 'C001'; // 튜토리얼이므로 'C001' 카드 확정
    const drawnCard = cardDB.find(c => c.id === drawnCardId);
    
    // 튜토리얼용 임시 데이터에 카드 추가 (실제 userData는 건드리지 않음)
    if (!tutorialUserData.ownedCards.includes(drawnCardId)) {
        tutorialUserData.ownedCards.push(drawnCardId);
    }
    
    // 가짜 결과창 표시 (비용 소모 없음)
    gachaPackList.classList.add('hidden');
    gachaResultView.classList.remove('hidden');
    gachaResultView.querySelector('h4').textContent = '✨ 튜토리얼 카드 획득! ✨';
    gachaResultView.querySelector('p').textContent = `'${drawnCard.name}'(#001) 카드를 획득했습니다. 카드는 고유한 '번호'를 가집니다.`;
    gachaResultCard.innerHTML = `<strong>${drawnCard.name}</strong>`;
    
    // 확인 버튼 하이라이트
    showTutorialOverlay("카드를 확인했으면 [확인] 버튼을 누르세요.", "#gacha-confirm-btn");

    // 확인 버튼 클릭 시 다음 튜토리얼 단계로
    gachaConfirmBtn.onclick = () => {
        removeTutorialOverlay("#gacha-confirm-btn");
        closeModal();
        nextTutorialStep(); // 2단계(카드 장착)로 이동
    };
}

function buyItemTutorial(itemId) {
    // 오버레이 제거
    removeTutorialOverlay(`.item-list-item[data-item-id="I001"] .buy-btn`);

    const itemDB = JSON.parse(localStorage.getItem('itemDB')); // itemDB 선언 추가
    const itemToBuy = itemDB.find(i => i.id === itemId);

    // 튜토리얼용 임시 인벤토리에 아이템 추가 (실제 userData는 건드리지 않음)
    tutorialUserData.inventory[itemToBuy.id] = (tutorialUserData.inventory[itemToBuy.id] || 0) + 1;

    closeModal();
    nextTutorialStep(); // 4단계(전투)로 이동
}

function openShopModal(isTutorial = false) {
    const userData = JSON.parse(localStorage.getItem('userData'));
    const itemDB = JSON.parse(localStorage.getItem('itemDB'));
    
    shopUserGold.textContent = userData.gold; // 상점 창에 현재 골드 표시
    shopItemList.innerHTML = ''; // 목록 초기화

// (요구사항 4) 튜토리얼 모드일 때
if (isTutorial) {
    const item = itemDB.find(i => i.id === 'I001'); // 하급 HP 포션
    if (item) {
        const itemEl = document.createElement('div');
        itemEl.className = 'item-list-item';
        itemEl.setAttribute('data-item-id', item.id); // data 속성 추가
        itemEl.innerHTML = `
            <div class="item-details">
                <div class="item-name">${item.name}</div>
                <div class="item-desc">${item.desc}</div>
            </div>
            <div class="item-buy-action">
                <div class="item-price">(튜토리얼 무료)</div>
                <button class="buy-btn" data-item-id="${item.id}">구매</button>
            </div>
        `;
        const buyBtn = itemEl.querySelector('.buy-btn');
        buyBtn.onclick = () => buyItemTutorial(item.id);
        shopItemList.appendChild(itemEl);

        openModal(shopModal);

        // 튜토리얼 중에는 닫기 버튼 비활성화
        const closeBtn = shopModal.querySelector('.close-btn');
        if (closeBtn) closeBtn.disabled = true;

        // (요구사항 4) 하이라이트
        setTimeout(() => {
            const targetBtn = document.querySelector(`.item-list-item[data-item-id="I001"] .buy-btn`);
            if (targetBtn) {
                targetBtn.classList.add('tutorial-focus'); // 하이라이트 클래스 추가
                targetBtn.style.position = 'relative';
                targetBtn.style.zIndex = '10001';
            }
            showTutorialOverlay("'하급 회복 물약'의 [구매] 버튼을 누르세요.", `.item-list-item[data-item-id="I001"] .buy-btn`);
        }, 100);

    } else {
        shopItemList.innerHTML = '<p>튜토리얼 아이템(I001)을 DB에서 찾을 수 없습니다.</p>';
        openModal(shopModal);
    }
        
    } else {
        // [기존] 일반 상점 로직
        const itemsForSale = itemDB.filter(item => item.forSale === 1);

        if (itemsForSale.length === 0) {
            shopItemList.innerHTML = '<p>현재 판매 중인 아이템이 없습니다.</p>';
        } else {
            itemsForSale.forEach(item => {
                const itemEl = document.createElement('div');
                itemEl.className = 'item-list-item';
                itemEl.innerHTML = `
                    <div class="item-details">
                        <div class="item-name">${item.name}</div>
                        <div class="item-desc">${item.desc}</div>
                    </div>
                    <div class="item-buy-action">
                        <div class="item-price">${item.price} G</div>
                        <button class="buy-btn" data-item-id="${item.id}">구매</button>
                    </div>
                `;
                const buyBtn = itemEl.querySelector('.buy-btn');
                if (userData.gold < item.price) {
                    buyBtn.disabled = true;
                }
                shopItemList.appendChild(itemEl);
            });
        }
        openModal(shopModal);
    }
}

/**
 * 아이템을 구매하는 함수
 * @param {string} itemId - 구매할 아이템의 ID
 */
function buyItem(itemId) {
    let userData = JSON.parse(localStorage.getItem('userData'));
    const itemDB = JSON.parse(localStorage.getItem('itemDB'));
    const itemToBuy = itemDB.find(i => i.id === itemId);

    if (!itemToBuy) {
        alert("존재하지 않는 아이템입니다.");
        return;
    }

    if (userData.gold < itemToBuy.price) {
        alert("골드가 부족합니다.");
        return;
    }

    // --- [수정 시작] 아이템 타입에 따른 로직 분기 ---
    let purchaseMessage = ''; // 구매 결과 메시지 변수

    // 골드 차감 (공통)
    userData.gold -= itemToBuy.price;

    if (itemToBuy.type === 4) { // 타입 4: 기본 HP 영구 증가
        userData.baseHp += itemToBuy.value;
        purchaseMessage = `${itemToBuy.name} 구매! 기본 HP가 ${itemToBuy.value} 영구적으로 증가했습니다!`;
        // 인벤토리에 추가하지 않음
    } else if (itemToBuy.type === 5) { // 타입 5: 기본 MP 영구 증가
        userData.baseMp += itemToBuy.value;
        purchaseMessage = `${itemToBuy.name} 구매! 기본 MP가 ${itemToBuy.value} 영구적으로 증가했습니다!`;
        // 인벤토리에 추가하지 않음
    } else if (itemToBuy.type === 6) { // 타입 6: 기본 공격력 영구 증가
        userData.baseAttack += itemToBuy.value;
        purchaseMessage = `${itemToBuy.name} 구매! 기본 공격력이 ${itemToBuy.value} 영구적으로 증가했습니다!`;
        // 인벤토리에 추가하지 않음
    } else { // 타입 1, 2, 3 또는 기타 (기존 로직)
        // 인벤토리에 아이템 추가 (없으면 1, 있으면 +1)
        userData.inventory[itemToBuy.id] = (userData.inventory[itemToBuy.id] || 0) + 1;
        purchaseMessage = `${itemToBuy.name}을(를) 구매했습니다!`;
    }
    // --- [수정 끝] ---


    // 변경된 데이터를 로컬 스토리지에 저장하고 서버에 업로드
    localStorage.setItem('userData', JSON.stringify(userData));
    if (userData.id) { // 로그인 유저일 경우에만 업로드
        uploadUserData(userData.id); // common.js의 함수 사용
    }

    alert(purchaseMessage); // 결과 메시지 표시

    // UI 갱신
    displayUserData(); // 메인 화면의 스탯 및 골드 정보 업데이트
    openShopModal(); // 상점 모달을 다시 열어 버튼 상태 등 갱신
}

/**
 * 가중치 기반으로 카드 하나를 랜덤하게 뽑는 함수
 * @param {object} pack - cardPool을 포함한 카드팩 객체
 * @returns {string} 뽑힌 카드의 ID
 */
function drawCard(pack) {
    // cardPool이 문자열이므로 JSON 객체로 파싱
    const cardPool = JSON.parse(pack.cardPool);
    
    // 1. 총 가중치 계산
    const totalWeight = cardPool.reduce((sum, card) => sum + card.weight, 0);

    // 2. 0과 총 가중치 사이의 랜덤 숫자 생성
    let random = Math.random() * totalWeight;

    // 3. 랜덤 숫자가 어느 가중치 구간에 속하는지 확인
    for (const card of cardPool) {
        if (random < card.weight) {
            return card.cardId; // 당첨!
        }
        random -= card.weight;
    }
}

    /**
    @param {string} packId - 구매할 카드팩의 ID
    */
    function purchaseCardPack(packId) {
        let userData = JSON.parse(localStorage.getItem('userData'));
        const cardPackDB = JSON.parse(localStorage.getItem('cardPackDB'));
        const cardDB = JSON.parse(localStorage.getItem('cardDB'));
        const pack = cardPackDB.find(p => p.id === packId);

        // 재화 확인
        if (userData.gold < pack.priceGold) {
            alert("골드가 부족합니다."); return;
        }
        const requiredPoints = pack.pricePoints || {};
        for (const pointType in requiredPoints) {
            const requiredAmount = requiredPoints[pointType];
            const userAmount = userData.points[pointType] || 0;
            if (userAmount < requiredAmount) {
                alert("포인트가 부족합니다.");
                return;
            }
        }

        // 재화 차감
        userData.gold -= pack.priceGold;
        for (const pointType in requiredPoints) {
            userData.points[pointType] -= requiredPoints[pointType];
        }

        // 카드 뽑기 및 결과 처리
        const drawnCardId = drawCard(pack);
        const isDuplicate = userData.ownedCards.includes(drawnCardId);
        
        const drawnCard = cardDB.find(c => c.id === drawnCardId);
        const resultTitle = gachaResultView.querySelector('h4');
        const resultMessage = gachaResultView.querySelector('p');

        if (isDuplicate) {
            // [수정 시작] 환급 메시지 생성 로직 전체 변경
            const goldRefund = Math.round(pack.priceGold * 0.7);
            let pointRefundMessages = []; // 포인트 환급 메시지만 따로 저장할 배열
            
            const pointTypeNames = {
                partsOfSpeech: '품사 포인트',
                sentenceComponents: '문장 성분 포인트'
            };

            // 환급액 적용
            userData.gold += goldRefund;

            for (const pointType in requiredPoints) {
                const pointsRefund = Math.round(requiredPoints[pointType] * 0.6);
                if (pointsRefund > 0) {
                    const pointName = pointTypeNames[pointType] || pointType;
                    // [수정] "이름 수치P" 순서로 메시지 생성
                    pointRefundMessages.push(`${pointName} ${pointsRefund}P`);
                    userData.points[pointType] += pointsRefund;
                }
            }
            
            resultTitle.textContent = '💧 이런... 이미 소유한 카드네요.💧';

            // 최종 메시지 조합
            let finalMessage = `'${drawnCard.name}' 카드를 이미 소유하고 있어,<br>비용의 60%인 `;
            let refundParts = [];

            if (goldRefund > 0) {
                refundParts.push(`${goldRefund} G`);
            }
            if (pointRefundMessages.length > 0) {
                // "품사 포인트 18P, 문장 성분 포인트 6P" 와 같이 조합
                refundParts.push(pointRefundMessages.join(', '));
            }

            if (refundParts.length > 0) {
                finalMessage += `${refundParts.join(', ')}를 돌려받습니다.`;
            } else {
                finalMessage = `'${drawnCard.name}' 카드를 이미 소유하고 있습니다.`;
            }
            
            resultMessage.innerHTML = finalMessage;
            // [수정 끝]
            
        } else {
            userData.ownedCards.push(drawnCardId);
            resultTitle.textContent = '🎉 축하합니다! 🎉';
            resultMessage.textContent = `'${drawnCard.name}' 카드를 새로 획득했습니다!`;
        }

        localStorage.setItem('userData', JSON.stringify(userData));
        if (userData.id) {
            uploadUserData(userData.id);
        }
        
        gachaPackList.classList.add('hidden');
        gachaResultView.classList.remove('hidden');
        gachaResultCard.innerHTML = `<strong>${drawnCard.name}</strong>`;
        
        displayUserData();
    }


function openGachaModal(isTutorial = false) {
    const cardPackDB = JSON.parse(localStorage.getItem('cardPackDB') || '[]');

    // (요구사항 3) 튜토리얼 모드일 때
    if (isTutorial) {
        gachaCategoryListEl.innerHTML = '<h3>튜토리얼: 카드 뽑기</h3>';
        gachaPackList.innerHTML = '';
        gachaPackList.classList.remove('hidden');
        gachaResultView.classList.add('hidden');

        const pack = cardPackDB.find(p => p.id === 'CP001'); // CP001 정보 로드
        if (!pack) {
             gachaPackList.innerHTML = '<p>튜토리얼 팩(CP001)을 DB에서 찾을 수 없습니다.</p>';
             openModal(gachaModal);
             return;
        }

        // (요구사항 3) CP001 정보로 팩 UI 생성
        const packEl = document.createElement('div');
        packEl.className = 'dungeon-card';
        packEl.innerHTML = `
            <h2>${pack.name}</h2>
            <p>${pack.description}</p>
            <p><strong>가격:</strong> (튜토리얼 무료)</p>
        `;
        const purchaseBtn = document.createElement('button');
        purchaseBtn.textContent = '구매';
        purchaseBtn.className = 'buy-btn';
        purchaseBtn.style.marginTop = '10px';
        purchaseBtn.onclick = () => purchaseCardPackTutorial(pack.id);
        
        packEl.appendChild(purchaseBtn);
        gachaPackList.appendChild(packEl);
        
        openModal(gachaModal);
        
        // (요구사항 4) 구매 버튼 하이라이트
        setTimeout(() => {
            showTutorialOverlay("'명사 입문 카드팩'의 [구매] 버튼을 누르세요.", ".dungeon-card .buy-btn");
        }, 100);

    } else {
        // [기존] 일반 카드 뽑기 로직
        gachaCategoryListEl.innerHTML = '';
        gachaPackList.innerHTML = '';
        gachaPackList.classList.add('hidden');
        gachaResultView.classList.add('hidden');

        const packsForSale = cardPackDB.filter(p => p.forSale === 1);
        const packsForSaleIds = packsForSale.map(p => p.id);

        for (const categoryName in GACHA_CATEGORIES) {
            const packIdsInCategory = GACHA_CATEGORIES[categoryName];
            
            // 해당 카테고리에 속한 팩 중 판매 중인 것이 하나라도 있는지 확인
            const isCategoryActive = packIdsInCategory.some(id => packsForSaleIds.includes(id));

            if (isCategoryActive) {
                const button = document.createElement('button');
                button.className = 'gacha-category-btn';
                button.textContent = categoryName;
                button.addEventListener('click', () => {
                    // 클릭한 버튼 활성화
                    document.querySelectorAll('.gacha-category-btn').forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    
                    // 해당 카테고리의 팩 목록 렌더링
                    renderPacksByCategory(categoryName, packsForSale);
                });
                gachaCategoryListEl.appendChild(button);
            }
        }
        
        openModal(gachaModal);
    }
}

// [추가] 카테고리별로 카드팩 목록을 생성하는 함수
function renderPacksByCategory(categoryName, allPacksForSale) {
    const userData = JSON.parse(localStorage.getItem('userData'));
    const packIdsInCategory = GACHA_CATEGORIES[categoryName];

    // 선택된 카테고리에 해당하는 판매 중인 팩만 필터링
    const packsToDisplay = allPacksForSale.filter(pack => packIdsInCategory.includes(pack.id));

    gachaPackList.innerHTML = ''; // 이전 목록 초기화

    const pointTypeNames = {
        partsOfSpeech: '품사 포인트',
        sentenceComponents: '문장 성분 포인트'
    };

    if (packsToDisplay.length === 0) {
        gachaPackList.innerHTML = '<p>해당 카테고리에서 판매 중인 팩이 없습니다.</p>';
    } else {
        packsToDisplay.forEach(pack => {
            const packEl = document.createElement('div');
            packEl.className = 'dungeon-card';
            packEl.style.cursor = 'default';

            let priceStringParts = [];
            if (pack.priceGold > 0) priceStringParts.push(`${pack.priceGold} G`);
            const requiredPoints = pack.pricePoints || {};
            const pointPrices = Object.keys(requiredPoints).map(key => `${pointTypeNames[key] || key} ${requiredPoints[key]}P`);
            if (pointPrices.length > 0) priceStringParts.push(pointPrices.join(', '));
            const priceString = priceStringParts.join(' / ');

            const cardPool = JSON.parse(pack.cardPool);
            const allCardIds = cardPool.map(card => card.cardId);
            const ownedCount = allCardIds.filter(cardId => userData.ownedCards.includes(cardId)).length;
            const totalCount = allCardIds.length;
            const hasAllCards = ownedCount === totalCount;
            const completionRate = Math.round((ownedCount / totalCount) * 100);

            packEl.innerHTML = `
                <h2>${pack.name}</h2>
                <p>${pack.description}</p>
                <p><strong>가격:</strong> ${priceString}</p>
            `;
            
            const progressMsg = document.createElement('p');
            progressMsg.style.marginTop = '8px';
            progressMsg.style.marginBottom = '8px';
            progressMsg.style.fontSize = '0.9em';
            progressMsg.style.fontWeight = 'bold';
            
            if (hasAllCards) {
                progressMsg.style.color = '#4CAF50';
                progressMsg.textContent = `📦 보유: ${ownedCount}/${totalCount} (${completionRate}%) - 컬렉션 완료!`;
            } else {
                progressMsg.style.color = '#FFC107';
                progressMsg.textContent = `📦 보유: ${ownedCount}/${totalCount} (${completionRate}%)`;
            }
            packEl.appendChild(progressMsg);
            
            const purchaseBtn = document.createElement('button');
            purchaseBtn.textContent = '구매';
            purchaseBtn.className = 'buy-btn';
            purchaseBtn.style.marginTop = '10px';

            if (hasAllCards) {
                purchaseBtn.disabled = true;
                const completedMsg = document.createElement('p');
                completedMsg.style.marginTop = '10px';
                completedMsg.style.color = '#999';
                completedMsg.style.fontSize = '0.9em';
                completedMsg.style.fontStyle = 'italic';
                completedMsg.textContent = '* 해당 카드 팩에서 획득할 수 있는 모든 카드를 보유하고 있습니다.';
                packEl.appendChild(purchaseBtn);
                packEl.appendChild(completedMsg);
            } else {
                let canAfford = true;
                if (userData.gold < pack.priceGold) canAfford = false;
                for (const pointType in requiredPoints) {
                    if ((userData.points[pointType] || 0) < requiredPoints[pointType]) {
                        canAfford = false;
                        break;
                    }
                }
                if (!canAfford) purchaseBtn.disabled = true;
                purchaseBtn.onclick = () => purchaseCardPack(pack.id);
                packEl.appendChild(purchaseBtn);
            }
            gachaPackList.appendChild(packEl);
        });
    }

    gachaPackList.classList.remove('hidden'); // 숨겨져 있던 팩 목록을 보여줌
}

/**
 * 카드 뽑기 확률 시뮬레이션 테스트 함수
 * @param {string} packId - 테스트할 카드팩의 ID (예: 'CP001')
 * @param {number} iterations - 시도할 횟수
 */
function runGachaTest(packId, iterations = 10000) {
    const cardPackDB = JSON.parse(localStorage.getItem('cardPackDB') || '[]');
    const packToTest = cardPackDB.find(p => p.id === packId);
    if (!packToTest) {
        console.error(`'${packId}' ID를 가진 카드팩을 찾을 수 없습니다.`);
        return;
    }

    const cardPool = JSON.parse(packToTest.cardPool);
    const totalWeight = cardPool.reduce((sum, card) => sum + card.weight, 0);

    console.log(`--- 카드 뽑기 시뮬레이션 테스트 시작 ---`);
    console.log(`테스트 대상: ${packToTest.name} (${packId})`);
    console.log(`총 시도 횟수: ${iterations}회`);
    console.log(`-----------------------------------------`);

    // 1. 예상 확률 및 기댓값 계산 및 출력
    const expectedResults = {};
    cardPool.forEach(card => {
        const probability = (card.weight / totalWeight) * 100;
        const expectedCount = (card.weight / totalWeight) * iterations;
        expectedResults[card.cardId] = {
            weight: card.weight,
            'probability (%)': probability.toFixed(2),
            'expected count': `~${Math.round(expectedCount)}`
        };
    });
    console.log("▼ 카드별 가중치 및 예상 확률 ▼");
    console.table(expectedResults);

    // 2. 시뮬레이션 실행
    const actualResults = {};
    cardPool.forEach(card => { actualResults[card.cardId] = 0; });

    for (let i = 0; i < iterations; i++) {
        const drawnCardId = drawCard(packToTest);
        if (actualResults.hasOwnProperty(drawnCardId)) {
            actualResults[drawnCardId]++;
        }
    }

    // 3. 실제 결과 출력
    console.log(`▼ 실제 뽑기 결과 (${iterations}회) ▼`);
    console.table(actualResults);
}
// 테스트 함수를 브라우저 콘솔에서 직접 호출할 수 있도록 window 객체에 등록
window.runGachaTest = runGachaTest;


initializeMainScreen();

document.addEventListener('DOMContentLoaded', () => {
    initializeTutorial();  // ← 여기서 호출
});