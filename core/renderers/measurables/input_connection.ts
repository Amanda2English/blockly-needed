/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class representing inputs with connections on a rendered block.
 */


/**
 * Class representing inputs with connections on a rendered block.
 * @class
 */
goog.declareModuleId('Blockly.blockRendering.InputConnection');

/* eslint-disable-next-line no-unused-vars */
import {BlockSvg} from '../../block_svg.js';
/* eslint-disable-next-line no-unused-vars */
import {Input} from '../../input.js';
/* eslint-disable-next-line no-unused-vars */
import {RenderedConnection} from '../../rendered_connection.js';
/* eslint-disable-next-line no-unused-vars */
import {ConstantProvider} from '../common/constants.js';

import {Connection} from './connection.js';
import {Types} from './types.js';


/**
 * The base class to represent an input that takes up space on a block
 * during rendering
 * @alias Blockly.blockRendering.InputConnection
 */
export class InputConnection extends Connection {
  align: number;
  connectedBlock: BlockSvg|null;
  connectedBlockWidth: number;
  connectedBlockHeight: number;
  connectionOffsetX: number = 0;
  connectionOffsetY: number = 0;

  /**
   * @param constants The rendering constants provider.
   * @param input The input to measure and store information for.
   */
  constructor(constants: ConstantProvider, public input: Input) {
    super(constants, input.connection as RenderedConnection);

    this.type |= Types.INPUT;

    this.align = input.align;

    this.connectedBlock =
        (input.connection && input.connection.targetBlock() ?
             input.connection.targetBlock() as BlockSvg :
             null);

    if (this.connectedBlock) {
      const bBox = this.connectedBlock.getHeightWidth();
      this.connectedBlockWidth = bBox.width;
      this.connectedBlockHeight = bBox.height;
    } else {
      this.connectedBlockWidth = 0;
      this.connectedBlockHeight = 0;
    }
  }
}
