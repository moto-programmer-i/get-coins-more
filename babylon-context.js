import { createDefaultCamera, createEngine, createSceneContext, createHemisphericLight, addToScene, registerScene, startEngine, createCylinder, createPbrMaterial, loadTexture2D} from "@babylonjs/lite";
import { LangSettings } from "./ui/lang.js";

export class BabylonContext {
    static #engine;
    static #scene;
    static #camera;
    static #bottomCoin;
    static #coins;

    /**
     * 
     * @param {HTMLCanvasElement} canvas 
     */
    static async init(canvas) {
        this.#engine = await createEngine(canvas);
        this.#scene = createSceneContext(this.#engine);

        // ライトの設定は保留
        addToScene(this.#scene, createHemisphericLight([0, 1, -0.05], 1.0));

        // // 先にコインを作るしかない
        this.#bottomCoin =  createCylinder(this.#engine, {
            height: 0.2,
            diameter: 2,
        });
        this.#bottomCoin.material = createPbrMaterial({
            baseColorFactor: LangSettings.getCurrent().bottomColor,
            metallicFactor: 1.0,
            roughnessFactor: 0.47,
            baseColorTexture: await loadTexture2D(this.#engine, "./bottom-coin.png")
        });
        this.#bottomCoin.rotation.x = -1;
        this.#bottomCoin.position.x = 1.5;
        this.#bottomCoin.position.y = -1;
        addToScene(this.#scene, this.#bottomCoin);
        this.#coins =  createCylinder(this.#engine, {
            height: 1,
            diameter: 2,
        });
        this.#coins.material = createPbrMaterial({
            baseColorFactor: LangSettings.getCurrent().coinColor,
            metallicFactor: 1.0,
            roughnessFactor: 0.47
        });
        this.#coins.rotation.x = -1;
        addToScene(this.#scene, this.#coins);

        // A sphere with a simple PBR material
        // const sphere = createSphere(this.#engine, { segments: 16, diameter: 2 });
        // sphere.material = createPbrMaterial({ baseColorFactor: [0.9, 0.1, 0.1, 1], metallicFactor: 0.1, roughnessFactor: 0.4 });
        // addToScene(this.#scene, sphere);

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
        this.#camera = createDefaultCamera(this.#scene);

        // 3. Register (after everything is added)
        await registerScene(this.#scene);
        // 4. Start the render loop
        await startEngine(this.#engine);
    }

    static getEngine() {
        return this.#engine;
    }

    static getScene() {
        return this.#scene;
    }

    static getBottomCoin() {
        return this.#bottomCoin;
    }
}
