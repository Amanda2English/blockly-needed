/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

const chai = require('chai');
const {
  testSetup,
  testFileLocations,
  getAllBlocks,
  getBlockElementById,
  contextMenuSelect,
} = require('./test_setup');
const {Key} = require('webdriverio');

const firstBlockId = 'root_block';
const startBlocks = {
  blocks: {
    languageVersion: 0,
    blocks: [
      {
        type: 'text_print',
        id: firstBlockId,
        x: 63,
        y: 88,
        inputs: {
          TEXT: {
            shadow: {
              type: 'text',
              id: 'text_shadow',
              fields: {
                TEXT: '1',
              },
            },
          },
        },
        next: {
          block: {
            type: 'text_print',
            id: 'second_block',
            inputs: {
              TEXT: {
                shadow: {
                  type: 'text',
                  id: 'second_text_shadow',
                  fields: {
                    TEXT: '2',
                  },
                },
                block: {
                  type: 'text_trim',
                  id: 'trim_block',
                  fields: {
                    MODE: 'BOTH',
                  },
                  inputs: {
                    TEXT: {
                      shadow: {
                        type: 'text',
                        id: 'text_to_trim_shadow',
                        fields: {
                          TEXT: 'abc',
                        },
                      },
                      block: {
                        type: 'text',
                        id: 'text_to_trim_real',
                        fields: {
                          TEXT: 'hello',
                        },
                      },
                    },
                  },
                },
              },
            },
            next: {
              block: {
                type: 'text_print',
                id: 'third_block',
                inputs: {
                  TEXT: {
                    shadow: {
                      type: 'text',
                      id: 'third_text_shadow',
                      fields: {
                        TEXT: '3',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    ],
  },
};
const pauseLength = 20;

suite('Delete blocks', function (done) {
  // Setting timeout to unlimited as the webdriver takes a longer time to run than most mocha test
  this.timeout(0);

  // Setup Selenium for all of the tests
  suiteSetup(async function () {
    this.browser = await testSetup(testFileLocations.PLAYGROUND);
  });

  // Clear the workspace and load the start blocks before each test
  setup(async function () {
    await this.browser.execute(() => {
      // Clear the workspace manually so we can ensure it's clear before moving on to the next test.
      Blockly.getMainWorkspace().clear();
    });
    // Wait for the workspace to be cleared of blocks (no blocks found on main workspace)
    await this.browser
      .$(
        '.blocklySvg .blocklyWorkspace > .blocklyBlockCanvas > .blocklyDraggable',
      )
      .waitForExist({timeout: 2000, reverse: true});

    // Load the start blocks
    await this.browser.execute((blocks) => {
      Blockly.serialization.workspaces.load(blocks, Blockly.getMainWorkspace());
    }, startBlocks);
    // Wait for there to be a block on the main workspace before continuing
    (await getBlockElementById(this.browser, firstBlockId)).waitForExist({
      timeout: 2000,
    });
  });

  test('Delete block using backspace key', async function () {
    const before = (await getAllBlocks(this.browser)).length;
    // Get first print block, click to select it, and delete it using backspace key.
    const block = (await getBlockElementById(this.browser, firstBlockId)).$(
      '.blocklyPath',
    );
    await block.click();
    await this.browser.keys([Key.Backspace]);
    const after = (await getAllBlocks(this.browser)).length;
    chai.assert.equal(
      before - 2,
      after,
      'Expected there to be two fewer blocks after deletion of block and shadow',
    );
  });

  test('Delete block using delete key', async function () {
    const before = (await getAllBlocks(this.browser)).length;
    // Get first print block, click to select it, and delete it using delete key.
    const block = (await getBlockElementById(this.browser, firstBlockId)).$(
      '.blocklyPath',
    );
    await block.click();
    await this.browser.keys([Key.Delete]);
    const after = (await getAllBlocks(this.browser)).length;
    chai.assert.equal(
      before - 2,
      after,
      'Expected there to be two fewer blocks after deletion of block and shadow',
    );
  });

  test('Delete block using context menu', async function () {
    const before = (await getAllBlocks(this.browser)).length;
    // Get first print block, click to select it, and delete it using context menu.
    const block = (await getBlockElementById(this.browser, firstBlockId)).$(
      '.blocklyPath',
    );
    await contextMenuSelect(this.browser, block, 'Delete 2 Blocks');
    const after = (await getAllBlocks(this.browser)).length;
    chai.assert.equal(
      before - 2,
      after,
      'Expected there to be two fewer blocks after deletion of block and shadow',
    );
  });

  test('Undo block deletion', async function () {
    const before = (await getAllBlocks(this.browser)).length;
    // Get first print block, click to select it, and delete it using backspace key.
    const block = (await getBlockElementById(this.browser, firstBlockId)).$(
      '.blocklyPath',
    );
    await block.click();
    await this.browser.keys([Key.Backspace]);
    await this.browser.pause(pauseLength);
    // Undo
    await this.browser.keys([Key.Ctrl, 'Z']);
    const after = (await getAllBlocks(this.browser)).length;
    chai.assert.equal(
      before,
      after,
      'Expected there to be the original number of blocks after undoing a delete',
    );
  });

  test('Redo block deletion', async function () {
    const before = (await getAllBlocks(this.browser)).length;
    // Get first print block, click to select it, and delete it using backspace key.
    const block = (await getBlockElementById(this.browser, firstBlockId)).$(
      '.blocklyPath',
    );
    await block.click();
    await this.browser.keys([Key.Backspace]);
    await this.browser.pause(pauseLength);
    // Undo
    await this.browser.keys([Key.Ctrl, 'Z']);
    await this.browser.pause(pauseLength);
    // Redo
    await this.browser.keys([Key.Ctrl, Key.Shift, 'Z']);
    await this.browser.pause(pauseLength);
    const after = (await getAllBlocks(this.browser)).length;
    chai.assert.equal(
      before - 2,
      after,
      'Expected there to be fewer blocks after undoing and redoing a delete',
    );
  });
});
