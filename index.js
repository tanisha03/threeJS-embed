// const CONFIG = [
//   {
//     id: 'first-land',
//     type: 'onFirstLand',
//     animation: 'wave',
//     hasClose: false,
//     text: 'So excited to have you here! 😄 ',
//     time: 2000,
//     onEnd: 'introduction',
//     cta: [],
//   },
//   {
//     id: 'introduction',
//     hasClose: false,
//     text: 'I\'m Frexy, your coolest assistant 😎. Feel free to ask me anything! 💬',
//     time: 3000,
//     cta: [],
//   },
//   {
//     id: 'inactivity',
//     type: 'inActive',
//     inActiveTime: 25000,
//     hasClose: false,
//     text: 'Hey! You there? 👀👋',
//     animation: 'wave',
//     time: 3000,
//     cta: [],
//   },
//   {
//     id: 'test-1',
//     type: 'scroll',
//     scrollValue: 70,
//     pagePath: '/',
//     match: 'equals',
//     animation: 'shrug',
//     hasClose: true,
//     time: 15000,
//     text: 'Did you know the chatbot market is projected to hit $102.26 billion?',
//     cta: [{
//       text: 'Read More',
//       bg: '#1F8527',
//       color: 'white',
//       onClick: () => {
//         window.open('file.docx');
//       }
//     }]
//   },
//   {
//     id: 'test-2',
//     type: 'scroll',
//     scrollValue: 50,
//     pagePath: '/customers',
//     match: 'includes',
//     animation: 'shrug',
//     hasClose: true,
//     time: 15000,
//     text: 'I boosted site engagement by 200% for CompanyX',
//     cta: [{
//       text: 'See How',
//       bg: '#1F8527',
//       color: 'white',
//       onClick: () => {
//         window.open('file.docx');
//       }
//     }]
//   },
//   {
//     id: 'test-3',
//     type: 'popstate',
//     pagePath: '/pricing',
//     match: 'includes',
//     animation: 'shrug',
//     hasClose: true,
//     delay: 10000,
//     time: 15000,
//     text: 'Hey! I\'ve got a special discount 🎉 just for you! Wanna check it out?',
//     cta: [{
//       text: 'Yes',
//       bg: '#1F8527',
//       color: 'white',
//       nextInteraction: 'offer-1'
//     }, {
//       text: 'No',
//       bg: '#FF0000',
//       color: 'white',
//       alertText: 'No worries! 😎 Maybe next time. We\'ll save the good stuff for you!'
//     }]
//   },
//   {
//     id: 'test-4',
//     type: 'popstate',
//     pagePath: '/demo',
//     match: 'includes',
//     animation: 'shrug',
//     hasClose: true,
//     time: 15000,
//     text: 'Awesome! 🎉 Need help scheduling a call? I can set it up for you! 📅',
//     cta: [{
//       text: 'Yes',
//       bg: '#1F8527',
//       color: 'white',
//       nextInteraction: 'openChatbot'
//     }, {
//       text: 'No',
//       bg: '#FF0000',
//       color: 'white',
//       alertText: 'No worries! 😎'
//     }],
//     onClickClose: {
//       alertText: 'Wait! You didn\'t book the call? 🤔'
//     }
//   },
//   {
//     id: 'offer-1',
//     hasClose: true,
//     timerCountdown: 120,
//     innerHTML: `<img src="https://cdn.prod.website-files.com/61813b089ddadb7ca3b7468d/6391c522fe77f1de7bad14a2_pop-up-example-6.jpg" style="width:160px;height:100px;border-radius:10px"/>`,
//     cta: []
//   },
// ];


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
  raycaster = new THREE.Raycaster();  // Used to detect the click on our character

  init();

  const isMobile = window.matchMedia("(max-width: 767px)").matches;

  let CONFIG = [];

  function init() {
    fetchConfig();
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const MODEL_PATH = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/stacy_lightweight.glb';

    const fallbackLoader = document.createElement('div');
    fallbackLoader.id = 'loader';

    if(document.body){
      document.body.appendChild(fallbackLoader);
    } else{
      document.addEventListener('DOMContentLoaded', function() {
        document.body.appendChild(fallbackLoader);
      });
    }
    
    const style = document.createElement('style');
    style.type = 'text/css';
    const css = `
      #loader {
        width: 60px;
        height: 60px;
        position: fixed;
        bottom: 36px;
        right: 36px;
        --colorA: #BE0EFF;
        
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
            --colorA: #6622FF;
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

  async function fetchConfig() {
    try {
      const response = await fetch('https://node-service-lovat.vercel.app/api/get-interaction', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        // throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const config = await response.json();
      CONFIG =  config.data;
      triggerConfig();
    } catch (error) {
      console.error('Error fetching config:', error);
    }
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

  let isFirstLandTriggered = false;
  let currentlyAnimating = false;

  //path change event

  function dispatchPathChangeEvent() {
    const pathChangeEvent = new Event('pathChange');
    window.dispatchEvent(pathChangeEvent);
  }

  let previousPathname = window.location.href;

  const observer = new MutationObserver(() => {
    if (window.location.href !== previousPathname) {
      previousPathname = window.location.href;
      const tooltipContainer = document.getElementById('tooltipContainer');
      if(tooltipContainer){
        tooltipContainer.remove();
      }
      currentlyAnimating = false;
      showInput();
      dispatchPathChangeEvent();
    }
  });

  // Observe the document body for changes
  observer.observe(document.body, { childList: true, subtree: true });

  const scrollState = {};

  function triggerConfig() {
    CONFIG.map(config => {
      let isTrafficSourceValid = true;
      let isLocationValid = true;
      if(config?.traffic_source?.length){
        if(!config.traffic_source.includes('any')){
          const path = window.location.href;
          const referrer = document.referrer;
          isTrafficSourceValid = false;
          config.traffic_source.map(loc => {
            switch(loc){
              case 'direct':
                if(referrer==='') isTrafficSourceValid = true;
                break;
              case 'google':
                if(referrer==='https://www.google.com/') isTrafficSourceValid = true;
                break;
              case 'yahoo':
                if(referrer==='https://www.yahoo.com/') isTrafficSourceValid = true;
                break;
              case 'bing':
                if(referrer==='https://www.bing.com/') isTrafficSourceValid = true;
                break;
              case 'youtube':
                if(referrer==='https://www.youtube.com/') isTrafficSourceValid = true;
                break;
              case 'reddit':
                if(referrer==='https://www.reddit.com/') isTrafficSourceValid = true;
                break;
              case 'paid_google':
                if(path.includes('gclid')) isTrafficSourceValid = true;
                break;
              case 'paid_bing':
                if(path.includes('msclkid')) isTrafficSourceValid = true;
                break;
              case 'paid_linkedin':
                if(path.includes('li_fat_id')) isTrafficSourceValid = true;
                break;
              case 'paid_meta':
                if(path.includes('fbclid')) isTrafficSourceValid = true;
                break;
              case 'paid_youtube':
                if(path.includes('wbraid')) isTrafficSourceValid = true;
                break;
              case 'paid_reddit':
                if(path.includes('cid')) isTrafficSourceValid = true;
                break;
            }
          })
        }
      }
      if(config?.location?.length){
        isLocationValid=false;
        const currTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        config?.location.map(loc => {
          if(currTimezone === loc) isLocationValid = true;
        })
      }
      console.log(isTrafficSourceValid, isLocationValid);
      if(!(isTrafficSourceValid && isLocationValid)) return;
      switch(config.type){
        case 'onFirstLand':
          if(!isFirstLandTriggered){
            showUIAnimation(config);
          }
          break;
        case 'inActive':
          let timer;
          timer = setTimeout(() => showUIAnimation(config), config.inActiveTime);
          window.addEventListener('click', () => {
            if(timer){
              clearTimeout(timer);
              timer = setTimeout(() => showUIAnimation(config), config.inActiveTime);
            }
          });
          window.addEventListener('scroll', () => {
            if(timer){
              clearTimeout(timer);
              timer = setTimeout(() => showUIAnimation(config), config.inActiveTime);
            }
          });
          document.addEventListener('mousemove', () => {
            if(timer){
              clearTimeout(timer);
              timer = setTimeout(() => showUIAnimation(config), config.inActiveTime);
            }
          });
          break;
        case 'scroll':
          window.addEventListener('scroll', function() {
            const scrollTop = window.scrollY || window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight;
            const winHeight = window.innerHeight;
            const scrollPercent = (scrollTop / (docHeight - winHeight)) * 100;
            const path = window.location.href;

            if((config.match === 'equals' ? path === config.pagePath : path.includes(config.pagePath)) && Number(scrollPercent)>Number(config.scrollValue)){
              if(scrollState[config.id]) return;
              scrollState[config.id] = true;
              showUIAnimation(config);
            }
          });
          break;
        case 'popstate':
          const path = window.location.href;
          if((config.match === 'equals' ? path === config.pagePath : path.includes(config.pagePath))){
            showUIAnimation(config);
          }
          window.addEventListener('pathChange', () => {
            const pagePath = window.location.href;
            if((config.match === 'equals' ? pagePath === config.pagePath : pagePath.includes(config.pagePath))){
              if(config.delay){
                setTimeout(() => showUIAnimation(config), config.delay);
              } else{
                showUIAnimation(config);
              }
            }
          })
          break;
      }
    })
  }

  function showUIAnimation(config) {
    if(currentlyAnimating) return;
    resetHead();
    let animationIdx = -1;
    if(config.animation){
      animationIdx = possibleAnims.findIndex(animation => animation.name === config.animation);
    }
    const type = config.imageUrl ? 'overlay' : 'tooltip';
    hideInput();
    if(animationIdx>=0){
      playModifierAnimation(idle, 0.25, possibleAnims[animationIdx], 0.25)
    }
    if(type === 'tooltip'){
      showTooltip(config.text, config.tooltip_bg, config.tooltip_color, config.time, config.cta, config.hasClose, config.onClickClose, config.timerCountdown, () => {
        if(config.onEnd) showUIAnimation(CONFIG.filter(c => c.id === config.onEnd)[0])
        else showInput();
      });
    } else {
      let innerHTML = `<></>`;
      if(config.orientation === 'landscape'){
        innerHTML = `
          <div style="display:flex;flex-direction:row;align-items:center;background:${config.tooltip_bg};padding:8px;border-radius:12px;max-width:280px">
            <img src=${config.imageUrl} style="height:90px;border-radius:10px;margin-right:12px"/>
            <div id="text-area">
              <div style="color:${config.tooltip_color}">${config.text}</div>
            </div>
          </div>
        `;
      } else {
        innerHTML = `
          <div style="display:flex;flex-direction:row;align-items:center;background:${config.tooltip_bg};padding:8px;border-radius:12px;max-width:280px">
            <img src=${config.imageUrl} style="height:124px;border-radius:10px;margin-right:12px"/>
            <div id="text-area">
              <div style="color:${config.tooltip_color}">${config.text}</div>
            </div>
          </div>
        `;
      }
      showOverlay(innerHTML, config.time, config.cta, config.hasClose, config.onClickClose, config.timerCountdown, () => {
        if(config.onEnd) showUIAnimation(CONFIG.filter(c => c.id === config.onEnd)[0])
        else showInput();
      });
    }
  }

  function showTooltip(text, bg, color, time, ctaList, hasClose, onClickClose, timerCountdown, animationCB) {
    currentlyAnimating = true;
    hideInput();
    const tooltipContainer = document.createElement('div');
    tooltipContainer.id = 'tooltipContainer';
    tooltipContainer.style.position = 'fixed';
    tooltipContainer.style.maxWidth = '280px';

    const tooltip = document.createElement('div');
    tooltip.id = 'tooltip';

    const textArea = document.createElement('p');
    textArea.innerHTML = text;
    textArea.style.margin = 0;
    textArea.style.overflowWrap = 'break-word';
    tooltip.appendChild(textArea);
    tooltipContainer.appendChild(tooltip);

    tooltip.style.position = 'relative';
    tooltip.style.backgroundColor = bg;
    tooltip.style.color = color;
    tooltip.style.padding = '10px 14px';
    tooltip.style.borderRadius = '16px';
    tooltip.style.fontSize = '16px';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.whiteSpace = 'wrap';
    tooltip.style.zIndex = '10'
    tooltip.style.boxShadow = '0 0 4px black';
    // Arrow style for the tooltip using a pseudo element
    tooltip.style.setProperty('--tooltip-arrow-size', '5px');
    tooltip.style.setProperty('--tooltip-arrow-color', bg)
    tooltip.style.margin = '8px 0'
    const arrow = document.createElement('div');
    arrow.style.position = 'absolute';
    arrow.style.width = '0';
    arrow.style.height = '0';
    arrow.style.borderLeft = '8px solid transparent';
    arrow.style.borderRight = '8px solid transparent';
    arrow.style.borderTop = `8px solid ${bg}`;
    arrow.style.top = '40%';
    arrow.style.right = '-12px';
    arrow.style.transform = 'rotate(-90deg)';
    tooltip.appendChild(arrow);

    function closeUI(){
      tooltipContainer.remove();
      currentlyAnimating = false;
      animationCB();
    }

    if(hasClose){
      const closeBtn = document.createElement('button');
      closeBtn.style.background = 'white';
      closeBtn.style.padding = '2px';
      closeBtn.style.border = '1px solid black';
      closeBtn.style.position = 'absolute';
      closeBtn.style.top = '2px';
      closeBtn.style.right = '-4px';
      closeBtn.style.width = '16px';
      closeBtn.style.height = '16px';
      closeBtn.style.fontSize = '10px';
      closeBtn.style.borderRadius = '50%';
      closeBtn.style.zIndex = '99';
      closeBtn.style.cursor = 'pointer';
      closeBtn.innerHTML = 'X';
      closeBtn.addEventListener('click', () => {
        if(onClickClose){
          if(onClickClose.alertText){
            closeUI();
            showUIAnimation({
              hasClose: false,
              text: onClickClose.alertText,
              time: 2000,
              cta: [],
            })
            return;
          }
        }
        closeUI();
      });
      tooltipContainer.appendChild(closeBtn);
    }

    if(timerCountdown){
      const timer = document.createElement('div');
      timer.style.textAlign = 'center';
      timer.style.padding = '2px 6px';
      timer.style.color = '#ff0000';  
      timer.style.fontSize = '12px';
      timer.style.fontWeight = 'bold';
      timer.style.position = 'absolute';
      timer.style.top = '-8px';
      timer.style.left = '-10px';
      timer.style.borderRadius = '8px';
      timer.style.zIndex = '99';
      timer.style.background = 'white';
      // timer.style.border = '1px solid black';

      function formatTime(seconds) {
        let minutes = Math.floor(seconds / 60);  // Get the minutes
        let secs = seconds % 60;  // Get the remaining seconds
        return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;  // Format as MM:SS
      }
    
      function updateTimer() {
          if (timerCountdown > 0) {
              timer.innerText = `${formatTime(timerCountdown)}`;  // Display in MM:SS format
              timerCountdown--;
          } else {
            tooltipContainer.remove();
            currentlyAnimating = false;
            showInput();
          }
      }
    
      // Update the timer every second
      setInterval(updateTimer, 1000);
      tooltipContainer.appendChild(timer);
    } 

    if(ctaList){
      const ctaContainer = document.createElement('div');
      ctaList.map(ctaItem => {
        const btn = document.createElement('button');
        btn.innerHTML = ctaItem.text;
        btn.style.borderRadius = '12px';
        btn.style.border = '0';
        btn.style.fontSize = '14px';
        btn.style.background = ctaItem.bg;
        btn.style.color = ctaItem.color;
        btn.style.padding = '6px 10px';
        btn.style.marginRight = '6px';
        btn.style.cursor = 'pointer';
        btn.addEventListener('click', () => {
          if(ctaItem.onClick){
            ctaItem.onClick();
            closeUI();
          } else if(ctaItem.alertText){
            closeUI();
            showUIAnimation({
              hasClose: false,
              text: ctaItem.alertText,
              time: 2000,
              cta: [],
            })
          } else if(ctaItem.nextInteraction){
            closeUI();
            if(ctaItem.nextInteraction === 'openChatbot'){
              showChatWindow();
            }
            else showUIAnimation(CONFIG.filter(c => c.id === ctaItem.nextInteraction)[0]);
          }
        });
        ctaContainer.appendChild(btn);
      })
      tooltipContainer.appendChild(ctaContainer);
    }

    document.body.appendChild(tooltipContainer);
    tooltipContainer.style.right  = isMobile ? '90px' : '120px';
    tooltipContainer.style.bottom = isMobile ? '64px' : '80px';
    tooltipContainer.style.display = 'block';

    if(time){
      setTimeout(() => {
        closeUI();
      }, time*1000);
    }
  }

  function showOverlay(innerHTML, time, ctaList, hasClose,onClickClose, timerCountdown, animationCB) {
    currentlyAnimating = true;
    hideInput();
    const tooltipContainer = document.createElement('div');
    tooltipContainer.id = 'tooltipContainer';
    tooltipContainer.style.position = 'fixed';
    tooltipContainer.innerHTML = innerHTML;

    function closeUI(){
      tooltipContainer.remove();
      currentlyAnimating = false;
      animationCB();
    }

    if(hasClose){
      const closeBtn = document.createElement('button');
      closeBtn.style.background = 'white';
      closeBtn.style.padding = '2px';
      closeBtn.style.border = '1px solid black';
      closeBtn.style.position = 'absolute';
      closeBtn.style.top = '-4px';
      closeBtn.style.right = '-4px';
      closeBtn.style.width = '16px';
      closeBtn.style.height = '16px';
      closeBtn.style.fontSize = '10px';
      closeBtn.style.borderRadius = '50%';
      closeBtn.style.zIndex = '99';
      closeBtn.innerHTML = 'X';
      closeBtn.style.cursor = 'pointer';
      closeBtn.addEventListener('click', () => {
        if(onClickClose){
          if(onClickClose.alertText){
            closeUI();
            showUIAnimation({
              hasClose: false,
              text: onClickClose.alertText,
              time: 2000,
              cta: [],
            })
            return;
          }
        }
        closeUI();
      });
      tooltipContainer.appendChild(closeBtn);
    }

    if(timerCountdown){
      const timer = document.createElement('div');
      timer.style.textAlign = 'center';
      timer.style.padding = '2px 6px';
      timer.style.color = '#ff0000';  
      timer.style.fontSize = '12px';
      timer.style.fontWeight = 'bold';
      timer.style.position = 'absolute';
      timer.style.top = '-8px';
      timer.style.left = '-10px';
      timer.style.borderRadius = '8px';
      timer.style.zIndex = '99';
      timer.style.background = 'white';

      function formatTime(seconds) {
        let minutes = Math.floor(seconds / 60);  // Get the minutes
        let secs = seconds % 60;  // Get the remaining seconds
        return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;  // Format as MM:SS
      }

      function updateTimer() {
          if (timerCountdown > 0) {
              timer.innerText = `${formatTime(timerCountdown)}`;  // Display in MM:SS format
              timerCountdown--;
          } else {
            tooltipContainer.remove();
            currentlyAnimating = false;
            showInput();
          }
      }

      // Update the timer every second
      setInterval(updateTimer, 1000);
      tooltipContainer.appendChild(timer);
    }  

    if(ctaList){
      const ctaContainer = document.createElement('div');
      ctaList.map(ctaItem => {
        const btn = document.createElement('button');
        btn.innerHTML = ctaItem.text;
        btn.style.borderRadius = '4px';
        btn.style.border = 0;
        btn.style.background = ctaItem?.bg;
        btn.style.color = ctaItem?.color;
        btn.style.padding = '4px 8px';
        btn.style.marginTop = '4px';
        btn.style.cursor = 'pointer';
        btn.addEventListener('click', () => {
          if(ctaItem.onClick){
            ctaItem.onClick();
            closeUI();
          } else if(ctaItem.alertText){
            closeUI();
            showUIAnimation({
              hasClose: false,
              text: ctaItem.alertText,
              time: 2000,
              cta: [],
            })
          } else if(ctaItem.nextInteraction){
            closeUI();
            if(ctaItem.nextInteraction === 'openChatbot'){
              showChatWindow();
            }
            else showUIAnimation(CONFIG.filter(c => c.id === ctaItem.nextInteraction)[0]);
          }
        });
        ctaContainer.appendChild(btn);
      })
      const container = tooltipContainer.querySelector('#text-area');
      container.appendChild(ctaContainer);
    }

    document.body.appendChild(tooltipContainer);
    const canvas = document.getElementById('threejs-canvas');
    const canvasBounds = canvas.getBoundingClientRect();
    tooltipContainer.style.right  = isMobile ? '90px' : '120px';
    tooltipContainer.style.top = (canvasBounds.top + 88) + 'px';
    tooltipContainer.style.display = 'block';

    if(time){
      setTimeout(() => {
        closeUI();
      }, time*1000);
    }
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
    }, to._clip.duration * 1000 -((tSpeed + fSpeed) * 1000));
  }

  function appendInput() {
    // Create an input element (rounded input box)
    const input = document.createElement('input');
    input.id = 'input';
    input.placeholder = 'Ask me anything';  // Set the input value to the message

    // Styling the input to make it look like a rounded box
    input.style.position = 'fixed';
    input.style.border = '1px solid black';
    input.style.color = '#000';
    input.style.padding = '8px 16px';
    input.style.borderRadius = '20px';  // Rounded corners
    input.style.fontSize = '14px';
    input.style.outline = 'none';       // Remove input focus outline
    input.style.display = 'none';
    input.style.whiteSpace = 'wrap';
    input.style.zIndex = '10';

    // Positioning of the input box
    input.style.bottom = isMobile ? '24px' : '40px';
    input.style.right = isMobile ? '60px' : '80px';

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
    if(currentlyAnimating) return;
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
    chatWindow.style.border = '1px solid white';
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
  
  if(!isMobile){
    let timer = setTimeout(() => resetHead());
    document.addEventListener('mousemove', function(e) {
      if(currentlyAnimating) return;
      if(timer){
        clearTimeout(timer);
        timer = setTimeout(() => resetHead(), 4000);
      }
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

  function resetHead() {
    let w = { x: window.innerWidth, y: window.innerHeight };

    const xRef = (w.x - 160);
    const yRef = (w.y - 190);

    moveJoint({x: xRef, y: yRef}, neck, 50);
    moveJoint({x: xRef, y: yRef}, waist, 30);
  }

  function moveJoint(mouse, joint, degreeLimit) {
      let degrees = getMouseDegrees(mouse.x, mouse.y, degreeLimit);
      if(joint){
        joint.rotation.y = THREE.Math.degToRad(degrees.x);
        joint.rotation.x = THREE.Math.degToRad(degrees.y); 
      }
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



