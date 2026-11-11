import { setMeshVisible } from "@babylonjs/lite";
import { STAGE_SETTINGS, StageSettings } from "./stage-settings.js";
import { BOTTOM_COIN_COUNT, BOTTOM_VALUE } from "./rule.js";
import { BabylonContext, FuncInPhysicsLoop, COIN_POOL_SIZE, COIN_OPTIONS } from "../babylon-context.js";
import { showUI } from "../ui/ui-utils.js";
import { setVisibility, setVisibilityInherit, setDisplay } from "../dom-utils.js";
import { cpuSelect } from "./cpu.js";
import { SAVE_DATA } from "../savedata.js";








/** コインの移動の遅延（ミリ秒） */
const  COIN_DELAY_MILLISECONDS = 100;

/** CPU選択の遅延（ミリ秒） */
const  CPU_SELECT_MILLISECONDS = 400;

/** コインをとる選択肢の最大 */
const MAX_SELECTION = 3;




const COIN_SPEED = {x: 0.1, z: 0.2};
const BOTTOM_SPEED_RATE = 0.125;
const BOTTOM_SPEED = {
    x: COIN_SPEED.x * BOTTOM_SPEED_RATE,
    z: COIN_SPEED.z * BOTTOM_SPEED_RATE,
};
const COIN_DESTINATION = {ceil: 8, floor: -4};
const BOTTOM_DESTINATION = {ceil: 6, floor: -4};

const SCALE_RATE_ANIMATION = 1.001;

const ROTATION_DELTA = 0.1;
const ROTATION_COUNT_MAX = 60;

/** 結果の表示の遅延（ミリ秒） */
const  RESULT_DELAY_MILLISECONDS = 1500;

/** ループ関数強制停止用のキー */
const COIN_MOVE_FUNC_KEY = "COIN_MOVE";


const turnElement = document.getElementById("turn");
const coinGetElement = document.getElementById("coin-get");
const coinCountHtml = document.getElementById("coin-count");
const cpuCoinsHtml = document.getElementById("cpu-coins");
const playerCoinsHtml = document.getElementById("player-coins");
const selectButtons = document.getElementById("selection").children;
const resultWrapperHtml = document.getElementById("result-wrapper");
const resultWinHtml = document.getElementById("result-win");
const resultDefeatHtml = document.getElementById("result-defeat");
const resultDrawHtml = document.getElementById("result-draw");
const resultCpuHtml = document.getElementById("result-cpu");
const resultYouHtml = document.getElementById("result-you");

let bottomCoin;


/**
 * @type {number} コインの総数
 */
let coinCount;
let playerCoins = 0;
let cpuCoins = 0;

/**
 * プールの中で、現在一番上にあるコインのインデックス
 */
let poolIndex;

let nextStage = false;

/**
 * 
 * @param {StageSettings} settings 
 */
export function startStage(settings) {
    // コインの選択肢を消しておく
    setVisibility(coinGetElement, false);

    // コインの総数を表示
    coinCountHtml.textContent = coinCount = settings.getCoinCount();

    initCoins(settings);

    // // 先攻後攻決め
    // showUI(turnElement, true);

    // 開始のSE（user gestureがない場合はならないこともある）
    BabylonContext.playStartSound();

    // 開発用
    coinGet(true);
}

/**
 * 一番下以外のコインを初期化
 */
async function initExceptBottom() {
    // コインの移動を停止
    BabylonContext.deleteFuncByKey(COIN_MOVE_FUNC_KEY);

    // 上のコインが不要なら消す
    const upper = BabylonContext.getUpperCoins();
    const upperVisible = coinCount > (COIN_POOL_SIZE + BOTTOM_COIN_COUNT);
    if(upperVisible) {
        // 上のコインの数だけ高さ調整
        const upperCount = coinCount - BOTTOM_COIN_COUNT;
        upper.scaling.y = upperCount;
        upper.position.y = bottomCoin.position.y 
            // コインの高さの半分 * （上のコインの枚数 + 一番下）
            + (COIN_OPTIONS.cylinderOptions.height) * 0.5 * (upperCount + BOTTOM_COIN_COUNT);
    }
    setMeshVisible(upper, upperVisible);
    
    

    // 面倒なので取る用のコインの位置はいつも同じ
    // （例：20枚積まれたときに一番上に配置したりはしない）

    // 取る用のコインをその上に積む（[0]が下）
    const pool = BabylonContext.getPooledCoins();
    let pooledCoinY = bottomCoin.position.y;

    // 全体の数 - 1（一番下のコイン）と、最大プール数 の少ない方がプールになる
    const poolCount = Math.min(coinCount - 1, COIN_POOL_SIZE);
    for(let i = 0; i < poolCount; ++i) {
        BabylonContext.initCoinPosition(pool[i]);
        pooledCoinY += COIN_OPTIONS.cylinderOptions.height;
        pool[i].position.y = pooledCoinY;
        setMeshVisible(pool[i], true);
    }
    poolIndex = poolCount - 1;

    // 不要なプールを非表示
    for(let i = poolCount; i < COIN_POOL_SIZE; ++i) {
        setMeshVisible(pool[i], false);
    }
}

async function initCoins(settings) {
    // 一番下のコインを初期値に
    bottomCoin = BabylonContext.getBottomCoin();
    BabylonContext.initCoinPosition(bottomCoin);
    bottomCoin.rotation.x = COIN_OPTIONS.rotation;
    bottomCoin.scaling.set(COIN_OPTIONS.scaling.x, COIN_OPTIONS.scaling.y, COIN_OPTIONS.scaling.z);

    // 取られたコインを0に戻す
    cpuCoinsHtml.innerText = cpuCoins = 0;
    playerCoinsHtml.innerText = playerCoins = 0;

    await initExceptBottom();
}

async function showResult() {
    // 早すぎると分かりづらいので遅延
    await new Promise(resolve => setTimeout(resolve, RESULT_DELAY_MILLISECONDS));

    // 取ったコインの数を表示
    resultCpuHtml.innerText = cpuCoins;
    resultYouHtml.innerText = playerCoins;
    
    // 勝敗を表示（勝ったら次のステージへ）
    if(playerCoins > cpuCoins) {
        nextStage = true;
        setDisplay(resultWinHtml, true);
        BabylonContext.playWinSound();
    } else {
        nextStage = false;
        if(playerCoins === cpuCoins) {
            setDisplay(resultDrawHtml, true);
        } else  {
            setDisplay(resultDefeatHtml, true);
        }
    }
    
    // 結果を表示
    setVisibility(resultWrapperHtml, true);
}

async function syncCoins(selected, isPlayerTurn) {
    // 残りのコインの更新
    coinCount -= selected;
    coinCountHtml.textContent = coinCount;

    // 一番下のコインを取得した場合は足す
    const end = coinCount <= 0;
    if (end) {
        selected += BOTTOM_VALUE - BOTTOM_COIN_COUNT;
    }

    // 取得したコインの更新
    if (isPlayerTurn) {
        playerCoinsHtml.innerText = playerCoins += selected;
        
    } else {
        cpuCoinsHtml.innerText = cpuCoins += selected;
    }

    if(end) {
        showResult();
    }
}

async function coinGet(isPlayerTurn) {
    do {
        // CPUの処理
        if (!isPlayerTurn) {
            // 早すぎると分かりづらいので遅延
            await new Promise(resolve => setTimeout(resolve, CPU_SELECT_MILLISECONDS));

            const cpuSelection = cpuSelect(coinCount, playerCoins, cpuCoins);
            playCoinTakeAnimation(cpuSelection, isPlayerTurn);
            syncCoins(cpuSelection, isPlayerTurn);
            // ターン変更
            isPlayerTurn = true;
        }

        // CPUが全てのコインを取得したら終了
        if(coinCount <= 0) {
            break;
        }
        
        // プレイヤーの処理
        
    


        // 選択肢が押されるのを待つ
        // コインを1個とる選択肢は常に表示される
        const selectArray = [new Promise(resolve => {selectButtons.item(0).onclick =() => resolve(1)})];
        // 2個以上の選択肢は足りない場合は非表示
        for(let select = 2;  select <= MAX_SELECTION; ++select) {
            const button = selectButtons.item(select - 1);
            const enable = select <= coinCount;
            if (enable) {
                selectArray.push(new Promise(resolve => {button.onclick =() => resolve(select)}));
                // visibleにしてしまうと親要素がhiddenでも見えてしまうためinherit
                setVisibilityInherit(button);
            } else {
                setVisibility(button, false);
            }
            
        }
        setVisibility(coinGetElement, true);
        await Promise.any(selectArray).then(selected => {
            setVisibility(coinGetElement, false);
            playCoinTakeAnimation(selected, isPlayerTurn);

           syncCoins(selected, isPlayerTurn);
        });

        // ターン変更
        isPlayerTurn = false;

    }while(coinCount > 0);
}



async function playBottomCoinTakeAnimation(isPlayerTurn) {
    const bottom = BabylonContext.getBottomCoin();
    const bottomMove = new FuncInPhysicsLoop(COIN_MOVE_FUNC_KEY);
    let rotationCount = 0;
     if (isPlayerTurn) {
        bottomMove.condition = () => bottom.position.z < BOTTOM_DESTINATION.floor;
        bottomMove.run = () => {
            bottom.position.x += BOTTOM_SPEED.x;
            bottom.position.z -= BOTTOM_SPEED.z;
            bottom.scaling.set(bottom.scaling.x * SCALE_RATE_ANIMATION, bottom.scaling.y * SCALE_RATE_ANIMATION, bottom.scaling.z * SCALE_RATE_ANIMATION);
            if (rotationCount < ROTATION_COUNT_MAX) {
                bottom.rotation.x += ROTATION_DELTA;
            }
            ++rotationCount;
        };
     } else {
        bottomMove.condition = () => bottom.position.z > BOTTOM_DESTINATION.ceil;
        bottomMove.run = () => {
            bottom.position.x += BOTTOM_SPEED.x;
            bottom.position.z += BOTTOM_SPEED.z;
            bottom.scaling.set(bottom.scaling.x * SCALE_RATE_ANIMATION, bottom.scaling.y * SCALE_RATE_ANIMATION, bottom.scaling.z * SCALE_RATE_ANIMATION);
             if (rotationCount < ROTATION_COUNT_MAX) {
                bottom.rotation.x += ROTATION_DELTA;
            }
            ++rotationCount;

        };
     }
     
    BabylonContext.addFuncInPhysicsLoop(bottomMove);

    // コイン取得時の効果音
    BabylonContext.playGetBottomSound();
}

async function playCoinTakeAnimation(count, isPlayerTurn) {
    // 取られたコインを元の位置へ
    initExceptBottom();

    const pool = BabylonContext.getPooledCoins();
    for(let i = 0; i < count; ++i) {
        // 最後のコインを取った場合は終了
        if(poolIndex < 0) {
            await playBottomCoinTakeAnimation(isPlayerTurn);
            return;
        }


        // コインを移動させる
        // [0]が下なので末尾から
        const func = new FuncInPhysicsLoop(COIN_MOVE_FUNC_KEY);
        const moveIndex = poolIndex;
        
        if(isPlayerTurn) {
            func.condition = () => pool[moveIndex].position.z < COIN_DESTINATION.floor;
            func.run = () => {
                pool[moveIndex].position.x += COIN_SPEED.x;
                pool[moveIndex].position.z -= COIN_SPEED.z;
            };
        } else {
            func.condition = () => pool[moveIndex].position.z > COIN_DESTINATION.ceil;
            func.run = () => {
                pool[moveIndex].position.x += COIN_SPEED.x;
                pool[moveIndex].position.z += COIN_SPEED.z;
            };
        }
        BabylonContext.addFuncInPhysicsLoop(func);

        // プールのインデックス更新
        --poolIndex;

        // コイン取得時の効果音
        BabylonContext.playGetSound();

        // 移動タイミングをずらす
        await new Promise(resolve => setTimeout(resolve, COIN_DELAY_MILLISECONDS));
    }


}

document.getElementById("first").onclick = () => {
    coinGet(true);
    showUI(ID_TURN, false);
};
document.getElementById("second").onclick = () => {
    coinGet(false);
    showUI(ID_TURN, false);
};

// リトライ
resultWrapperHtml.addEventListener("click", (ev) => {
    // 結果の画面を消しておく
    setDisplay(resultWinHtml, false);
    setDisplay(resultDrawHtml, false);
    setDisplay(resultDefeatHtml, false);
    setVisibility(resultWrapperHtml, false);

    // コインの移動を停止
    BabylonContext.deleteFuncByKey(COIN_MOVE_FUNC_KEY);

    //次のステージがあるなら次へ
    if (nextStage && SAVE_DATA.stageIndex + 1 < STAGE_SETTINGS.length) {
        ++SAVE_DATA.stageIndex;
    }
    startStage(STAGE_SETTINGS[SAVE_DATA.stageIndex]);
});