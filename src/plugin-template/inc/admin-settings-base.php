<?php
/**
 * Admin class for {plugin-name}
 *
// @include ../../../temp/header-comments.txt
 */

class {plugin-class-name}_Admin_Base {
  
  /**
   * Slug of the plugin options screen.
   *
   * @since    0.1.0
   * @var      string
   */
  protected $plugin_screen_hook_suffix = null;

  protected $settings = null;

  /**
   * Initialize the instance.
   *
   * @since     0.1.0
   */
  protected function {plugin-class-name}_Admin_Base() {

  }
  
  protected function render_submit_button($localized_label, $name) {
    // submit_button was introduced in WP 3.1.0 so fall-back to submit button html for older versions
    if (function_exists('submit_button')) {
      submit_button($localized_label , 'primary' , $name );
      return;
    }
    ?>

    <p class="submit">
      <input type="submit" name="$name" id="$name" class="button button-primary" value="<?php echo _( 'Save Changes' ); ?>"/>
    </p>

    <?php
  }

  private function render_field_help_text( $args ) {
    if ( isset( $args['help_text'] ) ) {
      echo "<p class='description'>" . $args['help_text'] . "</p>";
    }    
  }

  /**
   * Outputs html for a <input> element corresponding a setting.
   * This function is called as a callback function for a setting.
   *
   * @param $args Array of values to customize <input> element
   *  field_type: Value of type attribute of <input> element. Should be one of text, url, number, email
   *  field_name: Value used in name attribute of <input> element
   */
  public function render_input_field( $args ) {
    $field_name = $args['field_name'];
    $field_type = isset( $args['field_type'] ) ? $args['field_type'] : 'text';
    
    $field = esc_attr(  $this->settings[$field_name] );
    echo "<input class='regular-text' type='$field_type' name='{plugin-slug}-settings[$field_name]' value='$field' />";
    $this->render_field_help_text( $args );
  }


  /**
   * Outputs html for a <select> element corresponding a setting.
   * This function is called as a callback function for a setting.
   *
   * @param $args Array of values to customize <select> element
   *  field_name: Value used in name attribute of <select> element
   *  options: Associative array having value => label entries. Each array element would become an <option> element.
   */
  public function render_select_field($args) {
  
    $field_name = $args['field_name'];
    $field = esc_attr($this->settings[$field_name]);
    $options = $args['options'];
  
    echo "<select name='{plugin-slug}-settings[$field_name]'>";
    /* With the help of key we will retrieve label and value from array, Key contain index of array and
       value contain label and value */
    foreach($options as $value => $label) {
      echo "<option " . selected($field, $value, false) . " value='$value'>$label</option>";
    }

    echo "</select>";

    $this->render_field_help_text( $args );
  }

  /**
   * Outputs html for a <input type="radio"> element corrsponding a setting.
   * This function is called as a callback function for a setting.
   *
   * @param $args Array of values to customize <input> element
   *  field_name: Value used in name attribute of <input> element
   *  options: Associative array having value => label entries. Each array element would become a <radio> element.
   */
  public function render_radio_field($args) {
    $field_name = $args['field_name'];
    $field = esc_attr($this->settings[$field_name]);
    $options = $args['options'];

    foreach($options as $value => $label) {
      echo "<label>";
      echo "<input type='radio'" . checked( $field, $value, false ) . "name='{plugin-slug}-settings[$field_name]' value='$value'/>";
      echo " $label</label><br>";
    }

    $this->render_field_help_text( $args );
  }

  /**
   * Outputs html for a <input type="checkbox"> element corrsponding a setting.
   * Typically use this only for a checkbox group. A single on/off setting should use a 
   * <select> or <input type="radio">.
   * This function is called as a callback function for a setting.
   *
   * @param $args Array of values to customize <input> element
   *  field_name: Value used in name attribute of <input> element
   */
  public function render_checkbox_field($args) {
    $field_name = $args['field_name'];
    $field = $this->settings[$field_name];
    $options = $args['options'];

    foreach($options as $value => $label) {
      echo "<label>";
      echo "<input type='checkbox'"
              . checked( $field[$value], 'on', false )
              . "name='{plugin-slug}-settings[$field_name][$value]' value='on'/>";
      echo " $label</label><br>";
    }

    $this->render_field_help_text( $args );
  }

}