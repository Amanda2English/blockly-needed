/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Gulp tasks to package Blockly for distribution on NPM.
 */

const gulp = require('gulp');
gulp.concat = require('gulp-concat');
gulp.replace = require('gulp-replace');
gulp.rename = require('gulp-rename');
gulp.insert = require('gulp-insert');
gulp.umd = require('gulp-umd');
gulp.replace = require('gulp-replace');

const path = require('path');
const fs = require('fs');
const {rimraf} = require('rimraf');
const build = require('./build_tasks');
const {getPackageJson} = require('./helper_tasks');
const {BUILD_DIR, LANG_BUILD_DIR, RELEASE_DIR, TYPINGS_BUILD_DIR} = require('./config');

// Path to template files for gulp-umd.
const TEMPLATE_DIR = 'scripts/package/templates';

/**
 * A helper method for wrapping a file into a Universal Module Definition.
 * @param {string} namespace The export namespace.
 * @param {Array<Object>} dependencies An array of dependencies to inject.
 */
function packageUMD(namespace, dependencies, template = 'umd.template') {
  return gulp.umd({
    dependencies: function () { return dependencies; },
    namespace: function () { return namespace; },
    exports: function () { return namespace; },
    template: path.join(TEMPLATE_DIR, template)
  });
};

/**
 * This task wraps scripts/package/index.js into a UMD module.
 *
 * This module is the main entrypoint for the blockly package, and
 * loads blockly/core, blockly/blocks and blockly/msg/en and then
 * calls setLocale(en).
 */
function packageIndex() {
  return gulp.src('scripts/package/index.js')
    .pipe(packageUMD('Blockly', [{
        name: 'Blockly',
        amd: 'blockly/core',
        cjs: 'blockly/core',
      },{
        name: 'en',
        amd: 'blockly/msg/en',
        cjs: 'blockly/msg/en',
        global: 'Blockly.Msg',
      },{
        name: 'blocks',
        amd: 'blockly/blocks',
        cjs: 'blockly/blocks',
        global: 'Blockly.Blocks',
      }]))
    .pipe(gulp.dest(RELEASE_DIR));
};

/**
 * This task copies scripts/package/core-node.js into into the
 * package.  This module will be the 'blockly/core' entrypoint for
 * node.js environments.
 *
 * Note that, unlike index.js, this file does not get a UMD wrapper.
 * This is because it is only used in node.js environments and so is
 * guaranteed to be loaded as a CJS module.
 */
function packageCoreNode() {
  return gulp.src('scripts/package/core-node.js')
    .pipe(gulp.dest(RELEASE_DIR));
};

/**
 * This task wraps each of the files in ${BUILD_DIR/msg/ into a UMD module.
 * @example import * as En from 'blockly/msg/en';
 */
function packageLocales() {
  // Remove references to goog.provide and goog.require.
  return gulp.src(`${LANG_BUILD_DIR}/*.js`)
      .pipe(gulp.replace(/goog\.[^\n]+/g, ''))
      .pipe(packageUMD('Blockly.Msg', [], 'umd-msg.template'))
      .pipe(gulp.dest(`${RELEASE_DIR}/msg`));
};

/**
 * This task creates a UMD bundle of Blockly which includes the Blockly
 * core files, the built-in blocks, the JavaScript code generator and the
 * English localization files.
 * @example <script src="https://unpkg.com/blockly/blockly.min.js"></script>
 */
function packageUMDBundle() {
  const srcs = [
    `${RELEASE_DIR}/blockly_compressed.js`,
    `${RELEASE_DIR}/msg/en.js`,
    `${RELEASE_DIR}/blocks_compressed.js`,
    `${RELEASE_DIR}/javascript_compressed.js`,
  ];
  return gulp.src(srcs)
      .pipe(gulp.concat('blockly.min.js'))
      .pipe(gulp.dest(`${RELEASE_DIR}`));
};

/**
 * This task copies all the media/* files into the release directory.
 */
function packageMedia() {
  return gulp.src('media/*')
    .pipe(gulp.dest(`${RELEASE_DIR}/media`));
};

/**
 * This task copies the package.json file into the release directory,
 * with modifications:
 *
 * - The scripts section is removed.
 * - Additional entries are added to the exports section for each of
 *   the published languages.
 *
 * Prerequisite: buildLangfiles.
 */
function packageJSON(cb) {
  // Copy package.json, so we can safely modify it.
  const json = JSON.parse(JSON.stringify(getPackageJson()));
  // Remove unwanted entries.
  delete json['scripts'];
  // Add langfile entrypoints to exports.
  const langfiles = fs.readdirSync(LANG_BUILD_DIR).filter(f => /\.js$/.test(f));
  langfiles.sort();
  for (const langfile of langfiles) {
    const lang = langfile.replace(/\.js$/, '');
    json.exports[`./msg/${lang}`] = {
      types: `./msg/${lang}.d.ts`,
      default: `./msg/${langfile}`,
    };
  }
  // Write resulting package.json file to release directory.
  if (!fs.existsSync(RELEASE_DIR)) {
    fs.mkdirSync(RELEASE_DIR, {recursive: true});
  }
  fs.writeFileSync(`${RELEASE_DIR}/package.json`,
      JSON.stringify(json, null, 2));
  cb();
};

/**
 * This task copies the scripts/package/README.md file into the
 * release directory.  This file is what developers will see at
 * https://www.npmjs.com/package/blockly .
 */
function packageReadme() {
  return gulp.src('scripts/package/README.md')
    .pipe(gulp.dest(RELEASE_DIR));
};

/**
 * This task copies the generated .d.ts files in build/declarations and the
 * hand-written .d.ts files in typings/ into the release directory. The main
 * entrypoint file (index.d.ts) is referenced in package.json in the types
 * property.
 */
function packageDTS() {
  const handwrittenSrcs = [
    'typings/*.d.ts',
    'typings/msg/*.d.ts',
  ];
  return gulp.src(handwrittenSrcs, {base: 'typings'})
      .pipe(gulp.src(`${TYPINGS_BUILD_DIR}/**/*.d.ts`, {ignore: [
	`${TYPINGS_BUILD_DIR}/blocks/**/*`,
      ]}))
      .pipe(gulp.replace('AnyDuringMigration', 'any'))
      .pipe(gulp.dest(RELEASE_DIR));
};

/**
 * This task cleans the release directory (by deleting it).
 */
function cleanReleaseDir() {
  // Sanity check.
  if (RELEASE_DIR === '.' || RELEASE_DIR === '/') {
    return Promise.reject(`Refusing to rm -rf ${RELEASE_DIR}`);
  }
  return rimraf(RELEASE_DIR);
}

/**
 * This task prepares the files to be included in the NPM by copying
 * them into the release directory.
 *
 * Prerequisite: build.
 */
const package = gulp.series(
    gulp.parallel(
        build.cleanBuildDir,
        cleanReleaseDir),
    build.build,
    gulp.parallel(
        packageIndex,
        packageCoreNode,
        packageMedia,
        gulp.series(packageLocales, packageUMDBundle),
        packageJSON,
        packageReadme,
        packageDTS)
    );

module.exports = {
  // Main sequence targets.  Each should invoke any immediate prerequisite(s).
  cleanReleaseDir: cleanReleaseDir,
  package: package,
};
