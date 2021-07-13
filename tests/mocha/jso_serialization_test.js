/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

suite.only('JSO', function() {
  setup(function() {
    sharedTestSetup.call(this);
    this.workspace = new Blockly.Workspace();

    defineStackBlock();
    defineRowBlock();
    defineStatementBlock();

    createGenUidStubWithReturns(new Array(10).fill().map((_, i) => 'id' + i));
  });

  teardown(function() {
    workspaceTeardown.call(this, this.workspace);
    sharedTestTeardown.call(this);
  });

  suite('Blocks', function() {
    suite('Save Single Block', function() {

      function assertProperty(obj, property, value) {
        chai.assert.equal(obj[property], value);
      }

      function assertNoProperty(obj, property) {
        assertProperty(obj, property, undefined);
      }

      test('Basic', function() {
        const block = this.workspace.newBlock('row_block');
        const jso = Blockly.serialization.blocks.save(block);
        assertProperty(jso, 'type', 'row_block');
        assertProperty(jso, 'id', 'id0');
      });

      suite('Attributes', function() {
        suite('Collapsed', function() {
          test('True', function() {
            const block = this.workspace.newBlock('row_block');
            block.setCollapsed(true);
            const jso = Blockly.serialization.blocks.save(block);
            assertProperty(jso, 'collapsed', true);
          });

          test('False', function() {
            const block = this.workspace.newBlock('row_block');
            block.setCollapsed(false);
            const jso = Blockly.serialization.blocks.save(block);
            assertNoProperty(jso, 'collapsed');
          });
        });

        suite('Disabled', function() {
          test('True', function() {
            const block = this.workspace.newBlock('row_block');
            block.setEnabled(false);
            const jso = Blockly.serialization.blocks.save(block);
            assertProperty(jso, 'disabled', true);
          });
  
          test('False', function() {
            const block = this.workspace.newBlock('row_block');
            block.setEnabled(true);
            const jso = Blockly.serialization.blocks.save(block);
            assertNoProperty(jso, 'disabled');
          });
        });

        suite('Deletable', function() {
          test('False', function() {
            const block = this.workspace.newBlock('row_block');
            block.setDeletable(false);
            const jso = Blockly.serialization.blocks.save(block);
            assertProperty(jso, 'deletable', false);
          });

          test('True', function() {
            const block = this.workspace.newBlock('row_block');
            block.setDeletable(true);
            const jso = Blockly.serialization.blocks.save(block);
            assertNoProperty(jso, 'deletable');
          });

          test('False and Shadow', function() {
            const block = this.workspace.newBlock('row_block');
            block.setDeletable(false);
            block.setShadow(true);
            const jso = Blockly.serialization.blocks.save(block);
            assertNoProperty(jso, 'deletable');
          });
        });

        suite('Movable', function() {
          test('False', function() {
            const block = this.workspace.newBlock('row_block');
            block.setMovable(false);
            const jso = Blockly.serialization.blocks.save(block);
            assertProperty(jso, 'movable', false);
          });

          test('True', function() {
            const block = this.workspace.newBlock('row_block');
            block.setMovable(true);
            const jso = Blockly.serialization.blocks.save(block);
            assertNoProperty(jso, 'movable');
          });

          test('False and Shadow', function() {
            const block = this.workspace.newBlock('row_block');
            block.setMovable(false);
            block.setShadow(true);
            const jso = Blockly.serialization.blocks.save(block);
            assertNoProperty(jso, 'movable');
          });
        });

        suite('Editable', function() {
          test('False', function() {
            const block = this.workspace.newBlock('row_block');
            block.setEditable(false);
            const jso = Blockly.serialization.blocks.save(block);
            assertProperty(jso, 'editable', false);
          });
  
          test('True', function() {
            const block = this.workspace.newBlock('row_block');
            block.setEditable(true);
            const jso = Blockly.serialization.blocks.save(block);
            assertNoProperty(jso, 'editable');
          });
        });

        suite('Inline', function() {
          test('True', function() {
            const block = this.workspace.newBlock('statement_block');
            block.setInputsInline(true);
            const jso = Blockly.serialization.blocks.save(block);
            assertProperty(jso, 'inline', true);
          });

          test('False', function() {
            const block = this.workspace.newBlock('statement_block');
            block.setInputsInline(false);
            const jso = Blockly.serialization.blocks.save(block);
            assertProperty(jso, 'inline', false);
          });

          test('undefined', function() {
            const block = this.workspace.newBlock('statement_block');
            const jso = Blockly.serialization.blocks.save(block);
            assertNoProperty(jso, 'inline');
          });

          test('True, matching default', function() {
            const block = this.workspace.newBlock('statement_block');
            block.setInputsInline(true);
            block.inputsInlineDefault = true;
            const jso = Blockly.serialization.blocks.save(block);
            assertNoProperty(jso, 'inline');
          });

          test('False, matching default', function() {
            const block = this.workspace.newBlock('statement_block');
            block.setInputsInline(false);
            block.inputsInlineDefault = false;
            const jso = Blockly.serialization.blocks.save(block);
            assertNoProperty(jso, 'inline');
          });
        });
      });

      suite('Coords', function() {
        test('No coordinates', function() {
          const block = this.workspace.newBlock('row_block');
          const jso = Blockly.serialization.blocks.save(block);
          assertNoProperty(jso, 'x');
          assertNoProperty(jso, 'y');
        });

        test('Simple', function() {
          const block = this.workspace.newBlock('row_block');
          block.moveBy(42, 42);
          const jso =
              Blockly.serialization.blocks.save(block, {addCoordinates: true});
          assertProperty(jso, 'x', 42);
          assertProperty(jso, 'y', 42);
        });

        test('Negative', function() {
          const block = this.workspace.newBlock('row_block');
          block.moveBy(-42, -42);
          const jso =
              Blockly.serialization.blocks.save(block, {addCoordinates: true});
          assertProperty(jso, 'x', -42);
          assertProperty(jso, 'y', -42);
        });

        test('Zero', function() {
          const block = this.workspace.newBlock('row_block');
          const jso =
              Blockly.serialization.blocks.save(block, {addCoordinates: true});
          assertProperty(jso, 'x', 0);
          assertProperty(jso, 'y', 0);
        });
      });
    });
  });
});
