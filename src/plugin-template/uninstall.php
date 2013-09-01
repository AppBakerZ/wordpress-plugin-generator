<?php
/**
 * Fired when the plugin is uninstalled.
 *
#INCLUDE header-comments
 */

// If uninstall, not called from WordPress, then exit
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

// Define uninstall functionality here