"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkipRoleCheck = exports.SKIP_ROLE_CHECK_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.SKIP_ROLE_CHECK_KEY = 'skipRoleCheck';
const SkipRoleCheck = () => (0, common_1.SetMetadata)(exports.SKIP_ROLE_CHECK_KEY, true);
exports.SkipRoleCheck = SkipRoleCheck;
//# sourceMappingURL=skip-role-check.decorator.js.map