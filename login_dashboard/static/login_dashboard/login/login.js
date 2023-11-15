const toggleForm = () => {
    const container = document.querySelector('.container');
    container.classList.toggle('active');
  };

  $(document).ready(function () {
    $('#login-form').submit(function (e) {
        e.preventDefault();
        $.ajax({
            type: 'POST',
            url: '',
            headers: {
                'X-CSRFToken': $('[name=csrf-token]').attr('content')
            },
            data: $(this).serialize(),
            success: function (data) {
                if (data.success) {
                    // Redirect to the dashboard on successful login
                    window.location.href = '/dashboard/';
                } else {
                    // Display error messages using Bootstrap validation
                    displayValidationErrors('login-form', data.message);
                }
            }
        });
    });

    $('#register-form').submit(function (e) {
        e.preventDefault();
        $.ajax({
            type: 'POST',
            url: '/register/',
            headers: {
                'X-CSRFToken': $('[name=csrf-token]').attr('content')
            },
            data: $(this).serialize(),
            success: function (data) {
                if (data.success) {
                    // Redirect to the login page on successful registration
                        Swal.fire({
                        icon: 'success',
                        title: 'Registration Successful',
                        text: 'You have been successfully registered!',
                        confirmButtonText: 'OK'
                    }).then((result) => {
                        // Redirect to the login page on popup confirmation
                        if (result.isConfirmed || result.isDismissed) {
                            window.location.href = '/';
                        }
                    });
                } else {
                    // Display error messages using Bootstrap validation
                    displayValidationErrors('register-form', data.message);
                }
            }
        });
    });

    function displayValidationErrors(formId, message) {
        // Clear previous validation messages
        $('#' + formId + ' .invalid-feedback').remove();

        // Display new validation message with centered alignment
        $('#' + formId + ' h1').after('<div class="invalid-feedback d-flex justify-content-center">' + message + '</div>');

        // Add Bootstrap's is-invalid class to highlight the error fields
        $('#' + formId + ' :input').addClass('is-invalid');
    }

});
