"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Project = void 0;
const fs_1 = __importDefault(require("fs"));
exports.Project = JSON.parse(fs_1.default.readFileSync("./ex/fns/project.json").toString());
// console.log(Project.targets[0].blocks[`tSw^g0JT+.gJ9z/MAzJ!`].inputs);
// console.log(Project.targets[0].blocks["`0v2-l9%%~07#FAsP3*b"]);
// console.log(Project.targets[0].blocks["^t=H!_p;XM-x?b5=@P~%"]);
