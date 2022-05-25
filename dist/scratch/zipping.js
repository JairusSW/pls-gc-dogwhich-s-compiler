"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveProject = void 0;
const jszip_1 = __importDefault(require("jszip"));
const fs_1 = __importDefault(require("fs"));
const promises_1 = require("fs/promises");
function saveProject(p) {
    let r = new jszip_1.default();
    let sb3 = fs_1.default.readFileSync("./ex/bbn.zip");
    r.loadAsync(sb3).then(async (e) => {
        e.file("project.json", p);
        fs_1.default.writeFileSync("./ex/dist/project.sb3", await e.generateAsync({ platform: "UNIX", type: "uint8array" }));
        await (0, promises_1.writeFile)("./out/project.json", p);
        // console.log(JSON.parse(await e.files["project.json"].async("string")));
    });
}
exports.saveProject = saveProject;
