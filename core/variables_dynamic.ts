/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Utility functions for handling typed variables.
 *
 * @namespace Blockly.VariablesDynamic
 */
import * as goog from '../closure/goog/goog.js';
goog.declareModuleId('Blockly.VariablesDynamic');

import {Blocks} from './blocks.js';
import {Msg} from './msg.js';
import * as xml from './utils/xml.js';
import {VariableModel} from './variable_model.js';
import * as Variables from './variables.js';
import type {Workspace} from './workspace.js';
import type {WorkspaceSvg} from './workspace_svg.js';


/**
 * String for use in the "custom" attribute of a category in toolbox XML.
 * This string indicates that the category should be dynamically populated with
 * variable blocks.
 * See also Blockly.Variables.CATEGORY_NAME and
 * Blockly.Procedures.CATEGORY_NAME.
 *
 * @alias Blockly.VariablesDynamic.CATEGORY_NAME
 */
export const CATEGORY_NAME = 'VARIABLE_DYNAMIC';

/**
 *
 * @param button
 */
function stringButtonClickHandler(button: AnyDuringMigration) {
  Variables.createVariableButtonHandler(
      button.getTargetWorkspace(), undefined, 'String');
}
// eslint-disable-next-line camelcase
export const onCreateVariableButtonClick_String = stringButtonClickHandler;
/**
 *
 * @param button
 */
function numberButtonClickHandler(button: AnyDuringMigration) {
  Variables.createVariableButtonHandler(
      button.getTargetWorkspace(), undefined, 'Number');
}
// eslint-disable-next-line camelcase
export const onCreateVariableButtonClick_Number = numberButtonClickHandler;

/**
 *
 * @param button
 */
function colourButtonClickHandler(button: AnyDuringMigration) {
  Variables.createVariableButtonHandler(
      button.getTargetWorkspace(), undefined, 'Colour');
}
// eslint-disable-next-line camelcase
export const onCreateVariableButtonClick_Colour = colourButtonClickHandler;

/**
 * Construct the elements (blocks and button) required by the flyout for the
 * variable category.
 *
 * @param workspace The workspace containing variables.
 * @returns Array of XML elements.
 * @alias Blockly.VariablesDynamic.flyoutCategory
 */
export function flyoutCategory(workspace: WorkspaceSvg): Element[] {
  let xmlList = new Array<Element>();
  let button = document.createElement('button');
  button.setAttribute('text', Msg['NEW_STRING_VARIABLE']);
  button.setAttribute('callbackKey', 'CREATE_VARIABLE_STRING');
  xmlList.push(button);
  button = document.createElement('button');
  button.setAttribute('text', Msg['NEW_NUMBER_VARIABLE']);
  button.setAttribute('callbackKey', 'CREATE_VARIABLE_NUMBER');
  xmlList.push(button);
  button = document.createElement('button');
  button.setAttribute('text', Msg['NEW_COLOUR_VARIABLE']);
  button.setAttribute('callbackKey', 'CREATE_VARIABLE_COLOUR');
  xmlList.push(button);

  workspace.registerButtonCallback(
      'CREATE_VARIABLE_STRING', stringButtonClickHandler);
  workspace.registerButtonCallback(
      'CREATE_VARIABLE_NUMBER', numberButtonClickHandler);
  workspace.registerButtonCallback(
      'CREATE_VARIABLE_COLOUR', colourButtonClickHandler);

  // AnyDuringMigration because:  Argument of type 'WorkspaceSvg' is not
  // assignable to parameter of type 'Workspace'.
  const blockList = flyoutCategoryBlocks(workspace as AnyDuringMigration);
  xmlList = xmlList.concat(blockList);
  return xmlList;
}

/**
 * Construct the blocks required by the flyout for the variable category.
 *
 * @param workspace The workspace containing variables.
 * @returns Array of XML block elements.
 * @alias Blockly.VariablesDynamic.flyoutCategoryBlocks
 */
export function flyoutCategoryBlocks(workspace: Workspace): Element[] {
  const variableModelList = workspace.getAllVariables();

  const xmlList = [];
  if (variableModelList.length > 0) {
    if (Blocks['variables_set_dynamic']) {
      const firstVariable = variableModelList[variableModelList.length - 1];
      const block = xml.createElement('block');
      block.setAttribute('type', 'variables_set_dynamic');
      // AnyDuringMigration because:  Argument of type 'number' is not
      // assignable to parameter of type 'string'.
      block.setAttribute('gap', 24 as AnyDuringMigration);
      // AnyDuringMigration because:  Argument of type 'Element | null' is not
      // assignable to parameter of type 'Node'.
      block.appendChild(
          Variables.generateVariableFieldDom(firstVariable) as
          AnyDuringMigration);
      xmlList.push(block);
    }
    if (Blocks['variables_get_dynamic']) {
      variableModelList.sort(VariableModel.compareByName);
      for (let i = 0, variable; variable = variableModelList[i]; i++) {
        const block = xml.createElement('block');
        block.setAttribute('type', 'variables_get_dynamic');
        // AnyDuringMigration because:  Argument of type 'number' is not
        // assignable to parameter of type 'string'.
        block.setAttribute('gap', 8 as AnyDuringMigration);
        // AnyDuringMigration because:  Argument of type 'Element | null' is not
        // assignable to parameter of type 'Node'.
        block.appendChild(
            Variables.generateVariableFieldDom(variable) as AnyDuringMigration);
        xmlList.push(block);
      }
    }
  }
  return xmlList;
}
