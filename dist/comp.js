"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Compile = exports.IRelement = void 0;
const locals_1 = require("./ir/locals");
const parser_1 = require("./parser");
const scratch_1 = require("./scratch");
const runtime_1 = require("./scratch/runtime");
const structure_1 = require("./scratch/structure");
function assert(cond, msg) {
    if (!cond)
        throw new Error(`Assertaton Error: ${msg}`);
}
class IRelement {
    constructor(blocks, reporter, pushes = 0) {
        this.blocks = blocks;
        this.reporter = reporter;
        this.pushes = pushes;
    }
    isPure() {
        return this.blocks.length == 0 && this.pushes == 0;
    }
}
exports.IRelement = IRelement;
function CompileExpr(e, { variables, functions, locals, lists }) {
    const cmp = (e) => CompileExpr(e, { variables, functions, locals, lists });
    if (e instanceof parser_1.IdentifierExpression) {
        return new IRelement([], locals.top.getItem(e.value), 0);
    }
    if (e instanceof parser_1.ArrayAccessExpression) {
        let arr;
        if (e.accessing instanceof parser_1.PropertyAccessExpression &&
            e.accessing.left instanceof parser_1.ThisExpression &&
            e.accessing.right instanceof parser_1.IdentifierExpression &&
            (arr = lists.get(e.accessing.right.value))) {
            let ind = cmp(e.index);
            if (ind.isPure()) {
                return new IRelement([], arr.getItemAt(ind.reporter));
            }
            else {
                return new IRelement([
                    ...ind.blocks,
                    ...(0, runtime_1.push)(arr.getItemAt(ind.reporter)),
                    ...(0, runtime_1.drop)(ind.pushes),
                ], (0, runtime_1.stackItem)(1), 1);
            }
        }
        else
            throw new Error("Array not in scope.");
    }
    if (e instanceof parser_1.PropertyAccessExpression) {
        if (!(e.left instanceof parser_1.ThisExpression))
            throw new Error("CANNOT ACCESS SOMETHING OTHER THAN `this`");
        assert(e.right instanceof parser_1.IdentifierExpression, " must access with identifier");
        let name = e.right.value;
        assert(variables.has(name), " varaible does not exist");
        let v = variables.get(name);
        return new IRelement([], v.getReference());
    }
    else if (e instanceof parser_1.BinaryExpression) {
        let left = cmp(e.left);
        let right = cmp(e.right);
        let blcks = [...left.blocks, ...right.blocks];
        switch (e.type) {
            case parser_1.BinaryExpressionType.plus:
                return new IRelement(blcks, new scratch_1.Add(left.reporter, right.reporter));
            case parser_1.BinaryExpressionType.divide:
                return new IRelement(blcks, new scratch_1.Divide(left.reporter, right.reporter));
            case parser_1.BinaryExpressionType.minus:
                return new IRelement(blcks, new scratch_1.Subtract(left.reporter, right.reporter));
            case parser_1.BinaryExpressionType.times:
                return new IRelement(blcks, new scratch_1.Multiply(left.reporter, right.reporter));
            case parser_1.BinaryExpressionType.equals_equals:
                return new IRelement(blcks, new scratch_1.Equals(left.reporter, right.reporter));
            case parser_1.BinaryExpressionType.less_than:
                return new IRelement(blcks, new scratch_1.LessThan(left.reporter, right.reporter));
            case parser_1.BinaryExpressionType.join:
                return new IRelement(blcks, new scratch_1.Join(left.reporter, right.reporter));
                break;
            case parser_1.BinaryExpressionType.greater_than:
                return new IRelement(blcks, new scratch_1.GreaterThan(left.reporter, right.reporter));
            case parser_1.BinaryExpressionType.or:
                return new IRelement(blcks, new scratch_1.Or(left.reporter, right.reporter));
            case parser_1.BinaryExpressionType.and:
                return new IRelement(blcks, new scratch_1.And(left.reporter, right.reporter));
        }
    }
    else if (e instanceof parser_1.NumericExpression) {
        return new IRelement([], new scratch_1.LiteralNumber(parseFloat(e.value)));
    }
    else if (e instanceof parser_1.StringExpression) {
        return new IRelement([], new scratch_1.LiteralString(e.value));
    }
    else if (e instanceof parser_1.FunctionCallExpression) {
        if (e.calling instanceof parser_1.PropertyAccessExpression &&
            e.calling.left instanceof parser_1.PropertyAccessExpression &&
            e.calling.left.right instanceof parser_1.IdentifierExpression &&
            e.calling.right instanceof parser_1.IdentifierExpression &&
            e.calling.left.left instanceof parser_1.ThisExpression) {
            let listAccessing;
            if ((listAccessing = lists.get(e.calling.left.right.value))) {
                switch (e.calling.right.value) {
                    case "push":
                        assert(e.parameters.length == 1, "push takes one parameter.");
                        let ind = cmp(e.parameters[0]);
                        return new IRelement([
                            ...ind.blocks,
                            new scratch_1.AddToList(listAccessing, ind.reporter),
                            ...(0, runtime_1.drop)(ind.pushes),
                        ], new scratch_1.LiteralString("Should not exist"), 0);
                        break;
                }
            }
            else
                throw new Error("List not in scope.");
        }
        else if (e.calling instanceof parser_1.PropertyAccessExpression &&
            e.calling.left instanceof parser_1.IdentifierExpression &&
            e.calling.left.value == "scratch" &&
            e.calling.right instanceof parser_1.IdentifierExpression) {
            switch (e.calling.right.value) {
                case "show":
                    return new IRelement([new scratch_1.Show()], new scratch_1.LiteralString("Should not exist"), 0);
                    break;
                case "hide":
                    return new IRelement([new scratch_1.Hide()], new scratch_1.LiteralString("Should not exist"), 0);
                    break;
                case "penDown":
                    return new IRelement([new scratch_1.Pen.PenDown()], new scratch_1.LiteralString("Should not exist"), 0);
                    break;
                case "penUp":
                    return new IRelement([new scratch_1.Pen.PenUp()], new scratch_1.LiteralString("Should not exist"), 0);
                    break;
                case "penClear":
                    return new IRelement([new scratch_1.Pen.Clear()], new scratch_1.LiteralString("Should not exist"), 0);
                    break;
                case "moveSteps":
                    assert(e.parameters.length == 1, "moveSteps takes one parameter.");
                    let ind = cmp(e.parameters[0]);
                    return new IRelement([...ind.blocks, new scratch_1.MoveSteps(ind.reporter), ...(0, runtime_1.drop)(ind.pushes)], new scratch_1.LiteralString("Should not exist"), 0);
                    break;
                case "setPenSize":
                    {
                        assert(e.parameters.length == 1, "setPenSize takes one parameter.");
                        let ind = cmp(e.parameters[0]);
                        return new IRelement([
                            ...ind.blocks,
                            new scratch_1.Pen.SetSize(ind.reporter),
                            ...(0, runtime_1.drop)(ind.pushes),
                        ], new scratch_1.LiteralString("Should not exist"), 0);
                    }
                    break;
                case "keyIsPressed":
                    {
                        assert(e.parameters.length == 1 &&
                            e.parameters[0] instanceof parser_1.StringExpression, "KeyIsPressed takes one string literal parameter.");
                        assert(structure_1.sensing.keyOption.includes(e.parameters[0].value), `key ${e.parameters[0].value} not found.`);
                        let ind = cmp(e.parameters[0]);
                        return new IRelement([], new scratch_1.KeyPressed(e.parameters[0].value), 0);
                    }
                    break;
                case "say":
                    {
                        assert(e.parameters.length == 1, "say takes one parameter.");
                        let ind = cmp(e.parameters[0]);
                        return new IRelement([...ind.blocks, new scratch_1.Say(ind.reporter), ...(0, runtime_1.drop)(ind.pushes)], new scratch_1.LiteralString("Should not exist"), 0);
                    }
                    break;
                case "wait":
                    {
                        assert(e.parameters.length == 1, "wait takes one parameter.");
                        let ind = cmp(e.parameters[0]);
                        return new IRelement([...ind.blocks, new scratch_1.Wait(ind.reporter), ...(0, runtime_1.drop)(ind.pushes)], new scratch_1.Answer(), 0);
                    }
                    break;
                case "ask":
                    {
                        assert(e.parameters.length == 1, "ask takes one parameter.");
                        let ind = cmp(e.parameters[0]);
                        return new IRelement([
                            ...ind.blocks,
                            new scratch_1.AskAndWait(ind.reporter),
                            ...(0, runtime_1.drop)(ind.pushes),
                        ], new scratch_1.Answer(), 0);
                    }
                    break;
                case "moveTo":
                    assert(e.parameters.length == 2, "moveTo takes wo parameter.");
                    let x = cmp(e.parameters[0]);
                    let y = cmp(e.parameters[1]);
                    let i = 1;
                    let rx = x.pushes == 0 ? x.reporter : (i++, (0, runtime_1.stackItem)(1));
                    let ry = y.pushes == 0 ? y.reporter : (0, runtime_1.stackItem)(i);
                    return new IRelement([
                        ...x.blocks,
                        ...y.blocks,
                        new scratch_1.GotoXy(rx, ry),
                        ...(0, runtime_1.drop)(x.pushes + y.pushes),
                    ], new scratch_1.LiteralString("Should not exist"), 0);
                    break;
                    scratch_1.GotoXy;
            }
        }
        else if (e.calling instanceof parser_1.PropertyAccessExpression &&
            e.calling.left instanceof parser_1.IdentifierExpression &&
            e.calling.left.value == "math" &&
            e.calling.right instanceof parser_1.IdentifierExpression) {
            if (structure_1.operator.mathops.includes(e.calling.right.value)) {
                assert(e.parameters.length == 1, `math.${e.calling.right.value} takes one parameter.`);
                let r = cmp(e.parameters[0]);
                return new IRelement(r.blocks, new scratch_1.MathOp(r.reporter, e.calling.right.value), 0);
            }
            else
                throw new Error(`math.${e.calling.right.value} is not a function.`);
        }
        else {
            assert(e.calling instanceof parser_1.PropertyAccessExpression &&
                e.calling.left instanceof parser_1.ThisExpression &&
                e.calling.right instanceof parser_1.IdentifierExpression, " Must access `this` when calling a function");
            assert(functions.has(e.calling.right.value), " function not in scope.");
            let fndefinition = functions.get(e.calling.right.value);
            // let mp = e.parameters.map((r) => cmp(r));
            locals.scope();
            let z = e.parameters.reduce((r, fm) => {
                let f = cmp(fm);
                locals.push([new locals_1.LocalVariable("")]);
                return [
                    ...r,
                    ...f.blocks,
                    new scratch_1.InsertIntoList(locals_1.Locals, f.reporter, new scratch_1.LiteralNumber(1)),
                ];
            }, []);
            locals.pop();
            let call = new scratch_1.FunctionCall(fndefinition, []);
            return new IRelement([...z, call], (0, runtime_1.stackItem)(1), 1);
        }
    }
    else if (e instanceof parser_1.UnaryExpression) {
        if (e.type == parser_1.UnaryExpressionType.negative) {
            let r = cmp(e.expression);
            return new IRelement([...r.blocks], new scratch_1.Multiply(r.reporter, new scratch_1.LiteralNumber(-1)), r.pushes);
        }
        else if (e.type == parser_1.UnaryExpressionType.not) {
            let r = cmp(e.expression);
            return new IRelement([...r.blocks], new scratch_1.Not(r.reporter), r.pushes);
        }
    }
    console.log(e);
    throw new Error("Unknown expression type ^^");
}
const terminates = (e) => !(e instanceof scratch_1.Forever);
function Compile(e) {
    const vmap = new Map();
    const lmap = new Map();
    e.fields.forEach((f) => {
        if (f.list)
            lmap.set(f.name, new scratch_1.List(f.name, []));
        else
            vmap.set(f.name, new scratch_1.Variable(f.name));
    });
    let fns = new Map();
    e.functions.forEach((f) => {
        if (f.name != "constructor")
            fns.set(f.name, new scratch_1.FunctionDefinition(f.name, [], []));
    });
    let ctor = [];
    e.functions.forEach((f) => {
        let sb = [];
        const rootlocals = new locals_1.BlockManager(new locals_1.BlockAllocation(f.parameters.map((e) => new locals_1.LocalVariable(e.value))), locals_1.Locals);
        f.statements.forEach((s) => {
            if (sb.find((r) => r instanceof scratch_1.StopThisScriot))
                return;
            sb.push(...compileStatement(s, {
                variables: vmap,
                functions: fns,
                locals: rootlocals,
                lists: lmap,
            }));
        });
        let m = sb.findIndex((e) => e instanceof scratch_1.StopThisScriot);
        if (m == -1 && terminates(sb[sb.length - 1])) {
            sb.push(...rootlocals.top.deAllocAll(locals_1.Locals));
        }
        else if (m == sb.length - 1) {
            sb = sb.slice(0, sb.length - 1);
        }
        if (f.name == "constructor") {
            ctor.push(new scratch_1.WhenFlagClicked(sb));
        }
        else
            fns.get(f.name).statements = sb;
    });
    const m = new scratch_1.Sprite(e.name, Array.from(vmap.values()), [...ctor, ...fns.values()], Array.from(lmap.values()));
    return m.Compile();
}
exports.Compile = Compile;
function compileStatement(s, { variables, functions, locals, lists }) {
    let sb = undefined;
    if (s instanceof parser_1.ExpressionStatement) {
        if (s.expression instanceof parser_1.AssignmentExpression) {
            let ex = CompileExpr(s.expression.right, {
                variables,
                functions,
                locals,
                lists,
            });
            if (s.expression.left instanceof parser_1.PropertyAccessExpression) {
                if (!(s.expression.left.right instanceof parser_1.IdentifierExpression))
                    throw new Error("Not identifier");
                if (!variables.has(s.expression.left.right.value))
                    throw new Error("Variable does not exist");
                sb = ex.isPure()
                    ? [
                        new scratch_1.SetVariable(variables.get(s.expression.left.right.value), ex.reporter),
                    ]
                    : [
                        ...ex.blocks,
                        new scratch_1.SetVariable(variables.get(s.expression.left.right.value), ex.reporter),
                        ...(0, runtime_1.drop)(1),
                    ];
            }
            else if (s.expression.left instanceof parser_1.ArrayAccessExpression) {
                assert(s.expression.left.accessing instanceof parser_1.PropertyAccessExpression, " Must access property array. (1)");
                assert(s.expression.left.accessing.left instanceof parser_1.ThisExpression, " Must access property on 'this'");
                let arr;
                assert(s.expression.left.accessing.left instanceof parser_1.ThisExpression &&
                    s.expression.left.accessing.right instanceof parser_1.IdentifierExpression, " Must access property array.");
                assert(!!(arr = lists.get(s.expression.left.accessing.right.value)), " List not in scope.");
                let expr = CompileExpr(s.expression.right, {
                    functions,
                    lists,
                    locals,
                    variables,
                });
                let expr2 = CompileExpr(s.expression.left.index, {
                    functions,
                    lists,
                    locals,
                    variables,
                });
                let one = undefined;
                let two = undefined;
                let count = 0;
                if (expr.isPure()) {
                    one = expr.reporter;
                    if (expr2.isPure()) {
                        two = expr2.reporter;
                    }
                    else {
                        count = 1;
                        two = (0, runtime_1.stackItem)(1);
                    }
                }
                else {
                    if (expr2.isPure()) {
                        count = 1;
                        one = (0, runtime_1.stackItem)(1);
                        two = expr2.reporter;
                    }
                    else {
                        count = 2;
                        one = (0, runtime_1.stackItem)(2);
                        two = (0, runtime_1.stackItem)(1);
                    }
                }
                return [
                    ...expr.blocks,
                    ...expr2.blocks,
                    new scratch_1.ReplaceItemOfList(arr, two, one),
                    ...(0, runtime_1.drop)(count),
                ];
            }
            else if (s.expression.left instanceof parser_1.IdentifierExpression) {
                return locals.top.set(s.expression.left.value, ex).blocks;
            }
            else
                throw new Error("Must set property");
        }
        else {
            let c = CompileExpr(s.expression, {
                variables,
                functions,
                locals,
                lists,
            });
            //   if (c.pushes >= 1) {
            return [...c.blocks, ...(0, runtime_1.drop)(c.pushes)];
            //   }
        }
    }
    else if (s instanceof parser_1.ReturnStatement) {
        if (s.returns) {
            let r = CompileExpr(s.returns, { variables, functions, locals, lists });
            let m = r.blocks;
            if (r.pushes == 0 && r.isPure())
                m = (0, runtime_1.push)(r.reporter, 0);
            return [...m, ...locals.top.deAllocAll(locals_1.Locals), new scratch_1.StopThisScriot()];
        }
        else {
            return [...locals.top.deAllocAll(locals_1.Locals), new scratch_1.StopThisScriot()];
        }
    }
    else if (s instanceof parser_1.ForeverStatemenet) {
        let _sb = [];
        locals.scope();
        s.statements.forEach((r) => {
            _sb.push(...compileStatement(r, {
                variables,
                functions,
                locals,
                lists,
            }));
        });
        let r = locals.pop().blocks;
        _sb.push(...r);
        sb = [new scratch_1.Forever(_sb)];
    }
    else if (s instanceof parser_1.IfStatement) {
        locals.scope();
        let cond = CompileExpr(s.condition, {
            variables,
            functions,
            locals,
            lists,
        });
        let _sb = [];
        s.iftrue.forEach((r) => {
            _sb.push(...compileStatement(r, {
                variables,
                functions,
                locals,
                lists,
            }));
        });
        let r = locals.pop().blocks;
        _sb.push(...r);
        sb = [
            ...cond.blocks,
            new scratch_1.IfElse(cond.reporter, _sb, []),
            ...(0, runtime_1.drop)(cond.pushes),
        ];
    }
    else if (s instanceof parser_1.IfElseStatement) {
        let cond = CompileExpr(s.condition, {
            variables,
            functions,
            locals,
            lists,
        });
        let _sb = [];
        let _sb1 = [];
        s.iftrue.forEach((r) => {
            _sb.push(...compileStatement(r, {
                variables,
                functions,
                locals,
                lists,
            }));
        });
        s.ifalse.forEach((r) => {
            _sb1.push(...compileStatement(r, {
                variables,
                functions,
                locals,
                lists,
            }));
        });
        sb = [
            ...cond.blocks,
            new scratch_1.IfElse(cond.reporter, _sb, _sb1),
            ...(0, runtime_1.drop)(cond.pushes),
        ];
    }
    else if (s instanceof parser_1.LetStatement) {
        let e = CompileExpr(s.initializer, { variables, functions, locals, lists });
        locals.push([new locals_1.LocalVariable(s.name)]);
        return e.isPure()
            ? [new scratch_1.InsertIntoList(locals_1.Locals, e.reporter, new scratch_1.LiteralNumber(1))]
            : [
                ...e.blocks,
                new scratch_1.InsertIntoList(locals_1.Locals, e.reporter, new scratch_1.LiteralNumber(1)),
                ...(0, runtime_1.drop)(e.pushes),
            ];
    }
    else if (s instanceof parser_1.RepeatStatement) {
        let r = CompileExpr(s.times, { variables, functions, locals, lists });
        let st = s.statements.reduce((e, m) => [
            ...e,
            ...compileStatement(m, { variables, functions, locals, lists }),
        ], []);
        if (r.isPure()) {
            return [new scratch_1.Repeat(r.reporter, st)];
        }
        else {
            return [...r.blocks, new scratch_1.Repeat(r.reporter, st), ...(0, runtime_1.drop)(r.pushes)];
        }
    }
    if (!sb) {
        console.log(s);
        throw new Error("ERROR CANNOT COMPILE BLOCK TYPE ^^");
    }
    return sb;
}
