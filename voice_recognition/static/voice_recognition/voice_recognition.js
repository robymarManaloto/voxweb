const loaderContainer = document.getElementById('loaderContainer');
const startBtn = document.getElementById("startBtn");
const output = document.getElementById("output");
const form = document.getElementById("transcript");
const projectId = document.getElementById("project_id").value;

// Initialize the speech recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
const listener = new SpeechRecognition();
let isRecognitionStarted = false;


// Change the text when speech recognition is on or not.
const listeningText = document.getElementById("listening-text");
const firstText = document.getElementById("first-text");

// The transcript should be looped and recognize filipino words
recognition.continuous = true;
recognition.lang = "fil-PH";

// Initilize listener of 'Vox'
restartRecognition();

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
};

recognition.onend = function () {
  restartRecognition();
};

// Change icon if started or not
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

// Make transition to button
function animateButtonContent(htmlContent, button) {
    startBtn.style.opacity = 0;
    startBtn.addEventListener('transitionend', () => {
        startBtn.innerHTML = htmlContent;
        startBtn.style.opacity = 1;
    });
    startBtn.style.transition = 'opacity 0.5s ease-in-out';
}

function restartRecognition() {
  output.innerHTML = '';
  listener.start();
  isRecognitionStarted = false;
  listeningText.style.display = "none";
  firstText.style.display =  "block";
}

// Check if transcript is enough
function processTranscript(transcript) {
  if (transcript.length > 100) {
    confirmTranscript(transcript);
  } else {
    notEnoughInfo();
  }
}

// Send alert if the info is not enough
function notEnoughInfo() {
  speak("I'm sorry, but it seems like you didn't provide enough information for me to assist you effectively. Can you please provide more details?");
  Swal.fire({
    icon: 'warning',
    title: 'Not Enough Information!',
    text: 'Sorry, there is not enough information provided to create the website. Please provide more details.',
    confirmButtonText: 'Okay'
  });
}

// Send transcript to process if confirmed
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

// Generate the files needed, go to editor if finished
function sendTranscript(transcription) {
  var csrftoken = $("[name=csrfmiddlewaretoken]").val();
  $.ajax({
    url: "/process_transcription/"+projectId+"/",
    type: "POST",
    headers: {
      "X-CSRFToken": csrftoken
    },
    data: {
      'transcription': transcription
    },
    success: function (data) {
      window.location.href = "/page_editor/";
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

// Check microphone to use the speech synthesis
document.addEventListener('DOMContentLoaded', (event) => {
   // Check if the microphone is available
   if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    // Microphone not detected, show SweetAlert
    loader.style.display = "none";
    Swal.fire({
        title: 'Microphone Not Detected',
        text: 'Please make sure your microphone is connected and try again.',
        icon: 'error',
        confirmButtonText: 'Go Back',
        allowOutsideClick: false
    }).then((result) => {
        if (result.isConfirmed) {
            // User clicked "Go Back", navigate back
            window.history.back();
        }
    });
  }else{
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
  }
});

// Speech Synthesis
function speak(text) {
  const message = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  const maleVoice = voices.find(voice => voice.name.includes("Google UK English Male"));
  if (maleVoice) message.voice = maleVoice;
  window.speechSynthesis.speak(message);
}

// Start first to change the voice
window.speechSynthesis.onvoiceschanged = () => {
  speak("Please allow access to your microphone to continue.");
};

const siriWave = new SiriWave({
  container: document.getElementById('siri-container'),
  width: 600,
  height: 100,
  color: '#FFFFFF',
  speed: 0.05,
  amplitude: 0.8,
});

  document.getElementById('back-button').addEventListener('click', function() {
    // Display a SweetAlert confirmation dialog
    Swal.fire({
        title: 'Are you sure?',
        text: 'Do you really want to go back to dashboard?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, go back!',
        cancelButtonText: 'No, cancel'
    }).then((result) => {
        // If the user clicks "Yes, go back!", navigate to '/dashboard/'
        if (result.isConfirmed) {
            window.location.href = '/dashboard/';
        }
    });
    
  });