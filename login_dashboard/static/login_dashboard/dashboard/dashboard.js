function showDeleteAlert(projectId, projectName) {
Swal.fire({
    title: 'Delete Project?',
    text: `Are you sure you want to delete ${projectName}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!'
}).then((result) => {
    if (result.isConfirmed) {
        deleteProject(projectId, projectName);
    }
});
}

function deleteProject(projectId, projectName) {
fetch(`/delete_project/${projectId}/`, {
    method: 'POST',
    headers: {
      'X-CSRFToken': $('[name=csrf-token]').attr('content')
    },
    body: JSON.stringify({})
})
.then(response => response.json())
.then(data => {
    if (data.status === 'success') {
        Swal.fire('Deleted!', `${projectName} has been deleted.`, 'success');
        // Remove the deleted project from the DOM
        const deletedProjectElement = document.getElementById(`remove_project-${projectId}`);
        if (deletedProjectElement) {
            deletedProjectElement.remove();
            
            // If no more projects left, reload the page
            const remainingProjects = document.querySelectorAll('.list-group-item');
            if (remainingProjects.length === 0) {
              noItems();
            }
        } else {
            console.error('Error: Project element not found in the DOM.');
        }
    } else {
        Swal.fire('Error', 'Unable to delete the project.', 'error');
    }
})
.catch(error => {
    console.error('Error:', error);
});
}

// Function to show SweetAlert for logout
function logout() {
Swal.fire({
title: 'Logout',
text: 'Are you sure you want to logout?',
icon: 'question',
showCancelButton: true,
confirmButtonColor: '#d33',
cancelButtonColor: '#3085d6',
confirmButtonText: 'Yes, logout'
}).then((result) => {
if (result.isConfirmed) {
      $.ajax({
        type: 'POST',
        url: '/logout/',
        headers: {
          'X-CSRFToken': $('[name=csrf-token]').attr('content')
        },
        success: function (data) {
            if (data.success) {
                Swal.fire(
                  'Logged Out',
                  'You have been successfully logged out.',
                  'success'
              ).then(() => {
                  setTimeout(() => {
                      window.location.href = '/';
                  }, 0); // You can adjust the timeout value if needed
              });                    
            } else {
                Swal.fire(
                    'Error',
                    'Failed to logout. Please try again.',
                    'error'
                );
            }
        },
        error: function () {
            Swal.fire(
                'Error',
                'Failed to logout. Please try again.',
                'error'
            );
        }
    });
}
});
}

// Function to show SweetAlert for password change
function showChangePasswordAlert() {
Swal.fire({
title: 'Change Password',
html:
'<input type="password" id="oldPassword" class="swal2-input" placeholder="Old Password">' +
'<input type="password" id="newPassword" class="swal2-input" placeholder="New Password">' +
'<input type="password" id="confirmPassword" class="swal2-input" placeholder="Confirm Password">',
showCancelButton: true,
confirmButtonText: 'Change Password',
cancelButtonText: 'Cancel',
showLoaderOnConfirm: true,
preConfirm: () => {
const oldPassword = $('#oldPassword').val();
const newPassword = $('#newPassword').val();
const confirmPassword = $('#confirmPassword').val();
// Perform AJAX request to change password
return $.ajax({
  type: 'POST',
  url: '/change_password/',
  headers: {
    'X-CSRFToken': $('[name=csrf-token]').attr('content')
  },
  data: {
    old_password: oldPassword,
    new_password: newPassword,
    confirm_password: confirmPassword,
  },
});
},
allowOutsideClick: () => !Swal.isLoading(),
}).then((result) => {
if (result.isConfirmed && result.value.success) {
Swal.fire('Password Changed!', 'Your password has been successfully changed.', 'success')
  .then(() => {
    setTimeout(() => {
        window.location.href = '/';
    }, 0); // You can adjust the timeout value if needed
});
} else if (result.isConfirmed) {
Swal.fire('Error', 'Failed to change password. Please try again.', 'error');
}
});
}

// Attach click event to the "Change Password" button
$('#changePasswordBtn').on('click', function () {
showChangePasswordAlert();
});

function deleteAccount() {
Swal.fire({
title: 'Delete Account?',
text: 'Are you sure you want to delete your account? This action cannot be undone.',
icon: 'warning',
showCancelButton: true,
confirmButtonColor: '#d33',
cancelButtonColor: '#3085d6',
confirmButtonText: 'Yes, delete it!'
}).then((result) => {
if (result.isConfirmed) {
$.ajax({
  type: 'POST',
  url: '/delete_account/',
  headers: {
    'X-CSRFToken': $('[name=csrf-token]').attr('content')
  },
  success: function (data) {
    if (data.success) {
      Swal.fire(
        'Account Deleted!',
        'Your account has been successfully deleted.',
        'success'
      ).then(() => {
        setTimeout(() => {
          window.location.href = '/';
        }, 0);
      });
    } else {
      Swal.fire(
        'Error',
        'Failed to delete account. Please try again.',
        'error'
      );
    }
  },
  error: function () {
    Swal.fire(
      'Error',
      'Failed to delete account. Please try again.',
      'error'
    );
  }
});
}
});
}

// Function to show SweetAlert prompt for a new project name
function showNewProjectPrompt() {
Swal.fire({
title: 'Enter project name:',
input: 'text',
inputAttributes: {
autocapitalize: 'off',
style: 'text-align: center; width: 80%; margin: 0 auto;', // Centered and wide
},
showCancelButton: true,
confirmButtonText: 'Create Project',
showLoaderOnConfirm: true,
preConfirm: (projectName) => {
if (!projectName) {
Swal.showValidationMessage('Please enter a project name');
return false;
}

// Send the project name to Django using AJAX
return $.ajax({
url: '/create_project/',  // Update with your Django endpoint
method: 'POST',
headers: {
  'X-CSRFToken': $('[name=csrf-token]').attr('content')
},
data: {
  'project_name': projectName,
  // Add any additional data you want to send to the backend
},
error: function (xhr, status, error) {
  Swal.showValidationMessage(`Request failed: ${error}`);
}
});
},
allowOutsideClick: () => !Swal.isLoading()
}).then((result) => {
if (result.value) {
// Reload the page or update the project list as needed
location.reload();  // Reload the page for simplicity
}
});
}

// Event listener for the "Start a New Project" button
$('#startNewProjectBtn').click(function () {
showNewProjectPrompt();
});

const loader = document.getElementById('loading');      
setTimeout(function() {
  loader.style.display = "none";
}, 2000);

 

  // Check if there are no project items and display the placeholder text
  window.onload =  noItems();

  function noItems() {
    var projectList = document.getElementById('projectList');
    var placeholderText = document.getElementById('placeholderText');

    if (projectList.children.length === 1) {
      placeholderText.style.display = 'block';
    } else {
      placeholderText.style.display = 'none';
    }
  }



  function showUpdateAlert(projectId, currentName) {
    Swal.fire({
        title: 'Update Project Name',
        input: 'text',
        inputValue: currentName,
        showCancelButton: true,
        confirmButtonText: 'Update',
        cancelButtonText: 'Cancel',
        preConfirm: (newName) => {
            if (!newName) {
                Swal.showValidationMessage('Please enter a project name');
            }
            return newName;
        },
        allowOutsideClick: false
    }).then((result) => {
        if (result.isConfirmed) {
            updateProjectName(projectId, result.value);
        }
    });
}

function updateProjectName(projectId, newName) {
    // AJAX request to update project name
    $.ajax({
        url: '/update_project_name/',  // Update the URL according to your project's URL structure
        type: 'POST',
        headers: {
          'X-CSRFToken': $('[name=csrf-token]').attr('content')
        },
        data: {
            'project_id': projectId,
            'new_name': newName
        },
        success: function (data) {
            // Handle success, for example, show a success message
            Swal.fire('Success!', 'Project name updated successfully.', 'success');
            const textElement = document.getElementById('text-project-'+projectId);
            textElement.textContent = data['new_name'];
        },
        error: function (xhr, status, error) {
            // Handle errors, for example, show an error message
            Swal.fire('Error!', 'Failed to update project name.', 'error');
        }
    });
}