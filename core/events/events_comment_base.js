/** @fileoverview Base class for comment events. */


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
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Base class for comment events.
 * @class
 */

import * as utilsXml from '../utils/xml';
/* eslint-disable-next-line no-unused-vars */
import { WorkspaceComment } from '../workspace_comment';
import * as Xml from '../xml';

import { Abstract as AbstractEvent } from './events_abstract';
/* eslint-disable-next-line no-unused-vars */
import { CommentCreate } from './events_comment_create';
/* eslint-disable-next-line no-unused-vars */
import { CommentDelete } from './events_comment_delete';
import * as eventUtils from './utils';


/**
 * Abstract class for a comment event.
 * @alias Blockly.Events.CommentBase
 */
export class CommentBase extends AbstractEvent {
  override isBlank: boolean;
  commentId: string;
  override workspaceId: string;

  /**
   * @param opt_comment The comment this event corresponds to.  Undefined for a
   *     blank event.
   */
  constructor(opt_comment?: WorkspaceComment) {
    super();
    /** Whether or not an event is blank. */
    this.isBlank = typeof opt_comment === 'undefined';

    /** The ID of the comment this event pertains to. */
    this.commentId = this.isBlank ? '' : opt_comment!.id;

    /** The workspace identifier for this event. */
    this.workspaceId = this.isBlank ? '' : opt_comment!.workspace.id;

    /**
     * The event group id for the group this event belongs to. Groups define
     * events that should be treated as an single action from the user's
     * perspective, and should be undone together.
     */
    this.group = eventUtils.getGroup();

    /** Sets whether the event should be added to the undo stack. */
    this.recordUndo = eventUtils.getRecordUndo();
  }

  /**
   * Encode the event as JSON.
   * @return JSON representation.
   */
  override toJson(): AnyDuringMigration {
    const json = super.toJson();
    if (this.commentId) {
      json['commentId'] = this.commentId;
    }
    return json;
  }

  /**
   * Decode the JSON event.
   * @param json JSON representation.
   */
  override fromJson(json: AnyDuringMigration) {
    super.fromJson(json);
    this.commentId = json['commentId'];
  }

  /**
   * Helper function for Comment[Create|Delete]
   * @param event The event to run.
   * @param create if True then Create, if False then Delete
   */
  static CommentCreateDeleteHelper(
    event: CommentCreate | CommentDelete, create: boolean) {
    const workspace = event.getEventWorkspace_();
    if (create) {
      const xmlElement = utilsXml.createElement('xml');
      xmlElement.appendChild(event.xml);
      Xml.domToWorkspace(xmlElement, workspace);
    } else {
      const comment = workspace.getCommentById(event.commentId);
      if (comment) {
        comment.dispose();
      } else {
        // Only complain about root-level block.
        console.warn(
          'Can\'t uncreate non-existent comment: ' + event.commentId);
      }
    }
  }
}
