"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tokenizer = exports.Token = void 0;
var Token;
(function (Token) {
    Token[Token["openParenthesis"] = 0] = "openParenthesis";
    Token[Token["closeParenthesis"] = 1] = "closeParenthesis";
    Token[Token["plus"] = 2] = "plus";
    Token[Token["minus"] = 3] = "minus";
    Token[Token["equals"] = 4] = "equals";
    Token[Token["equals_equals"] = 5] = "equals_equals";
    Token[Token["lessThan"] = 6] = "lessThan";
    Token[Token["greaterThan"] = 7] = "greaterThan";
    Token[Token["number"] = 8] = "number";
    Token[Token["sprite"] = 9] = "sprite";
    Token[Token["loc"] = 10] = "loc";
    Token[Token["func"] = 11] = "func";
    Token[Token["forever"] = 12] = "forever";
    Token[Token["stringLiteral"] = 13] = "stringLiteral";
    Token[Token["openBracket"] = 14] = "openBracket";
    Token[Token["closeBracket"] = 15] = "closeBracket";
    Token[Token["openBrace"] = 16] = "openBrace";
    Token[Token["closeBrace"] = 17] = "closeBrace";
    Token[Token["identifier"] = 18] = "identifier";
    Token[Token["semicolon"] = 19] = "semicolon";
    Token[Token["ret"] = 20] = "ret";
    Token[Token["this"] = 21] = "this";
    Token[Token["period"] = 22] = "period";
    Token[Token["times"] = 23] = "times";
    Token[Token["repeat"] = 24] = "repeat";
    Token[Token["divide"] = 25] = "divide";
    Token[Token["if"] = 26] = "if";
    Token[Token["exclamation"] = 27] = "exclamation";
    Token[Token["else"] = 28] = "else";
    Token[Token["comma"] = 29] = "comma";
    Token[Token["let"] = 30] = "let";
    Token[Token["list"] = 31] = "list";
    Token[Token["or"] = 32] = "or";
    Token[Token["and"] = 33] = "and";
    Token[Token["tilde"] = 34] = "tilde";
})(Token = exports.Token || (exports.Token = {}));
let identifierCharacter = [
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
identifierCharacter = identifierCharacter.concat(identifierCharacter.map((e) => e.toUpperCase()));
const numericCharacter = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
class Tokenizer {
    constructor(s) {
        this.position = 0;
        this.identifier = "";
        this.number = "";
        this.stringLiteral = "";
        this.string = s;
    }
    seeToken() {
        let f = this.position;
        let r = this.getToken();
        this.position = f;
        return r;
    }
    getToken() {
        while ([" ", "\n"].includes(this.string.charAt(this.position)))
            this.position++;
        if (this.ifNextAdvance("("))
            return Token.openParenthesis;
        if (this.ifNextAdvance(")"))
            return Token.closeParenthesis;
        if (this.ifNextAdvance("~"))
            return Token.tilde;
        if (this.ifNextAdvance("<"))
            return Token.lessThan;
        if (this.ifNextAdvance(">"))
            return Token.greaterThan;
        if (this.ifNextAdvance("+"))
            return Token.plus;
        if (this.ifNextAdvance("-"))
            return Token.minus;
        if (this.ifNextAdvance("{"))
            return Token.openBracket;
        if (this.ifNextAdvance("|"))
            return Token.or;
        if (this.ifNextAdvance("&&"))
            return Token.and;
        if (this.ifNextAdvance("}"))
            return Token.closeBracket;
        if (this.ifNextAdvance("["))
            return Token.openBrace;
        if (this.ifNextAdvance("]"))
            return Token.closeBrace;
        if (this.ifNextAdvance(";"))
            return Token.semicolon;
        if (this.ifNextAdvance("=="))
            return Token.equals_equals;
        if (this.ifNextAdvance("="))
            return Token.equals;
        if (this.ifNextAdvance("."))
            return Token.period;
        if (this.ifNextAdvance("*"))
            return Token.times;
        if (this.ifNextAdvance(","))
            return Token.comma;
        if (this.ifNextAdvance("//")) {
            while (this.string.charAt(this.position) != "\n")
                this.position++;
            return this.getToken();
        }
        if (this.ifNextAdvance("/"))
            return Token.divide;
        if (this.ifNextAdvance("if"))
            return Token.if;
        if (this.ifNextAdvance("else"))
            return Token.else;
        if (this.ifNextAdvance("!"))
            return Token.exclamation;
        let newStr = "";
        while (true && this.position < this.string.length) {
            if ((newStr.length != 0
                ? numericCharacter.includes(this.string.charAt(this.position))
                : false) ||
                identifierCharacter.includes(this.string.charAt(this.position))) {
                newStr += this.string.charAt(this.position);
                this.position++;
            }
            else {
                break;
            }
        }
        switch (newStr) {
            case "sprite":
                return Token.sprite;
            case "forever":
                return Token.forever;
            case "loc":
                return Token.loc;
            case "func":
                return Token.func;
            case "repeat":
                return Token.repeat;
            case "ret":
                return Token.ret;
            case "this":
                return Token.this;
            case "let":
                return Token.let;
            case "list":
                return Token.list;
            default:
                if (newStr.length > 0) {
                    this.identifier = newStr;
                    return Token.identifier;
                }
        }
        if (this.ifNextAdvance(`"`)) {
            let newStr = "";
            while (this.position < this.string.length) {
                if ('"' != this.string.charAt(this.position)) {
                    newStr += this.string.charAt(this.position);
                    this.position++;
                }
                else {
                    this.position++;
                    break;
                }
            }
            //   console.log(newStr);
            this.stringLiteral = newStr;
            return Token.stringLiteral;
        }
        let newNum = "";
        let gotPeriod = false;
        while (true && this.position < this.string.length) {
            if (numericCharacter.includes(this.string.charAt(this.position))) {
                newNum += this.string.charAt(this.position);
                this.position++;
            }
            else if (this.string.charAt(this.position) == "." && !gotPeriod) {
                gotPeriod = true;
                newNum += ".";
                this.position++;
            }
            else {
                break;
            }
        }
        if (newNum.length > 0) {
            this.number = newNum;
            return Token.number;
        }
        else {
            throw new Error("Unknown token: `" +
                this.string.slice(this.position, this.position + 10) +
                "`");
        }
    }
    isNext(r) {
        return this.string.slice(this.position, this.position + r.length) == r;
    }
    ifNextAdvance(r) {
        if (this.isNext(r)) {
            this.position += r.length;
            return true;
        }
        else {
            return false;
        }
    }
    skipToTokEnd() { }
}
exports.Tokenizer = Tokenizer;
