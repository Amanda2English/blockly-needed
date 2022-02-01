/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview All the values that we expect developers to be able to change
 * before injecting Blockly. Changing these values during run time is not
 * generally recommended.
 */
'use strict';

/**
 * All the values that we expect developers to be able to change
 * before injecting Blockly. Changing these values during run time is not
 * generally recommended.
 * @namespace Blockly.config
 */
goog.module('Blockly.config');


const config = {
  /**
   * Number of pixels the mouse must move before a drag starts.
   * @alias Blockly.config.dragRadius
   */
  dragRadius: 5,
  /**
   * Number of pixels the mouse must move before a drag/scroll starts from the
   * flyout.  Because the drag-intention is determined when this is reached, it
   * is larger than dragRadius so that the drag-direction is clearer.
   * @alias Blockly.config.flyoutDragRadius
   */
  flyoutDragRadius: 10,
  /**
   * Maximum misalignment between connections for them to snap together.
   * @alias Blockly.config.snapRadius
   */
  snapRadius: 28,
  /**
   * How much to prefer staying connected to the current connection over moving
   * to a new connection.  The current previewed connection is considered to be
   * this much closer to the matching connection on the block than it actually
   * is.
   * @alias Blockly.config.currentConnectionPreference
   */
  currentConnectionPreference: 8,
  /**
   * Delay in ms between trigger and bumping unconnected block out of alignment.
   * @alias Blockly.config.bumpDelay
   */
  bumpDelay: 250,
};

/**
 * Maximum misalignment between connections for them to snap together.
 * This should be the same as the snap radius.
 * @alias Blockly.config.connectingSnapRadius
 */
config.connectingSnapRadius = config.snapRadius;

exports.config = config;
