<?php
/**
 * Defines {custom-post-class-name}_Custom_Post custom post. This class contains functions for customizing 
 * the add/edit page and posts list page.
 *
// @include ../../../temp/header-comments.txt
 **/

class {plugin-class-name}_{custom-post-class-name}_Custom_Post 
      extends {plugin-class-name}_Custom_Post_Base {

  /* Default values of post meta data to be used in metaboxes */
  // TODO: Default values for variables must be initialized
  private static $default_values = array(
      {custom-post-defaults}
    );

  public function {plugin-class-name}_{custom-post-class-name}_Custom_Post() {
    parent::__construct();
    $this->post_type = '{custom-post-slug}';
    $this->prefix = {plugin-class-name}_Info::slug . "-" . $this->post_type;

    // constructor must be called from init
    $this->handle_init();
  }

  private function handle_init() {

    //register post type and taxonomy
    $this->register_post_type();
    $this->register_taxonomy();
    $this->register_script_and_style();

    //Add hook for admin admin style sheet and javascript.
    add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_styles_and_scripts'));

  }

  /**
   * Registers a new custom post type
   */
  private function register_post_type() {

    $labels = array(
      'name' => __('{custom-post-name}', '{plugin-slug}'),
      'singular_name' => __('{custom-post-name-singular}', '{plugin-slug}'),
      'add_new' => __('Add New', '{plugin-slug}'),
      'add_new_item' => __('Add New {custom-post-name-singular}', '{plugin-slug}'),
      'edit_item' => __('Edit {custom-post-name-singular}', '{plugin-slug}'),
      'new_item' => __('New {custom-post-name-singular}', '{plugin-slug}'),
      'view_item' => __('View {custom-post-name-singular}', '{plugin-slug}'),
      'not_found' => __('No {custom-post-name-singular} found', '{plugin-slug}'),
      'not_found_in_trash' => __('No {custom-post-name-singular} found in Trash', '{plugin-slug}'),
      'all_items' => __('All {custom-post-name}', '{plugin-slug}'),
      'search_items' => __('Search {custom-post-name}', '{plugin-slug}'),
      'parent_item_colon' => false,
      'menu_name' => __('{custom-post-name}', '{plugin-slug}')
    );

    $args = array(
      /* (array) (optional) labels - An array of labels for this post type. By default post labels are used 
         for non-hierarchical types and page labels for hierarchical ones. 
         Default: if empty, name is set to label value, and singular_name is set to name value*/
      'labels' => $labels, 
      
      /* (boolean) (optional) Whether a post type is intended to be used publicly 
         either via the admin interface or by front-end users.
         Default: false */
      'public' => false,

      /* (boolean) (optional) Whether queries can be performed on the front end as part of parse_request(). Default: value of public argument */
      'publicly_queryable' => true,

      /* (boolean) (optional) Whether to generate a default UI for managing this post type in the admin.
         Default: value of public argument */
      'show_ui' => true, 

      /* (boolean or string) (optional) Where to show the post type in the admin menu. show_ui must be true.
          Default: value of show_ui argument */
      'show_in_menu' => true,

      /* (boolean or string) (optional) Sets the query_var key for this post type.
         Default: true - set to $post_type */
      'query_var' => true, 

      // TODO: Kashif see rewrite, this should be same as wp settings
      /* (boolean or array) (optional) Triggers the handling of rewrites for this post type.
         To prevent rewrites, set to false.
         Default: true and use $post_type as slug */
      'rewrite' => false, // TODO: Kashif 

      /* (string or array) (optional) The string to use to build the read, edit and delete 
         capabilities. May be passed as an array to allow for alternative plurals when using this
         argument as a base to construct the capabilities.
         Default: "post" */
      'capability_type' => 'post', 

      /* (boolean or string) (optional) Enables post type archives.
      Will use $post_type as archive slug by default.
      Default: false */
      'has_archive' => true,

      /* (boolean) (optional) Whether the post type is hierarchical (e.g. page).
         Allows Parent to be specified. The 'supports' parameter should contain 'page-attributes' to 
         show the parent select box on the editor page. Default: false */
      'hierarchical' => false,

      /* (integer) (optional) The position in the menu order the post type should appear. 
         show_in_menu must be true. Default: null - defaults to below Comments */
      'menu_position' => null,

      /* (array/boolean) (optional) An alias for calling add_post_type_support() directly. 
         As of 3.5, boolean false can be passed as value instead of an array to prevent default (title and editor) behaviour.
         Default: title and editor */
      'supports' => array('title', 'thumbnail')
    );

    //Register Post type
    register_post_type( $this->post_type, $args);

  }


  /**
   * Registers taxonomy for custom post type
   */
  private function register_taxonomy() {

    $labels = array(
      'name'              => __('{custom-post-name-singular} Categories', '{plugin-slug}'),
      'singular_name'     => __('{custom-post-name-singular} Category', '{plugin-slug}'),
      'search_items'      => __('Search {custom-post-name-singular} Categories', '{plugin-slug}'),
      'all_items'         => __('All {custom-post-name-singular} Categories', '{plugin-slug}'),
      'parent_item'       => __('Parent {custom-post-name-singular} Category', '{plugin-slug}'),
      'parent_item_colon' => __('Parent {custom-post-name-singular} Category:', '{plugin-slug}'),
      'edit_item'         => __('Edit {custom-post-name-singular} Category', '{plugin-slug}'),
      'update_item'       => __('Update {custom-post-name-singular} Category', '{plugin-slug}'),
      'add_new_item'      => __('Add New {custom-post-name-singular} Category', '{plugin-slug}'),
      'new_item_name'     => __('New {custom-post-name-singular} Category Name', '{plugin-slug}'),
      'menu_name'         => __('{custom-post-name-singular} Categories', '{plugin-slug}'),
    );

    $args = array(
      'hierarchical' => true,
      'labels' => $labels,
      'show_ui' => true,
      'show_admin_column' => true,
      'query_var' => true,
      'rewrite' => false //array('slug' => '{custom-post-name-singular} Category') // TODO: Kashif see rewrite, this should be same as wp settings
    );

    //Register Taxonomy
    register_taxonomy('{custom-post-name-singular} Category', array( $this->post_type ), $args);
  }


  /**
   * Register script and stylesheet for custom post admin page.
   * These would be enqueued later only when necessary.
   *
   * @since    0.1.0
   */
  private function register_script_and_style() {

    parent::register_script_and_style_base();

    wp_register_script( $this->prefix . '-script',
                        {plugin-class-name}_Info::$plugin_url . '/assets/js/admin-edit-{custom-post-slug}.js',
                        array( 'jquery' ),
                        {plugin-class-name}_Info::version );

    wp_register_style( $this->prefix . '-style',
                      {plugin-class-name}_Info::$plugin_url . '/assets/css/admin-edit-{custom-post-slug}.css',
                      array(),
                      {plugin-class-name}_Info::version );
  }

  public function enqueue_admin_styles_and_scripts($screen_suffix) {
    //Access the global $wp_version variable to see which version of WordPress is installed.
    global $wp_version;
    global $post;

    // check that we are on post add/edit page
    if ( $screen_suffix != 'post-new.php' && $screen_suffix != 'post.php' ) {
      return;
    }

    // check that post being edited is our custom post type
    if ( $this->post_type !== $post->post_type ) {
      return;
    }

    /*
    //If the WordPress version is greater than or equal to 3.5, then load the new WordPress color picker.
    if (3.5 <= $wp_version) {
      //Both the necessary css and javascript have been registered already by WordPress, so all we have to do is load them with their handle.
      wp_enqueue_style('wp-color-picker');
      wp_enqueue_script('wp-color-picker');

    } //If the WordPress version is less than 3.5 load the older farbtasic color picker.
    else {
      //As with wp-color-picker the necessary css and javascript have been registered already by WordPress, so all we have to do is load them with their handle.
      wp_enqueue_style('farbtastic');
      wp_enqueue_script('farbtastic');
    }
    */

    //Enqueue base css file
    foreach(parent::$styles as $style) {
      wp_enqueue_style($style);
    }

    //Enqueue our custom css file
    wp_enqueue_style($this->prefix . '-style');

    //Enqueue our custom javascript file
    wp_enqueue_script($this->prefix . '-script');
  }

  /***************************** Override Template Pattern Functions *********************************/

  protected function get_default_values() {
    return self::$default_values;
  }

  /**
   * Child classes must override filter_post_data_on_save to save and sanitize post meta data 
   * 
   * @param original Associative array of meta data values from database
   * @param changed Associative array of meta data values submitted by user
   * 
   * @return void
   **/
  protected function filter_post_data_on_save($original, $changed) {
    // TODO: Implement custom sanitization logic here or leave default implementation
    return $changed;
  }


  /*
   * Called by add_meta_boxes handler of base class
   * */
  protected function add_meta_boxes() {
    // Add as many meta boxes as you need here
// @include ../../../temp/{custom-post-slug}-handle-add-meta-boxes.inc
  }

  /********************************** Metaboxes Related ******************************************/
// @include ../../../temp/{custom-post-slug}-metaboxes.inc

}

?>