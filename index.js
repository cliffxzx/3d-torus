import "normalize.css";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import canvasToImage from "canvas-to-image";
import * as bootstrap from "bootstrap";
import hljs from "highlight.js";
import json from "highlight.js/lib/languages/json";
import "highlight.js/styles/github.css";

import exampleData from "./example.json";

import {
  createPlotBase,
  initScene,
  addLights,
  Animator,
  loadDataInScene,
} from "./plot.js";

document.addEventListener("DOMContentLoaded", (event) => {
  hljs.registerLanguage("json", json);

  let obj = initScene();
  createPlotBase(obj.scene, [1, 2, 2.5, 4, 6, 8]);
  addLights(obj.scene);

  let animator = new Animator();
  animator.animate(obj.scene, obj.camera, obj.renderer, true);

  loadDataInScene(obj.scene, exampleData);

  document.getElementById("download-btn").addEventListener("click", () => {
    canvasToImage(obj.renderer.domElement, {
      name: document.getElementById("filename-input").value,
    });
  });

  document.getElementById("load-data-btn").addEventListener("change", (e) => {
    document.body.removeChild(obj.renderer.domElement);
    obj = initScene();
    createPlotBase(obj.scene, [1, 2, 2.5, 4, 6, 8]);
    addLights(obj.scene);

    let animator = new Animator();
    animator.animate(obj.scene, obj.camera, obj.renderer, true);

    const reader = new FileReader();
    reader.addEventListener("load", (e) =>
      loadDataInScene(obj.scene, JSON.parse(e.target.result))
    );
    reader.readAsText(e.target.files[0]);
  });

  document.querySelectorAll("pre code").forEach((el) => {
    hljs.highlightElement(el);
  });
});
