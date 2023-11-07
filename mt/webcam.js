const OPENAI_API_KEY = 'sk-';
var base64Image = '';
var prompt = {};

let isCapturing = false;
// Initialize the webcam and set event listeners
function initializeWebcam() {
    const video = document.getElementById('webcam');
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
        })
        .catch(error => {
            console.error('getUserMedia error:', error);
            // You can update this to show an error message to the user in the UI.
        });
}

// Function to capture image from webcam and process it
function captureImage() {
    isCapturing = !isCapturing;
    const video = document.getElementById('webcam');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    base64Image = canvas.toDataURL('image/jpeg').split(',')[1];
    document.getElementById('image').src = `data:image/jpeg;base64,${base64Image}`;
    document.getElementById('image').style.display = 'block';
    document.getElementById('message-container').style.display = 'flex';
    document.getElementById('chatbox').style.display = 'none';
}

function imageAsk() {
    let msg = document.getElementById('msg').value;
    if (msg === '') {
        msg = 'What is this?';
    }
    // create json object
    prompt = {
        model: "gpt-4-vision-preview",
        messages: [{
            role: "user",
            content: [
                {
                    type: "text",
                    text: msg
                },
                {
                    type: "image_url",
                    image_url: {
                        url: `data:image/jpeg;base64,${base64Image}`
                    }
                }
            ]
        }],
        max_tokens: 300
    }
    document.getElementById('message-container').style.display = 'none';
    document.getElementById('chatbox').style.display = 'block';
    document.getElementById('chatbox-content').innerHTML = '';
    processImage();
}

function processImage() {
    toggleLoader(true);
    console.log(base64Image);

    fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify(prompt)
    })
        .then(response => response.json())
        .then(handleResponse)
        .catch(handleError);
}

// Handle the server response
function handleResponse(data) {
    toggleLoader(false); // Hide the loader
    if (data.error) {
        console.error(data.error);
        appendToChatbox(`Error: ${data.error}`, true);
        return;
    }
    appendToChatbox(data.choices[0].message.content);
}

// Handle any errors during fetch
function handleError(error) {
    toggleLoader(false); // Hide the loader
    console.error('Fetch error:', error);
    appendToChatbox(`Error: ${error.message}`, true);
}

// Toggle the visibility of the loader
function toggleLoader(show) {
    document.querySelector('.loader').style.display = show ? 'block' : 'none';
}

// Append messages to the chatbox
function appendToChatbox(message, isUserMessage = false) {
    const chatboxContent = document.getElementById('chatbox-content');
    const messageElement = document.createElement('div');
    const timestamp = new Date().toLocaleTimeString(); // Get the current time as a string

    // Assign different classes based on the sender for CSS styling
    messageElement.className = isUserMessage ? 'user-message' : 'assistant-message';

    chatboxContent.innerHTML = `<div class="message-content">${message}</div>
                        <div class="timestamp">${timestamp}</div>`;

    // messageElement.innerHTML = `<div class="message-content">${message}</div>
    //                             <div class="timestamp">${timestamp}</div>`;
    // if (chatbox.firstChild) {
    //     chatbox.insertBefore(messageElement, chatbox.firstChild);
    // } else {
    //     chatbox.appendChild(messageElement);
    // }
}

// Function to switch the camera source
function switchCamera() {
    const video = document.getElementById('webcam');
    let usingFrontCamera = true; // This assumes the initial camera is the user-facing one

    return function () {
        // Toggle the camera type
        usingFrontCamera = !usingFrontCamera;
        const constraints = {
            video: { facingMode: (usingFrontCamera ? 'user' : 'environment') }
        };

        // Stop any previous stream
        if (video.srcObject) {
            video.srcObject.getTracks().forEach(track => track.stop());
        }

        // Start a new stream with the new constraints
        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                video.srcObject = stream;
            })
            .catch(error => {
                console.error('Error accessing media devices.', error);
            });
    };
}

// Event listeners
document.addEventListener('DOMContentLoaded', function () {
    initializeWebcam();

    document.getElementById('capture').addEventListener('click', captureImage);
    document.getElementById('switch-camera').addEventListener('click', switchCamera());
    document.getElementById('imageAsk').addEventListener('click', imageAsk);
    // contrl + enter
    document.getElementById('msg').addEventListener('keydown', function (e) {
        if (e.ctrlKey && e.keyCode == 13) {
            imageAsk();
        }
    });
});
