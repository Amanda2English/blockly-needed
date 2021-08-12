/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Minimalist renderer.
 */
'use strict';

goog.module('Blockly.minimalist.Renderer');
goog.module.declareLegacyNamespace();

/* eslint-disable-next-line no-unused-vars */
const BaseRenderInfo = goog.requireType('Blockly.blockRendering.RenderInfo');
const BaseRenderer = goog.require('Blockly.blockRendering.Renderer');
/* eslint-disable-next-line no-unused-vars */
const BlockSvg = goog.requireType('Blockly.BlockSvg');
const ConstantProvider = goog.require('Blockly.minimalist.ConstantProvider');
const Drawer = goog.require('Blockly.minimalist.Drawer');
const RenderInfo = goog.require('Blockly.minimalist.RenderInfo');
const blockRendering = goog.require('Blockly.blockRendering');
const object = goog.require('Blockly.utils.object');


/**
 * The minimalist renderer.
 * @param {string} name The renderer name.
 * @package
 * @constructor
 * @extends {BaseRenderer}
 */
const Renderer = function(name) {
  Renderer.superClass_.constructor.call(this, name);
};
object.inherits(Renderer,
    BaseRenderer);

/**
 * Create a new instance of the renderer's constant provider.
 * @return {!ConstantProvider} The constant provider.
 * @protected
 * @override
 */
Renderer.prototype.makeConstants_ = function() {
  return new ConstantProvider();
};

/**
 * Create a new instance of the renderer's render info object.
 * @param {!BlockSvg} block The block to measure.
 * @return {!RenderInfo} The render info object.
 * @protected
 * @override
 */
Renderer.prototype.makeRenderInfo_ = function(block) {
  return new RenderInfo(this, block);
};

/**
 * Create a new instance of the renderer's drawer.
 * @param {!BlockSvg} block The block to render.
 * @param {!BaseRenderInfo} info An object containing all
 *   information needed to render this block.
 * @return {!Drawer} The drawer.
 * @protected
 * @override
 */
Renderer.prototype.makeDrawer_ = function(block, info) {
  return new Drawer(block,
      /** @type {!RenderInfo} */ (info));
};

blockRendering.register('minimalist', Renderer);

exports = Renderer;
