import fetch from 'node-fetch';
import {
  Generator,
  GeneratorFunction,
  GeneratorOption,
  IPMGenerator,
  IPMOutput,
  IPMResponse,
  isIPMFunction,
} from '../generator/types';
import { ChatCompletionRequestMessage } from 'openai';

type InputOptions<O extends GeneratorOption[]> = {
  [K in O[number]['name']]: Extract<
    O[number],
    { name: K }
  >['type'] extends 'string'
    ? string
    : Extract<O[number], { name: K }>['type'] extends 'number'
    ? number
    : Extract<O[number], { name: K }>['type'] extends 'boolean'
    ? boolean
    : Extract<O[number], { name: K }>['type'] extends 'object'
    ? object
    : Extract<O[number], { name: K }>['type'] extends 'array'
    ? any[]
    : never;
};

type GenerationProps<O extends GeneratorOption[]> = {
  data: any;
  options: InputOptions<O>;
  history?: ChatCompletionRequestMessage[];
};

class IPM<O extends GeneratorOption[]> {
  private generator: IPMGenerator<O>;

  constructor({ generator }: IPMProps<O>) {
    this.generator = generator;
  }

  private async _generate({
    data,
    options,
    history,
  }: GenerationProps<O>): Promise<IPMOutput> {
    try {
      const functions: GeneratorFunction[] =
        this.generator.instructions.functions.map((f) => {
          if (isIPMFunction(f)) {
            return {
              name: f.function.name,
              description: f.description,
              arguments: f.function.arguments,
              chain: f.chain,
              type: 'external',
            };
          } else {
            return f;
          }
        });

      const generator: Generator = {
        ...this.generator,
        instructions: {
          ...this.generator.instructions,
          functions,
        },
        data,
        options,
        history: [...(history || [])],
      };

      const result = await fetch('http://localhost:3000/generate', {
        method: 'POST',
        body: JSON.stringify(generator),
      });

      const output: IPMResponse = (await result.json()) as IPMResponse;

      if (output.type === 'function') {
        const f = this.generator.instructions.functions
          .filter(isIPMFunction)
          .find((f) => f.function.name === output.data.name);
        if (!f) {
          throw new Error('Function not found');
        }

        const funcResult = await f.function(output.data.arguments);

        if (f.chain) {
          return this._generate({
            data,
            options,
            history: [
              ...(history || []),
              {
                role: 'assistant',
                function_call: output.data,
              },
              {
                role: 'function',
                name: f.function.name,
                content: JSON.stringify(funcResult),
              },
            ],
          });
        }

        return {
          ...output,
          result: funcResult,
        };
      }

      return output;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  public async generate(props: GenerationProps<O>) {
    return this._generate(props);
  }
}

type IPMProps<O extends GeneratorOption[]> = {
  generator: IPMGenerator<O>;
};

export function createIPM<O extends GeneratorOption[]>(
  props: IPMProps<O>,
): IPM<O> {
  return new IPM(props);
}
