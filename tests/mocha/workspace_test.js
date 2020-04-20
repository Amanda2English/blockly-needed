/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

suite('Workspace', function() {
  setup(function() {
    this.workspace = new Blockly.Workspace();
    Blockly.defineBlocksWithJsonArray([{
      "type": "get_var_block",
      "message0": "%1",
      "args0": [
        {
          "type": "field_variable",
          "name": "VAR",
          "variableTypes": ["", "type1", "type2"]
        }
      ]
    }]);
  });

  teardown(function() {
    delete Blockly.Blocks['get_var_block'];
    this.workspace.dispose();
    // Clear Blockly.Event state.
    Blockly.Events.setGroup(false);
    Blockly.Events.disabled_ = 0;
    sinon.restore();
  });

  suite('clear', function() {
    test('Trivial', function() {
      sinon.stub(Blockly.Events, "setGroup").returns(null);
      this.workspace.createVariable('name1', 'type1', 'id1');
      this.workspace.createVariable('name2', 'type2', 'id2');
      this.workspace.newBlock('');

      this.workspace.clear();
      chai.assert.equal(this.workspace.topBlocks_.length, 0);
      var varMapLength =
          Object.keys(this.workspace.variableMap_.variableMap_).length;
      chai.assert.equal(varMapLength, 0);
    });

    test('No variables', function() {
      sinon.stub(Blockly.Events, "setGroup").returns(null);
      this.workspace.newBlock('');

      this.workspace.clear();
      chai.assert.equal(this.workspace.topBlocks_.length, 0);
      var varMapLength =
          Object.keys(this.workspace.variableMap_.variableMap_).length;
      chai.assert.equal(varMapLength, 0);
    });
  });

  suite('deleteVariable', function() {
    setup(function() {
      // Create two variables of different types.
      this.var1 = this.workspace.createVariable('name1', 'type1', 'id1');
      this.var2 = this.workspace.createVariable('name2', 'type2', 'id2');
      // Create blocks to refer to both of them.
      // Turn off events to avoid testing XML at the same time.
      Blockly.Events.disable();
      var block = new Blockly.Block(this.workspace, 'get_var_block');
      block.inputList[0].fieldRow[0].setValue('id1');
      block = new Blockly.Block(this.workspace, 'get_var_block');
      block.inputList[0].fieldRow[0].setValue('id1');
      block = new Blockly.Block(this.workspace, 'get_var_block');
      block.inputList[0].fieldRow[0].setValue('id2');
      Blockly.Events.enable();
    });

    test('deleteVariableInternal_', function() {
      var uses = this.workspace.getVariableUsesById(this.var1.getId());
      this.workspace.deleteVariableInternal_(this.var1, uses);

      var variable = this.workspace.getVariableById('id1');
      chai.assert.isNull(variable);
      var blockVarName = this.workspace.topBlocks_[0].getVarModels()[0].name;
      assertVariableValues(this.workspace, 'name2', 'type2', 'id2');
      chai.assert.equal(blockVarName, 'name2');
    });

    test('deleteVariableById one usage', function() {
      // Deleting variable one usage should not trigger confirm dialog.
      var stub =
          sinon.stub(Blockly, "confirm").callsArgWith(1, true);
      this.workspace.deleteVariableById('id2');

      sinon.assert.notCalled(stub);
      var variable = this.workspace.getVariableById('id2');
      chai.assert.isNull(variable);
      assertVariableValues(this.workspace, 'name1', 'type1', 'id1');
      var blockVarName = this.workspace.topBlocks_[0].getVarModels()[0].name;
      chai.assert.equal(blockVarName, 'name1');
    });

    test('deleteVariableById multiple usages confirm', function() {
      // Deleting variable with multiple usages triggers confirm dialog.
      var stub =
          sinon.stub(Blockly, "confirm").callsArgWith(1, true);
      this.workspace.deleteVariableById('id1');

      sinon.assert.calledOnce(stub);
      var variable = this.workspace.getVariableById('id1');
      chai.assert.isNull(variable);
      assertVariableValues(this.workspace, 'name2', 'type2', 'id2');
      var blockVarName = this.workspace.topBlocks_[0].getVarModels()[0].name;
      chai.assert.equal(blockVarName, 'name2');
    });

    test('deleteVariableById multiple usages cancel', function() {
      // Deleting variable with multiple usages triggers confirm dialog.
      var stub =
          sinon.stub(Blockly, "confirm").callsArgWith(1, false);
      this.workspace.deleteVariableById('id1');

      sinon.assert.calledOnce(stub);
      assertVariableValues(this.workspace, 'name1', 'type1', 'id1');
      assertVariableValues(this.workspace, 'name2', 'type2', 'id2');
      var blockVarName1 = this.workspace.topBlocks_[0].getVarModels()[0].name;
      chai.assert.equal(blockVarName1, 'name1');
      var blockVarName2 = this.workspace.topBlocks_[1].getVarModels()[0].name;
      chai.assert.equal(blockVarName2, 'name1');
      var blockVarName3 = this.workspace.topBlocks_[2].getVarModels()[0].name;
      chai.assert.equal(blockVarName3, 'name2');
    });
  });

  suite('renameVariable', function() {
    setup(function() {
      this.workspace.createVariable('name1', 'type1', 'id1');
    });
    test('No references', function() {
      this.workspace.renameVariableById('id1', 'name2');
      assertVariableValues(this.workspace, 'name2', 'type1', 'id1');
      // Renaming should not have created a new variable.
      chai.assert.equal(this.workspace.getAllVariables().length, 1);
    });

    test('Reference exists', function() {
      // Turn off events to avoid testing XML at the same time.
      Blockly.Events.disable();
      var block = new Blockly.Block(this.workspace, 'get_var_block');
      block.inputList[0].fieldRow[0].setValue('id1');
      Blockly.Events.enable();

      this.workspace.renameVariableById('id1', 'name2');
      assertVariableValues(this.workspace, 'name2', 'type1', 'id1');
      // Renaming should not have created a new variable.
      chai.assert.equal(this.workspace.getAllVariables().length, 1);
      var blockVarName = this.workspace.topBlocks_[0].getVarModels()[0].name;
      chai.assert.equal(blockVarName, 'name2');
    });

    test('Reference exists different capitalizations', function() {
      // Turn off events to avoid testing XML at the same time.
      Blockly.Events.disable();
      var block = new Blockly.Block(this.workspace, 'get_var_block');
      block.inputList[0].fieldRow[0].setValue('id1');
      Blockly.Events.enable();

      this.workspace.renameVariableById('id1', 'Name1');
      assertVariableValues(this.workspace, 'Name1', 'type1', 'id1');
      // Renaming should not have created a new variable.
      chai.assert.equal(this.workspace.getAllVariables().length, 1);
      var blockVarName = this.workspace.topBlocks_[0].getVarModels()[0].name;
      chai.assert.equal(blockVarName, 'Name1');
    });

    suite('Two variables rename overlap', function() {
      test('Same type', function() {
        this.workspace.createVariable('name2', 'type1', 'id2');
        // Turn off events to avoid testing XML at the same time.
        Blockly.Events.disable();
        var block = new Blockly.Block(this.workspace, 'get_var_block');
        block.inputList[0].fieldRow[0].setValue('id1');
        block = new Blockly.Block(this.workspace, 'get_var_block');
        block.inputList[0].fieldRow[0].setValue('id2');
        Blockly.Events.enable();

        this.workspace.renameVariableById('id1', 'name2');

        // The second variable should remain unchanged.
        assertVariableValues(this.workspace, 'name2', 'type1', 'id2');
        // The first variable should have been deleted.
        var variable = this.workspace.getVariableById('id1');
        chai.assert.isNull(variable);
        // There should only be one variable left.
        chai.assert.equal(this.workspace.getAllVariables().length, 1);

        // Both blocks should now reference variable with name2.
        var blockVar1 = this.workspace.topBlocks_[0].getVarModels()[0].name;
        chai.assert.equal(blockVar1, 'name2');
        var blockVar2 = this.workspace.topBlocks_[1].getVarModels()[0].name;
        chai.assert.equal(blockVar2, 'name2');
      });

      test('Different type', function() {
        this.workspace.createVariable('name2', 'type2', 'id2');
        // Turn off events to avoid testing XML at the same time.
        Blockly.Events.disable();
        var block = new Blockly.Block(this.workspace, 'get_var_block');
        block.inputList[0].fieldRow[0].setValue('id1');
        block = new Blockly.Block(this.workspace, 'get_var_block');
        block.inputList[0].fieldRow[0].setValue('id2');
        Blockly.Events.enable();

        this.workspace.renameVariableById('id1', 'name2');

        // Variables with different type are allowed to have the same name.
        assertVariableValues(this.workspace, 'name2', 'type1', 'id1');
        assertVariableValues(this.workspace, 'name2', 'type2', 'id2');

        // Both blocks should now reference variable with name2.
        var blockVar1 = this.workspace.topBlocks_[0].getVarModels()[0].name;
        chai.assert.equal(blockVar1, 'name2');
        var blockVar2 = this.workspace.topBlocks_[1].getVarModels()[0].name;
        chai.assert.equal(blockVar2, 'name2');
      });

      test('Same type different capitalization', function() {
        this.workspace.createVariable('name2', 'type1', 'id2');
        // Turn off events to avoid testing XML at the same time.
        Blockly.Events.disable();
        var block = new Blockly.Block(this.workspace, 'get_var_block');
        block.inputList[0].fieldRow[0].setValue('id1');
        block = new Blockly.Block(this.workspace, 'get_var_block');
        block.inputList[0].fieldRow[0].setValue('id2');
        Blockly.Events.enable();

        this.workspace.renameVariableById('id1', 'Name2');

        // The second variable should be updated.
        assertVariableValues(this.workspace, 'Name2', 'type1', 'id2');
        // The first variable should have been deleted.
        var variable = this.workspace.getVariableById('id1');
        chai.assert.isNull(variable);
        // There should only be one variable left.
        chai.assert.equal(this.workspace.getAllVariables().length, 1);

        // Both blocks should now reference variable with Name2.
        var blockVar1 = this.workspace.topBlocks_[0].getVarModels()[0].name;
        chai.assert.equal(blockVar1, 'Name2');
        var blockVar2 = this.workspace.topBlocks_[1].getVarModels()[0].name;
        chai.assert.equal(blockVar2, 'Name2');
      });

      test('Different type different capitalization', function() {
        this.workspace.createVariable('name2', 'type2', 'id2');
        // Turn off events to avoid testing XML at the same time.
        Blockly.Events.disable();
        var block = new Blockly.Block(this.workspace, 'get_var_block');
        block.inputList[0].fieldRow[0].setValue('id1');
        block = new Blockly.Block(this.workspace, 'get_var_block');
        block.inputList[0].fieldRow[0].setValue('id2');
        Blockly.Events.enable();

        this.workspace.renameVariableById('id1', 'Name2');

        // Variables with different type are allowed to have the same name.
        assertVariableValues(this.workspace, 'Name2', 'type1', 'id1');
        // Second variable should remain unchanged.
        assertVariableValues(this.workspace, 'name2', 'type2', 'id2');

        // Only first block should use new capitalization.
        var blockVar1 = this.workspace.topBlocks_[0].getVarModels()[0].name;
        chai.assert.equal(blockVar1, 'Name2');
        var blockVar2 = this.workspace.topBlocks_[1].getVarModels()[0].name;
        chai.assert.equal(blockVar2, 'name2');
      });
    });
  });

  suite('addTopBlock', function() {
    setup(function() {
      this.targetWorkspace = new Blockly.Workspace();
      this.workspace.isFlyout = true;
      this.workspace.targetWorkspace = this.targetWorkspace;
    });

    teardown(function() {
      // Have to dispose of the main workspace after the flyout workspace
      // because it holds the variable map.
      // Normally the main workspace disposes of the flyout workspace.
      this.targetWorkspace.dispose();
    });

    test('Trivial Flyout is True', function() {
      this.targetWorkspace.createVariable('name1', '', '1');

      // Flyout.init usually does this binding.
      this.workspace.variableMap_ = this.targetWorkspace.getVariableMap();

      // Turn off events to avoid testing XML at the same time.
      Blockly.Events.disable();
      var block = new Blockly.Block(this.workspace, 'get_var_block');
      block.inputList[0].fieldRow[0].setValue('1');
      Blockly.Events.enable();

      this.workspace.removeTopBlock(block);
      this.workspace.addTopBlock(block);
      assertVariableValues(this.workspace, 'name1', '', '1');
    });
  });

  suite('getTopBlocks(ordered=true)', function() {
    test('Empty workspace', function() {
      chai.assert.equal(this.workspace.getTopBlocks(true).length, 0);
    });

    test('Flat workspace one block', function() {
      this.workspace.newBlock('');
      chai.assert.equal(this.workspace.getTopBlocks(true).length, 1);
    });

    test('Flat workspace one block after dispose', function() {
      var blockA = this.workspace.newBlock('');
      this.workspace.newBlock('');
      blockA.dispose();
      chai.assert.equal(this.workspace.getTopBlocks(true).length, 1);
    });

    test('Flat workspace two blocks', function() {
      this.workspace.newBlock('');
      this.workspace.newBlock('');
      chai.assert.equal(this.workspace.getTopBlocks(true).length, 2);
    });

    test('Clear', function() {
      this.workspace.clear();
      chai.assert.equal(this.workspace.getTopBlocks(true).length, 0,
          'Clear empty workspace');
      this.workspace.newBlock('');
      this.workspace.newBlock('');
      this.workspace.clear();
      chai.assert.equal(this.workspace.getTopBlocks(true).length, 0);
    });
  });

  suite('getTopBlocks(ordered=false)', function() {
    test('Empty workspace', function() {
      chai.assert.equal(this.workspace.getTopBlocks(false).length, 0);
    });

    test('Flat workspace one block', function() {
      this.workspace.newBlock('');
      chai.assert.equal(this.workspace.getTopBlocks(false).length, 1);
    });

    test('Flat workspace one block after dispose', function() {
      var blockA = this.workspace.newBlock('');
      this.workspace.newBlock('');
      blockA.dispose();
      chai.assert.equal(this.workspace.getTopBlocks(false).length, 1);
    });

    test('Flat workspace two blocks', function() {
      this.workspace.newBlock('');
      this.workspace.newBlock('');
      chai.assert.equal(this.workspace.getTopBlocks(false).length, 2);
    });

    test('Clear empty workspace', function() {
      this.workspace.clear();
      chai.assert.equal(this.workspace.getTopBlocks(false).length, 0);
    });

    test('Clear non-empty workspace', function() {
      this.workspace.newBlock('');
      this.workspace.newBlock('');
      this.workspace.clear();
      chai.assert.equal(this.workspace.getTopBlocks(false).length, 0);
    });
  });

  suite('getAllBlocks', function() {
    test('Empty workspace', function() {
      chai.assert.equal(this.workspace.getAllBlocks(true).length, 0);
    });

    test('Flat workspace one block', function() {
      this.workspace.newBlock('');
      chai.assert.equal(this.workspace.getAllBlocks(true).length, 1);
    });

    test('Flat workspace one block after dispose', function() {
      var blockA = this.workspace.newBlock('');
      this.workspace.newBlock('');
      blockA.dispose();
      chai.assert.equal(this.workspace.getAllBlocks(true).length, 1);
    });

    test('Flat workspace two blocks', function() {
      this.workspace.newBlock('');
      this.workspace.newBlock('');
      chai.assert.equal(this.workspace.getAllBlocks(true).length, 2);
    });

    test('Clear', function() {
      this.workspace.clear();
      chai.assert.equal(this.workspace.getAllBlocks(true).length, 0,
          'Clear empty workspace');
      this.workspace.newBlock('');
      this.workspace.newBlock('');
      this.workspace.clear();
      chai.assert.equal(this.workspace.getAllBlocks(true).length, 0);
    });
  });

  suite('remainingCapacity', function() {
    setup(function() {
      this.workspace.newBlock('');
      this.workspace.newBlock('');
    });

    test('No block limit', function() {
      chai.assert.equal(this.workspace.remainingCapacity(), Infinity);
    });

    test('Under block limit', function() {
      this.workspace.options.maxBlocks = 3;
      chai.assert.equal(this.workspace.remainingCapacity(), 1);
      this.workspace.options.maxBlocks = 4;
      chai.assert.equal(this.workspace.remainingCapacity(), 2);
    });

    test('At block limit', function() {
      this.workspace.options.maxBlocks = 2;
      chai.assert.equal(this.workspace.remainingCapacity(), 0);
    });

    test('At block limit of 0 after clear', function() {
      this.workspace.options.maxBlocks = 0;
      this.workspace.clear();
      chai.assert.equal(this.workspace.remainingCapacity(), 0);
    });

    test('Over block limit', function() {
      this.workspace.options.maxBlocks = 1;
      chai.assert.equal(this.workspace.remainingCapacity(), -1);
    });

    test('Over block limit of 0', function() {
      this.workspace.options.maxBlocks = 0;
      chai.assert.equal(this.workspace.remainingCapacity(), -2);
    });
  });

  suite('remainingCapacityOfType', function() {
    setup(function() {
      this.workspace.newBlock('get_var_block');
      this.workspace.newBlock('get_var_block');
      this.workspace.options.maxInstances = {};
    });

    test('No instance limit', function() {
      chai.assert.equal(this.workspace.remainingCapacityOfType('get_var_block'),
          Infinity);
    });

    test('Under instance limit', function() {
      this.workspace.options.maxInstances['get_var_block'] = 3;
      chai.assert.equal(this.workspace.remainingCapacityOfType('get_var_block'),
          1, 'With maxInstances limit 3');
      this.workspace.options.maxInstances['get_var_block'] = 4;
      chai.assert.equal(this.workspace.remainingCapacityOfType('get_var_block'),
          2, 'With maxInstances limit 4');
    });

    test('Under instance limit with multiple block types', function() {
      this.workspace.newBlock('');
      this.workspace.newBlock('');
      this.workspace.newBlock('');
      this.workspace.options.maxInstances['get_var_block'] = 3;
      chai.assert.equal(this.workspace.remainingCapacityOfType('get_var_block'),
          1, 'With maxInstances limit 3');
      this.workspace.options.maxInstances['get_var_block'] = 4;
      chai.assert.equal(this.workspace.remainingCapacityOfType('get_var_block'),
          2, 'With maxInstances limit 4');
    });

    test('At instance limit', function() {
      this.workspace.options.maxInstances['get_var_block'] = 2;
      chai.assert.equal(this.workspace.remainingCapacityOfType('get_var_block'),
          0, 'With maxInstances limit 2');
    });

    test.skip('At instance limit of 0 after clear', function() {
      // TODO(3837): Un-skip test after resolving.
      this.workspace.clear();
      this.workspace.options.maxInstances['get_var_block'] = 0;
      chai.assert.equal(this.workspace.remainingCapacityOfType('get_var_block'),
          0);
    });

    test('At instance limit with multiple block types', function() {
      this.workspace.newBlock('');
      this.workspace.newBlock('');
      this.workspace.newBlock('');
      this.workspace.options.maxInstances['get_var_block'] = 2;
      chai.assert.equal(this.workspace.remainingCapacityOfType('get_var_block'),
          0, 'With maxInstances limit 2');
    });

    test.skip('At instance limit of 0 with multiple block types', function() {
      // TODO(3837): Un-skip test after resolving.
      this.workspace.newBlock('');
      this.workspace.newBlock('');
      this.workspace.newBlock('');
      this.workspace.options.maxInstances['get_var_block'] = 0;
      this.workspace.clear();
      chai.assert.equal(this.workspace.remainingCapacityOfType('get_var_block'),
          0);
    });

    test('Over instance limit', function() {
      this.workspace.options.maxInstances['get_var_block'] = 1;
      chai.assert.equal(this.workspace.remainingCapacityOfType('get_var_block'),
          -1,'With maxInstances limit 1');
    });

    test.skip('Over instance limit of 0', function() {
      // TODO(3837): Un-skip test after resolving.
      this.workspace.options.maxInstances['get_var_block'] = 0;
      chai.assert.equal(this.workspace.remainingCapacityOfType('get_var_block'),
          -2,'With maxInstances limit 0');
    });

    test('Over instance limit with multiple block types', function() {
      this.workspace.newBlock('');
      this.workspace.newBlock('');
      this.workspace.newBlock('');
      this.workspace.options.maxInstances['get_var_block'] = 1;
      chai.assert.equal(this.workspace.remainingCapacityOfType('get_var_block'),
          -1,'With maxInstances limit 1');
    });

    test.skip('Over instance limit of 0 with multiple block types', function() {
      // TODO(3837): Un-skip test after resolving.
      this.workspace.newBlock('');
      this.workspace.newBlock('');
      this.workspace.newBlock('');
      this.workspace.options.maxInstances['get_var_block'] = 0;
      chai.assert.equal(this.workspace.remainingCapacityOfType('get_var_block'),
          -2,'With maxInstances limit 0');
    });

    suite.skip('Max blocks and max instance interaction', function() {
      // TODO(3836): Un-skip test suite after resolving.
      test('Under block limit and no instance limit', function() {
        this.workspace.options.maxBlocks = 3;
        chai.assert.equal(
            this.workspace.remainingCapacityOfType('get_var_block'), 1);
      });

      test('At block limit and no instance limit', function() {
        this.workspace.options.maxBlocks = 2;
        chai.assert.equal(
            this.workspace.remainingCapacityOfType('get_var_block'), 0);
      });

      test.skip('Over block limit of 0 and no instance limit', function() {
        // TODO(3837|3836): Un-skip test after resolving both.
        this.workspace.options.maxBlocks = 0;
        chai.assert.equal(
            this.workspace.remainingCapacityOfType('get_var_block'), -2);
      });

      test('Over block limit but under instance limit', function() {
        this.workspace.options.maxBlocks = 1;
        this.workspace.options.maxInstances['get_var_block'] = 3;
        chai.assert.equal(
            this.workspace.remainingCapacityOfType('get_var_block'),
            -2,
            'With maxBlocks limit 1 and maxInstances limit 3');
      });

      test.skip('Over block limit of 0 but under instance limit', function() {
        // TODO(3837|3836): Un-skip test after resolving both.
        this.workspace.options.maxBlocks = 0;
        this.workspace.options.maxInstances['get_var_block'] = 3;
        chai.assert.equal(
            this.workspace.remainingCapacityOfType('get_var_block'),
            -2,
            'With maxBlocks limit 0 and maxInstances limit 3');
      });

      test('Over block limit but at instance limit', function() {
        this.workspace.options.maxBlocks = 1;
        this.workspace.options.maxInstances['get_var_block'] = 2;
        chai.assert.equal(
            this.workspace.remainingCapacityOfType('get_var_block'),
            -2,
            'With maxBlocks limit 1 and maxInstances limit 2');
      });

      test('Over block limit and over instance limit', function() {
        this.workspace.options.maxBlocks = 1;
        this.workspace.options.maxInstances['get_var_block'] = 1;
        chai.assert.equal(
            this.workspace.remainingCapacityOfType('get_var_block'),
            -1,
            'With maxBlocks limit 1 and maxInstances limit 1');
      });

      test.skip('Over block limit of 0 and over instance limit', function() {
        // TODO(3837|3836): Un-skip test after resolving both.
        this.workspace.options.maxBlocks = 0;
        this.workspace.options.maxInstances['get_var_block'] = 1;
        chai.assert.equal(
            this.workspace.remainingCapacityOfType('get_var_block'),
            -2,
            'With maxBlocks limit 0 and maxInstances limit 1');
      });

      test('Over block limit and over instance limit of 0', function() {
        this.workspace.options.maxBlocks = 1;
        this.workspace.options.maxInstances['get_var_block'] = 0;
        chai.assert.equal(
            this.workspace.remainingCapacityOfType('get_var_block'),
            -1,
            'With maxBlocks limit 1 and maxInstances limit 0');
      });

      test.skip('Over block limit of 0 and over instance limit of 0', function() {
        // TODO(3837|3836): Un-skip test after resolving both.
        this.workspace.options.maxBlocks = 0;
        this.workspace.options.maxInstances['get_var_block'] = 0;
        chai.assert.equal(
            this.workspace.remainingCapacityOfType('get_var_block'),-1);
      });
    });
  });

  suite('getById', function() {
    setup(function() {
      this.workspaceB = new Blockly.Workspace();
    });

    teardown(function() {
      this.workspaceB.dispose();
    });

    test('Trivial', function() {
      chai.assert.equal(Blockly.Workspace.getById(
          this.workspace.id), this.workspace, 'Find workspace');
      chai.assert.equal(Blockly.Workspace.getById(
          this.workspaceB.id), this.workspaceB, 'Find workspaceB');
    });

    test('Null id', function() {
      chai.assert.isNull(Blockly.Workspace.getById(null));
    });

    test('Non-existent id', function() {
      chai.assert.isNull(Blockly.Workspace.getById('badId'));
    });

    test('After dispose', function() {
      this.workspaceB.dispose();
      chai.assert.isNull(Blockly.Workspace.getById(this.workspaceB.id));
    });
  });

  suite('getBlockById', function() {
    setup(function() {
      this.blockA = this.workspace.newBlock('');
      this.blockB = this.workspace.newBlock('');
      this.workspaceB = new Blockly.Workspace();
    });

    teardown(function() {
      this.workspaceB.dispose();
    });

    test('Trivial', function() {
      chai.assert.equal(
          this.workspace.getBlockById(this.blockA.id),this.blockA);
      chai.assert.equal(
          this.workspace.getBlockById(this.blockB.id), this.blockB);
    });

    test('Null id', function() {
      chai.assert.isNull(this.workspace.getBlockById(null));
    });

    test('Non-existent id', function() {
      chai.assert.isNull(this.workspace.getBlockById('badId'));
    });

    test('After dispose', function() {
      this.blockA.dispose();
      chai.assert.isNull(this.workspace.getBlockById(this.blockA));
      chai.assert.equal(
          this.workspace.getBlockById(this.blockB.id), this.blockB);
    });

    test('After clear', function() {
      this.workspace.clear();
      chai.assert.isNull(this.workspace.getBlockById(this.blockA));
      chai.assert.isNull(this.workspace.getBlockById(this.blockB));
    });
  });
});
