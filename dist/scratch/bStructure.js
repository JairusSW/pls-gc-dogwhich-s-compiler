"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const IR_1 = require("./IR");
const loader_1 = require("./loader");
const zipping_1 = require("./zipping");
/**
 * Functon to take value of type inputShadow or Reporter and return the correct input.
 */
function sToInput(f, id) {
    if ("id" in f) {
        f.reporter.parent = id;
        return [2, f.id];
    }
    else {
        return [1, f];
    }
}
/** Function to compile a list of Blocks */
function compileBlocks(blocks, id, s) {
    if (blocks.length == 0)
        return null;
    let first = blocks[0].Compile(s);
    first.block.parent = id;
    let prev = first;
    for (const r of blocks.slice(1)) {
        let m = r.Compile(s);
        prev.block.next = m.id;
        m.block.parent = prev.id;
        prev = m;
    }
    return first.id;
}
class LiteralString {
    constructor(value) {
        this.value = value;
    }
    Compile() {
        return [10, this.value];
    }
}
class LiteralNumber {
    constructor(value) {
        this.value = `${value}`;
    }
    Compile() {
        return [4, this.value];
    }
}
class IfElse {
    constructor(condition, ifTrue, ifFalse) {
        this.condition = condition;
        this.ifTrue = ifTrue;
        this.ifFalse = ifFalse;
    }
    Compile(s) {
        const id = (0, IR_1.generateScratchId)();
        let cond = this.condition.Compile(s);
        let inp = sToInput(cond, id);
        let itrue = compileBlocks(this.ifTrue, id, s);
        let ifalse = compileBlocks(this.ifFalse, id, s);
        const ev = {
            opcode: "control_if_else",
            next: null,
            parent: null,
            inputs: {
                CONDITION: inp,
                SUBSTACK: [2, itrue],
                SUBSTACK2: [2, ifalse],
            },
            fields: {},
            shadow: false,
            topLevel: false,
        };
        s.blocks[id] = ev;
        return { id, block: ev };
    }
}
class WhenFlagClicked {
    constructor(statements) {
        this.statements = statements;
    }
    Compile(sprite) {
        const id = (0, IR_1.generateScratchId)();
        const ev = {
            opcode: "event_whenflagclicked",
            next: null,
            parent: null,
            inputs: {},
            fields: {},
            shadow: false,
            topLevel: true,
            x: 0,
            y: 0,
        };
        let prev = { id: id, block: ev };
        for (const r of this.statements) {
            let m = r.Compile(sprite);
            prev.block.next = m.id;
            m.block.parent = prev.id;
            prev = m;
        }
        sprite.blocks[id] = ev;
        return { id, block: ev };
    }
}
const NumericOperator = (a) => class {
    constructor(num1, num2) {
        this.num1 = num1;
        this.num2 = num2;
    }
    Compile(s) {
        let id = (0, IR_1.generateScratchId)();
        let m = this.num1.Compile(s);
        let m2 = this.num2.Compile(s);
        let z1 = sToInput(m, id);
        let z2 = sToInput(m2, id);
        let rep = {
            opcode: a,
            fields: {},
            inputs: { NUM1: z1, NUM2: z2 },
            next: null,
            parent: null,
            shadow: false,
            topLevel: false,
        };
        s.blocks[id] = rep;
        return { id: id, reporter: rep };
    }
};
const Add = NumericOperator("operator_add");
const Subtract = NumericOperator("operator_subtract");
const Divide = NumericOperator("operator_divide");
const Multiply = NumericOperator("operator_multiply");
class AddToList {
    constructor(list, value) {
        this.list = list;
        this.value = value;
    }
    Compile(s) {
        let id = (0, IR_1.generateScratchId)();
        let m = this.value.Compile(s);
        let z1 = sToInput(m, id);
        let block = {
            opcode: "data_addtolist",
            fields: { LIST: [this.list.name, this.list.id] },
            inputs: { ITEM: z1 },
            next: null,
            parent: null,
            shadow: false,
            topLevel: false,
        };
        s.blocks[id] = block;
        return { id, block };
    }
}
class ItemOfList {
    constructor(list, index) {
        this.list = list;
        this.index = index;
    }
    Compile(s) {
        let id = (0, IR_1.generateScratchId)();
        let m = this.index.Compile(s);
        let z1 = sToInput(m, id);
        let rep = {
            opcode: "data_itemoflist",
            fields: { LIST: [this.list.name, this.list.id] },
            inputs: { INDEX: z1 },
            next: null,
            parent: null,
            shadow: false,
            topLevel: false,
        };
        s.blocks[id] = rep;
        return { id: id, reporter: rep };
    }
}
class Equals {
    constructor(operand1, operand2) {
        this.operand1 = operand1;
        this.operand2 = operand2;
    }
    Compile(s) {
        let id = (0, IR_1.generateScratchId)();
        let m = this.operand1.Compile(s);
        let m2 = this.operand2.Compile(s);
        let z1 = sToInput(m, id);
        let z2 = sToInput(m2, id);
        let rep = {
            opcode: "operator_equals",
            fields: {},
            inputs: { OPERAND1: z1, OPERAND2: z2 },
            next: null,
            parent: null,
            shadow: false,
            topLevel: false,
        };
        s.blocks[id] = rep;
        return { id: id, reporter: rep };
    }
}
class Argument {
    constructor(name) {
        this.name = name;
    }
    /**
     * MUST assign parent after compilation
     */
    newReference(s) {
        return this.Compile(s);
    }
    /**
     * MUST assign parent after compilation
     */
    Compile(s) {
        let def = {
            fields: { VALUE: [this.name, null] },
            inputs: {},
            next: null,
            opcode: "argument_reporter_string_number",
            parent: null,
            shadow: true,
            topLevel: false,
            x: 0,
            y: 0,
        };
        let id = (0, IR_1.generateScratchId)();
        s.blocks[id] = def;
        return { id, reporter: def };
    }
}
class FunctionDefinition {
    constructor(name, args, blocks) {
        this.name = name;
        this.arguments = args;
        this.statements = blocks;
        this.argids = args.map((r) => (0, IR_1.generateScratchId)());
    }
    Compile(s) {
        let procid = (0, IR_1.generateScratchId)();
        let protoid = (0, IR_1.generateScratchId)();
        let f = {};
        for (const [i, m] of this.arguments.entries()) {
            let nr = m.Compile(s);
            nr.reporter.parent = protoid;
            f[this.argids[i]] = [1, nr.id];
        }
        let proto = {
            topLevel: false,
            shadow: true,
            fields: {},
            inputs: f,
            parent: procid,
            mutation: this.GetMutation(),
            opcode: "procedures_prototype",
            next: null,
        };
        let proc = {
            x: 0,
            y: 0,
            next: null,
            fields: {},
            topLevel: true,
            shadow: false,
            parent: null,
            inputs: { custom_block: [1, protoid] },
            opcode: "procedures_definition",
        };
        s.blocks[protoid] = proto;
        s.blocks[procid] = proc;
        let prev = { id: procid, block: proc };
        for (const r of this.statements) {
            let m = r.Compile(s);
            prev.block.next = m.id;
            m.block.parent = prev.id;
            prev = m;
        }
        return { id: procid, block: proc };
    }
    GetMutation() {
        return {
            tagName: "mutation",
            argumentdefaults: JSON.stringify(new Array(this.argids.length).fill("")),
            argumentids: JSON.stringify(this.argids),
            argumentnames: JSON.stringify(this.arguments.map((e) => e.name)),
            children: [],
            proccode: this.name + this.arguments.reduce((e, c) => e + "  %s", ""),
            warp: "false",
        };
    }
}
class FunctionCall {
    constructor(declaration, parameters) {
        this.declaration = declaration;
        this.parameters = parameters;
    }
    Compile(s) {
        let id = (0, IR_1.generateScratchId)();
        let cmp = {};
        for (const [m, ir] of this.parameters.entries()) {
            let p = ir.Compile(s);
            if ("id" in p) {
                p.reporter.parent = id;
                cmp[this.declaration.argids[m]] = [2, p.id];
            }
            else {
                cmp[this.declaration.argids[m]] = [1, p];
            }
        }
        let m = {
            opcode: "procedures_call",
            next: null,
            parent: null,
            inputs: cmp,
            fields: {},
            shadow: false,
            topLevel: false,
            mutation: this.declaration.GetMutation(),
        };
        s.blocks[id] = m;
        return { id, block: m };
    }
}
class SetVariable {
    constructor(variable, value) {
        this.variable = variable;
        this.value = value;
    }
    Compile(s) {
        let id = (0, IR_1.generateScratchId)();
        let val = this.value.Compile(s);
        let inp = sToInput(val, id);
        let block = {
            parent: null,
            topLevel: false,
            fields: { VARIABLE: [this.variable.name, this.variable.id] },
            inputs: { VALUE: inp },
            next: null,
            shadow: false,
            opcode: "data_setvariableto",
        };
        s.blocks[id] = block;
        return { id, block };
    }
}
class ReplaceItemOfList {
    constructor(list, index, value) {
        this.list = list;
        this.index = index;
        this.value = value;
    }
    Compile(s) {
        let id = (0, IR_1.generateScratchId)();
        let val = this.value.Compile(s);
        let index = this.index.Compile(s);
        let inp_val = sToInput(val, id);
        let inp_ind = sToInput(index, id);
        let block = {
            parent: null,
            topLevel: false,
            fields: { LIST: [this.list.name, this.list.id] },
            inputs: { INDEX: inp_ind, ITEM: inp_val },
            next: null,
            shadow: false,
            opcode: "data_replaceitemoflist",
        };
        s.blocks[id] = block;
        return { id, block };
    }
}
class Variable {
    constructor(name) {
        this.name = name;
        this.id = (0, IR_1.generateScratchId)();
    }
    getReference() {
        return new VariableReference(this);
    }
}
class List {
    constructor(name, entries = []) {
        this.name = name;
        this.id = (0, IR_1.generateScratchId)();
        this.entries = entries;
    }
    getItemAt(index) {
        return new ItemOfList(this, index);
    }
}
class VariableReference {
    constructor(variable) {
        this.variable = variable;
    }
    Compile(s) {
        return [12, this.variable.name, this.variable.id];
    }
}
class Sprite {
    constructor(name, variables, blocks, lists) {
        this.variables = variables;
        this.name = name;
        this.blocks = blocks;
        this.lists = lists;
    }
    Compile() {
        let sprite = {
            lists: {},
            name: "Sprite1",
            blocks: {},
            broadcasts: {},
            isStage: false,
            variables: {
                "`jEk@4|i[#Fk?(8x)AV.-my variable": ["my variable", "0"],
            },
            sounds: [],
            currentCostume: 0,
            costumes: [
                {
                    assetId: "bcf454acf82e4504149f7ffe07081dbc",
                    name: "costume1",
                    bitmapResolution: 1,
                    md5ext: "bcf454acf82e4504149f7ffe07081dbc.svg",
                    dataFormat: "svg",
                    rotationCenterX: 48,
                    rotationCenterY: 50,
                },
                {
                    assetId: "0fb9be3e8397c983338cb71dc84d0b25",
                    name: "costume2",
                    bitmapResolution: 1,
                    md5ext: "0fb9be3e8397c983338cb71dc84d0b25.svg",
                    dataFormat: "svg",
                    rotationCenterX: 46,
                    rotationCenterY: 53,
                },
            ],
            volume: 100,
            layerOrder: 1,
            visible: false,
            x: 208,
            y: -124,
            size: 100,
            direction: 90,
            draggable: false,
            rotationStyle: "all around",
        };
        sprite.variables = Object.fromEntries(Object.entries(this.variables).map((f) => [f[1].id, [f[1].name, "0"]]));
        sprite.lists = Object.fromEntries(Object.entries(this.lists).map((f) => [
            f[1].id,
            [f[1].name, f[1].entries],
        ]));
        this.blocks.forEach((b) => {
            console.log(b);
            b.Compile(sprite);
        });
        return sprite;
    }
}
// let myblock = new WhenFlagClicked([]);
// function createFunction(s: scratchSprite) {
//   let arg = new Argument("a1");
//   //   let nr = arg.newReference(s);
//   let myFn = new FunctionDefinition("Function", [arg], [arg]);
// }
let add = new Add(new LiteralNumber(3), new LiteralNumber(4));
let arg = new Argument("a1");
let mv = new Variable("Test Variable");
let myList = new List("Test List");
let my2ndblock = new FunctionDefinition("myFn", [arg], [
    new SetVariable(mv, new Add(mv.getReference(), arg)),
    new AddToList(myList, new LiteralNumber(40)),
    new IfElse(new Equals(myList.getItemAt(new LiteralNumber(1)), new LiteralNumber(8)), [], [
        new SetVariable(mv, new LiteralString("Falsy")),
        new ReplaceItemOfList(myList, new LiteralNumber(1), new LiteralString("Not 40...")),
    ]),
]);
let r = new FunctionCall(my2ndblock, [add]);
let v = new WhenFlagClicked([
    r,
    new SetVariable(mv, new LiteralNumber(4)),
    new SetVariable(mv, new Add(mv.getReference(), new LiteralNumber(4))),
    new IfElse(new Equals(mv.getReference(), new LiteralNumber(8)), [new SetVariable(mv, new LiteralString("Truthy"))], [new SetVariable(mv, new LiteralString("Falsy"))]),
]);
let re = new Sprite("spritte1", [mv], [my2ndblock, r, v], [myList]).Compile();
// Project.targets[1] = new Sprite("Sprite1").Compile();
console.log(re);
// console.log(Project.targets[1]);
loader_1.Project.targets[1] = re;
//@ts-ignore
loader_1.Project.monitors = [];
(0, zipping_1.saveProject)(JSON.stringify(loader_1.Project));
let Stack = new List("Stack");
let Push = (val) => new AddToList();
