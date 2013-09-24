<?php
/**
 * The WordPress Plugin Boilerplate.
 *
 * A foundation off of which to build well-documented WordPress plugins that also follow
 * WordPress coding standards and PHP best practices.
 *
// @include ../temp/header-comments.txt
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

/**
 * {plugin-name} MetaData class.
 *
 * Defines useful constants
 */

class {plugin-class-name}_Info {
	/**
	 * Unique identifier for your plugin.
	 *
	 * Use this value (not the variable name) as the text domain when internationalizing strings of text. It should
	 * match the Text Domain file header in the main plugin file.
	 *
	 * @since    0.1.0
	 * @var      string
	 */
  	const slug = '{plugin-slug}';
  	const base_name = '{plugin-slug}';

    // @ifdef SETTINGSPAGE
  	const settings_page_slug = '{plugin-slug}-options';
    // @endif

	/**
	 * Version of the plugin.
	 *
	 * @since    0.1.0
	 * @var      string
	 */
  	const version = '0.1.0';

  	const required_wp_version = '3.0';
    
    public static $plugin_dir = '';
    
    public static $plugin_url = '';

    public static $plugin_basename = '';

  	public static function init_static() {
      self::$plugin_dir = untrailingslashit( dirname( __FILE__ ) );
      self::$plugin_url = untrailingslashit( plugins_url( '', __FILE__ ) );
      self::$plugin_basename = plugin_basename( __FILE__ );
    }    

}

{plugin-class-name}_Info::init_static();

// include plugin's class file
require( plugin_dir_path( __FILE__ ) . 'inc/class-{plugin-slug}.php' );

// @ifdef SETTINGSPAGE
require( plugin_dir_path( __FILE__ ) . 'inc/admin-settings.php' );
// @endif

// @ifdef WIDGETS
// @include ../temp/widgets.php
// @endif


// Register hooks that are fired when the plugin is activated, deactivated, and uninstalled, respectively.
register_activation_hook( __FILE__, array( '{plugin-class-name}', 'activate' ) );
register_deactivation_hook( __FILE__, array( '{plugin-class-name}', 'deactivate' ) );

{plugin-class-name}::get_instance();