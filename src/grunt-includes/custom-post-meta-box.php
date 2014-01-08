  /*
   * Renders Meta box on custom post add/edit page
   **/
  public function render_{meta-box-function-name}() {
    ?>

    <!--Link to lightbox image Section-->
    <div class="abz-tiles-row">
      <div class="abz-tiles-left-panel">
        <label for="abz-tiles-link-options"><?php printf(__('Link options', '{plugin-slug}')) ?></label>
      </div>

      <div class="abz-tiles-right-panel">
        <input type="radio" name="abz-tiles-post-meta[link-options]"
               id="abz-tiles-link-options-lightbox-image"
               value="lightbox-image" <?php checked('lightbox-image', $this->post_meta_data['link-options']); ?> >
        <label
          for="abz-tiles-link-options-lightbox-image"><?php printf(__('Link to lightbox image', '{plugin-slug}')) ?></label>

        <input type="radio" name="abz-tiles-post-meta[link-options]"
               id="abz-tiles-link-options-custom-url"
               value="custom-url" <?php checked('custom-url', $this->post_meta_data['link-options']); ?> >
        <label for="abz-tiles-link-options-custom-url"><?php printf(__('Link to custom url', '{plugin-slug}')) ?></label>


        <input type="radio" name="abz-tiles-post-meta[link-options]"
               id="abz-tiles-link-options-lightbox-w-custom-content"
               value="lightbox-w-custom-content" <?php checked('lightbox-w-custom-content', $this->post_meta_data['link-options']); ?> >
        <label
          for="abz-tiles-link-options-lightbox-w-custom-content"><?php printf(__('Link to lightbox with custom html content', '{plugin-slug}')) ?></label>

      </div> <!-- end right-panel -->

    </div> <!-- end row -->


  <?php

  }

