import { setVisibility } from "../dom-utils.js";

const ui = document.getElementById("ui");

/**
 * 
 * @param {HTMLElement} child ui要素の子要素
 * @param {boolean} visibility 表示
 */
export function showUI(child, visibility) {
    child.style.display = "block";
    setVisibility(ui, visibility);
}