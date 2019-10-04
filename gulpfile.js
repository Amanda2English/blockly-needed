/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Gulp script to build Blockly for Node & NPM.
 * Run this script by calling "npm install" in this directory.
 */

var gulp = require('gulp');
gulp.shell = require('gulp-shell');
gulp.concat = require('gulp-concat');
gulp.replace = require('gulp-replace');
gulp.rename = require('gulp-rename');
gulp.insert = require('gulp-insert');
gulp.umd = require('gulp-umd');

var path = require('path');
var fs = require('fs');
var rimraf = require('rimraf');
var execSync = require('child_process').execSync;

var closureCompiler = require('google-closure-compiler').gulp();
var packageJson = require('./package.json');
var argv = require('yargs').argv;


////////////////////////////////////////////////////////////
//                        Build                           //
////////////////////////////////////////////////////////////

const licenseRegex = `\\/\\*\\*
 \\* @license
 \\* (Copyright \\d+ (Google LLC|Massachusetts Institute of Technology))
( \\* All rights reserved.
)? \\*
 \\* Licensed under the Apache License, Version 2.0 \\(the "License"\\);
 \\* you may not use this file except in compliance with the License.
 \\* You may obtain a copy of the License at
 \\*
 \\*   http://www.apache.org/licenses/LICENSE-2.0
 \\*
 \\* Unless required by applicable law or agreed to in writing, software
 \\* distributed under the License is distributed on an "AS IS" BASIS,
 \\* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 \\* See the License for the specific language governing permissions and
 \\* limitations under the License.
 \\*\\/`;

/**
 * Helper method for stripping the Google's and MIT's Apache Licenses.
 */
function stripApacheLicense() {
  // Strip out Google's and MIT's Apache licences.
  // Closure Compiler preserves dozens of Apache licences in the Blockly code.
  // Remove these if they belong to Google or MIT.
  // MIT's permission to do this is logged in Blockly issue #2412.
  return gulp.replace(new RegExp(licenseRegex, "g"), '');
}

/**
 * Helper method for prepending the auto-generated header text.
 */
function prependHeader() {
  return gulp.insert.prepend(`// Do not edit this file; automatically generated by gulp.\n`);
}

/**
 * Helper method for calling the Closure compiler.
 * @param {*} compilerOptions
 * @param {boolean=} opt_verbose Optional option for verbose logging
 */
function compile(compilerOptions, opt_verbose) {
  if (!compilerOptions) compilerOptions = {};
  compilerOptions.compilation_level = 'SIMPLE_OPTIMIZATIONS';
  compilerOptions.warning_level = opt_verbose ? 'VERBOSE' : 'DEFAULT';
  compilerOptions.language_in = 'ECMASCRIPT5_STRICT';
  compilerOptions.language_out = 'ECMASCRIPT5_STRICT';
  compilerOptions.rewrite_polyfills = false;
  compilerOptions.hide_warnings_for = 'node_modules';

  const platform = ['native', 'java', 'javascript'];

  return closureCompiler(compilerOptions, { platform });
}

/**
 * This task builds Blockly's core files.
 *     blockly_compressed.js
 */
gulp.task('build-core', function () {
  const defines = 'Blockly.VERSION="' + packageJson.version + '"';
  return gulp.src([
      'core/**/**/*.js'
    ], {base: './'})
    // Directories in Blockly are used to group similar files together
    // but are not used to limit access with @package, instead the
    // method means something is internal to Blockly and not a public
    // API.
    // Flatten all files so they're in the same directory, but ensure that
    // files with the same name don't conflict.
    .pipe(gulp.rename(function (p) {
      var dirname = p.dirname.replace(new RegExp(path.sep, "g"), "-");
      p.dirname = "";
      p.basename = dirname + "-" + p.basename;
    }))
    .pipe(stripApacheLicense())
    .pipe(compile({
      dependency_mode: 'PRUNE',
      entry_point: './core-requires.js',
      js_output_file: 'blockly_compressed.js',
      externs: './externs/svg-externs.js',
      define: defines
    }, argv.verbose))
    .pipe(prependHeader())
    .pipe(gulp.dest('./'));
});

/**
 * This task builds the Blockly's built in blocks.
 *     blocks_compressed.js
 */
gulp.task('build-blocks', function () {
  const provides = `
goog.provide('Blockly');
goog.provide('Blockly.Blocks');
goog.provide('Blockly.Comment');
goog.provide('Blockly.FieldCheckbox');
goog.provide('Blockly.FieldColour');
goog.provide('Blockly.FieldDropdown');
goog.provide('Blockly.FieldImage');
goog.provide('Blockly.FieldLabel');
goog.provide('Blockly.FieldMultilineInput');
goog.provide('Blockly.FieldNumber');
goog.provide('Blockly.FieldTextInput');
goog.provide('Blockly.FieldVariable');
goog.provide('Blockly.Mutator');`;
  return gulp.src('blocks/*.js', {base: './'})
    // Add Blockly.Blocks to be compatible with the compiler.
    .pipe(gulp.replace(`goog.provide('Blockly.Constants.Colour');`,
      `${provides}goog.provide('Blockly.Constants.Colour');`))
    .pipe(stripApacheLicense())
    .pipe(compile({
      dependency_mode: 'NONE',
      js_output_file: 'blocks_compressed.js'
    }, argv.verbose))
    .pipe(gulp.replace('\'use strict\';', '\'use strict\';\n\n\n'))
    // Remove Blockly.Blocks to be compatible with Blockly.
    .pipe(gulp.replace(/var Blockly=\{[^;]*\};\n?/, ''))
    // Remove Blockly Fields to be compatible with Blockly.
    .pipe(gulp.replace(/Blockly\.Field[^=\(]+=\{[^;]*\};/g, ''))
    .pipe(prependHeader())
    .pipe(gulp.dest('./'));
});

/**
 * A helper method for building a Blockly code generator.
 * @param {string} language Generator language.
 * @param {string} namespace Language namespace.
 */
function buildGenerator(language, namespace) {
  var provides = `
goog.provide('Blockly.Generator');
goog.provide('Blockly.utils.string');`;
  return gulp.src([`generators/${language}.js`, `generators/${language}/*.js`], {base: './'})
    .pipe(stripApacheLicense())
    // Add Blockly.Generator and Blockly.utils.string to be compatible with the compiler.
    .pipe(gulp.replace(`goog.provide('Blockly.${namespace}');`,
      `${provides}goog.provide('Blockly.${namespace}');`))
    .pipe(compile({
      dependency_mode: 'NONE',
      js_output_file: `${language}_compressed.js`
    }, argv.verbose))
    .pipe(gulp.replace('\'use strict\';', '\'use strict\';\n\n\n'))
    // Remove Blockly.Generator and Blockly.utils.string to be compatible with Blockly.
    .pipe(gulp.replace(/var Blockly=\{[^;]*\};\s*Blockly.utils.string={};\n?/, ''))
    .pipe(prependHeader())
    .pipe(gulp.dest('./'));
};

/**
 * This task builds the javascript generator.
 *     javascript_compressed.js
 */
gulp.task('build-javascript', function() {
  return buildGenerator('javascript', 'JavaScript');
});

/**
 * This task builds the python generator.
 *     python_compressed.js
 */
gulp.task('build-python', function() {
  return buildGenerator('python', 'Python');
});

/**
 * This task builds the php generator.
 *     php_compressed.js
 */
gulp.task('build-php', function() {
  return buildGenerator('php', 'PHP');
});

/**
 * This task builds the lua generator.
 *     lua_compressed.js
 */
gulp.task('build-lua', function() {
  return buildGenerator('lua', 'Lua');
});

/**
 * This task builds the dart generator:
 *     dart_compressed.js
 */
gulp.task('build-dart', function() {
  return buildGenerator('dart', 'Dart');
});

/**
 * This task builds Blockly's uncompressed file.
 *     blockly_uncompressed.js
 */
gulp.task('build-uncompressed', function() {
  const header = `// Do not edit this file; automatically generated by build.py.
'use strict';

this.IS_NODE_JS = !!(typeof module !== 'undefined' && module.exports);

this.BLOCKLY_DIR = (function(root) {
  if (!root.IS_NODE_JS) {
    // Find name of current directory.
    var scripts = document.getElementsByTagName('script');
    var re = new RegExp('(.+)[\\\/]blockly_(.*)uncompressed\\\.js$');
    for (var i = 0, script; script = scripts[i]; i++) {
      var match = re.exec(script.src);
      if (match) {
        return match[1];
      }
    }
    alert('Could not detect Blockly\\'s directory name.');
  }
  return '';
})(this);

this.BLOCKLY_BOOT = function(root) {
  // Execute after Closure has loaded.
`;
  const footer = `
delete root.BLOCKLY_DIR;
delete root.BLOCKLY_BOOT;
delete root.IS_NODE_JS;
};

if (this.IS_NODE_JS) {
  this.BLOCKLY_BOOT(this);
  module.exports = Blockly;
} else {
  // Delete any existing Closure (e.g. Soy's nogoog_shim).
  document.write('<script>var goog = undefined;</script>');
  // Load fresh Closure Library.
  document.write('<script src="' + this.BLOCKLY_DIR +
      '/closure/goog/base.js"></script>');
  document.write('<script>this.BLOCKLY_BOOT(this);</script>');
}
`;
  const file = 'blockly_uncompressed.js';
  // Run depswriter.py and which scans the core directory and writes out a ``goog.addDependency`` line for each file.
  const cmd = `python ./node_modules/google-closure-library/closure/bin/build/depswriter.py \
    --root_with_prefix="./core ../core" > ${file}`;
  execSync(cmd, { stdio: 'inherit' });

  const requires = `\n// Load Blockly.\ngoog.require('Blockly.requires');\n`;

  return gulp.src(file)
    // Remove comments so we're compatible with the build.py script
    .pipe(gulp.replace(/\/\/.*\n/gm, ''))
    // Replace quotes to be compatible with build.py
    .pipe(gulp.replace(/\'(.*\.js)\'/gm, '"$1"'))
    // Find the Blockly directory name and replace it with a JS variable.
    // This allows blockly_uncompressed.js to be compiled on one computer and be
    // used on another, even if the directory name differs.
    .pipe(gulp.replace(/\.\.\/core/gm, `../../core`))
    .pipe(gulp.insert.wrap(header, requires + footer))
    .pipe(gulp.dest('./'));
});

/**
 * This task builds all of Blockly:
 *     blockly_compressed.js
 *     blocks_compressed.js
 *     javascript_compressed.js
 *     python_compressed.js
 *     php_compressed.js
 *     lua_compressed.js
 *     dart_compressed.js
 */
gulp.task('build', gulp.parallel(
  'build-core',
  'build-blocks',
  'build-javascript',
  'build-python',
  'build-php',
  'build-lua',
  'build-dart'
));

////////////////////////////////////////////////////////////
//                        Typings                         //
////////////////////////////////////////////////////////////

// Generates the TypeScript definition file (d.ts) for Blockly.
// As well as generating the typings of each of the files under core/ and msg/,
// the script also pulls in a number of part files from typings/parts.
// This includes the header (incl License), additional useful interfaces
// including Blockly Options and Google Closure typings.
gulp.task('typings', function (cb) {
  const tmpDir = './typings/tmp';
  const blocklySrcs = [
    "core/",
    "core/components",
    "core/components/tree",
    "core/components/menu",
    "core/keyboard_nav",
    "core/renderers/common",
    "core/renderers/measurables",
    "core/theme",
    "core/utils",
    "msg/"
  ];
  // Clean directory if exists.
  if (fs.existsSync(tmpDir)) {
    rimraf.sync(tmpDir);
  }
  fs.mkdirSync(tmpDir);

  // Find all files that will be included in the typings file.
  let files = [];
  blocklySrcs.forEach((src) => {
    files = files.concat(fs.readdirSync(src)
      .filter(fn => fn.endsWith('.js'))
      .map(fn => path.join(src, fn)));
  });

  // Generate typings file for each file.
  files.forEach((file) => {
    const typescriptFileName = `${path.join(tmpDir, file)}.d.ts`;
    if (file.indexOf('core/msg.js') > -1) {
      return;
    }
    const cmd = `node ./node_modules/typescript-closure-tools/definition-generator/src/main.js ${file} ${typescriptFileName}`;
    console.log(`Generating typings for ${file}`);
    execSync(cmd, { stdio: 'inherit' });
  });

  const srcs = [
    'typings/parts/blockly-header.d.ts',
    'typings/parts/blockly-interfaces.d.ts',
    'typings/parts/goog-closure.d.ts',
    `${tmpDir}/core/**`,
    `${tmpDir}/core/components/**`,
    `${tmpDir}/core/components/tree/**`,
    `${tmpDir}/core/components/menu/**`,
    `${tmpDir}/core/keyboard_nav/**`,
    `${tmpDir}/core/renderers/common/**`,
    `${tmpDir}/core/renderers/measurables/**`,
    `${tmpDir}/core/utils/**`,
    `${tmpDir}/core/theme/**`,
    `${tmpDir}/msg/**`
  ];
  return gulp.src(srcs)
    .pipe(gulp.concat('blockly.d.ts'))
    .pipe(gulp.dest('typings'))
    .on('end', function () {
      // Clean up tmp directory.
      if (fs.existsSync(tmpDir)) {
        rimraf.sync(tmpDir);
      }
    });
});

////////////////////////////////////////////////////////////
//                  NPM packaging tasks                   //
////////////////////////////////////////////////////////////

// The destination path where all the NPM distribution files will go.
const packageDistribution = './dist';

/**
 * A helper method for wrapping a file into a Universal Module Definition.
 * @param {string} namespace The export namespace.
 * @param {Array<Object>} dependencies An array of dependencies to inject.
 */
function packageUMD(namespace, dependencies) {
  return gulp.umd({
    dependencies: function () { return dependencies; },
    namespace: function () { return namespace; },
    exports: function () { return namespace; },
    template: path.join(__dirname, 'package/templates/umd.template')
  });
};

/**
 * A helper method for wrapping a file into a CommonJS module for Node.js.
 * @param {string} namespace The export namespace.
 * @param {Array<Object>} dependencies An array of dependencies to inject.
 */
function packageCommonJS(namespace, dependencies) {
  return gulp.umd({
    dependencies: function () { return dependencies; },
    namespace: function () { return namespace; },
    exports: function () { return namespace; },
    template: path.join(__dirname, 'package/templates/node.template')
  });
};

/**
 * This task wraps blockly_compressed.js into a UMD module.
 * @example import 'blockly/blockly';
 */
gulp.task('package-blockly', function() {
  return gulp.src('blockly_compressed.js')
    .pipe(packageUMD('Blockly', []))
    .pipe(gulp.rename('blockly.js'))
    .pipe(gulp.dest(packageDistribution));
});

/**
 * This task wraps blocks_compressed.js into a CommonJS module for Node.js.
 * This is an equivelant task to package-blockly but for Node.js.
 * @example import 'blockly/blockly-node';
 */
gulp.task('package-blockly-node', function() {
  // Override textToDomDocument, providing a Node.js alternative to DOMParser.
  return gulp.src('blockly_compressed.js')
    .pipe(gulp.insert.append(`
      if (typeof DOMParser !== 'function') {
        var DOMParser = require("jsdom/lib/jsdom/living").DOMParser;
        var XMLSerializer = require("jsdom/lib/jsdom/living").XMLSerializer;
        var doc = Blockly.utils.xml.textToDomDocument(
          '<xml xmlns="https://developers.google.com/blockly/xml"></xml>');
        Blockly.utils.xml.document = function() {
          return doc;
        };
      }`))
    .pipe(packageCommonJS('Blockly', []))
    .pipe(gulp.rename('blockly-node.js'))
    .pipe(gulp.dest(packageDistribution));
})

/**
 * This task wraps blocks_compressed.js into a UMD module.
 * @example import 'blockly/blocks';
 */
gulp.task('package-blocks', function() {
  return gulp.src('blocks_compressed.js')
    .pipe(gulp.insert.prepend(`
    Blockly.Blocks={};`))
    .pipe(packageUMD('Blockly.Blocks', [{
        name: 'Blockly',
        amd: './core',
        cjs: './core',
      }]))
    .pipe(gulp.rename('blocks.js'))
    .pipe(gulp.dest(packageDistribution));
});

/**
 * This task wraps package/index.js into a UMD module.
 * We implicitly require the Node entry point in CommonJS environments,
 * and the Browser entry point for AMD environments.
 * @example import * as Blockly from 'blockly';
 */
gulp.task('package-index', function() {
  return gulp.src('package/index.js')
    .pipe(packageUMD('Blockly', [{
        name: 'Blockly',
        amd: './browser',
        cjs: './node',
      }]))
    .pipe(gulp.rename('index.js'))
    .pipe(gulp.dest(packageDistribution));
});

/**
 * This task wraps package/browser/index.js into a UMD module.
 * By default, the module includes Blockly core and built-in blocks,
 * as well as the JavaScript code generator and the English block
 * localization files.
 * This module is configured (in package.json) to replaces the module
 * built by package-node in browser environments.
 * @example import * as Blockly from 'blockly/browser';
 */
gulp.task('package-browser', function() {
  return gulp.src('package/browser/index.js')
    .pipe(packageUMD('Blockly', [{
        name: 'Blockly',
        amd: './core-browser',
        cjs: './core-browser',
      },{
        name: 'En',
        amd: './msg/en',
        cjs: './msg/en',
      },{
        name: 'BlocklyBlocks',
        amd: './blocks',
        cjs: './blocks',
      },{
        name: 'BlocklyJS',
        amd: './javascript',
        cjs: './javascript',
      }]))
    .pipe(gulp.rename('browser.js'))
    .pipe(gulp.dest(packageDistribution));
});

/**
 * This task wraps package/browser/core.js into a UMD module.
 * By default, the module includes the Blockly core package and a
 * helper method to set the locale.
 * This module is configured (in package.json) to replaces the module
 * built by package-node-core in browser environments.
 * @example import * as Blockly from 'blockly/core';
 */
gulp.task('package-core', function() {
  return gulp.src('package/browser/core.js')
    .pipe(packageUMD('Blockly', [{
        name: 'Blockly',
        amd: './blockly',
        cjs: './blockly',
      }]))
    .pipe(gulp.rename('core-browser.js'))
    .pipe(gulp.dest(packageDistribution));
});

/**
 * This task wraps package/node/index.js into a CommonJS module for Node.js.
 * By default, the module includes Blockly core and built-in blocks,
 * as well as all the code generators and the English block localization files.
 * This module is configured (in package.json) to be replaced by the module
 * built by package-browser in browser environments.
 * @example import * as Blockly from 'blockly/node';
 */
gulp.task('package-node', function() {
  return gulp.src('package/node/index.js')
    .pipe(packageCommonJS('Blockly', [{
        name: 'Blockly',
        cjs: './core',
      },{
        name: 'En',
        cjs: './msg/en',
      },{
        name: 'BlocklyBlocks',
        cjs: './blocks',
      },{
        name: 'BlocklyJS',
        cjs: './javascript',
      },{
        name: 'BlocklyPython',
        cjs: './python',
      },{
        name: 'BlocklyPHP',
        cjs: './php',
      },{
        name: 'BlocklyLua',
        cjs: './lua',
      }, {
        name: 'BlocklyDart',
        cjs: './dart',
      }]))
    .pipe(gulp.rename('node.js'))
    .pipe(gulp.dest(packageDistribution));
});

/**
 * This task wraps package/node/core.js into a CommonJS module for Node.js.
 * By default, the module includes the Blockly core package for Node.js
 * and a helper method to set the locale.
 * This module is configured (in package.json) to be replaced by the module
 * built by package-core in browser environments.
 * @example import * as Blockly from 'blockly/core';
 */
gulp.task('package-node-core', function() {
  return gulp.src('package/node/core.js')
    .pipe(packageCommonJS('Blockly', [{
        name: 'Blockly',
        amd: './blockly-node',
        cjs: './blockly-node',
      }]))
    .pipe(gulp.rename('core.js'))
    .pipe(gulp.dest(packageDistribution));
});

/**
 * A helper method for packaging a Blockly code generator into a UMD module.
 * @param {string} file Source file name.
 * @param {string} rename Destination file name.
 * @param {string} generator Generator export namespace.
 */
function packageGenerator(file, rename, generator) {
  return gulp.src(file)
    .pipe(packageUMD(generator, [{
        name: 'Blockly',
        amd: './core',
        cjs: './core',
      }]))
    .pipe(gulp.rename(rename))
    .pipe(gulp.dest(packageDistribution));
};

/**
 * This task wraps javascript_compressed.js into a UMD module.
 * @example import 'blockly/javascript';
 */
gulp.task('package-javascript', function() {
  return packageGenerator('javascript_compressed.js', 'javascript.js', 'Blockly.JavaScript');
});

/**
 * This task wraps python_compressed.js into a UMD module.
 * @example import 'blockly/python';
 */
gulp.task('package-python', function() {
  return packageGenerator('python_compressed.js', 'python.js', 'Blockly.Python');
});

/**
 * This task wraps lua_compressed.js into a UMD module.
 * @example import 'blockly/lua';
 */
gulp.task('package-lua', function() {
  return packageGenerator('lua_compressed.js', 'lua.js', 'Blockly.Lua');
});

/**
 * This task wraps dart_compressed.js into a UMD module.
 * @example import 'blockly/dart';
 */
gulp.task('package-dart', function() {
  return packageGenerator('dart_compressed.js', 'dart.js', 'Blockly.Dart');
});

/**
 * This task wraps php_compressed.js into a UMD module.
 * @example import 'blockly/php';
 */
gulp.task('package-php', function() {
  return packageGenerator('php_compressed.js', 'php.js', 'Blockly.PHP');
});

/**
 * This task wraps each of the msg/js/* files into a UMD module.
 * @example import * as En from 'blockly/msg/en';
 */
gulp.task('package-locales', function() {
  // Remove references to goog.provide and goog.require.
  return gulp.src('msg/js/*.js')
      .pipe(gulp.replace(/goog\.[^\n]+/g, ''))
      .pipe(gulp.insert.prepend(`
      var Blockly = {};Blockly.Msg={};`))
      .pipe(packageUMD('Blockly.Msg', [{
          name: 'Blockly',
          amd: '../core',
          cjs: '../core',
        }]))
      .pipe(gulp.dest(`${packageDistribution}/msg`));
});

/**
 * This task creates a UMD bundle of Blockly which includes the Blockly
 * core files, the built-in blocks, the JavaScript code generator and the
 * English localization files.
 * @example <script src="https://unpkg.com/blockly/blockly.min.js"></script>
 */
gulp.task('package-umd-bundle', function() {
  var srcs = [
    'blockly_compressed.js',
    'msg/js/en.js',
    'blocks_compressed.js',
    'javascript_compressed.js'
  ];
  return gulp.src(srcs)
    .pipe(gulp.concat('blockly.min.js'))
    .pipe(packageUMD('Blockly', []))
    .pipe(gulp.dest(`${packageDistribution}`))
});

/**
 * This task copies all the media/* files into the distribution directory.
 */
gulp.task('package-media', function() {
  return gulp.src('./media/*')
    .pipe(gulp.dest(`${packageDistribution}/media`));
});

/**
 * This task copies the package.json file into the distribution directory.
 */
gulp.task('package-json', function() {
  return gulp.src('./package.json')
    .pipe(gulp.dest(`${packageDistribution}`))
});

/**
 * This task copies the package/README.md file into the distribution directory.
 * This file is what developers will see at https://www.npmjs.com/package/blockly.
 */
gulp.task('package-readme', function() {
  return gulp.src('./package/README.md')
    .pipe(gulp.dest(`${packageDistribution}`))
});

/**
 * This task copies the typings/blockly.d.ts TypeScript definition file into the
 * distribution directory.
 * The bundled declaration file is referenced in package.json in the types property.
 */
gulp.task('package-dts', function() {
  return gulp.src('./typings/blockly.d.ts')
    .pipe(gulp.dest(`${packageDistribution}`))
});

/**
 * This task prepares the NPM distribution files under the /dist directory.
 */
gulp.task('package', gulp.parallel(
  'package-index',
  'package-browser',
  'package-node',
  'package-core',
  'package-node-core',
  'package-blockly',
  'package-blockly-node',
  'package-blocks',
  'package-javascript',
  'package-python',
  'package-lua',
  'package-dart',
  'package-php',
  'package-locales',
  'package-media',
  'package-umd-bundle',
  'package-json',
  'package-readme',
  'package-dts'
  ));

// The release task prepares Blockly for an npm release.
// It rebuilds the Blockly compressed files and updates the TypeScript
// typings, and then packages all the npm release files into the /dist directory
gulp.task('release', gulp.series(['build', 'typings', function() {
  // Clean directory if exists
  if (fs.existsSync(packageDistribution)) {
    rimraf.sync(packageDistribution);
  }
  fs.mkdirSync(packageDistribution);
}, 'package']));

// The default task builds Blockly.
gulp.task('default', gulp.series(['build']));
