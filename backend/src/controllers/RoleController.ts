import { injectable, inject } from "tsyringe";
import { RoleService } from "../services/RoleService";

@injectable()
export class RoleController {
    constructor(@inject(RoleService) private roleService: RoleService) {}

    async createRole(roleName: string): Promise<any> {
        return await this.roleService.createRole(roleName);
    }

    async getAllRoles(): Promise<any[]> {
        return await this.roleService.getAllRoles();
    }
}