/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

suite('Connection', function() {
  setup(function() {
    sharedTestSetup.call(this);
    this.workspace = sinon.createStubInstance(Blockly.Workspace);
    this.workspace.connectionChecker = new Blockly.ConnectionChecker();
    this.createConnection = function(type) {
      var block = {
        workspace: this.workspace,
        isShadow: function() { return false; }
      };
      var connection = new Blockly.Connection(block, type);
      return connection;
    };
  });
  teardown(function() {
    sharedTestTeardown.call(this);
  });
  test('canConnectWithReason passes', function() {
    var conn1 = this.createConnection(Blockly.PREVIOUS_STATEMENT);
    var conn2 = this.createConnection(Blockly.NEXT_STATEMENT);
    chai.assert.equal(conn1.canConnectWithReason(conn2),
        Blockly.Connection.CAN_CONNECT);
  });
  test('canConnectWithReason fails', function() {
    var conn1 = this.createConnection(Blockly.PREVIOUS_STATEMENT);
    var conn2 = this.createConnection(Blockly.OUTPUT_VALUE);
    chai.assert.equal(conn1.canConnectWithReason(conn2),
        Blockly.Connection.REASON_WRONG_TYPE);
  });
  test('checkConnection passes', function() {
    var conn1 = this.createConnection(Blockly.PREVIOUS_STATEMENT);
    var conn2 = this.createConnection(Blockly.NEXT_STATEMENT);
    chai.assert.doesNotThrow(function() {
      conn1.checkConnection(conn2);
    });
  });
  test('checkConnection fails', function() {
    var conn1 = this.createConnection(Blockly.PREVIOUS_STATEMENT);
    var conn2 = this.createConnection(Blockly.OUTPUT_VALUE);
    chai.assert.throws(function() {
      conn1.checkConnection(conn2);
    });
  });
});
