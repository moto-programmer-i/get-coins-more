export class StageSettings {
    /**
     * @type {number}
     */
    #coinCount;

    /**
     * 
     * @param {number} coinCount 
     */
    constructor(coinCount) {
        this.#coinCount = coinCount;
    }

    getCoinCount() {
        return this.#coinCount;
    }
}

/**
 * 各ステージの設定
 */
export const STAGE_SETTINGS = [
    new StageSettings(4),
    new StageSettings(10),
];