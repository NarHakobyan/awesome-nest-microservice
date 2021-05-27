import { v1 as uuid } from 'uuid';

export class GeneratorService {
    public static uuid(): string {
        return uuid();
    }
    public static fileName(ext: string): string {
        return GeneratorService.uuid() + '.' + ext;
    }
}
