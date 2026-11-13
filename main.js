// https://doc.babylonjs.com/lite/01-getting-started
// を参考
import { SAVE_DATA } from "./savedata.js";
import { startStage } from "./stage/stage.js";
import { STAGE_SETTINGS } from "./stage/stage-settings.js";
import { BabylonContext } from "./babylon-context.js";
import { setDisplay } from "./dom-utils.js";
import { Platform } from "./platform/platform.js";
import { Poki } from "./poki/poki.js";

// Poki版
const platform = new Poki();
Platform.setCurrent(platform);
await platform.init();


await BabylonContext.init(document.getElementById("renderCanvas"));


platform.loadingFinished();


// 準備完了後に押せるようにする
setDisplay(document.getElementById("loading"), false);
document.getElementById("rule").onclick = () => {
    setDisplay(rule, false);
    startStage(STAGE_SETTINGS[SAVE_DATA.stageIndex]);
};





