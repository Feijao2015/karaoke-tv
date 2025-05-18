const fs = require('fs');
const path = require('path');

// Paths
const buildDir = path.join(__dirname, '../build');
const indexPath = path.join(buildDir, 'index.html');

// Add Samsung TV browser specific optimizations
function modifyIndexHtml() {
  let content = fs.readFileSync(indexPath, 'utf8');
  
  // Add Samsung TV specific meta tags
  const tvMeta = `
    <meta name="viewport" content="width=1920, height=1080, initial-scale=1.0, maximum-scale=1.0">
    <meta name="screen-orientation" content="landscape">
    <meta name="samsung:video_support" content="true">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="mobile-web-app-capable" content="yes">
  `;
  
  // Add minimal polyfills for older browsers
  const polyfills = `
    <script>
      // Simple Promise polyfill
      if (!window.Promise) {
        window.Promise = function(fn) {
          var callbacks = [];
          var value;
          this.then = function(onFulfilled) {
            callbacks.push(onFulfilled);
            return this;
          };
          function resolve(val) {
            value = val;
            callbacks.forEach(function(callback) {
              callback(value);
            });
          }
          fn(resolve);
        };
      }
      
      // Simple fetch polyfill using XMLHttpRequest
      if (!window.fetch) {
        window.fetch = function(url) {
          return new Promise(function(resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url);
            xhr.onload = function() {
              resolve({
                ok: xhr.status >= 200 && xhr.status < 300,
                json: function() {
                  return Promise.resolve(JSON.parse(xhr.responseText));
                }
              });
            };
            xhr.onerror = reject;
            xhr.send();
          });
        };
      }
    </script>
  `;
  
  // Insert meta tags and polyfills after the <head> tag
  content = content.replace('<head>', `<head>${tvMeta}${polyfills}`);
  
  // Add Samsung TV specific initialization
  const tvScript = `
    <script>
      window.addEventListener('load', function() {
        // Prevent screen saver
        if (window.webapis && window.webapis.appcommon) {
          try {
            window.webapis.appcommon.setScreenSaver(window.webapis.appcommon.AppCommonScreenSaverState.SCREEN_SAVER_OFF);
          } catch(e) {
            console.log('Failed to disable screen saver:', e);
          }
        }

        // Set focus to body for better remote control navigation
        document.body.focus();
        
        // Handle remote control keys
        document.addEventListener('keydown', function(e) {
          switch(e.keyCode) {
            case 10009: // RETURN key
              e.preventDefault();
              // Handle return key
              break;
            case 13: // Enter key
              e.preventDefault();
              // Handle enter key
              break;
          }
        });
      });
    </script>
  `;
  
  // Add the TV script before </body>
  content = content.replace('</body>', `${tvScript}</body>`);
  
  fs.writeFileSync(indexPath, content);
  console.log('✅ Modified index.html for Samsung TV browser compatibility');
}

// Main optimization process
async function optimize() {
  try {
    modifyIndexHtml();
    console.log('✅ Samsung TV browser optimization completed successfully');
  } catch (error) {
    console.error('❌ Error during optimization:', error);
    process.exit(1);
  }
}

optimize(); 