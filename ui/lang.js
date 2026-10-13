import { setVisibility } from "../dom-utils.js";
import { LANG_EN, LANG_JP, setLang } from "../savedata.js";

/**
 * @type{() => void}
 */
let onChanged;

const ui = document.getElementById("ui");
const lang = document.getElementById("lang");

// ボタンの初期化
const en = document.getElementById("en");
en.onclick = (ev) => {
    setLang(LANG_EN);
    showLang(false);
    onChanged();
} ;
const jp = document.getElementById("jp");
jp.onclick = (ev) => {
    setLang(LANG_JP);
    showLang(false);
    onChanged();
} ;

export function showLang(visible) {
    setVisibility(ui, visible);
    setVisibility(lang, visible);
}

/**
 * 
 * @param {() => void)} func 
 */
export function changeLang(func) {
    onChanged = func;
    showLang(true);
}