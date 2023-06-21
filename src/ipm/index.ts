import fetch from 'node-fetch';
import {
  Generator,
  GeneratorFunction,
  GeneratorModule,
  IPMGenerator,
  IPMOutput,
  IPMResponse,
  isIPMFunction,
} from '../generator/types';
import {
  CustomModule,
  PostOperatorData,
  PostOperatorResult,
} from '../module/types';
import { ChatCompletionRequestMessage } from 'openai';

type GenerationProps = {
  data: any;
  options: Record<string, any>;
  history?: ChatCompletionRequestMessage[];
};

class IPM {
  private generator: IPMGenerator;

  constructor({ generator }: IPMProps) {
    this.generator = generator;
  }

  private async _generate({
    data,
    options,
    history,
  }: GenerationProps): Promise<IPMOutput> {
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

  public async generate(props: GenerationProps) {
    return this._generate(props);
  }

  public async generateWithCallback(props: GenerationProps, callback: any) {
    const output = await this._generate(props);

    return callback(output);
  }
}

type IPMProps = {
  generator: IPMGenerator;
  customModules?: CustomModule<any>[];
};

function createIPM(props: IPMProps): IPM {
  return new IPM(props);
}

function testfunction() {}

const healthIPM = createIPM({
  // IPM = Intelligent Programmatic Module
  generator: {
    instructions: {
      prompt:
        'Hello, I am a health generator. I can generate health related text.',
      context: 'I am a health generator.',
      output: {
        description: 'The generated text',
        schema: {}, // Handle schema generation
      },
      functions: [
        {
          function: testfunction,
          description: 'A test function',
          chain: true,
        },
      ],
      options: [
        {
          name: 'language',
          description: 'The language to generate in',
          type: 'string',
          constant: false,
          default: 'english',
        },
      ],
    },
    settings: {
      model: 'gpt-4',
      context: 'default',
      apiKey: '123',
    },
    flow: [
      {
        type: 'generate',
      },
      {
        type: 'process',
        module: {
          name: 'compliance',
        },
      },
    ],
    customModules: [
      {
        type: 'post',
        name: 'Moderate',
        key: 'moderate',
        description: 'Moderate the output',
        operator: // todo
      },
    ],
  },
});

healthIPM.generateWithCallback(
  {
    data: 'lelz',
    options: {
      language: 'french',
    },
  },
  (data) => console.log(data),
);
