// https://doc.babylonjs.com/lite/01-getting-started
// をコンパイルしたもの
import { createDefaultCamera, createEngine, createSceneContext, createArcRotateCamera, attachControl, createHemisphericLight, createSphere, createPbrMaterial, addToScene, loadEnvironment, loadGltf, registerScene, startEngine, } from "@babylonjs/lite";
const canvas = document.getElementById("renderCanvas");

// 1. Engine
const engine = await createEngine(canvas);

// 2. Scene
const scene = createSceneContext(engine);
// // Camera (plain data) — set it on the scene, then attach input handling
// const camera = createArcRotateCamera(-Math.PI / 2, Math.PI / 2.5, 4, { x: 0, y: 0, z: 0 });
// scene.camera = camera;
// attachControl(camera, canvas, scene);
// Light
addToScene(scene, createHemisphericLight([0, 1, 0], 1.0));







// A sphere with a simple PBR material
const sphere = createSphere(engine, { segments: 16, diameter: 2 });
sphere.material = createPbrMaterial({ baseColorFactor: [0.9, 0.1, 0.1, 1], metallicFactor: 0.1, roughnessFactor: 0.4 });
addToScene(scene, sphere);

// // Load a model — returns an AssetContainer; addToScene registers its
// // meshes, transform hierarchy, and animation groups for you.
// addToScene(scene, await loadGltf(engine, 
//     // "https://playground.babylonjs.com/scenes/BoomBox.glb"
//     // "manyTextures.glb"
//     // "hero.glb"
//     // "heroin.glb"
//     // "mercenary.glb"
//     "princess_summer.glb"
    

// ));


// // // Image-based lighting + skybox + ground. loadEnvironment adds its own
// // // renderables to the scene internally.
// await loadEnvironment(scene, "https://assets.babylonjs.com/core/environments/environmentSpecular.env", {
//     brdfUrl: "https://liteplayground.babylonjs.com/brdf-lut.png",
//     skyboxUrl: "https://assets.babylonjs.com/core/environments/backgroundSkybox.dds",
//     skyboxSize: 1000,
// });







// Frame the loaded model automatically
const camera = createDefaultCamera(scene);
// 回転しないとなぜか正面にならない
camera.alpha = Math.PI / 2;
attachControl(camera, canvas, scene);





// 3. Register (after everything is added)
await registerScene(scene);
// 4. Start the render loop
await startEngine(engine);