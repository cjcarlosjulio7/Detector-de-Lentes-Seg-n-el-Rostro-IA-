document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const captureButton = document.getElementById('capture-button');
    const changeLensButton = document.getElementById('change-lens-button');
    const resultDiv = document.getElementById('result');
    const resultCanvas = document.getElementById('result-canvas');
    const faceShapeSpan = document.getElementById('face-shape');
    const recommendationSpan = document.getElementById('recommendation');

    const lenses = {
        'Redonda': [
            'cuadrado1.png', 'cuadrado3.png', 'cuadrado5.png', 'cuadrado6.png', 'cuadrado7.png', 'cuadrado8.png', 'cuadrado9.png',
            'rectangular1.png', 'rectangular2.png', 'rectangular3.png', 'rectangular4.png', 'rectangular5.png', 'rectangular6.png', 'rectangular7.png'
        ],
        'Cuadrada': [
            'redondo3.png', 'redondo4.png', 'redondo5.png', 'redondo6.png', 'redondo8.png', 'redondo9.png',
            'aviador1.png', 'aviador2.png', 'aviador3.png'
        ],
        'Alargada': [
            'cuadrado1.png', 'cuadrado3.png', 'cuadrado4.png', 'cuadrado5.png', 'cuadrado6.png', 'cuadrado7.png', 'cuadrado8.png', 'cuadrado9.png'
        ],
        'Corazon': [
            'redondo3.png', 'redondo4.png', 'redondo5.png', 'redondo6.png', 'redondo8.png', 'redondo9.png',
            'agatado1.png', 'agatado2.png', 'agatado3.png', 'agatado4.png', 'agatado5.png', 'agatado6.png', 'agatado7.png'
        ],
        'Ovalada': [
            'agatado1.png', 'agatado2.png', 'agatado3.png', 'agatado4.png', 'agatado5.png', 'agatado6.png', 'agatado7.png',
            'aviador1.png', 'aviador2.png', 'aviador3.png',
            'cuadrado1.png', 'cuadrado3.png', 'cuadrado5.png', 'cuadrado6.png', 'cuadrado7.png', 'cuadrado8.png', 'cuadrado9.png',
            'rectangular1.png', 'rectangular2.png', 'rectangular3.png', 'rectangular4.png', 'rectangular5.png', 'rectangular6.png', 'rectangular7.png',
            'redondo3.png', 'redondo4.png', 'redondo5.png', 'redondo6.png', 'redondo8.png', 'redondo9.png'
        ]
    };
    
    
    let currentLensIndex = 0;
    let faceShape = '';
    let faceCoords = {};

    // Acceder a la cámara
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(function(stream) {
            video.srcObject = stream;
            video.play();
        })
        .catch(function(err) {
            console.error('Error accessing the camera: ', err);
        });

    // Capturar foto
    captureButton.addEventListener('click', function() {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(async function(blob) {
            const formData = new FormData();
            formData.append('image', blob, 'photo.png');

            const response = await fetch('/predict', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                faceShape = result.face_shape;
                faceCoords = result.face_coords;
                recommendationSpan.textContent = result.recommendation;

                faceShapeSpan.textContent = faceShape;
                applyLenses();
                resultDiv.style.display = 'block';
            } else {
                console.error('Error uploading image:', response.statusText);
            }
        }, 'image/png');
    });

    // Cambiar lentes
    changeLensButton.addEventListener('click', function() {
        currentLensIndex = (currentLensIndex + 1) % lenses[faceShape].length;
        applyLenses();
    });

    function applyLenses() {
        const context = resultCanvas.getContext('2d');
        const lensImage = new Image();
        lensImage.src = `static/lenses/${lenses[faceShape][currentLensIndex]}`;
        lensImage.onload = function() {
            resultCanvas.width = canvas.width;
            resultCanvas.height = canvas.height;
            context.drawImage(canvas, 0, 0, canvas.width, canvas.height);
            context.drawImage(lensImage, faceCoords.x, faceCoords.y-30, faceCoords.w, faceCoords.h);
        };
    }
});
