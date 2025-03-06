 // 알파벳 변환: 대문자/소문자 구분하여 원형 문자로 변환
 function getCircledAlphabet(char) {
    if (char >= 'A' && char <= 'Z') {
      const index = char.charCodeAt(0) - 'A'.charCodeAt(0);
      return String.fromCharCode(0x24B6 + index); // Ⓐ부터
    } else if (char >= 'a' && char <= 'z') {
      const index = char.charCodeAt(0) - 'a'.charCodeAt(0);
      return String.fromCharCode(0x24D0 + index); // ⓐ부터
    }
    return char;
  }

  // 한글 자음 매핑 (ㄱ ~ ㅎ)
  const hangulMapping = {
    "ㄱ": "㉠",
    "ㄴ": "㉡",
    "ㄷ": "㉢",
    "ㄹ": "㉣",
    "ㅁ": "㉤",
    "ㅂ": "㉥",
    "ㅅ": "㉦",
    "ㅇ": "㉧",
    "ㅈ": "㉨",
    "ㅊ": "㉩",
    "ㅋ": "㉪",
    "ㅌ": "㉫",
    "ㅍ": "㉬",
    "ㅎ": "㉭"
  };

  // 기본 한글 음절 매핑 (가, 나, 다, …)
  const baseSyllableMapping = {
    "가": "㉮",
    "나": "㉯",
    "다": "㉰",
    "라": "㉱",
    "마": "㉲",
    "바": "㉳",
    "사": "㉴",
    "아": "㉵",
    "자": "㉶",
    "차": "㉷",
    "카": "㉸",
    "타": "㉹",
    "파": "㉺",
    "하": "㉻"
  };

  // 단일 숫자 매핑
  const digitMapping = {
    "0": "⓪",
    "1": "①",
    "2": "②",
    "3": "③",
    "4": "④",
    "5": "⑤",
    "6": "⑥",
    "7": "⑦",
    "8": "⑧",
    "9": "⑨"
  };

  // 연속 숫자 처리: 만약 1~20 범위이면 하나의 원형 숫자로, 그렇지 않으면 각 자리 변환
  function convertDigits(digits) {
    let num = parseInt(digits, 10);
    if (digits === "0") {
      return "⓪";
    }
    if (!isNaN(num) && digits[0] !== "0" && num >= 1 && num <= 20) {
      return String.fromCharCode(0x2460 + (num - 1));
    } else {
      let res = "";
      for (let i = 0; i < digits.length; i++) {
        res += digitMapping[digits[i]] || digits[i];
      }
      return res;
    }
  }

  // 입력된 문자열을 변환: 숫자, 알파벳, 한글 매핑 적용
  function convertToOriginalText(text) {
    let result = "";
    let digitBuffer = "";
    for (let i = 0; i < text.length; i++) {
      let ch = text[i];
      if (/\d/.test(ch)) {
        digitBuffer += ch;
      } else {
        if (digitBuffer.length > 0) {
          result += convertDigits(digitBuffer);
          digitBuffer = "";
        }
        if (/[a-zA-Z]/.test(ch)) {
          result += getCircledAlphabet(ch);
        } else if (baseSyllableMapping.hasOwnProperty(ch)) {
          result += baseSyllableMapping[ch];
        } else if (hangulMapping.hasOwnProperty(ch)) {
          result += hangulMapping[ch];
        } else {
          result += ch;
        }
      }
    }
    if (digitBuffer.length > 0) {
      result += convertDigits(digitBuffer);
    }
    return result;
  }

  // 동적으로 원문자 입력용 toast 생성 함수
  function showOriginalTextToast(callback, cancelCallback) {
    const defaultOptions = {
      message: '문자를 입력하고 Enter를 누르세요',
      placeholder: '원문자 입력'
    };
    const opts = Object.assign({}, defaultOptions);

    const toast = document.createElement('div');
    Object.assign(toast.style, {
      position: 'fixed',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: '#fff',
      padding: '20px',
      borderRadius: '5px',
      fontSize: '16px',
      zIndex: '10000'
    });

    const msgElem = document.createElement('div');
    msgElem.textContent = opts.message;
    toast.appendChild(msgElem);

    const inputElem = document.createElement('input');
    inputElem.type = 'text';
    inputElem.placeholder = opts.placeholder;
    inputElem.style.marginTop = '10px';
    inputElem.style.fontSize = '16px';
    inputElem.style.width = '100%';
    toast.appendChild(inputElem);

    document.body.appendChild(toast);

    function submit() {
      const value = inputElem.value;
      document.body.removeChild(toast);
      if (callback) callback(value);
    }
    function cancel() {
      document.body.removeChild(toast);
      if (typeof cancelCallback === 'function') {
        cancelCallback();
      }
    }
    
    inputElem.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        submit();
      } else if (e.key === 'Escape') {
        cancel();
      }
    });
    
    inputElem.focus();
  }