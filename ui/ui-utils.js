import { setVisibility } from "../dom-utils.js";

const ui = document.getElementById("ui");

/**
 * 
 * @param {string} childId ui要素の子要素のID
 * @param {boolean} visibility 表示
 */
export function showUI(childId, visibility) {
    setVisibility(document.getElementById(childId), visibility);
    setVisibility(ui, visibility);
}