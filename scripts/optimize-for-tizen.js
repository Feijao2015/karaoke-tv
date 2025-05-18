const fs = require('fs');
const path = require('path');

// Paths
const buildDir = path.join(__dirname, '../build');
const indexPath = path.join(buildDir, 'index.html');

// Add TV-specific meta tags and polyfills
function modifyIndexHtml() {
  let content = fs.readFileSync(indexPath, 'utf8');
  
  // Add TV-specific meta tags
  const tvMeta = `
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
    <meta name="screen-orientation" content="landscape">
    <meta name="full-screen" content="yes">
    <meta name="theme-color" content="#000000">
  `;
  
  // Add polyfills (only if needed)
  const polyfills = `
    <script src="https://polyfill.io/v3/polyfill.min.js?features=es6,Promise,fetch"></script>
  `;
  
  // Insert meta tags and polyfills after the <head> tag
  content = content.replace('<head>', `<head>${tvMeta}${polyfills}`);
  
  // Add fullscreen mode activation
  const fullscreenScript = `
    <script>
      window.addEventListener('load', function() {
        // Try to start fullscreen mode
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen();
        }
        
        // Prevent screen timeout
        if (navigator.wakeLock) {
          navigator.wakeLock.request('screen');
        }
      });
    </script>
  `;
  
  // Add the fullscreen script before </body>
  content = content.replace('</body>', `${fullscreenScript}</body>`);
  
  fs.writeFileSync(indexPath, content);
  console.log('✅ Modified index.html for TV browser compatibility');
}

// Main optimization process
async function optimize() {
  try {
    modifyIndexHtml();
    console.log('✅ TV browser optimization completed successfully');
  } catch (error) {
    console.error('❌ Error during optimization:', error);
    process.exit(1);
  }
}

optimize(); 