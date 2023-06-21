import { GeneratorModule } from '../generator/types';
import {
  PostOperatorData,
  PostOperatorResult,
  PreOperatorData,
  PreOperatorResult,
  ProcessInfo,
} from './types';

// TODO: ClairModule classes and interfaces, so we have sor PreModule and PostModule classes with operate method

export class ClairModule {
  static async postOperate(
    data: PostOperatorData & { module: GeneratorModule<any> },
  ): Promise<PostOperatorResult> {
    const { data: operatedData, result } = await this._postOperate(data);
    return ClairModule.updatedMeta(operatedData, result);
  }

  static async preOperate(
    data: PreOperatorData & { module: GeneratorModule<any> },
  ): Promise<PreOperatorResult> {
    const { data: operatedData, result } = await this._preOperate(data);
    return ClairModule.updatedMeta(operatedData, result);
  }

  static async _postOperate(
    data: PostOperatorData & { module: GeneratorModule<any> },
  ): Promise<{ data: PostOperatorResult; result: ProcessInfo }> {
    throw new Error('Method not implemented.');
  }

  static async _preOperate(
    data: PreOperatorData & { module: GeneratorModule<any> },
  ): Promise<{ data: PreOperatorResult; result: ProcessInfo }> {
    throw new Error('Method not implemented.');
  }

  static updatedMeta<T extends PreOperatorResult | PostOperatorResult>(
    data: T,
    result: ProcessInfo,
  ): T {
    return {
      ...data,
      meta: {
        ...data.meta,
        process: {
          ...data.meta.process,
          [result.module]: result,
        },
      },
    };
  }

  static formatError(message: string): string {
    return `${this.name} - ${message}`;
  }
}
