/**
 * 
 * @param {HTMLElement} element 
 * @param {boolean} visible 
 */
export function setVisibility(element, visible) {
    element.style.visibility = visible ? "visible" : "hidden";
}

// 
/**
 * visibleをinheritに設定
 * （子要素をvisibleにすると親要素がhiddenでも見えてしまうため）
 * https://stackoverflow.com/a/24999109
 * @param {HTMLElement} element 
 */
export function setVisibilityInherit(element) {
    element.style.visibility = "inherit";
}

/**
 * 
 * @param {HTMLElement} element 
 * @param {boolean} visible 
 */
export function setDisplay(element, visible) {
    element.style.display = visible ? "block" : "none";
}