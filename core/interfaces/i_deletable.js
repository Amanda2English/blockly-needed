/** @fileoverview The interface for an object that is deletable. */


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
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */



/**
 * The interface for an object that is deletable.
 * @namespace Blockly.IDeletable
 */


/**
 * The interface for an object that can be deleted.
 * @alias Blockly.IDeletable
 */
export interface IDeletable {
  /**
   * Get whether this object is deletable or not.
   * @return True if deletable.
   */
  isDeletable: AnyDuringMigration;
}
