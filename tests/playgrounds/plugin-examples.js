Blockly.Plugins.register('block_menu_example', function() {
  return {
    init: function() {
      console.log('Registering block context menu plugin example');
    },
    dispose: function() {
      console.log('Unregistering block context menu plugin example');
    },
    hooks: {
      blockContextMenu: function(block) {
        return {
          text: 'Example plugin item',
          enabled: true,
          callback: function() {
            console.log('You clicked the example item on block:', block);
          }
        };
      }
    }
  };
});

Blockly.Plugins.register('aspect_example', function(Blockly) {
  return {
    init: function() {
      console.log('Registering aspect plugin example');
    },
    dispose: function() {
      console.log('Unregistering aspect plugin example');
    },
    aspects: [
      {
        pointcut: [Blockly.WorkspaceSvg.prototype, 'createVariable'],
        advice: {
          before: function(name, opt_type) {
            console.log('Creating a new variable:', name, ', of type:', opt_type);
          },
          after: function(variableModel) {
            console.log('New variable created:', variableModel);
          }
        }
      }
    ]
  };
});

Blockly.Plugins.register('field_example', function(Blockly) {
  return {
    hooks: {
      fields: {
        'field_angle2': Blockly.FieldAngle
      }
    }
  };
});

console.log('Plugged in field:', Blockly.fieldRegistry.fromJson({ type: 'field_angle2', angle: 180 }));
