<?php
/**
 * {plugin-desc}
 * 
// @include ../../temp/header-comments.txt
 *
 * @wordpress-plugin
 * Plugin Name: {plugin-name}
 * Plugin URI:  {plugin-uri}
 * Description: {plugin-desc}
 * Version:     ___version___
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

    // @ifdef SETTINGSPAGE
  	const settings_page_slug = '{plugin-slug}-options';
    // @endif

	/**
	 * Version of the plugin.
	 *
	 * @since    0.1.0
	 * @var      string
	 */
  	const version = '___version___';

  	const required_wp_version = '3.0';
    
    public static $plugin_dir = '';
    
    public static $plugin_url = '';

    public static $plugin_basename = '';

    // @@ifdef PRODUCTION
    // For demo build, the values of capability variables are overridden in init()
    // @@endif
    public static $capability_for_settings    = 'manage_options';
    public static $capability_for_custom_post = 'post';


    /**
     * This function is called once on plugin load. It will initialize the static variables and also sets up appropriate hooks .
     *
     * @since    0.1.0
     */
  	public static function init() {
      self::$plugin_dir = untrailingslashit( dirname( __FILE__ ) );
      self::$plugin_url = untrailingslashit( plugins_url( '', __FILE__ ) );
      
      $plugin_basename = plugin_basename( __FILE__ );
      $plugin_basename = explode("src/", $plugin_basename);
      self::$plugin_basename = implode( $plugin_basename );

      // @@ifdef ALWAYS_FALSE
      // ALWAYS_FALSE is never defined in any GRUNT task so the if statement and appropriate braces are always removed
      if (false) {
      // @@endif
      // @@ifndef PRODUCTION
      // Override the default capabilities for demo build
      self::$capability_for_settings = 'manage_options_{plugin-slug}';
      self::$capability_for_custom_post = 'post_{plugin-slug}';
      // @@endif
      // @@ifdef ALWAYS_FALSE
      }
      // @@endif

      // @ifdef SETTINGSPAGE
      // Load admin only when required
      add_action( 'admin_menu', array('{plugin-class-name}_Info','handle_admin_menu') );
      // @endif
    }
    
    // @ifdef SETTINGSPAGE
    public static function handle_admin_menu() {
      require(plugin_dir_path(__FILE__) . 'inc/admin-settings.php');
      $admin = {plugin-class-name}_Admin::get_instance();
      $admin->handle_admin_menu();
    }
    // @endif

}

{plugin-class-name}_Info::init();

// include plugin's class file
require( plugin_dir_path( __FILE__ ) . 'inc/class-{plugin-slug}.php' );
// @ifdef WIDGETS
// @include ../../temp/widgets.php
// @endif
// Register hooks that are fired when the plugin is activated, deactivated, and uninstalled, respectively.
register_activation_hook( __FILE__, array( '{plugin-class-name}', 'activate' ) );
register_deactivation_hook( __FILE__, array( '{plugin-class-name}', 'deactivate' ) );

{plugin-class-name}::get_instance();