/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The abstract class for a component with custom behaviour when a
 * block or bubble is dragged over or dropped on top of it.
 * @author kozbial@google.com (Monica Kozbial)
 */

'use strict';

goog.provide('Blockly.DragTarget');

goog.require('Blockly.IDragTarget');

goog.requireType('Blockly.utils.Rect');


/**
 * Abstract class for a component with custom behaviour when a block or bubble
 * is dragged over or dropped on top of it.
 * @implements {Blockly.IDragTarget}
 * @constructor
 */
Blockly.DragTarget = function() {};

/**
 * Returns the bounding rectangle of the drag target area in pixel units
 * relative to the Blockly injection div.
 * @return {Blockly.utils.Rect} The component's bounding box.
 */
Blockly.DragTarget.prototype.getClientRect;

/**
 * Handles when a cursor with a block or bubble enters this drag target.
 */
Blockly.DragTarget.prototype.onDragEnter = function() {
  // no-op
};

/**
 * Handles when a cursor with a block or bubble exits this drag target.
 */
Blockly.DragTarget.prototype.onDragExit = function() {
  // no-op
};

/**
 * Computes the end location for a block after it is dropped on this component.
 * @param {!Blockly.utils.Coordinate} startXY The start xy.
 * @param {!Blockly.utils.Coordinate} delta The delta.
 * @return {!Blockly.utils.Coordinate} The end location.
 */
Blockly.DragTarget.prototype.getEndDragLoc = function(startXY, delta) {
  return Blockly.utils.Coordinate.sum(startXY, delta);
};

/**
 * Handles when a block is dropped on this component. Should not handle delete
 * here.
 * @param {!Blockly.BlockSvg} _block The block.
 */
Blockly.DragTarget.prototype.onBlockDrop = function(_block) {
  // no-op
};
