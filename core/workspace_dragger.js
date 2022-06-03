/** @fileoverview Methods for dragging a workspace visually. */


/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2018 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Methods for dragging a workspace visually.
 * @class
 */

import * as common from './common';
import { Coordinate } from './utils/coordinate';
/* eslint-disable-next-line no-unused-vars */
import { WorkspaceSvg } from './workspace_svg';


/**
 * Class for a workspace dragger.  It moves the workspace around when it is
 * being dragged by a mouse or touch.
 * Note that the workspace itself manages whether or not it has a drag surface
 * and how to do translations based on that.  This simply passes the right
 * commands based on events.
 * @alias Blockly.WorkspaceDragger
 */
export class WorkspaceDragger {
  private readonly horizontalScrollEnabled_: boolean;
  private readonly verticalScrollEnabled_: boolean;
  protected startScrollXY_: Coordinate;

  /** @param workspace The workspace to drag. */
  constructor(private workspace: WorkspaceSvg) {
    /** Whether horizontal scroll is enabled. */
    this.horizontalScrollEnabled_ = this.workspace.isMovableHorizontally();

    /** Whether vertical scroll is enabled. */
    this.verticalScrollEnabled_ = this.workspace.isMovableVertically();

    /**
     * The scroll position of the workspace at the beginning of the drag.
     * Coordinate system: pixel coordinates.
     */
    this.startScrollXY_ = new Coordinate(workspace.scrollX, workspace.scrollY);
  }

  /**
   * Sever all links from this object.
   * @suppress {checkTypes}
   */
  dispose() {
    // AnyDuringMigration because:  Type 'null' is not assignable to type
    // 'WorkspaceSvg'.
    this.workspace = null as AnyDuringMigration;
  }

  /** Start dragging the workspace. */
  startDrag() {
    if (common.getSelected()) {
      common.getSelected()!.unselect();
    }
    this.workspace.setupDragSurface();
  }

  /**
   * Finish dragging the workspace and put everything back where it belongs.
   * @param currentDragDeltaXY How far the pointer has moved from the position
   *     at the start of the drag, in pixel coordinates.
   */
  endDrag(currentDragDeltaXY: Coordinate) {
    // Make sure everything is up to date.
    this.drag(currentDragDeltaXY);
    this.workspace.resetDragSurface();
  }

  /**
   * Move the workspace based on the most recent mouse movements.
   * @param currentDragDeltaXY How far the pointer has moved from the position
   *     at the start of the drag, in pixel coordinates.
   */
  drag(currentDragDeltaXY: Coordinate) {
    const newXY = Coordinate.sum(this.startScrollXY_, currentDragDeltaXY);

    if (this.horizontalScrollEnabled_ && this.verticalScrollEnabled_) {
      this.workspace.scroll(newXY.x, newXY.y);
    } else if (this.horizontalScrollEnabled_) {
      this.workspace.scroll(newXY.x, this.workspace.scrollY);
    } else if (this.verticalScrollEnabled_) {
      this.workspace.scroll(this.workspace.scrollX, newXY.y);
    } else {
      throw new TypeError('Invalid state.');
    }
  }
}
