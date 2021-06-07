import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import type { AbstractDto } from '../dto';
import { UtilsProvider } from '../providers/utils.provider';

export abstract class AbstractEntity<DTO extends AbstractDto = AbstractDto> {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({
    type: 'timestamp without time zone',
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp without time zone',
    name: 'updated_at',
  })
  updatedAt: Date;

  abstract dtoClass: new (
    entity: AbstractEntity,
    options?: GetConstructorArgs<DTO>[1],
  ) => DTO;

  toDto<D = DTO>(options?: GetConstructorArgs<D>[1]): DTO {
    return UtilsProvider.toDto(this.dtoClass, this, options);
  }
}
