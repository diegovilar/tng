/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/typescript/typescript.d.ts" />

var ts = require("typescript");
var gutil = require('gulp-util');

function compile(fileNames, options) {

    var program = ts.createProgram(fileNames, options);
    var emitResult = program.emit();
    var allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

    allDiagnostics.forEach(function (diagnostic) {
        var _a = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start), line = _a.line, character = _a.character;
        var message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
        gutil.log(diagnostic.file.fileName + " (" + (line + 1) + "," + (character + 1) + "): " + message);
    });

    var exitCode = emitResult.emitSkipped ? 1 : 0;
    //if (exitCode) {
    //    gutil.log(`Process exiting with code '${exitCode}'.`);
    //}
    return exitCode;
}

exports.compile = compile;