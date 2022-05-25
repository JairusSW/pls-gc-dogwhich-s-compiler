"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sprite = exports.VariableReference = exports.List = exports.Variable = exports.ReplaceItemOfList = exports.SetVariable = exports.FunctionCall = exports.FunctionDefinition = exports.Argument = exports.ItemOfList = exports.Answer = exports.DeleteOfList = exports.AddToList = exports.InsertIntoList = exports.Or = exports.And = exports.Equals = exports.GreaterThan = exports.LessThan = exports.Multiply = exports.Divide = exports.Subtract = exports.Add = exports.StopThisScriot = exports.Say = exports.AskAndWait = exports.Hide = exports.Show = exports.Wait = exports.MoveSteps = exports.GotoXy = exports.Not = exports.KeyPressed = exports.MathOp = exports.Join = exports.WhenFlagClicked = exports.IfElse = exports.Forever = exports.Repeat = exports.MultipleBlocks = exports.LiteralNumber = exports.LiteralString = exports.Pen = exports.sToInput = void 0;
const util_1 = require("./util");
/**
 * Function to take value of type inputShadow or Reporter and return the correct input.
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
exports.sToInput = sToInput;
const simpleBlock = (r) => class {
    Compile(s) {
        const id = (0, util_1.generateScratchId)();
        //@ts-ignore
        const blck = {
            opcode: r,
            inputs: {},
            fields: {},
            next: null,
            parent: null,
            shadow: false,
            topLevel: false,
        };
        s.blocks[id] = blck;
        return { id, block: blck };
    }
};
var Pen;
(function (Pen) {
    Pen.Stamp = simpleBlock("pen_stamp");
    Pen.Clear = simpleBlock("pen_clear");
    Pen.PenUp = simpleBlock("pen_penUp");
    Pen.PenDown = simpleBlock("pen_penDown");
    class SetSize {
        constructor(size) {
            this.size = size;
        }
        Compile(s) {
            let id = (0, util_1.generateScratchId)();
            let rv = this.size.Compile(s);
            let m = sToInput(rv, id);
            let r = {
                shadow: false,
                opcode: "pen_setPenSizeTo",
                parent: null,
                next: null,
                topLevel: false,
                inputs: { SIZE: m },
                fields: {},
            };
            s.blocks[id] = r;
            return { id, block: r };
        }
    }
    Pen.SetSize = SetSize;
})(Pen = exports.Pen || (exports.Pen = {}));
/** Function to compile a list of Blocks */
function compileBlocks(blocks, s) {
    if (blocks.length == 0)
        return null;
    let first = blocks[0].Compile(s);
    let prev = first;
    for (const r of blocks.slice(1)) {
        let m = r.Compile(s);
        prev.block.next = m.id;
        m.block.parent = prev.id;
        prev = m;
    }
    return first;
}
class LiteralString {
    constructor(value) {
        this.value = value;
    }
    Compile() {
        return [10, this.value];
    }
}
exports.LiteralString = LiteralString;
class LiteralNumber {
    constructor(value) {
        this.value = `${value}`;
    }
    Compile() {
        return [4, this.value];
    }
}
exports.LiteralNumber = LiteralNumber;
class MultipleBlocks {
    constructor(blocks) {
        this.blocks = blocks;
        if (blocks.length == 0)
            throw new Error("ERROR: MUST PASS IN AT LEAST ONE BLOCK INTO MultipleBlocks CONSTRUCTOR");
    }
    Compile(s) {
        let first = this.blocks[0].Compile(s);
        let prev = first;
        for (const r of this.blocks.slice(1)) {
            let m = r.Compile(s);
            prev.block.next = m.id;
            m.block.parent = prev.id;
            prev = m;
        }
        return {
            id: prev.id,
            //@ts-ignore
            block: {
                ...prev.block,
                get parent() {
                    return first.block.parent;
                },
                set parent(e) {
                    first.block.parent = e;
                },
                get next() {
                    return prev.block.next;
                },
                set next(e) {
                    prev.block.next = e;
                },
            },
        };
    }
}
exports.MultipleBlocks = MultipleBlocks;
class Repeat {
    constructor(times, blocks) {
        this.times = times;
        this.blocks = blocks;
    }
    Compile(s) {
        const id = (0, util_1.generateScratchId)();
        let times = this.times.Compile(s);
        let ttimes = sToInput(times, id);
        let iftrue = compileBlocks(this.blocks, s);
        if (iftrue)
            iftrue.block.parent = id;
        let itrue = iftrue?.id ?? null;
        const ev = {
            opcode: "control_repeat",
            next: null,
            parent: null,
            inputs: {
                SUBSTACK: [2, itrue],
                TIMES: ttimes,
            },
            fields: {},
            shadow: false,
            topLevel: false,
        };
        s.blocks[id] = ev;
        return { id, block: ev };
    }
}
exports.Repeat = Repeat;
class Forever {
    constructor(blocks) {
        this.blocks = blocks;
    }
    Compile(s) {
        const id = (0, util_1.generateScratchId)();
        let iftrue = compileBlocks(this.blocks, s);
        if (iftrue)
            iftrue.block.parent = id;
        let itrue = iftrue?.id ?? null;
        const ev = {
            opcode: "control_forever",
            next: null,
            parent: null,
            inputs: {
                SUBSTACK: [2, itrue],
            },
            fields: {},
            shadow: false,
            topLevel: false,
        };
        s.blocks[id] = ev;
        return { id, block: ev };
    }
}
exports.Forever = Forever;
class IfElse {
    constructor(condition, ifTrue, ifFalse) {
        this.condition = condition;
        this.ifTrue = ifTrue;
        this.ifFalse = ifFalse;
    }
    Compile(s) {
        const id = (0, util_1.generateScratchId)();
        let cond = this.condition.Compile(s);
        let inp = sToInput(cond, id);
        let iftrue = compileBlocks(this.ifTrue, s);
        let iffalse = compileBlocks(this.ifFalse, s);
        if (iftrue)
            iftrue.block.parent = id;
        if (iffalse)
            iffalse.block.parent = id;
        let itrue = iftrue?.id ?? null;
        let ifalse = iffalse?.id ?? null;
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
exports.IfElse = IfElse;
class WhenFlagClicked {
    constructor(statements) {
        this.statements = statements;
    }
    Compile(sprite) {
        const id = (0, util_1.generateScratchId)();
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
exports.WhenFlagClicked = WhenFlagClicked;
class Join {
    constructor(left, right) {
        this.left = left;
        this.right = right;
    }
    Compile(s) {
        let id = (0, util_1.generateScratchId)();
        let m = this.left.Compile(s);
        let m2 = this.right.Compile(s);
        let z1 = sToInput(m, id);
        let z2 = sToInput(m2, id);
        let rep = {
            opcode: "operator_join",
            fields: {},
            inputs: { STRING1: z1, STRING2: z2 },
            next: null,
            parent: null,
            shadow: false,
            topLevel: false,
        };
        s.blocks[id] = rep;
        return { id: id, reporter: rep };
    }
}
exports.Join = Join;
const NumericOperator = (a) => class {
    constructor(num1, num2) {
        this.num1 = num1;
        this.num2 = num2;
    }
    Compile(s) {
        let id = (0, util_1.generateScratchId)();
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
class MathOp {
    constructor(num, type) {
        this.num = num;
        this.type = type;
    }
    Compile(s) {
        let id = (0, util_1.generateScratchId)();
        let m = this.num.Compile(s);
        let z1 = sToInput(m, id);
        let rep = {
            opcode: "operator_mathop",
            fields: { OPERATOR: [this.type, null] },
            inputs: { NUM: z1 },
            next: null,
            parent: null,
            shadow: false,
            topLevel: false,
        };
        s.blocks[id] = rep;
        return { id: id, reporter: rep };
    }
}
exports.MathOp = MathOp;
class KeyPressed {
    constructor(key) {
        this.key = key;
    }
    Compile(s) {
        let id = (0, util_1.generateScratchId)();
        let oid = (0, util_1.generateScratchId)();
        let mblock = {
            inputs: { KEY_OPTION: [1, oid] },
            fields: {},
            next: null,
            opcode: "sensing_keypressed",
            parent: null,
            shadow: false,
            topLevel: false,
        };
        s.blocks[id] = mblock;
        let oblock = {
            topLevel: false,
            shadow: true,
            parent: id,
            opcode: "sensing_keyoptions",
            next: null,
            fields: { KEY_OPTION: [this.key, null] },
            inputs: {},
        };
        s.blocks[oid] = oblock;
        return { reporter: mblock, id };
    }
}
exports.KeyPressed = KeyPressed;
class Not {
    constructor(num1) {
        this.num1 = num1;
    }
    Compile(s) {
        let id = (0, util_1.generateScratchId)();
        let m = this.num1.Compile(s);
        let z1 = sToInput(m, id);
        let rep = {
            opcode: "operator_not",
            fields: {},
            inputs: { OPERAND: z1 },
            next: null,
            parent: null,
            shadow: false,
            topLevel: false,
        };
        s.blocks[id] = rep;
        return { id: id, reporter: rep };
    }
}
exports.Not = Not;
const BooleanBinaryOperator = (a) => class {
    constructor(num1, num2) {
        this.num1 = num1;
        this.num2 = num2;
    }
    Compile(s) {
        let id = (0, util_1.generateScratchId)();
        let m = this.num1.Compile(s);
        let m2 = this.num2.Compile(s);
        let z1 = sToInput(m, id);
        let z2 = sToInput(m2, id);
        let rep = {
            opcode: a,
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
};
class GotoXy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    Compile(s) {
        let id = (0, util_1.generateScratchId)();
        let rx = this.x.Compile(s);
        let ry = this.y.Compile(s);
        let ix = sToInput(rx, id);
        let iy = sToInput(ry, id);
        let r = {
            shadow: false,
            opcode: "motion_gotoxy",
            parent: null,
            next: null,
            topLevel: false,
            inputs: { X: ix, Y: iy },
            fields: {},
        };
        s.blocks[id] = r;
        return { id, block: r };
    }
}
exports.GotoXy = GotoXy;
class MoveSteps {
    constructor(steps) {
        this.steps = steps;
    }
    Compile(s) {
        let id = (0, util_1.generateScratchId)();
        let rv = this.steps.Compile(s);
        let m = sToInput(rv, id);
        let r = {
            shadow: false,
            opcode: "motion_movesteps",
            parent: null,
            next: null,
            topLevel: false,
            inputs: { STEPS: m },
            fields: {},
        };
        s.blocks[id] = r;
        return { id, block: r };
    }
}
exports.MoveSteps = MoveSteps;
class Wait {
    constructor(seconds) {
        this.seconds = seconds;
    }
    Compile(s) {
        let id = (0, util_1.generateScratchId)();
        let rv = this.seconds.Compile(s);
        let m = sToInput(rv, id);
        let r = {
            shadow: false,
            opcode: "control_wait",
            parent: null,
            next: null,
            topLevel: false,
            inputs: { DURATION: m },
            fields: {},
        };
        s.blocks[id] = r;
        return { id, block: r };
    }
}
exports.Wait = Wait;
class Show {
    Compile(s) {
        let id = (0, util_1.generateScratchId)();
        let r = {
            shadow: false,
            opcode: "looks_show",
            parent: null,
            next: null,
            topLevel: false,
            inputs: {},
            fields: {},
        };
        s.blocks[id] = r;
        return { id, block: r };
    }
}
exports.Show = Show;
class Hide {
    Compile(s) {
        let id = (0, util_1.generateScratchId)();
        let r = {
            shadow: false,
            opcode: "looks_hide",
            parent: null,
            next: null,
            topLevel: false,
            inputs: {},
            fields: {},
        };
        s.blocks[id] = r;
        return { id, block: r };
    }
}
exports.Hide = Hide;
class AskAndWait {
    constructor(message) {
        this.message = message;
    }
    Compile(s) {
        let id = (0, util_1.generateScratchId)();
        let rv = this.message.Compile(s);
        let m = sToInput(rv, id);
        let r = {
            shadow: false,
            opcode: "sensing_askandwait",
            parent: null,
            next: null,
            topLevel: false,
            inputs: { QUESTION: m },
            fields: {},
        };
        s.blocks[id] = r;
        return { id, block: r };
    }
}
exports.AskAndWait = AskAndWait;
class Say {
    constructor(message) {
        this.message = message;
    }
    Compile(s) {
        let id = (0, util_1.generateScratchId)();
        let rv = this.message.Compile(s);
        let m = sToInput(rv, id);
        let r = {
            shadow: false,
            opcode: "looks_say",
            parent: null,
            next: null,
            topLevel: false,
            inputs: { MESSAGE: m },
            fields: {},
        };
        s.blocks[id] = r;
        return { id, block: r };
    }
}
exports.Say = Say;
class StopThisScriot {
    Compile(s) {
        let id = (0, util_1.generateScratchId)();
        let r = {
            shadow: false,
            opcode: "control_stop",
            parent: null,
            next: null,
            inputs: {},
            topLevel: false,
            fields: { STOP_OPTION: ["this script", null] },
            mutation: { tagName: "mutation", children: [], hasnext: "false" },
        };
        s.blocks[id] = r;
        return { id, block: r };
    }
}
exports.StopThisScriot = StopThisScriot;
exports.Add = NumericOperator("operator_add");
exports.Subtract = NumericOperator("operator_subtract");
exports.Divide = NumericOperator("operator_divide");
exports.Multiply = NumericOperator("operator_multiply");
exports.LessThan = BooleanBinaryOperator("operator_lt");
exports.GreaterThan = BooleanBinaryOperator("operator_gt");
exports.Equals = BooleanBinaryOperator("operator_equals");
exports.And = BooleanBinaryOperator("operator_and");
exports.Or = BooleanBinaryOperator("operator_or");
class InsertIntoList {
    constructor(list, value, index) {
        this.list = list;
        this.value = value;
        this.index = index;
    }
    Compile(s) {
        let id = (0, util_1.generateScratchId)();
        let v = this.value.Compile(s);
        let ind = this.index.Compile(s);
        let vin = sToInput(v, id);
        let indin = sToInput(ind, id);
        let vl = {
            topLevel: false,
            fields: { LIST: [this.list.name, this.list.id] },
            inputs: { INDEX: indin, ITEM: vin },
            next: null,
            parent: null,
            opcode: "data_insertatlist",
            shadow: false,
        };
        s.blocks[id] = vl;
        return { id, block: vl };
    }
}
exports.InsertIntoList = InsertIntoList;
class AddToList {
    constructor(list, value) {
        this.list = list;
        this.value = value;
    }
    Compile(s) {
        let id = (0, util_1.generateScratchId)();
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
exports.AddToList = AddToList;
class DeleteOfList {
    constructor(list, index) {
        this.list = list;
        this.index = index;
    }
    Compile(s) {
        let id = (0, util_1.generateScratchId)();
        let m = this.index.Compile(s);
        let z1 = sToInput(m, id);
        let block = {
            opcode: "data_deleteoflist",
            fields: { LIST: [this.list.name, this.list.id] },
            inputs: { INDEX: z1 },
            next: null,
            parent: null,
            shadow: false,
            topLevel: false,
        };
        s.blocks[id] = block;
        return { id, block };
    }
}
exports.DeleteOfList = DeleteOfList;
class Answer {
    Compile(s) {
        let id = (0, util_1.generateScratchId)();
        let blck = {
            opcode: "sensing_answer",
            fields: {},
            inputs: {},
            next: null,
            parent: null,
            shadow: false,
            topLevel: false,
        };
        s.blocks[id] = blck;
        return { id, reporter: blck };
    }
}
exports.Answer = Answer;
class ItemOfList {
    constructor(list, index) {
        this.list = list;
        this.index = index;
    }
    Compile(s) {
        let id = (0, util_1.generateScratchId)();
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
exports.ItemOfList = ItemOfList;
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
        let id = (0, util_1.generateScratchId)();
        s.blocks[id] = def;
        return { id, reporter: def };
    }
}
exports.Argument = Argument;
class FunctionDefinition {
    constructor(name, args, blocks) {
        this.name = name;
        this.arguments = args;
        this.statements = blocks;
        this.argids = args.map((r) => (0, util_1.generateScratchId)());
    }
    Compile(s) {
        let procid = (0, util_1.generateScratchId)();
        let protoid = (0, util_1.generateScratchId)();
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
            warp: "true",
        };
    }
}
exports.FunctionDefinition = FunctionDefinition;
class FunctionCall {
    constructor(declaration, parameters) {
        this.declaration = declaration;
        this.parameters = parameters;
    }
    Compile(s) {
        let id = (0, util_1.generateScratchId)();
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
exports.FunctionCall = FunctionCall;
class SetVariable {
    constructor(variable, value) {
        this.variable = variable;
        this.value = value;
    }
    Compile(s) {
        let id = (0, util_1.generateScratchId)();
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
exports.SetVariable = SetVariable;
class ReplaceItemOfList {
    constructor(list, index, value) {
        this.list = list;
        this.index = index;
        this.value = value;
    }
    Compile(s) {
        let id = (0, util_1.generateScratchId)();
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
exports.ReplaceItemOfList = ReplaceItemOfList;
class Variable {
    constructor(name) {
        this.name = name;
        this.id = (0, util_1.generateScratchId)();
    }
    getReference() {
        return new VariableReference(this);
    }
}
exports.Variable = Variable;
class List {
    constructor(name, entries = []) {
        this.name = name;
        this.id = (0, util_1.generateScratchId)();
        this.entries = entries;
    }
    getItemAt(index) {
        return new ItemOfList(this, index);
    }
}
exports.List = List;
class VariableReference {
    constructor(variable) {
        this.variable = variable;
    }
    Compile(s) {
        return [12, this.variable.name, this.variable.id];
    }
}
exports.VariableReference = VariableReference;
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
            name: this.name,
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
exports.Sprite = Sprite;
// let myblock = new WhenFlagClicked([]);
// function createFunction(s: scratchSprite) {
//   let arg = new Argument("a1");
//   //   let nr = arg.newReference(s);
//   let myFn = new FunctionDefinition("Function", [arg], [arg]);
// }
let add = new exports.Add(new LiteralNumber(3), new LiteralNumber(4));
let arg = new Argument("a1");
let mv = new Variable("Test Variable");
let myList = new List("Test List");
let my2ndblock = new FunctionDefinition("myFn", [arg], [
    new SetVariable(mv, new exports.Add(mv.getReference(), arg)),
    new AddToList(myList, new LiteralNumber(40)),
    new IfElse(new exports.Equals(myList.getItemAt(new LiteralNumber(1)), new LiteralNumber(8)), [], [
        new SetVariable(mv, new LiteralString("Falsy")),
        new ReplaceItemOfList(myList, new LiteralNumber(1), new LiteralString("Not 40...")),
    ]),
]);
let r = new FunctionCall(my2ndblock, [add]);
let v = new WhenFlagClicked([
    r,
    new SetVariable(mv, new LiteralNumber(4)),
    new SetVariable(mv, new exports.Add(mv.getReference(), new LiteralNumber(4))),
    new IfElse(new exports.Equals(mv.getReference(), new LiteralNumber(8)), [new SetVariable(mv, new LiteralString("Truthy"))], [new SetVariable(mv, new LiteralString("Falsy"))]),
]);
// let Stack = new List("Stack");
// let Push = (val: string | number) => new AddToList();
