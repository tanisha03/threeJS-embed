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

function init() {
  
  const MODEL_PATH = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/stacy_lightweight.glb';
  
  const canvas = document.createElement('canvas');
  canvas.id = 'threejs-canvas';
  document.body.appendChild(canvas);
  canvas.style.position = 'absolute';
  canvas.style.bottom = '0';
  canvas.style.right = '0';
  canvas.style.height = '320px';
  canvas.style.width = '320px';
    
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

      waveOnLoad();
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
     
window.addEventListener('click', () => playOnClick());
window.addEventListener('touchend', () => playOnClick());

function playOnClick() {
  console.log('~~~~ here', possibleAnims);
  let anim = Math.floor(Math.random() * possibleAnims.length) + 0;
  playModifierAnimation(idle, 0.25, possibleAnims[anim], 0.25);
}

function waveOnLoad() {
  const idx = possibleAnims.findIndex(animation => animation.name === "wave");
  playModifierAnimation(idle, 0.25, possibleAnims[idx], 0.25);
  showTooltip();
}
        
function showTooltip() {
    const tooltip = document.createElement('div');
    tooltip.id = 'tooltip';
    tooltip.innerHTML = 'Welcome to Sulphur Labs';

    tooltip.style.position = 'absolute';
    tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.75)';
    tooltip.style.color = '#fff';
    tooltip.style.padding = '8px';
    tooltip.style.borderRadius = '5px';
    tooltip.style.fontSize = '14px';
    tooltip.style.display = 'none';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.whiteSpace = 'nowrap';
    tooltip.style.zIndex = '10'
    // Arrow style for the tooltip using a pseudo element
    tooltip.style.position = 'absolute';
    tooltip.style.setProperty('--tooltip-arrow-size', '5px');
    tooltip.style.setProperty('--tooltip-arrow-color', 'rgba(0, 0, 0, 0.75)')
    const arrow = document.createElement('div');
    arrow.style.position = 'absolute';
    arrow.style.width = '0';
    arrow.style.height = '0';
    arrow.style.borderLeft = '5px solid transparent';
    arrow.style.borderRight = '5px solid transparent';
    arrow.style.borderTop = '5px solid rgba(0, 0, 0, 0.75)';
    arrow.style.bottom = '-5px';
    arrow.style.left = '50%';
    arrow.style.transform = 'translateX(-50%)';
    tooltip.appendChild(arrow);

    document.body.appendChild(tooltip);
    const canvas = document.getElementById('threejs-canvas');
    const canvasBounds = canvas.getBoundingClientRect();
    console.log(canvasBounds);
    tooltip.style.left = (canvasBounds.left + 80) + 'px';
    tooltip.style.top = (canvasBounds.top + 56) + 'px';
    tooltip.style.display = 'block';
    setTimeout(() => {
        tooltip.style.display = 'none';
    }, 5000);
}

function playModifierAnimation(from, fSpeed, finalAnim, tSpeed) {
  const to = finalAnim.clip;
  to.setLoop(THREE.LoopOnce);
  to.reset();
  to.play();
  from.crossFadeTo(to, fSpeed, true);
  setTimeout(function() {
    from.enabled = true;
    to.crossFadeTo(from, tSpeed, true);
    currentlyAnimating = false;
  }, to._clip.duration * 1000 -((tSpeed + fSpeed) * 1000));
}
  
document.addEventListener('mousemove', function(e) {
    var mousecoords = getMousePos(e);
    if(neck && waist) {
      moveJoint(mousecoords, neck, 50);
      moveJoint(mousecoords, waist, 30);
    }
});

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
  
   // 1. If cursor is in the left half of screen
  if (x <= w.x / 2) {
    // 2. Get the difference between middle of screen and cursor position
    xdiff = w.x / 2 - x;  
    // 3. Find the percentage of that difference (percentage toward edge of screen)
    xPercentage = (xdiff / (w.x / 2)) * 100;
    // 4. Convert that to a percentage of the maximum rotation we allow for the neck
    dx = ((degreeLimit * xPercentage) / 100) * -1; }
// Right (Rotates neck right between 0 and degreeLimit)
  if (x >= w.x / 2) {
    xdiff = x - w.x / 2;
    xPercentage = (xdiff / (w.x / 2)) * 100;
    dx = (degreeLimit * xPercentage) / 100;
  }
  // Up (Rotates neck up between 0 and -degreeLimit)
  if (y <= w.y / 2) {
    ydiff = w.y / 2 - y;
    yPercentage = (ydiff / (w.y / 2)) * 100;
    // Note that I cut degreeLimit in half when she looks up
    dy = (((degreeLimit * 0.5) * yPercentage) / 100) * -1;
    }
  
  // Down (Rotates neck down between 0 and degreeLimit)
  if (y >= w.y / 2) {
    ydiff = y - w.y / 2;
    yPercentage = (ydiff / (w.y / 2)) * 100;
    dy = (degreeLimit * yPercentage) / 100;
  }
  return { x: dx, y: dy };
}
  
})(); // Don't add anything below this line



