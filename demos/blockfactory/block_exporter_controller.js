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
goog.require('BlockExporterView');
goog.require('BlockExporterTools');

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
  // Xml representation of the toolbox
  this.view = new BlockExporterView(
      this.tools.generateToolboxFromLibrary(this.blockLibStorage));
};

/**
 * Get the selected block types.
 * @private
 *
 * @return {!Array.<string>} Types of blocks in workspace.
 */
BlockExporterController.prototype.getSelectedBlockTypes_ = function() {
  var selectedBlocks = this.view.selectorWorkspace.getAllBlocks();
  var blockTypes = [];
  for (var i = 0; i < selectedBlocks.length; i++) {
    blockTypes.push(selectedBlocks[i].type);
  }
  return blockTypes;
};

/**
 * Get selected blocks from selector workspace, pulls info from the Export
 * Settings form in Block Exporter, and downloads block code accordingly.
 */
BlockExporterController.prototype.exportBlocks = function() {
  var blockTypes = this.getSelectedBlockTypes_();
  var blockXmlMap = this.blockLibStorage.getBlockXmls(blockTypes);

  // Pull inputs from the Export Settings form.
  var definitionFormat = document.getElementById('exportFormat').value;
  var language = document.getElementById('exportLanguage').value;
  var blockDef_filename = document.getElementById('blockDef_filename').value;
  var generatorStub_filename = document.getElementById(
      'generatorStub_filename').value;
  var wantBlockDef = document.getElementById('blockDefCheck').checked;
  var wantGenStub = document.getElementById('genStubCheck').checked;

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
      BlockFactory.createAndDownloadFile_(
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
      BlockFactory.createAndDownloadFile_(
          genStubs, generatorStub_filename, language);
    }
  }
};

/**
 * Update the Exporter's toolbox.
 *
 * @param {Element} opt_toolboxXml - Xml to define toolbox of the selector
 *    workspace.
 */
BlockExporterController.prototype.updateToolbox = function(opt_toolboxXml) {
  var updatedToolbox = opt_toolboxXml ||
      this.tools.generateToolboxFromLibrary(this.blockLibStorage);
  this.view.setToolbox(updatedToolbox);
  this.view.renderToolbox(updatedToolbox);
};
