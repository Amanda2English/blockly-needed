/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2019 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

suite('Number Fields', function() {
  function assertValue(numberField, expectedValue, opt_expectedText) {
    var actualValue = numberField.getValue();
    var actualText = numberField.getText();
    opt_expectedText = opt_expectedText || String(expectedValue);
    assertEquals(String(actualValue), String(expectedValue));
    assertEquals(Number(actualValue), expectedValue);
    assertEquals(actualText, opt_expectedText);
  }
  function assertValueDefault(numberField) {
    assertValue(numberField, 0);
  }
  function assertNumberField(numberField, expectedMin, expectedMax,
      expectedPrecision, expectedValue) {
    assertValue(numberField, expectedValue);
    assertEquals(numberField.min_, expectedMin);
    assertEquals(numberField.max_, expectedMax);
    assertEquals(numberField.precision_, expectedPrecision);
  }
  function assertNumberFieldDefault(numberField) {
    assertNumberField(numberField, -Infinity, Infinity, 0, 0);
  }
  function createNumberFieldSameValuesConstructor(value) {
    return new Blockly.FieldNumber(value, value, value, value);
  }
  function createNumberFieldSameValuesJson(value) {
    return Blockly.FieldNumber.fromJson(
        { 'value': value, min: value, max: value, precision: value });
  }
  function assertNumberFieldSameValues(numberField, value) {
    assertNumberField(numberField, value, value, value, value);
  }
  suite('Constructor', function() {
    test('Empty', function() {
      var numberField = new Blockly.FieldNumber();
      assertNumberFieldDefault(numberField);
    });
    test('Undefined', function() {
      var numberField = createNumberFieldSameValuesConstructor(undefined);
      assertNumberFieldDefault(numberField);
    });
    test('Non-Parsable String', function() {
      var numberField = createNumberFieldSameValuesConstructor('bad');
      assertNumberFieldDefault(numberField);
    });
    test('NaN', function() {
      var numberField = createNumberFieldSameValuesConstructor(NaN);
      assertNumberFieldDefault(numberField);
    });
    test('Integer', function() {
      var numberField = createNumberFieldSameValuesConstructor(1);
      assertNumberFieldSameValues(numberField, 1);
    });
    test('Float', function() {
      var numberField = createNumberFieldSameValuesConstructor(1.5);
      assertNumberFieldSameValues(numberField, 1.5);
    });
    test('Integer String', function() {
      var numberField = createNumberFieldSameValuesConstructor('1');
      assertNumberFieldSameValues(numberField, 1);
    });
    test('Float String', function() {
      var numberField = createNumberFieldSameValuesConstructor('1.5');
      assertNumberFieldSameValues(numberField, 1.5);
    });
    test('Infinity', function() {
      var numberField = createNumberFieldSameValuesConstructor('Infinity');
      assertNumberFieldSameValues(numberField, Infinity);
    });
    test('Negative Infinity String', function() {
      var numberField = createNumberFieldSameValuesConstructor('-Infinity');
      assertNumberFieldSameValues(numberField, -Infinity);
    });
  });
  suite('fromJson', function() {
    test('Empty', function() {
      var numberField = Blockly.FieldNumber.fromJson({});
      assertNumberFieldDefault(numberField);
    });
    test('Undefined', function() {
      var numberField = createNumberFieldSameValuesJson(undefined);
      assertNumberFieldDefault(numberField);
    });
    test('Non-Parsable String', function() {
      var numberField = createNumberFieldSameValuesJson('bad');
      assertNumberFieldDefault(numberField);
    });
    test('NaN', function() {
      var numberField = createNumberFieldSameValuesJson(NaN);
      assertNumberFieldDefault(numberField);
    });
    test('Integer', function() {
      var numberField = createNumberFieldSameValuesJson(1);
      assertNumberFieldSameValues(numberField, 1);
    });
    test('Float', function() {
      var numberField = createNumberFieldSameValuesJson(1.5);
      assertNumberFieldSameValues(numberField, 1.5);
    });
    test('Integer String', function() {
      var numberField = createNumberFieldSameValuesJson('1');
      assertNumberFieldSameValues(numberField, 1);
    });
    test('Float String', function() {
      var numberField = createNumberFieldSameValuesJson('1.5');
      assertNumberFieldSameValues(numberField, 1.5);
    });
    test('Infinity', function() {
      var numberField = createNumberFieldSameValuesJson('Infinity');
      assertNumberFieldSameValues(numberField, Infinity);
    });
    test('Negative Infinity String', function() {
      var numberField = createNumberFieldSameValuesJson('-Infinity');
      assertNumberFieldSameValues(numberField, -Infinity);
    });
  });
  suite('setValue', function() {
    suite('Value Types', function() {
      suite('Empty -> New Value', function() {
        setup(function() {
          this.numberField = new Blockly.FieldNumber();
        });
        test('Null', function() {
          this.numberField.setValue(null);
          assertValueDefault(this.numberField);
        });
        test('Undefined', function() {
          this.numberField.setValue(undefined);
          assertValueDefault(this.numberField);
        });
        test('Non-Parsable String', function() {
          this.numberField.setValue('bad');
          assertValueDefault(this.numberField);
        });
        test('NaN', function() {
          this.numberField.setValue(NaN);
          assertValueDefault(this.numberField);
        });
        test('Integer', function() {
          this.numberField.setValue(2);
          assertValue(this.numberField, 2);
        });
        test('Float', function() {
          this.numberField.setValue(2.5);
          assertValue(this.numberField, 2.5);
        });
        test('Integer String', function() {
          this.numberField.setValue('2');
          assertValue(this.numberField, 2);
        });
        test('Float String', function() {
          this.numberField.setValue('2.5');
          assertValue(this.numberField, 2.5);
        });
        test('Infinity', function() {
          this.numberField.setValue(Infinity);
          assertValue(this.numberField, Infinity);
        });
        test('Negative Infinity String', function() {
          this.numberField.setValue('-Infinity');
          assertValue(this.numberField, -Infinity);
        });
      });
      suite('Value -> New Value', function() {
        setup(function() {
          this.numberField = new Blockly.FieldNumber(1);
        });
        test('Null', function() {
          this.numberField.setValue(null);
          assertValue(this.numberField, 1);
        });
        test('Undefined', function() {
          this.numberField.setValue(undefined);
          assertValue(this.numberField, 1);
        });
        test('Non-Parsable String', function() {
          this.numberField.setValue('bad');
          assertValue(this.numberField, 1);
        });
        test('NaN', function() {
          this.numberField.setValue(NaN);
          assertValue(this.numberField, 1);
        });
        test('Integer', function() {
          this.numberField.setValue(2);
          assertValue(this.numberField, 2);
        });
        test('Float', function() {
          this.numberField.setValue(2.5);
          assertValue(this.numberField, 2.5);
        });
        test('Integer String', function() {
          this.numberField.setValue('2');
          assertValue(this.numberField, 2);
        });
        test('Float String', function() {
          this.numberField.setValue('2.5');
          assertValue(this.numberField, 2.5);
        });
        test('Infinity', function() {
          this.numberField.setValue(Infinity);
          assertValue(this.numberField, Infinity);
        });
        test('Negative Infinity String', function() {
          this.numberField.setValue('-Infinity');
          assertValue(this.numberField, -Infinity);
        });
      });
    });
    suite('Constraints', function() {
      suite('Precision', function() {
        test('Float', function() {
          var numberField = new Blockly.FieldNumber();
          numberField.setValue(123.456);
          assertValue(numberField, 123.456);
        });
        test('0.01', function() {
          var numberField = new Blockly.FieldNumber
              .fromJson({ precision: .01 });
          numberField.setValue(123.456);
          assertValue(numberField, 123.46);
        });
        test('0.5', function() {
          var numberField = new Blockly.FieldNumber
              .fromJson({ precision: .5 });
          numberField.setValue(123.456);
          assertValue(numberField, 123.5);
        });
        test('1', function() {
          var numberField = new Blockly.FieldNumber
              .fromJson({ precision: 1 });
          numberField.setValue(123.456);
          assertValue(numberField, 123);
        });
        test('1.5', function() {
          var numberField = new Blockly.FieldNumber
              .fromJson({ precision: 1.5 });
          numberField.setValue(123.456);
          assertValue(numberField, 123);
        });
      });
      suite('Min', function() {
        test('-10', function() {
          var numberField = new Blockly.FieldNumber.fromJson({ min: -10 });
          numberField.setValue(-20);
          assertValue(numberField, -10);
          numberField.setValue(0);
          assertValue(numberField, 0);
          numberField.setValue(20);
          assertValue(numberField, 20);
        });
        test('0', function() {
          var numberField = new Blockly.FieldNumber.fromJson({ min: 0 });
          numberField.setValue(-20);
          assertValue(numberField, 0);
          numberField.setValue(0);
          assertValue(numberField, 0);
          numberField.setValue(20);
          assertValue(numberField, 20);
        });
        test('+10', function() {
          var numberField = new Blockly.FieldNumber.fromJson({ min: 10 });
          numberField.setValue(-20);
          assertValue(numberField, 10);
          numberField.setValue(0);
          assertValue(numberField, 10);
          numberField.setValue(20);
          assertValue(numberField, 20);
        });
      });
      suite('Max', function() {
        test('-10', function() {
          var numberField = new Blockly.FieldNumber.fromJson({ max: -10 });
          numberField.setValue(-20);
          assertValue(numberField, -20);
          numberField.setValue(0);
          assertValue(numberField, -10);
          numberField.setValue(20);
          assertValue(numberField, -10);
        });
        test('0', function() {
          var numberField = new Blockly.FieldNumber.fromJson({ max: 0 });
          numberField.setValue(-20);
          assertValue(numberField, -20);
          numberField.setValue(0);
          assertValue(numberField, 0);
          numberField.setValue(20);
          assertValue(numberField, 0);
        });
        test('+10', function() {
          var numberField = new Blockly.FieldNumber.fromJson({ max: 10 });
          numberField.setValue(-20);
          assertValue(numberField, -20);
          numberField.setValue(0);
          assertValue(numberField, 0);
          numberField.setValue(20);
          assertValue(numberField, 10);
        });
      });
    });
  });
  suite('Validators', function() {
    setup(function() {
      this.numberField = new Blockly.FieldNumber(1);
      this.numberField.htmlInput_ = Object.create(null);
      this.numberField.htmlInput_.oldValue_ = '1';
      this.numberField.htmlInput_.untypedDefaultValue_ = 1;
    });
    teardown(function() {
      this.numberField.setValidator(null);
      this.numberField.htmlInput_ = null;
    });
    suite('Null Validator', function() {
      setup(function() {
        this.numberField.setValidator(function() {
          return null;
        });
      });
      test('When Editing', function() {
        this.numberField.isBeingEdited_ = true;
        this.numberField.htmlInput_.value = '2';
        this.numberField.onHtmlInputChange_(null);
        assertValue(this.numberField, 1, '2');
        this.numberField.isBeingEdited_ = false;
      });
      test('When Not Editing', function() {
        this.numberField.setValue(2);
        assertValue(this.numberField, 1);
      });
    });
    suite('Force End with 6 Validator', function() {
      setup(function() {
        this.numberField.setValidator(function(newValue) {
          return String(newValue).replace(/.$/, "6");
        });
      });
      test('When Editing', function() {
        this.numberField.isBeingEdited_ = true;
        this.numberField.htmlInput_.value = '25';
        this.numberField.onHtmlInputChange_(null);
        assertValue(this.numberField, 26, '25');
        this.numberField.isBeingEdited_ = false;
      });
      test('When Not Editing', function() {
        this.numberField.setValue(25);
        assertValue(this.numberField, 26);
      });
    });
    suite('Returns Undefined Validator', function() {
      setup(function() {
        this.numberField.setValidator(function() {});
      });
      test('When Editing', function() {
        this.numberField.isBeingEdited_ = true;
        this.numberField.htmlInput_.value = '2';
        this.numberField.onHtmlInputChange_(null);
        assertValue(this.numberField, 2);
        this.numberField.isBeingEdited_ = false;
      });
      test('When Not Editing', function() {
        this.numberField.setValue(2);
        assertValue(this.numberField, 2);
      });
    });
  });
});
