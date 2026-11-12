/**
 * 
 * @param {HTMLElement} element 
 * @param {boolean} visible 
 */
export function setVisibility(element, visible) {
    element.style.visibility = visible ? "visible" : "hidden";
}

/**
 * 
 * @param {HTMLElement} element 
 */
export function setVisibilityToInherit(element) {
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