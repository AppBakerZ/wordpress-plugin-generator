<?php
/**
 * Defines {plugin-class-name}_Custom_Post_Base class. 
 *
// @include ../../temp/header-comments.txt
 **/

class {plugin-class-name}_Custom_Post_Base {

  /*
   * custom post slug. To be initialized by child class
   */
  protected $post_type = '';
  protected $prefix = '';

  public function {plugin-class-name}_Custom_Post_Base() {
    // constructor must be called from init

    //Add hook for handling save post action
    add_action('save_post', array($this, 'handle_save_post_base'));

    //Add hook for adding meta box
    add_action('add_meta_boxes', array($this, 'handle_add_meta_boxes_base'));

  }

  /*
   * Handles add_meta_boxes action
   * */
  public function handle_add_meta_boxes_base() {

    global $post;

    $saved_post_meta_data = get_post_meta($post->ID, $this->prefix);
    $this->post_meta_data = $saved_post_meta_data[0];

    $default_values = $this->get_default_values();
    foreach ($default_values as $key => $values) {
      if (!isset($this->post_meta_data[$key])) {
        $this->post_meta_data[$key] = $default_values[$key];
      }
    }

    // delegate to child class 
    $this->add_meta_boxes();

  }

  protected function add_meta_box($id, $title, $func_name) {
    $markup_id = {plugin-class-name}_Info::slug. "-" . $id;

    add_meta_box($markup_id, $title, array($this, $func_name), $this->post_type, 'normal');

    // To add a custom class to metabox: http://wordpress.stackexchange.com/questions/49773/how-to-add-a-class-to-meta-box
    // In general, the hook is postbox_classes_{$page}_{$meta_box_id}
    add_filter("postbox_classes_" . $this->post_type . "_$markup_id", array($this, 'add_metabox_classes'));
  }

  /**
  * Handles add_metabox_classes filter 
  */
  public function add_metabox_classes($classes){
    // Add a common css class to all our meta boxes
    array_push($classes, {plugin-class-name}_Info::slug . '-metabox');
    return $classes;
  }

  /*
   * Check the custom post data before saving to database
   * */
  public function handle_save_post_base($post_id) {

    // Only handle the save of our custom post
    if ($this->post_type != $_POST['post_type']) {
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


  /******************************** Template Pattern Functions ************************************/

  protected function get_default_values() {
    // TODO: template - raise exception to enforce override
    return array();
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
        <label for="{plugin-slug}-{custom-post-slug}-<?php echo $setting_id;?>"><?php echo $localized_name;?></label>
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
   *
   * @param $setting_type: Value of type attribute of <input> element. Should be one of text, url, number, email
   */
  protected function render_input_field($setting_id, $localized_name, $setting_type="text") {
      $this->render_template_pre_field($setting_id, $localized_name);
    ?>
        <input type="<?php echo $setting_type;?>" name="{plugin-slug}-{custom-post-slug}[<?php echo $setting_id;?>]"
               id="{plugin-slug}-{custom-post-slug}-<?php echo $setting_id;?>"
               value="<?php echo $this->post_meta_data[$setting_id]; ?>"> 


    <?php
      $this->render_template_post_field();
  }

  /**
   * Outputs html for a <select> element corrsponding a setting.
   *
   * @param $options Associative array having value => label entries. Each array element would become a <radio> element.
   */
  protected function render_select_field($setting_id, $localized_name, $options=array()) {
    $saved_value = $this->post_meta_data[$setting_id];
    $this->render_template_pre_field($setting_id, $localized_name);
    ?>
      <div class="{plugin-slug}-right-panel">
        <select name="{plugin-slug}-{custom-post-slug}[<?php echo $setting_id;?>]"
                id="{plugin-slug}-{custom-post-slug}-<?php echo $setting_id;?>"> 
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
   * Outputs html for a <input type="radio"> element corrsponding a setting.
   *
   * @param $options Associative array having value => label entries. Each array element would become a <radio> element.
   */
  protected function render_radio_field($setting_id, $localized_name, $options=array()) {
    $saved_value = $this->post_meta_data[$setting_id];
    $this->render_template_pre_field($setting_id, $localized_name);
    ?>

    foreach($options as $value => $label) {
      echo "<label>";
      echo "<input type='radio'" . checked( $field, $value, false ) . "name='{plugin-slug}-settings[$field_name]' value='$value'/>";
      echo " $label</label><br>";
    }

    <?php
      $this->render_template_post_field();
  }

  /**
   * Outputs html for a <input type="checkbox"> element corrsponding a setting.
   * Typically use this only for a checkbox group. A single on/off setting should use a 
   * <select> or <input type="radio">.
   *
   * @param $options Associative array having value => label entries. Each array element would become a <radio> element.
   */
  protected function render_checkbox_field($setting_id, $localized_name, $options=array()) {
    $saved_value = $this->post_meta_data[$setting_id];
    $this->render_template_pre_field($setting_id, $localized_name);
    ?>

    foreach($options as $value => $label) {
      echo "<label>";
      echo "<input type='checkbox'"
              . checked( $field[$value], 'on', false )
              . "name='abz-test-plugin-settings[$field_name][$value]' value='on'/>";
      echo " $label</label><br>";
    }

    <?php
      $this->render_template_post_field();
  }



}

?>