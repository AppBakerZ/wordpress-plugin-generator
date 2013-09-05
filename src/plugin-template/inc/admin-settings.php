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
  
  
  private $settings = null;

	/**
	 * Initialize the plugin settings.
	 *
	 * @since     1.0.0
	 */
	private function __construct() {
	}

	/**
	 * Return an instance of this class.
	 *
	 * @since     1.0.0
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
	* Adds the settings link of plugins page
	*/
  public static function filter_action_links( $links, $file ) {
    if ( $file != {plugin-class-name-upper}_PLUGIN_BASENAME )
      return $links;

    $settings_link = '<a href="' . menu_page_url( '{plugin-slug}', false ) . '">'
      . esc_html( __( 'Settings', '{plugin-slug}' ) ) . '</a>';

    array_push( $links, $settings_link );

    return $links;
  }

	/**
	* Handles admin_menu action
	*/
	public function do_admin_menu() {
    self::get_instance()->_do_admin_menu();
  }
    
  private function _do_admin_menu() {
		add_options_page( 
      __('SETTING_PAGE_MENU_LABEL', '{plugin-slug}'), /* The title of the page when the menu is selected */
      __('SETTING_PAGE_MENU_LABEL', '{plugin-slug}'), /* The text for the menu */
      'manage_options', /* capability required for this menu to be displayed to user */
      '{plugin-slug}', /* menu slug */
      array($this, 'add_options_page') /* function to be called to output the content for this page */
    );
	}

	/**
	* Handles admin_init action
	*/
	public static function do_admin_init() {
    self::get_instance()->_do_admin_init();
  }
    
  private function _do_admin_init() {
    $this->settings = get_option( '{plugin-slug}-settings' );

		register_setting( '{plugin-slug}-settings-group', '{plugin-slug}-settings', array($this, 'validate_plugin_options') );
	 
		// Make 2 Sections
    $sections = array(
                  'required_settings_section', 
                  'general_settings_section'
                );
    
		//add_settings_section( 'required_settings_section', __('REQUIRED_SETTING_TITLE', '{plugin-slug}'), array($this, 'add_required_settings_section',) '{plugin-slug}' );
		//add_settings_section( 'general_settings_section', __('GENERAL_SETTING_TITLE', '{plugin-slug}'), array($this, 'add_general_settings_section'), '{plugin-slug}' );
		$this->add_section( $sections[0], __('REQUIRED_SETTING_TITLE', '{plugin-slug}'), 'add_required_settings_section' );
		$this->add_section( $sections[1], __('GENERAL_SETTING_TITLE', '{plugin-slug}'), 'add_general_settings_section' );

		// Fields - Required Settings section
		add_settings_field( 'add_req_setting_1', __('REQUIRED_SETTING_1', '{plugin-slug}'), array($this, 'add_req_setting_1'), '{plugin-slug}', $sections[0] );
		add_settings_field( 'add_req_setting_2', __('REQUIRED_SETTING_2', '{plugin-slug}'), array($this, 'add_req_setting_2'), '{plugin-slug}', $sections[0] );
		
		// Fields - General Settings section
		add_settings_field( 'add_gen_setting_1', __('GENERAL_SETTING_1', '{plugin-slug}'), array($this, 'add_gen_setting_1'), '{plugin-slug}', $sections[1] );
		add_settings_field( 'add_gen_setting_2', __('GENERAL_SETTING_2', '{plugin-slug}'), array($this, 'add_gen_setting_2'), '{plugin-slug}', $sections[1] );
	}
  
  private function add_section($section, $localized_title, $function_name) {
		add_settings_section( $section, /* string for use in the 'id' attribute of tags */
                          $localized_title, /* title of the section */
                          array($this, $function_name), /* function that fills the section with the desired content */
                          '{plugin-slug}' /* The menu slug on which to display this section */
                        );
  }

	private function add_textbox($field_name) {
		$field = esc_attr( $this->settings[$field_name] );
		echo "<input class='regular-text' type='text' name='{plugin-slug}-settings[$field_name]' value='$field' />";
	}

  public function add_options_page() {
		?>
		<div class="wrap">
			<?php screen_icon(); ?>
			<h2><?php printf( __('SETTING_PAGE_TITLE', '{plugin-slug}') ) ?></h2>
			<form action="options.php" method="POST">
				<?php settings_fields( '{plugin-slug}-settings-group' ); ?>
				<?php do_settings_sections( '{plugin-slug}' ); ?>
				<?php submit_button(); ?>
			</form>
		</div>
		<?php
	}
  
  /********************** General Settings Related **********************/

  /**
  * Displays the descriptive text for general settings section
  * Could be any html
  */
	public function add_general_settings_section() {
		printf(__('GENERAL_SETTING_AREA_DESCRIPTION', '{plugin-slug}'));
	}

	public function add_gen_setting_1() {
		$this->add_textbox( 'gen-setting-1' );
	}

	public function add_gen_setting_2() {
		$this->add_textbox( 'gen-setting-2' );
	}
  
  /********************** Required Settings Related **********************/
  
  /**
  * Displays the descriptive text for general settings section.
  * Could be any html
  */
	public function add_required_settings_section() { 
		printf(__('REQUIRED_SETTING_AREA_DESCRIPTION', '{plugin-slug}'));
  }

	public function add_req_setting_1() {
		$this->add_textbox( 'req-setting-1' );
	}

	public function add_req_setting_2() {
		$this->add_textbox( 'req-setting-2' );
	}

  /********************** Validation for Options Form **********************/
  
  public function validate_plugin_options($inputs) {
  
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
    
    
    return $options;
  }
  

}

add_action( 'admin_init', '{plugin-class-name}_Admin::do_admin_init' );
add_action( 'admin_menu', '{plugin-class-name}_Admin::do_admin_menu' );

add_filter( 'plugin_action_links', '{plugin-class-name}_Admin::filter_action_links', 10, 2 );
