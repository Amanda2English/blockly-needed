// Do not edit this file; automatically generated by build.py.
'use strict';


// Copyright 2015 Google Inc.  Apache License 2.0
Blockly.PHP=new Blockly.Generator("PHP");Blockly.PHP.addReservedWords("__halt_compiler,abstract,and,array,as,break,callable,case,catch,class,clone,const,continue,declare,default,die,do,echo,else,elseif,empty,enddeclare,endfor,endforeach,endif,endswitch,endwhile,eval,exit,extends,final,for,foreach,function,global,goto,if,implements,include,include_once,instanceof,insteadof,interface,isset,list,namespace,new,or,print,private,protected,public,require,require_once,return,static,switch,throw,trait,try,unset,use,var,while,xor,PHP_VERSION,PHP_MAJOR_VERSION,PHP_MINOR_VERSION,PHP_RELEASE_VERSION,PHP_VERSION_ID,PHP_EXTRA_VERSION,PHP_ZTS,PHP_DEBUG,PHP_MAXPATHLEN,PHP_OS,PHP_SAPI,PHP_EOL,PHP_INT_MAX,PHP_INT_SIZE,DEFAULT_INCLUDE_PATH,PEAR_INSTALL_DIR,PEAR_EXTENSION_DIR,PHP_EXTENSION_DIR,PHP_PREFIX,PHP_BINDIR,PHP_BINARY,PHP_MANDIR,PHP_LIBDIR,PHP_DATADIR,PHP_SYSCONFDIR,PHP_LOCALSTATEDIR,PHP_CONFIG_FILE_PATH,PHP_CONFIG_FILE_SCAN_DIR,PHP_SHLIB_SUFFIX,E_ERROR,E_WARNING,E_PARSE,E_NOTICE,E_CORE_ERROR,E_CORE_WARNING,E_COMPILE_ERROR,E_COMPILE_WARNING,E_USER_ERROR,E_USER_WARNING,E_USER_NOTICE,E_DEPRECATED,E_USER_DEPRECATED,E_ALL,E_STRICT,__COMPILER_HALT_OFFSET__,TRUE,FALSE,NULL,__CLASS__,__DIR__,__FILE__,__FUNCTION__,__LINE__,__METHOD__,__NAMESPACE__,__TRAIT__");
Blockly.PHP.ORDER_ATOMIC=0;Blockly.PHP.ORDER_CLONE=1;Blockly.PHP.ORDER_NEW=1;Blockly.PHP.ORDER_MEMBER=2;Blockly.PHP.ORDER_FUNCTION_CALL=2;Blockly.PHP.ORDER_INCREMENT=3;Blockly.PHP.ORDER_DECREMENT=3;Blockly.PHP.ORDER_LOGICAL_NOT=4;Blockly.PHP.ORDER_BITWISE_NOT=4;Blockly.PHP.ORDER_UNARY_PLUS=4;Blockly.PHP.ORDER_UNARY_NEGATION=4;Blockly.PHP.ORDER_MULTIPLICATION=5;Blockly.PHP.ORDER_DIVISION=5;Blockly.PHP.ORDER_MODULUS=5;Blockly.PHP.ORDER_ADDITION=6;Blockly.PHP.ORDER_SUBTRACTION=6;
Blockly.PHP.ORDER_BITWISE_SHIFT=7;Blockly.PHP.ORDER_RELATIONAL=8;Blockly.PHP.ORDER_IN=8;Blockly.PHP.ORDER_INSTANCEOF=8;Blockly.PHP.ORDER_EQUALITY=9;Blockly.PHP.ORDER_BITWISE_AND=10;Blockly.PHP.ORDER_BITWISE_XOR=11;Blockly.PHP.ORDER_BITWISE_OR=12;Blockly.PHP.ORDER_CONDITIONAL=13;Blockly.PHP.ORDER_ASSIGNMENT=14;Blockly.PHP.ORDER_LOGICAL_AND=15;Blockly.PHP.ORDER_LOGICAL_OR=16;Blockly.PHP.ORDER_COMMA=17;Blockly.PHP.ORDER_NONE=99;
Blockly.PHP.init=function(a){Blockly.PHP.definitions_=Object.create(null);Blockly.PHP.functionNames_=Object.create(null);Blockly.PHP.variableDB_?Blockly.PHP.variableDB_.reset():Blockly.PHP.variableDB_=new Blockly.Names(Blockly.PHP.RESERVED_WORDS_,"$");var b=[];a=Blockly.Variables.allVariables(a);for(var c=0;c<a.length;c++)b[c]=Blockly.PHP.variableDB_.getName(a[c],Blockly.Variables.NAME_TYPE)+";";Blockly.PHP.definitions_.variables=b.join("\n")};
Blockly.PHP.finish=function(a){var b=[],c;for(c in Blockly.PHP.definitions_)b.push(Blockly.PHP.definitions_[c]);delete Blockly.PHP.definitions_;delete Blockly.PHP.functionNames_;Blockly.PHP.variableDB_.reset();return b.join("\n\n")+"\n\n\n"+a};Blockly.PHP.scrubNakedValue=function(a){return a+";\n"};Blockly.PHP.quote_=function(a){a=a.replace(/\\/g,"\\\\").replace(/\n/g,"\\\n").replace(/'/g,"\\'");return"'"+a+"'"};
Blockly.PHP.scrub_=function(a,b){var c="";if(!a.outputConnection||!a.outputConnection.targetConnection){var d=a.getCommentText();d&&(c+=Blockly.PHP.prefixLines(d,"// ")+"\n");for(var e=0;e<a.inputList.length;e++)a.inputList[e].type==Blockly.INPUT_VALUE&&(d=a.inputList[e].connection.targetBlock())&&(d=Blockly.PHP.allNestedComments(d))&&(c+=Blockly.PHP.prefixLines(d,"// "))}e=a.nextConnection&&a.nextConnection.targetBlock();e=Blockly.PHP.blockToCode(e);return c+b+e};Blockly.PHP.loops={};
Blockly.PHP.controls_repeat_ext=function(a){var b=a.getField("TIMES")?String(Number(a.getFieldValue("TIMES"))):Blockly.PHP.valueToCode(a,"TIMES",Blockly.PHP.ORDER_ASSIGNMENT)||"0",c=Blockly.PHP.statementToCode(a,"DO"),c=Blockly.PHP.addLoopTrap(c,a.id);a="";var d=Blockly.PHP.variableDB_.getDistinctName("count",Blockly.Variables.NAME_TYPE),e=b;b.match(/^\w+$/)||Blockly.isNumber(b)||(e=Blockly.PHP.variableDB_.getDistinctName("repeat_end",Blockly.Variables.NAME_TYPE),a+=e+" = "+b+";\n");return a+("for ("+
d+" = 0; "+d+" < "+e+"; "+d+"++) {\n"+c+"}\n")};Blockly.PHP.controls_repeat=Blockly.PHP.controls_repeat_ext;Blockly.PHP.controls_whileUntil=function(a){var b="UNTIL"==a.getFieldValue("MODE"),c=Blockly.PHP.valueToCode(a,"BOOL",b?Blockly.PHP.ORDER_LOGICAL_NOT:Blockly.PHP.ORDER_NONE)||"false",d=Blockly.PHP.statementToCode(a,"DO"),d=Blockly.PHP.addLoopTrap(d,a.id);b&&(c="!"+c);return"while ("+c+") {\n"+d+"}\n"};
Blockly.PHP.controls_for=function(a){var b=Blockly.PHP.variableDB_.getName(a.getFieldValue("VAR"),Blockly.Variables.NAME_TYPE),c=Blockly.PHP.valueToCode(a,"FROM",Blockly.PHP.ORDER_ASSIGNMENT)||"0",d=Blockly.PHP.valueToCode(a,"TO",Blockly.PHP.ORDER_ASSIGNMENT)||"0",e=Blockly.PHP.valueToCode(a,"BY",Blockly.PHP.ORDER_ASSIGNMENT)||"1",g=Blockly.PHP.statementToCode(a,"DO"),g=Blockly.PHP.addLoopTrap(g,a.id);if(Blockly.isNumber(c)&&Blockly.isNumber(d)&&Blockly.isNumber(e)){var f=parseFloat(c)<=parseFloat(d);
a="for ("+b+" = "+c+"; "+b+(f?" <= ":" >= ")+d+"; "+b;b=Math.abs(parseFloat(e));a=(1==b?a+(f?"++":"--"):a+((f?" += ":" -= ")+b))+(") {\n"+g+"}\n")}else a="",f=c,c.match(/^\w+$/)||Blockly.isNumber(c)||(f=Blockly.PHP.variableDB_.getDistinctName(b+"_start",Blockly.Variables.NAME_TYPE),a+=f+" = "+c+";\n"),c=d,d.match(/^\w+$/)||Blockly.isNumber(d)||(c=Blockly.PHP.variableDB_.getDistinctName(b+"_end",Blockly.Variables.NAME_TYPE),a+=c+" = "+d+";\n"),d=Blockly.PHP.variableDB_.getDistinctName(b+"_inc",Blockly.Variables.NAME_TYPE),
a+=d+" = ",a=Blockly.isNumber(e)?a+(Math.abs(e)+";\n"):a+("abs("+e+");\n"),a+="if ("+f+" > "+c+") {\n",a+=Blockly.PHP.INDENT+d+" = -"+d+";\n",a+="}\n",a+="for ("+b+" = "+f+";\n     "+d+" >= 0 ? "+b+" <= "+c+" : "+b+" >= "+c+";\n     "+b+" += "+d+") {\n"+g+"}\n";return a};
Blockly.PHP.controls_forEach=function(a){var b=Blockly.PHP.variableDB_.getName(a.getFieldValue("VAR"),Blockly.Variables.NAME_TYPE),c=Blockly.PHP.valueToCode(a,"LIST",Blockly.PHP.ORDER_ASSIGNMENT)||"[]",d=Blockly.PHP.statementToCode(a,"DO"),d=Blockly.PHP.addLoopTrap(d,a.id);return""+("foreach ("+c+" as "+b+") {\n"+d+"}\n")};
Blockly.PHP.controls_flow_statements=function(a){switch(a.getFieldValue("FLOW")){case "BREAK":return"break;\n";case "CONTINUE":return"continue;\n"}throw"Unknown flow statement.";};Blockly.PHP.texts={};Blockly.PHP.text=function(a){return[Blockly.PHP.quote_(a.getFieldValue("TEXT")),Blockly.PHP.ORDER_ATOMIC]};
Blockly.PHP.text_join=function(a){var b;if(0==a.itemCount_)return["''",Blockly.PHP.ORDER_ATOMIC];if(1==a.itemCount_)return b=Blockly.PHP.valueToCode(a,"ADD0",Blockly.PHP.ORDER_NONE)||"''",[b,Blockly.PHP.ORDER_FUNCTION_CALL];if(2==a.itemCount_)return b=Blockly.PHP.valueToCode(a,"ADD0",Blockly.PHP.ORDER_NONE)||"''",a=Blockly.PHP.valueToCode(a,"ADD1",Blockly.PHP.ORDER_NONE)||"''",[b+" . "+a,Blockly.PHP.ORDER_ADDITION];b=Array(a.itemCount_);for(var c=0;c<a.itemCount_;c++)b[c]=Blockly.PHP.valueToCode(a,
"ADD"+c,Blockly.PHP.ORDER_COMMA)||"''";b="implode('', array("+b.join(",")+"))";return[b,Blockly.PHP.ORDER_FUNCTION_CALL]};Blockly.PHP.text_append=function(a){var b=Blockly.PHP.variableDB_.getName(a.getFieldValue("VAR"),Blockly.Variables.NAME_TYPE);a=Blockly.PHP.valueToCode(a,"TEXT",Blockly.PHP.ORDER_NONE)||"''";return b+" .= "+a+";\n"};
Blockly.PHP.text_length=function(a){var b=Blockly.PHP.provideFunction_("length",["function "+Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_+"($value) {","  if (is_string($value)) {","    return strlen($value);","  } else {","    return count($value);","  }","}"]);a=Blockly.PHP.valueToCode(a,"VALUE",Blockly.PHP.ORDER_FUNCTION_CALL)||"''";return[b+"("+a+")",Blockly.PHP.ORDER_FUNCTION_CALL]};
Blockly.PHP.text_isEmpty=function(a){return["empty("+(Blockly.PHP.valueToCode(a,"VALUE",Blockly.PHP.ORDER_FUNCTION_CALL)||"''")+")",Blockly.PHP.ORDER_FUNCTION_CALL]};
Blockly.PHP.text_indexOf=function(a){var b="FIRST"==a.getFieldValue("END")?"strpos":"strrpos",c=Blockly.PHP.valueToCode(a,"FIND",Blockly.PHP.ORDER_FUNCTION_CALL)||"''",d=Blockly.PHP.valueToCode(a,"VALUE",Blockly.PHP.ORDER_FUNCTION_CALL)||"''",e=b+"("+d+", "+c+") + 1",e=Blockly.PHP.provideFunction_("FIRST"==a.getFieldValue("END")?"text_indexOf":"text_lastIndexOf",["function "+Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_+"($text, $search) {","  $pos = "+b+"($text, $search);","  return $pos === false ? 0 : $pos + 1;",
"}"])+"("+d+", "+c+")";return[e,Blockly.PHP.ORDER_FUNCTION_CALL]};
Blockly.PHP.text_charAt=function(a){var b=a.getFieldValue("WHERE")||"FROM_START",c=Blockly.PHP.valueToCode(a,"AT",Blockly.PHP.ORDER_FUNCTION_CALL)||"0";a=Blockly.PHP.valueToCode(a,"VALUE",Blockly.PHP.ORDER_FUNCTION_CALL)||"''";switch(b){case "FIRST":return[a+"[0]",Blockly.PHP.ORDER_FUNCTION_CALL];case "LAST":return["substr("+a+", -1, 1)",Blockly.PHP.ORDER_FUNCTION_CALL];case "FROM_START":return c=Blockly.isNumber(c)?parseFloat(c)-1:c+" - 1",["substr("+a+", "+c+", 1)",Blockly.PHP.ORDER_FUNCTION_CALL];
case "FROM_END":return["substr("+a+", -"+c+", 1)",Blockly.PHP.ORDER_FUNCTION_CALL];case "RANDOM":return b=Blockly.PHP.provideFunction_("text_random_letter",["function "+Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_+"($text) {","  return $text[rand(0, strlen($text) - 1)];","}"])+"("+a+")",[b,Blockly.PHP.ORDER_FUNCTION_CALL]}throw"Unhandled option (text_charAt).";};
Blockly.PHP.text_getSubstring=function(a){var b=Blockly.PHP.valueToCode(a,"STRING",Blockly.PHP.ORDER_FUNCTION_CALL)||"''",c=a.getFieldValue("WHERE1"),d=a.getFieldValue("WHERE2"),e=Blockly.PHP.valueToCode(a,"AT1",Blockly.PHP.ORDER_FUNCTION_CALL)||"0";a=Blockly.PHP.valueToCode(a,"AT2",Blockly.PHP.ORDER_FUNCTION_CALL)||"0";return["FIRST"==c&&"LAST"==d?b:Blockly.PHP.provideFunction_("text_get_substring",["function "+Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_+"($text, $where1, $at1, $where2, $at2) {","    if ($where2 == 'FROM_START') {",
"      $at2--;","    } else if ($where2 == 'FROM_END') {","      $at2 = $at2 - $at1;","    } else if ($where2 == 'FIRST') {","      $at2 = 0;","    } else if ($where2 == 'LAST') {","      $at2 = strlen($text);","    } else { $at2 = 0; }","    if ($where1 == 'FROM_START') {","      $at1--;","    } else if ($where1 == 'FROM_END') {","      $at1 = strlen($text) - $at1;","    } else if ($where1 == 'FIRST') {","      $at1 = 0;","    } else if ($where1 == 'LAST') {","      $at1 = strlen($text) - 1;","    } else { $at1 = 0; }",
"  return substr($text, $at1, $at2);","}"])+"("+b+", '"+c+"', "+e+", '"+d+"', "+a+")",Blockly.PHP.ORDER_FUNCTION_CALL]};
Blockly.PHP.text_changeCase=function(a){var b;"UPPERCASE"==a.getFieldValue("CASE")?(a=Blockly.PHP.valueToCode(a,"TEXT",Blockly.PHP.ORDER_FUNCTION_CALL)||"''",b="strtoupper("+a+")"):"LOWERCASE"==a.getFieldValue("CASE")?(a=Blockly.PHP.valueToCode(a,"TEXT",Blockly.PHP.ORDER_FUNCTION_CALL)||"''",b="strtolower("+a+")"):"TITLECASE"==a.getFieldValue("CASE")&&(a=Blockly.PHP.valueToCode(a,"TEXT",Blockly.PHP.ORDER_FUNCTION_CALL)||"''",b="ucwords(strtolower("+a+"))");return[b,Blockly.PHP.ORDER_FUNCTION_CALL]};
Blockly.PHP.text_trim=function(a){var b={LEFT:"ltrim",RIGHT:"rtrim",BOTH:"trim"}[a.getFieldValue("MODE")];a=Blockly.PHP.valueToCode(a,"TEXT",Blockly.PHP.ORDER_NONE)||"''";return[b+"("+a+")",Blockly.PHP.ORDER_FUNCTION_CALL]};Blockly.PHP.text_print=function(a){return"print("+(Blockly.PHP.valueToCode(a,"TEXT",Blockly.PHP.ORDER_NONE)||"''")+");\n"};
Blockly.PHP.text_prompt_ext=function(a){var b="readline("+(a.getField("TEXT")?Blockly.PHP.quote_(a.getFieldValue("TEXT")):Blockly.PHP.valueToCode(a,"TEXT",Blockly.PHP.ORDER_NONE)||"''")+")";"NUMBER"==a.getFieldValue("TYPE")&&(b="floatval("+b+")");return[b,Blockly.PHP.ORDER_FUNCTION_CALL]};Blockly.PHP.text_prompt=Blockly.PHP.text_prompt_ext;Blockly.PHP.procedures={};
Blockly.PHP.procedures_defreturn=function(a){for(var b=Blockly.Variables.allVariables(a),c=b.length-1;0<=c;c--){var d=b[c];-1==a.arguments_.indexOf(d)?b[c]=Blockly.PHP.variableDB_.getName(d,Blockly.Variables.NAME_TYPE):b.splice(c,1)}b=b.length?"  global "+b.join(", ")+";\n":"";c=Blockly.PHP.variableDB_.getName(a.getFieldValue("NAME"),Blockly.Procedures.NAME_TYPE);d=Blockly.PHP.statementToCode(a,"STACK");Blockly.PHP.STATEMENT_PREFIX&&(d=Blockly.PHP.prefixLines(Blockly.PHP.STATEMENT_PREFIX.replace(/%1/g,"'"+
a.id+"'"),Blockly.PHP.INDENT)+d);Blockly.PHP.INFINITE_LOOP_TRAP&&(d=Blockly.PHP.INFINITE_LOOP_TRAP.replace(/%1/g,"'"+a.id+"'")+d);var e=Blockly.PHP.valueToCode(a,"RETURN",Blockly.PHP.ORDER_NONE)||"";e&&(e="  return "+e+";\n");for(var g=[],f=0;f<a.arguments_.length;f++)g[f]=Blockly.PHP.variableDB_.getName(a.arguments_[f],Blockly.Variables.NAME_TYPE);b="function "+c+"("+g.join(", ")+") {\n"+b+d+e+"}";b=Blockly.PHP.scrub_(a,b);Blockly.PHP.definitions_[c]=b;return null};
Blockly.PHP.procedures_defnoreturn=Blockly.PHP.procedures_defreturn;Blockly.PHP.procedures_callreturn=function(a){for(var b=Blockly.PHP.variableDB_.getName(a.getFieldValue("NAME"),Blockly.Procedures.NAME_TYPE),c=[],d=0;d<a.arguments_.length;d++)c[d]=Blockly.PHP.valueToCode(a,"ARG"+d,Blockly.PHP.ORDER_COMMA)||"null";return[b+"("+c.join(", ")+")",Blockly.PHP.ORDER_FUNCTION_CALL]};
Blockly.PHP.procedures_callnoreturn=function(a){for(var b=Blockly.PHP.variableDB_.getName(a.getFieldValue("NAME"),Blockly.Procedures.NAME_TYPE),c=[],d=0;d<a.arguments_.length;d++)c[d]=Blockly.PHP.valueToCode(a,"ARG"+d,Blockly.PHP.ORDER_COMMA)||"null";return b+"("+c.join(", ")+");\n"};
Blockly.PHP.procedures_ifreturn=function(a){var b="if ("+(Blockly.PHP.valueToCode(a,"CONDITION",Blockly.PHP.ORDER_NONE)||"false")+") {\n";a.hasReturnValue_?(a=Blockly.PHP.valueToCode(a,"VALUE",Blockly.PHP.ORDER_NONE)||"null",b+="  return "+a+";\n"):b+="  return;\n";return b+"}\n"};Blockly.PHP.colour={};Blockly.PHP.colour_picker=function(a){return["'"+a.getFieldValue("COLOUR")+"'",Blockly.PHP.ORDER_ATOMIC]};Blockly.PHP.colour_random=function(a){return[Blockly.PHP.provideFunction_("colour_random",["function "+Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_+"() {","  return '#' . str_pad(dechex(mt_rand(0, 0xFFFFFF)), 6, '0', STR_PAD_LEFT);","}"])+"()",Blockly.PHP.ORDER_FUNCTION_CALL]};
Blockly.PHP.colour_rgb=function(a){var b=Blockly.PHP.valueToCode(a,"RED",Blockly.PHP.ORDER_COMMA)||0,c=Blockly.PHP.valueToCode(a,"GREEN",Blockly.PHP.ORDER_COMMA)||0;a=Blockly.PHP.valueToCode(a,"BLUE",Blockly.PHP.ORDER_COMMA)||0;return[Blockly.PHP.provideFunction_("colour_rgb",["function "+Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_+"($r, $g, $b) {","  $r = round(max(min($r, 100), 0) * 2.55);","  $g = round(max(min($g, 100), 0) * 2.55);","  $b = round(max(min($b, 100), 0) * 2.55);",'  $hex = "#";','  $hex .= str_pad(dechex($r), 2, "0", STR_PAD_LEFT);',
'  $hex .= str_pad(dechex($g), 2, "0", STR_PAD_LEFT);','  $hex .= str_pad(dechex($b), 2, "0", STR_PAD_LEFT);',"  return $hex;","}"])+"("+b+", "+c+", "+a+")",Blockly.PHP.ORDER_FUNCTION_CALL]};
Blockly.PHP.colour_blend=function(a){var b=Blockly.PHP.valueToCode(a,"COLOUR1",Blockly.PHP.ORDER_COMMA)||"'#000000'",c=Blockly.PHP.valueToCode(a,"COLOUR2",Blockly.PHP.ORDER_COMMA)||"'#000000'";a=Blockly.PHP.valueToCode(a,"RATIO",Blockly.PHP.ORDER_COMMA)||.5;return[Blockly.PHP.provideFunction_("colour_blend",["function "+Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_+"($c1, $c2, $ratio) {","  $ratio = max(min($ratio, 1), 0);","  $r1 = hexdec(substr($c1, 1, 2));","  $g1 = hexdec(substr($c1, 3, 2));","  $b1 = hexdec(substr($c1, 5, 2));",
"  $r2 = hexdec(substr($c2, 1, 2));","  $g2 = hexdec(substr($c2, 3, 2));","  $b2 = hexdec(substr($c2, 5, 2));","  $r = round($r1 * (1 - $ratio) + $r2 * $ratio);","  $g = round($g1 * (1 - $ratio) + $g2 * $ratio);","  $b = round($b1 * (1 - $ratio) + $b2 * $ratio);",'  $hex = "#";','  $hex .= str_pad(dechex($r), 2, "0", STR_PAD_LEFT);','  $hex .= str_pad(dechex($g), 2, "0", STR_PAD_LEFT);','  $hex .= str_pad(dechex($b), 2, "0", STR_PAD_LEFT);',"  return $hex;","}"])+"("+b+", "+c+", "+a+")",Blockly.PHP.ORDER_FUNCTION_CALL]};Blockly.PHP.variables={};Blockly.PHP.variables_get=function(a){return[Blockly.PHP.variableDB_.getName(a.getFieldValue("VAR"),Blockly.Variables.NAME_TYPE),Blockly.PHP.ORDER_ATOMIC]};Blockly.PHP.variables_set=function(a){var b=Blockly.PHP.valueToCode(a,"VALUE",Blockly.PHP.ORDER_ASSIGNMENT)||"0";return Blockly.PHP.variableDB_.getName(a.getFieldValue("VAR"),Blockly.Variables.NAME_TYPE)+" = "+b+";\n"};Blockly.PHP.math={};Blockly.PHP.math_number=function(a){a=parseFloat(a.getFieldValue("NUM"));Infinity==a?a="INF":-Infinity==a&&(a="-INF");return[a,Blockly.PHP.ORDER_ATOMIC]};
Blockly.PHP.math_arithmetic=function(a){var b={ADD:[" + ",Blockly.PHP.ORDER_ADDITION],MINUS:[" - ",Blockly.PHP.ORDER_SUBTRACTION],MULTIPLY:[" * ",Blockly.PHP.ORDER_MULTIPLICATION],DIVIDE:[" / ",Blockly.PHP.ORDER_DIVISION],POWER:[null,Blockly.PHP.ORDER_COMMA]}[a.getFieldValue("OP")],c=b[0],b=b[1],d=Blockly.PHP.valueToCode(a,"A",b)||"0";a=Blockly.PHP.valueToCode(a,"B",b)||"0";return c?[d+c+a,b]:["pow("+d+", "+a+")",Blockly.PHP.ORDER_FUNCTION_CALL]};
Blockly.PHP.math_single=function(a){var b=a.getFieldValue("OP"),c;if("NEG"==b)return a=Blockly.PHP.valueToCode(a,"NUM",Blockly.PHP.ORDER_UNARY_NEGATION)||"0","-"==a[0]&&(a=" "+a),["-"+a,Blockly.PHP.ORDER_UNARY_NEGATION];a="SIN"==b||"COS"==b||"TAN"==b?Blockly.PHP.valueToCode(a,"NUM",Blockly.PHP.ORDER_DIVISION)||"0":Blockly.PHP.valueToCode(a,"NUM",Blockly.PHP.ORDER_NONE)||"0";switch(b){case "ABS":c="abs("+a+")";break;case "ROOT":c="sqrt("+a+")";break;case "LN":c="log("+a+")";break;case "EXP":c="exp("+
a+")";break;case "POW10":c="pow(10,"+a+")";break;case "ROUND":c="round("+a+")";break;case "ROUNDUP":c="ceil("+a+")";break;case "ROUNDDOWN":c="floor("+a+")";break;case "SIN":c="sin("+a+" / 180 * pi())";break;case "COS":c="cos("+a+" / 180 * pi())";break;case "TAN":c="tan("+a+" / 180 * pi())"}if(c)return[c,Blockly.PHP.ORDER_FUNCTION_CALL];switch(b){case "LOG10":c="log("+a+") / log(10)";break;case "ASIN":c="asin("+a+") / pi() * 180";break;case "ACOS":c="acos("+a+") / pi() * 180";break;case "ATAN":c="atan("+
a+") / pi() * 180";break;default:throw"Unknown math operator: "+b;}return[c,Blockly.PHP.ORDER_DIVISION]};Blockly.PHP.math_constant=function(a){return{PI:["M_PI",Blockly.PHP.ORDER_ATOMIC],E:["M_E",Blockly.PHP.ORDER_ATOMIC],GOLDEN_RATIO:["(1 + sqrt(5)) / 2",Blockly.PHP.ORDER_DIVISION],SQRT2:["M_SQRT2",Blockly.PHP.ORDER_ATOMIC],SQRT1_2:["M_SQRT1_2",Blockly.PHP.ORDER_ATOMIC],INFINITY:["INF",Blockly.PHP.ORDER_ATOMIC]}[a.getFieldValue("CONSTANT")]};
Blockly.PHP.math_number_property=function(a){var b=Blockly.PHP.valueToCode(a,"NUMBER_TO_CHECK",Blockly.PHP.ORDER_MODULUS)||"0",c=a.getFieldValue("PROPERTY"),d;if("PRIME"==c)return d=Blockly.PHP.provideFunction_("math_isPrime",["function "+Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_+"($n) {","  // https://en.wikipedia.org/wiki/Primality_test#Naive_methods","  if ($n == 2 || $n == 3) {","    return true;","  }","  // False if n is NaN, negative, is 1, or not whole.","  // And false if n is divisible by 2 or 3.",
"  if (!is_numeric($n) || $n <= 1 || $n % 1 != 0 || $n % 2 == 0 || $n % 3 == 0) {","    return false;","  }","  // Check all the numbers of form 6k +/- 1, up to sqrt(n).","  for ($x = 6; $x <= sqrt($n) + 1; $x += 6) {","    if ($n % ($x - 1) == 0 || $n % ($x + 1) == 0) {","      return false;","    }","  }","  return true;","}"])+"("+b+")",[d,Blockly.JavaScript.ORDER_FUNCTION_CALL];switch(c){case "EVEN":d=b+" % 2 == 0";break;case "ODD":d=b+" % 2 == 1";break;case "WHOLE":d="is_int("+b+")";break;case "POSITIVE":d=
b+" > 0";break;case "NEGATIVE":d=b+" < 0";break;case "DIVISIBLE_BY":a=Blockly.PHP.valueToCode(a,"DIVISOR",Blockly.PHP.ORDER_MODULUS)||"0",d=b+" % "+a+" == 0"}return[d,Blockly.PHP.ORDER_EQUALITY]};Blockly.PHP.math_change=function(a){var b=Blockly.PHP.valueToCode(a,"DELTA",Blockly.PHP.ORDER_ADDITION)||"0";return Blockly.PHP.variableDB_.getName(a.getFieldValue("VAR"),Blockly.Variables.NAME_TYPE)+" += "+b+";\n"};Blockly.PHP.math_round=Blockly.PHP.math_single;Blockly.PHP.math_trig=Blockly.PHP.math_single;
Blockly.PHP.math_on_list=function(a){var b=a.getFieldValue("OP");switch(b){case "SUM":a=Blockly.PHP.valueToCode(a,"LIST",Blockly.PHP.ORDER_FUNCTION_CALL)||"array()";a="array_sum("+a+")";break;case "MIN":a=Blockly.PHP.valueToCode(a,"LIST",Blockly.PHP.ORDER_FUNCTION_CALL)||"array()";a="min("+a+")";break;case "MAX":a=Blockly.PHP.valueToCode(a,"LIST",Blockly.PHP.ORDER_FUNCTION_CALL)||"array()";a="max("+a+")";break;case "AVERAGE":b=Blockly.PHP.provideFunction_("math_mean",["function "+Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_+
"($myList) {","  return array_sum($myList) / count($myList);","}"]);a=Blockly.PHP.valueToCode(a,"LIST",Blockly.PHP.ORDER_NONE)||"array()";a=b+"("+a+")";break;case "MEDIAN":b=Blockly.PHP.provideFunction_("math_median",["function "+Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_+"($arr) {","  sort($arr,SORT_NUMERIC);","  return (count($arr) % 2) ? $arr[floor(count($arr)/2)] : ","      ($arr[floor(count($arr)/2)] + $arr[floor(count($arr)/2) - 1]) / 2;","}"]);a=Blockly.PHP.valueToCode(a,"LIST",Blockly.PHP.ORDER_NONE)||
"[]";a=b+"("+a+")";break;case "MODE":b=Blockly.PHP.provideFunction_("math_modes",["function "+Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_+"($values) {","  $v = array_count_values($values);","  arsort($v);","  foreach($v as $k => $v){$total = $k; break;}","  return array($total);","}"]);a=Blockly.PHP.valueToCode(a,"LIST",Blockly.PHP.ORDER_NONE)||"[]";a=b+"("+a+")";break;case "STD_DEV":b=Blockly.PHP.provideFunction_("math_standard_deviation",["function "+Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_+"($numbers) {",
"  $n = count($numbers);","  if (!$n) return null;","  $mean = array_sum($numbers) / count($numbers);","  foreach($numbers as $key => $num) $devs[$key] = pow($num - $mean, 2);","  return sqrt(array_sum($devs) / (count($devs) - 1));","}"]);a=Blockly.PHP.valueToCode(a,"LIST",Blockly.PHP.ORDER_NONE)||"[]";a=b+"("+a+")";break;case "RANDOM":b=Blockly.PHP.provideFunction_("math_random_list",["function "+Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_+"($list) {","  $x = rand(0, count($list)-1);","  return $list[$x];",
"}"]);a=Blockly.PHP.valueToCode(a,"LIST",Blockly.PHP.ORDER_NONE)||"[]";a=b+"("+a+")";break;default:throw"Unknown operator: "+b;}return[a,Blockly.PHP.ORDER_FUNCTION_CALL]};Blockly.PHP.math_modulo=function(a){var b=Blockly.PHP.valueToCode(a,"DIVIDEND",Blockly.PHP.ORDER_MODULUS)||"0";a=Blockly.PHP.valueToCode(a,"DIVISOR",Blockly.PHP.ORDER_MODULUS)||"0";return[b+" % "+a,Blockly.PHP.ORDER_MODULUS]};
Blockly.PHP.math_constrain=function(a){var b=Blockly.PHP.valueToCode(a,"VALUE",Blockly.PHP.ORDER_COMMA)||"0",c=Blockly.PHP.valueToCode(a,"LOW",Blockly.PHP.ORDER_COMMA)||"0";a=Blockly.PHP.valueToCode(a,"HIGH",Blockly.PHP.ORDER_COMMA)||"Infinity";return["min(max("+b+", "+c+"), "+a+")",Blockly.PHP.ORDER_FUNCTION_CALL]};
Blockly.PHP.math_random_int=function(a){var b=Blockly.PHP.valueToCode(a,"FROM",Blockly.PHP.ORDER_COMMA)||"0";a=Blockly.PHP.valueToCode(a,"TO",Blockly.PHP.ORDER_COMMA)||"0";return[Blockly.PHP.provideFunction_("math_random_int",["function "+Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_+"($a, $b) {","  if ($a > $b) {","    return rand($b, $a);","  }","  return rand($a, $b);","}"])+"("+b+", "+a+")",Blockly.PHP.ORDER_FUNCTION_CALL]};
Blockly.PHP.math_random_float=function(a){return["(float)rand()/(float)getrandmax()",Blockly.PHP.ORDER_FUNCTION_CALL]};Blockly.PHP.logic={};Blockly.PHP.controls_if=function(a){for(var b=0,c=Blockly.PHP.valueToCode(a,"IF"+b,Blockly.PHP.ORDER_NONE)||"false",d=Blockly.PHP.statementToCode(a,"DO"+b),e="if ("+c+") {\n"+d+"}",b=1;b<=a.elseifCount_;b++)c=Blockly.PHP.valueToCode(a,"IF"+b,Blockly.PHP.ORDER_NONE)||"false",d=Blockly.PHP.statementToCode(a,"DO"+b),e+=" else if ("+c+") {\n"+d+"}";a.elseCount_&&(d=Blockly.PHP.statementToCode(a,"ELSE"),e+=" else {\n"+d+"}");return e+"\n"};
Blockly.PHP.logic_compare=function(a){var b={EQ:"==",NEQ:"!=",LT:"<",LTE:"<=",GT:">",GTE:">="}[a.getFieldValue("OP")],c="=="==b||"!="==b?Blockly.PHP.ORDER_EQUALITY:Blockly.PHP.ORDER_RELATIONAL,d=Blockly.PHP.valueToCode(a,"A",c)||"0";a=Blockly.PHP.valueToCode(a,"B",c)||"0";return[d+" "+b+" "+a,c]};
Blockly.PHP.logic_operation=function(a){var b="AND"==a.getFieldValue("OP")?"&&":"||",c="&&"==b?Blockly.PHP.ORDER_LOGICAL_AND:Blockly.PHP.ORDER_LOGICAL_OR,d=Blockly.PHP.valueToCode(a,"A",c);a=Blockly.PHP.valueToCode(a,"B",c);if(d||a){var e="&&"==b?"true":"false";d||(d=e);a||(a=e)}else a=d="false";return[d+" "+b+" "+a,c]};Blockly.PHP.logic_negate=function(a){var b=Blockly.PHP.ORDER_LOGICAL_NOT;return["!"+(Blockly.PHP.valueToCode(a,"BOOL",b)||"true"),b]};
Blockly.PHP.logic_boolean=function(a){return["TRUE"==a.getFieldValue("BOOL")?"true":"false",Blockly.PHP.ORDER_ATOMIC]};Blockly.PHP.logic_null=function(a){return["null",Blockly.PHP.ORDER_ATOMIC]};Blockly.PHP.logic_ternary=function(a){var b=Blockly.PHP.valueToCode(a,"IF",Blockly.PHP.ORDER_CONDITIONAL)||"false",c=Blockly.PHP.valueToCode(a,"THEN",Blockly.PHP.ORDER_CONDITIONAL)||"null";a=Blockly.PHP.valueToCode(a,"ELSE",Blockly.PHP.ORDER_CONDITIONAL)||"null";return[b+" ? "+c+" : "+a,Blockly.PHP.ORDER_CONDITIONAL]};Blockly.PHP.lists={};Blockly.PHP.lists_create_empty=function(a){return["array()",Blockly.PHP.ORDER_ATOMIC]};Blockly.PHP.lists_create_with=function(a){for(var b=Array(a.itemCount_),c=0;c<a.itemCount_;c++)b[c]=Blockly.PHP.valueToCode(a,"ADD"+c,Blockly.PHP.ORDER_COMMA)||"null";b="array("+b.join(", ")+")";return[b,Blockly.PHP.ORDER_ATOMIC]};
Blockly.PHP.lists_repeat=function(a){var b=Blockly.PHP.provideFunction_("lists_repeat",["function "+Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_+"($value, $count) {","  $array = array();","  for ($index = 0; $index < $count; $index++) {","    $array[] = $value;","  }","  return $array;","}"]),c=Blockly.PHP.valueToCode(a,"ITEM",Blockly.PHP.ORDER_COMMA)||"null";a=Blockly.PHP.valueToCode(a,"NUM",Blockly.PHP.ORDER_COMMA)||"0";return[b+"("+c+", "+a+")",Blockly.PHP.ORDER_FUNCTION_CALL]};
Blockly.PHP.lists_length=function(a){var b=Blockly.PHP.provideFunction_("length",["function "+Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_+"($value) {","  if (is_string($value)) {","    return strlen($value);","  } else {","    return count($value);","  }","}"]);a=Blockly.PHP.valueToCode(a,"VALUE",Blockly.PHP.ORDER_FUNCTION_CALL)||"''";return[b+"("+a+")",Blockly.PHP.ORDER_FUNCTION_CALL]};
Blockly.PHP.lists_isEmpty=function(a){return["empty("+(Blockly.PHP.valueToCode(a,"VALUE",Blockly.PHP.ORDER_FUNCTION_CALL)||"array()")+")",Blockly.PHP.ORDER_FUNCTION_CALL]};
Blockly.PHP.lists_indexOf=function(a){a.getFieldValue("END");var b=Blockly.PHP.valueToCode(a,"FIND",Blockly.PHP.ORDER_NONE)||"''",c=Blockly.PHP.valueToCode(a,"VALUE",Blockly.PHP.ORDER_MEMBER)||"[]";return[("FIRST"==a.getFieldValue("END")?Blockly.PHP.provideFunction_("indexOf",["function "+Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_+"($haystack, $needle) {","  for ($index = 0; $index < count($haystack); $index++) {","    if ($haystack[$index] == $needle) return $index+1;","  }","  return 0;","}"]):Blockly.PHP.provideFunction_("lastIndexOf",
["function "+Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_+"($haystack, $needle) {","  $last = 0;","  for ($index = 0; $index < count($haystack); $index++) {","    if ($haystack[$index] == $needle) $last = $index+1;","  }","  return $last;","}"]))+"("+c+", "+b+")",Blockly.PHP.ORDER_FUNCTION_CALL]};
Blockly.PHP.lists_getIndex=function(a){var b=a.getFieldValue("MODE")||"GET",c=a.getFieldValue("WHERE")||"FROM_START",d=Blockly.PHP.valueToCode(a,"AT",Blockly.PHP.ORDER_UNARY_NEGATION)||"1";a=Blockly.PHP.valueToCode(a,"VALUE",Blockly.PHP.ORDER_FUNCTION_CALL)||"array()";if("FIRST"==c){if("GET"==b)return[a+"[0]",Blockly.PHP.ORDER_FUNCTION_CALL];if("GET_REMOVE"==b)return["array_shift("+a+")",Blockly.PHP.ORDER_FUNCTION_CALL];if("REMOVE"==b)return"array_shift("+a+");\n"}else if("LAST"==c){if("GET"==b)return["end("+
a+")",Blockly.PHP.ORDER_FUNCTION_CALL];if("GET_REMOVE"==b)return["array_pop("+a+")",Blockly.PHP.ORDER_FUNCTION_CALL];if("REMOVE"==b)return"array_pop("+a+");\n"}else if("FROM_START"==c){d=Blockly.isNumber(d)?parseFloat(d)-1:d+" - 1";if("GET"==b)return[a+"["+d+"]",Blockly.PHP.ORDER_FUNCTION_CALL];if("GET_REMOVE"==b)return["array_splice("+a+", "+d+", 1)[0]",Blockly.PHP.ORDER_FUNCTION_CALL];if("REMOVE"==b)return"array_splice("+a+", "+d+", 1);\n"}else if("FROM_END"==c){if("GET"==b)return["array_slice("+
a+", -"+d+", 1)[0]",Blockly.PHP.ORDER_FUNCTION_CALL];if("GET_REMOVE"==b||"REMOVE"==b){c="array_splice("+a+", count("+a+") - "+d+", 1)[0]";if("GET_REMOVE"==b)return[c,Blockly.PHP.ORDER_FUNCTION_CALL];if("REMOVE"==b)return c+";\n"}}else if("RANDOM"==c){if("GET"==b)return b=Blockly.PHP.provideFunction_("lists_get_random_item",["function "+Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_+"($list) {","  return $list[rand(0,count($list)-1)];","}"]),[b+"("+a+")",Blockly.PHP.ORDER_FUNCTION_CALL];if("GET_REMOVE"==b)return b=
Blockly.PHP.provideFunction_("lists_get_remove_random_item",["function "+Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_+"(&$list) {","  $x = rand(0,count($list)-1);","  unset($list[$x]);","  return array_values($list);","}"]),[b+"("+a+")",Blockly.PHP.ORDER_FUNCTION_CALL];if("REMOVE"==b)return b=Blockly.PHP.provideFunction_("lists_remove_random_item",["function "+Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_+"(&$list) {","  unset($list[rand(0,count($list)-1)]);","}"]),b+"("+a+");\n"}throw"Unhandled combination (lists_getIndex).";
};
Blockly.PHP.lists_setIndex=function(a){var b=Blockly.PHP.valueToCode(a,"LIST",Blockly.PHP.ORDER_MEMBER)||"array()",c=a.getFieldValue("MODE")||"GET",d=a.getFieldValue("WHERE")||"FROM_START",e=Blockly.PHP.valueToCode(a,"AT",Blockly.PHP.ORDER_NONE)||"1";a=Blockly.PHP.valueToCode(a,"TO",Blockly.PHP.ORDER_ASSIGNMENT)||"null";if("FIRST"==d){if("SET"==c)return b+"[0] = "+a+";\n";if("INSERT"==c)return"array_unshift("+b+", "+a+");\n"}else if("LAST"==d){if("SET"==c)return c=Blockly.PHP.provideFunction_("lists_set_last_item",["function "+
Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_+"(&$list, $value) {","  $list[count($list) - 1] = $value;","}"]),c+"("+b+", "+a+");\n";if("INSERT"==c)return"array_push("+b+", "+a+");\n"}else if("FROM_START"==d){e=Blockly.isNumber(e)?parseFloat(e)-1:e+" - 1";if("SET"==c)return b+"["+e+"] = "+a+";\n";if("INSERT"==c)return"array_splice("+b+", "+e+", 0, "+a+");\n"}else if("FROM_END"==d){if("SET"==c)return c=Blockly.PHP.provideFunction_("lists_set_from_end",["function "+Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_+"(&$list, $at, $value) {",
"  $list[count($list) - $at] = $value;","}"]),c+"("+b+", "+e+", "+a+");\n";if("INSERT"==c)return c=Blockly.PHP.provideFunction_("lists_insert_from_end",["function "+Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_+"(&$list, $at, $value) {","  return array_splice($list, count($list) - $at, 0, $value);","}"]),c+"("+b+", "+e+", "+a+");\n"}else if("RANDOM"==d){b.match(/^\w+$/)?e="":(e=Blockly.PHP.variableDB_.getDistinctName("tmp_list",Blockly.Variables.NAME_TYPE),d=e+" = &"+b+";\n",b=e,e=d);d=Blockly.PHP.variableDB_.getDistinctName("tmp_x",
Blockly.Variables.NAME_TYPE);e+=d+" = rand(0, count("+b+")-1);\n";if("SET"==c)return e+(b+"["+d+"] = "+a+";\n");if("INSERT"==c)return e+="array_splice("+b+", "+d+", 0, "+a+");\n"}throw"Unhandled combination (lists_setIndex).";};
Blockly.PHP.lists_getSublist=function(a){var b=Blockly.PHP.valueToCode(a,"LIST",Blockly.PHP.ORDER_MEMBER)||"array()",c=a.getFieldValue("WHERE1"),d=a.getFieldValue("WHERE2"),e=Blockly.PHP.valueToCode(a,"AT1",Blockly.PHP.ORDER_NONE)||"1";a=Blockly.PHP.valueToCode(a,"AT2",Blockly.PHP.ORDER_NONE)||"1";return["FIRST"==c&&"LAST"==d?b:Blockly.PHP.provideFunction_("lists_get_sublist",["function "+Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_+"($list, $where1, $at1, $where2, $at2) {","  if ($where2 == 'FROM_START') {",
"    $at2--;","  } else if ($where2 == 'FROM_END') {","    $at2 = $at2 - $at1;","  } else if ($where2 == 'FIRST') {","    $at2 = 0;","  } else if ($where2 == 'LAST') {","    $at2 = count($list);","  } else {","    throw 'Unhandled option (lists_getSublist).';","  }","  if ($where1 == 'FROM_START') {","    $at1--;","  } else if ($where1 == 'FROM_END') {","    $at1 = count($list) - $at1;","  } else if ($where1 == 'FIRST') {","    $at1 = 0;","  } else if ($where1 == 'LAST') {","    $at1 = count($list) - 1;",
"  } else {","    throw 'Unhandled option (lists_getSublist).';","  }","  return array_slice($list, $at1, $at2);","}"])+"("+b+", '"+c+"', "+e+", '"+d+"', "+a+")",Blockly.PHP.ORDER_FUNCTION_CALL]};
Blockly.PHP.lists_split=function(a){var b=Blockly.PHP.valueToCode(a,"INPUT",Blockly.PHP.ORDER_MEMBER),c=Blockly.PHP.valueToCode(a,"DELIM",Blockly.PHP.ORDER_NONE)||"''";a=a.getFieldValue("MODE");if("SPLIT"==a)b||(b="''"),a="explode";else if("JOIN"==a)b||(b="array()"),a="implode";else throw"Unknown mode: "+a;return[a+"("+c+", "+b+")",Blockly.PHP.ORDER_FUNCTION_CALL]};