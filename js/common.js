function parseDB(rawData, headers) {
    if (!rawData) return [];
    try {
        return rawData.map(s => JSON.parse(s)).map(rawObj => {
            const newObj = {};
            headers.forEach((header, index) => { newObj[header] = rawObj[index]; });
            return newObj;
        });
    } catch (error) {
        console.error("DB 파싱 중 오류 발생:", error, rawData);
        return [];
    }
}

function parseUserDataString(dataString) {
    try {
        const parts = dataString.split('⊥');
        const userData = {
            nickname: parts[2],
            baseHp: parseInt(parts[3], 10),
            baseMp: parseInt(parts[4], 10),
            baseAttack: parseInt(parts[5], 10),
            gold: parseInt(parts[6], 10),
            points: {
                partsOfSpeech: parseInt(parts[7], 10),
                sentenceComponents: 0
            },
            ownedCards: parts[8] ? parts[8].split(',').filter(id => id) : [],
            equippedCards: parts[9] ? parts[9].split(',').filter(id => id) : [],
            inventory: parts[10] ? JSON.parse(parts[10]) : {}
        };
        return userData;
    } catch (error) {
        console.error("사용자 데이터 문자열 파싱 중 오류 발생:", error, dataString);
        return null;
    }
}

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

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

async function uploadUserData(userId) {
    const UPLOAD_WEBHOOK_URL = 'https://hook.us2.make.com/dfvk2fvrbfu1palmn3cf2sc1y8mrpkeb';
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData) {
        console.error("업로드할 사용자 데이터가 없습니다.");
        return;
    }
    const dataToSend = {
        id: userId,
        nickname: userData.nickname,
        baseHp: userData.baseHp,
        baseMp: userData.baseMp,
        baseAttack: userData.baseAttack,
        gold: userData.gold,
        points_partsOfSpeech: userData.points.partsOfSpeech,
        ownedCards: userData.ownedCards.join(','),
        equippedCards: userData.equippedCards.join(','),
        inventory: JSON.stringify(userData.inventory)
    };
    try {
        const response = await fetch(UPLOAD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataToSend)
        });
        if (response.ok) {
            console.log("사용자 데이터가 성공적으로 서버에 저장되었습니다.");
        } else {
            console.error("서버에 데이터를 저장하는 데 실패했습니다:", response.status);
        }
    } catch (error) {
        console.error("데이터 업로드 중 오류 발생:", error);
    }
}