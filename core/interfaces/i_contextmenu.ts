/** @fileoverview The interface for an object that supports a right-click. */

/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */



/**
 * The interface for an object that supports a right-click.
 * @namespace Blockly.IContextMenu
 */


/** @alias Blockly.IContextMenu */
export interface IContextMenu {
  /**
   * Show the context menu for this object.
   * @param e Mouse event.
   */
  showContextMenu: AnyDuringMigration;
}
