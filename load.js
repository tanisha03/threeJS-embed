function loadScript(url, callback) {
  let script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = url;

  // Execute the callback function after the script is loaded
  script.onload = callback;

  document.head.appendChild(script);
}

// Load the first script
loadScript('https://cdn.jsdelivr.net/npm/three@0.139.0/build/three.min.js', function() {
  
  // Load the second script after the first one has loaded
  loadScript('https://cdn.jsdelivr.net/npm/three@0.139.0/examples/js/loaders/GLTFLoader.js', function() {
    
    // Load your main script after both scripts are loaded
    loadScript('https://cdn.jsdelivr.net/gh/tanisha03/threeJS-embed@latest/index.js', function() {
      console.log('All scripts loaded!');
    });

  });

});
