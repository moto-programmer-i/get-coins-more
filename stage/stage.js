import { setMeshVisible } from "@babylonjs/lite";
import { StageSettings } from "./stage-settings.js";
import { BOTTOM_COIN_COUNT, BOTTOM_VALUE } from "./rule.js";
import { BabylonContext, FuncInPhysicsLoop, COIN_POOL_SIZE, COIN_OPTIONS } from "../babylon-context.js";
import { showUI } from "../ui/ui-utils.js";
import { setVisibility } from "../dom-utils.js";
import { cpuSelect } from "./cpu.js";






const coinSpeed = {x: 0.2, y: 0.2};
const coinDestination = {ceil: 4, floor: -4};

/** コインの移動の遅延（ミリ秒） */
const  COIN_DELAY_MILLISECONDS = 100;

/** CPU選択の遅延（ミリ秒） */
const  CPU_SELECT_MILLISECONDS = 400;

/** コインをとる選択肢の最大 */
const MAX_SELECTION = 3;

const turnElement = document.getElementById("turn");
const coinGetElement = document.getElementById("coin-get");
const coinCountHtml = document.getElementById("coin-count");
const cpuCoinsHtml = document.getElementById("cpu-coins");
const playerCoinsHtml = document.getElementById("player-coins");




const selectButtons = document.getElementById("selection").children;


/**
 * @type {number} コインの総数
 */
let coinCount;
let playerCoins = 0;
let cpuCoins = 0;

let bottomCoin;

/**
 * プールの中で、現在一番上にあるコインのインデックス
 */
let poolIndex;

/**
 * 
 * @param {StageSettings} settings 
 */
export function startStage(settings) {
    // コインの総数を表示
    coinCountHtml.textContent = coinCount = settings.getCoinCount();

    initCoins(settings);

    // // 先攻後攻決め
    // showUI(turnElement, true);

    // 開発用
    coinGet(true);
}

/**
 * 一番下以外のコインを初期化
 */
async function initExceptBottom() {
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

    // コインの数を設定
    coinCount = settings.getCoinCount();

    // 取られたコインを0に戻す
    cpuCoinsHtml.innerText = cpuCoins = 0;
    playerCoinsHtml.innerText = playerCoins = 0;

    await initExceptBottom();
}

async function syncCoins(selected, isPlayerTurn) {
    // 残りのコインの更新
    coinCount -= selected;
    coinCountHtml.textContent = coinCount;

    // 一番下のコインを取得した場合は足す
    if (coinCount <= 0) {
        selected += BOTTOM_VALUE - BOTTOM_COIN_COUNT;
    }

    // 取得したコインの更新
    if (isPlayerTurn) {
        playerCoinsHtml.innerText = playerCoins += selected;
        
    } else {
        cpuCoinsHtml.innerText = cpuCoins += selected;
    }
}

async function coinGet(isPlayerTurn) {
    const bottomCoin =  BabylonContext.getBottomCoin();


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
            playCoinTakeAnimation(selected, isPlayerTurn);

           syncCoins(selected, isPlayerTurn);
        });

        // ターン変更
        isPlayerTurn = false;

    }while(coinCount > 0);
}


async function playCoinTakeAnimation(count, isPlayerTurn) {
    // 取られたコインを元の位置へ
    initExceptBottom();

    const pool = BabylonContext.getPooledCoins();
    for(let i = 0; i < count; ++i) {
        // コインを移動させる
        // [0]が下なので末尾から
        const func = new FuncInPhysicsLoop();
        const moveIndex = poolIndex;
        
        if(isPlayerTurn) {
            func.condition = () => pool[moveIndex].position.y < -coinDestination.ceil;
            func.run = () => {
                pool[moveIndex].position.x += coinSpeed.x;
                pool[moveIndex].position.y -= coinSpeed.y;
            };
        } else {
            func.condition = () => pool[moveIndex].position.y > coinDestination.floor;
            func.run = () => {
                pool[moveIndex].position.x += coinSpeed.x
                pool[moveIndex].position.y += coinSpeed.y;
            };
        }
        BabylonContext.addFuncInPhysicsLoop(func);

        // プールのインデックス更新
        --poolIndex;

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