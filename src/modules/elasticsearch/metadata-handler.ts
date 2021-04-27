import { DECORATORS } from './constants';
import type { IPropertiesMetadata } from './decorators';
import type { ICoreOptions, IndexedClass } from './types';

export interface IndexMetadata {
    index: string;
    type: string;
    primary?: string;
    settings?: any;
}

/**
 * Returns class index metadata
 * @param cls
 * @param coreOptions
 */
export function getIndexMetadata<T>(
    cls: IndexedClass<T>,
    coreOptions?: ICoreOptions,
): IndexMetadata {
    const metadata: IndexMetadata = Reflect.getMetadata(DECORATORS.INDEX, cls);
    if (!metadata) {
        throw new Error('Index is missing');
    }
    return {
        ...metadata,
        index: `${
            coreOptions.indexPrefix || process.env.ELASTICSEARCH_PREFIX
        }_${metadata.index}`,
    };
}

/**
 * Returns class fields metadata
 * @param cls
 */
export function getPropertiesMetadata<T>(
    cls: IndexedClass<T>,
): IPropertiesMetadata {
    const properties: IPropertiesMetadata = Reflect.getMetadata(
        DECORATORS.PROPERTIES,
        cls,
    );
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
    const document: any = doc || docOrClass;
    const cls: IndexedClass<T> = doc
        ? (docOrClass as IndexedClass<T>)
        : ((docOrClass as IndexedClass<T>).constructor as IndexedClass<T>);
    const meta = getIndexMetadata(cls, coreOptions);
    if (!meta.primary) {
        throw new Error(`Primary not defined for class ${cls.name}`);
    }
    return document[meta.primary];
}
