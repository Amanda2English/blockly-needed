/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Objects representing a jagged edge in a row of a rendered
 * block.
 * @author fenichel@google.com (Rachel Fenichel)
 */

goog.provide('Blockly.blockRendering.JaggedEdge');

goog.require('Blockly.blockRendering.Measurable');
goog.require('Blockly.blockRendering.Types');
goog.require('Blockly.utils.object');

goog.requireType('Blockly.blockRendering.ConstantProvider');


/**
 * An object containing information about the jagged edge of a collapsed block
 * takes up during rendering
 * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
 *   constants provider.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Measurable}
 */
Blockly.blockRendering.JaggedEdge = function(constants) {
  Blockly.blockRendering.JaggedEdge.superClass_.constructor.call(
      this, constants);
  this.type |= Blockly.blockRendering.Types.JAGGED_EDGE;
  this.height = this.constants_.JAGGED_TEETH.height;
  this.width = this.constants_.JAGGED_TEETH.width;
};
Blockly.utils.object.inherits(Blockly.blockRendering.JaggedEdge,
    Blockly.blockRendering.Measurable);
