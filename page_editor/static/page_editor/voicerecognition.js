const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const listener = new SpeechRecognition();
const recognition = new SpeechRecognition();

let transcription = '';

const stopBtn = document.getElementById('stop-btn');
stopBtn.addEventListener('click', function () {
  recognition.stop();
});

function addVoiceListener(editor) {
  listenVoice(listener)
    .then(() => voxListen(recognition))
    .then(() => {
      console.log(transcription);
      speak("The system is now processing your changes. Please wait patiently.");
      const pages = editor.Pages;
      const page = pages.getSelected();
      const component = page.getMainComponent();
      const htmlPage = editor.getHtml({ component });
      changePage(htmlPage, transcription, editor);
      addVoiceListener(editor);
    })
    .catch(err => console.error(err));
}

function listenVoice(listener) {
  return new Promise((resolve, reject) => {
    try {
      let isRecog = true;
      listener.start();
      listener.onresult = function (event) {
        const listening_vox = event.results[0][0].transcript.toLowerCase();
        if (listening_vox.includes('box') || listening_vox.includes('vox')) {
          listener.stop();
          isRecog = false;
          speak("I'm now listening to changes for the current page.");
          heardYou();
          resolve();
        }
      };
      listener.onend = function () {
        if (isRecog) {
          listener.start();
        }
      };
    } catch (err) {
      console.error(err);
      reject(err);
    }
  });
}

function voxListen(recognition) {
  return new Promise((resolve, reject) => {
    try {
      recognition.continuous = true;
      recognition.lang = 'fil-PH';
      recognition.start();
      recognition.onstart = function () {
        console.log('Listening...');
      };

      recognition.onresult = function (event) {
        transcription = event.results[0][0].transcript;
      };

      recognition.onend = function () {
        resolve();
      };

    } catch (err) {
      console.error(err);
      reject(err);
    }
  });
}

function changePage(html, transcript, editor) {
  const pages = editor.Pages;
  const page = pages.getSelected();
  askvox.innerHTML = '<lord-icon src="https://cdn.lordicon.com/twemlvxy.json" trigger="loop" state="loop-cycle" colors="primary:#ffffff" style="width:30px;height:30px; margin-bottom:-8px;"></lord-icon> Generating...';
  $.ajax({
    url: '/page_editor/regenerate_page/',
    type: 'POST',
    headers: {
      'X-CSRFToken': $('[name=csrf-token]').attr('content'),
    },
    data: {
      transcription: transcript,
      html: html,
      name: page.get('name'),
    },
    success: function (data) {
      try {
        pages.add({
          id: String(data['id']),
          name: page.get('name'),
          component: data['component'],
          styles: data['styles'],
        });
        speak("Your changes on " + page.get('name') + " page have been processed successfully.");
        askvox.innerHTML = '<lord-icon src="https://cdn.lordicon.com/rhprarly.json" trigger="loop" colors="primary:#ffffff,secondary:#ffffff" style="width:30px;height:30px; margin-bottom:-8px;"></lord-icon> Ask Vox, they say!';
      } catch (err) {
        console.error(error);
        // Display SweetAlert for error
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An error occurred. Please try again.',
        }).then(() => {
          // Reload the page
          location.reload();
        });
      }
    },
    error: function (xhr, status, error) {
      console.error(error);
      // Display SweetAlert for error
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred. Please try again.',
      }).then(() => {
        // Reload the page
        location.reload();
      });
    },
  });
}

function heardYou(){
  Swal.fire({
    title: "Listening...",
    icon: 'info',
    html: '<p style="color:white;">This is a voice assistant style alert!</p> <lord-icon src="https://cdn.lordicon.com/xumlwjxf.json" trigger="loop" colors="primary:#DAFFFB,secondary:#dafffb,tertiary:#64ccc5" style="width:250px;height:250px"> </lord-icon>',
    showCancelButton: false,
    confirmButtonColor: '#FF4747',
    confirmButtonText: '<i class="fas fa-stop"></i> Stop',
    cancelButtonText: 'Cancel',
    reverseButtons: true,
    background: '#04364A',
    customClass: {
      confirmButton: 'swal-button'
    }
  }).then((result) => {
    recognition.stop();
  });
}