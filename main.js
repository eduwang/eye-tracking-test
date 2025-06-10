// main.js

// DOM 요소 가져오기
const plottingCanvas = document.getElementById('plotting_canvas');
const statusElement = document.getElementById('status');
const gazeXElement = document.getElementById('gaze-x');
const gazeYElement = document.getElementById('gaze-y');
const calibrateButton = document.getElementById('calibrateButton');
const resetButton = document.getElementById('resetButton');

let webgazerInstance = null; // webgazer 인스턴스를 저장할 변수

// HTML 문서와 모든 자원이 로드된 후 WebGazer.js 초기화
window.onload = async () => {
    statusElement.textContent = 'WebGazer.js 초기화 중...';

    // window.webgazer 객체가 존재하는지 확인
    if (!window.webgazer) {
        statusElement.textContent = 'WebGazer.js 라이브러리 로드 실패. CDN 링크를 확인하세요.';
        console.error('WebGazer.js is not loaded. Check the CDN script tag in index.html and browser console.');
        return;
    }

    webgazerInstance = window.webgazer;


    // WebGazer.js 설정
    webgazerInstance.setRegression('ridge') // 기본 회귀 유형
        .setGazeListener((data, elapsedTime) => {
            // 데이터가 null이면 눈을 찾지 못한 상태
            if (data == null) {
                statusElement.textContent = '눈을 찾을 수 없음... (조명, 자세, 안경 확인)';
                gazeXElement.textContent = 'N/A';
                gazeYElement.textContent = 'N/A';
                return;
            }

            // data.x와 data.y는 화면 좌표계 (픽셀)를 나타냅니다.
            const gazeX = data.x;
            const gazeY = data.y;

            gazeXElement.textContent = gazeX.toFixed(2);
            gazeYElement.textContent = gazeY.toFixed(2);

            // 캔버스에 시선 위치 그리기
            const ctx = plottingCanvas.getContext('2d');
            ctx.clearRect(0, 0, plottingCanvas.width, plottingCanvas.height); // 이전 위치 지우기

            ctx.beginPath();
            ctx.arc(gazeX, gazeY, 20, 0, 2 * Math.PI); // 시선 위치에 원 그리기
            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'; // 빨간색 반투명 원
            ctx.fill();

            statusElement.textContent = '눈 추적 중...';
        });

    try {
        // WebGazer.js 시작
        await webgazerInstance.begin();

        // WebGazer.js 시작 후 추가 설정
        webgazerInstance.showVideo(true);         // 웹캠 비디오 피드 숨기기
        webgazerInstance.showPredictionPoints(false); // WebGazer.js 자체 예측 점 숨기기
        webgazerInstance.showFaceOverlay(false);   // 얼굴 오버레이 숨기기
        webgazerInstance.showFaceFeedbackBox(false); // 얼굴 피드백 박스 숨기기
        webgazerInstance.applyKalmanFilter(true); // 칼만 필터 적용하여 예측을 부드럽게

        statusElement.textContent = 'WebGazer.js 시작됨. 캘리브레이션 필요.';

       const videoElement = document.getElementById('webgazerVideoFeed');
        const videoContainer = document.querySelector('.video-container');

        if (videoElement && videoContainer) {
            // canvas 아래로 이동
            videoContainer.insertBefore(videoElement, plottingCanvas);

            // WebGazer가 지정한 인라인 스타일 제거
            videoElement.removeAttribute('style');
            videoElement.removeAttribute('width');
            videoElement.removeAttribute('height');

            // CSS에서 제어할 수 있도록 스타일 다시 설정
            videoElement.style.position = 'absolute';
            videoElement.style.top = '0';
            videoElement.style.left = '0';
            videoElement.style.right = '0';
            videoElement.style.bottom = '0';
            videoElement.style.width = '100%';
            videoElement.style.height = '100%';
            videoElement.style.objectFit = 'cover';
            videoElement.style.opacity = '0.7';
            videoElement.style.zIndex = '1';
            videoElement.style.transform = 'scale(-1, 1)'; // 좌우반전 유지
        }


    } catch (error) {
        console.error('WebGazer.js 시작 중 오류 발생:', error);
        statusElement.textContent = `WebGazer.js 시작 실패: ${error.message}. 웹캠 권한을 확인하세요.`;
        alert(`웹캠에 접근할 수 없습니다. 권한을 허용해주세요. 오류: ${error.message}`);
    }
};

// 캘리브레이션 버튼 이벤트 리스너
calibrateButton.addEventListener('click', () => {
    if (webgazerInstance) {
        alert('시선 추적 정확도를 위해 화면의 여러 지점을 마우스로 클릭하세요. (최소 9회)');
        statusElement.textContent = '캘리브레이션 중... 화면을 클릭하세요.';
        // WebGazer.js는 클릭 이벤트를 자동으로 감지하여 캘리브레이션에 사용합니다.
        // 추가적인 캘리브레이션 모드 시작 코드가 필요하지는 않습니다.
    } else {
        alert('WebGazer.js가 아직 초기화되지 않았습니다.');
    }
});

// 리셋 버튼 이벤트 리스너
resetButton.addEventListener('click', () => {
    if (webgazerInstance) {
        webgazerInstance.clearData(); // 학습된 캘리브레이션 데이터 지우기
        webgazerInstance.end(); // WebGazer.js 중지
        
        statusElement.textContent = 'WebGazer.js 데이터 초기화됨. 페이지를 새로고침하여 다시 시작하세요.';
        gazeXElement.textContent = 'N/A';
        gazeYElement.textContent = 'N/A';

        // 캔버스 초기화
        const ctx = plottingCanvas.getContext('2d');
        ctx.clearRect(0, 0, plottingCanvas.width, plottingCanvas.height);
        
        alert('캘리브레이션 데이터가 초기화되었습니다. 페이지를 새로고침하여 WebGazer.js를 다시 시작하세요.');
        // 일반적으로 데이터를 지운 후에는 다시 begin()을 호출해야 하므로, 새로고침이 가장 안전합니다.
        location.reload(); 
    }
});