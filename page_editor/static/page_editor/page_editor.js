  let editor;
  const loader = document.getElementById('loading');
  $(document).ready(function () {
    const csrftoken = getCSRFToken();
    $.ajax({
      url: '/get_html_files/',
      type: 'GET',
      headers: {
        "X-CSRFToken": csrftoken,
      },
      dataType: 'json',
      success: function (response) {
        const pages = response.html_files;
        editor = initializeEditor(pages);
        addExportButtonListener(editor);
        addSaveButtonListener(editor);
        createVueApp(editor);
        addVoiceListener(editor);
      
        // Hide the loading element once data is loaded
        setTimeout(function () {
          loader.style.display = "none";
        }, 2000);
      },
      error: function (xhr, status, error) {
        loader.style.display = "none";
        // Display a SweetAlert for the error
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Pages are not displaying correctly. Please go back to the previous page.',
        }).then(function () {
          window.location.href = '/dashboard/';
        });
      },
    });
  });
  
  document.getElementById('back-button').addEventListener('click', function() {
    Swal.fire({
        title: 'Are you sure?',
        text: 'Do you want to go back to the dashboard?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, go back!'
    }).then((result) => {
        if (result.isConfirmed) {
            // Ask for confirmation to save changes
            Swal.fire({
                title: 'Save changes?',
                text: 'Do you want to save all changes before going back?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, save changes!'
            }).then((saveResult) => {
                if (saveResult.isConfirmed) {
                    // Call savePages function here
                    savePages(editor); // Assuming 'editor' is defined in your context
                }

                // Regardless of whether changes are saved or not, go back to the dashboard
                window.location.href = '/dashboard/';
            });
        }
    });
});


document.addEventListener('DOMContentLoaded', () => {
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
                window.location.href = '/dashboard/';
            }
        });
    }
});

const askvox = document.getElementById('askvox');
askvox.addEventListener('click', function () {
  speak("If you wish to regenerate the page, just say my name!");
});

function speak(text) {
  const message = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  const maleVoice = voices.find(voice => voice.name.includes("Google UK English Male"));
  if (maleVoice) message.voice = maleVoice;
  window.speechSynthesis.speak(message);
}

window.speechSynthesis.onvoiceschanged = () => {
  speak("");
};
