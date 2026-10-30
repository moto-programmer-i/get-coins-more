import { BOTTOM_COIN_COUNT, BOTTOM_VALUE, CPU_MAX } from "./rule.js";

/** 最小 + 最大 */
export const MIN_PLUS_MAX = 1 + CPU_MAX;

export function cpuSelect(coinCount, playerCoins, cpuCoins) {
    // 全てのコインを取れる場合はとる
    if (coinCount <= CPU_MAX) {
        return coinCount;
    }


    // 総数が（最小 + 最大）の倍数でないときは、倍数にして相手にターンを渡す
    const remainder = coinCount % MIN_PLUS_MAX;
    if (remainder !== 0) {
        return remainder;
    }

    // 倍数で最後を取られても勝てる場合は、最大の数を取る
    const remainingTurns = coinCount / MIN_PLUS_MAX;
    if ((playerCoins + BOTTOM_VALUE + remainingTurns - BOTTOM_COIN_COUNT) < cpuCoins + CPU_MAX * remainingTurns) {
        return CPU_MAX;
    }

    // それ以外はまだ勝てないので適当にランダムでとる
    return Math.floor(Math.random() * CPU_MAX + 1);
}