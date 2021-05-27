import { clone } from 'lodash';

import type {
  IFieldStructure,
  IPropertiesMetadata,
} from '../elasticsearch/decorators';
import {
  getId,
  getIndexMetadata,
  getPropertiesMetadata,
} from '../elasticsearch/metadata-handler';
import type { ICoreOptions, IndexedClass } from '../elasticsearch/types';

export function getPureMapping(
  metadata: IPropertiesMetadata,
): IPropertiesMetadata {
  const mapping: IPropertiesMetadata = {};
  for (const name of Object.keys(metadata)) {
    const structure = clone(metadata[name]);
    if (structure._cls) {
      delete structure._cls;
    }
    if (structure.properties) {
      structure.properties = getPureMapping(structure.properties);
    }
    mapping[name] = structure;
  }
  return mapping;
}

/**
 * Returns a data depending on the field structure
 * If the field regards a class, it instantiate it recursively
 */
function getStructuredData<T>(
  structure: IFieldStructure,
  source: Partial<T> | Array<Partial<T>>,
): Partial<T> | Array<Partial<T>> {
  if (!structure._cls || !structure.properties || !source) {
    return source;
  }

  // ts note: when _cls is set, fields is set (see field.decorator.ts)
  const properties = structure.properties;

  if (Array.isArray(source)) {
    return source.map(
      (item) => getStructuredData(structure, item) as Partial<T>,
    );
  }

  const instance = new structure._cls();
  for (const name of Object.keys(properties)) {
    if (source[name] !== undefined) {
      instance[name] = getStructuredData(properties[name], source[name]);
    }
  }
  return instance;
}

/**
 * Instantiates a class and populate its data using the literal source
 * @param cls Class decorated by @Index
 * @param source Literal object to populate the returned instance
 */
export function instantiateResult<T>(
  cls: IndexedClass<T>,
  source: Partial<T>,
): T;
export function instantiateResult<T>(
  cls: IndexedClass<T>,
  source: Array<Partial<T>>,
): T[];
export function instantiateResult<T>(
  cls: IndexedClass<T>,
  source: Partial<T> | Array<Partial<T>>,
): Partial<T> | Array<Partial<T>> {
  return getStructuredData<T>(
    {
      _cls: cls,
      properties: getPropertiesMetadata(cls),
    },
    source,
  );
}

export interface IQueryStructure<T> {
  cls: IndexedClass<T>;
  document?: Partial<T>;
  id: string;
  index: string;
  type: string;
}

/**
 * Returned structured parameters for ES query from various types
 * @param coreOptions Core options
 * @param docOrClass
 * @param docOrId
 * @param doc
 */
export function getQueryStructure<T>(
  coreOptions: ICoreOptions,
  docOrClass: T | IndexedClass<T>,
  docOrId?: Partial<T> | string,
  doc?: Partial<T>,
): IQueryStructure<T> {
  let document: Partial<T> | undefined = doc;
  let cls: IndexedClass<T>;
  let id: string | undefined;

  if (docOrId) {
    if (typeof docOrId === 'string') {
      id = docOrId;
    } else {
      document = docOrId;
    }
  }

  if (typeof docOrClass === 'function') {
    cls = docOrClass as IndexedClass<T>;
  } else {
    document = docOrClass;
    cls = document.constructor as IndexedClass<T>;
  }

  const metadata = getIndexMetadata(cls, coreOptions);

  if (!id && document && metadata.primary) {
    id = getId(coreOptions, cls, document);
  }

  return {
    cls,
    document,
    id: id || '',
    index: metadata.index,
    type: metadata.type,
  };
}

/**
 * Returns the content to send to a bulk query
 * @param coreOptions Core options
 * @param action Bulk action type
 * @param cls Indexed class the documents belong to
 * @param documents Array of document to send
 */
export function buildBulkQuery<T>(
  coreOptions: ICoreOptions,
  action: 'index',
  cls: IndexedClass<T>,
  documents: Array<Partial<T>>,
): any {
  const metadata = getIndexMetadata(cls, coreOptions);
  const body: any[] = [];

  for (const document of documents) {
    const description: any = {
      _index: metadata.index,
      _type: metadata.type,
    };
    if (metadata.primary && (document as any)[metadata.primary]) {
      description._id = (document as any)[metadata.primary];
    }
    body.push({ [action]: description }, document);
  }

  return { body };
}
