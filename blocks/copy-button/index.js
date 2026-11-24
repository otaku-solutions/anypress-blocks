// Copy Button block, editor side. Plain JavaScript on the editor's globals (no build step).
// Type the text to copy straight into the block; the sidebar sets the button's words. On the site view.js copies it.
(function (wp) {
	const { registerBlockType } = wp.blocks;
	const { useBlockProps, InspectorControls, PlainText } = wp.blockEditor;
	const { PanelBody, TextControl, ToggleControl } = wp.components;
	const { createElement: el, Fragment } = wp.element;
	const { __ } = wp.i18n;

	registerBlockType('anypress/copy-button', {
		edit({ attributes: a, setAttributes }) {
			const blockProps = useBlockProps({ className: a.showText ? '' : 'is-button-only' });
			return el(
				Fragment,
				null,
				el(
					InspectorControls,
					null,
					el(
						PanelBody,
						{ title: __('Copy Button', 'anypress-blocks') },
						el(TextControl, {
							label: __('Text to copy', 'anypress-blocks'),
							help: __('A coupon code, an email address, a gift card number…', 'anypress-blocks'),
							value: a.text,
							onChange: (text) => setAttributes({ text }),
							__nextHasNoMarginBottom: true,
						}),
						el(ToggleControl, {
							label: __('Show the text beside the button', 'anypress-blocks'),
							checked: a.showText,
							onChange: (showText) => setAttributes({ showText }),
							__nextHasNoMarginBottom: true,
						}),
						el(TextControl, {
							label: __('Button words', 'anypress-blocks'),
							placeholder: __('Copy', 'anypress-blocks'),
							value: a.label,
							onChange: (label) => setAttributes({ label }),
							__nextHasNoMarginBottom: true,
						}),
						el(TextControl, {
							label: __('Words after copying', 'anypress-blocks'),
							placeholder: __('Copied', 'anypress-blocks'),
							value: a.copiedLabel,
							onChange: (copiedLabel) => setAttributes({ copiedLabel }),
							__nextHasNoMarginBottom: true,
						})
					)
				),
				el(
					'div',
					blockProps,
					a.showText
						? el(PlainText, {
							className: 'wp-block-anypress-copy-button__text',
							value: a.text,
							placeholder: __('WELCOME10', 'anypress-blocks'),
							'aria-label': __('Text to copy', 'anypress-blocks'),
							onChange: (text) => setAttributes({ text }),
						})
						: null,
					el('span', { className: 'wp-block-anypress-copy-button__button wp-element-button' }, a.label || __('Copy', 'anypress-blocks'))
				)
			);
		},
		save() {
			return null;
		},
	});
})(window.wp);
