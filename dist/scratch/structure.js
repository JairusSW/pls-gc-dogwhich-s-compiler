"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sensing = exports.operator = exports.isStage = void 0;
function isStage(t) {
    return "isStage" in t && t.isStage;
}
exports.isStage = isStage;
var operator;
(function (operator) {
    operator.mathops = [
        "abs",
        "floor",
        "ceiling",
        "sqrt",
        "sin",
        "cos",
        "tan",
        "asin",
        "acos",
        "atan",
        "ln",
        "log",
    ];
    // export type operator_equals = {
    //   opcode: "operator_equals";
    //   next: null;
    //   parent: string | null;
    //   inputs: {
    //     OPERAND1: input;
    //     OPERAND2: input;
    //   };
    //   fields: {};
    //   shadow: false;
    //   topLevel: false;
    // };
})(operator = exports.operator || (exports.operator = {}));
var sensing;
(function (sensing) {
    sensing.keyOption = [
        "space",
        "up arrow",
        "down arrow",
        "left arrow",
        "right arrow",
        "any",
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "a",
        "b",
        "c",
        "d",
        "e",
        "f",
        "g",
        "h",
        "i",
        "j",
        "k",
        "l",
        "m",
        "n",
        "o",
        "p",
        "q",
        "r",
        "s",
        "t",
        "u",
        "v",
        "w",
        "x",
        "y",
        "z",
    ];
})(sensing = exports.sensing || (exports.sensing = {}));
const varnamesIwant = ["hello", "prewritten", "code"];
let e = new String("r");
