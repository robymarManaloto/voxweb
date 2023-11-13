
  // Function to get the CSRF token
  function getCSRFToken() {
    return $("[name=csrfmiddlewaretoken]").val();
  }
  
  // Function to prepare pages from the response
  function preparePages(pages) {
    return pages.map((page) => {
      return {
        name: page.name,
        component: page.component,
        styles: page.styles,
      };
    });
  }
  
  // Function to initialize the GrapesJS editor
  function initializeEditor(pages) {
    return grapesjs.init({
      container: '#gjs',
      height: '100%',
      storageManager: false,
      plugins: [
        'grapesjs-preset-webpage',
        'grapesjs-style-bg',
        'gjs-blocks-basic',
        'grapesjs-plugin-forms',
      ],
      pageManager: {
        pages: preparePages(pages),
      },
      canvas: {
        styles: [
          'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css',
          'https://use.fontawesome.com/releases/v5.15.4/css/all.css'
        ],
        scripts: [
          'https://code.jquery.com/jquery-3.5.1.slim.min.js',
          'https://cdn.jsdelivr.net/npm/@popperjs/core@2.5.4/dist/umd/popper.min.js',
          'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js',
          'https://use.fontawesome.com/releases/v5.15.4/js/all.js'
        ],
      },
    });
  }
  
  // Function to export all pages to a ZIP file
  function exportPagesToZIP(editor) {
    const zip = new JSZip();
    const css = zip.folder("css");
    
    const pages = editor.Pages;
    const allPages = pages.getAll();
    
    try {
      allPages.forEach(page => {
        const component = page.getMainComponent();
        const html = editor.getHtml({ component });
        const pageCSS = editor.getCss({ component });
    
        const pageHTML = `
          <html>
          <head>
            <title>${page.get('name')}</title>
            <link rel="stylesheet" href=\"https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css\">
            <link rel="stylesheet" href=\"css/${page.get('name')}.css\">
          </head>
          <body>
            ${html}                    
          </body>
          </html>
        `;
    
        zip.file(`${page.get('name')}.html`, pageHTML);
        css.file(`${page.get('name')}.css`, pageCSS);
      });
    
      zip.generateAsync({ type: "blob" })
        .then(function (content) {
          saveAs(content, "website.zip");
          // Success alert with a 3-second timer
          Swal.fire({
            title: "Success",
            text: "Website files successfully zipped!",
            icon: "success",
            timer: 3000,
            showConfirmButton: false
          });
        })
        .catch(function (error) {
          // Error alert
          Swal.fire({
            title: "Error",
            text: "An error occurred while generating the zip file.",
            icon: "error"
          });
          console.error("Error generating zip file:", error);
        });
    } catch (error) {
      // Catch any synchronous errors
      Swal.fire({
        title: "Error",
        text: "An error occurred while processing the pages.",
        icon: "error"
      });
      console.error("Error processing pages:", error);
    }
    
  }
  
  // Function to add a click event listener to the export button
  function addExportButtonListener(editor) {
    const exportBtn = document.getElementById('export-btn');
    exportBtn.addEventListener('click', () => exportPagesToZIP(editor));
  }
  
  // Function to create and initialize the Vue app
  function createVueApp(editor) {
    const pm = editor.Pages;
    const app = new Vue({
      delimiters: ['[[', ']]'],
      el: '.pages-wrp',
      data: { pages: [] },
      mounted() {
        this.setPages(pm.getAll());
        editor.on('page', () => {
          this.pages = [...pm.getAll()];
        });
      },
      methods: {
        setPages(pages) {
          this.pages = [...pages];
        },
        isSelected(page) {
          return pm.getSelected().id == page.id;
        },
        selectPage(pageId) {
          return pm.select(pageId);
        },
        removePage(pageId) {
          Swal.fire({
            title: 'Are you sure?',
            text: 'You are about to remove the page. This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, remove it!'
          }).then((result) => {
            if (result.isConfirmed) {
              Swal.fire(
                'Removed!',
                'The page has been removed.',
                'success'
              );
              return pm.remove(pageId);
            }
          });
        },
        addPage() {
          const len = pm.getAll().length;
        
          Swal.fire({
            title: 'Enter Page Name',
            input: 'text',
            inputPlaceholder: `Give me a name for Page ${len + 1}`,
            showCancelButton: true,
            confirmButtonText: 'Create Page',
            showLoaderOnConfirm: true,
            preConfirm: (name) => {
              if (!name) {
                Swal.showValidationMessage('Page name cannot be empty');
              } else {
                pm.add({
                  name,
                  component: '<div>New page</div>',
                });
              }
            },
          });
        },
        editPageName(page) {
          Swal.fire({
            title: 'Edit Page Name',
            input: 'text',
            inputValue: page.get('name') || '',
            showCancelButton: true,
            inputValidator: (value) => {
              if (!value) {
                return 'Name cannot be empty';
              }
            },
          }).then((result) => {
            if (result.value) {
              page.set('name', result.value);
            }
          });
        },
      }
    });
  }
