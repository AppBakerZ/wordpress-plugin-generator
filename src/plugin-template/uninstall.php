<?php
/**
 * Fired when the plugin is uninstalled.
 *
// @include ../../temp/header-comments.txt
 */

// If uninstall, not called from WordPress, then exit
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

// Define uninstall functionality here