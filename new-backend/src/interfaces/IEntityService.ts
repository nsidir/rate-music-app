// src/interfaces/IEntityService.ts
export interface IEntityService<T, C> {
  create(data: C): Promise<T>;
  getAll(): Promise<T[]>;
  getById(id: number): Promise<T | null>;
  update(id: number, data: Partial<T>): Promise<T>;
  delete(id: number): Promise<void>;
}