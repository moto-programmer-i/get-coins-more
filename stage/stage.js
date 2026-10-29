import { setMeshVisible } from "@babylonjs/lite";
import { StageSettings } from "./stage-settings.js";
import { BabylonContext, FuncInPhysicsLoop, COIN_POOL_SIZE, COIN_OPTIONS } from "../babylon-context.js";
import { showUI } from "../ui/ui-utils.js";
import { setVisibility } from "../dom-utils.js";

/** 底のコインの価値 */
const bottomValue = 10;

/** 底のコインの枚数 */
const BOTTOM_COIN_COUNT = 1;

/** 選択後の遅延（ミリ秒） */
const  AFTER_SELECT_MILLISECONDS = 1000;



const coinSpeed = {x: 0.2, y: 0.2};
const coinDestination = {ceil: 4, floor: -4};

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
            // コインの高さ * （1枚→1、2枚→1.5、・・・）
            + (COIN_OPTIONS.cylinderOptions.height) * (1 + (upperCount - BOTTOM_COIN_COUNT) * 0.5);
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

    await initExceptBottom();
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