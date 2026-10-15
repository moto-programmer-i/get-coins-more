// https://doc.babylonjs.com/lite/01-getting-started
// を参考
import { SAVE_DATA } from "./savedata.js";
import { LangSettings } from "./ui/lang.js";
import { startStage } from "./stage/stage.js";
import { STAGE_SETTINGS } from "./stage/stage-settings.js";
import { BabylonContext } from "./babylon-context.js";

LangSettings.init();


const canvas = document.getElementById("renderCanvas");
await BabylonContext.init(canvas);

startStage(STAGE_SETTINGS[SAVE_DATA.stageIndex]);

