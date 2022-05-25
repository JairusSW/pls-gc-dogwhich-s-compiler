"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToIr = void 0;
const scratch_1 = require("../scratch");
const parser_1 = require("../parser");
const Locals = new scratch_1.List("locals");
function ToIr(e) { }
exports.ToIr = ToIr;
class IBinary extends parser_1.BinaryExpression {
    get isPure() {
        return this.left.isPure && this.right.isPure;
    }
}
function r(e) {
    if (e.get()) {
    }
}
class LocalVariable {
    constructor(name) {
        this.name = name;
    }
}
class BlockAllocation {
    constructor(variables, parent) {
        this.variables = [];
        this.variables = variables;
        this.parent = parent;
    }
    getIndexForVar(name) {
        let variable = this.variables.findIndex((r) => r.name == name);
        if (variable != -1) {
            return variable + 1;
        }
        else if (this.parent) {
            return this.parent.getIndexForVar(name) + this.variables.length;
        }
        else {
            throw new Error(`Local variable ${name} not found in scope.`);
        }
    }
    getItem(name) {
        return Locals.getItemAt(new scratch_1.LiteralNumber(this.getIndexForVar(name)));
    }
}
/**
 * let outer = 4;
 * let outer2 =3;
 * if(true){
 * let inner =5;
 * }
 */
let outerScope = new BlockAllocation([
    new LocalVariable("outer"),
    new LocalVariable("outer2"),
]);
let innerScope = new BlockAllocation([new LocalVariable("inner")], outerScope);
console.log(innerScope.getIndexForVar("inner"));
// class ControlSegment {
//   vars: LocalVariable[] = [];
//   alloc(n: number) {}
// }
// namespace IR {
//   class Function {}
// }
// abstract class StackElement {
//   static p = 3;
//   static {}
//   static static: number | typeof StackElement.p = 3;
// }
