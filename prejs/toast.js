function showInputToast(options, callback, cancelCallback) {
    const defaultOptions = {
      type: 'number',
      message: '숫자를 입력하세요:',
      placeholder: '',
      buttonText: '확인',
      cancelButtonText: '취소'
    };
    const opts = Object.assign({}, defaultOptions, options);

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

    // 메시지 표시
    const msgElem = document.createElement('div');
    msgElem.textContent = opts.message;
    toast.appendChild(msgElem);

    // 입력 필드 생성
    const inputElem = document.createElement('input');
    inputElem.type = opts.type;
    inputElem.placeholder = opts.placeholder;
    inputElem.style.marginTop = '10px';
    inputElem.style.fontSize = '16px';
    toast.appendChild(inputElem);

    // 확인 버튼 생성
    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = opts.buttonText;
    confirmBtn.style.marginLeft = '10px';
    confirmBtn.style.fontSize = '16px';
    toast.appendChild(confirmBtn);

    // 취소 버튼 생성
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = opts.cancelButtonText;
    cancelBtn.style.marginLeft = '10px';
    cancelBtn.style.fontSize = '16px';
    toast.appendChild(cancelBtn);

    document.body.appendChild(toast);

    function submit() {
      const value = inputElem.value;
      document.body.removeChild(toast);
      callback(value);
    }
    function cancel() {
      document.body.removeChild(toast);
      if (typeof cancelCallback === 'function') {
        cancelCallback();
      }
    }
    
    confirmBtn.addEventListener('click', submit);
    cancelBtn.addEventListener('click', cancel);
    inputElem.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        submit();
      }
      if (e.key === 'Escape') {
        cancel();
      }
    });
    
    inputElem.focus();
  }

  function showDirectionInputToast(options, callback, cancelCallback) {
    const defaultOptions = {
      message: '방향 선택 및 주석 입력:',
      directionOptions: ["DL", "D", "DR", "UL", "U", "UR"],
      placeholder: '',
      buttonText: '확인',
      cancelButtonText: '취소'
    };
    const opts = Object.assign({}, defaultOptions, options);

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

    // 메시지 표시
    const msgElem = document.createElement('div');
    msgElem.textContent = opts.message;
    toast.appendChild(msgElem);

    // 방향 선택 버튼 그룹 생성
    const dirContainer = document.createElement('div');
    dirContainer.style.marginTop = '10px';
    let selectedDirection = opts.directionOptions[0];
    opts.directionOptions.forEach(function(dir) {
      const btn = document.createElement('button');
      btn.textContent = dir;
      btn.style.marginRight = '5px';
      btn.style.fontSize = '14px';
      btn.style.backgroundColor = (dir === selectedDirection) ? '#0056b3' : '#007BFF';
      btn.style.color = '#fff';
      btn.addEventListener('click', function() {
        Array.from(dirContainer.children).forEach(child => {
          child.style.backgroundColor = '#007BFF';
        });
        selectedDirection = dir;
        btn.style.backgroundColor = '#0056b3';
      });
      dirContainer.appendChild(btn);
    });
    toast.appendChild(dirContainer);

    // 주석 입력 필드 생성
    const inputElem = document.createElement('input');
    inputElem.type = 'text';
    inputElem.placeholder = opts.placeholder;
    inputElem.style.marginTop = '10px';
    inputElem.style.fontSize = '16px';
    inputElem.style.width = '100%';
    toast.appendChild(inputElem);

    // 버튼 컨테이너 생성 (확인 및 취소 버튼)
    const btnContainer = document.createElement('div');
    btnContainer.style.marginTop = '10px';
    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = opts.buttonText;
    confirmBtn.style.marginRight = '10px';
    confirmBtn.style.fontSize = '16px';
    btnContainer.appendChild(confirmBtn);
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = opts.cancelButtonText;
    cancelBtn.style.fontSize = '16px';
    btnContainer.appendChild(cancelBtn);
    toast.appendChild(btnContainer);

    document.body.appendChild(toast);

    function submit() {
      const comment = inputElem.value;
      document.body.removeChild(toast);
      callback({ direction: selectedDirection, comment: comment });
    }
    function cancel() {
      document.body.removeChild(toast);
      if (typeof cancelCallback === 'function') {
        cancelCallback();
      }
    }
    
    confirmBtn.addEventListener('click', submit);
    cancelBtn.addEventListener('click', cancel);
    inputElem.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        submit();
      } else if (e.key === 'Escape') {
        cancel();
      }
    });
    
    inputElem.focus();
  }



  function showToast(message, duration = 2000) {
    // 토스트 메시지용 div 생성
    const toast = document.createElement('div');
    toast.textContent = message;
    // 기본 스타일 설정
    Object.assign(toast.style, {
      position: 'fixed',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      color: '#fff',
      padding: '10px 20px',
      borderRadius: '5px',
      fontSize: '16px',
      zIndex: '10000',
      opacity: '1',
      transition: 'opacity 0.5s ease'
    });
    // 문서에 추가
    document.body.appendChild(toast);
    // duration(기본 2초) 후에 fade-out 처리 후 제거
    setTimeout(() => {
      toast.style.opacity = '0';
      // fade-out transition이 끝난 후 제거 (0.5초 후)
      setTimeout(() => {
        if (toast.parentElement) {
          toast.parentElement.removeChild(toast);
        }
      }, 500);
    }, duration);
  }

  let currentSearchTerm = "";
  let currentSearchIndex = 0;
  let enterblock = 'false';
  
  function showDraggableSearchToast() {
    enterblock = 'true';
    // 토스트 컨테이너 생성 및 기본 스타일 설정
    const toast = document.createElement('div');
    toast.id = 'searchToast';
    Object.assign(toast.style, {
      position: 'fixed',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: '#fff',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '14px',
      zIndex: '10000',
      width: '250px',
      overflow: 'visible'
    });
    
    // 상단 제목바 (드래그 핸들)
    const headerBar = document.createElement('div');
    headerBar.textContent = '검색';
    Object.assign(headerBar.style, {
      backgroundColor: '#444',
      padding: '5px',
      cursor: 'move',
      fontWeight: 'bold',
      textAlign: 'center'
    });
    toast.appendChild(headerBar);
    
    // 검색 입력 필드 (토스트보다 넓게)
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = '검색어 입력';
    Object.assign(input.style, {
      marginTop: '10px',
      width: '180px',
      padding: '5px',
      fontSize: '14px'
    });
    toast.appendChild(input);
    
    // "검색" 버튼 (검색 = 다음 찾기)
    const searchBtn = document.createElement('button');
    searchBtn.textContent = '검색';
    Object.assign(searchBtn.style, {
      marginTop: '10px',
      padding: '5px 10px',
      fontSize: '14px'
    });
    toast.appendChild(searchBtn);
    
    // 토스트를 문서에 추가
    document.body.appendChild(toast);
    
    // 드래그 앤 드롭: 상단 제목바만 드래그하여 이동
    let offsetX = 0, offsetY = 0;
    headerBar.addEventListener('mousedown', function(e) {
      offsetX = e.clientX - toast.getBoundingClientRect().left;
      offsetY = e.clientY - toast.getBoundingClientRect().top;
      function onMouseMove(e) {
        toast.style.left = (e.clientX - offsetX) + 'px';
        toast.style.top = (e.clientY - offsetY) + 'px';
        toast.style.transform = 'none';
      }
      function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      }
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
    
    // textarea 내에서 index 위치까지의 높이를 계산하는 함수
    function getScrollTopForIndex(editor, index) {
      // 임시 div 생성
      const div = document.createElement('div');
      // textarea의 스타일 복사
      const computedStyle = window.getComputedStyle(editor);
      div.style.position = 'absolute';
      div.style.visibility = 'hidden';
      div.style.whiteSpace = computedStyle.whiteSpace; // "normal"일 경우 자동 줄바꿈이 적용됨
      div.style.font = computedStyle.font;
      div.style.width = computedStyle.width;
      div.style.padding = computedStyle.padding;
      div.style.border = computedStyle.border;
      // textarea와 동일하게 줄바꿈이 적용되도록 innerText 사용
      div.innerText = editor.value.substring(0, index);
      document.body.appendChild(div);
      const height = div.scrollHeight;
      document.body.removeChild(div);
      return height;
    }

    function searchText() {
      const term = input.value;
      if (!term) {
        alert("검색어를 입력하세요.");
        return;
      }
      const editor = document.getElementById('editor');
      const text = editor.value;
      // 현재 커서 위치 이후에서 검색
      let pos = editor.selectionEnd;
      let index = text.indexOf(term, pos);
      if (index === -1) {
        // wrap-around: 문서 시작부터 검색
        index = text.indexOf(term, 0);
      }
      if (index === -1) {
        alert("검색어를 찾을 수 없습니다.");
        return;
      }
      // 선택 영역 업데이트
      currentSearchTerm = term;
      currentSearchIndex = index;
      editor.focus();
      editor.setSelectionRange(index, index + term.length);
      
      // 스크롤 조정: 임시 div를 이용해 실제 높이를 계산하여 scrollTop에 적용
      editor.scrollTop = getScrollTopForIndex(editor, index);
    }

    
    // 이벤트 핸들러: 검색 버튼 클릭, Enter 키로 검색, Esc 키로 닫기
    searchBtn.addEventListener('click', searchText);
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        searchText();
      } else if (e.key === 'Escape') {
        if (toast.parentElement) {
          toast.parentElement.removeChild(toast);
          enterblock = 'false';
        }
      }
    });
    
    input.focus();
  }
  

  function showVariableUpdateToast() {
    // 즐겨찾기 프리셋 배열 (원하는 만큼 추가 가능)
    const favoritePresets = [
      {
        label: "중등 클리닉",
        values: {
          R1: "이름",
          R2: "점수",
          logo: "logo.png",
          head1: "1교시는 반드시",
          head2: "외솔교육 국어 시스템",
          sheetTitle: "Level 1-8 : 품사",
          sheetTitle_sub: "[중등 국어] 문법 클리닉 테스트"
        }
      },
      {
        label: "중등 문법",
        values: {
          R1: "이름",
          R2: "학습일",
          logo: "logo3.png",
          head1: "",
          head2: "",
          sheetTitle: "[개념] 단어의 갈래 - 품사",
          sheetTitle_sub: "가장 완벽한 중등 문법"
        }
      },
      {
        label: "EBS",
        values: {
          R1: "이름",
          R2: "학습일",
          logo: "logo3.png",
          head1: "",
          head2: "",
          sheetTitle: "[개념] 단어의 갈래 - 품사",
          sheetTitle_sub: "가장 완벽한 중등 문법"
        }
      }
    ];
  
    // 토스트 컨테이너 생성 (화면 중앙 고정, 드래그 불가)
    const toast = document.createElement('div');
    toast.id = 'variableToast';
    Object.assign(toast.style, {
      position: 'fixed',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: '#fff',
      padding: '20px',
      borderRadius: '5px',
      fontSize: '14px',
      zIndex: '10000',
      width: '420px', // 조금 넓혀서 버튼과 입력창이 겹치지 않도록
      boxSizing: 'border-box'
    });
  
    // 제목 바(드래그 제거, 단순 타이틀용)
    const headerBar = document.createElement('div');
    headerBar.textContent = '프레임';
    Object.assign(headerBar.style, {
      backgroundColor: '#444',
      padding: '5px',
      fontWeight: 'bold',
      textAlign: 'center'
    });
    toast.appendChild(headerBar);
  
    // 입력란들을 담을 폼 컨테이너 (왼쪽 부분)
    const formContainer = document.createElement('div');
    formContainer.style.marginTop = '10px';
    // 즐겨찾기 섹션과의 간격을 위해 우측 마진을 충분히 둠
    formContainer.style.marginRight = '140px';
  
    // 업데이트할 변수 목록과 표시할 라벨
    const fields = [
      { label: "R1", varName: "R1" },
      { label: "R2", varName: "R2" },
      { label: "로고", varName: "logo" },
      { label: "좌측 헤드", varName: "head1" },
      { label: "우측 헤드", varName: "head2" },
      { label: "시트 제목", varName: "sheetTitle" },
      { label: "시트 부제목", varName: "sheetTitle_sub" }
    ];
  
    const inputs = {}; // 각 입력란을 저장
  
    // 각 필드에 대해 입력 컨테이너 생성
    fields.forEach(field => {
      const fieldContainer = document.createElement('div');
      fieldContainer.style.marginBottom = '8px';
      
      const label = document.createElement('label');
      label.textContent = `[${field.label}] `;
      label.style.display = 'inline-block';
      label.style.width = '90px';
      label.style.verticalAlign = 'middle';
      
      const input = document.createElement('input');
      input.type = 'text';
      input.style.width = 'calc(100% - 90px)';
      input.style.padding = '4px';
      input.style.fontSize = '14px';
      // 전역 변수 값이 있으면 채워주기
      input.value = window[field.varName] || "";
      
      fieldContainer.appendChild(label);
      fieldContainer.appendChild(input);
      formContainer.appendChild(fieldContainer);
      
      inputs[field.varName] = input;
    });
    
    toast.appendChild(formContainer);
  
    // 즐겨찾기 섹션: 오른쪽에 세로로 나열
    const favSection = document.createElement('div');
    Object.assign(favSection.style, {
      position: 'absolute',
      right: '10px',
      top: '80px',
      display: 'flex',
      flexDirection: 'column',
      gap: '5px',
      width: '100px'
    });
    
    // "[즐겨찾기]" 라벨
    const favLabel = document.createElement('div');
    favLabel.textContent = '[즐겨찾기]';
    favLabel.style.fontWeight = 'bold';
    favLabel.style.textAlign = 'center';
    favSection.appendChild(favLabel);
  
    // 즐겨찾기 프리셋별 버튼 생성
    favoritePresets.forEach(preset => {
      const favBtn = document.createElement('button');
      favBtn.textContent = preset.label;
      favBtn.style.padding = '5px 10px';
      favBtn.style.fontSize = '14px';
      favBtn.addEventListener('click', function() {
        // preset.values를 순회하며 입력란에 대입
        for (let key in preset.values) {
          if (inputs[key]) {
            inputs[key].value = preset.values[key];
          }
        }
      });
      favSection.appendChild(favBtn);
    });
    toast.appendChild(favSection);
  
    // 버튼 컨테이너 (확인, 취소 버튼은 하단 중앙)
    const btnContainer = document.createElement('div');
    btnContainer.style.textAlign = 'center';
    btnContainer.style.marginTop = '10px';
  
    // 확인 버튼
    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = '확인';
    confirmBtn.style.marginRight = '10px';
    confirmBtn.style.padding = '5px 10px';
    confirmBtn.style.fontSize = '14px';
    btnContainer.appendChild(confirmBtn);
  
    // 취소 버튼
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = '취소';
    cancelBtn.style.padding = '5px 10px';
    cancelBtn.style.fontSize = '14px';
    btnContainer.appendChild(cancelBtn);
  
    toast.appendChild(btnContainer);
    document.body.appendChild(toast);
  
    // (드래그 기능 제거) → headerBar의 이벤트 리스너를 생략했거나, empty
  
    // 확인 버튼 클릭 시: 전역 변수에 업데이트
    confirmBtn.addEventListener('click', function() {
      fields.forEach(field => {
        window[field.varName] = inputs[field.varName].value;
        console.log(`${field.varName} 업데이트:`, window[field.varName]);
      });
      commitState();
      refreshIframe();
      document.body.removeChild(toast);
    });
  
    // 취소 버튼 클릭 시: 토스트 제거
    cancelBtn.addEventListener('click', function() {
      document.body.removeChild(toast);
    });
  
    // Esc 키 → 토스트 닫기
    toast.setAttribute('tabindex', '-1');
    toast.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        document.body.removeChild(toast);
      }
    });
    toast.focus();
  }
  