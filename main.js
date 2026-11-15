// https://doc.babylonjs.com/lite/01-getting-started
// を参考
import { SAVE_DATA } from "./savedata.js";
import { startStage } from "./stage/stage.js";
import { STAGE_SETTINGS } from "./stage/stage-settings.js";
import { BabylonContext } from "./babylon-context.js";
import { setDisplay } from "./dom-utils.js";
import { Platform } from "./platform/platform.js";
import { Poki } from "./platform/poki/poki.js";

const loadingElement = document.getElementById("loading");

let isLoading = true;
let startPressed = false;

async function start() {
    setDisplay(rule, false);
    startStage(STAGE_SETTINGS[SAVE_DATA.stageIndex]);
}


document.getElementById("rule").onclick = () => {
    startPressed = true;
    // ローディングが完了してない場合はだす
    if (isLoading) {
        setDisplay(loadingElement, true);
        return;
    }
    start();
};


const platform = new Platform();
// Poki版
// const platform = new Poki();


Platform.setCurrent(platform);
await platform.init();


await BabylonContext.init(document.getElementById("renderCanvas"));

isLoading = false;
platform.loadingFinished();

// ローディング後、すでにstartが押されていたらスタート
if (startPressed) {
    start();
}








