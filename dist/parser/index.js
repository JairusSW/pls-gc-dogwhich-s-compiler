"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = exports.SpriteDeclaration = exports.ExpressionStatement = exports.FunctionDeclaration = exports.UnaryExpression = exports.UnaryExpressionType = exports.BinaryExpression = exports.FunctionCallExpression = exports.BinaryExpressionType = exports.AssignmentExpression = exports.ArrayAccessExpression = exports.FieldDeclaration = exports.ThisExpression = exports.IdentifierExpression = exports.LetStatement = exports.PropertyAccessExpression = exports.ReturnStatement = exports.IfElseStatement = exports.RepeatStatement = exports.ForeverStatemenet = exports.IfStatement = exports.StringExpression = exports.NumericExpression = void 0;
const assert_1 = __importDefault(require("assert"));
const tokenizer_1 = require("../tokenizer");
class NumericExpression {
    constructor(value) {
        this.value = value;
    }
}
exports.NumericExpression = NumericExpression;
class StringExpression {
    constructor(value) {
        this.value = value;
    }
}
exports.StringExpression = StringExpression;
class IfStatement {
    constructor(condition, iftrue) {
        this.condition = condition;
        this.iftrue = iftrue;
    }
}
exports.IfStatement = IfStatement;
class ForeverStatemenet {
    constructor(statements) {
        this.statements = statements;
    }
}
exports.ForeverStatemenet = ForeverStatemenet;
class RepeatStatement {
    constructor(times, statements) {
        this.times = times;
        this.statements = statements;
    }
}
exports.RepeatStatement = RepeatStatement;
class IfElseStatement {
    constructor(condition, iftrue, ifalse) {
        this.condition = condition;
        this.iftrue = iftrue;
        this.ifalse = ifalse;
    }
}
exports.IfElseStatement = IfElseStatement;
class ReturnStatement {
    constructor(returns) {
        this.returns = returns;
    }
}
exports.ReturnStatement = ReturnStatement;
class PropertyAccessExpression {
    constructor(left, right) {
        this.left = left;
        this.right = right;
    }
}
exports.PropertyAccessExpression = PropertyAccessExpression;
class LetStatement {
    constructor(name, initializer) {
        this.name = name;
        this.initializer = initializer;
    }
}
exports.LetStatement = LetStatement;
class IdentifierExpression {
    constructor(value) {
        this.value = value;
    }
}
exports.IdentifierExpression = IdentifierExpression;
class ThisExpression {
    constructor() { }
}
exports.ThisExpression = ThisExpression;
class FieldDeclaration {
    constructor(name, list = false) {
        this.list = list;
        this.name = name;
    }
}
exports.FieldDeclaration = FieldDeclaration;
class ArrayAccessExpression {
    constructor(accessing, index) {
        this.accessing = accessing;
        this.index = index;
    }
}
exports.ArrayAccessExpression = ArrayAccessExpression;
class AssignmentExpression {
    constructor(left, right) {
        this.left = left;
        this.right = right;
    }
}
exports.AssignmentExpression = AssignmentExpression;
var BinaryExpressionType;
(function (BinaryExpressionType) {
    BinaryExpressionType[BinaryExpressionType["plus"] = 0] = "plus";
    BinaryExpressionType[BinaryExpressionType["minus"] = 1] = "minus";
    BinaryExpressionType[BinaryExpressionType["times"] = 2] = "times";
    BinaryExpressionType[BinaryExpressionType["equals_equals"] = 3] = "equals_equals";
    BinaryExpressionType[BinaryExpressionType["less_than"] = 4] = "less_than";
    BinaryExpressionType[BinaryExpressionType["or"] = 5] = "or";
    BinaryExpressionType[BinaryExpressionType["and"] = 6] = "and";
    BinaryExpressionType[BinaryExpressionType["greater_than"] = 7] = "greater_than";
    BinaryExpressionType[BinaryExpressionType["divide"] = 8] = "divide";
    BinaryExpressionType[BinaryExpressionType["join"] = 9] = "join";
})(BinaryExpressionType = exports.BinaryExpressionType || (exports.BinaryExpressionType = {}));
class FunctionCallExpression {
    constructor(calling, parameters) {
        this.calling = calling;
        this.parameters = parameters;
    }
}
exports.FunctionCallExpression = FunctionCallExpression;
class BinaryExpression {
    constructor(left, right, type) {
        this.left = left;
        this.right = right;
        this.type = type;
    }
}
exports.BinaryExpression = BinaryExpression;
var UnaryExpressionType;
(function (UnaryExpressionType) {
    UnaryExpressionType[UnaryExpressionType["not"] = 0] = "not";
    UnaryExpressionType[UnaryExpressionType["negative"] = 1] = "negative";
})(UnaryExpressionType = exports.UnaryExpressionType || (exports.UnaryExpressionType = {}));
class UnaryExpression {
    constructor(expression, type) {
        this.expression = expression;
        this.type = type;
    }
}
exports.UnaryExpression = UnaryExpression;
class FunctionDeclaration {
    constructor(name, statements = [], parameters = []) {
        this.name = name;
        this.statements = statements;
        this.parameters = parameters;
    }
}
exports.FunctionDeclaration = FunctionDeclaration;
class ExpressionStatement {
    constructor(expression) {
        this.expression = expression;
    }
}
exports.ExpressionStatement = ExpressionStatement;
class SpriteDeclaration {
    constructor(name, fields, functions) {
        this.name = name;
        this.fields = fields;
        this.functions = functions;
    }
}
exports.SpriteDeclaration = SpriteDeclaration;
class Parser {
    constructor(tokenizer) {
        this.tokenizer = tokenizer;
    }
    parseTopLevelStatement() {
        let tok;
        switch ((tok = this.tokenizer.seeToken())) {
            case tokenizer_1.Token.sprite:
                return this.parseSpriteDefinition();
                break;
            default:
                throw new Error(`Unexpected ${tokenizer_1.Token[tok]}...`);
                break;
        }
    }
    parseSpriteDefinition() {
        /** Check for 'sprite' keyword: */
        if (this.tokenizer.getToken() != tokenizer_1.Token.sprite)
            throw new Error("ERROR: KEYWORD IS NOT SPRITE");
        this.assert(this.tokenizer.getToken() == tokenizer_1.Token.identifier, "sprite must be followed by identifier");
        let name = this.tokenizer.identifier;
        this.assert(this.tokenizer.getToken() == tokenizer_1.Token.openBracket, "sprite name must be followed by opening bracket");
        let internalStatements = [];
        let fields = [];
        let functions = [];
        while (this.tokenizer.seeToken() != tokenizer_1.Token.closeBracket) {
            let m = this.parseSpriteStatement();
            if (m instanceof FieldDeclaration)
                fields.push(m);
            else if (m instanceof FunctionDeclaration)
                functions.push(m);
            else
                this.assert(false, "Unreachable");
        }
        // console.log(
        //   this.tokenizer.string.slice(
        //     this.tokenizer.position - 10,
        //     this.tokenizer.position + 10
        //   )
        // );
        this.assert(this.tokenizer.getToken() == tokenizer_1.Token.closeBracket, "Sprite definititon must be followed by closing bracket");
        this.assert(this.tokenizer.getToken() == tokenizer_1.Token.semicolon, "Sprite definition must be followed by semicolon");
        return new SpriteDeclaration(name, fields, functions);
    }
    assert(value, reason) {
        if (!value)
            throw new Error(`Assertation failed: ${reason} @${this.tokenizer.string.slice(this.tokenizer.position - 5, this.tokenizer.position + 10)}`);
    }
    parseSpriteStatement() {
        switch (this.tokenizer.seeToken()) {
            case tokenizer_1.Token.loc:
                this.tokenizer.getToken();
                let isList = this.tokenizer.seeToken() == tokenizer_1.Token.list
                    ? (this.tokenizer.getToken(), true)
                    : false;
                this.assert(this.tokenizer.getToken() == tokenizer_1.Token.identifier, "Local parameter declaration must be followed by identifier");
                let name = this.tokenizer.identifier;
                this.assert(this.tokenizer.getToken() == tokenizer_1.Token.semicolon, "Statements must be followed by semicolons");
                return new FieldDeclaration(name, isList);
                break;
            case tokenizer_1.Token.func:
                this.tokenizer.getToken();
                this.assert(this.tokenizer.getToken() == tokenizer_1.Token.identifier, "Function declaration must be followed by identifier");
                let fname = this.tokenizer.identifier;
                this.assert(this.tokenizer.getToken() == tokenizer_1.Token.openParenthesis, "Function  declarations must have ()");
                let params = [];
                if (this.tokenizer.seeToken() == tokenizer_1.Token.identifier) {
                    while (this.tokenizer.seeToken() != tokenizer_1.Token.closeParenthesis) {
                        if (this.tokenizer.getToken() == tokenizer_1.Token.identifier) {
                            let ident = new IdentifierExpression(this.tokenizer.identifier);
                            params.push(ident);
                            if (this.tokenizer.seeToken() == tokenizer_1.Token.closeParenthesis)
                                break;
                            if (this.tokenizer.getToken() != tokenizer_1.Token.comma)
                                throw new Error("Parameters must be seperated by commas.");
                        }
                        else
                            throw new Error("ERROR:  parameter was not identifier token.");
                    }
                }
                this.assert(this.tokenizer.getToken() == tokenizer_1.Token.closeParenthesis, "Function  declarations must have ()");
                this.assert(this.tokenizer.getToken() == tokenizer_1.Token.openBracket, "Function  declarations must have { after ()");
                let fnStatements = [];
                while (this.tokenizer.seeToken() != tokenizer_1.Token.closeBracket) {
                    fnStatements.push(this.parseFunctionStatement());
                }
                this.tokenizer.getToken();
                return new FunctionDeclaration(fname, fnStatements, params);
                break;
            default:
                throw new Error("ERROR: UNEXPECTED TOKEN : " + tokenizer_1.Token[this.tokenizer.seeToken()]);
                break;
        }
    }
    parseForeverStatement() {
        this.assert(this.tokenizer.getToken() == tokenizer_1.Token.forever, " forever must be started by forever... [compiler logic error]");
        this.assert(this.tokenizer.getToken() == tokenizer_1.Token.openBracket, " Forever must be followed by block");
        let istatements = [];
        while (this.tokenizer.seeToken() != tokenizer_1.Token.closeBracket) {
            istatements.push(this.parseFunctionStatement());
        }
        this.tokenizer.getToken();
        return new ForeverStatemenet(istatements);
    }
    parseIfStatement() {
        this.assert(this.tokenizer.getToken() == tokenizer_1.Token.if, " If must be started by if... [compiler logic error]");
        this.assert(this.tokenizer.getToken() == tokenizer_1.Token.openParenthesis, " If must be followed by parenthesis");
        let cond = this.parseExpression();
        this.assert(this.tokenizer.getToken() == tokenizer_1.Token.closeParenthesis, " If must be followed by parenthesis");
        this.assert(this.tokenizer.getToken() == tokenizer_1.Token.openBracket, " If must be followed by block");
        let istatements = [];
        while (this.tokenizer.seeToken() != tokenizer_1.Token.closeBracket) {
            istatements.push(this.parseFunctionStatement());
        }
        this.tokenizer.getToken();
        // console.log(Token[this.tokenizer.seeToken()]);
        // console.log(Token[this.tokenizer.seeToken()]);
        if (this.tokenizer.seeToken() == tokenizer_1.Token.else) {
            this.tokenizer.getToken();
            switch (this.tokenizer.seeToken()) {
                case tokenizer_1.Token.openBracket:
                    this.tokenizer.getToken();
                    let ielse = [];
                    while (this.tokenizer.seeToken() != tokenizer_1.Token.closeBracket) {
                        ielse.push(this.parseFunctionStatement());
                    }
                    this.tokenizer.getToken();
                    return new IfElseStatement(cond, istatements, ielse);
                    break;
                case tokenizer_1.Token.if:
                    // this.tokenizer.getToken();
                    return new IfElseStatement(cond, istatements, [
                        this.parseIfStatement(),
                    ]);
                    break;
                default:
                    throw new Error("Else must be followed by a `{` or a `if` token");
                    break;
            }
        }
        else {
            return new IfStatement(cond, istatements);
        }
    }
    parseFunctionStatement() {
        switch (this.tokenizer.seeToken()) {
            case tokenizer_1.Token.ret:
                this.tokenizer.getToken();
                if (this.tokenizer.seeToken() == tokenizer_1.Token.semicolon) {
                    this.tokenizer.getToken();
                    return new ReturnStatement();
                }
                else {
                    let expr = this.parseExpression();
                    this.assert(this.tokenizer.getToken() == tokenizer_1.Token.semicolon, " ret statements must be followed by semicolon");
                    return new ReturnStatement(expr);
                }
                break;
            case tokenizer_1.Token.repeat:
                this.tokenizer.getToken();
                this.assert(this.tokenizer.getToken() == tokenizer_1.Token.openParenthesis, "Repeat must be followed by (");
                let expr = this.parseExpression();
                this.assert(this.tokenizer.getToken() == tokenizer_1.Token.closeParenthesis, "Repeat must be followed by )");
                this.assert(this.tokenizer.getToken() == tokenizer_1.Token.openBracket, "Repeat must be followed by {");
                let statements = [];
                while (this.tokenizer.seeToken() != tokenizer_1.Token.closeBracket) {
                    statements.push(this.parseFunctionStatement());
                }
                this.assert(this.tokenizer.getToken() == tokenizer_1.Token.closeBracket, "Repeat must be followed by }");
                return new RepeatStatement(expr, statements);
                break;
            case tokenizer_1.Token.let:
                this.tokenizer.getToken();
                (0, assert_1.default)(this.tokenizer.getToken() == tokenizer_1.Token.identifier, "'let' must be followed by identifier.");
                let name = this.tokenizer.identifier;
                (0, assert_1.default)(this.tokenizer.getToken() == tokenizer_1.Token.equals, "Let `identifier` must be followed by equal");
                let initializer = this.parseExpression();
                this.assert(this.tokenizer.getToken() == tokenizer_1.Token.semicolon, " let statements must be followed by semicolon");
                return new LetStatement(name, initializer);
                break;
            case tokenizer_1.Token.if:
                // this.tokenizer.getToken();
                let m = this.parseIfStatement();
                console.log(tokenizer_1.Token[this.tokenizer.seeToken()]);
                return m;
                break;
            case tokenizer_1.Token.forever:
                return this.parseForeverStatement();
                break;
            default:
                let f = this.parseExpression();
                this.assert(this.tokenizer.getToken() == tokenizer_1.Token.semicolon, " expression statements must be followed by semicolon");
                return new ExpressionStatement(f);
                break;
        }
    }
    parseExpression() {
        let _expr = this.parseExpressionSimple();
        Mloop: while (true) {
            switch (this.tokenizer.seeToken()) {
                case tokenizer_1.Token.openBrace:
                    this.tokenizer.getToken();
                    let expr = this.parseExpression();
                    this.assert(this.tokenizer.getToken() == tokenizer_1.Token.closeBrace, "Array acess must be closed");
                    _expr = new ArrayAccessExpression(_expr, expr);
                    break;
                case tokenizer_1.Token.openParenthesis:
                    this.tokenizer.getToken();
                    if (this.tokenizer.seeToken() == tokenizer_1.Token.closeParenthesis) {
                        this.tokenizer.getToken();
                        _expr = new FunctionCallExpression(_expr, []);
                    }
                    else {
                        let params = [];
                        while (this.tokenizer.seeToken() != tokenizer_1.Token.closeParenthesis) {
                            params.push(this.parseExpression());
                            if (this.tokenizer.seeToken() == tokenizer_1.Token.comma)
                                this.tokenizer.getToken();
                        }
                        this.tokenizer.getToken();
                        _expr = new FunctionCallExpression(_expr, params);
                    }
                    break;
                case tokenizer_1.Token.equals:
                    this.tokenizer.getToken();
                    _expr = new AssignmentExpression(_expr, this.parseExpression());
                    break;
                case tokenizer_1.Token.equals_equals:
                    this.tokenizer.getToken();
                    _expr = new BinaryExpression(_expr, this.parseExpression(), BinaryExpressionType.equals_equals);
                    break;
                case tokenizer_1.Token.or:
                    this.tokenizer.getToken();
                    _expr = new BinaryExpression(_expr, this.parseExpression(), BinaryExpressionType.or);
                    break;
                case tokenizer_1.Token.and:
                    this.tokenizer.getToken();
                    _expr = new BinaryExpression(_expr, this.parseExpression(), BinaryExpressionType.and);
                    break;
                case tokenizer_1.Token.lessThan:
                    this.tokenizer.getToken();
                    _expr = new BinaryExpression(_expr, this.parseExpression(), BinaryExpressionType.less_than);
                    break;
                case tokenizer_1.Token.greaterThan:
                    this.tokenizer.getToken();
                    _expr = new BinaryExpression(_expr, this.parseExpression(), BinaryExpressionType.greater_than);
                    break;
                case tokenizer_1.Token.plus:
                    this.tokenizer.getToken();
                    _expr = new BinaryExpression(_expr, this.parseExpression(), BinaryExpressionType.plus);
                    break;
                case tokenizer_1.Token.tilde:
                    this.tokenizer.getToken();
                    _expr = new BinaryExpression(_expr, this.parseExpression(), BinaryExpressionType.join);
                    break;
                case tokenizer_1.Token.minus:
                    this.tokenizer.getToken();
                    _expr = new BinaryExpression(_expr, this.parseExpression(), BinaryExpressionType.minus);
                    break;
                case tokenizer_1.Token.times:
                    this.tokenizer.getToken();
                    _expr = new BinaryExpression(_expr, this.parseExpression(), BinaryExpressionType.times);
                    break;
                case tokenizer_1.Token.divide:
                    this.tokenizer.getToken();
                    _expr = new BinaryExpression(_expr, this.parseExpression(), BinaryExpressionType.divide);
                    break;
                case tokenizer_1.Token.period:
                    this.tokenizer.getToken();
                    let right = this.parseIdentifier();
                    _expr = new PropertyAccessExpression(_expr, right);
                    break;
                default:
                    break Mloop;
            }
        }
        return _expr;
    }
    parseIdentifier() {
        this.assert(this.tokenizer.getToken() == tokenizer_1.Token.identifier, "Must be identifier");
        return new IdentifierExpression(this.tokenizer.identifier);
    }
    /** No extensions/binary operators (=/+)
     * unary operators are here
     */
    parseExpressionSimple() {
        let tok = this.tokenizer.getToken();
        switch (tok) {
            case tokenizer_1.Token.stringLiteral:
                return new StringExpression(this.tokenizer.stringLiteral);
                break;
            case tokenizer_1.Token.openParenthesis:
                let tr = this.parseExpression();
                this.assert(this.tokenizer.getToken() == tokenizer_1.Token.closeParenthesis, "Parenthesis must be closed...");
                return tr;
                break;
            case tokenizer_1.Token.number:
                return new NumericExpression(this.tokenizer.number);
            case tokenizer_1.Token.this:
                return new ThisExpression();
                break;
            case tokenizer_1.Token.identifier:
                return new IdentifierExpression(this.tokenizer.identifier);
                break;
            case tokenizer_1.Token.exclamation:
                let expr = this.parseExpressionSimple();
                return new UnaryExpression(expr, UnaryExpressionType.not);
                break;
            case tokenizer_1.Token.minus:
                let _expr = this.parseExpression();
                if (_expr instanceof NumericExpression)
                    return (_expr.value = "-" + _expr.value), _expr;
                return new UnaryExpression(_expr, UnaryExpressionType.negative);
                break;
            default:
                throw new Error("ERROR: Unexpected " + tokenizer_1.Token[tok] + " when parsing expression");
                break;
        }
    }
}
exports.Parser = Parser;
