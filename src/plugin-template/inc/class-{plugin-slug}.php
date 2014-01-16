<?php
/**
 * Plugin class.
 *
// @include ../../../temp/header-comments.txt
 */
class {plugin-class-name} {

  /**
   * Instance of this class.
   *
   * @since    0.1.0
   * @var      object
   */
  protected static $instance = null;

  /**
   * Initialize the plugin by setting localization, filters, and administration functions.
   *
   * @since     0.1.0
   */
  private function {plugin-class-name}() {
  	// Handle init
  	add_action( 'init', array( $this, 'handle_init' ) );
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
   * Handles init action.
   *
   * @since     0.2.0
   * @return    void
   */
  public function handle_init() {
    $this->load_plugin_textdomain();

  // @ifdef CUSTOMPOSTS
    $this->load_custom_post_types();
  // @endif

    $this->register_script_and_style();

		// Load public-facing style sheet and JavaScript.
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_styles' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
  }
  
  // @ifdef CUSTOMPOSTS
  private function load_custom_post_types() {
    require(plugin_dir_path(__FILE__) . 'custom-post-base.php');
// @include ../../../temp/final-includes/custom-post-require.inc  
  }
  // @endif
  

	/**
	 * Fired when the plugin is activated.
	 *
	 * @since    0.1.0
	 * @param    boolean    $network_wide    True if WPMU superadmin uses "Network Activate" action, false if WPMU is disabled or plugin is activated on an individual blog.
	 */
	public static function activate( $network_wide ) {
    $version_key = '{plugin-slug}-version';
    $new_version = {plugin-class-name}_Info::version;
    $old_version = get_option($version_key, "");
    
    if ($old_version != $new_version) {
      // Execute your upgrade logic here

      // Then update the version value
      update_option($old_version, $new_version);
    }
    
	}

	/**
	 * Fired when the plugin is deactivated.
	 *
	 * @since    0.1.0
	 * @param    boolean    $network_wide    True if WPMU superadmin uses "Network Deactivate" action, false if WPMU is disabled or plugin is deactivated on an individual blog.
	 */
	public static function deactivate( $network_wide ) {
		// Define deactivation functionality here
	}

	/**
	 * Load the plugin text domain for translation.
	 *
	 * @since    0.1.0
	 */
	private function load_plugin_textdomain() {

		$domain = {plugin-class-name}_Info::slug;
		$locale = apply_filters( 'plugin_locale', get_locale(), $domain );

    $plugin_rel_path = dirname(dirname(__FILE__)) . '/lang/';
    $plugin_rel_path = substr($plugin_rel_path, strlen(WP_PLUGIN_DIR)+1 );

		load_textdomain( $domain, WP_LANG_DIR . '/' . $domain . '/' . $domain . '-' . $locale . '.mo' );
		load_plugin_textdomain( $domain, FALSE, $plugin_rel_path );
	}

  /**
   * Register public-facing script and style sheet. These would be enqueued later only when necessary.
   *
   * @since    0.1.0
   */
  private function register_script_and_style() {
    wp_register_script( {plugin-class-name}_Info::slug . '-plugin-script',
                        {plugin-class-name}_Info::$plugin_url . '/assets/js/public.js',
                        array( 'jquery' ),
                        {plugin-class-name}_Info::version );

    wp_register_style( {plugin-class-name}_Info::slug . '-plugin-style',
                      {plugin-class-name}_Info::$plugin_url . '/assets/css/public.css',
                      array(),
                      {plugin-class-name}_Info::version );
  }

  /**
   * Register and enqueue public-facing style sheet.
   *
   * @since    0.1.0
   */
  public function enqueue_styles() {
    wp_enqueue_style({plugin-class-name}_Info::slug . '-plugin-style');
  }

  /**
   * Register and enqueues public-facing JavaScript files.
   *
   * @since    0.1.0
   */
  public function enqueue_scripts() {
    wp_enqueue_script({plugin-class-name}_Info::slug . '-plugin-script');
  }

}