import fetch from 'node-fetch';
import {
  Generator,
  GeneratorFunction,
  GeneratorOption,
  OGCGenerator,
  OGCOutput,
  OGCResponse,
  isOGCFunction,
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

class OGC<O extends GeneratorOption[]> {
  private generator: OGCGenerator<O>;

  constructor({ generator }: OGCProps<O>) {
    this.generator = generator;
  }

  private async _generate({
    data,
    options,
    history,
  }: GenerationProps<O>): Promise<OGCOutput> {
    try {
      const functions: GeneratorFunction[] =
        this.generator.instructions.functions.map((f) => {
          if (isOGCFunction(f)) {
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

      const output: OGCResponse = (await result.json()) as OGCResponse;

      if (output.type === 'function') {
        const f = this.generator.instructions.functions
          .filter(isOGCFunction)
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

type OGCProps<O extends GeneratorOption[]> = {
  generator: OGCGenerator<O>;
};

export function createOGC<O extends GeneratorOption[]>(
  props: OGCProps<O>,
): OGC<O> {
  return new OGC(props);
}
