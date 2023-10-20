const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");

const output = document.getElementById("output");

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.lang = "fil-PH";

restart();

recognition.onstart = function () {
  output.textContent = "Listening...";
};

recognition.onresult = function (event) {
  const result = event.results[0][0].transcript;
  gotonext(result);
};

recognition.onend = function () {
  restart();
};

startBtn.addEventListener("click", function () {
  recognition.start();
  stopBtn.style.visibility = 'visible';
  const newHTMLContent = "<lord-icon src='https://cdn.lordicon.com/ceogkocw.json' trigger='loop' state='loop-recording' colors='primary:#0056a4,secondary:#1c4987,tertiary:#ebe6ef,quaternary:#f24c00,quinary:#5cbcda' style='width:250px;height:250px'></lord-icon>";
  replaceContentWithAnimation(newHTMLContent, startBtn);
});

stopBtn.addEventListener("click", () => {
    recognition.stop();
    const newHTMLContent = "<lord-icon src='https://cdn.lordicon.com/pbbsmkso.json' trigger='hover' colors='primary:#1c4987,secondary:#0056a4' style='width:250px;height:250px'> </lord-icon>";
    replaceContentWithAnimation(newHTMLContent, startBtn);
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
  stopBtn.style.visibility = 'hidden';
  output.innerHTML = '';

}

// Alerts
function gotonext(transcript){
    Swal.fire({
      title: 'Are you sure?',
      html: `Transcript: ${transcript} <br><br> Do you want to proceed to the next page with this transcript?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, proceed!'
  }).then((result) => {
      if (result.isConfirmed) {
          window.location.href = 'next-page.html';
      }
  });
}