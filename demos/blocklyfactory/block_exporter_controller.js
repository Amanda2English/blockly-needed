/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2016 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * You may not use this file except in compliance with the License.
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
 * @fileoverview Javascript for the Block Exporter Controller class. Allows
 * users to export block definitions and generator stubs of their saved blocks
 * easily using a visual interface. Depends on Block Exporter View and Block
 * Exporter Tools classes. Interacts with Export Settings in the index.html.
 *
 * @author quachtina96 (Tina Quach)
 */

'use strict';

goog.provide('BlockExporterController');

goog.require('FactoryUtils');
goog.require('BlockExporterView');
goog.require('BlockExporterTools');
goog.require('goog.dom.xml');

/**
 * BlockExporter Controller Class
 * @constructor
 *
 * @param {!BlockLibrary.Storage} blockLibStorage - Block Library Storage.
 */
BlockExporterController = function(blockLibStorage) {
  // BlockLibrary.Storage object containing user's saved blocks
  this.blockLibStorage = blockLibStorage;
  // Utils for generating code to export
  this.tools = new BlockExporterTools();
  // View provides the selector workspace and export settings UI.
  this.view = new BlockExporterView(
      //Xml representation of the toolbox
      this.tools.generateToolboxFromLibrary(this.blockLibStorage));
};

/**
 * Set the block library storage object from which exporter exports.
 *
 * @param {!BlockLibraryStorage} blockLibStorage - Block Library Storage object
 *    that stores the blocks.
 */
BlockExporterController.prototype.setBlockLibStorage =
    function(blockLibStorage) {
  this.blockLibStorage = blockLibStorage;
};

/**
 * Get the block library storage object from which exporter exports.
 *
 * @return {!BlockLibraryStorage} blockLibStorage - Block Library Storage object
 *    that stores the blocks.
 */
BlockExporterController.prototype.getBlockLibStorage =
    function(blockLibStorage) {
  return this.blockLibStorage;
};

/**
 * Get the selected block types.
 * @private
 *
 * @return {!Array.<string>} Types of blocks in workspace.
 */
BlockExporterController.prototype.getSelectedBlockTypes_ = function() {
  var selectedBlocks = this.view.getSelectedBlocks();
  var blockTypes = [];
  for (var i = 0, block; block = selectedBlocks[i]; i++) {
    blockTypes.push(block.type);
  }
  return blockTypes;
};

/**
 * Get selected blocks from selector workspace, pulls info from the Export
 * Settings form in Block Exporter, and downloads code accordingly.
 *
 * TODO(quachtina96): allow export as zip.
 */
BlockExporterController.prototype.export = function() {
  // Get selected blocks' information.
  var blockTypes = this.getSelectedBlockTypes_();
  var blockXmlMap = this.blockLibStorage.getBlockXmlMap(blockTypes);

  // Pull block definition(s) settings from the Export Settings form.
  var wantBlockDef = document.getElementById('blockDefCheck').checked;
  var definitionFormat = document.getElementById('exportFormat').value;
  var blockDef_filename = document.getElementById('blockDef_filename').value;

  // Pull block generator stub(s) settings from the Export Settings form.
  var wantGenStub = document.getElementById('genStubCheck').checked;
  var language = document.getElementById('exportLanguage').value;
  var generatorStub_filename = document.getElementById(
      'generatorStub_filename').value;

  if (wantBlockDef) {
    // User wants to export selected blocks' definitions.
    if (!blockDef_filename) {
      // User needs to enter filename.
      alert('Please enter a filename for your block definition(s) download.');
    } else {
      // Get block definition code in the selected format for the blocks.
      var blockDefs = this.tools.getBlockDefs(blockXmlMap,
          definitionFormat);
      // Download the file.
      FactoryUtils.createAndDownloadFile(
          blockDefs, blockDef_filename, definitionFormat);
    }
  }

  if (wantGenStub) {
    // User wants to export selected blocks' generator stubs.
    if (!generatorStub_filename) {
      // User needs to enter filename.
      alert('Please enter a filename for your generator stub(s) download.');
    } else {
      // Get generator stub code in the selected language for the blocks.
      var genStubs = this.tools.getGeneratorCode(blockXmlMap,
          language);
      // Download the file.
      FactoryUtils.createAndDownloadFile(
          genStubs, generatorStub_filename, language);
    }
  }

};

/**
 * Update the Exporter's toolbox with either the given toolbox xml or toolbox
 * xml generated from blocks stored in block library.
 *
 * @param {Element} opt_toolboxXml - Xml to define toolbox of the selector
 *    workspace.
 */
BlockExporterController.prototype.updateToolbox = function(opt_toolboxXml) {
  // Use given xml or xml generated from updated block library.
  var updatedToolbox = opt_toolboxXml ||
      this.tools.generateToolboxFromLibrary(this.blockLibStorage);

  // Update the view's toolbox.
  this.view.setToolbox(updatedToolbox);

  // Render the toolbox in the selector workspace.
  this.view.renderToolbox(updatedToolbox);

  // Do not try to disable any selected blocks deleted from the block library.
  // Instead, deselect them.
  var selectedBlocks = this.view.getSelectedBlocks();
  var updatedSelectedBlocks = [];
  for (var i = 0, selectedBlock; selectedBlock = selectedBlocks[i]; i++) {
    if (this.blockLibStorage[selectedBlock.type]) {
      updatedSelectedBlocks.push(selectedBlock);
    } else {
      this.view.removeBlock(selectedBlock);
    }
  }
  // Disable any selected blocks.
  var selectedBlockTypes = this.getSelectedBlockTypes_();
  for (var i = 0, blockType; blockType = selectedBlockTypes[i]; i++) {
    this.setBlockEnabled(blockType, false);
  }
};

/**
 * Enable or Disable block in selector workspace's toolbox.
 *
 * @param {!string} blockType - Type of block to disable or enable.
 * @param {!boolean} enable - True to enable the block, false to disable block.
 */
BlockExporterController.prototype.setBlockEnabled =
    function(blockType, enable) {
  // Get toolbox xml, category, and block elements.
  var toolboxXml = this.view.toolbox;
  var category = goog.dom.xml.selectSingleNode(toolboxXml,
      '//category[@name="' + blockType + '"]');
  var block = goog.dom.getFirstElementChild(category);
  // Enable block.
  goog.dom.xml.setAttributes(block, {disabled: !enable});
};

/**
 * Add change listeners to the exporter's selector workspace.
 */
BlockExporterController.prototype.addChangeListenersToSelectorWorkspace
    = function() {
  // Assign the BlockExporterController to 'self' to be called in the change
  // listeners. This keeps it in scope--otherwise, 'this' in the change
  // listeners refers to the wrong thing.
  var self = this;
  var selector = this.view.selectorWorkspace;
  selector.addChangeListener(
    function(event) {
      self.onSelectBlockForExport_(event);
    });
  selector.addChangeListener(
    function(event) {
      self.onDeselectBlockForExport_(event);
    });
};

/**
 * Callback function for when a user selects a block for export in selector
 * workspace. Disables selected block so that the user only exports one
 * copy of starter code per block. Attached to the blockly create event in block
 * factory expansion's init.
 * @private
 *
 * @param {!Blockly.Events} event - The fired Blockly event.
 */
BlockExporterController.prototype.onSelectBlockForExport_ = function(event) {
  // The user created a block in selector workspace.
  if (event.type == Blockly.Events.CREATE) {
    // Get type of block created.
    var block = this.view.selectorWorkspace.getBlockById(event.blockId);
    var blockType = block.type;
    // Disable the selected block. Users can only export one copy of starter
    // code per block.
    this.setBlockEnabled(blockType, false);
    // Show currently selected blocks in helper text.
    this.view.listSelectedBlocks(this.getSelectedBlockTypes_());
    this.updatePreview();
  }
};

/**
 * Callback function for when a user deselects a block in selector
 * workspace by deleting it. Re-enables block so that the user may select it for
 * export
 * @private
 *
 * @param {!Blockly.Events} event - The fired Blockly event.
 */
BlockExporterController.prototype.onDeselectBlockForExport_ = function(event) {
  // The user deleted a block in selector workspace.
  if (event.type == Blockly.Events.DELETE) {
    // Get type of block created.
    var deletedBlockXml = event.oldXml;
    var blockType = deletedBlockXml.getAttribute('type');
    // Do not try to enable any blocks deleted from the block library.
    if (this.blockLibStorage[blockType]) {
      // Enable the deselected block.
      this.setBlockEnabled(blockType, true);
    }
    // Show currently selected blocks in helper text.
    this.view.listSelectedBlocks(this.getSelectedBlockTypes_());
    this.updatePreview();
  }
};

/**
 * Tied to the 'Clear Selected Blocks' button in the Block Exporter.
 * Deselects all blocks on the selector workspace by deleting them and updating
 * text accordingly.
 */
BlockExporterController.prototype.clearSelectedBlocks = function() {
  // Clear selector workspace.
  this.view.clearSelectorWorkspace();
};

/**
 * Tied to the 'Add All Stored Blocks' button in the Block Exporter.
 * Adds all blocks stored in block library to the selector workspace.
 */
BlockExporterController.prototype.addAllBlocksToWorkspace = function() {
  // Clear selector workspace.
  this.view.clearSelectorWorkspace();

  // Add and evaluate all blocks' definitions.
  var allBlockTypes = this.blockLibStorage.getBlockTypes();
  var blockXmlMap = this.blockLibStorage.getBlockXmlMap(allBlockTypes);
  this.tools.addBlockDefinitions(blockXmlMap);

  // For every block, render in selector workspace.
  for (var i = 0, blockType; blockType = allBlockTypes[i]; i++) {
    this.view.addBlock(blockType);
  }

  // Clean up workspace.
  this.view.cleanUpSelectorWorkspace();
};

/**
 * Returns the category xml containing all blocks in the block library.
 *
 * @return {Element} Xml for a category to be used in toolbox.
 */
BlockExporterController.prototype.getBlockLibCategory = function() {
  return this.tools.generateCategoryFromBlockLib(this.blockLibStorage);
};

/**
 * Updates preview code (block definitions and generator stubs) in the exporter
 * preview to reflect selected blocks.
 */
BlockExporterController.prototype.updatePreview = function() {
  // Get selected blocks' information.
  var blockTypes = this.getSelectedBlockTypes_();
  var blockXmlMap = this.blockLibStorage.getBlockXmlMap(blockTypes);

  // Get block definition code in the selected format for the blocks.
  var definitionFormat = document.getElementById('exportFormat').value;
  var blockDefs = this.tools.getBlockDefs(blockXmlMap, definitionFormat);

  // Get generator stub code in the selected language for the blocks.
  var language = document.getElementById('exportLanguage').value;
  var genStubs = this.tools.getGeneratorCode(blockXmlMap, language);

  // Update the text areas containing the code.
  BlockFactory.injectCode(blockDefs, 'blockDefs_textArea');
  BlockFactory.injectCode(genStubs, 'genStubs_textArea');
};

/**
 * Sets format of block definitions in the exporter preview to the format
 * selected by the user.
 */
BlockExporterController.prototype.updateBlockDefsFormat = function() {
  // Get selected blocks' information.
  var blockTypes = this.getSelectedBlockTypes_();
  var blockXmlMap = this.blockLibStorage.getBlockXmlMap(blockTypes);

  // Get block definition code in the selected format for the blocks.
  var definitionFormat = document.getElementById('exportFormat').value;
  var blockDefs = this.tools.getBlockDefs(blockXmlMap, definitionFormat);

  // Update the text area containing the code.
  BlockFactory.injectCode(blockDefs, 'blockDefs_textArea');
};

/**
 * Sets language of block definitions in the exporter preview to the format
 * selected by the user.
 */
BlockExporterController.prototype.updateGenStubsLanguage = function() {
  // Get selected blocks' information.
  var blockTypes = this.getSelectedBlockTypes_();
  var blockXmlMap = this.blockLibStorage.getBlockXmlMap(blockTypes);

  // Get generator stub code in the selected language for the blocks.
  var language = document.getElementById('exportLanguage').value;
  var genStubs = this.tools.getGeneratorCode(blockXmlMap, language);

  // Update the text area containing the code.
  BlockFactory.injectCode(genStubs, 'genStubs_textArea');
};
