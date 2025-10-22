import { applyDecorators, SetMetadata } from '@nestjs/common';

export const CustomThrottle = (limit: number, ttl: number) => {
  return applyDecorators(
    SetMetadata('throttle-ttl', ttl),
    SetMetadata('throttle-limit', limit)
  );
};
