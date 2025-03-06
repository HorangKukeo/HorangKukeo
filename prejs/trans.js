function transformA() {
    clearTypingTimers();
    var editor = getEditor();
    var start = editor.selectionStart;
    var end = editor.selectionEnd;
    var selectedText = editor.value.substring(start, end);
    
    if (selectedText.length === 0) {
      alert("먼저 텍스트를 선택하세요.");
      return;
    }
    
    // 정규표현식: *a*{초성_내용} 패턴을 찾습니다.
    const revertRegex = /\*a\*\{[^_]+_(.*?)\}/g;
    
    if (revertRegex.test(selectedText)) {
      // 선택된 텍스트에 해당 패턴이 있으면, 모두 '내용'으로 대체합니다.
      var revertedText = selectedText.replace(revertRegex, '$1');
      var before = editor.value.substring(0, start);
      var after = editor.value.substring(end);
      editor.value = before + revertedText + after;
      editor.selectionStart = start;
      editor.selectionEnd = start + revertedText.length;
      commitState();
      refreshIframe();
      return;
    }
    
    // 만약 패턴이 없다면, 기존 로직대로 변환 수행:
    var initials = selectedText.split('').map(function(ch) {
      return getInitialConsonant(ch);
    }).join('');
    var transformedText = `*a*{${initials}_${selectedText}}`;
    var before = editor.value.substring(0, start);
    var after = editor.value.substring(end);
    editor.value = before + transformedText + after;
    editor.selectionStart = start;
    editor.selectionEnd = start + transformedText.length;
    commitState();
    refreshIframe();
  }

  function transformFA() {
    clearTypingTimers();
    var editor = getEditor();
    var start = editor.selectionStart;
    var end = editor.selectionEnd;
    var selectedText = editor.value.substring(start, end);
    
    if (selectedText.length === 0) {
      showToast("먼저 텍스트를 선택하세요.");
      return;
    }
    
    // 정규표현식: *fa*{초성_내용@숫자} 패턴을 찾습니다.
    const revertRegex = /\*fa\*\{[^_]+_(.*?)@[0-9]+\}/g;
    
    if (revertRegex.test(selectedText)) {
      // 선택된 텍스트에 해당 패턴이 있으면 '내용'만 남기는 형태로 복원
      var revertedText = selectedText.replace(revertRegex, '$1');
      var before = editor.value.substring(0, start);
      var after = editor.value.substring(end);
      editor.value = before + revertedText + after;
      editor.selectionStart = start;
      editor.selectionEnd = start + revertedText.length;
      commitState();
      refreshIframe();
      return;
    }
    
    // 범용 입력 토스트를 통해 숫자를 입력받고, 확인되면 변환 실행
    showInputToast(
      {
        type: 'number',
        message: '숫자를 입력하세요:',
        placeholder: '예: 5',
        buttonText: '확인',
        cancelButtonText: '취소'
      },
      function(num) {
        var initials = selectedText.split('').map(function(ch) {
          return getInitialConsonant(ch);
        }).join('');
        var transformedText = `*fa*{${initials}_${selectedText}@${num}}`;
        var before = editor.value.substring(0, start);
        var after = editor.value.substring(end);
        editor.value = before + transformedText + after;
        editor.selectionStart = start;
        editor.selectionEnd = start + transformedText.length;
        commitState();
        refreshIframe();
      },
      function() {
        showToast("입력이 취소되었습니다.", 1500);
      }
    );
  }

  function transformFFA() {
    clearTypingTimers();
    var editor = getEditor();
    var start = editor.selectionStart;
    var end = editor.selectionEnd;
    var selectedText = editor.value.substring(start, end);
    
    if (selectedText.length === 0) {
      showToast("먼저 텍스트를 선택하세요.");
      return;
    }
    
    // 이미 *fa*{텍스트_@5} 형태라면, 내부 텍스트만 복원하는 취소 기능
    // 정확히 "*fa*{..._@5}"로 되어 있어야 취소합니다.
    const revertRegex = /^\*fa\*\{(.*?)_@5\}$/;
    if (revertRegex.test(selectedText)) {
      var revertedText = selectedText.replace(revertRegex, '$1');
      var before = editor.value.substring(0, start);
      var after = editor.value.substring(end);
      editor.value = before + revertedText + after;
      editor.selectionStart = start;
      editor.selectionEnd = start + revertedText.length;
      commitState();
      refreshIframe();
      return;
    }
    
    // 변환: 선택된 텍스트를 *fa*{선택된 텍스트_@5} 형태로 감쌉니다.
    var transformedText = `*fa*{${selectedText}_@5}`;
    var before = editor.value.substring(0, start);
    var after = editor.value.substring(end);
    editor.value = before + transformedText + after;
    editor.selectionStart = start;
    editor.selectionEnd = start + transformedText.length;
    commitState();
    refreshIframe();
  }


  function transformB() {
    clearTypingTimers();
    var editor = getEditor();
    var start = editor.selectionStart;
    var end = editor.selectionEnd;
    var selectedText = editor.value.substring(start, end);
    
    if (selectedText.length === 0) {
      alert("먼저 텍스트를 선택하세요.");
      return;
    }
    
    // 취소 기능:
    // 정규표현식 설명:
    // \*b\*\{             => "*b*{"로 시작
    // (?:[^@]+@)*         => 0개 이상의 "non-@" 문자와 "@"가 반복됨 (예: "국민단체@")
    // ([^@]+)             => _ 앞의 토큰을 캡처 (예: "지방 자치 단체")
    // _\}                 => "_"와 "}"가 나옴
    // ([^\s]*)           => "}" 바로 뒤에 공백이 아닌 추가 텍스트가 있으면 캡처 (예: "는")
    const revertRegex = /\*b\*\{(?:[^@]+@)*([^@]+)_\}([^\s]*)/g;
    
    if (revertRegex.test(selectedText)) {
      // 선택 영역 내의 모든 *b* 패턴을 찾아서 캡처된 그룹을 결합하여 취소 처리
      var revertedText = selectedText.replace(revertRegex, function(match, p1, p2) {
        return p1 + p2;
      });
      var before = editor.value.substring(0, start);
      var after = editor.value.substring(end);
      editor.value = before + revertedText + after;
      editor.selectionStart = start;
      editor.selectionEnd = start + revertedText.length;
      commitState();
      refreshIframe();
      return;
    }
    
    // 취소 기능에 해당하지 않으면 기존 로직대로 랜덤 변환 수행
    var option = Math.random() < 0.5;
    var transformedText = option ? `*b*{${selectedText}_@}` : `*b*{@${selectedText}_}`;
    var before = editor.value.substring(0, start);
    var after = editor.value.substring(end);
    editor.value = before + transformedText + after;
    editor.selectionStart = start;
    editor.selectionEnd = start + transformedText.length;
    commitState();
    refreshIframe();
  }


  function transformC() {
    clearTypingTimers();
    var editor = getEditor();
    var start = editor.selectionStart;
    var end = editor.selectionEnd;
    var selectedText = editor.value.substring(start, end);

    if (selectedText.length === 0) {
      alert("먼저 텍스트를 선택하세요.");
      return;
    }
    
    // 취소 기능: 선택 영역 내의 모든 *c*{...} 패턴을 찾아 내부 내용을 반환하도록 함.
    const revertRegexGlobal = /\*c\*\{(.*?)\}/g;
    if (revertRegexGlobal.test(selectedText)) {
      var revertedText = selectedText.replace(revertRegexGlobal, '$1');
      var before = editor.value.substring(0, start);
      var after = editor.value.substring(end);
      editor.value = before + revertedText + after;
      editor.selectionStart = start;
      editor.selectionEnd = start + revertedText.length;
      commitState();
      refreshIframe();
      return;
    }
    
    // 변환 기능: 선택 영역에 *c* 패턴이 없으면, 기존 로직대로 변환하여 *c*{selectedText}로 감쌈.
    var transformedText = `*c*{${selectedText}}`;
    var before = editor.value.substring(0, start);
    var after = editor.value.substring(end);
    editor.value = before + transformedText + after;
    editor.selectionStart = start;
    editor.selectionEnd = start + transformedText.length;
    commitState();
    refreshIframe();
  }

  function transformUnder() {
    clearTypingTimers();
    var editor = getEditor();
    var start = editor.selectionStart;
    var end = editor.selectionEnd;
    var selectedText = editor.value.substring(start, end);

    if (selectedText.length === 0) {
      alert("먼저 텍스트를 선택하세요.");
      return;
    }

    // 이미 "{_ ... _}" 패턴인 경우, 내부 텍스트만 추출하여 복원합니다.
    const revertRegex = /^\{\_(.*)\_\}$/;
    if (revertRegex.test(selectedText)) {
      var revertedText = selectedText.replace(revertRegex, '$1');
      var before = editor.value.substring(0, start);
      var after = editor.value.substring(end);
      editor.value = before + revertedText + after;
      editor.selectionStart = start;
      editor.selectionEnd = start + revertedText.length;
      commitState();
      refreshIframe();
      return;
    }

    // 아직 변환되지 않은 경우, 선택된 텍스트를 "{_ ... _}" 형태로 변환합니다.
    var transformedText = `{_${selectedText}_}`;
    var before = editor.value.substring(0, start);
    var after = editor.value.substring(end);
    editor.value = before + transformedText + after;
    editor.selectionStart = start;
    editor.selectionEnd = start + transformedText.length;
    commitState();
    refreshIframe();
  }

  function transformCircle() {
    clearTypingTimers();
    var editor = getEditor();
    var start = editor.selectionStart;
    var end = editor.selectionEnd;
    var selectedText = editor.value.substring(start, end);

    if (selectedText.length === 0) {
      alert("먼저 텍스트를 선택하세요.");
      return;
    }

    // 이미 "{_ ... _}" 패턴인 경우, 내부 텍스트만 추출하여 복원합니다.
    const revertRegex = /^\{\[(.*)\]\}$/;
    if (revertRegex.test(selectedText)) {
      var revertedText = selectedText.replace(revertRegex, '$1');
      var before = editor.value.substring(0, start);
      var after = editor.value.substring(end);
      editor.value = before + revertedText + after;
      editor.selectionStart = start;
      editor.selectionEnd = start + revertedText.length;
      commitState();
      refreshIframe();
      return;
    }

    // 아직 변환되지 않은 경우, 선택된 텍스트를 "{_ ... _}" 형태로 변환합니다.
    var transformedText = `{[${selectedText}]}`;
    var before = editor.value.substring(0, start);
    var after = editor.value.substring(end);
    editor.value = before + transformedText + after;
    editor.selectionStart = start;
    editor.selectionEnd = start + transformedText.length;
    commitState();
    refreshIframe();
  }

  function transformBold() {
    clearTypingTimers();
    var editor = getEditor();
    var start = editor.selectionStart;
    var end = editor.selectionEnd;
    var selectedText = editor.value.substring(start, end);
    
    if (selectedText.length === 0) {
      alert("먼저 텍스트를 선택하세요.");
      return;
    }
    
    // 취소 기능: 선택 영역 내에 있는 모든 {{...}} 패턴을 plain text로 변환
    // 예: "{{안녕}}" → "안녕"
    const revertRegex = /\{\{(.*?)\}\}/g;
    if (revertRegex.test(selectedText)) {
      var revertedText = selectedText.replace(revertRegex, '$1');
      var before = editor.value.substring(0, start);
      var after = editor.value.substring(end);
      editor.value = before + revertedText + after;
      editor.selectionStart = start;
      editor.selectionEnd = start + revertedText.length;
      commitState();
      refreshIframe();
      return;
    }
    
    // 변환 기능: 선택된 텍스트를 {{선택된 텍스트}} 형태로 감쌉니다.
    var transformedText = `{{${selectedText}}}`;
    var before = editor.value.substring(0, start);
    var after = editor.value.substring(end);
    editor.value = before + transformedText + after;
    editor.selectionStart = start;
    editor.selectionEnd = start + transformedText.length;
    commitState();
    refreshIframe();
  }

  function transformCommentbox() {
    clearTypingTimers();
    var editor = getEditor();
    var start = editor.selectionStart;
    var end = editor.selectionEnd;
    var selectedText = editor.value.substring(start, end);
  
    if (selectedText.length === 0) {
      alert("먼저 텍스트를 선택하세요.");
      return;
    }
  
    // 이미 "{%} ... {%}" 패턴인 경우, 내부 텍스트만 복원하는 취소 기능
    const revertRegex = /^\{\%(.*)\%\}$/;
    if (revertRegex.test(selectedText)) {
      var revertedText = selectedText.replace(revertRegex, '$1');
      var before = editor.value.substring(0, start);
      var after = editor.value.substring(end);
      editor.value = before + revertedText + after;
      editor.selectionStart = start;
      editor.selectionEnd = start + revertedText.length;
      commitState();
      refreshIframe();
      return;
    }
  
    // 아직 변환되지 않은 경우, 선택된 텍스트를 "{%} ... {%}" 형태로 변환합니다.
    var transformedText = `{%}${selectedText}{%}`;
    var before = editor.value.substring(0, start);
    var after = editor.value.substring(end);
    editor.value = before + transformedText + after;
    editor.selectionStart = start;
    editor.selectionEnd = start + transformedText.length;
    commitState();
    refreshIframe();
  }
  

  function transformAtt() {
    clearTypingTimers();
    var editor = getEditor();
    var start = editor.selectionStart;
    var end = editor.selectionEnd;
    var selectedText = editor.value.substring(start, end);
    
    if (selectedText.length === 0) {
      showToast("먼저 텍스트를 선택하세요.");
      return;
    }
    
    // 취소 기능: 선택 영역 내에 이미 \{방향}\{텍스트}@{주석}\ 형태가 있다면 plain text(텍스트 부분)로 복원
    // 정규표현식 설명:
    //   ^\\(DL|D|DR|UL|U|UR)\\  => 맨 처음 \와 방향 (DL, D, DR, UL, U, UR) 그리고 다시 \가 나옴
    //   (.*?)                  => 내부 텍스트(텍스트 부분)를 비탐욕적으로 캡처
    //   @(.*?)\\              => @ 뒤에 주석이 나오고 마지막 \로 끝남
    const revertRegex = /^\\(DL|D|DR|UL|U|UR)\\(.*?);(.*?)\\$/;
    if (revertRegex.test(selectedText)) {
      var revertedText = selectedText.replace(revertRegex, '$2');
      var before = editor.value.substring(0, start);
      var after = editor.value.substring(end);
      editor.value = before + revertedText + after;
      editor.selectionStart = start;
      editor.selectionEnd = start + revertedText.length;
      commitState();
      refreshIframe();
      return;
    }
    
    // 범용 방향 입력 토스트를 통해 방향 선택 및 주석 입력을 받음
    showDirectionInputToast(
      {
        message: '방향 선택 및 주석 입력:',
        directionOptions: ["DL", "D", "DR", "UL", "U", "UR"],
        placeholder: '주석 입력',
        buttonText: '확인',
        cancelButtonText: '취소'
      },
      function(result) {
        var direction = result.direction;
        var comment = result.comment;
        // 최종 형식: \{방향}\{선택된 텍스트}@{입력된 주석}\
        var transformedText = `\\${direction}\\${selectedText};${comment}\\`;
        var before = editor.value.substring(0, start);
        var after = editor.value.substring(end);
        editor.value = before + transformedText + after;
        editor.selectionStart = start;
        editor.selectionEnd = start + transformedText.length;
        commitState();
        refreshIframe();
      },
      function() {
        showToast("입력이 취소되었습니다.", 1500);
      }
    );
  }

