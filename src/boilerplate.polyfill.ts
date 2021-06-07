/* eslint-disable @typescript-eslint/naming-convention,@typescript-eslint/no-explicit-any */
import 'source-map-support/register';

import { compact, map } from 'lodash';
import { Brackets, QueryBuilder, SelectQueryBuilder } from 'typeorm';

import { VIRTUAL_COLUMN_KEY } from './decorators';
import type { AbstractDto, PageOptionsDto } from './dto';
import { PageDto, PageMetaDto } from './dto';
import type { AbstractEntity } from './entities/abstract.entity';

declare global {
  export type GetConstructorArgs<T> = T extends new (...args: infer U) => any
    ? U
    : never;
  interface Array<T> {
    toDtos<Entity extends AbstractEntity<Dto>, Dto extends AbstractDto>(
      this: T[],
      options?: any,
    ): Dto[];

    toPageDto<T extends AbstractEntity<Dto>, Dto extends AbstractDto>(
      this: T[],
      pageMetaDto: PageMetaDto,
    ): PageDto<Dto>;
  }
}

declare module 'typeorm' {
  interface QueryBuilder<Entity> {
    searchByString(q: string, columnNames: string[]): this;
  }

  interface SelectQueryBuilder<Entity> {
    paginate(
      this: SelectQueryBuilder<Entity>,
      pageOptionsDto: PageOptionsDto,
    ): Promise<{ items: Entity[]; pageMetaDto: PageMetaDto }>;
  }
}

Array.prototype.toDtos = function <
  T extends AbstractEntity<Dto>,
  Dto extends AbstractDto,
>(options?: any): Dto[] {
  return compact(map<T, Dto>(this, (item) => item.toDto(options)));
};

Array.prototype.toPageDto = function (pageMetaDto: PageMetaDto) {
  return new PageDto(this.toDtos(), pageMetaDto);
};

QueryBuilder.prototype.searchByString = function (q, columnNames) {
  if (!q) {
    return this;
  }
  this.andWhere(
    new Brackets((qb) => {
      for (const item of columnNames) {
        qb.orWhere(`${item} ILIKE :q`);
      }
    }),
  );

  this.setParameter('q', `%${q}%`);

  return this;
};

SelectQueryBuilder.prototype.paginate = async function (
  pageOptionsDto: PageOptionsDto,
) {
  const selectQueryBuilder = this.skip(pageOptionsDto.skip).take(
    pageOptionsDto.take,
  );
  const itemCount = await selectQueryBuilder.getCount();

  const { entities, raw } = await selectQueryBuilder.getRawAndEntities();

  const items = entities.map((entitiy, index) => {
    const metaInfo = Reflect.getMetadata(VIRTUAL_COLUMN_KEY, entitiy) ?? {};
    const item = raw[index];

    for (const [propertyKey, name] of Object.entries<string>(metaInfo)) {
      entitiy[propertyKey] = item[name];
    }
    return entitiy;
  });

  const pageMetaDto = new PageMetaDto({
    itemCount,
    pageOptionsDto,
  });

  return { items, pageMetaDto };
};
