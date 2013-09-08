<?php
/**
 * {plugin-name} widget class.
 *
 * Encapsulates all functionality for widget
 *
// @include ../../temp/header-comments.txt
 *
 */

class {plugin-widget-class-name} extends WP_Widget {

  /*--------------------------------------------------*/
  /* Constructor
  /*--------------------------------------------------*/

  /**
   * Specifies the classname and description, instantiates the widget,
   * loads localization files, and includes necessary stylesheets and JavaScript.
   */
  public function __construct() {

    // TODO:  update classname and description
    parent::__construct(
      "{plugin-widget-id}",
      __( "Widget Name", "{plugin-name}" ),
      array(
        "classname"    =>  "widget-name-class",
        "description"  =>  __( "Short description of the widget goes here.", "{plugin-name}" )
      )
    );

    // Register site styles and scripts
    add_action( "wp_enqueue_scripts", array( $this, "register_widget_styles" ) );
    add_action( "wp_enqueue_scripts", array( $this, "register_widget_scripts" ) );

  } // end constructor

  /*--------------------------------------------------*/
  /* Widget API Functions
  /*--------------------------------------------------*/

  /**
   * Outputs the content of the widget.
   *
   * @param  array  args    The array of form elements
   * @param  array  instance  The current instance of the widget
   */
  public function widget( $args, $instance ) {

    extract( $args, EXTR_SKIP );

    echo $before_widget;

    // TODO:  Here is where you manipulate your widget's values based on their input fields

    include( {plugin-class-name-upper}_PLUGIN_DIR . "/views/{plugin-widget-id}.php" );

    echo $after_widget;

  } // end widget

  /**
   * Processes the widget's options to be saved.
   *
   * @param  array  new_instance  The previous instance of values before the update.
   * @param  array  old_instance  The new instance of values to be generated via the update.
   */
  public function update( $new_instance, $old_instance ) {

    $instance = $old_instance;

    // TODO:  Here is where you update your widget's old values with the new, incoming values

    return $instance;

  } // end widget

  /**
   * Generates the administration form for the widget.
   *
   * @param  array  instance  The array of keys and values for the widget.
   */
  public function form( $instance ) {

      // TODO:  Define default values for your variables
    $instance = wp_parse_args(
      (array) $instance
    );

    // TODO:  Store the values of the widget in their own variable

    // Display the admin form
    include( plugin_dir_path(__FILE__) . "/views/{plugin-widget-id}-admin.php" );

  } // end form

  /*--------------------------------------------------*/
  /* Public Functions
  /*--------------------------------------------------*/

  /**
   * Registers and enqueues widget-specific styles.
   */
  public function register_widget_styles() {
    wp_enqueue_style( "{plugin-widget-id}-styles", {plugin-class-name-upper}_PLUGIN_URL . "/css/{plugin-widget-id}.css" );
  }

  /**
   * Registers and enqueues widget-specific scripts.
   */
  public function register_widget_scripts() {
    wp_enqueue_script( "{plugin-widget-id}-script", {plugin-class-name-upper}_PLUGIN_URL . "/js/{plugin-widget-id}.js", array("jquery") );
  }
  
  public static function register_widget() {
    register_widget("{plugin-widget-class-name}");
  }
} // end class

add_action( "widgets_init", array( "{plugin-widget-class-name}", "register_widget" ) );
