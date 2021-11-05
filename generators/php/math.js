/**
 * @license
 * Copyright 2015 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating PHP for math blocks.
 */
'use strict';

goog.provide('Blockly.PHP.math');

goog.require('Blockly.PHP');


Blockly.PHP['math_number'] = function(block) {
  // Numeric value.
  let code = Number(block.getFieldValue('NUM'));
  const order = code >= 0 ? Blockly.PHP.ORDER_ATOMIC :
              Blockly.PHP.ORDER_UNARY_NEGATION;
  if (code === Infinity) {
    code = 'INF';
  } else if (code === -Infinity) {
    code = '-INF';
  }
  return [code, order];
};

Blockly.PHP['math_arithmetic'] = function(block) {
  // Basic arithmetic operators, and power.
  const OPERATORS = {
    'ADD': [' + ', Blockly.PHP.ORDER_ADDITION],
    'MINUS': [' - ', Blockly.PHP.ORDER_SUBTRACTION],
    'MULTIPLY': [' * ', Blockly.PHP.ORDER_MULTIPLICATION],
    'DIVIDE': [' / ', Blockly.PHP.ORDER_DIVISION],
    'POWER': [' ** ', Blockly.PHP.ORDER_POWER]
  };
  const tuple = OPERATORS[block.getFieldValue('OP')];
  const operator = tuple[0];
  const order = tuple[1];
  const argument0 = Blockly.PHP.valueToCode(block, 'A', order) || '0';
  const argument1 = Blockly.PHP.valueToCode(block, 'B', order) || '0';
  const code = argument0 + operator + argument1;
  return [code, order];
};

Blockly.PHP['math_single'] = function(block) {
  // Math operators with single operand.
  const operator = block.getFieldValue('OP');
  let code;
  let arg;
  if (operator === 'NEG') {
    // Negation is a special case given its different operator precedence.
    arg = Blockly.PHP.valueToCode(block, 'NUM',
        Blockly.PHP.ORDER_UNARY_NEGATION) || '0';
    if (arg[0] === '-') {
      // --3 is not legal in JS.
      arg = ' ' + arg;
    }
    code = '-' + arg;
    return [code, Blockly.PHP.ORDER_UNARY_NEGATION];
  }
  if (operator === 'SIN' || operator === 'COS' || operator === 'TAN') {
    arg = Blockly.PHP.valueToCode(block, 'NUM',
        Blockly.PHP.ORDER_DIVISION) || '0';
  } else {
    arg = Blockly.PHP.valueToCode(block, 'NUM',
        Blockly.PHP.ORDER_NONE) || '0';
  }
  // First, handle cases which generate values that don't need parentheses
  // wrapping the code.
  switch (operator) {
    case 'ABS':
      code = 'abs(' + arg + ')';
      break;
    case 'ROOT':
      code = 'sqrt(' + arg + ')';
      break;
    case 'LN':
      code = 'log(' + arg + ')';
      break;
    case 'EXP':
      code = 'exp(' + arg + ')';
      break;
    case 'POW10':
      code = 'pow(10,' + arg + ')';
      break;
    case 'ROUND':
      code = 'round(' + arg + ')';
      break;
    case 'ROUNDUP':
      code = 'ceil(' + arg + ')';
      break;
    case 'ROUNDDOWN':
      code = 'floor(' + arg + ')';
      break;
    case 'SIN':
      code = 'sin(' + arg + ' / 180 * pi())';
      break;
    case 'COS':
      code = 'cos(' + arg + ' / 180 * pi())';
      break;
    case 'TAN':
      code = 'tan(' + arg + ' / 180 * pi())';
      break;
  }
  if (code) {
    return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
  }
  // Second, handle cases which generate values that may need parentheses
  // wrapping the code.
  switch (operator) {
    case 'LOG10':
      code = 'log(' + arg + ') / log(10)';
      break;
    case 'ASIN':
      code = 'asin(' + arg + ') / pi() * 180';
      break;
    case 'ACOS':
      code = 'acos(' + arg + ') / pi() * 180';
      break;
    case 'ATAN':
      code = 'atan(' + arg + ') / pi() * 180';
      break;
    default:
      throw Error('Unknown math operator: ' + operator);
  }
  return [code, Blockly.PHP.ORDER_DIVISION];
};

Blockly.PHP['math_constant'] = function(block) {
  // Constants: PI, E, the Golden Ratio, sqrt(2), 1/sqrt(2), INFINITY.
  const CONSTANTS = {
    'PI': ['M_PI', Blockly.PHP.ORDER_ATOMIC],
    'E': ['M_E', Blockly.PHP.ORDER_ATOMIC],
    'GOLDEN_RATIO': ['(1 + sqrt(5)) / 2', Blockly.PHP.ORDER_DIVISION],
    'SQRT2': ['M_SQRT2', Blockly.PHP.ORDER_ATOMIC],
    'SQRT1_2': ['M_SQRT1_2', Blockly.PHP.ORDER_ATOMIC],
    'INFINITY': ['INF', Blockly.PHP.ORDER_ATOMIC]
  };
  return CONSTANTS[block.getFieldValue('CONSTANT')];
};

Blockly.PHP['math_number_property'] = function(block) {
  // Check if a number is even, odd, prime, whole, positive, or negative
  // or if it is divisible by certain number. Returns true or false.
  const PROPERTIES = {

    'EVEN': [' % 2 == 0', Blockly.PHP.ORDER_MODULUS,

        Blockly.PHP.ORDER_EQUALITY],

    'ODD': [' % 2 == 1', Blockly.PHP.ORDER_MODULUS,

        Blockly.PHP.ORDER_EQUALITY],

    'WHOLE': [' % 1 == 0', Blockly.PHP.ORDER_MODULUS,

        Blockly.PHP.ORDER_EQUALITY],

    'POSITIVE': [' > 0', Blockly.PHP.ORDER_RELATIONAL,

        Blockly.PHP.ORDER_RELATIONAL],

    'NEGATIVE': [' < 0', Blockly.PHP.ORDER_RELATIONAL,

        Blockly.PHP.ORDER_RELATIONAL],

    'DIVISIBLE_BY': [null, Blockly.PHP.ORDER_MODULUS,

        Blockly.PHP.ORDER_EQUALITY],

    'PRIME': [null, Blockly.PHP.ORDER_NONE,

        Blockly.PHP.ORDER_FUNCTION_CALL]

  }
  const dropdownProperty = block.getFieldValue('PROPERTY');

  const tuple = PROPERTIES[dropdownProperty];

  const suffix = tuple[0];

  const inputOrder = tuple[1];

  const outputOrder = tuple[2];

  const numberToCheck = Blockly.PHP.valueToCode(block, 'NUMBER_TO_CHECK',

      inputOrder) || '0';

      let code;
  if (dropdownProperty == 'PRIME') {
    // Prime is a special case as it is not a one-liner test.
    const functionName = Blockly.PHP.provideFunction_(
        'math_isPrime',
        ['function ' + Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_ + '($n) {',
         '  // https://en.wikipedia.org/wiki/Primality_test#Naive_methods',
         '  if ($n == 2 || $n == 3) {',
         '    return true;',
         '  }',
         '  // False if n is NaN, negative, is 1, or not whole.',
         '  // And false if n is divisible by 2 or 3.',
         '  if (!is_numeric($n) || $n <= 1 || $n % 1 != 0 || $n % 2 == 0 ||' +
            ' $n % 3 == 0) {',
         '    return false;',
         '  }',
         '  // Check all the numbers of form 6k +/- 1, up to sqrt(n).',
         '  for ($x = 6; $x <= sqrt($n) + 1; $x += 6) {',
         '    if ($n % ($x - 1) == 0 || $n % ($x + 1) == 0) {',
         '      return false;',
         '    }',
         '  }',
         '  return true;',
         '}']);
         code = functionName + '(' + numberToCheck + ')';

        } else if (dropdownProperty == 'DIVISIBLE_BY') {
      
          const divisor = Blockly.PHP.valueToCode(block, 'DIVISOR',
      
              Blockly.PHP.ORDER_MODULUS) || '0';
      
          code = numberToCheck + ' % ' + divisor + ' == 0';
      
        } else {
      
          code = numberToCheck + suffix;
      
        }
      
        return [code, outputOrder];
      
      };

Blockly.PHP['math_change'] = function(block) {
  // Add to a variable in place.
  const argument0 = Blockly.PHP.valueToCode(block, 'DELTA',
      Blockly.PHP.ORDER_ADDITION) || '0';
  const varName = Blockly.PHP.nameDB_.getName(
      block.getFieldValue('VAR'), Blockly.VARIABLE_CATEGORY_NAME);
  return varName + ' += ' + argument0 + ';\n';
};

// Rounding functions have a single operand.
Blockly.PHP['math_round'] = Blockly.PHP['math_single'];
// Trigonometry functions have a single operand.
Blockly.PHP['math_trig'] = Blockly.PHP['math_single'];

Blockly.PHP['math_on_list'] = function(block) {
  // Math functions for lists.
  const func = block.getFieldValue('OP');
  let list;
  let code;
  switch (func) {
    case 'SUM':
      list = Blockly.PHP.valueToCode(block, 'LIST',
          Blockly.PHP.ORDER_FUNCTION_CALL) || 'array()';
      code = 'array_sum(' + list + ')';
      break;
    case 'MIN':
      list = Blockly.PHP.valueToCode(block, 'LIST',
          Blockly.PHP.ORDER_FUNCTION_CALL) || 'array()';
      code = 'min(' + list + ')';
      break;
    case 'MAX':
      list = Blockly.PHP.valueToCode(block, 'LIST',
          Blockly.PHP.ORDER_FUNCTION_CALL) || 'array()';
      code = 'max(' + list + ')';
      break;
    case 'AVERAGE': {
      const functionName = Blockly.PHP.provideFunction_(
          'math_mean',
          ['function ' + Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_ +
              '($myList) {',
           '  return array_sum($myList) / count($myList);',
           '}']);
      list = Blockly.PHP.valueToCode(block, 'LIST',
          Blockly.PHP.ORDER_NONE) || 'array()';
      code = functionName + '(' + list + ')';
      break;
    }
    case 'MEDIAN': {
      const functionName = Blockly.PHP.provideFunction_(
          'math_median',
          ['function ' + Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_ +
              '($arr) {',
           '  sort($arr,SORT_NUMERIC);',
           '  return (count($arr) % 2) ? $arr[floor(count($arr)/2)] : ',
           '      ($arr[floor(count($arr)/2)] + $arr[floor(count($arr)/2)' +
              ' - 1]) / 2;',
           '}']);
      list = Blockly.PHP.valueToCode(block, 'LIST',
          Blockly.PHP.ORDER_NONE) || '[]';
      code = functionName + '(' + list + ')';
      break;
    }
    case 'MODE': {
      // As a list of numbers can contain more than one mode,
      // the returned result is provided as an array.
      // Mode of [3, 'x', 'x', 1, 1, 2, '3'] -> ['x', 1].
      const functionName = Blockly.PHP.provideFunction_(
          'math_modes',
          ['function ' + Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_ +
              '($values) {',
           '  if (empty($values)) return array();',
           '  $counts = array_count_values($values);',
           '  arsort($counts); // Sort counts in descending order',
           '  $modes = array_keys($counts, current($counts), true);',
           '  return $modes;',
           '}']);
      list = Blockly.PHP.valueToCode(block, 'LIST',
          Blockly.PHP.ORDER_NONE) || '[]';
      code = functionName + '(' + list + ')';
      break;
    }
    case 'STD_DEV': {
      const functionName = Blockly.PHP.provideFunction_(
          'math_standard_deviation',
          ['function ' + Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_ +
              '($numbers) {',
           '  $n = count($numbers);',
           '  if (!$n) return null;',
           '  $mean = array_sum($numbers) / count($numbers);',
           '  foreach($numbers as $key => $num) $devs[$key] = ' +
              'pow($num - $mean, 2);',
           '  return sqrt(array_sum($devs) / (count($devs) - 1));',
           '}']);
      list = Blockly.PHP.valueToCode(block, 'LIST',
              Blockly.PHP.ORDER_NONE) || '[]';
      code = functionName + '(' + list + ')';
      break;
    }
    case 'RANDOM': {
      const functionName = Blockly.PHP.provideFunction_(
          'math_random_list',
          ['function ' + Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_ +
              '($list) {',
           '  $x = rand(0, count($list)-1);',
           '  return $list[$x];',
           '}']);
      list = Blockly.PHP.valueToCode(block, 'LIST',
          Blockly.PHP.ORDER_NONE) || '[]';
      code = functionName + '(' + list + ')';
      break;
    }
    default:
      throw Error('Unknown operator: ' + func);
  }
  return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
};

Blockly.PHP['math_modulo'] = function(block) {
  // Remainder computation.
  const argument0 = Blockly.PHP.valueToCode(block, 'DIVIDEND',
      Blockly.PHP.ORDER_MODULUS) || '0';
  const argument1 = Blockly.PHP.valueToCode(block, 'DIVISOR',
      Blockly.PHP.ORDER_MODULUS) || '0';
  const code = argument0 + ' % ' + argument1;
  return [code, Blockly.PHP.ORDER_MODULUS];
};

Blockly.PHP['math_constrain'] = function(block) {
  // Constrain a number between two limits.
  const argument0 = Blockly.PHP.valueToCode(block, 'VALUE',
      Blockly.PHP.ORDER_NONE) || '0';
  const argument1 = Blockly.PHP.valueToCode(block, 'LOW',
      Blockly.PHP.ORDER_NONE) || '0';
  const argument2 = Blockly.PHP.valueToCode(block, 'HIGH',
      Blockly.PHP.ORDER_NONE) || 'Infinity';
  const code = 'min(max(' + argument0 + ', ' + argument1 + '), ' +
      argument2 + ')';
  return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
};

Blockly.PHP['math_random_int'] = function(block) {
  // Random integer between [X] and [Y].
  const argument0 = Blockly.PHP.valueToCode(block, 'FROM',
      Blockly.PHP.ORDER_NONE) || '0';
  const argument1 = Blockly.PHP.valueToCode(block, 'TO',
      Blockly.PHP.ORDER_NONE) || '0';
  const functionName = Blockly.PHP.provideFunction_(
      'math_random_int',
      ['function ' + Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_ +
          '($a, $b) {',
       '  if ($a > $b) {',
       '    return rand($b, $a);',
       '  }',
       '  return rand($a, $b);',
       '}']);
  const code = functionName + '(' + argument0 + ', ' + argument1 + ')';
  return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
};

Blockly.PHP['math_random_float'] = function(block) {
  // Random fraction between 0 and 1.
  return ['(float)rand()/(float)getrandmax()', Blockly.PHP.ORDER_FUNCTION_CALL];
};

Blockly.PHP['math_atan2'] = function(block) {
  // Arctangent of point (X, Y) in degrees from -180 to 180.
  const argument0 = Blockly.PHP.valueToCode(block, 'X',
      Blockly.PHP.ORDER_NONE) || '0';
  const argument1 = Blockly.PHP.valueToCode(block, 'Y',
      Blockly.PHP.ORDER_NONE) || '0';
  return ['atan2(' + argument1 + ', ' + argument0 + ') / pi() * 180',
      Blockly.PHP.ORDER_DIVISION];
};
