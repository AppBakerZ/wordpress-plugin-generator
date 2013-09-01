wordpress-plugin-generator
==========================

Create a new wordpress plugin in 3 seconds using GruntJS.

### First Time Setup

If you dont have NodeJS and grunt already installed on your PC then follow these instructions, otherwise proceed to next section.

1. Install [NodeJS](http://nodejs.org#download).

2. Install GruntJS by typing the following command:

```
npm install -g grunt-cli
```

3. Run the following command in the repository root directory to install all the required grunt plugins: 

```
npm install
```

This setup is required only once.

### Generating Wordpress Plugin
1. Duplicate file `build-sample.json` as `build.json`
2. Fill in values in `build.json`. You should at-least give the values for 

3. Type the following in the repository root directory:

```
grunt
```

A directory named dist would be created and would have the generated code for your wordpress plugin.

### Credits
The generated code for wordpress plugins maily comes from the awesome [WordPress Plugin Boilerplate](https://github.com/tommcfarlin/WordPress-Plugin-Boilerplate) by [Tom McFarlin](http://tommcfarlin.com/). 

