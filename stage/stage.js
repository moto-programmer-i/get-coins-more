import { StageSettings } from "./stage-settings.js";
import { BabylonContext } from "../babylon-context.js";
import { showUI } from "../ui/ui-utils.js";

const ID_TURN = "turn";

/**
 * 
 * @param {StageSettings} settings 
 */
export function startStage(settings) {
    // コインの総数を表示
    const coinCountHtml = document.getElementById("coinCount");
    coinCountHtml.textContent = settings.getCoinCount();

    // 先攻後攻決め
    showUI(ID_TURN, true);
}

function coinGet(isPlayerTurn) {
    const engine = BabylonContext.getEngine();
    const scene = BabylonContext.getScene();
    
    const bottomCoin =  BabylonContext.getBottomCoin();
    alert();
}

document.getElementById("first").onclick = () => {
    coinGet(true);
    showUI(ID_TURN, false);
};
document.getElementById("second").onclick = () => {
    coinGet(false);
    showUI(ID_TURN, false);
};

console.log("stage.js load");