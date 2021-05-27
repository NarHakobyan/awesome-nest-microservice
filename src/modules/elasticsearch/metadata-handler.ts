import { DECORATORS } from './constants';
import type { IPropertiesMetadata } from './decorators';
import type { ICoreOptions, IndexedClass } from './types';

export interface IIndexMetadata {
  index: string;
  type: string;
  primary?: string;
  settings?: {
    number_of_shards: number;
  };
}

/**
 * Returns class index metadata
 * @param cls
 * @param coreOptions
 */
export function getIndexMetadata<T>(
  cls: IndexedClass<T>,
  coreOptions?: ICoreOptions,
): IIndexMetadata {
  const metadata = Reflect.getMetadata(DECORATORS.INDEX, cls) as IIndexMetadata;
  if (!metadata) {
    throw new Error('Index is missing');
  }
  return {
    ...metadata,
    index: `${coreOptions?.indexPrefix ?? process.env.ELASTICSEARCH_PREFIX}_${
      metadata.index
    }`,
  };
}

/**
 * Returns class fields metadata
 * @param cls
 */
export function getPropertiesMetadata<T>(
  cls: IndexedClass<T>,
): IPropertiesMetadata {
  const properties = Reflect.getMetadata(
    DECORATORS.PROPERTIES,
    cls,
  ) as IPropertiesMetadata;
  if (!properties) {
    throw new Error('Properties are missing');
  }
  return properties;
}

/**
 * Return the id (primary key value) of an instance or a literal
 * @param docOrClass
 * @param coreOptions
 * @param doc
 */
export function getId<T>(
  coreOptions: ICoreOptions,
  docOrClass: T | IndexedClass<T>,
  doc?: Partial<T>,
): string | undefined {
  const document = doc || docOrClass;
  const cls: IndexedClass<T> = doc
    ? (docOrClass as IndexedClass<T>)
    : ((docOrClass as IndexedClass<T>).constructor as IndexedClass<T>);
  const meta = getIndexMetadata(cls, coreOptions);
  if (!meta.primary) {
    throw new Error(`Primary not defined for class ${cls.name}`);
  }
  return document[meta.primary];
}
