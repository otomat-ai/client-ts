import { GeneratorOption, OGCGenerator, OGCOutput } from '../generator/types';
import { ChatCompletionRequestMessage } from 'openai';
type InputOptions<O extends GeneratorOption[]> = {
    [K in O[number]['name']]: Extract<O[number], {
        name: K;
    }>['type'] extends 'string' ? string : Extract<O[number], {
        name: K;
    }>['type'] extends 'number' ? number : Extract<O[number], {
        name: K;
    }>['type'] extends 'boolean' ? boolean : Extract<O[number], {
        name: K;
    }>['type'] extends 'object' ? object : Extract<O[number], {
        name: K;
    }>['type'] extends 'array' ? any[] : never;
};
type GenerationProps<O extends GeneratorOption[]> = {
    data: any;
    options: InputOptions<O>;
    history?: ChatCompletionRequestMessage[];
};
declare class OGC<O extends GeneratorOption[]> {
    private generator;
    constructor({ generator }: OGCProps<O>);
    private _generate;
    generate(props: GenerationProps<O>): Promise<OGCOutput>;
}
type OGCProps<O extends GeneratorOption[]> = {
    generator: OGCGenerator<O>;
};
export declare function createOGC<O extends GeneratorOption[]>(props: OGCProps<O>): OGC<O>;
export {};
//# sourceMappingURL=index.d.ts.map