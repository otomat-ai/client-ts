import { JSONSchema7 } from 'json-schema';
import { Meta, ModuleNames, ModuleOptionValue } from '../module/types';
import { ChatCompletionRequestMessage } from 'openai';

export const GENERATOR_MODELS = [
  'gpt-3.5-turbo',
  'gpt-4',
  'gpt-3.5-turbo-16k',
  'gpt-4-32k',
] as const;

export type GeneratorModel = typeof GENERATOR_MODELS[number];

export type GeneratorSettings = {
  context: 'default' | 'full';
  model?: GeneratorModel;
  retries?: number;
  apiKey: string;
};

export type GeneratorInstructions = {
  prompt: string;
  context?: string;
  examples?: GeneratorExample[];
  options?: GeneratorOption[];
  output: GeneratorOutput | GeneratorOutput[];
  functions?: GeneratorFunction[];
};

export type GeneratorExample = {
  input: string;
  output: string;
};

export type GeneratorModule<T extends ModuleNames> = {
  name: T;
  options?: ModuleOptionValue<T>;
  inputReference?: any;
  outputReference?: any;
};

export type GeneratorFlowGenerateOption = {
  type: 'generate';
};

export type GeneratorFlowProcessOption = {
  type: 'process';
  module: GeneratorModule<any>;
};

export type GeneratorFlowOption =
  | GeneratorFlowGenerateOption
  | GeneratorFlowProcessOption;

export type GeneratorFlow = GeneratorFlowOption[];

export type GeneratorOutput = {
  description?: string;
  schema: JSONSchema7;
};

export type GeneratorOption = {
  name: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  constant: boolean;
  default?: any;
};

export type GeneratorFunctionArgument = {
  name: string;
  description?: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  default?: any;
};

export type BaseGeneratorFunction = {
  name: string;
  description: string;
  arguments: GeneratorFunctionArgument[];
  chain: boolean;
};

export type GeneratorEndpointFunction = BaseGeneratorFunction & {
  type: 'endpoint';
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  payload: 'query' | 'body';
  headers?: Record<string, string>;
};

export type GeneratorExternalFunction = BaseGeneratorFunction & {
  type: 'external';
};

export type OGCFunction = {
  function: Function;
  description: string;
  chain: boolean;
};

export type GeneratorFunction =
  | GeneratorEndpointFunction
  | GeneratorExternalFunction;

export type OGCGeneratorFunction = GeneratorEndpointFunction | OGCFunction;

export type Generator = {
  instructions: GeneratorInstructions;
  settings: GeneratorSettings;
  flow?: GeneratorFlow;
  data: any;
  options?: Record<string, any>;
  history?: ChatCompletionRequestMessage[];
};

export type OGCGenerator<O extends GeneratorOption[]> = Omit<
  Generator,
  'instructions' | 'data' | 'options' | 'history'
> & {
  instructions: Omit<GeneratorInstructions, 'functions' | 'options'> & {
    functions: OGCGeneratorFunction[];
    options?: O;
  };
};

export function isOGCFunction(
  functionToCheck: OGCGeneratorFunction,
): functionToCheck is OGCFunction {
  return (functionToCheck as OGCFunction).function !== undefined;
}

export type BaseOGCResponse = {
  meta: Meta;
};

export type OGCFunctionResponse = BaseOGCResponse & {
  type: 'function';
  data: {
    name: string;
    arguments: string;
    chain: boolean;
  };
};

export type OGCJSONResponse = BaseOGCResponse & {
  type: 'json';
  data: any;
};

export type OGCResponse = OGCFunctionResponse | OGCJSONResponse;

export type OGCFunctionOutput = OGCFunctionResponse & {
  result: any;
};

export type OGCOutput = OGCFunctionOutput | OGCJSONResponse;
