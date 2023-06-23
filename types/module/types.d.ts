import { ChatCompletionFunctions, ChatCompletionRequestMessageFunctionCall } from 'openai';
import { GeneratorModel, GeneratorModule } from '../generator/types';
export type ModuleNames = keyof typeof modules;
export type ModuleOptionDefinition<T extends string | number | boolean> = {
    default: T;
    required: boolean;
    description: string;
};
export type ModuleOptionValue<T extends ModuleNames> = {
    [K in keyof typeof modules[T]['options']]?: typeof modules[T]['options'][K] extends ModuleOptionDefinition<infer R> ? R : never;
};
export type Module<T extends Record<string, ModuleOptionDefinition<any>>> = {
    options: T;
};
export declare const modules: Record<string, Module<Record<string, ModuleOptionDefinition<any>>>>;
export type BaseProcessInfo = {
    module: string;
    options: ModuleOptionValue<any>;
};
export type SuccesfulProcessInfo = BaseProcessInfo & {
    status: 'success';
};
export type FailedProcessInfo = BaseProcessInfo & {
    status: 'failed';
    error: string;
};
export type ProcessInfo = SuccesfulProcessInfo | FailedProcessInfo;
export type Meta = {
    version: string;
    model: GeneratorModel;
    cost: number;
    retries: number;
    process: {
        [P in keyof typeof modules]?: ProcessInfo;
    };
};
type BaseCompletion = {
    cost: number;
    retries: number;
};
type JSONCompletion = BaseCompletion & {
    type: 'json';
    data: any;
};
type FunctionCompletion = BaseCompletion & {
    type: 'function';
    function: ChatCompletionFunctions;
    chain: boolean;
    data: ChatCompletionRequestMessageFunctionCall;
};
type ErrorCompletion = BaseCompletion & {
    type: 'error';
    error: any;
};
export type SuccesfulCompletion = JSONCompletion | FunctionCompletion;
export type Completion = SuccesfulCompletion | ErrorCompletion;
type BaseOperatorData = {
    generator: Generator;
    modules: GeneratorModule<ModuleNames>[];
    meta: Meta;
};
export type PreOperatorData = BaseOperatorData;
export type PostOperatorData = BaseOperatorData & {
    completion: SuccesfulCompletion;
};
type BaseOperatorSuccess = {
    success: true;
    generator: Generator;
    meta: Meta;
};
type PreOperatorSuccess = BaseOperatorSuccess;
type PostOperatorSuccess = BaseOperatorSuccess & {
    completion: Completion;
};
type OperatorError = {
    success: false;
    error: string;
    meta: Meta;
};
type PreOperatorError = OperatorError;
type PostOperatorError = OperatorError & {
    retry: boolean;
};
export type PreOperatorResult = PreOperatorSuccess | PreOperatorError;
export type PostOperatorResult = PostOperatorSuccess | PostOperatorError;
export {};
//# sourceMappingURL=types.d.ts.map