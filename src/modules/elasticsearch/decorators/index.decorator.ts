/* eslint-disable no-redeclare */
import {
  cloneDeep,
  isArray,
  isPlainObject,
  map,
  mapKeys,
  mapValues,
  snakeCase,
} from 'lodash';

import { DECORATORS } from '../constants';
import { IndexStore } from '../index-store';
import type { AnyClass } from '../types';

export interface IIndexOptions {
  index?: string;
  type?: string;
  settings?: Partial<{
    numberOfShards: number;
    numberOfReplicas: number;
    refreshInterval: number;
  }>;
}

/**
 * Index decorator factory
 */
export function Index(
  pathOrOptions?: IIndexOptions,
): <T extends AnyClass>(target: T) => T;
export function Index(
  pathOrOptions: string,
  indexOptions?: IIndexOptions,
): <T extends AnyClass>(target: T) => T;
export function Index(
  pathOrOptions?: string | IIndexOptions,
  indexOptions?: IIndexOptions,
): <T extends AnyClass>(target: T) => T {
  /**
   * Index decorator
   * Store class description into class metadata using DECORATORS.INDEX key
   */
  return <T extends AnyClass>(target: T): T => {
    const options: IIndexOptions =
      (pathOrOptions && typeof pathOrOptions === 'object'
        ? pathOrOptions
        : indexOptions) || {};
    const name: string =
      (typeof pathOrOptions === 'string' ? pathOrOptions : options.index) ||
      target.name;
    const parts = name.split('/');
    const index = parts.shift() || '';
    const type = parts.shift() || options.type || index;
    const meta = Reflect.getMetadata(DECORATORS.INDEX, target) || {};
    if (!index) {
      throw new Error('Index undefined');
    }
    Reflect.defineMetadata(
      DECORATORS.INDEX,
      {
        ...meta,
        index: index.toLowerCase(),
        type: type.toLowerCase(),
        settings: keysToSnakeCase(options.settings),
      },
      target,
    );
    IndexStore.add(target);
    return target;
  };
}

function keysToSnakeCase(object: any) {
  let camelCaseObject = cloneDeep(object);

  if (isArray(camelCaseObject)) {
    return map(camelCaseObject, (v) => keysToSnakeCase(v));
  } else {
    camelCaseObject = mapKeys(camelCaseObject, (value, key) => snakeCase(key));

    // Recursively apply throughout object
    return mapValues(camelCaseObject, (value) => {
      if (isPlainObject(value)) {
        return keysToSnakeCase(value);
      } else if (isArray(value)) {
        return map(value, (v) => keysToSnakeCase(v));
      } else {
        return value;
      }
    });
  }
}
