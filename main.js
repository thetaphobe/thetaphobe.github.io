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

// ios not supported
let enablePhysics = true;

var clock = new THREE.Clock();

let camera, scene, renderer, composer, helper;

let modelFile = "./models/Reaper Lolita Pink.pmx";
let audioFile = "./mmd/Circus.wav";
let motionFile = "./mmd/Circus-Motion.vmd";
let cameraFile = "./mmd/Circus-Camera.vmd"; 

const startButton = document.getElementById('startButton');
const overlay = document.getElementById('overlay');
startButton.addEventListener('click', function () {

    var loading = document.createElement("div");
    loading.innerHTML = "Loading...";
    loading.id = "loading";
    overlay.appendChild(loading);

    startButton.remove();
    document.getElementById("credits").remove();

    if (/(iPad|iPhone|iPod)/g.test(navigator.userAgent)) {
        init();
        animate();
    } else {
        Ammo().then(function() {
            init();
            animate();
        });
    }
    
});

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color("#ffffff");

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.x = 11.5;
    camera.position.y = 10;
    camera.position.z = 35;
    camera.rotateY(Math.PI / 10);
    
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    scene.add(new THREE.GridHelper(90, 20));
    
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new ShaderPass(ColorCorrectionShader));
    composer.addPass(new ShaderPass(VignetteShader));
    
    const light = new THREE.PointLight(0xffffff, 0.95, 0);
    light.position.set(0, 100, 0);
    scene.add(light);
    
    const listener = new THREE.AudioListener();
    camera.add(listener);
    scene.add(camera);

    helper = new MMDAnimationHelper({resetPhysicsOnLoop: true});
    const loader = new MMDLoader();

    loader.loadWithAnimation(modelFile, motionFile, function (mmd) {
        if (/(iPad|iPhone|iPod)/g.test(navigator.userAgent)) {

            helper.add(mmd.mesh, {
                animation: mmd.animation,
                physics: false
            });

            console.log("Added mesh (iOS device)");
        } else {

            helper.add(mmd.mesh, {
                animation: mmd.animation,
                physics: enablePhysics
            });
            
            console.log("Added mesh (non-iOS device)");
        }

        if (cameraFile != "") {

            loader.loadAnimation(cameraFile, camera, function (cameraAnimation) {
                helper.add(camera, {
                animation: cameraAnimation
                });
                new THREE.AudioLoader().load(audioFile, function (buffer) {
                    const audio = new THREE.Audio(listener).setBuffer(buffer);
                    helper.add(audio);
                    scene.add(listener);
                    scene.add(mmd.mesh);
                    document.getElementById("loading").remove();
                    ready = true;
                });
            });

            console.log("Loaded camera file");
        } else {

            new THREE.AudioLoader().load(audioFile, function (buffer) {
                const audio = new THREE.Audio(listener).setBuffer(buffer);
                helper.add(audio);
                scene.add(listener);
                scene.add(mmd.mesh);
                document.getElementById("loading").remove();
                ready = true;
            });

            console.log("No camera file");
        }
    });

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