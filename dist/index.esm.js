/*!
 * otomat-client-ts v0.1.0
 * (c) Otomat
 * Released under the GNU License.
 */

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
}

var GENERATOR_MODELS = [
    'gpt-3.5-turbo',
    'gpt-4',
    'gpt-3.5-turbo-16k',
    'gpt-4-32k',
];
function isOGCFunction(functionToCheck) {
    return functionToCheck.function !== undefined;
}

var OGC = /** @class */ (function () {
    function OGC(_a) {
        var generator = _a.generator;
        this.generator = generator;
    }
    OGC.prototype._generate = function (_a) {
        var data = _a.data, options = _a.options, history = _a.history;
        return __awaiter(this, void 0, void 0, function () {
            var functions, generator, result, output_1, f, funcResult, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        functions = this.generator.instructions.functions.map(function (f) {
                            if (isOGCFunction(f)) {
                                return {
                                    name: f.function.name,
                                    description: f.description,
                                    arguments: f.function.arguments,
                                    chain: f.chain,
                                    type: 'external',
                                };
                            }
                            else {
                                return f;
                            }
                        });
                        generator = __assign(__assign({}, this.generator), { instructions: __assign(__assign({}, this.generator.instructions), { functions: functions }), data: data, options: options, history: __spreadArray([], (history || []), true) });
                        return [4 /*yield*/, fetch('http://localhost:3000/generate', {
                                method: 'POST',
                                body: JSON.stringify(generator),
                            })];
                    case 1:
                        result = _b.sent();
                        return [4 /*yield*/, result.json()];
                    case 2:
                        output_1 = (_b.sent());
                        if (!(output_1.type === 'function')) return [3 /*break*/, 4];
                        f = this.generator.instructions.functions
                            .filter(isOGCFunction)
                            .find(function (f) { return f.function.name === output_1.data.name; });
                        if (!f) {
                            throw new Error('Function not found');
                        }
                        return [4 /*yield*/, f.function(output_1.data.arguments)];
                    case 3:
                        funcResult = _b.sent();
                        if (f.chain) {
                            return [2 /*return*/, this._generate({
                                    data: data,
                                    options: options,
                                    history: __spreadArray(__spreadArray([], (history || []), true), [
                                        {
                                            role: 'assistant',
                                            function_call: output_1.data,
                                        },
                                        {
                                            role: 'function',
                                            name: f.function.name,
                                            content: JSON.stringify(funcResult),
                                        },
                                    ], false),
                                })];
                        }
                        return [2 /*return*/, __assign(__assign({}, output_1), { result: funcResult })];
                    case 4: return [2 /*return*/, output_1];
                    case 5:
                        err_1 = _b.sent();
                        console.error(err_1);
                        throw err_1;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    OGC.prototype.generate = function (props) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._generate(props)];
            });
        });
    };
    return OGC;
}());
function createOGC(props) {
    return new OGC(props);
}

var modules = {
    analysis: {
        options: {},
    },
    compliance: {
        options: {
            retry: {
                default: true,
                required: false,
                description: 'Whether to retry the command if the response is invalid',
            },
        },
    },
};

export { GENERATOR_MODELS, createOGC, isOGCFunction, modules };
//# sourceMappingURL=index.esm.js.map
