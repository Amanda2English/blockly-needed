/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for an AST node location that has an associated
 * block.
 */

/**
 * The interface for an AST node location that has an associated
 * block.
 * @namespace Blockly.IASTNodeLocationWithBlock
 */
import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.IASTNodeLocationWithBlock');

/* eslint-disable-next-line no-unused-vars */
// Unused import preserved for side-effects. Remove if unneeded.
import '../block.js';

import type {IASTNodeLocation} from './i_ast_node_location.js';


/**
 * An AST node location that has an associated block.
 * @alias Blockly.IASTNodeLocationWithBlock
 */
export interface IASTNodeLocationWithBlock extends IASTNodeLocation {
  /**
   * Get the source block associated with this node.
   * @return The source block.
   */
  getSourceBlock: AnyDuringMigration;
}
