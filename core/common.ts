/**
 * @fileoverview Common functions used both internally and externally, but which
 * must not be at the top level to avoid circular dependencies.
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
 * Common functions used both internally and externally, but which
 * must not be at the top level to avoid circular dependencies.
 * @namespace Blockly.common
 */

/* eslint-disable-next-line no-unused-vars */
/* eslint-disable-next-line no-unused-vars */
import { Block } from './block';
import { BlockDefinition, Blocks } from './blocks';
/* eslint-disable-next-line no-unused-vars */
import { Connection } from './connection';
/* eslint-disable-next-line no-unused-vars */
import { ICopyable } from './interfaces/i_copyable';
/* eslint-disable-next-line no-unused-vars */
import { Workspace } from './workspace';
/* eslint-disable-next-line no-unused-vars */
import { WorkspaceSvg } from './workspace_svg';


/**
 * The main workspace most recently used.
 * Set by Blockly.WorkspaceSvg.prototype.markFocused
 */
let mainWorkspace: Workspace;

/**
 * Returns the last used top level workspace (based on focus).  Try not to use
 * this function, particularly if there are multiple Blockly instances on a
 * page.
 * @return The main workspace.
 * @alias Blockly.common.getMainWorkspace
 */
export function getMainWorkspace(): Workspace {
  return mainWorkspace;
}

/**
 * Sets last used main workspace.
 * @param workspace The most recently used top level workspace.
 * @alias Blockly.common.setMainWorkspace
 */
export function setMainWorkspace(workspace: Workspace) {
  mainWorkspace = workspace;
}

/**
 * Currently selected block.
 */
let selected: ICopyable | null = null;

/**
 * Returns the currently selected block.
 * @return The currently selected block.
 * @alias Blockly.common.getSelected
 */
export function getSelected(): ICopyable | null {
  return selected;
}

/**
 * Sets the currently selected block. This function does not visually mark the
 * block as selected or fire the required events. If you wish to
 * programmatically select a block, use `BlockSvg#select`.
 * @param newSelection The newly selected block.
 * @alias Blockly.common.setSelected
 */
export function setSelected(newSelection: ICopyable | null) {
  selected = newSelection;
}

/**
 * Container element in which to render the WidgetDiv, DropDownDiv and Tooltip.
 */
let parentContainer: Element | null;

/**
 * Get the container element in which to render the WidgetDiv, DropDownDiv and\
 * Tooltip.
 * @return The parent container.
 * @alias Blockly.common.getParentContainer
 */
export function getParentContainer(): Element | null {
  return parentContainer;
}

/**
 * Set the parent container.  This is the container element that the WidgetDiv,
 * DropDownDiv, and Tooltip are rendered into the first time `Blockly.inject`
 * is called.
 * This method is a NOP if called after the first ``Blockly.inject``.
 * @param newParent The container element.
 * @alias Blockly.common.setParentContainer
 */
export function setParentContainer(newParent: Element) {
  parentContainer = newParent;
}

/**
 * Size the SVG image to completely fill its container. Call this when the view
 * actually changes sizes (e.g. on a window resize/device orientation change).
 * See workspace.resizeContents to resize the workspace when the contents
 * change (e.g. when a block is added or removed).
 * Record the height/width of the SVG image.
 * @param workspace Any workspace in the SVG.
 * @alias Blockly.common.svgResize
 */
export function svgResize(workspace: WorkspaceSvg) {
  let mainWorkspace = workspace;
  while (mainWorkspace.options.parentWorkspace) {
    mainWorkspace = mainWorkspace.options.parentWorkspace;
  }
  const svg = mainWorkspace.getParentSvg();
  const cachedSize = mainWorkspace.getCachedParentSvgSize();
  const div = svg.parentElement;
  if (!(div instanceof HTMLElement)) {
    // Workspace deleted, or something.
    return;
  }

  const width = div.offsetWidth;
  const height = div.offsetHeight;
  if (cachedSize.width !== width) {
    svg.setAttribute('width', width + 'px');
    mainWorkspace.setCachedParentSvgSize(width, null);
  }
  if (cachedSize.height !== height) {
    svg.setAttribute('height', height + 'px');
    mainWorkspace.setCachedParentSvgSize(null, height);
  }
  mainWorkspace.resize();
}

/**
 * All of the connections on blocks that are currently being dragged.
 */
export const draggingConnections: Connection[] = [];

/**
 * Get a map of all the block's descendants mapping their type to the number of
 *    children with that type.
 * @param block The block to map.
 * @param opt_stripFollowing Optionally ignore all following
 *    statements (blocks that are not inside a value or statement input
 *    of the block).
 * @return Map of types to type counts for descendants of the bock.
 * @alias Blockly.common.getBlockTypeCounts
 */
export function getBlockTypeCounts(
  block: Block, opt_stripFollowing?: boolean): AnyDuringMigration {
  const typeCountsMap = Object.create(null);
  const descendants = block.getDescendants(true);
  if (opt_stripFollowing) {
    const nextBlock = block.getNextBlock();
    if (nextBlock) {
      const index = descendants.indexOf(nextBlock);
      descendants.splice(index, descendants.length - index);
    }
  }
  for (let i = 0, checkBlock; checkBlock = descendants[i]; i++) {
    if (typeCountsMap[checkBlock.type]) {
      typeCountsMap[checkBlock.type]++;
    } else {
      typeCountsMap[checkBlock.type] = 1;
    }
  }
  return typeCountsMap;
}

/**
 * Helper function for defining a block from JSON.  The resulting function has
 * the correct value of jsonDef at the point in code where jsonInit is called.
 * @param jsonDef The JSON definition of a block.
 * @return A function that calls jsonInit with the correct value
 *     of jsonDef.
 */
function jsonInitFactory(jsonDef: AnyDuringMigration): () => void {
  return function (this: Block) {
    this.jsonInit(jsonDef);
  };
}

/**
 * Define blocks from an array of JSON block definitions, as might be generated
 * by the Blockly Developer Tools.
 * @param jsonArray An array of JSON block definitions.
 * @alias Blockly.common.defineBlocksWithJsonArray
 */
export function defineBlocksWithJsonArray(jsonArray: AnyDuringMigration[]) {
  defineBlocks(createBlockDefinitionsFromJsonArray(jsonArray));
}

/**
 * Define blocks from an array of JSON block definitions, as might be generated
 * by the Blockly Developer Tools.
 * @param jsonArray An array of JSON block definitions.
 * @return A map of the block
 *     definitions created.
 * @alias Blockly.common.defineBlocksWithJsonArray
 */
export function createBlockDefinitionsFromJsonArray(
  jsonArray: AnyDuringMigration[]): { [key: string]: BlockDefinition } {
  const blocks: { [key: string]: BlockDefinition } = {};
  for (let i = 0; i < jsonArray.length; i++) {
    const elem = jsonArray[i];
    if (!elem) {
      console.warn(`Block definition #${i} in JSON array is ${elem}. Skipping`);
      continue;
    }
    const type = elem['type'];
    if (!type) {
      console.warn(
        `Block definition #${i} in JSON array is missing a type attribute. ` +
        'Skipping.');
      continue;
    }
    blocks[type] = { init: jsonInitFactory(elem) };
  }
  return blocks;
}

/**
 * Add the specified block definitions to the block definitions
 * dictionary (Blockly.Blocks).
 * @param blocks A map of block
 *     type names to block definitions.
 * @alias Blockly.common.defineBlocks
 */
export function defineBlocks(blocks: { [key: string]: BlockDefinition }) {
  // Iterate over own enumerable properties.
  for (const type of Object.keys(blocks)) {
    const definition = blocks[type];
    if (type in Blocks) {
      console.warn(`Block definiton "${type}" overwrites previous definition.`);
    }
    Blocks[type] = definition;
  }
}
