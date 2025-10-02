const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

const MAKE_WEBHOOK_URL = 'https://hook.us2.make.com/ki8p2y3cea2s6r89vzxwz6rfqng9hy1r';

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
        const response = await fetch(MAKE_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData),
        });
        console.log(response);
        if (!response.ok) {
            throw new Error('서버에서 응답을 받지 못했습니다.');
        }

        const result = await response.json();
        
        if (result.userData) {
            const processedData = parseUserDataString(result.userData);
            processedData.id = username; 
            
            localStorage.setItem('userData', JSON.stringify(processedData));
            
            localStorage.removeItem('cardDB');
            localStorage.removeItem('skillDB');
            localStorage.removeItem('itemDB');
            localStorage.removeItem('monsterDB');
            localStorage.removeItem('dungeonDB');
            localStorage.removeItem('questionDB');

            alert(`'${processedData.nickname}'님, 환영합니다! 게임을 시작합니다.`);
            window.location.href = 'main.html';
        } else {
            alert(result.message || "로그인에 실패했습니다. 아이디 또는 비밀번호를 확인해주세요.");
            return;
        }

    } catch (error) {
        console.error('로그인 요청 중 오류 발생:', error);
        alert('로그인 서버에 문제가 발생했습니다.');
    }
});