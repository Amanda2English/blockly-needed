/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview An item in the toolbox.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */
'use strict';

goog.provide('Blockly.CollapsibleToolboxItem');
goog.provide('Blockly.SelectableToolboxItem');
goog.provide('Blockly.ToolboxItem');

goog.requireType('Blockly.IToolbox');
goog.requireType('Blockly.utils.toolbox');
goog.requireType('Blockly.WorkspaceSvg');

/**
 * Class for an item in the toolbox.
 * @param {!Blockly.utils.toolbox.ToolboxItemJson} toolboxItemDef The JSON defining the
 *     toolbox item.
 * @param {!Blockly.IToolbox} toolbox The toolbox that holds the toolbox item.
 * @constructor
 */
Blockly.ToolboxItem = function(toolboxItemDef, toolbox) {

  /**
   * The id for the category.
   * @type {string}
   * @protected
   */
  this.id_ = toolboxItemDef['id'] || Blockly.utils.genUid();

  /**
   * The JSON definition of the toolbox item.
   * @type {!Blockly.utils.toolbox.ToolboxItemJson}
   * @protected
   */
  this.toolboxItemDef_ = toolboxItemDef;

  /**
   * The toolbox this category belongs to.
   * @type {!Blockly.IToolbox}
   * @protected
   */
  this.parentToolbox_ = toolbox;

  /**
   * The workspace of the parent toolbox.
   * @type {!Blockly.WorkspaceSvg}
   * @protected
   */
  this.workspace_ = this.parentToolbox_.getWorkspace();
};

/**
 * Creates the dom for a toolbox item.
 * @return {!Element} The div for the toolbox item.
 * @public
 */
Blockly.ToolboxItem.prototype.createDom = function() {
  return document.createElement('div');
};

/**
 * Gets the div for the toolbox item.
 * @return {?Element} The div for the toolbox item.
 * @public
 */
Blockly.ToolboxItem.prototype.getDiv = function() {
  return null;
};

/**
 * Gets a unique identifier for this toolbox item.
 * @return {string} The id for the toolbox item.
 * @public
 */
Blockly.ToolboxItem.prototype.getId = function() {
  return this.id_;
};

/**
 * Gets the parent if the toolbox item is nested.
 * @return {?Blockly.ToolboxItem} The parent toolbox item, or null if
 *     this toolbox item is not nested.
 * @public
 */
Blockly.ToolboxItem.prototype.getParent = function() {
  return null;
};

/**
 * Whether the toolbox item is selectable.
 * @return {boolean} True if the toolbox item can be selected.
 * @public
 */
Blockly.ToolboxItem.prototype.isSelectable = function() {
  return false;
};

/**
 * Whether the toolbox item is collapsible.
 * @return {boolean} True if the toolbox item is collapsible.
 * @public
 */
Blockly.ToolboxItem.prototype.isCollapsible = function() {
  return false;
};

/**
 * Dispose of this toolbox item. No-op by default.
 * @public
 */
Blockly.ToolboxItem.prototype.dispose = function() {
};

/**
 * Class for an item in the toolbox that can be selected.
 * @param {!Blockly.utils.toolbox.ToolboxItemJson} toolboxItemDef The JSON
 *     defining the toolbox item.
 * @param {!Blockly.IToolbox} toolbox The toolbox that holds the toolbox item.
 * @constructor
 * @extends {Blockly.ToolboxItem}
 */
Blockly.SelectableToolboxItem = function(toolboxItemDef, toolbox) {
  Blockly.SelectableToolboxItem.superClass_.constructor.call(
      this, toolboxItemDef, toolbox);
};
Blockly.utils.object.inherits(Blockly.SelectableToolboxItem,
    Blockly.ToolboxItem);

/**
 * @override
 */
Blockly.SelectableToolboxItem.prototype.isSelectable = function() {
  return true;
};

/**
 * Gets the name of the toolbox item. Used for emitting events.
 * @return {string} The name of the toolbox item.
 * @public
 */
Blockly.SelectableToolboxItem.prototype.getName = function() {
  return '';
};

/**
 * Gets the contents of the toolbox item. These are items that are meant to be
 * displayed in the flyout.
 * @return {!Blockly.utils.toolbox.FlyoutItemJsonArray|string} The definition
 *     of items to be displayed in the flyout.
 * @public
 */
Blockly.SelectableToolboxItem.prototype.getContents = function() {
  return [];
};

/**
 * Set the current toolbox item as selected. No-op by default.
 * @param {boolean} _isSelected True if this category is selected, false
 *     otherwise.
 * @public
 */
Blockly.SelectableToolboxItem.prototype.setSelected = function(_isSelected) {
};

/**
 * Event listener for when the toolbox item is clicked.
 * @param {!Event} _e Click event to handle.
 * @public
 */
Blockly.SelectableToolboxItem.prototype.onClick = function(_e) {};

/**
 * Class for an item in the toolbox that is collapsible.
 * @param {!Blockly.utils.toolbox.ToolboxItemJson} toolboxItemDef The JSON
 *     defining the toolbox item.
 * @param {!Blockly.IToolbox} toolbox The toolbox that holds the toolbox item.
 * @constructor
 * @extends {Blockly.SelectableToolboxItem}
 */
Blockly.CollapsibleToolboxItem = function(toolboxItemDef, toolbox) {
  Blockly.CollapsibleToolboxItem.superClass_.constructor.call(
      this, toolboxItemDef, toolbox);

};
Blockly.utils.object.inherits(Blockly.CollapsibleToolboxItem,
    Blockly.SelectableToolboxItem);

/**
 * @override
 */
Blockly.CollapsibleToolboxItem.prototype.isCollapsible = function() {
  return true;
};

/**
 * Gets any children toolbox items. (ex. Gets the sub categories)
 * @return {!Array<!Blockly.ToolboxItem>} The child toolbox items.
 */
Blockly.CollapsibleToolboxItem.prototype.getChildToolboxItems = function() {
  return [];
};

/**
 * Whether the toolbox item is expanded to show it's child subcategories.
 * @return {boolean} True if the toolbox item shows it's children, false if it
 *     is collapsed.
 * @public
 */
Blockly.CollapsibleToolboxItem.prototype.isExpanded = function() {
  return false;
};

/**
 * Toggles whether or not the toolbox item is expanded.
 * @public
 */
Blockly.CollapsibleToolboxItem.prototype.toggleExpanded = function() {};
