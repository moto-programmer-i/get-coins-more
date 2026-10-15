export const EN_SETTINGS = {
    // アメリカだと10が逆に銀色
    // https://blg.seirei.ac.jp/intl/files/usa_currency.pdf
    coinColor: [0.40, 0.2, 0.07, 1],
    bottomColor: [0.96, 0.96, 0.79, 1],
    
};

export class LangSettings {
    /**
     * @type{{bottomColor: [number, number, number, number]}}
     */
    static #current;
    static init() {
        // 本当はセーブデータの言語に応じて設定
        this.#current = EN_SETTINGS;

        // セーブデータがない場合は設定操作をawaitしないといけない

        // 本来はpromiseを返してawaitしてもらう
    }

    static getCurrent() {
        return this.#current;
    }
}

export function initLang() {
    currentLangSettings = EN_SETTINGS;
}