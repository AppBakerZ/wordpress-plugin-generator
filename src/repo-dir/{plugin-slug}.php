<?php
/**
 * {plugin-desc}
 * 
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

add_filter('locale', '{plugin-class-name}_handle_locale_filter');

function {plugin-class-name}_handle_locale_filter($locale) {
  return "en_TEST";
}

 
 // include plugin info file
require( dirname( __FILE__ ) . '/src/{plugin-slug}.php' );
