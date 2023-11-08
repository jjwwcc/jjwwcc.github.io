var base64Image = '';
var prompt = {};
// get token from local storage
var token = localStorage.getItem('token');

if (!token) {
    // get token from url
    const urlParams = new URLSearchParams(window.location.search);
    token = urlParams.get('token');
    if (token) {
        // save token to local storage
        localStorage.setItem('token', token);
    }
}

let isCapturing = false;
// Initialize the webcam and set event listeners
function initializeWebcam() {
    if (isCapturing) {
        document.getElementById('start-camera').innerHTML = 'Start Camera';
        document.getElementById('webcam').style.display = 'none';
        document.getElementById('drop_area').style.display = 'block';
        const video = document.getElementById('webcam');
        video.srcObject.getTracks().forEach(track => track.stop());
        isCapturing = !isCapturing;
        return;
    }
    isCapturing = !isCapturing;
    document.getElementById('start-camera').innerHTML = 'Stop Camera';
    const video = document.getElementById('webcam');
    video.style.display = 'block';
    document.getElementById('drop_area').style.display = 'none';
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
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
    const video = document.getElementById('webcam');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    base64Image = canvas.toDataURL('image/jpeg').split(',')[1];
    document.getElementById('image').src = `data:image/jpeg;base64,${base64Image}`;
    document.getElementById('image').style.display = 'block';
    document.getElementById('message-container').style.display = 'flex';
    document.getElementById('chatbox').style.display = 'none';
    // stop camera
    video.srcObject.getTracks().forEach(track => track.stop());
    // clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
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
    document.getElementById('webcam').style.display = 'none';
    // change full screen background image
    document.body.style.backgroundImage = `url(data:image/jpeg;base64,${base64Image})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundRepeat = 'no-repeat';
    document.getElementById('msg').value = '';
    processImage();
}

function processImage() {
    toggleLoader(true);

    fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
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
    // write assistant message to prompt
    prompt.messages.push({
        role: "assistant",
        content: [
            {
                type: "text",
                text: message
            }
        ]
    });
    // messageElement.innerHTML = `<div class="message-content">${message}</div>
    //                             <div class="timestamp">${timestamp}</div>`;
    // if (chatbox.firstChild) {
    //     chatbox.insertBefore(messageElement, chatbox.firstChild);
    // } else {
    //     chatbox.appendChild(messageElement);
    // }
}

// chat again
function chatAgain() {
    var userInput = document.getElementById('userInputText').value;
    prompt.messages.push({
        role: "user",
        content: [
            {
                type: "text",
                text: userInput
            }
        ]
    });
    document.getElementById('userInputText').value = '';
    processImage();
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
            document.getElementById('start-camera').innerHTML = 'Start Camera';
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

// drog and drop event
function dragOverHandler() {
    var dropArea = document.getElementById('drop_area');

    // 阻止默认行为
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // 高亮显示拖拽区域
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
        dropArea.classList.add('highlight');
    }

    function unhighlight(e) {
        dropArea.classList.remove('highlight');
    }

    // 处理拖拽的文件
    dropArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        var dt = e.dataTransfer;
        var files = dt.files;
        // if file is image, convert to base64
        if (files[0].type.indexOf('image') > -1) {
            var reader = new FileReader();
            reader.readAsDataURL(files[0]);
            reader.onload = function () {
                base64Image = reader.result.split(',')[1];
                document.getElementById('image').src = `data:image/jpeg;base64,${base64Image}`;
                document.getElementById('image').style.display = 'block';
                document.getElementById('message-container').style.display = 'flex';
                document.getElementById('chatbox').style.display = 'none';
            }
        }
    }
}

// onclick uploadButton
function uploadImage() {
    document.getElementById('file').click();
}

// Event listeners
document.addEventListener('DOMContentLoaded', function () {
    // initializeWebcam();
    dragOverHandler();
    document.getElementById('capture').addEventListener('click', captureImage);
    document.getElementById('switch-camera').addEventListener('click', switchCamera());
    document.getElementById('imageAsk').addEventListener('click', imageAsk);
    // start camera
    document.getElementById('start-camera').addEventListener('click', initializeWebcam);
    // contrl + enter
    document.getElementById('msg').addEventListener('keydown', function (e) {
        if (e.ctrlKey && e.keyCode == 13) {
            imageAsk();
        }
    });
    document.getElementById('uploadButton').addEventListener('click', uploadImage);
    // upload file
    document.getElementById('file').addEventListener('change', function (e) {
        var file = e.target.files[0];
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            base64Image = reader.result.split(',')[1];
            document.getElementById('image').src = `data:image/jpeg;base64,${base64Image}`;
            document.getElementById('image').style.display = 'block';
            document.getElementById('message-container').style.display = 'flex';
            document.getElementById('chatbox').style.display = 'none';
        }
    });
    document.getElementById('userInputButton').addEventListener('click', chatAgain);
});
