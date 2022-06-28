/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for a positionable UI element.
 */

/**
 * The interface for a positionable UI element.
 * @namespace Blockly.IPositionable
 */
import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.IPositionable');

/* eslint-disable-next-line no-unused-vars */
/* eslint-disable-next-line no-unused-vars */
// Unused import preserved for side-effects. Remove if unneeded.
import '../metrics_manager.js';
/* eslint-disable-next-line no-unused-vars */
// Unused import preserved for side-effects. Remove if unneeded.
import '../utils/rect.js';

import {IComponent} from './i_component.js';


/**
 * Interface for a component that is positioned on top of the workspace.
 * @alias Blockly.IPositionable
 */
export interface IPositionable extends IComponent {
  /**
   * Positions the element. Called when the window is resized.
   * @param metrics The workspace metrics.
   * @param savedPositions List of rectangles that are already on the workspace.
   */
  position: AnyDuringMigration;

  /**
   * Returns the bounding rectangle of the UI element in pixel units relative to
   * the Blockly injection div.
   * @return The UI elements's bounding box. Null if bounding box should be
   *     ignored by other UI elements.
   */
  getBoundingRectangle: AnyDuringMigration;
}
