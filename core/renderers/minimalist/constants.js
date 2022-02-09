/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview An object that provides constants for rendering blocks in the
 * minimalist renderer.
 */
'use strict';

/**
 * An object that provides constants for rendering blocks in the
 * minimalist renderer.
 * @class
 */
goog.declareModuleId('Blockly.minimalist.ConstantProvider');

const {ConstantProvider: BaseConstantProvider} = goog.require('Blockly.blockRendering.ConstantProvider');


/**
 * An object that provides constants for rendering blocks in the sample.
 * @extends {BaseConstantProvider}
 */
class ConstantProvider extends BaseConstantProvider {
  /**
   * @package
   * @alias Blockly.minimalist.ConstantProvider
   */
  constructor() {
    super();
  }
}

export {ConstantProvider};
