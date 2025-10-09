// === 기존 DOM 요소 ===
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

// === 새로 추가된 DOM 요소 ===
const registerForm = document.getElementById('register-form');
const regUsernameInput = document.getElementById('reg-username');
const regPasswordInput = document.getElementById('reg-password');
const regNicknameInput = document.getElementById('reg-nickname');
const showRegisterLink = document.getElementById('show-register-form');
const showLoginLink = document.getElementById('show-login-form');

// === Webhook URL ===
const LOGIN_WEBHOOK_URL = 'https://hook.us2.make.com/ki8p2y3cea2s6r89vzxwz6rfqng9hy1r';
const REGISTER_WEBHOOK_URL = 'https://hook.us2.make.com/278wi7mesg2tn41dgvxgmi2g23h1htjq';


showRegisterLink.addEventListener('click', (event) => {
    event.preventDefault();
    loginForm.style.display = 'none';      // 로그인 폼을 숨김
    registerForm.style.display = 'flex';     // 회원가입 폼을 표시
});

showLoginLink.addEventListener('click', (event) => {
    event.preventDefault();
    registerForm.style.display = 'none';   // 회원가입 폼을 숨김
    loginForm.style.display = 'flex';      // 로그인 폼을 표시
});


// === 기존 로그인 폼 이벤트 리스너 ===
loginForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    const username = usernameInput.value;
    const password = passwordInput.value;

    if (username === "" || password === "") {
        alert("아이디와 비밀번호를 모두 입력해주세요.");
        return;
    }

    const loginData = { id: username, password: password };

    try {
        const response = await fetch(LOGIN_WEBHOOK_URL, { // 변수명 변경
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData),
        });
        
        if (!response.ok) {
            throw new Error('서버에서 응답을 받지 못했습니다.');
        }

        const result = await response.json();
        
        if (result.userData) {
            const processedData = parseUserDataString(result.userData);
            processedData.id = username; 
            
            localStorage.setItem('userData', JSON.stringify(processedData));
            
            // 모든 게임 DB를 삭제하여 main.js에서 새로 불러오도록 함
            localStorage.removeItem('cardDB');
            localStorage.removeItem('skillDB');
            localStorage.removeItem('itemDB');
            localStorage.removeItem('monsterDB');
            localStorage.removeItem('dungeonDB');
            localStorage.removeItem('questionDB');
            localStorage.removeItem('cardPackDB'); // 카드팩 DB도 삭제

            alert(`'${processedData.nickname}'님, 환영합니다! 게임을 시작합니다.`);
            window.location.href = 'main.html';
        } else {
            alert(result.message || "로그인에 실패했습니다. 아이디 또는 비밀번호를 확인해주세요.");
        }

    } catch (error) {
        console.error('로그인 요청 중 오류 발생:', error);
        alert('로그인 서버에 문제가 발생했습니다.');
    }
});


// === 회원가입 폼 이벤트 리스너 (추가) ===
registerForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    const username = regUsernameInput.value;
    const password = regPasswordInput.value;
    const nickname = regNicknameInput.value;

    if (username === "" || password === "" || nickname === "") {
        alert("모든 항목을 입력해주세요.");
        return;
    }

    const registerData = {
        id: username,
        password: password,
        nickname: nickname
    };

    try {
        const response = await fetch(REGISTER_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registerData)
        });

        if (!response.ok) {
            throw new Error('회원가입 서버 응답 오류');
        }

        const result = await response.json();

        if (result.success) {
            alert("회원가입이 완료되었습니다! 이제 로그인해주세요.");
            // 폼 초기화 및 로그인 폼으로 전환
            registerForm.reset();
            registerForm.style.display = 'none';
            loginForm.style.display = 'flex';
        } else {
            alert(result.message || "회원가입에 실패했습니다.");
        }
    } catch (error) {
        console.error("회원가입 요청 중 오류 발생:", error);
        alert("회원가입 처리 중 문제가 발생했습니다.");
    }
});