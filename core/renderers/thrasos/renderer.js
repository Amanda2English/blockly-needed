/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Thrasos renderer.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.module('Blockly.thrasos.Renderer');

const BaseRenderer = goog.require('Blockly.blockRendering.Renderer');
const RenderInfo = goog.require('Blockly.thrasos.RenderInfo');
const blockRendering = goog.require('Blockly.blockRendering');
const object = goog.require('Blockly.utils.object');
/* eslint-disable-next-line no-unused-vars */
const {BlockSvg} = goog.requireType('Blockly.BlockSvg');


/**
 * The thrasos renderer.
 * @param {string} name The renderer name.
 * @package
 * @constructor
 * @extends {BaseRenderer}
 */
const Renderer = function(name) {
  Renderer.superClass_.constructor.call(this, name);
};
object.inherits(Renderer, BaseRenderer);

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


blockRendering.register('thrasos', Renderer);

exports = Renderer;
