/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for an object that is selectable.
 */

/**
 * The interface for an object that is selectable.
 * @namespace Blockly.ISelectable
 */
import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.ISelectable');

import type {IDeletable} from './i_deletable';
import type {IMovable} from './i_movable';


/**
 * The interface for an object that is selectable.
 * @alias Blockly.ISelectable
 */
export interface ISelectable extends IDeletable, IMovable {
  id: string;

  /** Select this.  Highlight it visually. */
  select: AnyDuringMigration;

  /** Unselect this.  Unhighlight it visually. */
  unselect: AnyDuringMigration;
}
