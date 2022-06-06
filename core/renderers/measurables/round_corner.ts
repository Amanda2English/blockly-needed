/**
 * @fileoverview Objects representing a round corner in a row of a rendered
 * block.
 */

/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Objects representing a round corner in a row of a rendered
 * block.
 * @class
 */

/* eslint-disable-next-line no-unused-vars */
import { ConstantProvider } from '../common/constants';

import { Measurable } from './base';
import { Types } from './types';


/**
 * An object containing information about the space a rounded corner takes up
 * during rendering.
 * @struct
 * @alias Blockly.blockRendering.RoundCorner
 */
export class RoundCorner extends Measurable {
  /**
   * @param constants The rendering constants provider.
   * @param opt_position The position of this corner.
   */
  constructor(constants: ConstantProvider, opt_position?: string) {
    super(constants);
    this.type =
      (!opt_position || opt_position === 'left' ? Types.LEFT_ROUND_CORNER :
        Types.RIGHT_ROUND_CORNER) |
      Types.CORNER;
    this.width = this.constants.CORNER_RADIUS;
    // The rounded corner extends into the next row by 4 so we only take the
    // height that is aligned with this row.
    this.height = this.constants.CORNER_RADIUS / 2;
  }
}
