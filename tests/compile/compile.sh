echo "Executing compile.sh from $(pwd)"

# Find the Closure Compiler.
if [ -f "$(npm root)/google-closure-compiler/compiler.jar" ]; then
  COMPILER="$(npm root)/google-closure-compiler/compiler.jar"
elif [ -f *compiler*.jar ]; then
  COMPILER="*compiler*.jar"
  # TODO: Check whether multiple files were found.
else
  echo "ERROR: Closure Compiler not found."
  echo "Download from this URL, and place jar file in current directory."
  echo "https://dl.google.com/closure-compiler/compiler-latest.zip"
  exit 1
fi

# TODO: Find relative path to Blockly root. For now, assume it is pwd.
# TODO: Find relative path to closure, possibly in node_modules.

echo Using $COMPILER as the compiler.
rm main_compressed.js 2> /dev/null
echo Compiling Blockly...
COMPILATION_COMMAND="java -jar $COMPILER --js='tests/compile/main.js' \
  --js='core/**.js' \
  --js='blocks/**.js' \
  --js='generators/**.js' \
  --js='msg/js/**.js' \
  --js='../closure-library/closure/goog/**.js' \
  --js='../closure-library/third_party/closure/goog/**.js' \
  --generate_exports \
  --externs externs/svg-externs.js \
  --compilation_level ADVANCED_OPTIMIZATIONS \
  --dependency_mode=STRICT --entry_point=Main \
  --js_output_file 'tests/compile/main_compressed.js'"
echo $COMPILATION_COMMAND
$COMPILATION_COMMAND
if [ -s main_compressed.js ]; then
  echo Compilation OK.
else
  echo Compilation FAIL.
  exit 1
fi
