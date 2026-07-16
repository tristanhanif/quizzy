import { SetMetadata } from '@nestjs/common';

export const SKIP_ROLE_CHECK_KEY = 'skipRoleCheck';
export const SkipRoleCheck = () => SetMetadata(SKIP_ROLE_CHECK_KEY, true);
