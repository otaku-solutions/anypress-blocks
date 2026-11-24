// Copy Button blocks, on the Interactivity API: the button copies the block's text to the clipboard, says "Copied"
// for two seconds and tells screen readers. Where the browser won't copy (an http:// page, an old browser), it selects
// the text instead so the visitor can copy it themselves.
import { store, getContext, getElement, withScope } from '@wordpress/interactivity';

const timers = new WeakMap();
const selectText = (ref) => {
	const text = ref.closest('.wp-block-anypress-copy-button')?.querySelector('.wp-block-anypress-copy-button__text');
	if (!text) return;
	// A button-only block keeps its text hidden; show it, so there is something to select and copy by hand.
	text.hidden = false;
	const range = document.createRange();
	range.selectNodeContents(text);
	const selection = window.getSelection();
	selection.removeAllRanges();
	selection.addRange(range);
};

store('anypress/copy-button', {
	state: {
		get announcement() {
			const context = getContext();
			return context.copied ? context.done : '';
		},
	},
	actions: {
		*copy() {
			const context = getContext();
			const { ref } = getElement();
			try {
				yield navigator.clipboard.writeText(context.text);
			} catch (e) {
				selectText(ref);
				return;
			}
			context.copied = true;
			clearTimeout(timers.get(ref));
			timers.set(ref, setTimeout(withScope(() => { context.copied = false; }), 2000));
		},
	},
});
