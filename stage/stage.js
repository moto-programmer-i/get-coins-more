import { StageSettings } from "./stage-settings.js";
import { BabylonContext } from "../babylon-context.js";
import { showUI } from "../ui/ui-utils.js";
import { setVisibility } from "../dom-utils.js";

/** 底のコインの価値 */
const bottomValue = 10;

/** 選択後の遅延（ミリ秒） */
const  AFTER_SELECT_MILLISECONDS = 1000;

/** コインをとる選択肢の最大 */
const MAX_SELECTION = 3;

const turnElement = document.getElementById("turn");
const coinGetElement = document.getElementById("coin-get");
const coinCountHtml = document.getElementById("coin-count");




const selectButtons = document.getElementById("selection").children;


/**
 * @type {number} コインの総数
 */
let coinCount;
let playerCoins = 0;
let cpuCoins = 0;

/**
 * 
 * @param {StageSettings} settings 
 */
export function startStage(settings) {
    // コインの総数を表示
    coinCountHtml.textContent = coinCount = settings.getCoinCount();

    // // 先攻後攻決め
    // showUI(turnElement, true);

    // 開発用
    coinGet(true);
}

async function coinGet(isPlayerTurn) {
    const engine = BabylonContext.getEngine();
    const scene = BabylonContext.getScene();   
    const bottomCoin =  BabylonContext.getBottomCoin();


    do {

        // CPUの処理

        
        // プレイヤーの処理
        showUI(coinGetElement, true);


        // 選択肢が押されるのを待つ（数が足りない場合は非表示）
        const selectArray = [new Promise(resolve => {selectButtons.item(0).onclick =() => resolve(1)})];
        for(let select = 2;  select <= MAX_SELECTION; ++select) {
            const button = selectButtons.item(select - 1);
            const enable = select <= coinCount;
            if (enable) {
                selectArray.push(new Promise(resolve => {button.onclick =() => resolve(select)}));
            }
            setVisibility(button, enable);
        }
        await Promise.any(selectArray).then(selected => {
            // 取得したコインの計算（底はbottomValue倍）
            coinCount -= selected;
            if (coinCount <= 0) {
                playerCoins += bottomValue + selected - 1;
            } else {
                playerCoins += selected;
            }

            // 残りのコインの更新
            coinCountHtml.textContent = coinCount;
        });

    }while(coinCount > 0);
    

}

document.getElementById("first").onclick = () => {
    coinGet(true);
    showUI(ID_TURN, false);
};
document.getElementById("second").onclick = () => {
    coinGet(false);
    showUI(ID_TURN, false);
};