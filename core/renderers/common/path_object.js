/**
 * @license
 * Copyright 2019 Google LLC
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
 * @fileoverview An object that owns a block's rendering SVG elements.
 * @author fenichel@google.com (Rachel Fenichel)
 */

'use strict';

goog.provide('Blockly.blockRendering.PathObject');

goog.require('Blockly.blockRendering.ConstantProvider');
goog.require('Blockly.blockRendering.IPathObject');
goog.require('Blockly.Theme');
goog.require('Blockly.utils.dom');


/**
 * An object that handles creating and setting each of the SVG elements
 * used by the renderer.
 * @param {!SVGElement} root The root SVG element.
 * @param {!Blockly.blockRendering.ConstantProvider} constants The renderer's
 *     constants.
 * @constructor
 * @implements {Blockly.blockRendering.IPathObject}
 * @package
 */
Blockly.blockRendering.PathObject = function(root, constants) {
  /**
   * The renderer's constant provider.
   * @type {!Blockly.blockRendering.ConstantProvider}
   * @protected
   */
  this.constants_ = constants;

  this.svgRoot = root;

  /**
   * The primary path of the block.
   * @type {SVGElement}
   * @package
   */
  this.svgPath = Blockly.utils.dom.createSvgElement('path',
      {'class': 'blocklyPath'}, this.svgRoot);

  // The light and dark paths need to exist (for now) because there is colouring
  // code in block_svg that depends on them.  But we will always set them to
  // display: none, and eventually we want to remove them entirely.

  /**
   * The light path of the block.
   * @type {SVGElement}
   * @package
   */
  this.svgPathLight = Blockly.utils.dom.createSvgElement('path',
      {'class': 'blocklyPathLight'}, this.svgRoot);

  /**
   * The style object to use when colouring block paths.
   * @type {!Blockly.Theme.BlockStyle}
   * @package
   */
  this.style = Blockly.Theme.createBlockStyle('#000000');
};

/**
 * Set the path generated by the renderer onto the respective SVG element.
 * @param {string} pathString The path.
 * @package
 */
Blockly.blockRendering.PathObject.prototype.setPath = function(pathString) {
  this.svgPath.setAttribute('d', pathString);
  this.svgPathLight.style.display = 'none';
};

/**
 * Flip the SVG paths in RTL.
 * @package
 */
Blockly.blockRendering.PathObject.prototype.flipRTL = function() {
  // Mirror the block's path.
  this.svgPath.setAttribute('transform', 'scale(-1 1)');
};

/**
 * Apply the stored colours to the block's path, taking into account whether
 * the paths belong to a shadow block.
 * @param {boolean} isShadow True if the block is a shadow block.
 * @package
 */
Blockly.blockRendering.PathObject.prototype.applyColour = function(isShadow) {
  if (isShadow) {
    this.svgPath.setAttribute('stroke', 'none');
    this.svgPath.setAttribute('fill', this.style.colourSecondary);
  } else {
    this.svgPath.setAttribute('stroke', this.style.colourTertiary);
    this.svgPath.setAttribute('fill', this.style.colourPrimary);
  }
};

/**
 * Set the style.
 * @param {!Blockly.Theme.BlockStyle} blockStyle The block style to use.
 * @package
 */
Blockly.blockRendering.PathObject.prototype.setStyle = function(blockStyle) {
  this.style = blockStyle;
};

/**
 * Add or remove the given CSS class on the path object's root SVG element.
 * @param {string} className The name of the class to add or remove
 * @param {boolean} add True if the class should be added.  False if it should
 *     be removed.
 * @protected
 */
Blockly.blockRendering.PathObject.prototype.setClass_ = function(
    className, add) {
  if (add) {
    Blockly.utils.dom.addClass(/** @type {!Element} */ (this.svgRoot),
        className);
  } else {
    Blockly.utils.dom.removeClass(/** @type {!Element} */ (this.svgRoot),
        className);
  }
};

/**
 * Set whether the block shows a highlight or not.  Block highlighting is
 * often used to visually mark blocks currently being executed.
 * @param {boolean} enable True if highlighted.
 * @package
 */
Blockly.blockRendering.PathObject.prototype.updateHighlighted = function(
    enable) {
  if (enable) {
    this.svgPath.setAttribute('filter',
        'url(#' + this.constants_.embossFilterId + ')');
  } else {
    this.svgPath.setAttribute('filter', 'none');
  }
};

/**
 * Set whether the block shows a disable pattern or not.
 * @param {boolean} disabled True if disabled.
 * @param {boolean} isShadow True if the block is a shadow block.
 * @package
 */
Blockly.blockRendering.PathObject.prototype.updateDisabled = function(disabled,
    isShadow) {

  this.setClass_('blocklyDisabled', disabled);
  if (disabled) {
    this.svgPath.setAttribute('fill',
        'url(#' + this.constants_.disabledPatternId + ')');
  } else {
    this.applyColour(isShadow);
  }
};

/**
 * Add or remove styling showing that a block is selected.
 * @param {boolean} enable True if selection is enabled, false otherwise.
 * @package
 */
Blockly.blockRendering.PathObject.prototype.updateSelected = function(enable) {
  this.setClass_('blocklySelected', enable);
};

/**
 * Add or remove styling showing that a block is dragged over a delete area.
 * @param {boolean} enable True if the block is being dragged over a delete
 *     area, false otherwise.
 * @package
 */
Blockly.blockRendering.PathObject.prototype.updateDraggingDelete = function(
    enable) {
  this.setClass_('blocklyDraggingDelete', enable);
};

/**
 * Add or remove styling showing that a block is an insertion marker.
 * @param {boolean} enable True if the block is an insertion marker, false
 *     otherwise.
 * @package
 */
Blockly.blockRendering.PathObject.prototype.updateInsertionMarker = function(
    enable) {
  this.setClass_('blocklyInsertionMarker', enable);
};

/**
 * Add or remove styling showing that a block is movable.
 * @param {boolean} enable True if the block is movable, false otherwise.
 * @package
 */
Blockly.blockRendering.PathObject.prototype.updateMovable = function(enable) {
  this.setClass_('blocklyDraggable', enable);
};

/**
 * Add or remove styling that shows that if the dragging block is dropped, this
 * block will be replaced.  If a shadow block, it will disappear.  Otherwise it
 * will bump.
 * @param {boolean} enable True if styling should be added.
 * @package
 */
Blockly.blockRendering.PathObject.prototype.updateReplacementHighlight =
    function(enable) {
    /* eslint-disable indent */
  this.setClass_('blocklyReplaceable', enable);
}; /* eslint-enable indent */

/**
 * Determine whether or not to highlight a connection.
 * @param {Blockly.Connection} _conn The connection to determine whether or not
 *     to highlight.
 * @return {boolean} True if we should highlight the connection.
 * @package
 */
Blockly.blockRendering.PathObject.prototype.shouldHighlightConnection =
    function(_conn) {
    /* eslint-disable indent */
  return true;
}; /* eslint-enable indent */

