/** @fileoverview Events fired as a result of a marker move. */


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
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Events fired as a result of a marker move.
 * @class
 */

/* eslint-disable-next-line no-unused-vars */
import { Block } from '../block';
import { ASTNode } from '../keyboard_nav/ast_node';
import * as registry from '../registry';
/* eslint-disable-next-line no-unused-vars */
import { Workspace } from '../workspace';

import { UiBase } from './events_ui_base';
import * as eventUtils from './utils';


/**
 * Class for a marker move event.
 * @alias Blockly.Events.MarkerMove
 */
export class MarkerMove extends UiBase {
  blockId: string | null;
  oldNode?: ASTNode | null;
  newNode?: ASTNode;
  isCursor?: boolean;
  override type: string;

  /**
   * @param opt_block The affected block. Null if current node is of type
   *     workspace. Undefined for a blank event.
   * @param isCursor Whether this is a cursor event. Undefined for a blank
   *     event.
   * @param opt_oldNode The old node the marker used to be on.
   *    Undefined for a blank event.
   * @param opt_newNode The new node the marker is now on.
   *    Undefined for a blank event.
   */
  constructor(
    opt_block?: Block | null, isCursor?: boolean, opt_oldNode?: ASTNode | null,
    opt_newNode?: ASTNode) {
    let workspaceId = opt_block ? opt_block.workspace.id : undefined;
    if (opt_newNode && opt_newNode.getType() === ASTNode.types.WORKSPACE) {
      workspaceId = (opt_newNode.getLocation() as Workspace).id;
    }
    super(workspaceId);

    /** The workspace identifier for this event. */
    this.blockId = opt_block ? opt_block.id : null;

    /** The old node the marker used to be on. */
    this.oldNode = opt_oldNode;

    /** The new node the  marker is now on. */
    this.newNode = opt_newNode;

    /** Whether this is a cursor event. */
    this.isCursor = isCursor;

    /** Type of this event. */
    this.type = eventUtils.MARKER_MOVE;
  }

  /**
   * Encode the event as JSON.
   * @return JSON representation.
   */
  override toJson(): AnyDuringMigration {
    const json = super.toJson();
    json['isCursor'] = this.isCursor;
    json['blockId'] = this.blockId;
    json['oldNode'] = this.oldNode;
    json['newNode'] = this.newNode;
    return json;
  }

  /**
   * Decode the JSON event.
   * @param json JSON representation.
   */
  override fromJson(json: AnyDuringMigration) {
    super.fromJson(json);
    this.isCursor = json['isCursor'];
    this.blockId = json['blockId'];
    this.oldNode = json['oldNode'];
    this.newNode = json['newNode'];
  }
}

registry.register(registry.Type.EVENT, eventUtils.MARKER_MOVE, MarkerMove);
