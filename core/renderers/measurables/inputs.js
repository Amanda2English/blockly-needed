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
 * @fileoverview Objects representing inputs with connections on a rendered
 * block.
 * @author fenichel@google.com (Rachel Fenichel)
 */

goog.provide('Blockly.blockRendering.DummyInput');
goog.provide('Blockly.blockRendering.ExternalValueInput');
goog.provide('Blockly.blockRendering.InlineInput');
goog.provide('Blockly.blockRendering.InputConnection');
goog.provide('Blockly.blockRendering.StatementInput');

goog.require('Blockly.blockRendering.Connection');
goog.require('Blockly.blockRendering.Measurable');
goog.require('Blockly.blockRendering.Types');
goog.require('Blockly.utils.object');


/**
 * The base class to represent an input that takes up space on a block
 * during rendering
 * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
 *   constants provider.
 * @param {!Blockly.Input} input The input to measure and store information for.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Connection}
 */
Blockly.blockRendering.InputConnection = function(constants, input) {
  Blockly.blockRendering.InputConnection.superClass_.constructor.call(this,
      constants, input.connection);

  this.type |= Blockly.blockRendering.Types.INPUT;
  this.input = input;
  this.align = input.align;
  this.connectedBlock = input.connection && input.connection.targetBlock() ?
      input.connection.targetBlock() : null;

  if (this.connectedBlock) {
    var bBox = this.connectedBlock.getHeightWidth();
    this.connectedBlockWidth = bBox.width;
    this.connectedBlockHeight = bBox.height;
  } else {
    this.connectedBlockWidth = 0;
    this.connectedBlockHeight = 0;
  }

  // TODO (#3186): change references to connectionModel, since that's on
  // Connection.
  this.connection = input.connection;
  this.connectionOffsetX = 0;
  this.connectionOffsetY = 0;
};
Blockly.utils.object.inherits(Blockly.blockRendering.InputConnection,
    Blockly.blockRendering.Connection);

/**
 * An object containing information about the space an inline input takes up
 * during rendering
 * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
 *   constants provider.
 * @param {!Blockly.Input} input The inline input to measure and store
 *     information for.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.InputConnection}
 */
Blockly.blockRendering.InlineInput = function(constants, input) {
  Blockly.blockRendering.InlineInput.superClass_.constructor.call(this,
      constants, input);
  this.type |= Blockly.blockRendering.Types.INLINE_INPUT;

  this.setShapeDimensions(
    !this.isDynamicShape ? this.shape.height : 0,
    !this.isDynamicShape ? this.shape.width : 0);

  this.connectionOffsetY = this.constants_.TAB_OFFSET_FROM_TOP;
};
Blockly.utils.object.inherits(Blockly.blockRendering.InlineInput,
    Blockly.blockRendering.InputConnection);


/**
 * Sets properties that depend on the connection shape dimensions.
 * @param {number} height Height of the connection shape.
 * @param {number} width Width of the connection shape.
 */
Blockly.blockRendering.InlineInput.prototype.setShapeDimensions = function(
    height, width) {
  if (!this.connectedBlock) {
    this.height = this.constants_.EMPTY_INLINE_INPUT_HEIGHT;
    this.width = width +
        this.constants_.EMPTY_INLINE_INPUT_PADDING;
  } else {
    // We allow the dark path to show on the parent block so that the child
    // block looks embossed.  This takes up an extra pixel in both x and y.
    this.width = this.connectedBlockWidth;
    this.height = this.connectedBlockHeight;
  }
  this.connectionHeight = height;
  this.connectionWidth = width;
};

/**
 * An object containing information about the space a statement input takes up
 * during rendering
 * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
 *   constants provider.
 * @param {!Blockly.Input} input The statement input to measure and store
 *     information for.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.InputConnection}
 */
Blockly.blockRendering.StatementInput = function(constants, input) {
  Blockly.blockRendering.StatementInput.superClass_.constructor.call(this,
      constants, input);
  this.type |= Blockly.blockRendering.Types.STATEMENT_INPUT;

  if (!this.connectedBlock) {
    this.height = this.constants_.EMPTY_STATEMENT_INPUT_HEIGHT;
  } else {
    // We allow the dark path to show on the parent block so that the child
    // block looks embossed.  This takes up an extra pixel in both x and y.
    this.height =
        this.connectedBlockHeight + this.constants_.STATEMENT_BOTTOM_SPACER;
  }
  this.width = this.constants_.NOTCH_OFFSET_LEFT + this.shape.width;
};
Blockly.utils.object.inherits(Blockly.blockRendering.StatementInput,
    Blockly.blockRendering.InputConnection);

/**
 * An object containing information about the space an external value input
 * takes up during rendering
 * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
 *   constants provider.
 * @param {!Blockly.Input} input The external value input to measure and store
 *     information for.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.InputConnection}
 */
Blockly.blockRendering.ExternalValueInput = function(constants, input) {
  Blockly.blockRendering.ExternalValueInput.superClass_.constructor.call(this,
      constants, input);
  this.type |= Blockly.blockRendering.Types.EXTERNAL_VALUE_INPUT;

  this.setShapeDimensions(
    !this.isDynamicShape ? this.shape.height : 0,
    !this.isDynamicShape ? this.shape.width : 0);

  this.connectionOffsetY = this.constants_.TAB_OFFSET_FROM_TOP;
};
Blockly.utils.object.inherits(Blockly.blockRendering.ExternalValueInput,
    Blockly.blockRendering.InputConnection);


/**
 * Sets properties that depend on the connection shape dimensions.
 * @param {number} height Height of the connection shape.
 * @param {number} width Width of the connection shape.
 */
Blockly.blockRendering.ExternalValueInput.prototype.setShapeDimensions = function(
    height, width) {
  if (!this.connectedBlock) {
    this.height = height;
  } else {
    this.height =
        this.connectedBlockHeight - this.constants_.TAB_OFFSET_FROM_TOP -
        this.constants_.MEDIUM_PADDING;
  }
  this.width = width +
      this.constants_.EXTERNAL_VALUE_INPUT_PADDING;

  this.connectionHeight = height;
  this.connectionWidth = width;
};

/**
 * An object containing information about the space a dummy input takes up
 * during rendering
 * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
 *     constants provider.
 * @param {!Blockly.Input} input The inline input to measure and store
 *     information for.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Measurable}
 */
Blockly.blockRendering.DummyInput = function(constants, input) {
  Blockly.blockRendering.DummyInput.superClass_.constructor.call(this,
      constants);
  this.type |= Blockly.blockRendering.Types.INPUT |
    Blockly.blockRendering.Types.DUMMY_INPUT;
  this.input = input;
  this.align = input.align;

  this.width = 0;
  this.height = this.constants_.DUMMY_INPUT_MIN_HEIGHT;
};
Blockly.utils.object.inherits(Blockly.blockRendering.DummyInput,
    Blockly.blockRendering.Measurable);
