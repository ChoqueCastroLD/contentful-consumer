import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class ParseDatePipe
  implements PipeTransform<string | undefined, Date | null>
{
  transform(
    value: string | undefined,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    metadata: ArgumentMetadata,
  ): Date | null {
    if (!value) {
      return null;
    }

    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new BadRequestException(
        'Invalid date format. Please use ISO 8601 format (YYYY-MM-DD)',
      );
    }

    return date;
  }
}
