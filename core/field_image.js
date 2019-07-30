/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
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
 * @fileoverview Image field.  Used for pictures, icons, etc.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.FieldImage');

goog.require('Blockly.Field');
goog.require('Blockly.Tooltip');
goog.require('Blockly.utils');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.Size');


/**
 * Class for an image on a block.
 * @param {string} src The URL of the image. Defaults to an empty string.
 * @param {!(string|number)} width Width of the image.
 * @param {!(string|number)} height Height of the image.
 * @param {string=} opt_alt Optional alt text for when block is collapsed.
 * @param {Function=} opt_onClick Optional function to be called when the image
 *     is clicked.  If opt_onClick is defined, opt_alt must also be defined.
 * @param {boolean=} opt_flipRtl Whether to flip the icon in RTL.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldImage = function(src, width, height,
    opt_alt, opt_onClick, opt_flipRtl) {
  this.sourceBlock_ = null;

  if (!src) {
    throw Error('Src value of an image field is required');
  }

  if (isNaN(height) || isNaN(width)) {
    throw Error('Height and width values of an image field must cast to' +
      ' numbers.');
  }

  // Ensure height and width are numbers.  Strings are bad at math.
  this.height_ = Number(height);
  this.width_ = Number(width);
  if (this.height_ <= 0 || this.width_ <= 0) {
    throw Error('Height and width values of an image field must be greater' +
      ' than 0.');
  }
  this.size_ = new Blockly.utils.Size(this.width_,
      this.height_ + 2 * Blockly.BlockSvg.INLINE_PADDING_Y);

  this.flipRtl_ = opt_flipRtl;
  this.text_ = opt_alt || '';
  this.setValue(src || '');

  if (typeof opt_onClick == 'function') {
    this.clickHandler_ = opt_onClick;
  }
};
goog.inherits(Blockly.FieldImage, Blockly.Field);

/**
 * Construct a FieldImage from a JSON arg object,
 * dereferencing any string table references.
 * @param {!Object} options A JSON object with options (src, width, height,
 *    alt, and flipRtl).
 * @return {!Blockly.FieldImage} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldImage.fromJson = function(options) {
  var src = Blockly.utils.replaceMessageReferences(options['src']);
  var width = Number(Blockly.utils.replaceMessageReferences(options['width']));
  var height =
      Number(Blockly.utils.replaceMessageReferences(options['height']));
  var alt = Blockly.utils.replaceMessageReferences(options['alt']);
  var flipRtl = !!options['flipRtl'];
  return new Blockly.FieldImage(src, width, height, alt, null, flipRtl);
};

/**
 * Editable fields usually show some sort of UI indicating they are
 * editable. This field should not.
 * @type {boolean}
 * @const
 */
Blockly.FieldImage.prototype.EDITABLE = false;

/**
 * Used to tell if the field needs to be rendered the next time the block is
 * rendered. Image fields are statically sized, and only need to be
 * rendered at initialization.
 * @type {boolean}
 * @private
 */
Blockly.FieldImage.prototype.isDirty_ = false;

/**
 * Create the block UI for this image.
 * @package
 */
Blockly.FieldImage.prototype.initView = function() {
  this.imageElement_ = Blockly.utils.dom.createSvgElement(
      'image',
      {
        'height': this.height_ + 'px',
        'width': this.width_ + 'px',
        'alt': this.text_
      },
      this.fieldGroup_);
  this.imageElement_.setAttributeNS(Blockly.utils.dom.XLINK_NS,
      'xlink:href', this.value_);
};

/**
 * Ensure that the input value (the source URL) is a string.
 * @param {string=} newValue The input value
 * @return {?string} A string, or null if invalid.
 * @protected
 */
Blockly.FieldImage.prototype.doClassValidation_ = function(newValue) {
  if (typeof newValue != 'string') {
    return null;
  }
  return newValue;
};

/**
 * Update the value of this image field, and update the displayed image.
 * @param {string} newValue The new image src.
 * @protected
 */
Blockly.FieldImage.prototype.doValueUpdate_ = function(newValue) {
  this.value_ = newValue;
  if (this.imageElement_) {
    this.imageElement_.setAttributeNS(Blockly.utils.dom.XLINK_NS,
        'xlink:href', this.value_ || '');
  }
};

/**
 * Get whether to flip this image in RTL
 * @return {boolean} True if we should flip in RTL.
 */
Blockly.FieldImage.prototype.getFlipRtl = function() {
  return this.flipRtl_;
};

/**
 * Set the alt text of this image.
 * @param {?string} alt New alt text.
 * @override
 * @deprecated 2019 setText has been deprecated for all fields. Instead use
 *    setAlt to set the alt text of the field.
 */
Blockly.FieldImage.prototype.setText = function(alt) {
  this.setAlt(alt);
};

/**
 * Set the alt text of this image.
 * @param {?string} alt New alt text.
 * @public
 */
Blockly.FieldImage.prototype.setAlt = function(alt) {
  if (alt === null) {
    // No change if null.
    return;
  }
  this.text_ = alt;
  if (this.imageElement_) {
    this.imageElement_.setAttribute('alt', alt || '');
  }
};

/**
 * If field click is called, and click handler defined,
 * call the handler.
 */
Blockly.FieldImage.prototype.showEditor_ = function() {
  if (this.clickHandler_) {
    this.clickHandler_(this);
  }
};

/**
 * Set the function that is called when this image  is clicked.
 * @param {Function} func The function that is called when the image
 *    is clicked. It will receive the image field as a parameter.
 * @public
 */
Blockly.FieldImage.prototype.setOnClickHandler = function(func) {
  this.clickHandler_ = func;
};
/*
 * Get the size of the visible field, as used in new rendering.
 * @return {!Blockly.utils.Size} The size of the visible field.
 * @package
 */
Blockly.FieldImage.prototype.getCorrectedSize = function() {
  // getSize also renders and updates the size if needed.  Rather than duplicate
  // the logic to figure out whether to rerender, just call getSize.
  this.getSize();
  // Old rendering adds an extra pixel under the image.  We include this in the
  // height of the image in new rendering, rather than having the spacer below
  // know that there was an image in the previous row.
  // TODO (#2562): Remove getCorrectedSize.
  return new Blockly.utils.Size(this.size_.width, this.height_ + 1);
};

Blockly.Field.register('field_image', Blockly.FieldImage);
