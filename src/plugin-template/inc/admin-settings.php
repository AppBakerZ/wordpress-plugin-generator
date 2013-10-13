<?php
/**
 * Admin class for {plugin-name}
 *
// @include ../../temp/header-comments.txt
 */

class {plugin-class-name}_Admin {

  /**
   * Instance of this class.
   *
   * @since    0.1.0
   * @var      object
   */
  protected static $instance = null;
  
  
  /**
   * Slug of the plugin options screen.
   *
   * @since    0.1.0
   * @var      string
   */
  protected $plugin_screen_hook_suffix = null;

  protected $settings = null;

  /**
   * Initialize the plugin settings page.
   *
   * @since     0.1.0
   */
  private function {plugin-class-name}_Admin() {

  }

  /**
   * Return an instance of this class.
   *
   * @since     0.1.0
   * @return    object    A single instance of this class.
   */
  public static function get_instance() {

    // If the single instance hasn't been set, set it now.
    if ( null == self::$instance ) {
      self::$instance = new self;
    }

    return self::$instance;
  }

  /**
   * Handles filter_action_links filter. Adds the settings link on plugins page
   *
   * @since    0.1.0
   */
  public static function filter_action_links( $links, $file ) {
    if ( $file != {plugin-class-name}_Info::$plugin_basename )
      return $links;

    $settings_link = '<a href="' . menu_page_url( {plugin-class-name}_Info::settings_page_slug, false ) . '">'
      . esc_html( __( 'Settings', '{plugin-slug}' ) ) . '</a>';

    array_push( $links, $settings_link );

    return $links;
  }

  /**
   * Handles admin_menu action
   * Register the administration menu for this plugin into the WordPress Dashboard menu.
   *
   * @since    0.1.0
   */
  public function handle_admin_menu() {
    add_action( 'admin_init', array( $this, 'handle_admin_init') );
    $this->plugin_screen_hook_suffix = add_options_page( 
            __('{plugin-name} Options', '{plugin-slug}'),     /* The title of the page when the menu is selected */
            __('{plugin-name}', '{plugin-slug}'),/* The text for the menu */
            'manage_options',                              /* capability required for this menu to be displayed to user */
            {plugin-class-name}_Info::settings_page_slug , /* menu slug that is used when adding setting sections */
            array($this, 'add_options_page')               /* callback to output the content for this page */
          );
    
    // Load admin style sheet and JavaScript.
    add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_styles' ) );
    add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_scripts' ) );
    
  }

  /**
   * Register and enqueue admin-specific style sheet.
   *
   * @since     0.1.0
   * @return    void
   */
  public function enqueue_admin_styles($screen_suffix) {
    // Return early if no settings page is registered
    if ( ! isset( $this->plugin_screen_hook_suffix ) ) {
      return;
    }

    if ( $screen_suffix == $this->plugin_screen_hook_suffix ) {
      wp_enqueue_style( {plugin-class-name}_Info::slug .'-admin-styles',
                        {plugin-class-name}_Info::$plugin_url . '/css/admin.css', 
                        array(),
                        {plugin-class-name}_Info::version );
    }
  }

  /**
   * Register and enqueue admin-specific JavaScript.
   *
   * @since     0.1.0
   *
   * @return    void
   */
  public function enqueue_admin_scripts($screen_suffix) {
    // Return early if no settings page is registered
    if ( ! isset( $this->plugin_screen_hook_suffix ) ) {
      return;
    }

    if ( $screen_suffix == $this->plugin_screen_hook_suffix ) {
      wp_enqueue_script( {plugin-class-name}_Info::slug . '-admin-script', 
                         {plugin-class-name}_Info::$plugin_url . '/js/admin.js',
                         array( 'jquery' ),
                        {plugin-class-name}_Info::version );
    }
  }

  public function add_options_page() {
    ?>
    <div class="wrap">
      <?php screen_icon(); ?>
      <h2><?php printf( __('{plugin-name} Options', '{plugin-slug}') ) ?></h2>
      <form action="options.php" method="POST">
      <?php 
        settings_fields( '{plugin-slug}-settings-group' ); 
        do_settings_sections( {plugin-class-name}_Info::settings_page_slug ); 
        $this->render_submit_button();
      ?>
      </form>
    </div>
    <?php
  }
  
  private function render_submit_button() {
    // submit_button was introduced in WP 3.1.0 so fallback to submit button html for older versions
    if (function_exists('submit_button')) {
      submit_button();
      return;
    }
    ?>

    <p class="submit">
      <input type="submit" name="submit" id="submit" class="button button-primary" value="<?php echo _( 'Save Changes' ); ?>"/>
    </p>

    <?php
  }

  /**
   * Handles admin_init action
   * Adds sections and fields on settings page using settings API
   *
   * @since    0.1.0
   */
  public function handle_admin_init() {
    add_filter( 'plugin_action_links', array('{plugin-class-name}_Admin','filter_action_links'), 10, 2 );
    $this->settings = get_option( '{plugin-slug}-settings' );

    register_setting( '{plugin-slug}-settings-group', '{plugin-slug}-settings', array($this, 'validate_plugin_options') );
   
    $page = {plugin-class-name}_Info::settings_page_slug;

    // Make 2 Sections
    $sections = array(
                  'required_settings_section', 
                  'general_settings_section'
                );
    
    $this->add_section( $sections[0], __('REQUIRED_SETTING_TITLE', '{plugin-slug}'), 'add_required_settings_section' );
    $this->add_section( $sections[1], __('GENERAL_SETTING_TITLE', '{plugin-slug}'), 'add_general_settings_section' );


    // Fields - Required Settings section
    add_settings_field( '{plugin-slug}-req-setting-1', 
                        __('REQUIRED_SETTING_1', '{plugin-slug}'),
                        array($this, 'add_text_field'),
                        $page,
                        $sections[0],
                        array('field_name' => 'req-setting-1') );
    add_settings_field( '{plugin-slug}-req-setting-2',
                        __('REQUIRED_SETTING_2', '{plugin-slug}'),
                        array($this, 'add_text_field'),
                        $page,
                        $sections[0],
                        array('field_name' => 'req-setting-2') );

    // Fields - General Settings section
    add_settings_field( '{plugin-slug}-gen-setting-1',
                        __('GENERAL_SETTING_1', '{plugin-slug}'),
                        array($this, 'add_text_field'),
                        $page,
                        $sections[1],
                        array('field_name' => 'gen-setting-1') );
    add_settings_field( '{plugin-slug}-gen-setting-2',
                        __('GENERAL_SETTING_2', '{plugin-slug}'),
                        array($this, 'add_text_field'),
                        $page,
                        $sections[1],
                        array('field_name' => 'gen-setting-2') );
  }
  
  private function add_section($section, $localized_title, $function_name) {
    add_settings_section( $section, /* string for use in the 'id' attribute of tags */
                          $localized_title, /* title of the section */
                          array($this, $function_name), /* function that fills the section with the desired content */
                          {plugin-class-name}_Info::settings_page_slug /* The menu slug on which to display this section. should be same as passed in add_options_page() */
                        );
  }

  public function add_text_field( $args ) {
    $field_name = $args['field_name'];
    
    $field = isset($this->settings[$field_name]) ? esc_attr(  $this->settings[$field_name] ) : "";
    echo "<input class='regular-text' type='text' name='{plugin-slug}-settings[$field_name]' value='$field' />";
    
    if ( isset( $args['help_text'] ) ) {
      echo "<p class='description'>" . $args['help_text'] . "</p>";
    }
  }

  /********************** General Settings Related **********************/

  /**
  * Displays the descriptive text for general settings section
  * Could be any html
  */
  public function add_general_settings_section() {
    printf(__('GENERAL_SETTING_AREA_DESCRIPTION', '{plugin-slug}'));
  }

  /********************** Required Settings Related **********************/
  
  /**
  * Displays the descriptive text for required settings section.
  * Could be any html
  */
  public function add_required_settings_section() { 
    printf(__('REQUIRED_SETTING_AREA_DESCRIPTION', '{plugin-slug}'));
  }

  /********************** Validation for Options Form **********************/
  
  /**
   * Sanitize user input before it gets saved to database
   */
  public function validate_plugin_options($inputs) {

    // retrieve old settings
    $options = get_option('{plugin-slug}-settings');

    /*
    $val = trim($input['req-setting-1']);
    if(preg_match('/^[a-z0-9]{32}$/i', $val)) { // put validation logic for req-setting-1 here
      $options['req-setting-1'] = $val;    
    }
    else {
      $options['req-setting-1'] = '';
    }
    */
    
    // return the settings that you want to be saved.
    return $inputs;
  }
  

}