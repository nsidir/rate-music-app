import { injectable, inject } from "tsyringe";
import { rolesTable } from "../db/schema";
import { DatabaseService } from "./DatabaseService";

@injectable()
export class RoleService {
  constructor(@inject(DatabaseService) private dbService: DatabaseService) {}

  async createRole(roleName: string): Promise<any> {
    return await this.dbService.getDb().insert(rolesTable).values({ role_name: roleName });
  }

  async getAllRoles(): Promise<any[]> {
    return await this.dbService.getDb().select().from(rolesTable);
  }
}