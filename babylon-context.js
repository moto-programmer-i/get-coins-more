import { createArcRotateCamera, createEngine, createSceneContext, createHemisphericLight, addToScene, registerScene, startEngine, createCylinder, createPbrMaterial, loadTexture2D, setMeshVisible} from "@babylonjs/lite";
import { LangSettings } from "./ui/lang.js";

const LOOP_INTERVAL_MILLISECONDS = 1000 / 50;

export const COIN_POOL_SIZE = 4;

export const INITIAL_POSITION = { x: -3, y: 0, z: 0};

/**
 *  Babylon defaults: alpha = -π/2, beta = π/2
 * https://github.com/BabylonJS/Babylon-Lite/blob/182709ae8024bee87d2a3b880bd318e7e922b77f/packages/babylon-lite/src/scene/scene-camera.ts#L49
 */
const INITIAL_CAMERA = {
    alpha: -Math.PI / 2,
    beta: Math.PI / 3,
    radius: 6,
    target:  { x: 0, y: 0, z: 0 }
};


 export const COIN_OPTIONS = {
    cylinderOptions: {
        height: 0.3,
        diameter: 2,
    },
    material:  createPbrMaterial({
        baseColorFactor: LangSettings.getCurrent().coinColor,
        metallicFactor: 1.0,
        roughnessFactor: 0.47
    })
};

export class FuncInPhysicsLoop {
    run(){}
    /**
     * 終了条件
     * @returns 終了する場合はtrue 
     */
    condition(){return true;}
}



export class BabylonContext {
    static #engine;
    static #scene;
    static #camera;
    static #bottomCoin;
    /**
     * 間に存在するコイン（3D上、塊にしている）
     */
    static #middleCoins;
    /**
     * 取得するときの移動するコイン
     * @type {Mesh[]}
     */
    static #pooledCoins = [];
    static #physicsLoopID;
    /**
     * @type {FuncInPhysicsLoop[]}
     */
    static #funcsInPhysicsLoop = [];

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
        this.#bottomCoin =  createCylinder(this.#engine, COIN_OPTIONS.cylinderOptions);
        this.#bottomCoin.material = createPbrMaterial({
            baseColorFactor: LangSettings.getCurrent().bottomColor,
            metallicFactor: 1.0,
            roughnessFactor: 0.47,
            baseColorTexture: await loadTexture2D(this.#engine, "./bottom-coin.png")
        });
        this.initCoinPosition(this.#bottomCoin);
        addToScene(this.#scene, this.#bottomCoin);
        this.#middleCoins =  createCylinder(this.#engine, COIN_OPTIONS.cylinderOptions);
        this.#middleCoins.material = COIN_OPTIONS.material;
        this.#middleCoins.position.x = INITIAL_POSITION.x;
        this.#middleCoins.position.y = INITIAL_POSITION.y + COIN_OPTIONS.cylinderOptions.height;
        this.#middleCoins.position.z = INITIAL_POSITION.z;
        addToScene(this.#scene, this.#middleCoins);

        for(let i = 0; i < COIN_POOL_SIZE; ++i) {
            const pooledCoin = createCylinder(this.#engine, COIN_OPTIONS.cylinderOptions);
            pooledCoin.material = COIN_OPTIONS.material;
            // setMeshVisible(pooledCoin, false);
            this.#pooledCoins.push(pooledCoin);
            addToScene(this.#scene, pooledCoin);
        }

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
        this.#camera  = createArcRotateCamera(INITIAL_CAMERA.alpha, INITIAL_CAMERA.beta, INITIAL_CAMERA.radius, INITIAL_CAMERA.target);
        this.#scene.camera = this.#camera;

        // 3. Register (after everything is added)
        await registerScene(this.#scene);
        // 4. Start the render loop
        await startEngine(this.#engine);
        
        // 物理ループ作成
       
        this.physicsLoopID = setInterval((() => {
                for(let i = 0; i < this.#funcsInPhysicsLoop.length; ++i) {
                    // 終了したものは消す
                    if(this.#funcsInPhysicsLoop[i].condition()) {
                        this.#funcsInPhysicsLoop.splice(i , 1);
                        --i;
                        continue;
                    }
                    this.#funcsInPhysicsLoop[i].run();
                }
            }).bind(this),
            LOOP_INTERVAL_MILLISECONDS);
        window.addEventListener("unload", (ev) => clearInterval(BabylonContext.getPhysicsLoopID()));
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

    static getMiddleCoins() {
        return this.#middleCoins;
    }

    static getPooledCoins() {
        return this.#pooledCoins;
    }

    static getPhysicsLoopID() {
        return this.#physicsLoopID;
    }

    /**
     * 物理ループの処理を追加
     * @param {FuncInPhysicsLoop} func 
     */
    static addFuncInPhysicsLoop(func) {
        this.#funcsInPhysicsLoop.push(func);
    }

    static initCoinPosition(coin) {
        coin.position.x = INITIAL_POSITION.x;
        coin.position.y = INITIAL_POSITION.y;
        coin.position.z = INITIAL_POSITION.z;
    }
}
