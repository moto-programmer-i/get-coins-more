import { setMeshVisible } from "@babylonjs/lite";
import { StageSettings } from "./stage-settings.js";
import { BabylonContext, FuncInPhysicsLoop, COIN_POOL_SIZE, COIN_OPTIONS } from "../babylon-context.js";
import { showUI } from "../ui/ui-utils.js";
import { setVisibility } from "../dom-utils.js";

/** 底のコインの価値 */
const bottomValue = 10;

/** 選択後の遅延（ミリ秒） */
const  AFTER_SELECT_MILLISECONDS = 1000;

/** コインの移動の遅延（ミリ秒） */
const  COIN_DELAY_MILLISECONDS = 100;

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

async function initCoins(settings) {
    // 一番下のコインを初期値に
    const bottomCoin = BabylonContext.getBottomCoin();
    BabylonContext.initCoinPosition(bottomCoin);

    // 間のコインがなければ消す、あれば高さ調整
    const coinCount = settings.getCoinCount();
    const mid = BabylonContext.getMiddleCoins();
    const midCount = coinCount - COIN_POOL_SIZE;
    mid.scaling.y = midCount;
    mid.position.y = bottomCoin.position.y + COIN_OPTIONS.cylinderOptions.height;
    setMeshVisible(mid, midCount > 0);

    // 取る用のコインをその上に積む（[0]が下）
    const pool = BabylonContext.getPooledCoins();
    let pooledCoinY = bottomCoin.position.y + midCount * COIN_OPTIONS.cylinderOptions.height;

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
            playCoinTakeAnimation(selected, isPlayerTurn);

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


async function playCoinTakeAnimation(count, isPlayerTurn) {
    const pool = BabylonContext.getPooledCoins();
    for(let i = 0; i < count; ++i) {
        // コインを移動させる
        // [0]が下なので末尾から
        const func = new FuncInPhysicsLoop();
        const moveIndex = poolIndex;
        
        if(isPlayerTurn) {
            func.condition = () => pool[moveIndex].position.y < -2;
            func.run = () => {
                pool[moveIndex].position.x += 0.2
                pool[moveIndex].position.y -= 0.2;
            };
        } else {
            func.condition = () => pool[moveIndex].position.y > 2;
            func.run = () => {
                pool[moveIndex].position.x += 0.2
                pool[moveIndex].position.y += 0.2;
            };
        }
        BabylonContext.addFuncInPhysicsLoop(func);

        // プールのインデックス更新
        --poolIndex;
        if (poolIndex < 0) {
            poolIndex = COIN_POOL_SIZE - 1;

            // 高さ調整が必要
        }

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