/**
 * @fileoverview Contains top-level functions for serializing workspaces to
 * plain JavaScript objects.
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
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Contains top-level functions for serializing workspaces to plain JavaScript
 * objects.
 * @namespace Blockly.serialization.workspaces
 */

import * as eventUtils from '../events/utils';
import { ISerializer } from '../interfaces/i_serializer';
import * as registry from '../registry';
import * as dom from '../utils/dom';
// eslint-disable-next-line no-unused-vars
import { Workspace } from '../workspace';
import { WorkspaceSvg } from '../workspace_svg';


/**
 * Returns the state of the workspace as a plain JavaScript object.
 * @param workspace The workspace to serialize.
 * @return The serialized state of the workspace.
 * @alias Blockly.serialization.workspaces.save
 */
export function save(workspace: Workspace): { [key: string]: AnyDuringMigration } {
  const state = Object.create(null);
  const serializerMap = registry.getAllItems(registry.Type.SERIALIZER, true);
  for (const key in serializerMap) {
    const save = (serializerMap[key] as ISerializer)?.save(workspace);
    if (save) {
      state[key] = save;
    }
  }
  return state;
}

/**
 * Loads the variable represented by the given state into the given workspace.
 * @param state The state of the workspace to deserialize into the workspace.
 * @param workspace The workspace to add the new state to.
 * @param param1 recordUndo: If true, events triggered by this function will be
 *     undo-able by the user. False by default.
 * @alias Blockly.serialization.workspaces.load
 */
export function load(
  state: { [key: string]: AnyDuringMigration }, workspace: Workspace,
  { recordUndo = false }: { recordUndo?: boolean } = {}) {
  const serializerMap = registry.getAllItems(registry.Type.SERIALIZER, true);
  if (!serializerMap) {
    return;
  }

  const deserializers = Object.entries(serializerMap)
    .sort(
      (a, b) => (b[1] as ISerializer)!.priority -
        (a[1] as ISerializer)!.priority);

  const prevRecordUndo = eventUtils.getRecordUndo();
  eventUtils.setRecordUndo(recordUndo);
  const existingGroup = eventUtils.getGroup();
  if (!existingGroup) {
    eventUtils.setGroup(true);
  }

  dom.startTextWidthCache();
  if (workspace instanceof WorkspaceSvg) {
    workspace.setResizesEnabled(false);
  }

  // We want to trigger clearing in reverse priority order so plugins don't end
  // up missing dependencies.
  for (const [, deserializer] of deserializers.reverse()) {
    (deserializer as ISerializer)?.clear(workspace);
  }

  // reverse() is destructive, so we have to re-reverse to correct the order.
  for (let [name, deserializer] of deserializers.reverse()) {
    name = name;
    const pluginState = state[name];
    if (pluginState) {
      (deserializer as ISerializer)?.load(state[name], workspace);
    }
  }

  if (workspace instanceof WorkspaceSvg) {
    workspace.setResizesEnabled(true);
  }
  dom.stopTextWidthCache();

  eventUtils.fire(new (eventUtils.get(eventUtils.FINISHED_LOADING))!
    (workspace));

  eventUtils.setGroup(existingGroup);
  eventUtils.setRecordUndo(prevRecordUndo);
}
