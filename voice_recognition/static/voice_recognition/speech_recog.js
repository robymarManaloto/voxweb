
const loaderContainer = document.getElementById('loaderContainer');
const startBtn = document.getElementById("startBtn");
const output = document.getElementById("output");
const form = document.getElementById("transcript");

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
const listener = new SpeechRecognition();
let is_recog = false;

restart();

listener.onresult = function (event) {
  const listening_vox = event.results[0][0].transcript.toLowerCase();
  if (listening_vox.includes('box')|listening_vox.includes('vox')) {
    listener.stop();
    
    recognition.start();
    is_recog = true;
    const newHTMLContent = "<lord-icon src='https://cdn.lordicon.com/ceogkocw.json' trigger='loop' state='loop-recording' colors='primary:#0056a4,secondary:#1c4987,tertiary:#ebe6ef,quaternary:#f24c00,quinary:#5cbcda' style='width:250px;height:250px'></lord-icon>";
    replaceContentWithAnimation(newHTMLContent, startBtn);
  }
};

listener.onend = function () {
  if (is_recog != true){
    listener.start();
  }
};

recognition.continuous = true;
recognition.lang = "fil-PH";

recognition.onstart = function () {
  output.textContent = "Listening...";
};

recognition.onresult = function (event) {
  const result = event.results[0][0].transcript;
  gotonext(result);
  console.log(result);
};

recognition.onend = function () {
  restart();
};

startBtn.addEventListener("click", function () {
  if (is_recog == false){
    listener.stop();
    recognition.start();
    is_recog = true;
    const newHTMLContent = "<lord-icon src='https://cdn.lordicon.com/ceogkocw.json' trigger='loop' state='loop-recording' colors='primary:#0056a4,secondary:#1c4987,tertiary:#ebe6ef,quaternary:#f24c00,quinary:#5cbcda' style='width:250px;height:250px'></lord-icon>";
    replaceContentWithAnimation(newHTMLContent, startBtn);
  }else{
    recognition.stop();
    const newHTMLContent = "<lord-icon src='https://cdn.lordicon.com/pbbsmkso.json' trigger='hover' colors='primary:#1c4987,secondary:#0056a4' style='width:250px;height:250px'> </lord-icon>";
    replaceContentWithAnimation(newHTMLContent, startBtn);
  }
});

function replaceContentWithAnimation(htmlContent, button) {
    startBtn.style.opacity = 0;
    startBtn.addEventListener('transitionend', () => {
        startBtn.innerHTML = htmlContent;
        startBtn.style.opacity = 1;
    });
    startBtn.style.transition = 'opacity 0.5s ease-in-out';
}

function restart(){
  output.innerHTML = '';
  listener.start();
  is_recog = false;
}

// Alerts
function gotonext(transcript){
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
        sendtranscript(transcript);
      }
  });
}

function sendtranscript(transcription){
  var csrftoken = $("[name=csrfmiddlewaretoken]").val();
  // Send the AJAX request
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
        // Redirect to another page after success
        window.location.href = "/edit-page";
    },
    error: function (xhr, status, error) {
        // Handle error
        console.error(error);
    }
  });
}

function sendtranscript(transcription) {
  var csrftoken = $("[name=csrfmiddlewaretoken]").val();

  // Send the AJAX request
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
      // Redirect to another page after success
      window.location.href = "/editor/";
    },
    error: function (xhr, status, error) {
      // Handle error
      console.error(error);
      loaderContainer.style.display = 'none';
      // Display a SweetAlert with an error message and an option to retry
      Swal.fire({
        title: 'Error',
        text: 'There was an error processing the transcription. Retry?',
        icon: 'error',
        showCancelButton: true,
        confirmButtonText: 'Retry',
        cancelButtonText: 'Cancel',
      }).then((result) => {
        if (result.isConfirmed) {
          sendtranscript(transcription);
        }
      });
    }
  });
}
