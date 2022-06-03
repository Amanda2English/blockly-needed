/**
 * @fileoverview (Deprecated) Events fired as a result of UI actions in
 * Blockly's editor.
 */


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
 * (Deprecated) Events fired as a result of UI actions in
 * Blockly's editor.
 * @class
 */

/* eslint-disable-next-line no-unused-vars */
import { Block } from '../block';
import * as registry from '../registry';

import { UiBase } from './events_ui_base';
import * as eventUtils from './utils';


/**
 * Class for a UI event.
 * @deprecated December 2020. Instead use a more specific UI event.
 * @alias Blockly.Events.Ui
 */
export class Ui extends UiBase {
  blockId: AnyDuringMigration;
  element: AnyDuringMigration;
  oldValue: AnyDuringMigration;
  newValue: AnyDuringMigration;
  override type: string;

  /**
   * @param opt_block The affected block.  Null for UI events that do not have
   *     an associated block.  Undefined for a blank event.
   * @param opt_element One of 'selected', 'comment', 'mutatorOpen', etc.
   * @param opt_oldValue Previous value of element.
   * @param opt_newValue New value of element.
   */
  constructor(
    opt_block?: Block | null, opt_element?: string,
    opt_oldValue?: AnyDuringMigration, opt_newValue?: AnyDuringMigration) {
    const workspaceId = opt_block ? opt_block.workspace.id : undefined;
    super(workspaceId);

    this.blockId = opt_block ? opt_block.id : null;
    this.element = typeof opt_element === 'undefined' ? '' : opt_element;
    this.oldValue = typeof opt_oldValue === 'undefined' ? '' : opt_oldValue;
    this.newValue = typeof opt_newValue === 'undefined' ? '' : opt_newValue;

    /** Type of this event. */
    this.type = eventUtils.UI;
  }

  /**
   * Encode the event as JSON.
   * @return JSON representation.
   */
  override toJson(): AnyDuringMigration {
    const json = super.toJson();
    json['element'] = this.element;
    if (this.newValue !== undefined) {
      json['newValue'] = this.newValue;
    }
    if (this.blockId) {
      json['blockId'] = this.blockId;
    }
    return json;
  }

  /**
   * Decode the JSON event.
   * @param json JSON representation.
   */
  override fromJson(json: AnyDuringMigration) {
    super.fromJson(json);
    this.element = json['element'];
    this.newValue = json['newValue'];
    this.blockId = json['blockId'];
  }
}

registry.register(registry.Type.EVENT, eventUtils.UI, Ui);
