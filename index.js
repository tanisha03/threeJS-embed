/*
CONFIG for model
[
  {
    type: 'onLoad' | 'onSectionChange' | 'scroll',
    scrollValue: 70,
    pagePath: '/',
    animation: 'wave' | 'dance',
    text: '',
    time: '',
    cta: []
  }
]

CURRENT CONFIG:
[
  {
    type: 'onLoad',
    pagePath: '/',
    animation: 'wave',
    text: 'Welcome to Sulphur Labs',
    time: 5000,
    cta: []
  },
  {
    type: 'onLoad',
    pagePath: '/pricing.html',
    animation: 'wave',
    text: 'Offer available for you',
    time: 5000,
    cta: []
  },
  {
    type: 'onSectionChange',
    pagePath: '#section-3',
    animation: 'wave',
    text: 'Want to know more?',
    time: 5000,
    cta: []
  },
  {
    type: 'scroll',
    scrollValue: 70,
    pagePath: '/',
    animation: 'wave',
    text: 'Download this below',
    time: 5000,
    cta: []
  }
]
*/


const CONFIG = [
  {
    type: 'onLoad',
    pagePath: '/threeJS-embed',
    match: 'exact',
    animation: 'wave',
    text: 'Welcome to Sulphur Labs',
    time: 2000,
    cta: []
  },
  {
    type: 'onLoad',
    pagePath: '/pricing.html',
    match: 'includes',
    animation: 'swingdance',
    text: 'Offer available for you',
    time: 2000,
    cta: []
  },
  {
    type: 'onSectionChange',
    pagePath: 'milestone-4',
    animation: 'golf',
    text: 'Want to know more?',
    time: 2000,
    cta: []
  },
  {
    type: 'scroll',
    scrollValue: 70,
    pagePath: '/pricing.html',
    match: 'includes',
    animation: 'shrug',
    text: 'Download this below',
    time: 2000,
    cta: [{
      text: 'Download',
      onClick: () => window.open('file.docx')
    }]
  }
];


(function() {
// Set our main variables
let scene,  
  renderer,
  camera,
  model,                              // Our character
  neck,                               // Reference to the neck bone in the skeleton
  waist,                               // Reference to the waist bone in the skeleton
  possibleAnims,                      // Animations found in our file
  mixer,                              // THREE.js animations mixer
  idle,                               // Idle, the default state our character returns to
  clock = new THREE.Clock(),          // Used for anims, which run to a clock instead of frame rate 
  currentlyAnimating = false,         // Used to check whether characters neck is being used in another anim
  raycaster = new THREE.Raycaster();  // Used to detect the click on our character

init();

const isMobile = window.matchMedia("(max-width: 767px)").matches;

function init() {
  const isMobile = window.matchMedia("(max-width: 767px)").matches;
  const MODEL_PATH = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/stacy_lightweight.glb';

  const fallbackLoader = document.createElement('div');
  fallbackLoader.id = 'loader';
  document.body.appendChild(fallbackLoader);
  
  const style = document.createElement('style');
  style.type = 'text/css';
  const css = `
    #loader {
      width: 60px;
      height: 60px;
      position: fixed;
      bottom: 36px;
      right: 36px;
      --colorA: #b78eff;
      
      &::before,
      &::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border-top: 4px solid #fff;
          filter: 
              drop-shadow(0 0 2px var(--colorA))
              drop-shadow(0 0 5px var(--colorA))
              drop-shadow(0 0 10px var(--colorA))
              drop-shadow(0 0 20px var(--colorA));
          animation: rotate 3s infinite linear;
      }
      
      &::after {
          --colorA: #ffec41;
          animation-delay: -1.5s;
      }
  }

  @keyframes rotate {
      100% {
          transform: rotate(360deg);
      }
  }
  `;
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);

  const canvas = document.createElement('canvas');
  canvas.id = 'threejs-canvas';
  document.body.appendChild(canvas);
  canvas.style.position = 'fixed';
  canvas.style.bottom = '-40px';
  canvas.style.right = isMobile ? '-76px' : '-60px';
  canvas.style.height = isMobile ? '260px' : '280px';
  canvas.style.width = isMobile ? '260px' : '280px';
    
  scene = new THREE.Scene();
  scene.background = null;

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.shadowMap.enabled = true;
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);
  
    camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 30;
  camera.position.x = 0;
  camera.position.y = -3;
  
  let stacy_txt = new THREE.TextureLoader().load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/stacy.jpg');
  
  stacy_txt.flipY = false; // we flip the texture so that its the right way up
  
  const stacy_mtl = new THREE.MeshPhongMaterial({
    map: stacy_txt,
    color: 0xffffff,
    skinning: true
  });
  
  var loader = new THREE.GLTFLoader();
  
  loader.load(
  MODEL_PATH,
    function(gltf) {
      // A lot is going to happen here
      model = gltf.scene;
      let fileAnimations = gltf.animations;
      
      // First of all, we’re going to use the model’s traverse method to find all the meshs, and enabled the ability to cast and receive shadows. This is done like this. Again, this should go above scene.add(model): 
      model.traverse(o => {
        if(o.isMesh) {
          o.castShadow = true;
          o.receiveShadow = true;
          o.material = stacy_mtl;
        }
        // Reference the neck and waist bones
        if (o.isBone && o.name === 'mixamorigNeck') {
          neck = o;
        }
        if (o.isBone && o.name === 'mixamorigSpine') {
          waist = o;
        }
      });
      
      model.scale.set(7, 7, 7);
      model.position.y = -11;
      scene.add(model);
      mixer = new THREE.AnimationMixer(model);
      let clips = fileAnimations.filter(val => val.name !== 'idle');
      possibleAnims = clips.map(val => {
        let clip = THREE.AnimationClip.findByName(clips,val.name);
        clip.tracks.splice(3, 3);
        clip.tracks.splice(9, 3);
        clip = mixer.clipAction(clip);
        return {
          name: val.name,
          clip
        };
      });
      
      let idleAnim = THREE.AnimationClip.findByName(fileAnimations, 'idle');
      idleAnim.tracks.splice(3, 3);
      idleAnim.tracks.splice(9, 3);
      idle = mixer.clipAction(idleAnim);
      idle.play();
      fallbackLoader.remove();
      appendInput();
      triggerConfig();
      // waveOnLoad();
    },
    undefined, // We don't need this function
    function(error) {
      console.error(error);
    }
  );

  let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
  hemiLight.position.set(0, 50, 0);
  // Add hemisphere light to scene
  scene.add(hemiLight);
  
  let d = 8.25;
  let dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
  dirLight.position.set(-8, 12, 8);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
  dirLight.shadow.camera.near = 0.1;
  dirLight.shadow.camera.far = 1500;
  dirLight.shadow.camera.left = d * -1;
  dirLight.shadow.camera.right = d;
  dirLight.shadow.camera.top = d;
  dirLight.shadow.camera.bottom = d * -1;
  scene.add(dirLight);
  
  let floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1, 1);
  let floorMaterial = new THREE.ShadowMaterial({
    opacity: 0.5,  // Control how dark the shadow is
  });
  
  let floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -0.5 * Math.PI; // This is 90 degrees by the way
  floor.receiveShadow = true;
  floor.position.y = -11;
  scene.add(floor);
}
  
function update() {
    if (mixer) {
      mixer.update(clock.getDelta());
    }
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }
    renderer.render(scene, camera);
    requestAnimationFrame(update);
}
update();

function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let canvasPixelWidth = canvas.width / window.devicePixelRatio;
    let canvasPixelHeight = canvas.height / window.devicePixelRatio;
    
    const needResize = 
          canvasPixelWidth !== width || canvasPixelHeight !== height;
    if (needResize) {
      renderer.setSize(width, height, false)
    }
    return needResize;
}
     
// window.addEventListener('click', () => playOnClick());
// window.addEventListener('touchend', () => playOnClick());

// function playOnClick() {
//   console.log('~~~~ here', possibleAnims);
//   let anim = Math.floor(Math.random() * possibleAnims.length) + 0;
//   playModifierAnimation(idle, 0.25, possibleAnims[anim], 0.25);
// }

function triggerConfig() {
  CONFIG.map(config => {
    switch(config.type){
      case 'onLoad':
        const path = window.location.pathname;
        if((config.match === 'exact' ? path === config.pagePath : path.includes(config.pagePath))){
          const idx = possibleAnims.findIndex(animation => animation.name === config.animation);
          showTooltip(config.text, config.time, config.cta, () => playModifierAnimation(idle, 0.25, possibleAnims[idx], 0.25));
        }
        break;
      case 'onSectionChange':
        window.addEventListener('hashchange', function() {
          const path = window.location.hash;
          const input = document.getElementById('milestone')?.value;
          console.log(path, input, config.pagePath);
          if(path === `#${config.pagePath}`){
            const idx = possibleAnims.findIndex(animation => animation.name === config.animation);
            showTooltip(config.text, config.time, config.cta, () => playModifierAnimation(idle, 0.25, possibleAnims[idx], 0.25));
          }
        });
        break;
      case 'scroll':
        window.addEventListener('scroll', function() {
          const scrollTop = window.scrollY || window.pageYOffset;
          const docHeight = document.documentElement.scrollHeight;
          const winHeight = window.innerHeight;
          const scrollPercent = (scrollTop / (docHeight - winHeight)) * 100;
          const path = window.location.pathname;
        
          if((config.match === 'exact' ? path === config.pagePath : path.includes(config.pagePath)) && Number(scrollPercent)>Number(config.scrollValue)){
            const idx = possibleAnims.findIndex(animation => animation.name === config.animation);
            showTooltip(config.text, config.time, config.cta, () => playModifierAnimation(idle, 0.25, possibleAnims[idx], 0.25));
          }
        });
        break;
      default:
        break;
    }
  })
}

//CUSTOM
// function waveOnLoad() {
//   const path = window.location.pathname;
//   const input = document.getElementById('landing')?.value;
//   if(path.includes(input) && !currentlyAnimating){
//     const idx = possibleAnims.findIndex(animation => animation.name === "wave");
//     playModifierAnimation(idle, 0.25, possibleAnims[idx], 0.25);
//     showTooltip('Welcome to Sulphur Labs', 5000);
//   }
//   const inputPage = document.getElementById('pricing')?.value;
//   if(path.includes(inputPage) && !currentlyAnimating){
//     console.log(possibleAnims);
//     const idx = possibleAnims.findIndex(animation => animation.name === "swingdance");
//     playModifierAnimation(idle, 0.25, possibleAnims[idx], 0.25);
//     showTooltip('Offer unlocked for you', 5000);
//   }
// }

// window.addEventListener('hashchange', function() {
//   const path = window.location.hash;
//   const input = document.getElementById('milestone')?.value;
//   console.log(path, input, path === `#${input}`);
//   if(path === `#${input}` && !currentlyAnimating){
//     const idx = possibleAnims.findIndex(animation => animation.name === "golf");
//     playModifierAnimation(idle, 0.25, possibleAnims[idx], 0.25);
//     showTooltip('Checkout our offers!', 5000);
//   }
// });

// let isPlayed = false;

// window.addEventListener('scroll', function() {
//   const scrollTop = window.scrollY || window.pageYOffset;
//   const docHeight = document.documentElement.scrollHeight;
//   const winHeight = window.innerHeight;
//   const scrollPercent = (scrollTop / (docHeight - winHeight)) * 100;

//   const input = document.getElementById('scroll')?.value;
//   if(Number(scrollPercent)>Number(input) && !isPlayed && !currentlyAnimating){
//     isPlayed = true;
//     const idx = possibleAnims.findIndex(animation => animation.name === "shrug");
//     playModifierAnimation(idle, 0.25, possibleAnims[idx], 0.25);
//     showTooltip('Finding something?', 5000, [{
//       text: 'Download',
//       onClick: () => window.open('file.docx')
//     }]);
//   }
// });

function appendInput() {
  // Create an input element (rounded input box)
  const input = document.createElement('input');
  input.id = 'input';
  input.placeholder = 'Ask me anything';  // Set the input value to the message

  // Styling the input to make it look like a rounded box
  input.style.position = 'fixed';
  input.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
  input.style.color = '#000';
  input.style.padding = '8px 16px';
  input.style.borderRadius = '20px';  // Rounded corners
  input.style.fontSize = '14px';
  input.style.border = 'none';        // Remove default input border
  input.style.outline = 'none';       // Remove input focus outline
  input.style.display = 'none';
  input.style.whiteSpace = 'nowrap';
  input.style.zIndex = '10';

  // Positioning of the input box
  const canvas = document.getElementById('threejs-canvas');
  const canvasBounds = canvas.getBoundingClientRect();
  input.style.left = (canvasBounds.left - 60) + 'px';
  input.style.top = (canvasBounds.top + 160) + 'px';

  // Add the input element to the body
  document.body.appendChild(input);

  appendChatWindow();

  // Show the input box for the given time, then hide it
  if(currentlyAnimating){
    showInput();
  } else{
    hideInput();
  }
  input.addEventListener('focus', () => showChatWindow());
}

function showInput(){
  const input = document.getElementById('input');
  input.style.display = 'block';
}

function hideInput(){
  const input = document.getElementById('input');
  input.style.display = 'none';
}

function appendChatWindow() {
  // Create a container for the chat window
  const chatWindow = document.createElement('div');
  chatWindow.id = 'chatWindow';

  // Styling the chat window to look like a small chat box
  chatWindow.style.position = 'fixed';
  chatWindow.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
  chatWindow.style.color = '#fff';
  chatWindow.style.padding = '16px';
  chatWindow.style.borderRadius = '15px';  // Rounded corners
  chatWindow.style.fontSize = '14px';
  chatWindow.style.width = '250px';        // Small chat window width
  chatWindow.style.height = '300px';       // Fixed chat window height
  chatWindow.style.bottom = '20px';        // Position it at the bottom of the screen
  chatWindow.style.right = '20px';         // Align it to the bottom right corner
  chatWindow.style.zIndex = '1000';
  chatWindow.style.boxShadow = '0px 4px 10px rgba(0, 0, 0, 0.3)'; // Adding shadow for effect

  // Create a header for the chat window
  const chatHeader = document.createElement('div');
  chatHeader.style.backgroundColor = 'rgba(0, 0, 0, 0.25)';
  chatHeader.style.padding = '10px';
  chatHeader.style.borderRadius = '10px 10px 0 0';
  chatHeader.style.fontWeight = 'bold';
  chatHeader.style.textAlign = 'center';
  chatHeader.innerText = 'Chat Window';

  // Create a close button inside the chat header
  const closeButton = document.createElement('span');
  closeButton.innerHTML = '×';  // Close (X) symbol
  closeButton.style.cursor = 'pointer';
  closeButton.style.position = 'absolute';
  closeButton.style.right = '10px';
  closeButton.style.top = '5px';
  closeButton.style.fontSize = '18px';
  closeButton.style.color = '#fff';

  // Close chat window when close button is clicked
  closeButton.onclick = function() {
      chatWindow.style.display = 'none';
  };

  // Append the close button to the header
  chatHeader.appendChild(closeButton);

  // Create a message area for displaying chat content
  const messageArea = document.createElement('div');
  messageArea.style.backgroundColor = '#222';
  messageArea.style.padding = '10px';
  messageArea.style.height = 'calc(100% - 100px)';  // Leave room for input
  messageArea.style.overflowY = 'auto';
  messageArea.style.borderRadius = '0 0 10px 10px';
  messageArea.style.marginBottom = '10px';
  messageArea.innerHTML = `<p>hello</p>`;  // Display the initial message

  // Create an input for the chat window
  const inputBox = document.createElement('input');
  inputBox.type = 'text';
  inputBox.placeholder = 'Type a message...';
  inputBox.style.width = '100%';
  inputBox.style.padding = '10px';
  inputBox.style.borderRadius = '5px';
  inputBox.style.border = 'none';
  inputBox.style.outline = 'none';
  inputBox.style.backgroundColor = '#444';
  inputBox.style.color = '#fff';
  inputBox.style.boxSizing = 'border-box';

  // Append the header, message area, and input to the chat window
  chatWindow.appendChild(chatHeader);
  chatWindow.appendChild(messageArea);
  chatWindow.appendChild(inputBox);

  // Add the chat window to the body
  document.body.appendChild(chatWindow);

  chatWindow.style.display = 'none';
}

function showChatWindow(){
  const chat = document.getElementById('chatWindow');
  chat.style.display = 'block';
}
        
function showTooltip(message, time, ctaList, animationCB) {
    if(currentlyAnimating) return;
    animationCB();
    console.log('!!!!!!', message, currentlyAnimating);
    hideInput();
    const tooltipContainer = document.createElement('div');
    tooltipContainer.style.position = 'fixed';

    const tooltip = document.createElement('div');
    tooltip.id = 'tooltip';
    tooltip.innerHTML = message;
    tooltipContainer.appendChild(tooltip);

    tooltip.style.position = 'relative';
    tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.75)';
    tooltip.style.color = '#fff';
    tooltip.style.padding = '8px';
    tooltip.style.borderRadius = '5px';
    tooltip.style.fontSize = '14px';
    // tooltip.style.display = 'none';s
    tooltip.style.pointerEvents = 'none';
    tooltip.style.whiteSpace = 'nowrap';
    tooltip.style.zIndex = '10'
    // Arrow style for the tooltip using a pseudo element
    tooltip.style.setProperty('--tooltip-arrow-size', '5px');
    tooltip.style.setProperty('--tooltip-arrow-color', 'rgba(0, 0, 0, 0.75)')
    tooltip.style.margin = '4px 0'
    const arrow = document.createElement('div');
    arrow.style.position = 'absolute';
    arrow.style.width = '0';
    arrow.style.height = '0';
    arrow.style.borderLeft = '5px solid transparent';
    arrow.style.borderRight = '5px solid transparent';
    arrow.style.borderTop = '6px solid rgba(0, 0, 0, 0.75)';
    arrow.style.top = '50%';
    arrow.style.right = '-7px';
    arrow.style.transform = 'rotate(-90deg)';
    tooltip.appendChild(arrow);

    if(ctaList){
      const ctaContainer = document.createElement('div');
      ctaList.map(ctaItem => {
        const btn = document.createElement('button');
        btn.innerHTML = ctaItem.text;
        btn.style.borderRadius = '4px';
        btn.style.border = '1px solid black';
        btn.style.background = '#D9FBE1';
        btn.style.padding = '4px 8px';
        btn.addEventListener('click', ctaItem.onClick);
        ctaContainer.appendChild(btn);
      })
      tooltipContainer.appendChild(ctaContainer);
    }

    document.body.appendChild(tooltipContainer);
    const canvas = document.getElementById('threejs-canvas');
    const canvasBounds = canvas.getBoundingClientRect();
    tooltipContainer.style.left = (canvasBounds.left - 48) + 'px';
    tooltipContainer.style.top = (canvasBounds.top + 120) + 'px';
    tooltipContainer.style.display = 'block';

    setTimeout(() => {
        tooltipContainer.remove();
        currentlyAnimating = false;
        showInput();
    }, time);
}

function playModifierAnimation(from, fSpeed, finalAnim, tSpeed) {
  currentlyAnimating = true;
  const to = finalAnim.clip;
  to.setLoop(THREE.LoopOnce);
  to.reset();
  to.play();
  from.crossFadeTo(to, fSpeed, true);
  setTimeout(function() {
    from.enabled = true;
    to.crossFadeTo(from, tSpeed, true);
  }, to._clip.duration * 1000 -((tSpeed + fSpeed) * 1000));
}
 
if(!isMobile){
  document.addEventListener('mousemove', function(e) {
    var mousecoords = getMousePos(e);
    if(neck && waist && !currentlyAnimating) {
      moveJoint(mousecoords, neck, 50);
      moveJoint(mousecoords, waist, 30);
    }
  });
}

function getMousePos(e) {
    return { x: e.clientX, y: e.clientY};
}

function moveJoint(mouse, joint, degreeLimit) {
    let degrees = getMouseDegrees(mouse.x, mouse.y, degreeLimit);
    joint.rotation.y = THREE.Math.degToRad(degrees.x);
    joint.rotation.x = THREE.Math.degToRad(degrees.y); 
}

function getMouseDegrees(x, y, degreeLimit) {
  let dx = 0,
      dy = 0,
      xdiff,
      xPercentage,
      ydiff,
      yPercentage;

  let w = { x: window.innerWidth, y: window.innerHeight };

  // Left (Rotates neck left between 0 and -degreeLimit)

  const xRef = (w.x - 160);
  const yRef = (w.y - 190);
  
  if (x <= xRef) {
    // Get the difference between model and cursor position
    xdiff = xRef - x;  
    // Find the percentage of that difference (percentage toward edge of screen)
    xPercentage = (xdiff / xRef) * 100;
    // Convert that to a percentage of the maximum rotation we allow for the neck
    dx = ((degreeLimit * xPercentage) / 100) * -1; }
// Right (Rotates neck right between 0 and degreeLimit)
  if (x >= xRef) {
    xdiff = x - xRef;
    xPercentage = (xdiff / xRef) * 100;
    dx = (degreeLimit * xPercentage) / 100;
  }
  // Up (Rotates neck up between 0 and -degreeLimit)
  if (y <= yRef) {
    ydiff = yRef - y;
    yPercentage = (ydiff / yRef) * 100;
    // Note that I cut degreeLimit in half when she looks up
    dy = (((degreeLimit * 0.5) * yPercentage) / 100) * -1;
    }
  
  // Down (Rotates neck down between 0 and degreeLimit)
  if (y >= yRef) {
    ydiff = y - yRef;
    yPercentage = (ydiff / (yRef)) * 100;
    dy = (degreeLimit * yPercentage) / 100;
  }
  return { x: dx, y: dy };
}
  
})(); // Don't add anything below this line



