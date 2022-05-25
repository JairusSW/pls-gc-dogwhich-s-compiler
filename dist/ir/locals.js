"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockManager = exports.BlockAllocation = exports.LocalVariable = exports.Locals = void 0;
const comp_1 = require("../comp");
const scratch_1 = require("../scratch");
exports.Locals = new scratch_1.List("Locals");
// const r = ListUtilities(Locals);
class LocalVariable {
    constructor(name) {
        this.name = name;
    }
}
exports.LocalVariable = LocalVariable;
class BlockAllocation {
    constructor(variables, parent) {
        this.variables = [];
        this.variables = variables;
        this.parent = parent;
    }
    getIndexForVar(name) {
        // v1 <-
        // v2
        let variable = this.variables.findIndex((r) => r.name == name);
        if (variable != -1) {
            return this.variables.length - variable;
        }
        else if (this.parent) {
            return this.parent.getIndexForVar(name) + this.variables.length;
        }
        else {
            throw new Error(`Local variable ${name} not found in scope.`);
        }
    }
    getItem(name) {
        return exports.Locals.getItemAt(new scratch_1.LiteralNumber(this.getIndexForVar(name)));
    }
    set(name, value) {
        return new comp_1.IRelement([
            ...value.blocks,
            new scratch_1.ReplaceItemOfList(exports.Locals, new scratch_1.LiteralNumber(this.getIndexForVar(name)), value.reporter),
        ], new scratch_1.LiteralNumber(this.getIndexForVar(name)), 0);
    }
    add(lvar) {
        this.variables.push(lvar);
    }
    deAlloc(l) {
        return new comp_1.IRelement(new Array(this.variables.length).fill(new scratch_1.DeleteOfList(l, new scratch_1.LiteralNumber(1))), new scratch_1.LiteralString("THIS SHOULD NOT BE HERE"));
    }
    deAllocAll(l) {
        return [
            ...(this.parent?.deAllocAll(l) ?? []),
            ...new Array(this.variables.length).fill(new scratch_1.DeleteOfList(l, new scratch_1.LiteralNumber(1))),
        ];
    }
}
exports.BlockAllocation = BlockAllocation;
class BlockManager {
    constructor(root, list) {
        this.top = root;
        this.list = list;
    }
    push(locals) {
        this.top.variables.push(...locals);
    }
    scope() {
        this.top = new BlockAllocation([], this.top);
    }
    pop() {
        let tr = this.top.deAlloc(this.list);
        this.top = this.top.parent;
        return tr;
    }
}
exports.BlockManager = BlockManager;
