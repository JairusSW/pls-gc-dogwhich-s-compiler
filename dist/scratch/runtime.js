"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stackItem = exports.drop = exports.push = exports.ListUtilities = exports.Stack = void 0;
const ir_1 = require("./ir");
exports.Stack = new ir_1.List("Stack");
function ListUtilities(Stack) {
    const push = (Value, dropCount = 0) => [
        new ir_1.InsertIntoList(Stack, Value, new ir_1.LiteralNumber(1)),
        ...new Array(dropCount).fill(new ir_1.DeleteOfList(Stack, new ir_1.LiteralNumber(2))),
    ];
    const drop = (dropCount) => [
        ...new Array(dropCount).fill(new ir_1.DeleteOfList(Stack, new ir_1.LiteralNumber(2))),
    ];
    return { push, drop };
}
exports.ListUtilities = ListUtilities;
let lu = ListUtilities(exports.Stack);
const push = lu.push;
exports.push = push;
const drop = lu.drop;
exports.drop = drop;
const stackItem = (e) => exports.Stack.getItemAt(toNumLit(e));
exports.stackItem = stackItem;
// ^ Weird auto indent error here, this comment removes it
const literal = (e) => typeof e == "string" ? new ir_1.LiteralString(e) : new ir_1.LiteralNumber(e);
const toNumLit = (e) => typeof e == "number" ? new ir_1.LiteralNumber(e) : e;
const add = (e, r) => new ir_1.Add(toNumLit(e), toNumLit(r));
const sub = (e, r) => new ir_1.Subtract(toNumLit(e), toNumLit(r));
const mult = (e, r) => new ir_1.Multiply(toNumLit(e), toNumLit(r));
const div = (e, r) => new ir_1.Divide(toNumLit(e), toNumLit(r));
// let re = new Sprite(
//   "spritte1",
//   [],
//   [
//     new WhenFlagClicked([
//       ...push(new LiteralString("None if this was written manually!:")),
//       ...push(literal(20)),
//       ...push(literal(3)),
//       ...push(add(stackItem(1), stackItem(2)), 2),
//       ...push(div(stackItem(1), 10), 1),
//     ]),
//   ],
//   []
// ).Compile();
// // Project.targets[1] = new Sprite("Sprite1").Compile();
// console.log(re);
// // console.log(Project.targets[1]);
// Project.targets[1] = re;
// //@ts-ignore
// Project.monitors = [];
// console.log("HERE");
// saveProject(JSON.stringify(Project));
