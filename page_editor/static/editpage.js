
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
          'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css'
        ],
        scripts: [
          'https://code.jquery.com/jquery-3.5.1.slim.min.js',
          'https://cdn.jsdelivr.net/npm/@popperjs/core@2.5.4/dist/umd/popper.min.js',
          'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js'
        ],
      },
    });
  }
  
  // Function to export all pages to a ZIP file
  function exportPagesToZIP(editor) {
    const zip = new JSZip();
    const css = zip.folder("css");
  
    const pages = editor.Pages;
    // Get an array of all pages
    const allPages = pages.getAll();

    // Loop through all pages and extract HTML and CSS code
    allPages.forEach(page => {
      // Get the HTML/CSS code from the page component
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
      });
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
          return pm.remove(pageId);
        },
        addPage() {
          const len = pm.getAll().length;
          pm.add({
            name: `Page ${len + 1}`,
            component: '<div>New page</div>',
          });
        },
      }
    });
  }