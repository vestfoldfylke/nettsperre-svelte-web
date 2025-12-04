/** Dispatch event on click outside of node */
/**
 * Adds an event listener to the document that dispatches a 'click_outside' event
 * on the given node if a click occurs outside of it.
 *
 * @param {HTMLElement} node - The DOM element to detect outside clicks.
 * @returns {Object} An object with a destroy method to remove the event listener.
 */
export function clickOutside(node) {
	const handleClick = (event) => {
		if (node && !node.contains(event.target) && !event.defaultPrevented) {
			node.dispatchEvent(new CustomEvent("click_outside", node))
		}
	}

	document.addEventListener("click", handleClick, true)

	return {
		destroy() {
			document.removeEventListener("click", handleClick, true)
		}
	}
}
