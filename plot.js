import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export const TORUS_RADIUS = 10;
export const TUBE_RADIUS = 3;

export const loadDataInScene = (scene, data) => {
  for (const node of data) {
    addNode(scene, node);
  }
};

export const addNode = (scene, [thetas, r, size, color, opacity, text]) => {
  let nodeMesh = new THREE.Mesh(
    new THREE.SphereGeometry(size, 32, 32),
    new THREE.MeshLambertMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: opacity,
    })
  );

  nodeMesh.position.x =
    (TORUS_RADIUS + TUBE_RADIUS * Math.cos(thetas[0])) * Math.cos(thetas[1]);
  nodeMesh.position.y =
    (TORUS_RADIUS + TUBE_RADIUS * Math.cos(thetas[0])) * Math.sin(thetas[1]);
  nodeMesh.position.z = TUBE_RADIUS * Math.sin(thetas[0]);
  nodeMesh.text = text;

  scene.add(nodeMesh);
};

export const createCircle = (r = 5, numSegments = 32) => {
  let points = [...Array(numSegments).keys()].map((i) => {
    const theta = (i / numSegments) * Math.PI * 2;
    return new THREE.Vector3(Math.cos(theta) * r, Math.sin(theta) * r, 0);
  });
  const material = new THREE.LineBasicMaterial({
    color: new THREE.Color(0.4, 0.4, 0.4),
  });
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const circle = new THREE.Line(geometry, material);
  return circle;
};

export const createTorus = (TORUS_RADIUS, TUBE_RADIUS, numSegments = 25) => {
  const geometry = new THREE.TorusGeometry(
    TORUS_RADIUS,
    TUBE_RADIUS,
    numSegments,
    numSegments
  );
  const wireframe = new THREE.WireframeGeometry(geometry);
  const mat = new THREE.LineBasicMaterial({ color: 0x000 });

  const torus = new THREE.LineSegments(wireframe, mat);
  torus.material.depthTest = false;
  torus.material.opacity = 0.25;
  torus.material.transparent = true;
  return torus;
};

export const createPlotBase = (scene, rTicks = [1, 2, 6, 9]) => {
  rTicks.map((r) => {
    const circle = createCircle(r, 32);
    scene.add(circle);
  });
  const torus = createTorus(TORUS_RADIUS, TUBE_RADIUS, 25);
  scene.add(torus);
};

export const initScene = (antialias = true, whiteBackground = true) => {
  let obj = {};
  obj.scene = new THREE.Scene();

  obj.camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  obj.camera.position.z = 5;
  obj.camera.position.set(0, -20, 10);

  obj.renderer = new THREE.WebGLRenderer({
    antialias: antialias,
    preserveDrawingBuffer: true,
  });
  obj.renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(obj.renderer.domElement);
  if (whiteBackground) obj.renderer.setClearColor(0xffffff);

  obj.controls = new OrbitControls(obj.camera, obj.renderer.domElement);
  obj.controls.update();

  return obj;
};

export const addLights = (scene) => {
  const ambientLight = new THREE.AmbientLight();
  const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
  directionalLight.position.set(0, -10, 10);
  directionalLight.target.position.set(0, 0, 0);
  scene.add(directionalLight);
  scene.add(ambientLight);
};

export class Animator {
  constructor(htmlDOMtooltip = "tooltipNode") {
    this.tooltipNode = document.getElementById(htmlDOMtooltip);
    this.intersected = null;
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.onPointerMove = this.onPointerMove.bind(this);
    this.animate = this.animate.bind(this);
    this.coord = { x: 0, y: 0 }; //screen coordinates
    document.addEventListener("mousemove", this.onPointerMove);
  }
  showToolTip(txt) {
    this.tooltipNode.style.left = this.coord.x;
    this.tooltipNode.style.top = this.coord.y;
    this.tooltipNode.textContent = txt;
    this.tooltipNode.style.display = "block";
  }
  hideToolTip() {
    this.tooltipNode.style.display = "none";
  }
  onPointerMove(event) {
    this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    this.coord.x = event.clientX - 20;
    this.coord.y = event.clientY - 50;
  }
  animate(scene, camera, renderer, useToolTip = true) {
    let intersects;
    let text;
    requestAnimationFrame(() =>
      this.animate(scene, camera, renderer, useToolTip)
    );
    if (useToolTip) {
      this.raycaster.setFromCamera(this.pointer, camera);

      intersects = this.raycaster.intersectObjects(scene.children);
      intersects = intersects.filter((obj) => obj.object.what == "question");
      if (intersects.length > 0) {
        text = `${intersects[0].object.var}-${intersects[0].object.question}`;
        if (this.intersected) this.showToolTip(text);
        this.intersected = intersects[0].object;
      } else {
        this.hideToolTip();
        this.intersected = null;
      }
    }
    renderer.render(scene, camera);
  }
}
