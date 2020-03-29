var capturer = new CCapture({
  framerate: 60,
  format: "webm",
  verbose: true
});

function download(canvas, filename) {
  if (!canvas) {
    return;
  }
  /// create an "off-screen" anchor tag
  var lnk = document.createElement("a"),
    e;

  /// the key here is to set the download attribute of the a tag
  lnk.download = filename;

  /// convert canvas content to data-uri for link. When download
  /// attribute is set the content pointed to by link will be
  /// pushed as "download" in HTML5 capable browsers
  lnk.href = canvas.toDataURL("image/png;base64");

  /// create a "fake" click-event to trigger the download
  if (document.createEvent) {
    e = document.createEvent("MouseEvents");
    e.initMouseEvent(
      "click",
      true,
      true,
      window,
      0,
      0,
      0,
      0,
      0,
      false,
      false,
      false,
      false,
      0,
      null
    );

    lnk.dispatchEvent(e);
  } else if (lnk.fireEvent) {
    lnk.fireEvent("onclick");
  }
}

var container;
var camera, scene, renderer;
var uniforms;

init();
animate();

function init() {
  container = document.getElementById("container");

  camera = new THREE.Camera();
  camera.position.z = 1;

  scene = new THREE.Scene();

  var geometry = new THREE.PlaneBufferGeometry(2, 2);

  uniforms = {
    u_time: { type: "f", value: 1.0 },
    u_resolution: { type: "v2", value: new THREE.Vector2() },
    u_mouse: { type: "v2", value: new THREE.Vector2() },
    u_red: { type: "f", value: 1 },
    u_blue: { type: "f", value: 0.5 },
    u_green: { type: "f", value: 0 },
    u_speed: { type: "i", value: 0.1 },
    u_octaves: { type: "f", value: 10 },
    u_amplitude: { type: "f", value: 0.5 },
    u_frequency: { type: "f", value: 1 },
    u_scale: { type: "f", value: 0.0025 }
  };

  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: document.getElementById("vertexShader").textContent,
    fragmentShader: document.getElementById("fragmentShader").textContent
  });

  var mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  renderer = new THREE.WebGLRenderer({ preserveDrawingBuffer: true });
  renderer.setPixelRatio(window.devicePixelRatio);

  container.appendChild(renderer.domElement);

  onWindowResize();
  let toggle = false;

  document.querySelector("#controls").addEventListener("click", () => {
    if (!toggle) {
      document.querySelector(".controls").classList.add("show");
    } else {
      document.querySelector(".controls").classList.remove("show");
    }
    toggle = !toggle;
  });
  window.addEventListener("resize", onWindowResize, false);
  function update() {
    document.querySelector("a").href = renderer.domElement.toDataURL(
      "image/png"
    );
  }

  function handleChange(e) {
    const val = parseFloat(e.target.value);
    document.querySelector(
      "#" + e.target.getAttribute("data-val")
    ).innerHTML = val;
    if (e.target.getAttribute("data-val") === "u_speed") {
      uniforms[e.target.getAttribute("data-val")].value = val;
    } else {
      var tween = new TWEEN.Tween(uniforms[e.target.getAttribute("data-val")])
        .to({ value: val }, 1000)
        .easing(TWEEN.Easing.Cubic.Out)

        .start();
    }
  }

  const n = document.querySelectorAll("input");
  [].forEach.call(n, function(node) {
    node.addEventListener("change", handleChange);
  });
  document.querySelector("#download").addEventListener("click", () => {
    download(document.querySelector("canvas"), "fbm");
  });
}

function onWindowResize(event) {
  renderer.setSize(window.innerWidth, window.innerHeight);
  uniforms.u_resolution.value.x = renderer.domElement.width;
  uniforms.u_resolution.value.y = renderer.domElement.height;
}

function animate(time) {
  requestAnimationFrame(animate);
  render();
  TWEEN.update(time);
  if (document.querySelector("canvas"))
    capturer.capture(document.querySelector("canvas"));
}

function render() {
  uniforms.u_time.value += 0.05;
  renderer.render(scene, camera);
}

let rec = false;
function key(e) {
  if (e.keyCode === 32) {
    if (rec) {
      rec = false;
      capturer.stop();
      capturer.save();
    } else {
      rec = true;
      capturer.start();
    }
  }
}

document.addEventListener("keydown", key);
