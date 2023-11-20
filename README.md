![alt text](https://github.com/robymarManaloto/voxweb/blob/main/static/login_dashboard/logo_2.png?raw=true)

# VoxWeb App README

Welcome to the README for your Django application! This document is designed to provide an overview of your project, instructions for setup, and information about how to use and extend the application.

## Table of Contents

- [Project Overview](#project-overview)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [Folder Structure](#folder-structure)
- [Contributing](#contributing)
- [License](#license)

## Project Overview

**VoxWeb: A Speech-Enabled Automatic Website Building System** is a software solution designed to simplify and streamline the process of creating web pages through voice recognition technology. The application encompasses a range of functionalities, including user authentication, project management, voice-enabled editing, and automatic website building.

## Getting Started

To get your Django app up and running on a local development environment, follow these steps:

### Prerequisites

Ensure the following software and tools are installed:

- Python 3.x
- Django
- Virtual environment (recommended)
- Any other dependencies
- [Rust compiler toolchain](https://rustup.rs/) - Required for specific functionalities
- [Desktop Development with C++ in Visual Studio](https://visualstudio.microsoft.com/visual-cpp-build-tools/) - Required for specific functionalities

### Installation

1. Clone this repository to your local machine:

   ```bash
   git clone https://github.com/robymarManaloto/voxweb.git  --recurse-submodules
   ```

2. Navigate to the project directory:

   ```bash
   cd your-django-app
   ```

3. Create a virtual environment (recommended):

   ```bash
   python -m venv venv
   ```

4. Activate the virtual environment:

   - On Windows:

     ```bash
     venv\Scripts\activate
     ```

   - On macOS and Linux:

     ```bash
     source venv/bin/activate
     ```

5. Install project dependencies:

   ```bash
   pip install -r requirements.txt
   ```

6. Start the development server:

   ```bash
   python manage.py runserver --insecure
   ```

Your Django app should now be running at http://127.0.0.1:8000/. You can access the admin panel at http://127.0.0.1:8000/admin/ using the superuser credentials you created.

## Usage

To use the VoxWeb application:

- **Login/Sign-in Page**: Create accounts and log in securely. Implement password recovery for forgotten passwords.

- **Dashboard**: View project overviews, details, and manage projects. Receive notifications for project updates.

- **Profile Management**: Change passwords, delete accounts, and log out.

- **Voice Recognition Page**: Utilize voice input, prompt storage, and voice feedback for automatic website building.

- **Drag and Drop Website Project Edit Section**: Customize and edit website content using drag-and-drop functionality. Enable voice-enabled editing for a flexible user experience.

- **Exporting Code**: Include an option to export generated website files into a zip file.

- **Overall Application Functionalities**: Manage user profiles, implement security measures, provide help/support resources, and ensure responsive design.

## Folder Structure

The project's folder structure is organized as follows:

- **static**: Static files
- **login_dashboard, page_editor, voice_recognition**: Three apps
- **voxweb**: Main project folder

## Contributing

Contributions to this project are welcome! Please follow the guidelines in the [CONTRIBUTING.md](CONTRIBUTING.md) file for bug reports, feature requests, and pull requests.

## License

This Django app is distributed under the [MIT License](LICENSE).
