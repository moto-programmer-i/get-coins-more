/**
 * Poki, Crazygamesなどの対応インターフェース
 */
export class Platform {
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
}