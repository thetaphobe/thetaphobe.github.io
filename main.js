import * as THREE from './vendor/build/three.module.js';
import Stats from './vendor/examples/jsm/libs/stats.module.js';
import { EffectComposer } from "./vendor/examples/jsm/postprocessing/EffectComposer.js"
import { RenderPass } from "./vendor/examples/jsm/postprocessing/RenderPass.js"
import { ShaderPass } from "./vendor/examples/jsm/postprocessing/ShaderPass.js"
import { ColorCorrectionShader } from "./vendor/examples/jsm/shaders/ColorCorrectionShader.js"
import { VignetteShader } from "./vendor/examples/jsm/shaders/VignetteShader.js"
import { MMDAnimationHelper } from "./vendor/examples/jsm/animation/MMDAnimationHelper.js"
import { MMDLoader } from "./vendor/examples/jsm/loaders/MMDLoader.js"

let ready = false;
var clock = new THREE.Clock();

let camera, scene, renderer, composer, helper, stats, mesh;

const startButton = document.getElementById('startButton');
const overlay = document.getElementById('overlay');
startButton.addEventListener('click', function () {

    var loading = document.createElement("div");
    loading.innerHTML = "Loading...";
    loading.id = "loading";
    overlay.appendChild(loading);

    startButton.remove();
    document.getElementById("credits").remove();

    Ammo().then(function() {
        init();
        animate();
    });
});

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color("#ffffff");

    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.x = 11.5;
    camera.position.y = 10;
    camera.position.z = 35;
    camera.rotateY(Math.PI / 10);
    scene.add(camera);

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    scene.add(new THREE.PolarGridHelper(40, 10));

    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new ShaderPass(ColorCorrectionShader));
    composer.addPass(new ShaderPass(VignetteShader));
    
    const listener = new THREE.AudioListener();
    camera.add(listener);

    const light = new THREE.PointLight(0xffffff, 1, 0);
    light.position.set(0, 100, 0);
    scene.add(light);

    helper = new MMDAnimationHelper({pmxAnimation: true});
    const loader = new MMDLoader();

    loader.loadWithAnimation(
        'models/BetterReaper.pmx',
        'models/the_boys.vmd',
        function (mmd) {
            mesh = mmd.mesh
            helper.add(mesh, {
                animation: mmd.animation,
                physics: true,
            });
            new THREE.AudioLoader().load(
                './audios/the_boys.mp3',
                function (buffer) {
                    const audio = new THREE.Audio(listener).setBuffer(buffer);
                    helper.add(audio);
                    scene.add(mmd.mesh);
                    ready = true;
                    document.getElementById("loading").remove();
                }
           );
        }
   );

    //stats = new Stats();
    //document.body.appendChild(stats.dom);

    window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    if (ready) {
        helper.update(clock.getDelta());
    }
    composer.render();
};