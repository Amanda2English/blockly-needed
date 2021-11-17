/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Dart for dynamic variable blocks.
 */
'use strict';

goog.module('Blockly.Dart.variablesDynamic');

goog.require('Blockly.Dart');
goog.require('Blockly.Dart.variables');


// Dart is dynamically typed.
Blockly.Dart['variables_get_dynamic'] = Blockly.Dart['variables_get'];
Blockly.Dart['variables_set_dynamic'] = Blockly.Dart['variables_set'];
