/**
 * Poki, Crazygamesなどの対応インターフェース
 */
export class Platform {
    /**
     * @type {Platform}
     */
    static #current;
    /**
     * 
     * @param {Platform} platform 
     */
    static setCurrent(platform) {
        this.#current = platform;
    }
    static getCurrent() {
        return this.#current;
    }

    async init() {
    }
    
    loadingFinished() {

    }
    startOfStage() {
    }
    endOfStage() {
    }

    /**
     * 広告動画視聴
     * @returns true: 報酬あり
     */
    async reward() {
        return false;
    }
}