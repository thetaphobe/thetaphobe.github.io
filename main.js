import * as THREE from './vendor/build/three.module.js';
import {MMDAnimationHelper} from "./vendor/examples/jsm/animation/MMDAnimationHelper.js"
import {MMDLoader} from "./vendor/examples/jsm/loaders/MMDLoader.js"

let ready = false;
var clock = new THREE.Clock();

let camera, scene, renderer;
let helper;

const startButton = document.getElementById( 'startButton' );
startButton.addEventListener( 'click', function () {
    init();
    animate();
    startButton.remove();
});

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xffffff );
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );

    camera.position.x = 0;
    camera.position.y = 10;
    camera.position.z = 34;

    renderer = new THREE.WebGLRenderer( {antialias: true});
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    scene.add( new THREE.PolarGridHelper( 30, 10 ) );

    const listener = new THREE.AudioListener();
    camera.add( listener );
    scene.add( camera );

    const ambient = new THREE.AmbientLight( "#000000" );
    scene.add( ambient );

    // const directionalLight = new THREE.DirectionalLight( "#ffffff" );
    // directionalLight.position.set(0, 1, 0).normalize();
    // directionalLight.castShadow = true;
    // scene.add( directionalLight );
    const directionalLight = new THREE.DirectionalLight( "#ffffff",1 );
    directionalLight.position.set(0,1,0);
    
    scene.add( directionalLight );


    helper = new MMDAnimationHelper({pmxAnimation: true});

    new MMDLoader().loadWithAnimation(
        'model/BetterReaper.pmx',
        'model/the_boys.vmd',
        function ( mmd ) {
            helper.add( mmd.mesh, {
                animation: mmd.animation,
                physics: false,
            } );
            scene.add( mmd.mesh );
            new THREE.AudioLoader().load(
                './audio.mp3',
                function ( buffer ) {
                    const audio = new THREE.Audio( listener ).setBuffer( buffer );
                    helper.add( audio );
                    scene.add( listener );
                    ready = true;
                }
            );
        }
    );
    window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
    requestAnimationFrame( animate );
    if (ready) {
        helper.update(clock.getDelta());
    }
    renderer.render( scene, camera );
};