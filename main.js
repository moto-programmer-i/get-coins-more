// https://doc.babylonjs.com/lite/01-getting-started
// を参考
import { createBox, createDefaultCamera, createEngine, createSceneContext, createArcRotateCamera, attachControl, createHemisphericLight, createSphere, createPbrMaterial, addToScene, loadEnvironment, loadGltf, registerScene, startEngine, } from "@babylonjs/lite";
import { SAVE_DATA } from "./savedata.js";
import { changeLang } from "./ui/lang.js";



// 言語がなければ表示
if (SAVE_DATA.lang == null) {
    changeLang(() => {
        console.log(SAVE_DATA.lang);
    });
}


const canvas = document.getElementById("renderCanvas");
const engine = await createEngine(canvas);
const scene = createSceneContext(engine);

// Light
addToScene(scene, createHemisphericLight([0, 1, 0], 1.0));


// const box = createBox(engine, {
//     // depth: 2.5,
//     // height: 2.5,
//     // width: 2.5,
//     size: 20.5,    
// }); 
//  box.material = createPbrMaterial({ baseColorFactor: [0.9, 0.1, 0.1, 1], metallicFactor: 0.1, roughnessFactor: 0.4 });
// addToScene(scene, box);


// A sphere with a simple PBR material
// const sphere = createSphere(engine, { segments: 16, diameter: 2 });
// sphere.material = createPbrMaterial({ baseColorFactor: [0.9, 0.1, 0.1, 1], metallicFactor: 0.1, roughnessFactor: 0.4 });
// addToScene(scene, sphere);

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

// Frame the loaded model automatically
const camera = createDefaultCamera(scene);



// 3. Register (after everything is added)
await registerScene(scene);
// 4. Start the render loop
await startEngine(engine);

