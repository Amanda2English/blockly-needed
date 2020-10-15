/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Events fired as a result of UI actions in Blockly's editor.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Events.OldUi');

goog.require('Blockly.Events');
goog.require('Blockly.Events.Ui');
goog.require('Blockly.registry');
goog.require('Blockly.utils.object');


/**
 * Class for a UI event.
 * UI events are events that don't need to be sent over the wire for multi-user
 * editing to work (e.g. scrolling the workspace, zooming, opening toolbox
 * categories).
 * UI events do not undo or redo.
 * @param {?Blockly.Block=} opt_block The affected block.  Null for UI events
 *     that do not have an associated block.  Undefined for a blank event.
 * @param {string=} opt_element One of 'selected', 'comment', 'mutatorOpen',
 *     etc.
 * @param {*=} opt_oldValue Previous value of element.
 * @param {*=} opt_newValue New value of element.
 * @extends {Blockly.Events.Ui}
 * @constructor
 */
Blockly.Events.OldUi = function(opt_block, opt_element, opt_oldValue,
    opt_newValue) {
  var workspaceId = opt_block ? opt_block.workspace.id : undefined;
  Blockly.Events.OldUi.superClass_.constructor.call(this, workspaceId);

  this.blockId = opt_block ? opt_block.id : null;
  this.element = typeof opt_element == 'undefined' ? '' : opt_element;
  this.oldValue = typeof opt_oldValue == 'undefined' ? '' : opt_oldValue;
  this.newValue = typeof opt_newValue == 'undefined' ? '' : opt_newValue;
};
Blockly.utils.object.inherits(Blockly.Events.OldUi, Blockly.Events.Ui);

/**
 * Whether or not the event is a UI event.
 * @type {boolean}
 */
Blockly.Events.OldUi.prototype.IS_UI_EVENT = true;

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.OldUi.prototype.type = Blockly.Events.UI;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.OldUi.prototype.toJson = function() {
  var json = Blockly.Events.OldUi.superClass_.toJson.call(this);
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
Blockly.Events.OldUi.prototype.fromJson = function(json) {
  Blockly.Events.OldUi.superClass_.fromJson.call(this, json);
  this.element = json['element'];
  this.newValue = json['newValue'];
  this.blockId = json['blockId'];
};

Blockly.registry.register(Blockly.registry.Type.EVENT, Blockly.Events.UI,
    Blockly.Events.OldUi);
