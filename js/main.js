// === DOM 요소 가져오기 ===
const cardDexModal = document.getElementById('card-dex-modal');
const equippedCardsSection = document.getElementById('equipped-cards-section');
const cardDexSection = document.getElementById('card-dex-section');
const cardDetailModal = document.getElementById('card-detail-modal');
const detailCardName = document.getElementById('detail-card-name');
const detailCardContent = document.getElementById('detail-card-content');
const dexFilterButtons = document.getElementById('dex-filter-buttons');
const loadingMessageEl = document.getElementById('loading-message');
const dungeonListEl = document.getElementById('dungeon-list');
const userNicknameEl = document.getElementById('user-nickname');
const userGoldEl = document.getElementById('user-gold');
const userPosPointsEl = document.getElementById('user-pos-points');
const playerHpBar = document.getElementById('player-hp-bar');
const playerHpText = document.getElementById('player-hp-text');
const playerMpBar = document.getElementById('player-mp-bar');
const playerMpText = document.getElementById('player-mp-text');
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
let currentDexPage = '1-20';

// Webhook URL
const GAME_DATA_URL = 'https://hook.us2.make.com/9a5ve7598e6kci7tchidj4669axhbw91';
const VISIBLE_DUNGEON_IDS = ['D001', 'D002', 'D003', 'D004'];

async function fetchAndStoreGameData() {
    try {
        loadingMessageEl.textContent = "게임 데이터를 서버에서 불러오는 중...";
        const response = await fetch(GAME_DATA_URL);
        if (!response.ok) throw new Error(`서버 응답 오류: ${response.status}`);
        const data = await response.json();
        const parseDB = (rawData, headers) => {
            if (!rawData) return [];
            return rawData.map(s => JSON.parse(s)).map(rawObj => {
                const newObj = {};
                headers.forEach((header, index) => { newObj[header] = rawObj[index]; });
                return newObj;
            });
        };

        // 카드 DB 로딩
        const cards = parseDB(data.Cards, ['id', 'name', 'hpBonus', 'mpBonus', 'attackBonus', 'skillId', 'description']);
        cards.forEach(card => {
            card.hpBonus = parseInt(card.hpBonus, 10) || 0;
            card.mpBonus = parseInt(card.mpBonus, 10) || 0;
            card.attackBonus = parseInt(card.attackBonus, 10) || 0;
        });
        localStorage.setItem('cardDB', JSON.stringify(cards));

        // 스킬 DB 로딩
        const skills = parseDB(data.Skills, ['id', 'name', 'type', 'effect', 'mpCost', 'desc']);
        skills.forEach(skill => {
            skill.type = parseInt(skill.type, 10) || 0;
            skill.effect = parseFloat(skill.effect) || 0;
            skill.mpCost = parseInt(skill.mpCost, 10) || 0;
        });
        localStorage.setItem('skillDB', JSON.stringify(skills));

        // 아이템 DB 로딩
        const items = parseDB(data.Items, ['id', 'name', 'type', 'value', 'price', 'forSale', 'desc']);
        items.forEach(item => {
            item.type = parseInt(item.type, 10) || 0;
            item.value = parseInt(item.value, 10) || 0;
            item.price = parseInt(item.price, 10) || 0;
            item.forSale = parseInt(item.forSale, 10) || 0;
        });
        localStorage.setItem('itemDB', JSON.stringify(items));
        
        // [수정된 부분] 카드팩 DB 로딩 로직 추가
        const cardPacks = parseDB(data.CardPacks, ['id', 'name', 'priceGold', 'pricePosPoints', 'description', 'forSale', 'cardPool']);
        cardPacks.forEach(pack => {
            pack.priceGold = parseInt(pack.priceGold, 10) || 0;
            pack.pricePosPoints = parseInt(pack.pricePosPoints, 10) || 0;
            pack.forSale = parseInt(pack.forSale, 10) || 0;
        });
        localStorage.setItem('cardPackDB', JSON.stringify(cardPacks));

        // 기타 DB 로딩
        localStorage.setItem('dungeonDB', JSON.stringify(parseDB(data.Dungeons, ['id', 'name', 'area', 'recommendedLevel', 'monster1Id', 'monster2Id', 'monster3Id', 'monster4Id', 'monster5Id'])));
        localStorage.setItem('monsterDB', JSON.stringify(parseDB(data.Monsters, ['id', 'name', 'level', 'hp', 'mp', 'attack', 'goldReward', 'pointReward', 'affiliation', 'questionId', 'skillId1', 'skillId2', 'skillId3', 'img'])));
        localStorage.setItem('questionDB', JSON.stringify(parseDB(data.Questions, ['id', 'name', 'type', 'question1', 'question2', 'question3', 'question4', 'question5', 'question6', 'question7', 'question8', 'question9', 'question10', 'question11', 'question12', 'question13', 'question14', 'question15', 'question16', 'question17', 'question18', 'question19', 'question20'])));
        
        return true;
    } catch (error) {
        console.error('게임 데이터를 불러오는 중 오류 발생:', error);
        loadingMessageEl.textContent = '데이터 로딩 실패! 페이지를 새로고침 해주세요.';
        return false;
    }
}

// main.js의 displayUserData 함수를 아래 코드로 교체

function displayUserData() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    const cardDB = JSON.parse(localStorage.getItem('cardDB'));
    if (!userData || !cardDB) {
        document.body.innerHTML = "<h1>사용자 데이터를 불러오는 데 실패했습니다. 다시 로그인해주세요.</h1>";
        return;
    }

    const playerPortraitImg = document.querySelector('.player-portrait img');

    // --- [추가] 도감 보너스 계산 ---
    const ownedCardCount = userData.ownedCards.length;
    const collectionHpBonus = ownedCardCount * 1;
    const collectionMpBonus = Math.round(ownedCardCount * 0.5);
    const collectionAttackBonus = Math.round(ownedCardCount * 0.5);

    // --- 스탯 계산 (도감 보너스 적용) ---
    let maxHp = userData.baseHp + collectionHpBonus; // 베이스 스탯에 도감 보너스 추가
    let maxMp = userData.baseMp + collectionMpBonus;
    let totalAttack = userData.baseAttack + collectionAttackBonus;
    
    // 장착 카드 보너스 합산
    userData.equippedCards.forEach(cardId => {
        const card = cardDB.find(c => c.id === cardId);
        if (card) {
            maxHp += card.hpBonus;
            maxMp += card.mpBonus;
            totalAttack += card.attackBonus;
        }
    });

    // --- 조건 확인 및 이미지 변경 로직 (기존과 동일) ---
    let conditionsMet = 0;
    if (maxHp >= 100) conditionsMet++;
    if (maxHp >= 150) conditionsMet++;
    if (maxMp >= 70) conditionsMet++;
    if (totalAttack >= 50) conditionsMet++;
    if (userData.equippedCards.length >= 4) conditionsMet++;
    playerPortraitImg.src = `img/player${conditionsMet}.png`;

    // --- UI 표시 (기존과 동일) ---
    userNicknameEl.textContent = userData.nickname;
    userGoldEl.textContent = userData.gold;
    userPosPointsEl.textContent = userData.points.partsOfSpeech;
    playerHpText.textContent = `${maxHp} / ${maxHp}`;
    playerHpBar.style.width = '100%';
    playerMpText.textContent = `${maxMp} / ${maxMp}`;
    playerMpBar.style.width = '100%';
}

/////////////////////CARD//////////////////////////
function openCardDetailModal(cardId) {
    const cardDB = JSON.parse(localStorage.getItem('cardDB'));
    const skillDB = JSON.parse(localStorage.getItem('skillDB'));
    const card = cardDB.find(c => c.id === cardId);
    if (!card) return;

    const skill = skillDB.find(s => s.id === card.skillId);
    const skillName = skill ? skill.name : "없음";

    detailCardName.textContent = card.name;
    detailCardContent.innerHTML = `
        <p><strong>HP 보너스:</strong> ${card.hpBonus}</p>
        <p><strong>MP 보너스:</strong> ${card.mpBonus}</p>
        <p><strong>공격력 보너스:</strong> ${card.attackBonus}</p>
        <p><strong>사용 스킬:</strong> ${skillName}</p>
        <p class="description">"${card.description || '아직 알려진 바가 없다.'}"</p>
    `;

    openModal(cardDetailModal);
}

function renderCardDex() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    const cardDB = JSON.parse(localStorage.getItem('cardDB'));
    const skillDB = JSON.parse(localStorage.getItem('skillDB'));

    equippedCardsSection.innerHTML = '';
    cardDexSection.innerHTML = '';

    // 카드 아이템 HTML을 생성하는 헬퍼 함수
    const createCardHTML = (card, isEquipped) => {
        const skill = skillDB.find(s => s.id === card.skillId);
        const skillName = skill ? skill.name : "없음";
        
        // [추가] 카드 ID에서 'C'를 제거하여 숫자만 추출
        const cardNumber = card.id.replace('C', '');

        let actionsHTML = '';
        if (isEquipped) {
            actionsHTML = `<button class="unequip-btn" onclick="unequipCard('${card.id}')">해제</button>`;
        } else {
            actionsHTML = `<button class="equip-btn" onclick="equipCard('${card.id}')" ${userData.equippedCards.length >= 4 ? 'disabled' : ''}>장착</button>`;
        }
        actionsHTML += `<button class="detail-btn" onclick="openCardDetailModal('${card.id}')">자세히</button>`;

        return `
            <div class="card-item">
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

    // 도감 섹션 채우기
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
    
    // 필터 버튼 활성화 상태 업데이트
    dexFilterButtons.querySelectorAll('.dex-filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.range === currentDexPage) {
            btn.classList.add('active');
        }
    });
}

// 도감 모달을 여는 함수 (초기화 역할)
function openCardDexModal() {
    currentDexPage = '1-20'; // 열 때마다 기본 페이지로 초기화
    renderCardDex(); // 내용물 그리기
    openModal(cardDexModal); // 모달 보이기
}

function equipCard(cardId) {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData.equippedCards.length < 4) {
        if (!userData.equippedCards.includes(cardId)) {
            userData.equippedCards.push(cardId);
            localStorage.setItem('userData', JSON.stringify(userData));
            uploadUserData(userData.id);
            renderCardDex(); // [수정] 모달을 다시 여는 대신, 내용물만 새로고침
            displayUserData();
        }
    } else {
        alert("카드는 최대 4개까지만 장착할 수 있습니다.");
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

//////////////////////////////////////////////////////

// openModal 헬퍼 함수 추가 (또는 기존 함수 활용)
function openModal(modal) {
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

// ✨ 수정됨: 누락되었던 openDungeonModal 함수 추가
function openDungeonModal() {
    const allDungeons = JSON.parse(localStorage.getItem('dungeonDB') || '[]');
    const visibleDungeons = allDungeons.filter(dungeon => VISIBLE_DUNGEON_IDS.includes(dungeon.id));
    if (!visibleDungeons || visibleDungeons.length === 0) {
        dungeonListEl.innerHTML = "<p>현재 열린 던전이 없습니다.</p>";
    } else {
        dungeonListEl.innerHTML = '';
        visibleDungeons.forEach(dungeon => {
            const card = document.createElement('div');
            card.className = 'dungeon-card';
            card.innerHTML = `<h2>${dungeon.name}</h2><p>테마: ${dungeon.area}</p><p>난이도: ${dungeon.recommendedLevel}</p>`;
            card.addEventListener('click', () => {
                modalBackdrop.classList.add('hidden');
                dungeonModal.classList.add('hidden');
                startBattle(dungeon.id);
            });
            dungeonListEl.appendChild(card);
        });
    }
    modalBackdrop.classList.remove('hidden');
    dungeonModal.classList.remove('hidden');
}

function endBattle() {
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
}
// endBattle 함수를 battle.js에서 호출할 수 있도록 전역 함수로 등록
window.endBattle = endBattle;

// 전투 시작 함수
async function startBattle(dungeonId) {
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
        battleStyle.href = 'battlestyle.css';
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

async function initializeMainScreen() {
    // localStorage에 cardDB가 없으면 서버에서 모든 게임 DB를 불러옴
    if (!localStorage.getItem('cardDB')) {
        const success = await fetchAndStoreGameData();
        if (!success) return; // 데이터 로딩 실패 시 함수 중단
    }
    
    // ✨ 수정됨: 데이터 로딩이 끝난 후, 로딩 메시지를 숨기고 메인 메뉴를 표시
    loadingMessageEl.style.display = 'none';
    mainMenuEl.classList.remove('hidden');

    // 사용자 정보와 던전 목록 표시
    displayUserData();

    // 이벤트 리스너 설정
    cardViewBtn.addEventListener('click', openCardDexModal);
    itemViewBtn.addEventListener('click', openItemViewModal);
    exploreBtn.addEventListener('click', openDungeonModal);
    gachaBtn.addEventListener('click', openGachaModal);
    // 뽑기 결과 확인 버튼 리스너 추가
    gachaConfirmBtn.addEventListener('click', () => {
        // 결과 창을 숨기고 다시 팩 목록을 보여줌
        gachaResultView.classList.add('hidden');
        openGachaModal(); // 팩 목록을 재구성하여 버튼 상태 등을 갱신
    });

    shopBtn.addEventListener('click', openShopModal);

    // 상점 목록에 이벤트 위임을 사용하여 '구매' 버튼 클릭 처리
    shopItemList.addEventListener('click', function(event) {
        if (event.target.classList.contains('buy-btn')) {
            const itemId = event.target.dataset.itemId;
            buyItem(itemId);
        }
    });

    detailModalCloseBtn.addEventListener('click', () => {
    cardDetailModal.classList.add('hidden'); // 상세보기 창만 닫음
    });

    document.querySelectorAll('.modal-close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            modalBackdrop.classList.add('hidden');
            cardDexModal.classList.add('hidden');
            cardDetailModal.classList.add('hidden');
            itemViewModal.classList.add('hidden');
            dungeonModal.classList.add('hidden');
            shopModal.classList.add('hidden');
            gachaModal.classList.add('hidden');
            cardDetailModal.classList.add('hidden');
        });
    });

    dexFilterButtons.addEventListener('click', (event) => {
    if (event.target.classList.contains('dex-filter-btn')) {
        currentDexPage = event.target.dataset.range;
        renderCardDex(); // 선택된 페이지로 도감 내용 다시 그리기
    }
});
}

function openShopModal() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    const itemDB = JSON.parse(localStorage.getItem('itemDB'));
    
    shopUserGold.textContent = userData.gold; // 상점 창에 현재 골드 표시
    shopItemList.innerHTML = ''; // 목록 초기화

    // forSale 플래그가 1인 아이템만 필터링
    const itemsForSale = itemDB.filter(item => item.forSale === 1);

    if (itemsForSale.length === 0) {
        shopItemList.innerHTML = '<p>현재 판매 중인 아이템이 없습니다.</p>';
    } else {
        itemsForSale.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'item-list-item';

            // 아이템 정보와 구매 버튼을 포함하는 HTML 구조
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
            
            // 골드가 부족하면 구매 버튼 비활성화
            if (userData.gold < item.price) {
                buyBtn.disabled = true;
            }

            shopItemList.appendChild(itemEl);
        });
    }
    
    modalBackdrop.classList.remove('hidden');
    shopModal.classList.remove('hidden');
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

    // 골드 차감
    userData.gold -= itemToBuy.price;

    // 인벤토리에 아이템 추가 (없으면 1, 있으면 +1)
    userData.inventory[itemToBuy.id] = (userData.inventory[itemToBuy.id] || 0) + 1;

    // 변경된 데이터를 로컬 스토리지에 저장하고 서버에 업로드
    localStorage.setItem('userData', JSON.stringify(userData));
    if (userData.id) { // 로그인 유저일 경우에만 업로드
        uploadUserData(userData.id);
    }


    alert(`${itemToBuy.name}을(를) 구매했습니다!`);

    // UI 갱신
    displayUserData(); // 메인 화면의 골드 정보 업데이트
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
        if (userData.points.partsOfSpeech < pack.pricePosPoints) {
            alert("품사 포인트가 부족합니다."); return;
        }

        // 재화 우선 차감
        userData.gold -= pack.priceGold;
        userData.points.partsOfSpeech -= pack.pricePosPoints;

        // 카드 뽑기 실행
        const drawnCardId = drawCard(pack);
        const isDuplicate = userData.ownedCards.includes(drawnCardId);

        // 결과 표시를 위한 UI 요소 가져오기
        const drawnCard = cardDB.find(c => c.id === drawnCardId);
        const resultTitle = gachaResultView.querySelector('h4');
        const resultMessage = gachaResultView.querySelector('p');

        if (isDuplicate) {
            // [추가] 중복 카드일 경우의 처리
            // 1. 환급액 계산 (60% 반올림)
            const goldRefund = Math.round(pack.priceGold * 0.6);
            const pointsRefund = Math.round(pack.pricePosPoints * 0.6);

            // 2. 환급액 적용
            userData.gold += goldRefund;
            userData.points.partsOfSpeech += pointsRefund;

            // 3. 결과 메시지 설정
            resultTitle.textContent = '💧 이런... 이미 소유한 카드네요.💧';
            resultMessage.innerHTML = `'${drawnCard.name}' 카드를 이미 소유하고 있어,<br>비용의 60%인 ${goldRefund} G와 ${pointsRefund} P를 돌려받습니다.`;
            
        } else {
            // 새로운 카드일 경우의 처리
            userData.ownedCards.push(drawnCardId);
            resultTitle.textContent = '🎉 축하합니다! 🎉';
            resultMessage.textContent = `'${drawnCard.name}' 카드를 새로 획득했습니다!`;
        }

        // 변경된 데이터 저장 및 서버 업로드
        localStorage.setItem('userData', JSON.stringify(userData));
        if (userData.id) {
            uploadUserData(userData.id);
        }
        
        // 결과 화면 표시
        gachaPackList.classList.add('hidden');
        gachaResultView.classList.remove('hidden');
        gachaResultCard.innerHTML = `<strong>${drawnCard.name}</strong>`;
        
        // 메인 화면 UI 갱신 (변경된 골드/포인트 반영)
        displayUserData();
    }


/**
 * 카드 뽑기 모달을 열고 판매중인 팩 목록을 표시하는 함수
 */
function openGachaModal() {
    gachaPackList.classList.remove('hidden');
    gachaResultView.classList.add('hidden');
    
    const userData = JSON.parse(localStorage.getItem('userData'));
    const cardPackDB = JSON.parse(localStorage.getItem('cardPackDB') || '[]');
    
    gachaPackList.innerHTML = '';
    
    const packsForSale = cardPackDB.filter(p => p.forSale === 1);

    if (packsForSale.length === 0) {
        gachaPackList.innerHTML = '<p>현재 판매 중인 카드팩이 없습니다.</p>';
    } else {
        packsForSale.forEach(pack => {
            const packEl = document.createElement('div');
            packEl.className = 'dungeon-card'; // 기존 스타일 재활용
            packEl.style.cursor = 'default';

            packEl.innerHTML = `
                <h2>${pack.name}</h2>
                <p>${pack.description}</p>
                <p><strong>가격:</strong> ${pack.priceGold} G / ${pack.pricePosPoints} P</p>
            `;
            
            const purchaseBtn = document.createElement('button');
            purchaseBtn.textContent = '구매';
            purchaseBtn.className = 'login-btn'; // 기존 스타일 재활용
            purchaseBtn.style.marginTop = '10px';

            if (userData.gold < pack.priceGold || userData.points.partsOfSpeech < pack.pricePosPoints) {
                purchaseBtn.disabled = true;
            }
            
            purchaseBtn.onclick = () => purchaseCardPack(pack.id);
            
            packEl.appendChild(purchaseBtn);
            gachaPackList.appendChild(packEl);
        });
    }

    modalBackdrop.classList.remove('hidden');
    gachaModal.classList.remove('hidden');
}

initializeMainScreen();