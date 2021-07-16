/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for a bounded element.
 * @author samelh@google.com (Sam El-Husseini)
 */

'use strict';

goog.module('Blockly.IBoundedElement');
goog.module.declareLegacyNamespace();

const Rect = goog.requireType('Blockly.utils.Rect');


/**
 * A bounded element interface.
 * @interface
 */
const IBoundedElement = function() {};

/**
 * Returns the coordinates of a bounded element describing the dimensions of the
 * element.
 * Coordinate system: workspace coordinates.
 * @return {!Rect} Object with coordinates of the bounded element.
 */
IBoundedElement.prototype.getBoundingRectangle;

/**
 * Move the element by a relative offset.
 * @param {number} dx Horizontal offset in workspace units.
 * @param {number} dy Vertical offset in workspace units.
 */
IBoundedElement.prototype.moveBy;

exports = IBoundedElement;
