async function startVideo() {
    const video = document.getElementById('videoInput');
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    video.srcObject = stream;
}

async function loadModels() {
    await faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js/weights');
    await faceapi.nets.faceLandmark68Net.loadFromUri('https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js/weights');
    await faceapi.nets.faceRecognitionNet.loadFromUri('https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js/weights');
}

async function detectFaces() {
    const video = document.getElementById('videoInput');
    const canvas = document.getElementById('overlay');
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    video.addEventListener('play', async () => {
        const glassesImg = new Image();
        glassesImg.src = 'https://example.com/path/to/your/glasses.png'; // URL to your glasses image

        setInterval(async () => {
            const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            resizedDetections.forEach(detection => {
                const landmarks = detection.landmarks;
                const nose = landmarks.getNose();
                const leftEye = landmarks.getLeftEye();
                const rightEye = landmarks.getRightEye();

                const glassesWidth = rightEye[3].x - leftEye[0].x + 20;
                const glassesHeight = glassesWidth * glassesImg.height / glassesImg.width;
                const glassesX = leftEye[0].x - 10;
                const glassesY = nose[0].y - glassesHeight / 2;

                canvas.getContext('2d').drawImage(glassesImg, glassesX, glassesY, glassesWidth, glassesHeight);
            });
        }, 100);
    });
}

window.onload = async () => {
    await loadModels();
    startVideo();
    detectFaces();
}
