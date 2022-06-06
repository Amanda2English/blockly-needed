/** @fileoverview The interface for an AST node location SVG. */

/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */



/**
 * The interface for an AST node location SVG.
 * @namespace Blockly.IASTNodeLocationSvg
 */
/* eslint-disable-next-line no-unused-vars */
import { IASTNodeLocation } from './i_ast_node_location';


/**
 * An AST node location SVG interface.
 * @alias Blockly.IASTNodeLocationSvg
 */
export interface IASTNodeLocationSvg extends IASTNodeLocation {
  /**
   * Add the marker SVG to this node's SVG group.
   * @param markerSvg The SVG root of the marker to be added to the SVG group.
   */
  setMarkerSvg: AnyDuringMigration;

  /**
   * Add the cursor SVG to this node's SVG group.
   * @param cursorSvg The SVG root of the cursor to be added to the SVG group.
   */
  setCursorSvg: AnyDuringMigration;
}
