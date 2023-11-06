const loaderContainer = document.getElementById('loaderContainer');
const startBtn = document.getElementById("startBtn");
const output = document.getElementById("output");
const form = document.getElementById("transcript");
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
const listener = new SpeechRecognition();
let isRecognitionStarted = false;
const listeningText = document.getElementById("listening-text");
const firstText = document.getElementById("first-text");

initialize();

listener.onresult = function (event) {
  const listeningVox = event.results[0][0].transcript.toLowerCase();
  if (listeningVox.includes('box') || listeningVox.includes('vox')) {
    listener.stop();
    recognition.start();
    isRecognitionStarted = true;
  }
};

listener.onend = function () {
  if (!isRecognitionStarted) {
    listener.start();
  }
};

recognition.continuous = true;
recognition.lang = "fil-PH";

recognition.onstart = function () {
    listeningText.style.display = "block";
    firstText.style.display = "none";
    speak("I'm now listening. How can I assist you today?");
    const newHTMLContent = `
    <lord-icon
    src="https://cdn.lordicon.com/cpmcynxu.json"
    trigger="loop"
    state="loop-recording"
    colors="primary:#ffffff,secondary:#64ccc5"
    style="width:250px;height:250px">
    </lord-icon>`;
    animateButtonContent(newHTMLContent, startBtn);
};

recognition.onresult = function (event) {
  const result = event.results[0][0].transcript;
  processTranscript(result);
  console.log(result);
};

recognition.onend = function () {
  restartRecognition();
};

startBtn.addEventListener("click", function () {
  if (!isRecognitionStarted) {
    listener.stop();
    recognition.start();
    isRecognitionStarted = true;
    const newHTMLContent = `
    <lord-icon
    src="https://cdn.lordicon.com/cpmcynxu.json"
    trigger="loop"
    state="loop-recording"
    colors="primary:#ffffff,secondary:#64ccc5"
    style="width:250px;height:250px">
    </lord-icon>`;
    animateButtonContent(newHTMLContent, startBtn);
  } else {
    recognition.stop();
    const newHTMLContent = `
    <lord-icon
      src="https://cdn.lordicon.com/xumlwjxf.json"
      trigger="loop"
      colors="primary:#DAFFFB,secondary:#dafffb,tertiary:#64ccc5"
      style="width:250px;height:250px">
    </lord-icon>`;
    animateButtonContent(newHTMLContent, startBtn);
  }
});

function animateButtonContent(htmlContent, button) {
    startBtn.style.opacity = 0;
    startBtn.addEventListener('transitionend', () => {
        startBtn.innerHTML = htmlContent;
        startBtn.style.opacity = 1;
    });
    startBtn.style.transition = 'opacity 0.5s ease-in-out';
}

function initialize() {
  restartRecognition();
}

function restartRecognition() {
  output.innerHTML = '';
  listener.start();
  isRecognitionStarted = false;
  listeningText.style.display = "none";
  firstText.style.display =  "block";
}

function processTranscript(transcript) {
  if (transcript.length > 10) {
    confirmTranscript(transcript);
  } else {
    notEnoughInfo();
  }
}

function confirmTranscript(transcription) {
  Swal.fire({
    title: 'Are you sure?',
    text: `Do you want to proceed to the next page with this transcript?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, proceed!'
  }).then((result) => {
    if (result.isConfirmed) {
      loaderContainer.style.display = 'grid';
      loaderContainer.style.transition= 'opacity 0.5s ease-in-out';
      sendTranscript(transcription);
      speak("Please be patient. The system is now building your website. This may take a few moments.");
    }
  });
}

function notEnoughInfo() {
  speak("I'm sorry, but it seems like you didn't provide enough information for me to assist you effectively. Can you please provide more details?");
  Swal.fire({
    icon: 'warning',
    title: 'Not Enough Information!',
    text: 'Sorry, there is not enough information provided to create the website. Please provide more details.',
    confirmButtonText: 'Okay'
  });
}

function sendTranscript(transcription) {
  var csrftoken = $("[name=csrfmiddlewaretoken]").val();
  $.ajax({
    url: "/process_transcription/",
    type: "POST",
    headers: {
      "X-CSRFToken": csrftoken
    },
    data: {
      'transcription': transcription
    },
    success: function (data) {
      window.location.href = "/editor/";
    },
    error: function (xhr, status, error) {
      console.error(error);
      loaderContainer.style.display = 'none';
      Swal.fire({
        title: 'Error',
        text: 'There was an error processing the transcription. Retry?',
        icon: 'error',
        showCancelButton: true,
        confirmButtonText: 'Retry',
        cancelButtonText: 'Cancel',
      }).then((result) => {
        if (result.isConfirmed) {
          sendTranscript(transcription);
        }
      });
      speak("Oops! It looks like an error occurred. Please try again. If the issue persists, feel free to ask for help, and I'll do my best to assist you.");
    }
  });
}

document.addEventListener('DOMContentLoaded', (event) => {
  const microphoneIcon = document.createElement('i');
  microphoneIcon.classList.add('fas', 'fa-microphone');
  const microphoneLabel = document.createElement('span');
  microphoneLabel.textContent = ' Microphone Check';
  const titleContainer = document.createElement('div');
  titleContainer.appendChild(microphoneIcon);
  titleContainer.appendChild(microphoneLabel);

  Swal.fire({
    title: titleContainer,
    text: 'Please allow access to your microphone to continue.',
    showDenyButton: true,
    denyButtonText: `Deny`,
  }).then((result) => {
    if (result.isDenied) {
      Swal.fire({
        title: 'Microphone Denied',
        icon: 'error',
        showConfirmButton: false,
        allowOutsideClick: false,
      });      
    } else {
      speak('"Hello there! I\'m Vox. Thanks for reaching out. To begin creating your website, click the button or simply say \'Vox\'."');
    }
  });
});

function speak(text) {
  const message = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  const maleVoice = voices.find(voice => voice.name.includes("Google UK English Male"));
  if (maleVoice) message.voice = maleVoice;
  window.speechSynthesis.speak(message);
}

window.speechSynthesis.onvoiceschanged = () => {
  speak("Please allow access to your microphone to continue.");
};
