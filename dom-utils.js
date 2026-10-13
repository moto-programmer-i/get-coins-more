/**
 * 
 * @param {HTMLElement} element 
 * @param {boolean} visible 
 */
export function setVisibility(element, visible) {
    element.style.visibility = visible ? "visible" : "hidden";
}