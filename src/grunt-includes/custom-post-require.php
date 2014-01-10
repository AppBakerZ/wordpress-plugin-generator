      require( plugin_dir_path( __FILE__ ) . 'inc/custom-post-{custom-post-slug}.php' );
      {plugin-class-name}_{custom-post-class-name}_Custom_Post::init();
      $cp = new {plugin-class-name}_{custom-post-class-name}_Custom_Post();