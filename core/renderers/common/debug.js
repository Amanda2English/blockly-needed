/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Block rendering debugging functionality.
 */
'use strict';

/**
 * Block rendering debugging functionality.
 * @namespace Blockly.blockRendering.debug
 */
goog.declareModuleId('Blockly.blockRendering.debug');

import * as deprecation from '../../utils/deprecation.js';


/**
 * Whether or not the debugger is turned on.
 * @type {boolean}
 */
let useDebugger = false;
/**
 * Returns whether the debugger is turned on.
 * @return {boolean} Whether the debugger is turned on.
 * @alias Blockly.blockRendering.debug.isDebuggerEnabled
 * @package
 */
const isDebuggerEnabled = function() {
  return useDebugger;
};
export {isDebuggerEnabled};

/**
 * Turn on the blocks debugger.
 * @package
 * @alias Blockly.blockRendering.debug.startDebugger
 * @deprecated March 2022. Use the rendering debugger in @blockly/dev-tools.
 * See https://www.npmjs.com/package/@blockly/dev-tools for more information.
 */
const startDebugger = function() {
  deprecation.warn(
      'Blockly.blockRendering.debug.startDebugger()', 'February 2022',
      'September 2022',
      'the debug renderer in @blockly/dev-tools (See https://www.npmjs.com/package/@blockly/dev-tools.)');
  useDebugger = true;
};
export {startDebugger};

/**
 * Turn off the blocks debugger.
 * @package
 * @alias Blockly.blockRendering.debug.stopDebugger
 * @deprecated March 2022. Use the rendering debugger in @blockly/dev-tools.
 * See https://www.npmjs.com/package/@blockly/dev-tools for more information.
 */
const stopDebugger = function() {
  deprecation.warn(
      'Blockly.blockRendering.debug.stopDebugger()', 'February 2022',
      'September 2022',
      'the debug renderer in @blockly/dev-tools (See https://www.npmjs.com/package/@blockly/dev-tools.)');
  useDebugger = false;
};
export {stopDebugger};
