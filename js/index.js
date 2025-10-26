// 📢 [신규] 공지사항 관련 DOM 요소
const noticeBtn = document.getElementById('notice-btn');
const noticeModalBackdrop = document.getElementById('notice-modal-backdrop');
const noticeCloseBtn = document.getElementById('notice-close-btn');

// 📢 [신규] 공지사항 모달 이벤트 리스너
if (noticeBtn) {
    noticeBtn.addEventListener('click', () => {
        noticeModalBackdrop.classList.remove('hidden');
    });
}

if (noticeCloseBtn) {
    noticeCloseBtn.addEventListener('click', () => {
        noticeModalBackdrop.classList.add('hidden');
    });
}

// 모달 배경 클릭 시 닫기
if (noticeModalBackdrop) {
    noticeModalBackdrop.addEventListener('click', (event) => {
        if (event.target === noticeModalBackdrop) {
            noticeModalBackdrop.classList.add('hidden');
        }
    });
}