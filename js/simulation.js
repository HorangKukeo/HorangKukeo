// js/simulation.js

(function() {
    // === 상수 정의 ===
    const GAME_DATA_URL = 'https://hook.us2.make.com/9a5ve7598e6kci7tchidj4669axhbw91'; //
    const USER_SUCCESS_RATE = 0.85; // s_user의 정답 기대값 (85%)
    const MAX_TRIALS_PER_L = 100;   // 기본 100회
    const CONSECUTIVE_WIN_STOP = 10; // 3회 연속 성공 시 조기 종료
    // EARLY_EXIT_FAILURE_COUNT 상수 제거

    // === [신규] Stat 추정 함수 (JS 변환) ===
    /** (a=3.7602, b=-32.5005, c=131.6909) */
    function estimate_hp(level) {
        const hp = (3.7602 * level**2) + (-32.5005 * level) + 131.6909;
        return Math.max(10, parseInt(hp)); // 최소 HP 10 보장
    }
    /** (a=0.6990, b=-6.1998, c=37.2088) */
    function estimate_mp(level) {
        const mp = (0.6990 * level**2) + (-6.1998 * level) + 37.2088;
        return Math.max(0, parseInt(mp)); // 최소 MP 0 보장
    }
    /** (a=0.0021, b=5.4956, c=-0.5188) */
    function estimate_attack(level) {
        // 1. 기본 공격력을 먼저 계산합니다.
        const baseAttack = (0.0021 * level**2) + (5.4956 * level) - 0.5188;
        
        let multiplier = 1.0;

        // 2. 레벨 30 이상일 경우 배수(multiplier)를 계산합니다.
        if (level >= 30) {
            // (level - 30) / 10 : 레벨 30 이후 10레벨 단위가 몇 번 지났는지 계산
            // ex) 30~39: 0~0.9 -> 0
            // ex) 40~49: 1~1.9 -> 1
            // ex) 50~59: 2~2.9 -> 2
            const steps = Math.floor((level - 30) / 10);
            
            // --- 2차 함수 모델 ---
            // multiplier = 1.1 (시작 배수) 
            //            + (steps * 0.1) (기존의 선형 증가분)
            //            + (steps * steps * 0.003) (가속도(증가폭)를 위한 2차 항)
            // ---------------------
            // * 0.003 대신 0.01, 0.02 등으로 수치를 조절하여 가속도를 높일 수 있습니다.
            multiplier = 1.1 + (steps * 0.1) + (steps * steps * 0.02);
        }

        // 3. 기본 공격력에 배수를 적용합니다.
        const finalAttack = baseAttack * multiplier;

        return Math.max(1, parseInt(finalAttack)); // 최소 ATK 1 보장
    }

    /** (a=12.4120, b=-166.3972, c=462.7128) */
    function estimate_gold(level) {
        const gold = ((12.4120 * level**2) + (-166.3972 * level) + 462.7128) * 0.90;
        return Math.max(0, parseInt(gold)); // 최소 0
    }
    /** (a=11.5485, b=-169.3519, c=478.2139) */
    function estimate_point(level) {
        const point = ((11.5485 * level**2) + (-169.3519 * level) + 478.2139) * 0.90;
        return Math.max(0, parseInt(point)); // 최소 0
    }

    function estimateLevelFromN(nValue) {
        if (nValue <= 0) return 'N/A'; // n값이 0 이하면 계산 불가
        // L = 3.73 * (N ^ 0.3918)
        const estimatedL = 3.73 * Math.pow(nValue, 0.3918);
        return Math.round(estimatedL); // 반올림
    }

    // === DB 저장소 ===
    let DB = {
        Cards: [], Skills: [], Items: [], CardPacks: [],
        Dungeons: [], Monsters: [], Questions: []
    }; //

    // === DOM 요소 ===
    const loader = document.getElementById('full-screen-loader'); //
    const loaderMessage = document.getElementById('full-screen-loader-message'); //
    const dbLoaderPanel = document.getElementById('db-loader-panel'); //
    const dbStatus = document.getElementById('db-status'); //
    const loadDbBtn = document.getElementById('load-db-btn'); //
    const simulatorPanel = document.getElementById('simulator-panel'); //
    const controls = document.getElementById('controls'); //
    const report = document.getElementById('report'); //
    const reportContainer = document.getElementById('report-container'); // [신규] 리포트 컨테이너
    const monsterSelect = document.getElementById('monster-select'); //
    const dungeonSelect = document.getElementById('dungeon-select'); //
    const startBtn = document.getElementById('start-sim-btn'); //
    const recentLogsContainer = document.getElementById('recent-logs-container'); //
    const recentLogsList = document.getElementById('recent-logs-list'); //
    const startLevelInput = document.getElementById('start-level-input'); // 시작 레벨 입력 필드

    // === [신규] 몬스터 생성기 DOM 요소 ===
    const generatorPanel = document.getElementById('generator-panel');
    const genMonsterLevel = document.getElementById('gen-monster-level');
    const genHp = document.getElementById('gen-hp');
    const genMp = document.getElementById('gen-mp');
    const genAtk = document.getElementById('gen-atk');
    const genGold = document.getElementById('gen-gold');
    const genPoint = document.getElementById('gen-point');
    const genCopyStatsBtn = document.getElementById('gen-copy-stats-btn');
    const genSkill1Type = document.getElementById('gen-skill1-type');
    const genSkill1Effect = document.getElementById('gen-skill1-effect');
    const genSkill1Mpcost = document.getElementById('gen-skill1-mpcost');
    const genSkill2Type = document.getElementById('gen-skill2-type');
    const genSkill2Effect = document.getElementById('gen-skill2-effect');
    const genSkill2Mpcost = document.getElementById('gen-skill2-mpcost');
    const genSkill3Type = document.getElementById('gen-skill3-type');
    const genSkill3Effect = document.getElementById('gen-skill3-effect');
    const genSkill3Mpcost = document.getElementById('gen-skill3-mpcost');
    const startGenSimBtn = document.getElementById('start-gen-sim-btn');

    /**
     * 리포트 창에 로그를 추가합니다. (HTML 형식)
     */
    function logToReport(html) {
        if (report.innerHTML.includes('시뮬레이션 대기 중')) { //
            report.innerHTML = ''; //
        }
        report.innerHTML += html + '\n'; //
        report.scrollTop = report.scrollHeight; //
    }

    /**
     * 최근 10회 로그를 불러와 표시
     */
    function loadAndDisplayRecentLogs() {
        const logs = JSON.parse(localStorage.getItem('simLogs') || '[]'); //
        if (logs.length === 0) { //
            recentLogsList.innerHTML = '<p>로그가 없습니다.</p>'; //
            return; //
        }

        recentLogsList.innerHTML = ''; // 초기화
        logs.forEach(log => { //
            const logEntry = document.createElement('div'); //
            const date = new Date(log.date).toLocaleString('ko-KR', { //
                month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' //
            });
            const nValue = log.n > 0 ? `n = ${log.n}` : 'N/A'; //

            logEntry.innerHTML = `
                <span class="log-name">${log.name}</span>
                <span class="log-n">${nValue}</span>
                <span class="log-date">(${date})</span>
            `; //
            recentLogsList.appendChild(logEntry); //
        });
    }

    /**
     * 시뮬레이션 종료 시 로그 저장
     */
    function saveSimulationLog(targetName, nValue) {
        let logs = JSON.parse(localStorage.getItem('simLogs') || '[]'); //

        const newLog = {
            name: targetName, //
            n: nValue, //
            date: new Date().toISOString() //
        };

        logs.unshift(newLog); // 새 로그를 맨 앞에 추가
        logs = logs.slice(0, 10); // 10개로 제한

        localStorage.setItem('simLogs', JSON.stringify(logs)); //
        loadAndDisplayRecentLogs(); // 로그 저장 후 즉시 UI 갱신
    }


    /**
     * LocalStorage에서 DB를 로드 시도
     */
    function checkLocalDB() {
        const localDBString = localStorage.getItem('gameDB'); //
        if (localDBString) { //
            try {
                DB = JSON.parse(localDBString); //
                if (DB.Monsters && DB.Monsters.length > 0) { // DB 데이터 유효성 확인
                    populateSelects(); //
                    simulatorPanel.classList.remove('hidden'); //
                    generatorPanel.classList.remove('hidden'); // [신규]
                    reportContainer.classList.remove('hidden'); // [신규]
                    dbStatus.textContent = "DB loaded from Local Storage."; //
                    loadDbBtn.textContent = "Reload DB from Server"; //
                    recentLogsContainer.classList.remove('hidden'); // 로그 패널 표시
                    loadAndDisplayRecentLogs(); //
                    return true; //
                }
            } catch (e) {
                console.error("Failed to parse local DB:", e); //
                localStorage.removeItem('gameDB'); // 파싱 실패 시 제거
            }
        }
        // 로컬 DB가 없거나 파싱 실패 시
        dbStatus.textContent = "DB not loaded. Please load from server."; //
        simulatorPanel.classList.add('hidden'); //
        recentLogsContainer.classList.add('hidden'); // 로그도 숨김
        return false; //
    }

    /**
     * 서버에서 DB 로드 및 LocalStorage에 저장
     */
    async function loadAllGameData() {
        loader.classList.remove('hidden'); //
        loadDbBtn.disabled = true; //
        loadDbBtn.textContent = "Loading..."; //

        try {
            loaderMessage.textContent = "게임 데이터를 서버에서 불러오는 중..."; //
            const response = await fetch(GAME_DATA_URL); //
            if (!response.ok) throw new Error(`서버 응답 오류: ${response.status}`); //
            const data = await response.json(); //

            // DB 파싱 로직
            loaderMessage.textContent = "데이터 처리 중... (1/7)"; //
            DB.Cards = parseDB(data.Cards, ['id', 'name', 'hpBonus', 'mpBonus', 'attackBonus', 'skillId', 'description', 'class']); //

            loaderMessage.textContent = "데이터 처리 중... (2/7)"; //
            DB.Skills = parseDB(data.Skills, ['id', 'name', 'type', 'effect', 'mpCost', 'desc']); //
            DB.Skills.forEach(s => { //
                s.type = parseInt(s.type, 10) || 0; //
                s.effect = parseFloat(s.effect) || 0; //
                s.mpCost = parseInt(s.mpCost, 10) || 0; //
            });

            loaderMessage.textContent = "데이터 처리 중... (3/7)"; //
            DB.Items = parseDB(data.Items, ['id', 'name', 'type', 'value', 'price', 'forSale', 'desc']); //

            loaderMessage.textContent = "데이터 처리 중... (4/7)"; //
            DB.CardPacks = parseDB(data.CardPacks, ['id', 'name', 'priceGold', 'pricePoints', 'description', 'forSale', 'cardPool']); //

            loaderMessage.textContent = "데이터 처리 중... (5/7)"; //
            DB.Dungeons = parseDB(data.Dungeons, ['id', 'name', 'area', 'recommendedLevel', 'monster1Id', 'monster2Id', 'monster3Id', 'monster4Id', 'monster5Id']); //

            loaderMessage.textContent = "데이터 처리 중... (6/7)"; //
            DB.Monsters = parseDB(data.Monsters, ['id', 'name', 'level', 'hp', 'mp', 'attack', 'goldReward', 'pointReward', 'affiliation', 'questionPool', 'skillId1', 'skillId2', 'skillId3', 'img']); //
            DB.Monsters.forEach(m => { //
                m.hp = parseInt(m.hp, 10) || 50; //
                m.maxHp = m.hp; //
                m.mp = parseInt(m.mp, 10) || 10; //
                m.maxMp = m.mp; //
                m.attack = parseInt(m.attack, 10) || 5; //
                m.level = parseInt(m.level, 10) || 0; // 레벨 숫자로 변환
            });
            DB.Dungeons.forEach(d => { //
                d.recommendedLevel = parseInt(d.recommendedLevel, 10) || 0; // 권장 레벨 숫자로 변환
            });

            loaderMessage.textContent = "데이터 처리 중... (7/7)"; //
            DB.Questions = parseDB(data.Questions, ['id', 'name', 'type', 'question1', 'question2', 'question3', 'question4', 'question5', 'question6', 'question7', 'question8', 'question9', 'question10', 'question11', 'question12', 'question13', 'question14', 'question15', 'question16', 'question17', 'question18', 'question19', 'question20']); //

            localStorage.setItem('gameDB', JSON.stringify(DB)); // 로컬스토리지에 저장

            populateSelects(); //
            simulatorPanel.classList.remove('hidden'); //
            generatorPanel.classList.remove('hidden'); // [신규]
            reportContainer.classList.remove('hidden'); // [신규]
            dbStatus.textContent = "DB Loaded successfully from Server."; //
            loadDbBtn.textContent = "Reload DB from Server"; //
            recentLogsContainer.classList.remove('hidden'); // 로그 패널 표시
            loadAndDisplayRecentLogs(); //

        } catch (error) {
            console.error('게임 데이터를 불러오는 중 오류 발생:', error); //
            loaderMessage.textContent = '데이터 로딩 실패! 페이지를 새로고침 해주세요.'; //
            dbStatus.textContent = "Error loading DB. Please try again."; //
        } finally {
            loader.classList.add('hidden'); //
            loadDbBtn.disabled = false; //
        }
    }

    /**
     * DB 로드 후 드롭다운 메뉴를 채웁니다. (정렬 기능 추가)
     */
    function populateSelects() {
        const sortOrder = document.querySelector('input[name="sortOrder"]:checked').value; //
        monsterSelect.innerHTML = '<option value="">-- 몬스터 선택 --</option>'; //
        dungeonSelect.innerHTML = '<option value="">-- 던전 선택 --</option>'; //

        let sortedMonsters = [...DB.Monsters]; //
        if (sortOrder === 'id') { //
            sortedMonsters.sort((a, b) => a.id.localeCompare(b.id)); //
        } else if (sortOrder === 'level') { //
            sortedMonsters.sort((a, b) => (a.level - b.level) || a.name.localeCompare(b.name)); //
        } else { // 이름순 (기본)
            sortedMonsters.sort((a, b) => a.name.localeCompare(b.name)); //
        }

        let sortedDungeons = [...DB.Dungeons]; //
        if (sortOrder === 'id') { //
            sortedDungeons.sort((a, b) => a.id.localeCompare(b.id)); //
        } else if (sortOrder === 'level') { //
            sortedDungeons.sort((a, b) => (a.recommendedLevel - b.recommendedLevel) || a.name.localeCompare(b.name)); //
        } else { // 이름순 (기본)
            sortedDungeons.sort((a, b) => a.name.localeCompare(b.name)); //
        }

        sortedMonsters.forEach(monster => { //
            const option = document.createElement('option'); //
            option.value = monster.id; //
            option.textContent = `[L.${monster.level}] ${monster.name} (ID: ${monster.id})`; //
            monsterSelect.appendChild(option); //
        });

        sortedDungeons.forEach(dungeon => { //
            const option = document.createElement('option'); //
            option.value = dungeon.id; //
            option.textContent = `[L.${dungeon.recommendedLevel}] ${dungeon.name} (ID: ${dungeon.id})`; //
            dungeonSelect.appendChild(option); //
        });
    }

    /**
     * 전투 시뮬레이션 엔진 (Headless)
     */
    class SimulationEngine {
        constructor(dbs) {
            this.dbs = dbs; //
        }

        /**
         * s_user 객체 생성
         */
        createSimUser(L) {
            return {
                L: L, //
                maxHp: L * 5 + 30, //
                hp: L * 5 + 30, //
                attack: L * 2.5 + 10, //
                interferenceMultiplier: 0.5, // ◀ battle.js의 방해/방어 배율 (기본값 0.5)
            };
        }

        /**
         * 몬스터 행동 결정 (battle.js 로직)
         */
        getMonsterAction(monster) {
            const monsterSkills = [
                monster.skillId1, monster.skillId2, monster.skillId3
            ].filter(id => id).map(id => this.dbs.Skills.find(s => s.id === id)) //
            .filter(skill => skill && monster.mp >= skill.mpCost); // MP 체크

            let actionWeights = []; //
            // 스킬 개수에 따른 가중치 설정 (battle.js 로직과 동일)
            if (monsterSkills.length === 0) {
                actionWeights = [{ type: 'attack', weight: 100 }]; //
            } else if (monsterSkills.length === 1) {
                actionWeights = [ { type: 'skill', skill: monsterSkills[0], weight: 40 }, { type: 'attack', weight: 60 } ]; //
            } else if (monsterSkills.length === 2) {
                actionWeights = [ { type: 'skill', skill: monsterSkills[0], weight: 30 }, { type: 'skill', skill: monsterSkills[1], weight: 25 }, { type: 'attack', weight: 45 } ]; //
            } else {
                actionWeights = [ { type: 'skill', skill: monsterSkills[0], weight: 30 }, { type: 'skill', skill: monsterSkills[1], weight: 23 }, { type: 'skill', skill: monsterSkills[2], weight: 17 }, { type: 'attack', weight: 30 } ]; //
            }

            const totalWeight = actionWeights.reduce((sum, item) => sum + item.weight, 0); //
            let random = Math.random() * totalWeight; //

            for (const item of actionWeights) { //
                if (random < item.weight) return item; //
                random -= item.weight; //
            }
            return { type: 'attack' }; // Fallback
        }

        /**
         * 1회 전투 시뮬레이션
         */
        runTrial(monsterData, s_user_battle) {
            const monster_battle = { ...monsterData, hp: monsterData.maxHp, mp: monsterData.maxMp }; //

            while (true) { //
                // 1. s_user 턴 ('공격' 고정)
                let isCorrect = Math.random() < USER_SUCCESS_RATE; //
                if (isCorrect) { //
                    monster_battle.hp -= s_user_battle.attack; //
                }
                if (monster_battle.hp <= 0) return true; // 유저 승리

                // 2. 몬스터 턴
                const action = this.getMonsterAction(monster_battle); //
                isCorrect = Math.random() < USER_SUCCESS_RATE; // 유저 방어/방해 성공 여부

                if (action.type === 'attack') { //
                    // [수정] 0.5 대신 s_user_battle.interferenceMultiplier 사용
                    const damage = isCorrect ? monster_battle.attack * s_user_battle.interferenceMultiplier : monster_battle.attack; //
                    s_user_battle.hp -= Math.floor(damage); //
                }
                else if (action.type === 'skill') { //
                    const skill = action.skill; //
                    monster_battle.mp -= skill.mpCost; //
                    if (skill.type === 1) { // 공격 스킬
                        const damage = monster_battle.attack * skill.effect; //
                        // [수정] 0.5 대신 s_user_battle.interferenceMultiplier 사용
                        const finalDamage = isCorrect ? damage * s_user_battle.interferenceMultiplier : damage; //
                        s_user_battle.hp -= Math.floor(finalDamage); //
                    } else if (skill.type === 2) { // 회복 스킬
                        const heal = skill.effect; //
                        // [수정] 0.5 대신 s_user_battle.interferenceMultiplier 사용
                        const finalHeal = isCorrect ? heal * s_user_battle.interferenceMultiplier : heal; //
                        monster_battle.hp = Math.min(monster_battle.maxHp, monster_battle.hp + Math.floor(finalHeal)); //
                    
                    // === [신규] battle.js 스킬 로직 추가 (Type 3, 4, 5) ===
                    } else if (skill.type === 3) { // Type 3: 공격력 상승
                        const effectValue = isCorrect ? skill.effect * s_user_battle.interferenceMultiplier : skill.effect;
                        monster_battle.attack += Math.floor(effectValue);

                    } else if (skill.type === 4) { // Type 4: HP 상승 (비율 유지)
                        const effectValue = isCorrect ? skill.effect * s_user_battle.interferenceMultiplier : skill.effect;
                        const hpPercent = monster_battle.hp / monster_battle.maxHp;
                        monster_battle.maxHp += Math.floor(effectValue);
                        monster_battle.hp = Math.round(monster_battle.maxHp * hpPercent);

                    } else if (skill.type === 5) { // Type 5: 방해 효과 감소 (유저 스탯 변경)
                        // [수정] 0.5 대신 s_user_battle.interferenceMultiplier 사용
                        const effectValue = isCorrect ? skill.effect * s_user_battle.interferenceMultiplier : skill.effect;
                        s_user_battle.interferenceMultiplier += effectValue;
                        // battle.js 로직: 1.0 (100%)를 넘지 않도록 제한
                        s_user_battle.interferenceMultiplier = Math.min(1.0, s_user_battle.interferenceMultiplier);
                    }
                    // === [신규] 로직 추가 끝 ===
                }
                if (s_user_battle.hp <= 0) return false; // 유저 패배
            }
        }

        /**
         * 몬스터 시뮬레이션 래퍼 함수 (startL 파라미터 추가)
         */
        startMonsterSimulation(monsterId, startL) {
            const monsterData = this.dbs.Monsters.find(m => m.id === monsterId); //
            if (!monsterData) { //
                logToReport(`<span class="fail">오류: 몬스터 ID (${monsterId})를 찾을 수 없습니다.</span>`); //
                startBtn.disabled = false; //
                return; //
            }
            logToReport(`<h3>몬스터 시뮬레이션 시작: ${monsterData.name} (HP: ${monsterData.maxHp}, ATK: ${monsterData.attack})</h3>`); //
            this.runMonsterStep(monsterData, startL, -1); // startL로 스텝 시작
        }

        /**
         * 몬스터 시뮬레이션 스텝 함수 (L값 1개 처리)
         */
        runMonsterStep(monsterData, L, firstSuccessL) {
            const s_user = this.createSimUser(L); //
            let trialsWon = 0; //
            let trialLogs = []; //
            let consecutiveWins = 0; //
            let trialsActuallyRun = 0; //

            for (let i = 1; i <= MAX_TRIALS_PER_L; i++) { // 100회 트라이얼
                trialsActuallyRun = i; //
                const s_user_battle = { ...s_user }; //
                const result = this.runTrial(monsterData, s_user_battle); //

                if (result) { //
                    trialsWon++; //
                    consecutiveWins++; //
                    trialLogs.push(`<span class="success">T${i}:성공</span>`); //
                } else {
                    consecutiveWins = 0; // 연속 성공 리셋
                    trialLogs.push(`<span class="fail">T${i}:실패</span>`); //
                }

                if (i === CONSECUTIVE_WIN_STOP && consecutiveWins === CONSECUTIVE_WIN_STOP) { // 3회 연속 성공 시 조기 종료
                    trialLogs.push("... (3회 연속 성공, 조기 종료)"); //
                    break; //
                }
                // 연속 실패 조기 종료 로직 제거됨
            }

            const successRate = (trialsWon / trialsActuallyRun); //
            logToReport(`<h2>L = ${L} (HP:${s_user.maxHp}, ATK:${s_user.attack}) - ${trialsWon} / ${trialsActuallyRun} (${(successRate * 100).toFixed(1)}%)</h2>`); //
            logToReport(`<div class="trial-log">${trialLogs.join(' ')}</div>`); //

            if (successRate >= 0.5 && firstSuccessL === -1) { // n값 (50% 승률) 기록
                firstSuccessL = L; //
            }

            // 종료 조건 검사 (n + 3 또는 L > 300)
            if ((firstSuccessL !== -1 && L >= firstSuccessL + 3) || L > 300) { //
                const finalN = firstSuccessL > 0 ? firstSuccessL : -1; //
                logToReport(`<h3>시뮬레이션 종료 (50% 클리어 L=${finalN > 0 ? finalN : 'N/A'} + 3)</h3>`); //
                startBtn.disabled = false; // 버튼 다시 활성화
                startGenSimBtn.disabled = false; // [신규] 생성 버튼도 활성화
                saveSimulationLog(monsterData.name, finalN); // 로그 저장
                return; // 재귀 중단
            }

            // 다음 L 스텝 스케줄링 (비동기 처리)
            setTimeout(() => { //
                this.runMonsterStep(monsterData, L + 1, firstSuccessL); //
            }, 0); // 0ms 지연
        }


        /**
         * 던전 시뮬레이션 래퍼 함수 (startL 파라미터 추가)
         */
        startDungeonSimulation(dungeonId, startL) {
            const dungeonData = this.dbs.Dungeons.find(d => d.id === dungeonId); //
            if (!dungeonData) { logToReport(`<span class="fail">오류: 던전 ID (${dungeonId})를 찾을 수 없습니다.</span>`); startBtn.disabled = false; return; } //
            const monsterIds = [ dungeonData.monster1Id, dungeonData.monster2Id, dungeonData.monster3Id, dungeonData.monster4Id, dungeonData.monster5Id ].filter(id => id); //
            if (monsterIds.length === 0) { logToReport(`<span class="fail">오류: 던전(${dungeonData.name})에 몬스터가 없습니다.</span>`); startBtn.disabled = false; return; } //

            logToReport(`<h3>던전 시뮬레이션 시작: ${dungeonData.name} (몬스터 ${monsterIds.length}마리)</h3>`); //
            this.runDungeonStep(dungeonData, monsterIds, startL, -1); // startL로 스텝 시작
        }

        /**
         * 던전 시뮬레이션 스텝 함수 (L값 1개 처리)
         */
        runDungeonStep(dungeonData, monsterIds, L, firstSuccessL) {
            const s_user = this.createSimUser(L); //
            let trialsWon = 0; //
            let trialLogs = []; //
            let consecutiveWins = 0; //
            let trialsActuallyRun = 0; //

            for (let i = 1; i <= MAX_TRIALS_PER_L; i++) { // 100회 트라이얼
                trialsActuallyRun = i; //
                const s_user_battle = { ...s_user }; // 던전 HP는 누적
                let dungeonClear = true; //
                let monsterReport = []; //

                for (let j = 0; j < monsterIds.length; j++) { //
                    const monsterData = this.dbs.Monsters.find(m => m.id === monsterIds[j]); //
                    if (!monsterData) { monsterReport.push(`<span class="fail">M${j+1}(${monsterIds[j]}):DB오류</span>`); dungeonClear = false; break; } //
                    const result = this.runTrial(monsterData, s_user_battle); //
                    if (!result) { monsterReport.push(`<span class="fail">M${j+1}(${monsterData.name}):실패</span>`); dungeonClear = false; break; } //
                    monsterReport.push(`<span class="success">M${j+1}:성공</span>(HP:${s_user_battle.hp})`); //
                }

                if (dungeonClear) { //
                    trialsWon++; //
                    consecutiveWins++; //
                    trialLogs.push(`<div><span class="success">T${i}:클리어</span><div class="dungeon-monster-log">${monsterReport.join(' ')}</div></div>`); //
                } else {
                    consecutiveWins = 0; //
                    trialLogs.push(`<div><span class="fail">T${i}:실패</span><div class="dungeon-monster-log">${monsterReport.join(' ')}</div></div>`); //
                }

                if (i === CONSECUTIVE_WIN_STOP && consecutiveWins === CONSECUTIVE_WIN_STOP) { // 3회 연속 성공 시 조기 종료
                    trialLogs.push("... (3회 연속 성공, 조기 종료)"); //
                    break; //
                }
                // 연속 실패 조기 종료 로직 제거됨
            }

            const successRate = (trialsWon / trialsActuallyRun); //
            logToReport(`<h2>L = ${L} (HP:${s_user.maxHp}, ATK:${s_user.attack}) - ${trialsWon} / ${trialsActuallyRun} (${(successRate * 100).toFixed(1)}%)</h2>`); //
            logToReport(`<div class="trial-log">${trialLogs.join('')}</div>`); //

            if (successRate >= 0.5 && firstSuccessL === -1) { // n값 (50% 승률) 기록
                firstSuccessL = L; //
            }

            // 종료 조건 검사 (n + 3 또는 L > 300)
            if ((firstSuccessL !== -1 && L >= firstSuccessL + 3) || L > 1000) { //
                const finalN = firstSuccessL > 0 ? firstSuccessL : -1; //

                // [신규] 권장 레벨 역산
                const recommendedLevel = estimateLevelFromN(finalN);

                logToReport(`<h3>시뮬레이션 종료 (50% 클리어 n값 = ${finalN > 0 ? finalN : 'N/A'})</h3>`);
                logToReport(`<h3 style="color: var(--accent-color);">>>> 📈 DB 권장 레벨(L) 추정치: ${recommendedLevel}</h3>`);
                
                startBtn.disabled = false; // 버튼 다시 활성화
                startGenSimBtn.disabled = false; // [신규] 생성 버튼도 활성화
                saveSimulationLog(dungeonData.name, finalN); // 로그 저장
                return; // 재귀 중단
            }

            // 다음 L 스텝 스케줄링 (비동기 처리)
            setTimeout(() => { //
                this.runDungeonStep(dungeonData, monsterIds, L + 1, firstSuccessL); //
            }, 0); // 0ms 지연
        }
    } // End of SimulationEngine class

    /**
     * [신규] 몬스터 레벨이 변경될 때 Stat 필드를 자동으로 채웁니다.
     */
    function updateEstimatedStats() {
        const L = parseInt(genMonsterLevel.value, 10);
        if (isNaN(L) || L < 1) {
            // 값이 유효하지 않으면 필드 비우기
            genHp.value = ''; genMp.value = ''; genAtk.value = ''; genGold.value = ''; genPoint.value = '';
            return;
        }
        genHp.value = estimate_hp(L);
        genMp.value = estimate_mp(L);
        genAtk.value = estimate_attack(L);
        genGold.value = estimate_gold(L);
        genPoint.value = estimate_point(L);
    }


    /**
     * 페이지 초기화
     */
    function initialize() {
        loadDbBtn.addEventListener('click', loadAllGameData); //
        // [신규] 몬스터 레벨 변경 시 Stat 자동 계산 리스너
        genMonsterLevel.addEventListener('input', updateEstimatedStats);
        
        // [신규] 페이지 로드 시 기본값(Lv.10)으로 Stat 자동 계산 실행
        updateEstimatedStats();

        // [신규] Stat 복사 버튼 리스너
        genCopyStatsBtn.addEventListener('click', () => {
            try {
                const level = genMonsterLevel.value;
                const hp = genHp.value;
                const mp = genMp.value;
                const atk = genAtk.value;
                const gold = genGold.value;
                const point = genPoint.value;

                // [수정] 헤더 없이 값만 복사 (LV \t HP \t MP \t Atk \t Gold \t Point)
                const values = `${level}\t${hp}\t${mp}\t${atk}\t${gold}\t${point}`;

                navigator.clipboard.writeText(values);
                
                // 피드백
                const originalText = genCopyStatsBtn.textContent;
                genCopyStatsBtn.textContent = '복사 완료!';
                genCopyStatsBtn.disabled = true;
                setTimeout(() => {
                    genCopyStatsBtn.textContent = originalText;
                    genCopyStatsBtn.disabled = false;
                }, 1500);

            } catch (err) {
                console.error('클립보드 복사 실패:', err);
                alert('클립보드 복사에 실패했습니다. (HTTP 환경에서는 작동하지 않을 수 있습니다.)');
            }
        });


        // [신규] 생성기 버튼 이벤트 리스너
        startGenSimBtn.addEventListener('click', () => {
            const L = parseInt(genMonsterLevel.value, 10);
            if (isNaN(L) || L < 1) {
                alert("유효한 몬스터 레벨을 입력하세요 (1 이상).");
                return;
            }

            // 1. Stat [수정] -> 필드에서 직접 읽기 (값이 없으면 0으로)
            const finalHp = parseInt(genHp.value, 10) || 0;
            const finalMp = parseInt(genMp.value, 10) || 0;
            const finalAtk = parseInt(genAtk.value, 10) || 0;
            const finalGold = parseInt(genGold.value, 10) || 0;
            const finalPoint = parseInt(genPoint.value, 10) || 0;

            if (finalHp <= 0 || finalAtk <= 0) {
                alert("HP와 Attack은 1 이상이어야 합니다. (Stat 자동 생성 또는 수동 입력 필요)");
                return;
            }

            // 2. 임시 스킬 생성
            const tempSkills = [];
            const skillInputs = [
                { type: parseInt(genSkill1Type.value, 10), effect: parseFloat(genSkill1Effect.value), mpCost: parseInt(genSkill1Mpcost.value) },
                { type: parseInt(genSkill2Type.value, 10), effect: parseFloat(genSkill2Effect.value), mpCost: parseInt(genSkill2Mpcost.value) },
                { type: parseInt(genSkill3Type.value, 10), effect: parseFloat(genSkill3Effect.value), mpCost: parseInt(genSkill3Mpcost.value) }
            ];

            skillInputs.forEach((skill, index) => {
                if (skill.type > 0) {
                    tempSkills.push({
                        id: `tempSkill${index + 1}`,
                        name: `(생성) 스킬 ${index + 1}`,
                        type: skill.type,
                        effect: skill.effect || 0,
                        mpCost: skill.mpCost || 0,
                        desc: `임시 생성 스킬 (Type: ${skill.type})`
                    });
                }
            });

            // 3. 임시 몬스터 생성
            const monsterData = {
                id: 'GEN_MONSTER',
                name: `(생성) Lv.${L} 몬스터`,
                level: L,
                hp: finalHp,
                maxHp: finalHp,
                mp: finalMp,
                maxMp: finalMp,
                attack: finalAtk,
                goldReward: finalGold,
                pointReward: finalPoint,
                affiliation: 'Generated',
                questionPool: '', // (시뮬레이션 엔진은 questionPool을 사용하지 않음)
                skillId1: tempSkills[0] ? tempSkills[0].id : null,
                skillId2: tempSkills[1] ? tempSkills[1].id : null,
                skillId3: tempSkills[2] ? tempSkills[2].id : null,
                img: ''
            };

            // 4. 시뮬레이션을 위한 임시 DB 생성 (기존 DB는 유지)
            //    엔진이 스킬을 ID로 참조할 수 있도록 임시 스킬과 몬스터를 DB에 주입
            const tempDB = {
                ...DB, // Cards, Items 등 기존 DB 복사
                Skills: [...DB.Skills, ...tempSkills], // 기존 스킬 + 임시 스킬
                Monsters: [...DB.Monsters, monsterData] // 기존 몬스터 + 임시 몬스터
            };

            // 5. 시뮬레이션 시작 (기존 로직과 유사)
            let startL = parseInt(startLevelInput.value, 10);
            if (isNaN(startL) || startL < 1) {
                startL = 1;
                startLevelInput.value = '1';
            }

            report.innerHTML = `생성 몬스터 (Lv.${L}, HP:${finalHp}, MP:${finalMp}, ATK:${finalAtk}) 시뮬레이션을 시작합니다...`;
            startBtn.disabled = true;
            startGenSimBtn.disabled = true;

            const engine = new SimulationEngine(tempDB); // ★임시 DB로 엔진 생성
            engine.startMonsterSimulation(monsterData.id, startL); // ★임시 몬스터 ID로 시작
        });

        startBtn.addEventListener('click', () => { //
            const monsterId = monsterSelect.value; //
            const dungeonId = dungeonSelect.value; //
            // 시작 L 값 읽기 및 유효성 검사
            let startL = parseInt(startLevelInput.value, 10); //
            if (isNaN(startL) || startL < 1) { //
                startL = 1; // 유효하지 않으면 1로 강제
                startLevelInput.value = '1'; // 입력 필드 값도 수정
            }

            if (!monsterId && !dungeonId) { //
                alert("몬스터 또는 던전 중 하나를 선택해야 합니다."); //
                return; //
            }
            report.innerHTML = '시뮬레이션을 시작합니다...'; //
            startBtn.disabled = true; //

            const engine = new SimulationEngine(DB); //

            // startL 값을 래퍼 함수에 전달
            if (monsterId) { //
                engine.startMonsterSimulation(monsterId, startL); //
            } else if (dungeonId) { //
                engine.startDungeonSimulation(dungeonId, startL); //
            }
        });

        // [수정] 상호작용: DB 선택 시 생성기 초기화
        monsterSelect.addEventListener('change', () => { 
            if (monsterSelect.value) {
                dungeonSelect.value = ""; 
                // 생성기 값 초기화 (선택 사항)
                // genMonsterLevel.value = 10;
                // genSkill1Type.value = 0; ...
            }
        }); 
        dungeonSelect.addEventListener('change', () => { 
            if (dungeonSelect.value) {
                monsterSelect.value = ""; 
                // 생성기 값 초기화 (선택 사항)
            }
        }); 

        // [신규] 상호작용: 생성기 사용 시 DB 선택 해제
        const genInputs = [
            genMonsterLevel, 
            genSkill1Type, genSkill1Effect, genSkill1Mpcost,
            genSkill2Type, genSkill2Effect, genSkill2Mpcost,
            genSkill3Type, genSkill3Effect, genSkill3Mpcost
        ];
        genInputs.forEach(input => {
            input.addEventListener('change', () => {
                monsterSelect.value = "";
                dungeonSelect.value = "";
            });
        });

        document.querySelectorAll('input[name="sortOrder"]').forEach(radio => { //
            radio.addEventListener('change', () => { //
                if (DB.Monsters && DB.Monsters.length > 0) { //
                    populateSelects(); //
                }
            });
        });

        checkLocalDB(); // 페이지 로드 시 로컬 DB 확인
    }

    if (typeof parseDB === 'function') { //
        initialize(); //
    } else {
        document.addEventListener('DOMContentLoaded', initialize); //
    }
})();