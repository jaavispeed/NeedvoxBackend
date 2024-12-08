"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const dto_1 = require("./dto");
const auth_service_1 = require("./auth.service");
const get_user_decorator_1 = require("./decorators/get-user.decorator");
const user_entity_1 = require("./entities/user.entity");
const interfaces_1 = require("./interfaces");
const decorators_1 = require("./decorators");
const updateUserDto_1 = require("./dto/updateUserDto");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    createUser(createUserDto) {
        return this.authService.create(createUserDto);
    }
    loginUser(loginUserDto) {
        return this.authService.login(loginUserDto);
    }
    checkAuthStatus(user) {
        return this.authService.checkAuthStatus(user);
    }
    async getPerfil(user) {
        return await this.authService.getUserById(user.id);
    }
    PrivateRoute(user) {
        return {
            ok: true,
            message: 'Hola mundo private',
            user,
        };
    }
    PrivateRoute2(user) {
        return {
            ok: true,
            message: 'Hola mundo private',
            user,
        };
    }
    async updateUserProfile(user, updateUserDto) {
        return this.authService.updateUserProfile(user.id, updateUserDto);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateUserDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "createUser", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.LoginUserDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "loginUser", null);
__decorate([
    (0, common_1.Get)('check-status'),
    (0, decorators_1.Auth)(),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "checkAuthStatus", null);
__decorate([
    (0, common_1.Get)('perfil'),
    (0, decorators_1.Auth)(),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getPerfil", null);
__decorate([
    (0, common_1.Get)('private'),
    (0, decorators_1.Auth)(),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "PrivateRoute", null);
__decorate([
    (0, common_1.Get)('private2'),
    (0, decorators_1.Auth)(interfaces_1.ValidRoles.admin),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "PrivateRoute2", null);
__decorate([
    (0, common_1.Patch)('update-profile'),
    (0, decorators_1.Auth)(),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User,
        updateUserDto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updateUserProfile", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map