/**
 * @fileoverview Contains functions registering serializers (eg blocks,
 * variables, plugins, etc).
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
 * Contains functions registering serializers (eg blocks, variables, plugins,
 * etc).
 * @namespace Blockly.serialization.registry
 */

// eslint-disable-next-line no-unused-vars
import { ISerializer } from '../interfaces/i_serializer';
import * as registry from '../registry';


/**
 * Registers the given serializer so that it can be used for serialization and
 * deserialization.
 * @param name The name of the serializer to register.
 * @param serializer The serializer to register.
 * @alias Blockly.serialization.registry.register
 */
export function register(name: string, serializer: ISerializer) {
  registry.register(registry.Type.SERIALIZER, name, serializer);
}

/**
 * Unregisters the serializer associated with the given name.
 * @param name The name of the serializer to unregister.
 * @alias Blockly.serialization.registry.unregister
 */
export function unregister(name: string) {
  registry.unregister(registry.Type.SERIALIZER, name);
}
