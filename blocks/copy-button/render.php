<?php
/**
 * Copy Button block: a piece of text (a coupon code, an email address) and a button that copies it. Without JavaScript
 * the text is still there to select (a button-only block keeps it hidden until copying fails); view.js (Interactivity API store anypress/copy-button) does the copying.
 * A block with no text prints nothing.
 *
 * @package AnyPress_Blocks
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Unused.
 * @var WP_Block $block      Block instance.
 */

defined( 'ABSPATH' ) || exit;

$anypress_blocks_copy_text = trim( (string) ( $attributes['text'] ?? '' ) );
if ( '' === $anypress_blocks_copy_text ) {
	return;
}
$anypress_blocks_copy_label  = '' !== ( $attributes['label'] ?? '' ) ? $attributes['label'] : __( 'Copy', 'anypress-blocks' );
$anypress_blocks_copy_copied = '' !== ( $attributes['copiedLabel'] ?? '' ) ? $attributes['copiedLabel'] : __( 'Copied', 'anypress-blocks' );
$anypress_blocks_copy_show   = ! empty( $attributes['showText'] ?? true );

$anypress_blocks_copy_wrapper = get_block_wrapper_attributes(
	array(
		'class'               => $anypress_blocks_copy_show ? '' : 'is-button-only',
		'data-wp-interactive' => 'anypress/copy-button',
		'data-wp-context'     => wp_json_encode(
			array(
				'text'   => $anypress_blocks_copy_text,
				'copied' => false,
				'done'   => $anypress_blocks_copy_copied,
			)
		),
		'data-wp-class--is-copied' => 'context.copied',
	)
);
?>
<div <?php echo $anypress_blocks_copy_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by get_block_wrapper_attributes(). ?>>
	<code class="wp-block-anypress-copy-button__text"<?php echo $anypress_blocks_copy_show ? '' : ' hidden'; ?>><?php echo esc_html( $anypress_blocks_copy_text ); ?></code>
	<button type="button" class="wp-block-anypress-copy-button__button wp-element-button" data-wp-on--click="actions.copy">
		<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><rect x="8" y="8" width="12" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2" fill="none" stroke="currentColor" stroke-width="2"/></svg>
		<span class="wp-block-anypress-copy-button__label" data-wp-bind--hidden="context.copied"><?php echo esc_html( $anypress_blocks_copy_label ); ?><?php if ( ! $anypress_blocks_copy_show ) : ?><span class="screen-reader-text"> <?php echo esc_html( $anypress_blocks_copy_text ); ?></span><?php endif; ?></span>
		<span class="wp-block-anypress-copy-button__copied" hidden data-wp-bind--hidden="!context.copied"><?php echo esc_html( $anypress_blocks_copy_copied ); ?></span>
	</button>
	<span class="screen-reader-text" role="status" data-wp-text="state.announcement"></span>
</div>
