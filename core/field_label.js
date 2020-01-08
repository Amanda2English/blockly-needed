/**
 * @license
 * Copyright 2012 Google LLC
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
 * @fileoverview Non-editable, non-serializable text field.  Used for titles,
 *    labels, etc.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.FieldLabel');

goog.require('Blockly.Field');
goog.require('Blockly.fieldRegistry');
goog.require('Blockly.utils');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.object');
goog.require('Blockly.utils.Size');


/**
 * Class for a non-editable, non-serializable text field.
 * @param {string=} opt_value The initial value of the field. Should cast to a
 *    string. Defaults to an empty string if null or undefined.
 * @param {string=} opt_class Optional CSS class for the field's text.
 * @param {Object=} opt_config A map of options used to configure the field.
 *    See the [field creation documentation]{@link https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/label#creation}
 *    for a list of properties this parameter supports.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldLabel = function(opt_value, opt_class, opt_config) {
  /**
   * The html class name to use for this field.
   * @type {?string}
   * @private
   */
  this.class_ = null;

  if (opt_value == null) {
    opt_value = '';
  }
  Blockly.FieldLabel.superClass_.constructor.call(
      this, opt_value, null, opt_config);

  if (!opt_config) {  // If the config was not passed use old configuration.
    this.class_ = opt_class || null;
  }

  /**
   * The size of the area rendered by the field.
   * @type {Blockly.utils.Size}
   * @protected
   * @override
   */
  this.size_ = new Blockly.utils.Size(0, Blockly.Field.TEXT_DEFAULT_HEIGHT);

  //TODOQ3: This was in our old logic
  // // SHAPE: Changed hardcoded size to represent our font's actual size better.
  // this.size_ = new goog.math.Size(0, 15);
};
Blockly.utils.object.inherits(Blockly.FieldLabel, Blockly.Field);

/**
 * Construct a FieldLabel from a JSON arg object,
 * dereferencing any string table references.
 * @param {!Object} options A JSON object with options (text, and class).
 * @return {!Blockly.FieldLabel} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldLabel.fromJson = function(options) {
  var text = Blockly.utils.replaceMessageReferences(options['text']);
  return new Blockly.FieldLabel(text, undefined, options);
};

/**
 * Editable fields usually show some sort of UI indicating they are
 * editable. This field should not.
 * @type {boolean}
 */
Blockly.FieldLabel.prototype.EDITABLE = false;

/**
 * @override
 */
Blockly.FieldLabel.prototype.configure_ = function(config) {
  Blockly.FieldLabel.superClass_.configure_.call(this, config);
  this.class_ = config['class'];
// //TODOQ3: This was in our old logic
// Blockly.FieldLabel.prototype.init = function() {
//   if (this.textElement_) {
//     // Text has already been initialized once.
//     return;
//   }
//   // Build the DOM.
//   this.textElement_ = Blockly.utils.dom.createSvgElement('text',
//       {'class': 'blocklyText', 'y': this.size_.height - 2}, null);
//   if (this.class_) {
//     Blockly.utils.dom.addClass(this.textElement_, this.class_);
//   }
//   if (!this.visible_) {
//     this.textElement_.style.display = 'none';
//   }
//   this.sourceBlock_.getSvgRoot().appendChild(this.textElement_);

//   if (this.tooltip_) {
//     this.textElement_.tooltip = this.tooltip_;
//   } else {
//     // Configure the field to be transparent with respect to tooltips.
//     this.textElement_.tooltip = this.sourceBlock_;
//   }
//   Blockly.Tooltip.bindMouseEvents(this.textElement_);
//   // Force a render.
//   this.render_();
};

/**
 * Create block UI for this label.
 * @package
 */
Blockly.FieldLabel.prototype.initView = function() {
  this.createTextElement_();
  // The y attribute of an SVG text element is the baseline.
  this.textElement_.setAttribute('y', Blockly.Field.TEXT_DEFAULT_HEIGHT_POS);
  if (this.class_) {
    Blockly.utils.dom.addClass(this.textElement_, this.class_);
  }
};

/**
 * Ensure that the input value casts to a valid string.
 * @param {*=} opt_newValue The input value.
 * @return {?string} A valid string, or null if invalid.
 * @protected
 */
Blockly.FieldLabel.prototype.doClassValidation_ = function(opt_newValue) {
  if (opt_newValue === null || opt_newValue === undefined) {
    return null;
  }
  return String(opt_newValue);
};

/**
 * Set the css class applied to the field's textElement_.
 * @param {?string} cssClass The new css class name, or null to remove.
 */
Blockly.FieldLabel.prototype.setClass = function(cssClass) {
  if (this.textElement_) {
    // This check isn't necessary, but it's faster than letting removeClass
    // figure it out.
    if (this.class_) {
      Blockly.utils.dom.removeClass(this.textElement_, this.class_);
    }
    if (cssClass) {
      Blockly.utils.dom.addClass(this.textElement_, cssClass);
    }
  }
  this.class_ = cssClass;
};

Blockly.fieldRegistry.register('field_label', Blockly.FieldLabel);
