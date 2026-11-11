const RANDOM_MIN = 4;
const RANDOM_MAX = 24;

export class StageSettings {
    /**
     * @type {number}
     */
    #coinCount;

    /**
     * 
     * @param {number} coinCount undefinedのときはランダム
     */
    constructor(coinCount) {
        this.#coinCount = coinCount;
    }

    /**
     * 
     * @returns undefinedのときはランダム
     */
    getCoinCount() {
        if (Number.isInteger(this.#coinCount)) {
            return this.#coinCount;
        }

        // コイン数が設定されていない場合はランダム
        return Math.floor(Math.random() * (RANDOM_MAX - RANDOM_MIN) + RANDOM_MIN);
    }
}

/**
 * 各ステージの設定
 */
export const STAGE_SETTINGS = [
    new StageSettings(4),
    new StageSettings(10),
    new StageSettings(20),
    new StageSettings(),
];