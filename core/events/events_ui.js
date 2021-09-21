/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview (Deprecated) Events fired as a result of UI actions in
 * Blockly's editor.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.module('Blockly.Events.Ui');

/* eslint-disable-next-line no-unused-vars */
const Block = goog.requireType('Blockly.Block');
const UiBase = goog.require('Blockly.Events.UiBase');
const helpers = goog.require('Blockly.Events.helpers');
const object = goog.require('Blockly.utils.object');
const registry = goog.require('Blockly.registry');


/**
 * Class for a UI event.
 * @param {?Block=} opt_block The affected block.  Null for UI events
 *     that do not have an associated block.  Undefined for a blank event.
 * @param {string=} opt_element One of 'selected', 'comment', 'mutatorOpen',
 *     etc.
 * @param {*=} opt_oldValue Previous value of element.
 * @param {*=} opt_newValue New value of element.
 * @extends {UiBase}
 * @deprecated December 2020. Instead use a more specific UI event.
 * @constructor
 */
const Ui = function(opt_block, opt_element, opt_oldValue, opt_newValue) {
  const workspaceId = opt_block ? opt_block.workspace.id : undefined;
  Ui.superClass_.constructor.call(this, workspaceId);

  this.blockId = opt_block ? opt_block.id : null;
  this.element = typeof opt_element == 'undefined' ? '' : opt_element;
  this.oldValue = typeof opt_oldValue == 'undefined' ? '' : opt_oldValue;
  this.newValue = typeof opt_newValue == 'undefined' ? '' : opt_newValue;
};
object.inherits(Ui, UiBase);

/**
 * Type of this event.
 * @type {string}
 */
Ui.prototype.type = helpers.UI;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Ui.prototype.toJson = function() {
  const json = Ui.superClass_.toJson.call(this);
  json['element'] = this.element;
  if (this.newValue !== undefined) {
    json['newValue'] = this.newValue;
  }
  if (this.blockId) {
    json['blockId'] = this.blockId;
  }
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Ui.prototype.fromJson = function(json) {
  Ui.superClass_.fromJson.call(this, json);
  this.element = json['element'];
  this.newValue = json['newValue'];
  this.blockId = json['blockId'];
};

registry.register(registry.Type.EVENT, helpers.UI, Ui);

exports = Ui;
