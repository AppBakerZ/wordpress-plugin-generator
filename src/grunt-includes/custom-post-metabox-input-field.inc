    <div class="{plugin-slug}-row">
      <div class="{plugin-slug}-left-panel">
        <label for="{plugin-slug}-{custom-post-slug}-{setting-id}"><?php printf(__('{setting-name}', '{plugin-slug}')) ?></label>
      </div>

      <div class="{plugin-slug}-right-panel">
        <input type="text" name="{plugin-slug}-{custom-post-slug}[{setting-id}]"
               id="{plugin-slug}-{custom-post-slug}-{setting-id}"
               value="<?php echo $this->post_meta_data['{setting-id}']; ?>"> 


      </div> <!-- end right-panel -->

    </div> <!-- end row -->

