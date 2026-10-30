/** CPUの選択肢の最大 */
export const CPU_MAX = 3;

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

    // 倍数の場合はまだ勝てないので適当にランダムでとる
    return Math.floor(Math.random() * CPU_MAX + 1);
}