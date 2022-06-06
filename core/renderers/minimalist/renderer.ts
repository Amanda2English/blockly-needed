/** @fileoverview Minimalist renderer. */

/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Minimalist renderer.
 * @class
 */

/* eslint-disable-next-line no-unused-vars */
import { BlockSvg } from '../../block_svg';

import * as blockRendering from '../common/block_rendering';
/* eslint-disable-next-line no-unused-vars */
import { RenderInfo as BaseRenderInfo } from '../common/info';
import { Renderer as BaseRenderer } from '../common/renderer';

import { ConstantProvider } from './constants';
import { Drawer } from './drawer';
import { RenderInfo } from './info';


/**
 * The minimalist renderer.
 * @alias Blockly.minimalist.Renderer
 */
export class Renderer extends BaseRenderer {
  /** @param name The renderer name. */
  constructor(name: string) {
    super(name);
  }

  /**
   * Create a new instance of the renderer's constant provider.
   * @return The constant provider.
   */
  protected override makeConstants_(): ConstantProvider {
    return new ConstantProvider();
  }

  /**
   * Create a new instance of the renderer's render info object.
   * @param block The block to measure.
   * @return The render info object.
   */
  protected override makeRenderInfo_(block: BlockSvg): RenderInfo {
    return new RenderInfo(this, block);
  }

  /**
   * Create a new instance of the renderer's drawer.
   * @param block The block to render.
   * @param info An object containing all information needed to render this
   *     block.
   * @return The drawer.
   */
  protected override makeDrawer_(block: BlockSvg, info: BaseRenderInfo):
    Drawer {
    return new Drawer(block, (info as RenderInfo));
  }
}

blockRendering.register('minimalist', Renderer);
