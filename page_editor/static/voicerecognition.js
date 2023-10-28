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
  const csrftoken = $('[name=csrfmiddlewaretoken]').val();
  $.ajax({
    url: '/editor/regenerate_page/',
    type: 'POST',
    headers: {
      'X-CSRFToken': csrftoken,
    },
    data: {
      transcription: transcript,
      html: html,
    },
    success: function (data) {
      try {
        const pages = editor.Pages;
        const page = pages.getSelected();
        pages.add({
          name: page.get('name'),
          component: data['component'],
          styles: data['styles'],
        });
      } catch (err) {
        console.error(err);
      }
    },
    error: function (xhr, status, error) {
      console.error(error);
    },
  });
}
