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
 * @param {boolean} visible 
 */
export function setDisplay(element, visible) {
    element.style.display = visible ? "block" : "none";
}