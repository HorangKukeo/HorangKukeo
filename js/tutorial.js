// tutorial.js - 튜토리얼/도움말 시스템 (v2 - 완전 리뉴얼)

class GameTutorial {
    constructor() {
        this.currentStep = 0;
        this.tutorialSteps = this.initializeTutorialSteps();
        this.setupEventListeners();
        this.checkFirstTime();
    }

    initializeTutorialSteps() {
        return [
            {
                title: "🎮 문법 RPG에 오신 것을 환영합니다!",
                content: `
                    <p><strong>문법 RPG</strong>는 한국어 문법 학습을 게임으로 즐기는 턴제 RPG입니다.</p>
                    <p>문법 문제를 풀어 몬스터를 퇴치하고, 강력한 카드를 수집하며, 캐릭터를 성장시켜보세요!</p>
                    <p style="margin-top: 15px; color: #ffc107;"><strong>💡 팁: 쉬운 던전부터 시작하는 것을 추천합니다.</strong></p>
                `
            },
            {
                title: "📊 플레이어 능력치 (HP, MP, ATK)",
                content: `
                    <p><strong>HP:</strong> 전투 중 받는 피해량입니다. 0이 되면 게임 오버입니다.</p>
                    <p><strong>MP:</strong> 스킬 사용 시 소비되는 자원입니다. 전투 중 아이템으로 회복할 수 있습니다.</p>
                    <p><strong>ATK:</strong> 공격 시 입히는 기본 피해입니다.</p>
                    
                    <div style="margin-top: 15px; background-color: rgba(255, 193, 7, 0.1); padding: 12px; border-left: 3px solid #ffc107; border-radius: 3px;">
                        <p style="margin: 0; font-weight: bold; margin-bottom: 8px;">HP, MP, ATK를 높이는 방법:</p>
                        <p style="margin: 5px 0;">• 더 많은 카드를 보유하기</p>
                        <p style="margin: 5px 0;">• 높은 능력치의 카드를 장착하기 (최대 4장)</p>
                        <p style="margin: 5px 0;">• 상점에서 능력치 강화 아이템 구매하기 (영구적 상승)</p>
                    </div>
                `
            },
            {
                title: "🎴 카드 시스템",
                content: `
                    <p><strong>카드</strong>는 한국어 문법 개념을 나타내는 수집 아이템입니다.</p>
                    
                    <p style="margin-top: 15px;"><strong>🔹 보유 카드:</strong> 수집한 모든 카드는 누적 보너스를 제공합니다.</p>
                    <p style="margin: 5px 0; color: #999;">• 카드 1장 = HP +1, MP +0.5, 공격력 +0.5</p>
                    
                    <p style="margin-top: 15px;"><strong>⚡ 장착 카드:</strong> 최대 4장까지 선택해 장착할 수 있습니다.</p>
                    <p style="margin: 5px 0; color: #999;">• 각 카드는 고유한 HP, MP, 공격력 보너스를 제공합니다</p>
                    <p style="margin: 5px 0; color: #999;">• 각 카드마다 고유한 스킬을 가지고 있습니다</p>
                    
                    <p style="margin-top: 15px;"><strong>🆔 카드 번호:</strong> 각 카드는 고유한 번호(#001~#040)를 가지고 있습니다.</p>
                `
            },
            {
                title: "⚔️ 던전 탐험과 전투 시스템",
                content: `
                    <p><strong>던전 탐험</strong>은 여러 몬스터와 차례로 전투하는 미션입니다.</p>
                    
                    <p style="margin-top: 15px;"><strong>턴제 전투:</strong></p>
                    <p style="margin: 5px 0;">• 당신의 턴: 당신은 '공격, 스킬, 아이템, 도망' 중 하나의 행동을 선택합니다.</p>
                    <p style="margin: 5px 0;">• 몬스터의 턴: 몬스터는 '공격, 스킬' 중 하나의 행동을 선택합니다.</p>
                    <p style="margin: 5px 0;">• 당신이 '공격, 스킬, 도망'을 선택하거나, 몬스터가 행동을 할 경우, 당신은 몬스터가 출제하는 문제를 풀어야 합니다.</p>
                    
                    <p style="margin-top: 15px;"><strong>당신의 턴 행동 선택:</strong></p>
                    <p style="margin: 5px 0;">• <strong>공격:</strong> 상대에게 피해를 입힙니다</p>
                    <p style="margin: 5px 0;">• <strong>스킬:</strong> MP를 소비해 더 강력한 공격이나 회복을 할 수 있습니다</p>
                    <p style="margin: 5px 0;">• <strong>아이템:</strong> 소유한 아이템을 사용합니다.</p>
                    <p style="margin: 5px 0;">• <strong>도망:</strong> 던전에서 탈출합니다</p>
                    
                    <p style="margin-top: 15px;"><strong>몬스터의 턴 행동:</strong></p>
                    <p style="margin: 5px 0;">• <strong>공격:</strong> 당신에게 직접 피해를 입힙니다</p>
                    <p style="margin: 5px 0;">• <strong>공격 스킬:</strong> MP를 소비해 더 강력한 공격을 합니다</p>
                    <p style="margin: 5px 0;">• <strong>회복 스킬:</strong> MP를 소비해 자신의 HP를 회복합니다</p>
                    
                    <div style="margin-top: 12px; background-color: rgba(76, 175, 80, 0.1); padding: 12px; border-left: 3px solid #4caf50; border-radius: 3px;">
                        <p style="margin: 0; font-weight: bold; margin-bottom: 8px;">문제를 맞힐 경우:</p>
                        <p style="margin: 5px 0;">• 당신의 공격/스킬: <strong>정상적으로 공격/스킬이 사용됨.</strong></p>
                        <p style="margin: 5px 0;">• 당신의 도망가기: <strong>50% 확률로 도망에 성공함.</strong></p>
                        <p style="margin: 5px 0;">• 몬스터의 공격/공격 스킬: <strong>피해 50% 감소</strong></p>
                        <p style="margin: 5px 0;">• 몬스터의 회복 스킬: <strong>회복량 50% 감소</strong></p>
                    </div>
                    <div style="margin-top: 12px; background-color: rgba(173, 54, 54, 0.23); padding: 12px; border-left: 3px solid #5d1616ff; border-radius: 3px;">
                        <p style="margin: 0; font-weight: bold; margin-bottom: 8px;">문제를 틀릴 경우:</p>
                        <p style="margin: 5px 0;">• 당신의 공격/스킬/도망 <strong>행동에 실패함.</strong></p>
                        <p style="margin: 5px 0;">• 몬스터의 공격/스킬: <strong>피해량/회복량이 100% 적용됨.</strong></p>
                    </div>
                    
                    <div style="margin-top: 12px; background-color: rgba(255, 152, 0, 0.1); padding: 12px; border-left: 3px solid #ff9800; border-radius: 3px;">
                        <p style="margin: 0; color: #ff9800; font-weight: bold;">⚠️ 도망 페널티: 해당 던전에서 얻은 모든 보상이 사라집니다!</p>
                    </div>
                `
            },
            {
                title: "💔 패배했을 때",
                content: `
                    <p>전투 중 당신의 HP가 0이 되면 <strong>손실</strong>을 입고 마을로 돌아옵니다.</p>
                    
                    <p style="margin-top: 15px;"><strong>손실 사항:</strong></p>
                    <p style="margin: 5px 0;">• 현재 가진 골드의 <strong>1~10%</strong>를 잃습니다</p>
                    <p style="margin: 5px 0;">• 현재 가진 포인트의 <strong>1~10%</strong>를 잃습니다</p>
                    <p style="margin: 5px 0;">• 던전에서 얻기로 한 모든 보상이 사라집니다</p>
                `
            },
            {
                title: "🅿️ 포인트 시스템",
                content: `
                    <p>전투에서 획득할 수 있는 두 가지 포인트가 있습니다.</p>
                    
                    <p style="margin-top: 15px;"><strong>품사 포인트:</strong></p>
                    <p style="margin: 5px 0;">• 카드팩을 구매할 때 사용합니다.</p>
                    <p style="margin: 5px 0;">• <strong>품사</strong> 속성의 몬스터를 처치할 때 획득합니다</p>

                    <p style="margin-top: 15px;"><strong>문장 성분 포인트:</strong></p>
                    <p style="margin: 5px 0;">• 카드팩을 구매할 때 사용합니다.</p>
                    <p style="margin: 5px 0;">• <strong>문장 성분</strong> 속성의 몬스터를 처치할 때 획득합니다</p>
                    
                    <p style="margin-top: 15px;"><strong>💰 골드:</strong></p>
                    <p style="margin: 5px 0;">• 몬스터를 처치하면 획득합니다</p>
                    <p style="margin: 5px 0;">• 상점에서 아이템을 구매하거나 카드팩을 구매할 때 사용합니다.</p>
                `
            },
            {
                title: "✨ 카드 뽑기 (가챠)",
                content: `
                    <p><strong>카드 뽑기</strong>는 카드팩을 구매해 새로운 카드를 얻는 시스템입니다.</p>
                    
                    <p style="margin-top: 15px;"><strong>카드팩 종류:</strong></p>
                    <p style="margin: 5px 0;">• <strong>품사 ①:</strong> 기초 품사 관련 카드 (명사, 동사 등)</p>
                    <p style="margin: 5px 0;">• <strong>품사 ②:</strong> 고급 품사 관련 카드</p>
                    <p style="margin: 5px 0;">• <strong>문장 성분 ①:</strong> 기초 문장 성분 카드 (주어, 서술어 등)</p>
                    
                    <p style="margin-top: 15px;"><strong>🎲 중복 카드 시스템:</strong></p>
                    <p style="margin: 5px 0;">• 이미 가진 카드를 다시 뽑을 수 있습니다</p>
                    <p style="margin: 5px 0;">• 중복 카드를 뽑을 경우, 카드는 획득할 수 없지만 비용의 <strong>60%</strong>를 돌려 받습니다.</p>
                    
                    <p style="margin-top: 12px; color: #b0e57c;"><strong>💡 팁: 완전한 도감을 목표로 해보세요!</strong></p>
                `
            },
            {
                title: "🎯 성장 목표 (캐릭터 성장)",
                content: `
                    <p><strong>성장 목표</strong>는 게임 진행 상황을 나타내는 마일스톤입니다.</p>
                    
                    <p style="margin-top: 15px;"><strong>목표 달성 시 효과:</strong></p>
                    <p style="margin: 5px 0;">• 캐릭터 이미지가 변합니다 (성장 지표)</p>
                    <p style="margin: 5px 0;">• 캐릭터 강함을 시각적으로 확인할 수 있습니다</p>
                    
                    <p style="margin-top: 15px;"><strong>성장 단계:</strong></p>
                    <p style="margin: 5px 0;">• 특정 조건을 충족하면 자동으로 목표가 달성됩니다</p>
                    <p style="margin: 5px 0;">• 목표 "성장 목표" 메뉴에서 확인할 수 있습니다</p>
                `
            },
            {
                title: "🛍️ 상점 시스템",
                content: `
                    <p><strong>상점</strong>에서 골드로 아이템을 구매할 수 있습니다.</p>
                    
                    <p style="margin-top: 15px;"><strong>회복 아이템:</strong></p>
                    <p style="margin: 5px 0;">• HP 포션: 전투 중 HP를 회복합니다</p>
                    <p style="margin: 5px 0;">• MP 포션: 전투 중 MP를 회복합니다</p>
                    
                    <p style="margin-top: 15px;"><strong>전투 아이템:</strong></p>
                    <p style="margin: 5px 0;">• 공격 아이템: 상대에게 고정된 피해를 입힙니다</p>
                    
                    <p style="margin-top: 15px;"><strong>능력치 강화 아이템:</strong></p>
                    <p style="margin: 5px 0;">• HP 강화: 최대 HP를 영구적으로 상승시킵니다</p>
                    <p style="margin: 5px 0;">• MP 강화: 최대 MP를 영구적으로 상승시킵니다</p>
                    <p style="margin: 5px 0;">• ATK 강화: ATK를 영구적으로 상승시킵니다</p>
                    
                    <p style="margin-top: 12px; color: #b0e57c;"><strong>💡 팁: 능력치 강화 아이템은 장기적으로 도움이 됩니다!</strong></p>
                `
            }
        ];
    }

    setupEventListeners() {
        const helpBtn = document.getElementById('help-btn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => this.openTutorial());
        }

        const nextBtn = document.getElementById('tutorial-next-btn');
        const prevBtn = document.getElementById('tutorial-prev-btn');
        const skipBtn = document.getElementById('tutorial-skip-btn');

        if (nextBtn) nextBtn.addEventListener('click', () => this.nextStep());
        if (prevBtn) prevBtn.addEventListener('click', () => this.prevStep());
        if (skipBtn) skipBtn.addEventListener('click', () => this.closeTutorial());

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const tutorial = document.getElementById('tutorial-modal');
                if (tutorial && !tutorial.classList.contains('hidden')) {
                    this.closeTutorial();
                }
            }
        });
    }

    openTutorial() {
        this.currentStep = 0;
        const backdrop = document.getElementById('modal-backdrop');
        const tutorial = document.getElementById('tutorial-modal');
        
        if (backdrop && tutorial) {
            backdrop.classList.remove('hidden');
            tutorial.classList.remove('hidden');
            this.displayStep();
        }
    }

    closeTutorial() {
        const backdrop = document.getElementById('modal-backdrop');
        const tutorial = document.getElementById('tutorial-modal');
        
        if (backdrop && tutorial) {
            tutorial.classList.add('hidden');
            const openModals = backdrop.querySelectorAll('.modal-window:not(.hidden)').length;
            if (openModals === 0) {
                backdrop.classList.add('hidden');
            }
        }
    }

    nextStep() {
        if (this.currentStep < this.tutorialSteps.length - 1) {
            this.currentStep++;
            this.displayStep();
        } else {
            this.closeTutorial();
        }
    }

    prevStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.displayStep();
        }
    }

    displayStep() {
        const step = this.tutorialSteps[this.currentStep];
        const content = document.getElementById('tutorial-content');
        const progress = document.getElementById('tutorial-progress');
        const prevBtn = document.getElementById('tutorial-prev-btn');
        const nextBtn = document.getElementById('tutorial-next-btn');

        if (content) {
            content.innerHTML = `
                <h4 style="margin-top: 0; color: #ffc107;">${step.title}</h4>
                ${step.content}
            `;
        }

        if (progress) {
            progress.textContent = `${this.currentStep + 1}/${this.tutorialSteps.length}`;
        }

        if (prevBtn) {
            if (this.currentStep === 0) {
                prevBtn.style.display = 'none';
            } else {
                prevBtn.style.display = 'inline-block';
            }
        }

        if (nextBtn) {
            if (this.currentStep === this.tutorialSteps.length - 1) {
                nextBtn.textContent = '닫기 ✕';
            } else {
                nextBtn.textContent = '다음 →';
            }
        }
    }

    checkFirstTime() {
        const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
        if (!hasSeenTutorial) {
            setTimeout(() => {
                window.addEventListener('gameDataLoaded', () => {
                    this.openTutorial();
                    localStorage.setItem('hasSeenTutorial', 'true');
                });
            }, 2000);
        }
    }
}

function initializeTutorial() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.gameTutorial = new GameTutorial();
        });
    } else {
        setTimeout(() => {
            window.gameTutorial = new GameTutorial();
        }, 100);
    }
}