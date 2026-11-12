// https://doc.babylonjs.com/lite/01-getting-started
// を参考
import { SAVE_DATA } from "./savedata.js";
import { startStage } from "./stage/stage.js";
import { STAGE_SETTINGS } from "./stage/stage-settings.js";
import { BabylonContext } from "./babylon-context.js";
import { setDisplay } from "./dom-utils.js";

document.getElementById("rule").onclick = () => {
    setDisplay(rule, false);
}

await BabylonContext.init(document.getElementById("renderCanvas"));

startStage(STAGE_SETTINGS[SAVE_DATA.stageIndex]);



