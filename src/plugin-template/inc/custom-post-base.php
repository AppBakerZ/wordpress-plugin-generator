<?php
/**
 * Defines {plugin-class-name}_Custom_Post_Base class. 
 *
// @include ../../../temp/header-comments.txt
 **/

class {plugin-class-name}_Custom_Post_Base {

  /*
   * custom post slug. To be initialized by child class
   */
  protected $post_type = '';
  protected $prefix = '';
  protected $post_name_singular = '';

  private static $styles_registered = false;
  protected static $styles = array('{plugin-slug}-custom-post-base');
  protected static $scripts = array();

  public function {plugin-class-name}_Custom_Post_Base() {
    // constructor must be called from init

    //Add hook for handling save post action
    add_action('save_post', array($this, 'handle_save_post_base'));

    //Add hook for adding meta box
    add_action('add_meta_boxes', array($this, 'handle_add_meta_boxes_base'));

    //Change the status message while updating the postda
    add_filter('post_updated_messages', array($this, 'handle_post_updated_messages'));
  }

  /**
   * Initializes the post_meta_data instance field
   */
  protected function set_post_meta_data() {
    global $post;

    $saved_post_meta_data = get_post_meta($post->ID, $this->prefix);

    if (isset($saved_post_meta_data[0])) {
      $this->post_meta_data = $saved_post_meta_data[0];
    }
    else {
      $this->post_meta_data = array();
    }

    $default_values = $this->get_default_values();

    foreach ($default_values as $key => $values) {
      if (!isset($this->post_meta_data[$key])) {
        $this->post_meta_data[$key] = $default_values[$key];
      }
    }
  }

  /*
   * Handles add_meta_boxes action
   * */
  public function handle_add_meta_boxes_base() {
    $this->set_post_meta_data();

    // delegate to child class 
    $this->add_meta_boxes();

  }

  protected function add_meta_box($id, $title, $func_name) {
    $markup_id = {plugin-class-name}_Info::slug. "-" . $id;

    add_meta_box($markup_id, $title, array($this, $func_name), $this->post_type, 'normal');

    // To add a custom class to metabox: http://wordpress.stackexchange.com/questions/49773/how-to-add-a-class-to-meta-box
    // In general, the hook is postbox_classes_{$page}_{$meta_box_id}
    add_filter("postbox_classes_" . $this->post_type . "_$markup_id", array($this, 'handle_postbox_classes'));
  }

  /**
  * Handles postbox_classes_{$page}_{$meta_box_id} filter 
  */
  public function handle_postbox_classes($classes){
    // Add a common css class to all our meta boxes
    array_push($classes, {plugin-class-name}_Info::slug . '-metabox');
    return $classes;
  }

  /*
   * Check the custom post data before saving to database
   * */
  public function handle_save_post_base($post_id) {

    // Only handle the save of our custom post
    if (!isset($_POST['post_type']) || $this->post_type != $_POST['post_type']) {
      return;
    }

    $saved = get_post_meta($post_id, $this->prefix);
    $saved = $saved[0];

    $changed = $_POST[ $this->prefix ];

    // Compare saved and changed 
    // Call the subclass function to filter and return $changed
    $changed = $this->filter_post_data_on_save($original, $changed); 

    // Add or update data in DB
    add_post_meta($post_id, $this->prefix, $changed, true)
    || update_post_meta($post_id, $this->prefix, $changed);
  }


  protected function register_script_and_style_base() {
    // Base scripts and styles must be registered only once
    if (self::$styles_registered) {
      return;
    }

    self::$styles_registered = true;

    wp_register_style( self::$styles[0],
      {plugin-class-name}_Info::$plugin_url . '/assets/css/admin-custom-post-base.css',
      array( ),
      {plugin-class-name}_Info::version );
  }

  /******************************** Template Pattern Functions ************************************/

  protected function get_default_values() {
    // TODO: template - raise exception to enforce override
    return array();
  }

  public function handle_post_updated_messages($messages) {
    // TODO: template - raise exception to enforce override
    return $messages;    
  }


  /**
   * Child classes must override add_meta_boxes to add metaboxes 
   * @return void
   **/
  protected function add_meta_boxes() {
    // TODO: template - raise exception to enforce override
  }

  /**
   * Child classes must override filter_post_data_on_save to save and sanatize post meta data 
   * 
   * @param original Associative array of meta data values from database
   * @param changed Associative array of meta data values submitted by user
   * 
   * @return void
   **/
  protected function filter_post_data_on_save($original, $changed) {
    // TODO: template - raise exception to enforce override    
    return $changed;
  }

  /******************************** Metaboxes Fields helpers **************************************/

  protected function render_template_pre_field($setting_id, $localized_name) {
    ?>
    <div class="{plugin-slug}-row">
      <div class="{plugin-slug}-left-panel">
        <label for="<?php echo $this->prefix . '-' . $setting_id;?>"><?php echo $localized_name;?></label>
      </div>

      <div class="{plugin-slug}-right-panel">
    <?php
  }  

  protected function render_template_post_field() {
    ?>
      </div> <!-- end right-panel -->

    </div> <!-- end row -->
    <?php
  }

  /**
   * Outputs html for a <input> element corresponding a setting.
   * @param $setting_id
   * @param $localized_name
   * @param string $setting_type Value of type attribute of <input> element. Should be one of text, url, number, email.
   * @param array $classes Css classnames that should be added to input field. Use null for default classes.
   * @param array $attributes html attributes that should be added to input field. Use null for default classes.
   */
  protected function render_input_field($setting_id, $localized_name, $setting_type="text", $classes=array("large-text"), $attributes = array()) {
      if ($classes === null) {
        $classes = array("large-text");
      }
      if ($attributes === null) {
        $attributes = array();
      }
      $this->render_template_pre_field($setting_id, $localized_name);
    ?>
        <input type="<?php echo $setting_type;?>" name="<?php echo $this->prefix . '[' . $setting_id . ']';?>"
              <?php
                foreach($attributes as $key => $value){
                  error_log("key-val:  $key => $value " . is_bool($value));
                  if (is_bool($value)) {
                    if ($value) {
                      echo $key . " ";
                    }
                  }
                  else {
                    echo "$key=\"$value\" ";
                  }
                }
              ?>
               id="<?php echo $this->prefix . '-' . $setting_id;?>" class="<?php echo implode(" ", $classes) ;?>"
               value="<?php echo $this->post_meta_data[$setting_id]; ?>"> 


    <?php
      $this->render_template_post_field();
  }

  /**
   * Outputs html for a <select> element corresponding a setting.
   *
   * @param $options Associative array having value => label entries. Each array element would become a <radio> element.
   */
  protected function render_select_field($setting_id, $localized_name, $options=array()) {
    $saved_value = $this->post_meta_data[$setting_id];
    $this->render_template_pre_field($setting_id, $localized_name);
    ?>
        <select name="<?php echo $this->prefix . '[' . $setting_id . ']';?>"
                id="<?php echo $this->prefix . '-' . $setting_id;?>"> 
          <?php                
          foreach($options as $value => $label) {
            echo "<option " . selected($saved_value, $value, false) . " value='$value'>$label</option>";
          }
          ?>

        </select>


    <?php
      $this->render_template_post_field();
  }


  /**
   * Outputs html for a <input type="radio"> element corresponding a setting.
   *
   * @param $options Associative array having value => label entries. Each array element would become a <radio> element.
   */
  protected function render_radio_field($setting_id, $localized_name, $options=array()) {
    $saved_value = $this->post_meta_data[$setting_id];
    $this->render_template_pre_field($setting_id, $localized_name);

    foreach($options as $value => $label) {
      echo "<label>";
      echo '<input type="radio"' . checked( $saved_value, $value, false ) 
                . 'name="' . $this->prefix . '[' . $setting_id . ']" value="' . $value . '"/>';
      echo " $label</label><br>";
    }

    $this->render_template_post_field();
  }

  /**
   * Outputs html for a <input type="checkbox"> element corresponding a setting.
   * Typically use this only for a checkbox group. A single on/off setting should use a 
   * <select> or <input type="radio">.
   *
   * @param $options Associative array having value => label entries. Each array element would become a <radio> element.
   */
  protected function render_checkbox_field($setting_id, $localized_name, $options=array()) {
    $saved_value = $this->post_meta_data[$setting_id];
    $this->render_template_pre_field($setting_id, $localized_name);

    foreach($options as $value => $label) {
      echo "<label>";
      echo '<input type="checkbox"'
              . checked( $saved_value[$value], 'on', false )
              . 'name="' . $this->prefix . "[$setting_id][$value]" . '" value="on"/>';
      echo " $label</label><br>";
    }

    $this->render_template_post_field();
  }



}

?>