/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for an object that owns a block's rendering SVG
 * elements.
 * @author fenichel@google.com (Rachel Fenichel)
 */

'use strict';

goog.module('Blockly.blockRendering.IPathObject');
goog.module.declareLegacyNamespace();

const Block = goog.requireType('Blockly.Block');
const ConstantProvider = goog.requireType('Blockly.blockRendering.ConstantProvider');
const Theme = goog.requireType('Blockly.Theme');


/**
 * An interface for a block's path object.
 * @param {!SVGElement} _root The root SVG element.
 * @param {!ConstantProvider} _constants The renderer's
 *     constants.
 * @interface
 */
const IPathObject = function(_root, _constants) {};

/**
 * The primary path of the block.
 * @type {!SVGElement}
 */
IPathObject.prototype.svgPath;

/**
 * The renderer's constant provider.
 * @type {!ConstantProvider}
 */
IPathObject.prototype.constants;

/**
 * The primary path of the block.
 * @type {!Theme.BlockStyle}
 */
IPathObject.prototype.style;

/**
 * Holds the cursors SVG element when the cursor is attached to the block.
 * This is null if there is no cursor on the block.
 * @type {SVGElement}
 */
IPathObject.prototype.cursorSvg;

/**
 * Holds the markers SVG element when the marker is attached to the block.
 * This is null if there is no marker on the block.
 * @type {SVGElement}
 */
IPathObject.prototype.markerSvg;

/**
 * Set the path generated by the renderer onto the respective SVG element.
 * @param {string} pathString The path.
 * @package
 */
IPathObject.prototype.setPath;

/**
 * Apply the stored colours to the block's path, taking into account whether
 * the paths belong to a shadow block.
 * @param {!Block} block The source block.
 * @package
 */
IPathObject.prototype.applyColour;

/**
 * Update the style.
 * @param {!Theme.BlockStyle} blockStyle The block style to use.
 * @package
 */
IPathObject.prototype.setStyle;

/**
 * Flip the SVG paths in RTL.
 * @package
 */
IPathObject.prototype.flipRTL;

/**
 * Add the cursor SVG to this block's SVG group.
 * @param {SVGElement} cursorSvg The SVG root of the cursor to be added to the
 *     block SVG group.
 * @package
 */
IPathObject.prototype.setCursorSvg;

/**
 * Add the marker SVG to this block's SVG group.
 * @param {SVGElement} markerSvg The SVG root of the marker to be added to the
 *     block SVG group.
 * @package
 */
IPathObject.prototype.setMarkerSvg;

/**
 * Set whether the block shows a highlight or not.  Block highlighting is
 * often used to visually mark blocks currently being executed.
 * @param {boolean} highlighted True if highlighted.
 * @package
 */
IPathObject.prototype.updateHighlighted;

/**
 * Add or remove styling showing that a block is selected.
 * @param {boolean} enable True if selection is enabled, false otherwise.
 * @package
 */
IPathObject.prototype.updateSelected;

/**
 * Add or remove styling showing that a block is dragged over a delete area.
 * @param {boolean} enable True if the block is being dragged over a delete
 *     area, false otherwise.
 * @package
 */
IPathObject.prototype.updateDraggingDelete;

/**
 * Add or remove styling showing that a block is an insertion marker.
 * @param {boolean} enable True if the block is an insertion marker, false
 *     otherwise.
 * @package
 */
IPathObject.prototype.updateInsertionMarker;

/**
 * Add or remove styling showing that a block is movable.
 * @param {boolean} enable True if the block is movable, false otherwise.
 * @package
 */
IPathObject.prototype.updateMovable;

/**
 * Add or remove styling that shows that if the dragging block is dropped, this
 * block will be replaced.  If a shadow block, it will disappear.  Otherwise it
 * will bump.
 * @param {boolean} enable True if styling should be added.
 * @package
 */
IPathObject.prototype.updateReplacementFade;

exports = IPathObject;
