/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2019 Google Inc.
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
 * @fileoverview Methods for graphically rendering a cursor as SVG.
 * @author samelh@microsoft.com (Sam El-Husseini)
 */
'use strict';

goog.provide('Blockly.CursorSvg');

goog.require('Blockly.Cursor');
goog.require('Blockly.utils.object');


/**
 * Class for a cursor.
 * @param {!Blockly.Workspace} workspace The workspace the cursor belongs to.
 * @param {boolean=} opt_marker True if the cursor is a marker. A marker is used
 *     to save a location and is an immovable cursor. False or undefined if the
 *     cursor is not a marker.
 * @constructor
 */
Blockly.CursorSvg = function(workspace, opt_marker) {
  /**
   * The workspace the cursor belongs to.
   * @type {!Blockly.Workspace}
   * @private
   */
  this.workspace_ = workspace;

  /**
   * True if the cursor should be drawn as a marker, false otherwise.
   * A marker is drawn as a solid blue line, while the cursor is drawns as a
   * flashing red one.
   * @type {boolean}
   * @private
   */
  this.isMarker_ = opt_marker;

  /**
   * The constants necessary to draw the cursor.
   * @type {Blockly.blockRendering.ConstantProvider}
   * @private
   */
  this.constants_ = new Blockly.blockRendering.ConstantProvider();
  this.constants_.init();
};

/**
 * Height of the horizontal cursor.
 * @type {number}
 * @const
 */
Blockly.CursorSvg.CURSOR_HEIGHT = 5;

/**
 * Width of the horizontal cursor.
 * @type {number}
 * @const
 */
Blockly.CursorSvg.CURSOR_WIDTH = 100;

/**
 * The start length of the notch.
 * @type {number}
 * @const
 */
Blockly.CursorSvg.NOTCH_START_LENGTH = 24;

/**
 * Padding around the input.
 * @type {number}
 * @const
 */
Blockly.CursorSvg.VERTICAL_PADDING = 5;

/**
 * Padding around a stack.
 * @type {number}
 * @const
 */
Blockly.CursorSvg.STACK_PADDING = 10;

/**
 * Padding around a block.
 * @type {number}
 * @const
 */
Blockly.CursorSvg.BLOCK_PADDING = 2;

/**
 * What we multiply the height by to get the height of the cursor.
 * Only used for the block and block connections.
 * @type {number}
 * @const
 */
Blockly.CursorSvg.HEIGHT_MULTIPLIER = 3 / 4;

/**
 * Cursor color.
 * @type {string}
 * @const
 */
Blockly.CursorSvg.CURSOR_COLOR = '#cc0a0a';

/**
 * Immovable marker color.
 * @type {string}
 * @const
 */
Blockly.CursorSvg.MARKER_COLOR = '#4286f4';

/**
 * The name of the css class for a cursor.
 * @const {string}
 */
Blockly.CursorSvg.CURSOR_CLASS = 'blocklyCursor';

/**
 * The name of the css class for a marker.
 * @const {string}
 */
Blockly.CursorSvg.MARKER_CLASS = 'blocklyMarker';

/**
 * Parent SVG element.
 * This is generally a block's SVG root, unless the cursor is on the workspace.
 * @type {Element}
 */
Blockly.CursorSvg.prototype.parent_ = null;

/**
 * The current SVG element for the cursor.
 * @type {Element}
 */
Blockly.CursorSvg.prototype.currentCursorSvg = null;

/**
 * Return the root node of the SVG or null if none exists.
 * @return {Element} The root SVG node.
 */
Blockly.CursorSvg.prototype.getSvgRoot = function() {
  return this.svgGroup_;
};

/**
 * Create the DOM element for the cursor.
 * @return {!Element} The cursor controls SVG group.
 * @package
 */
Blockly.CursorSvg.prototype.createDom = function() {
  var className = this.isMarker_ ?
      Blockly.CursorSvg.MARKER_CLASS : Blockly.CursorSvg.CURSOR_CLASS;

  this.svgGroup_ =
      Blockly.utils.dom.createSvgElement('g', {
        'class': className
      }, null);

  this.createCursorSvg_();
  return this.svgGroup_;
};

/**
 * Attaches the svg root of the cursor to the svg group of the parent.
 * @param {!Blockly.WorkspaceSvg|!Blockly.Field|!Blockly.BlockSvg} newParent
 *    The workspace, field, or block that the cursor svg element should be
 *    attached to.
 * @private
 */
Blockly.CursorSvg.prototype.setParent_ = function(newParent) {
  if (this.isMarker_) {
    if (this.parent_) {
      this.parent_.setMarkerSvg(null);
    }
    newParent.setMarkerSvg(this.getSvgRoot());
  } else {
    if (this.parent_) {
      this.parent_.setCursorSvg(null);
    }
    newParent.setCursorSvg(this.getSvgRoot());
  }
  this.parent_ = newParent;
};

/**************************/
/**** Display          ****/
/**************************/

/**
 * Show the cursor as a combination of the previous connection and block,
 * the output connection and block, or just the block.
 * @param {!Blockly.BlockSvg} block The block the cursor is currently on.
 * @private
 */
Blockly.CursorSvg.prototype.showWithBlockPrevOutput_ = function(block) {
  var width = block.width;
  var height = block.height;
  var cursorHeight = height * Blockly.CursorSvg.HEIGHT_MULTIPLIER;
  var cursorOffset = Blockly.CursorSvg.BLOCK_PADDING;

  if (block.previousConnection) {
    this.positionPrevious_(width, cursorOffset, cursorHeight);
  } else if (block.outputConnection) {
    this.positionOutput_(width, height);
  } else {
    this.positionBlock_(width, cursorOffset, cursorHeight);
  }

  this.currentCursorSvg = this.cursorBlock_;
  this.setParent_(block);
  this.showCurrent_();
};

/**
 * Show the visual representation of a workspace coordinate.
 * This is a horizontal line.
 * @param {!Blockly.ASTNode} curNode The node that we want to draw the cursor for.
 * @private
 */
Blockly.CursorSvg.prototype.showWithCoordinates_ = function(curNode) {
  var wsCoordinate = curNode.getWsCoordinate();
  this.currentCursorSvg = this.cursorSvgLine_;
  this.setParent_(this.workspace_);
  this.positionLine_(wsCoordinate.x, wsCoordinate.y,
      Blockly.CursorSvg.CURSOR_WIDTH);
  this.showCurrent_();
};

/**
 * Show the visual representation of a field.
 * This is a box around the field.
 * @param {!Blockly.ASTNode} curNode The node that we want to draw the cursor for.
 * @private
 */
Blockly.CursorSvg.prototype.showWithField_ = function(curNode) {
  var field = curNode.getLocation();
  var width = field.borderRect_.width.baseVal.value;
  var height = field.borderRect_.height.baseVal.value;

  this.currentCursorSvg = this.cursorSvgRect_;
  this.setParent_(field);
  this.positionRect_(0, 0, width, height);
  this.showCurrent_();
};

/**
 * Show the visual representation of an input.
 * This is a puzzle piece.
 * @param {!Blockly.ASTNode} curNode The node that we want to draw the cursor for.
 * @private
 */
Blockly.CursorSvg.prototype.showWithInput_ = function(curNode) {
  var connection = /** @type {Blockly.Connection} */
      (curNode.getLocation());
  var path = Blockly.utils.svgPaths.moveTo(0,0) +
      this.constants_.PUZZLE_TAB.pathDown;
  this.currentCursorSvg = this.cursorInput_;
  this.cursorInput_.setAttribute('d', path);
  this.setParent_(connection.getSourceBlock());
  this.positionInput_(connection);
  this.showCurrent_();
};


/**
 * Show the visual representation of a next connection.
 * This is a horizontal line.
 * @param {!Blockly.ASTNode} curNode The node that we want to draw the cursor for.
 * @private
 */
Blockly.CursorSvg.prototype.showWithNext_ = function(curNode) {
  var connection = curNode.getLocation();
  var targetBlock = connection.getSourceBlock();
  var x = 0;
  var y = connection.getOffsetInBlock().y;
  var width = targetBlock.getHeightWidth().width;

  this.currentCursorSvg = this.cursorSvgLine_;
  this.setParent_(connection.getSourceBlock());
  this.positionLine_(x, y, width);
  this.showCurrent_();
};

/**
 * Show the visual representation of a stack.
 * This is a box with extra padding around the entire stack of blocks.
 * @param {!Blockly.ASTNode} curNode The node that we want to draw the cursor for.
 * @private
 */
Blockly.CursorSvg.prototype.showWithStack_ = function(curNode) {
  var block = curNode.getLocation();

  // Gets the height and width of entire stack.
  var heightWidth = block.getHeightWidth();

  // Add padding so that being on a stack looks different than being on a block.
  var width = heightWidth.width + Blockly.CursorSvg.STACK_PADDING;
  var height = heightWidth.height + Blockly.CursorSvg.STACK_PADDING;

  // Shift the rectangle slightly to upper left so padding is equal on all sides.
  var x = -1 * Blockly.CursorSvg.STACK_PADDING / 2;
  var y = -1 * Blockly.CursorSvg.STACK_PADDING / 2;

  this.currentCursorSvg = this.cursorSvgRect_;
  this.setParent_(block);

  this.positionRect_(x, y, width, height);
  this.showCurrent_();
};

/**
 * Show the current cursor.
 * @private
 */
Blockly.CursorSvg.prototype.showCurrent_ = function() {
  this.hide();
  this.currentCursorSvg.style.display = '';
};

/**************************/
/**** Position         ****/
/**************************/

/**
 * Position the cursor for a block.
 * Displays an outline of the top half of a rectangle around a block.
 * @param {!number} width The width of the block.
 * @param {!number} cursorOffset The extra padding for around the block.
 * @param {!number} cursorHeight The height of the cursor.
 */
Blockly.CursorSvg.prototype.positionBlock_ = function(width, cursorOffset, cursorHeight) {
  var cursorPath = Blockly.utils.svgPaths.moveBy(-1 * cursorOffset, cursorHeight) +
    Blockly.utils.svgPaths.lineOnAxis('V', -1 * cursorOffset) +
    Blockly.utils.svgPaths.lineOnAxis('H', width + cursorOffset * 2) +
    Blockly.utils.svgPaths.lineOnAxis('V', cursorHeight);
  this.cursorBlock_.setAttribute('d', cursorPath);
};

/**
 * Position the cursor for an input connection.
 * Displays a filled in puzzle piece.
 * @param {!Blockly.Connection} connection The connection to position cursor around.
 * @private
 */
Blockly.CursorSvg.prototype.positionInput_ = function(connection) {
  var x = connection.getOffsetInBlock().x;
  var y = connection.getOffsetInBlock().y;

  this.cursorInput_.setAttribute('transform',
      'translate(' + x + ',' + y + ')' +
      (connection.getSourceBlock().RTL ? ' scale(-1 1)' : ''));
};

/**
 * Move and show the cursor at the specified coordinate in workspace units.
 * Displays a horizontal line.
 * @param {!number} x The new x, in workspace units.
 * @param {!number} y The new y, in workspace units.
 * @param {!number} width The new width, in workspace units.
 * @private
 */
Blockly.CursorSvg.prototype.positionLine_ = function(x, y, width) {
  this.cursorSvgLine_.setAttribute('x', x);
  this.cursorSvgLine_.setAttribute('y', y);
  this.cursorSvgLine_.setAttribute('width', width);
};

/**
 * Position the cursor for an output connection.
 * Displays a puzzle outline and the top and bottom path.
 * @param {!number} width The width of the block.
 * @param {!number} height The height of the block.
 * @private
 */
Blockly.CursorSvg.prototype.positionOutput_ = function(width, height) {
  var cursorPath = Blockly.utils.svgPaths.moveBy(width, 0) +
    Blockly.utils.svgPaths.lineOnAxis('h', -1 * (width - this.constants_.PUZZLE_TAB.width)) +
    Blockly.utils.svgPaths.lineOnAxis('v', this.constants_.TAB_OFFSET_FROM_TOP) +
    this.constants_.PUZZLE_TAB.pathDown +
    Blockly.utils.svgPaths.lineOnAxis('V', height) +
    Blockly.utils.svgPaths.lineOnAxis('H', width);
  this.cursorBlock_.setAttribute('d', cursorPath);
};

/**
 * Position the cursor for a previous connection.
 * Displays a half rectangle with a notch in the top to represent the previous
 * conenction.
 * @param {!number} width The width of the block.
 * @param {!number} cursorOffset The offset of the cursor from around the block.
 * @param {!number} cursorHeight The height of the cursor.
 * @private
 */
Blockly.CursorSvg.prototype.positionPrevious_ = function(width, cursorOffset, cursorHeight) {
  var cursorPath = Blockly.utils.svgPaths.moveBy(-1 * cursorOffset, cursorHeight) +
    Blockly.utils.svgPaths.lineOnAxis('V', -1 * cursorOffset) +
    Blockly.utils.svgPaths.lineOnAxis('H', this.constants_.NOTCH_OFFSET_LEFT) +
    this.constants_.NOTCH.pathLeft +
    Blockly.utils.svgPaths.lineOnAxis('H', width + cursorOffset * 2) +
    Blockly.utils.svgPaths.lineOnAxis('V', cursorHeight);
  this.cursorBlock_.setAttribute('d', cursorPath);
  this.cursorInput_.setAttribute('transform', ' scale(-1 1)');
};

/**
 * Move and show the cursor at the specified coordinate in workspace units.
 * Displays a filled in rectangle.
 * @param {!number} x The new x, in workspace units.
 * @param {!number} y The new y, in workspace units.
 * @param {!number} width The new width, in workspace units.
 * @param {!number} height The new height, in workspace units.
 * @private
 */
Blockly.CursorSvg.prototype.positionRect_ = function(x, y, width, height) {
  this.cursorSvgRect_.setAttribute('x', x);
  this.cursorSvgRect_.setAttribute('y', y);
  this.cursorSvgRect_.setAttribute('width', width);
  this.cursorSvgRect_.setAttribute('height', height);
};

/**
 * Hide the cursor.
 * @package
 */
Blockly.CursorSvg.prototype.hide = function() {
  this.cursorSvgLine_.style.display = 'none';
  this.cursorSvgRect_.style.display = 'none';
  this.cursorInput_.style.display = 'none';
  this.cursorBlock_.style.display = 'none';
};

/**
 * Update the cursor.
 * @param {!Blockly.ASTNode} curNode The node that we want to draw the cursor for.
 * @package
 */
Blockly.CursorSvg.prototype.draw = function(curNode) {
  if (!curNode) {
    return;
  }
  if (curNode.getType() === Blockly.ASTNode.types.BLOCK) {
    this.showWithBlockPrevOutput_(curNode.getLocation());
  } else if (curNode.getType() === Blockly.ASTNode.types.OUTPUT) {
    this.showWithBlockPrevOutput_(curNode.getLocation().getSourceBlock());
  } else if (curNode.getLocation().type === Blockly.INPUT_VALUE) {
    this.showWithInput_(curNode);
  } else if (curNode.getLocation().type === Blockly.NEXT_STATEMENT) {
    this.showWithNext_(curNode);
  } else if (curNode.getType() === Blockly.ASTNode.types.PREVIOUS) {
    this.showWithBlockPrevOutput_(curNode.getLocation().getSourceBlock());
  } else if (curNode.getType() === Blockly.ASTNode.types.FIELD) {
    this.showWithField_(curNode);
  } else if (curNode.getType() === Blockly.ASTNode.types.WORKSPACE) {
    this.showWithCoordinates_(curNode);
  } else if (curNode.getType() === Blockly.ASTNode.types.STACK) {
    this.showWithStack_(curNode);
  }
};

/**
 * Create the cursor SVG.
 * @return {Element} The SVG node created.
 * @private
 */
Blockly.CursorSvg.prototype.createCursorSvg_ = function() {
  /* This markup will be generated and added to the .svgGroup_:
  <g>
    <rect width="100" height="5">
      <animate attributeType="XML" attributeName="fill" dur="1s"
        values="transparent;transparent;#fff;transparent" repeatCount="indefinite" />
    </rect>
  </g>
  */

  var colour = this.isMarker_ ? Blockly.CursorSvg.MARKER_COLOR :
      Blockly.CursorSvg.CURSOR_COLOR;
  this.cursorSvg_ = Blockly.utils.dom.createSvgElement('g',
      {
        'width': Blockly.CursorSvg.CURSOR_WIDTH,
        'height': Blockly.CursorSvg.CURSOR_HEIGHT
      }, this.svgGroup_);

  // A horizontal line used to represent a workspace coordinate or next connection.
  this.cursorSvgLine_ = Blockly.utils.dom.createSvgElement('rect',
      {
        'x': '0',
        'y': '0',
        'fill': colour,
        'width': Blockly.CursorSvg.CURSOR_WIDTH,
        'height': Blockly.CursorSvg.CURSOR_HEIGHT,
        'style': 'display: none;'
      },
      this.cursorSvg_);

  // A filled in rectangle used to represent a stack.
  this.cursorSvgRect_ = Blockly.utils.dom.createSvgElement('rect',
      {
        'class': 'blocklyVerticalCursor',
        'x': '0',
        'y': '0',
        'rx': '10', 'ry': '10',
        'style': 'display: none;',
        'stroke': colour
      },
      this.cursorSvg_);

  // A filled in puzzle piece used to represent an input value.
  this.cursorInput_ = Blockly.utils.dom.createSvgElement(
      'path',
      {
        'width': Blockly.CursorSvg.CURSOR_WIDTH,
        'height': Blockly.CursorSvg.CURSOR_HEIGHT,
        'transform':'',
        'style':'display: none;',
        'fill': colour
      },
      this.cursorSvg_);

  // A path used to repreesent a previous connection and a block, an output
  // connection and a block, or a block.
  this.cursorBlock_ = Blockly.utils.dom.createSvgElement(
      'path',
      {
        'width': Blockly.CursorSvg.CURSOR_WIDTH,
        'height': Blockly.CursorSvg.CURSOR_HEIGHT,
        'transform':'',
        'style':'display: none;',
        'fill': 'none',
        'stroke': colour,
        'stroke-width': '4'
      },
      this.cursorSvg_);

  // Markers and stack cursors don't blink.
  if (!this.isMarker_) {
    Blockly.utils.dom.createSvgElement('animate',
        {
          'attributeType': 'XML',
          'attributeName': 'fill',
          'dur': '1s',
          'values': Blockly.CursorSvg.CURSOR_COLOR + ';transparent;transparent;',
          'repeatCount': 'indefinite'
        },
        this.cursorSvgLine_);

    Blockly.utils.dom.createSvgElement('animate',
        {
          'attributeType': 'XML',
          'attributeName': 'fill',
          'dur': '1s',
          'values': Blockly.CursorSvg.CURSOR_COLOR + ';transparent;transparent;',
          'repeatCount': 'indefinite'
        },
        this.cursorInput_);

    Blockly.utils.dom.createSvgElement('animate',
        {
          'attributeType': 'XML',
          'attributeName': 'stroke',
          'dur': '1s',
          'values': Blockly.CursorSvg.CURSOR_COLOR + ';transparent;transparent;',
          'repeatCount': 'indefinite'
        },
        this.cursorBlock_);
  }

  return this.cursorSvg_;
};

/**
 * Dispose of this cursor.
 * @package
 */
Blockly.CursorSvg.prototype.dispose = function() {
  if (this.svgGroup_) {
    Blockly.utils.dom.removeNode(this.svgGroup_);
  }
};
