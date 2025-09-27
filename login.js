const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

// 🚨 여기에 Make.com에서 복사한 Webhook URL을 붙여넣으세요!
const MAKE_WEBHOOK_URL = 'https://hook.us2.make.com/ki8p2y3cea2s6r89vzxwz6rfqng9hy1r';

loginForm.addEventListener('submit', async function(event) {
    // 폼의 기본 제출 동작(새로고침)을 막음
    event.preventDefault();

    const username = usernameInput.value;
    const password = passwordInput.value;

    if (username === "" || password === "") {
        alert("아이디와 비밀번호를 모두 입력해주세요.");
        return;
    }

    // 서버로 보낼 데이터 객체
    const loginData = {
        id: username, // Make.com에서 받을 때 'id'로 설정했으므로 이름을 맞춰줍니다.
        password: password
    };

    try {
        // Make.com Webhook으로 데이터 전송 (POST 방식)
        const response = await fetch(MAKE_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData),
        });

        // Make.com이 Webhook Response로 보내준 결과(JSON)를 받음
        const result = await response.json();

        // 결과에 따라 처리
        if (result.status === 'success') {
            alert(`'${username}'님, 환영합니다! 게임을 시작합니다.`);
            window.location.href = 'game.html'; // 게임 페이지로 이동
        } else {
            // Make.com에서 설정한 실패 메시지를 그대로 사용
            alert(result.message);
        }

    } catch (error) {
        console.error('로그인 요청 중 오류 발생:', error);
        alert('로그인 서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
});