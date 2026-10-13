
export const LANG_EN = "en";
export const LANG_JP =  "jp";

export const SAVE_DATA = {
    lang: null
};


/**
 * 
 * @param {string} lang LANG_EN | LANG_JP
 */
export function setLang(lang) {
    SAVE_DATA.lang = lang;
}

