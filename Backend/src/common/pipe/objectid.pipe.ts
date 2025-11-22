import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ObjectId } from 'mongodb';

@Injectable()
export class ObjectIdPipe implements PipeTransform {
  transform(value: string) {
    if (!ObjectId.isValid(value)) {
      throw new BadRequestException(
        'Invalid id format (must be a 24-character string)',
      );
    }
    return value;
  }
}
