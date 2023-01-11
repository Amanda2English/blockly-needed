/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Events fired as a result of a marker move.
 *
 * @class
 */
import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.Events.MarkerMove');

import type {Block} from '../block.js';
import {ASTNode} from '../keyboard_nav/ast_node.js';
import * as deprecation from '../utils/deprecation.js';
import * as registry from '../registry.js';
import type {Workspace} from '../workspace.js';
import {AbstractEventJson} from './events_abstract.js';

import {UiBase} from './events_ui_base.js';
import * as eventUtils from './utils.js';


/**
 * Notifies the developer that a marker (used for keyboard navigation) has
 * moved.
 *
 * @alias Blockly.Events.MarkerMove
 */
export class MarkerMove extends UiBase {
  /** The ID of the block the marker is now on, if any. */
  blockId?: string;

  /** The old node the marker used to be on, if any. */
  oldNode?: ASTNode;

  /** The new node the marker is now on. */
  newNode?: ASTNode;

  /** True if this is a cursor event, false otherwise. */
  isCursor?: boolean;

  override type = eventUtils.MARKER_MOVE;

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
      opt_block?: Block|null, isCursor?: boolean, opt_oldNode?: ASTNode|null,
      opt_newNode?: ASTNode) {
    let workspaceId = opt_block ? opt_block.workspace.id : undefined;
    if (opt_newNode && opt_newNode.getType() === ASTNode.types.WORKSPACE) {
      workspaceId = (opt_newNode.getLocation() as Workspace).id;
    }
    super(workspaceId);

    /** The block identifier for this event. */
    this.blockId = opt_block?.id;

    /** The old node the marker used to be on. */
    this.oldNode = opt_oldNode || undefined;

    /** The new node the  marker is now on. */
    this.newNode = opt_newNode;

    /** Whether this is a cursor event. */
    this.isCursor = isCursor;
  }

  /**
   * Encode the event as JSON.
   *
   * @returns JSON representation.
   */
  override toJson(): MarkerMoveJson {
    const json = super.toJson() as MarkerMoveJson;
    if (this.isCursor === undefined) {
      throw new Error(
          'Whether this is a cursor event or not is undefined. Either pass ' +
          'a value to the constructor, or call fromJson');
    }
    if (!this.newNode) {
      throw new Error(
          'The new node is undefined. Either pass a node to ' +
          'the constructor, or call fromJson');
    }
    json['isCursor'] = this.isCursor;
    json['blockId'] = this.blockId;
    json['oldNode'] = this.oldNode;
    json['newNode'] = this.newNode;
    return json;
  }

  /**
   * Decode the JSON event.
   *
   * @param json JSON representation.
   */
  override fromJson(json: MarkerMoveJson) {
    deprecation.warn(
        'Blockly.Events.MarkerMove.prototype.fromJson', 'version 9',
        'version 10', 'Blockly.Events.fromJson');
    super.fromJson(json);
    this.isCursor = json['isCursor'];
    this.blockId = json['blockId'];
    this.oldNode = json['oldNode'];
    this.newNode = json['newNode'];
  }

  /**
   * Deserializes the JSON event.
   *
   * @param event The event to append new properties to. Should be a subclass
   *     of MarkerMove, but we can't specify that due to the fact that
   *     parameters to static methods in subclasses must be supertypes of
   *     parameters to static methods in superclasses.
   * @internal
   */
  static fromJson(json: MarkerMoveJson, workspace: Workspace, event?: any):
      MarkerMove {
    const newEvent =
        super.fromJson(json, workspace, event ?? new MarkerMove()) as
        MarkerMove;
    newEvent.isCursor = json['isCursor'];
    newEvent.blockId = json['blockId'];
    newEvent.oldNode = json['oldNode'];
    newEvent.newNode = json['newNode'];
    return newEvent;
  }
}

export interface MarkerMoveJson extends AbstractEventJson {
  isCursor: boolean;
  blockId?: string;
  oldNode?: ASTNode;
  newNode: ASTNode;
}

registry.register(registry.Type.EVENT, eventUtils.MARKER_MOVE, MarkerMove);
