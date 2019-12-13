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
 * @fileoverview Makecode/scratch-style renderer.
 * Zelos: spirit of eager rivalry, emulation, envy, jealousy, and zeal.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.zelos');
goog.provide('Blockly.zelos.RenderInfo');

goog.require('Blockly.blockRendering.BottomRow');
goog.require('Blockly.blockRendering.ExternalValueInput');
goog.require('Blockly.blockRendering.InlineInput');
goog.require('Blockly.blockRendering.InputRow');
goog.require('Blockly.blockRendering.Measurable');
goog.require('Blockly.blockRendering.NextConnection');
goog.require('Blockly.blockRendering.OutputConnection');
goog.require('Blockly.blockRendering.PreviousConnection');
goog.require('Blockly.blockRendering.RenderInfo');
goog.require('Blockly.blockRendering.RoundCorner');
goog.require('Blockly.blockRendering.Row');
goog.require('Blockly.blockRendering.SquareCorner');
goog.require('Blockly.blockRendering.SpacerRow');
goog.require('Blockly.blockRendering.StatementInput');
goog.require('Blockly.blockRendering.TopRow');
goog.require('Blockly.blockRendering.Types');
goog.require('Blockly.utils.object');
goog.require('Blockly.zelos.BottomRow');
goog.require('Blockly.zelos.RightConnectionShape');
goog.require('Blockly.zelos.TopRow');


/**
 * An object containing all sizing information needed to draw this block.
 *
 * This measure pass does not propagate changes to the block (although fields
 * may choose to rerender when getSize() is called).  However, calling it
 * repeatedly may be expensive.
 *
 * @param {!Blockly.zelos.Renderer} renderer The renderer in use.
 * @param {!Blockly.BlockSvg} block The block to measure.
 * @constructor
 * @package
 * @extends {Blockly.blockRendering.RenderInfo}
 */
Blockly.zelos.RenderInfo = function(renderer, block) {
  Blockly.zelos.RenderInfo.superClass_.constructor.call(this, renderer, block);

  /**
   * An object with rendering information about the top row of the block.
   * @type {!Blockly.zelos.TopRow}
   * @override
   */
  this.topRow = new Blockly.zelos.TopRow(this.constants_);

  /**
   * An object with rendering information about the bottom row of the block.
   * @type {!Blockly.zelos.BottomRow}
   * @override
   */
  this.bottomRow = new Blockly.zelos.BottomRow(this.constants_);

  /**
   * @override
   */
  this.isInline = true;

  /**
   * Whether the block should be rendered as a multi-line block, either because
   * it's not inline or because it has been collapsed.
   * @type {boolean}
   */
  this.isMultiRow = !block.getInputsInline() || block.isCollapsed();

  /**
   * An object with rendering information about the right connection shape.
   * @type {Blockly.zelos.RightConnectionShape}
   */
  this.rightSide = this.outputConnection ?
      new Blockly.zelos.RightConnectionShape(this.constants_) : null;
};
Blockly.utils.object.inherits(Blockly.zelos.RenderInfo,
    Blockly.blockRendering.RenderInfo);

/**
 * Get the block renderer in use.
 * @return {!Blockly.zelos.Renderer} The block renderer in use.
 * @package
 */
Blockly.zelos.RenderInfo.prototype.getRenderer = function() {
  return /** @type {!Blockly.zelos.Renderer} */ (this.renderer_);
};

/**
 * @override
 */
Blockly.zelos.RenderInfo.prototype.measure = function() {
  // Modifing parent measure method to add `adjustXPosition_`.
  this.createRows_();
  this.addElemSpacing_();
  this.addRowSpacing_();
  this.adjustXPosition_();
  this.computeBounds_();
  this.alignRowElements_();
  this.finalize_();
};

/**
 * @override
 */
Blockly.zelos.RenderInfo.prototype.shouldStartNewRow_ = function(input,
    lastInput) {
  // If this is the first input, just add to the existing row.
  // That row is either empty or has some icons in it.
  if (!lastInput) {
    return false;
  }
  // A statement input or an input following one always gets a new row.
  if (input.type == Blockly.NEXT_STATEMENT ||
      lastInput.type == Blockly.NEXT_STATEMENT) {
    return true;
  }
  // Value and dummy inputs get new row if inputs are not inlined.
  if (input.type == Blockly.INPUT_VALUE || input.type == Blockly.DUMMY_INPUT) {
    return !this.isInline || this.isMultiRow;
  }
  return false;
};

/**
 * @override
 */
Blockly.zelos.RenderInfo.prototype.getInRowSpacing_ = function(prev, next) {
  if (!prev || !next) {
    // No need for padding at the beginning or end of the row if the
    // output shape is dynamic.
    if (this.outputConnection && this.outputConnection.isDynamicShape) {
      return this.constants_.NO_PADDING;
    }
  }
  if (!prev) {
    // Statement input padding.
    if (next && Blockly.blockRendering.Types.isStatementInput(next)) {
      return this.constants_.STATEMENT_INPUT_PADDING_LEFT;
    }
  }
  // Spacing between a rounded corner and a previous or next connection.
  if (prev && Blockly.blockRendering.Types.isLeftRoundedCorner(prev) && next) {
    if (Blockly.blockRendering.Types.isPreviousConnection(next) ||
      Blockly.blockRendering.Types.isNextConnection(next)) {
      return next.notchOffset - this.constants_.CORNER_RADIUS;
    }
  }
  return this.constants_.MEDIUM_PADDING;
};

/**
 * @override
 */
Blockly.zelos.RenderInfo.prototype.getSpacerRowHeight_ = function(
    prev, next) {
  // If we have an empty block add a spacer to increase the height.
  if (Blockly.blockRendering.Types.isTopRow(prev) &&
      Blockly.blockRendering.Types.isBottomRow(next)) {
    return this.constants_.EMPTY_BLOCK_SPACER_HEIGHT;
  }
  // Top and bottom rows act as a spacer so we don't need any extra padding.
  if ((Blockly.blockRendering.Types.isTopRow(prev))) {
    if (!prev.hasPreviousConnection && !this.outputConnection) {
      return this.constants_.SMALL_PADDING;
    }
    return this.constants_.NO_PADDING;
  }
  var precedesStatement =
      Blockly.blockRendering.Types.isInputRow(prev) && prev.hasStatement;
  var followsStatement =
      Blockly.blockRendering.Types.isInputRow(next) && next.hasStatement;
  if (precedesStatement || followsStatement) {
    var cornerHeight = this.constants_.INSIDE_CORNERS.rightHeight || 0;
    var height = Math.max(this.constants_.MEDIUM_PADDING,
        Math.max(this.constants_.NOTCH_HEIGHT, cornerHeight));
    return precedesStatement && followsStatement ?
        Math.max(height,
            cornerHeight * 2 + this.constants_.DUMMY_INPUT_MIN_HEIGHT) : height;
  }
  if ((Blockly.blockRendering.Types.isBottomRow(next))) {
    if (!this.outputConnection) {
      return this.constants_.SMALL_PADDING;
    }
    return this.constants_.NO_PADDING;
  }
  return this.constants_.MEDIUM_PADDING;
};

/**
 * @override
 */
Blockly.zelos.RenderInfo.prototype.getSpacerRowWidth_ = function(prev, next) {
  var width = this.width - this.startX;
  if ((Blockly.blockRendering.Types.isInputRow(prev) && prev.hasStatement) ||
      (Blockly.blockRendering.Types.isInputRow(next) && next.hasStatement)) {
    return Math.max(width, this.constants_.STATEMENT_INPUT_SPACER_MIN_WIDTH);
  }
  return width;
};

/**
 * @override
 */
Blockly.zelos.RenderInfo.prototype.getElemCenterline_ = function(row,
    elem) {
  if (row.hasStatement) {
    return row.yPos + this.constants_.EMPTY_STATEMENT_INPUT_HEIGHT / 2;
  }
  return Blockly.zelos.RenderInfo.superClass_.getElemCenterline_.call(this,
      row, elem);
};

/**
 * Adjust the x position of fields to bump all non-label fields in the first row
 * past the notch position.  This must be called before ``computeBounds`` is
 * called.
 * @protected
 */
Blockly.zelos.RenderInfo.prototype.adjustXPosition_ = function() {
  if (!this.topRow.hasPreviousConnection) {
    return;
  }
  var minXPos = this.constants_.NOTCH_OFFSET_LEFT +
      this.constants_.NOTCH_WIDTH;
  for (var i = 0, row; (row = this.rows[i]); i++) {
    if (Blockly.blockRendering.Types.isInputRow(row)) {
      var xCursor = row.xPos;
      var prevSpacer = null;
      for (var j = 0, elem; (elem = row.elements[j]); j++) {
        if (Blockly.blockRendering.Types.isSpacer(elem)) {
          prevSpacer = elem;
        }
        if (prevSpacer && (Blockly.blockRendering.Types.isField(elem) ||
            Blockly.blockRendering.Types.isInput(elem))) {
          if (xCursor < minXPos &&
              !(Blockly.blockRendering.Types.isField(elem) &&
              elem.field instanceof Blockly.FieldLabel)) {
            var difference = minXPos - xCursor;
            prevSpacer.width += difference;
          }
        }
        xCursor += elem.width;
      }
      return;
    }
  }
};

/**
 * Finalize the output connection info.  In particular, set the height of the
 * output connection to match that of the block.  For the right side, add a
 * right connection shape element and have it match the dimensions of the
 * output connection.
 * @protected
 */
Blockly.zelos.RenderInfo.prototype.finalizeOutputConnection_ = function() {
  // Dynamic output connections depend on the height of the block.
  if (!this.outputConnection || !this.outputConnection.isDynamicShape) {
    return;
  }
  var yCursor = 0;
  // Determine the block height.
  for (var i = 0, row; (row = this.rows[i]); i++) {
    row.yPos = yCursor;
    yCursor += row.height;
  }
  this.height = yCursor;

  // Adjust the height of the output connection.
  var connectionHeight = this.outputConnection.shape.height(yCursor);
  var connectionWidth = this.outputConnection.shape.width(yCursor);

  this.outputConnection.height = connectionHeight;
  this.outputConnection.width = connectionWidth;
  this.outputConnection.startX = connectionWidth;

  // Adjust right side measurable.
  this.rightSide.height = connectionHeight;
  this.rightSide.width = connectionWidth;
  this.rightSide.centerline = connectionHeight / 2;
  this.rightSide.xPos = this.width + connectionWidth;

  this.startX = connectionWidth;
  this.width += connectionWidth * 2;
  this.widthWithChildren += connectionWidth * 2;
};

/**
 * Finalize horizontal alignment of elements on the block.  In particular,
 * reduce the implicit spacing created by the left and right output connection
 * shapes by adding setting negative spacing onto the leftmost and rightmost
 * spacers.
 * @protected
 */
Blockly.zelos.RenderInfo.prototype.finalizeHorizontalAlignment_ = function() {
  if (!this.outputConnection) {
    return;
  }
  var totalNegativeSpacing = 0;
  for (var i = 0, row; (row = this.rows[i]); i++) {
    if (!Blockly.blockRendering.Types.isInputRow(row)) {
      continue;
    }
    var firstElem = row.elements[1];
    var lastElem = row.elements[row.elements.length - 2];
    var leftNegPadding = this.getNegativeSpacing_(firstElem);
    var rightNegPadding = this.getNegativeSpacing_(lastElem);
    totalNegativeSpacing = leftNegPadding + rightNegPadding;
    var minBlockWidth = this.constants_.MIN_BLOCK_WIDTH +
        this.outputConnection.width * 2;
    if (this.width - totalNegativeSpacing < minBlockWidth) {
      // Maintain a minimum block width, split negative spacing between left
      // and right edge.
      totalNegativeSpacing = this.width - minBlockWidth;
      leftNegPadding = totalNegativeSpacing / 2;
      rightNegPadding = totalNegativeSpacing / 2;
    }
    // Add a negative spacer on the start and end of the block.
    row.elements.unshift(new Blockly.blockRendering.InRowSpacer(this.constants_,
        -leftNegPadding));
    row.elements.push(new Blockly.blockRendering.InRowSpacer(this.constants_,
        -rightNegPadding));
  }
  if (totalNegativeSpacing) {
    this.width -= totalNegativeSpacing;
    this.widthWithChildren -= totalNegativeSpacing;
    this.rightSide.xPos -= totalNegativeSpacing;
    for (var i = 0, row; (row = this.rows[i]); i++) {
      if (Blockly.blockRendering.Types.isTopRow(row) ||
          Blockly.blockRendering.Types.isBottomRow(row)) {
        row.elements[1].width -= totalNegativeSpacing;
      }
      row.width -= totalNegativeSpacing;
      row.widthWithConnectedBlocks -= totalNegativeSpacing;
    }
  }
};

/**
 * Calculate the spacing to reduce the left and right edges by based on the
 * outer and inner connection shape.
 * @param {Blockly.blockRendering.Measurable} elem The first or last element on
 *     a block.
 * @return {number} The amount of spacing to reduce the first or last spacer.
 * @protected
 */
Blockly.zelos.RenderInfo.prototype.getNegativeSpacing_ = function(elem) {
  if (!elem) {
    return 0;
  }
  var connectionWidth = this.outputConnection.width;
  var outerShape = this.outputConnection.shape.type;
  var constants =
    /** @type {!Blockly.zelos.ConstantProvider} */ (this.constants_);
  if (this.isMultiRow && this.inputRowNum_ > 1) {
    switch (outerShape) {
      case constants.SHAPES.ROUND:
        // Special case for multi-row round reporter blocks.
        var radius = this.height / 2;
        var topPadding = this.constants_.SMALL_PADDING;
        var roundPadding = radius *
          (1 - Math.sin(Math.acos((radius - topPadding) / radius)));
        return connectionWidth - roundPadding;
      default:
        return 0;
    }
  }
  if (Blockly.blockRendering.Types.isInlineInput(elem)) {
    var innerShape = elem.connectedBlock ?
        elem.connectedBlock.pathObject.outputShapeType :
        elem.shape.type;
    // Special case for hexagonal output.
    if (outerShape == constants.SHAPES.HEXAGONAL &&
        outerShape != innerShape) {
      return 0;
    }
    return connectionWidth -
        this.constants_.SHAPE_IN_SHAPE_PADDING[outerShape][innerShape];
  } else if (Blockly.blockRendering.Types.isField(elem)) {
    // Special case for text inputs.
    if (outerShape == constants.SHAPES.ROUND &&
        elem.field instanceof Blockly.FieldTextInput) {
      return connectionWidth - (2.75 * constants.GRID_UNIT);
    }
    return connectionWidth -
        this.constants_.SHAPE_IN_SHAPE_PADDING[outerShape][0];
  } else if (Blockly.blockRendering.Types.isIcon(elem)) {
    return this.constants_.SMALL_PADDING;
  }
  return 0;
};

/**
 * Finalize vertical alignment of rows on a block.  In particular, reduce the
 * implicit spacing when a non-shadow block is connected to any of an input
 * row's inline inputs.
 * @protected
 */
Blockly.zelos.RenderInfo.prototype.finalizeVerticalAlignment_ = function() {
  if (this.outputConnection) {
    return;
  }
  for (var i = 2; i < this.rows.length - 1; i += 2) {
    var prevSpacer = this.rows[i - 1];
    var row = this.rows[i];
    var nextSpacer = this.rows[i + 1];
    
    if (Blockly.blockRendering.Types.isInputRow(row)) {
      // Determine if the input row has non-shadow connected blocks.
      var hasNonShadowConnectedBlocks = false;
      var MIN_VERTICAL_TIGHTNESTING_HEIGHT = 40;
      for (var j = 0, elem; (elem = row.elements[j]); j++) {
        if (Blockly.blockRendering.Types.isInlineInput(elem) &&
            elem.connectedBlock && !elem.connectedBlock.isShadow() &&
            elem.connectedBlock.getHeightWidth().height >=
                MIN_VERTICAL_TIGHTNESTING_HEIGHT) {
          hasNonShadowConnectedBlocks = true;
          break;
        }
      }
      if (hasNonShadowConnectedBlocks) {
        // Reduce the previous and next spacer's height.
        prevSpacer.height -= this.constants_.GRID_UNIT;
        nextSpacer.height -= this.constants_.GRID_UNIT;
      }
    }
  }
};

/**
 * @override
 */
Blockly.zelos.RenderInfo.prototype.finalize_ = function() {
  this.finalizeOutputConnection_();
  this.finalizeHorizontalAlignment_();
  this.finalizeVerticalAlignment_();
  Blockly.zelos.RenderInfo.superClass_.finalize_.call(this);
};
