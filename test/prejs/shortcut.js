window.addEventListener('DOMContentLoaded', function() {
    var editor = getEditor();
    // 초기 상태 저장
    commitState();

    // 일반 타이핑: 2초 간격으로 상태 저장 (debounce & periodic)
    editor.addEventListener('input', function(e) {
      if (!isUndoRedo) {
        if (typingIdleTimer) clearTimeout(typingIdleTimer);
        typingIdleTimer = setTimeout(function() {
          commitState();
          refreshIframe();  // idle 후 새로고침
          if (typingIntervalTimer) {
            clearInterval(typingIntervalTimer);
            typingIntervalTimer = null;
          }
          typingIdleTimer = null;
        }, typingDelay);
        if (!typingIntervalTimer) {
          typingIntervalTimer = setInterval(function() {
            commitState();
          }, typingDelay);
        }
      }
    });

    // 키다운 이벤트: Shift+Enter, Ctrl+Z/Shift+Z, 변환 단축키 처리
    editor.addEventListener("keydown", function(e) {
      // Shift + Enter: "\nsplit\nBB\t" 삽입
      if (e.ctrlKey && e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        var start = editor.selectionStart;
        var end = editor.selectionEnd;
        var currentText = editor.value;
        var insertion = "\nsplit\t\nB\t";
        editor.value = currentText.substring(0, start) + insertion + currentText.substring(end);
        editor.selectionStart = editor.selectionEnd = start + insertion.length;
        commitState();
        refreshIframe();
        return;
      }
      if (e.shiftKey && e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        var start = editor.selectionStart;
        var end = editor.selectionEnd;
        var currentText = editor.value;
        var insertion = "\nsplit\t\nBB\t";
        editor.value = currentText.substring(0, start) + insertion + currentText.substring(end);
        editor.selectionStart = editor.selectionEnd = start + insertion.length;
        commitState();
        refreshIframe();
        return;
      }
      if (e.shiftKey && e.key === "Enter" && !e.ctrlKey) {
        e.preventDefault();
        var start = editor.selectionStart;
        var end = editor.selectionEnd;
        var currentText = editor.value;
        var insertion = "\n";
        editor.value = currentText.substring(0, start) + insertion + currentText.substring(end);
        editor.selectionStart = editor.selectionEnd = start + insertion.length;
        commitState();
        refreshIframe();
        return;
      }
      if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey) {
        e.preventDefault();
        if (enterblock === 'false'){
        var start = editor.selectionStart;
        var end = editor.selectionEnd;
        var currentText = editor.value;
        var insertion = "\nB\t";
        editor.value = currentText.substring(0, start) + insertion + currentText.substring(end);
        editor.selectionStart = editor.selectionEnd = start + insertion.length;
        commitState();
        refreshIframe();
        return;
        }else{

        }
      }
      if (e.key === "Tab") {
        e.preventDefault();
        var start = editor.selectionStart;
        var end = editor.selectionEnd;
        var currentText = editor.value;
        var insertion = "\t";
        editor.value = currentText.substring(0, start) + insertion + currentText.substring(end);
        editor.selectionStart = editor.selectionEnd = start + insertion.length;
        commitState();
        refreshIframe();
        return;
      }
      // Ctrl 단축키 처리
      if (e.ctrlKey) {
        if (e.key.toLowerCase() === "z" && !e.shiftKey) {
          if (typingIdleTimer) {
            clearTimeout(typingIdleTimer);
            typingIdleTimer = null;
            commitState();
          }
          e.preventDefault();
          undo();
          return;
        }
        if (e.key.toLowerCase() === "z" && e.shiftKey) {
          e.preventDefault();
          redo();
          return;
        }
        if (e.code === "KeyQ" && !e.shiftKey) {
          e.preventDefault();
          clearTypingTimers();
          transformFFA();
          return;
        }
        // 먼저 Ctrl+Shift+W를 검사 (e.code 사용)
        if (e.code === "KeyW" && e.shiftKey) {
          e.preventDefault();
          clearTypingTimers();
          transformFA();
          return;
        }
        // 그 후 Ctrl+W를 검사
        if (e.code === "KeyW" && !e.shiftKey) {
          e.preventDefault();
          clearTypingTimers();
          transformA();
          return;
        }
        if (e.code === "KeyE" && !e.shiftKey) {
          e.preventDefault();
          clearTypingTimers();
          transformB();
          return;
        }
        if (e.code === "KeyR" && !e.shiftKey) {
          e.preventDefault();
          clearTypingTimers();
          transformC();
          return;
        }
        if (e.code === "KeyT" && !e.shiftKey) {
          e.preventDefault();
          clearTypingTimers();
          transformAtt();
          return;
        }
        if (e.code === "Digit4" && !e.shiftKey) {
          e.preventDefault();
          clearTypingTimers();
          transformUnder();
          return;
        }
        if (e.code === "Digit5" && !e.shiftKey) {
          e.preventDefault();
          clearTypingTimers();
          transformCircle();
          return;
        }
        if (e.code === "KeyB" && !e.shiftKey) {
          e.preventDefault();
          clearTypingTimers();
          transformBold();
          return;
        }
        if (e.code === "KeyD" && !e.shiftKey) {
          e.preventDefault();
          clearTypingTimers();
          transformCommentbox();
          return;
        }
        if (e.code === "KeyF" && !e.shiftKey) {
            e.preventDefault();
            clearTypingTimers();
            showDraggableSearchToast();
            return;
          }
        if (e.key === "s") {
          e.preventDefault();
          savePreview()
          return;
        }
      }
    });
  });
