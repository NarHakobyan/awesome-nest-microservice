import type { AnyClass, IndexedClass } from './types';

export class IndexStore {
  public static add<T>(cls: IndexedClass<T>): void {
    if (typeof cls !== 'function') {
      throw new TypeError('Function expected');
    }
    IndexStore.store.push(cls);
  }

  public static flush(): void {
    IndexStore.store.length = 0;
  }

  public static getAll(): AnyClass[] {
    return [...IndexStore.store];
  }
  private static store: AnyClass[] = [];
}
