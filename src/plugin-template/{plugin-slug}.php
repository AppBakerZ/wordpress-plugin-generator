<?php
/**
 * The WordPress Plugin Boilerplate.
 *
 * A foundation off of which to build well-documented WordPress plugins that also follow
 * WordPress coding standards and PHP best practices.
 *
 * @package   {plugin-class-name}
 * @author    {author-name} <{author-email}>
 * @license   GPL-2.0+
 * @link      {plugin-uri}
 * @copyright 2013 {owner-name} {owner-email} {owner-uri}
 *
 * @wordpress-plugin
 * Plugin Name: {plugin-name}
 * Plugin URI:  {plugin-uri}
 * Description: {plugin-desc}
 * Version:     0.1.0
 * Author:      {author-name}
 * Author URI:  {author-uri}
 * Text Domain: {plugin-slug}-locale
 * License:     GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 * Domain Path: /lang
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

define( '{plugin-class-name-upper}_VERSION', '0.1' );

define( '{plugin-class-name-upper}_REQUIRED_WP_VERSION', '3.0' );

if ( ! defined( '{plugin-class-name-upper}_PLUGIN_BASENAME' ) )
	define( '{plugin-class-name-upper}_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );

if ( ! defined( '{plugin-class-name-upper}_PLUGIN_NAME' ) )
	define( '{plugin-class-name-upper}_PLUGIN_NAME', trim( dirname( {plugin-class-name-upper}_PLUGIN_BASENAME ), '/' ) );

if ( ! defined( '{plugin-class-name-upper}_PLUGIN_DIR' ) )
	define( '{plugin-class-name-upper}_PLUGIN_DIR', untrailingslashit( dirname( __FILE__ ) ) );

if ( ! defined( '{plugin-class-name-upper}_PLUGIN_URL' ) )
	define( '{plugin-class-name-upper}_PLUGIN_URL', untrailingslashit( plugins_url( '', __FILE__ ) ) );



// include plugin's class file
require_once( plugin_dir_path( __FILE__ ) . 'inc/class-{plugin-slug}.php' );
require_once( plugin_dir_path( __FILE__ ) . 'inc/admin-settings.php' );

// Register hooks that are fired when the plugin is activated, deactivated, and uninstalled, respectively.
register_activation_hook( __FILE__, array( '{plugin-class-name}', 'activate' ) );
register_deactivation_hook( __FILE__, array( '{plugin-class-name}', 'deactivate' ) );

{plugin-class-name}::get_instance();