export class TypesHelper {
  static isNotEmptyStr(str: string | undefined | null): str is string {
    return str !== null && str !== undefined && str.length > 0;
  }
  static isNotEmptyNumber(str: number | undefined | null): str is number {
    return str !== null && str !== undefined;
  }
}
