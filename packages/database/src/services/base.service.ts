import {
  eq,
  desc,
  isNull,
  and,
  getTableName,
  getTableColumns,
  inArray,
  count,
} from 'drizzle-orm';
import { v7 as uuidv7 } from 'uuid';
import { generateShortId } from '@utils/short_id.util';
import { SQLiteTable } from 'drizzle-orm/sqlite-core';
import { slugify } from '@utils/slugify.util';
import { toSQLiteUTCString } from '@utils/date.util';
import { ServiceError } from '../classes/service_error.class';
import { Ctx } from '../types';

export interface HasDateFields {
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
  deletedAt?: string | Date | null;
  publishedAt?: string | Date | null;
}

export interface GenericInsertType extends Partial<HasDateFields> {
  id?: string;
  shortId?: string;
  slug?: string;
  title?: string;
  [key: string]: any;
}

export interface GenericSelectType {
  id: string;
  shortId?: string;
  deletedAt?: string | null;
  [key: string]: any;
}

export function getTableQuery(ctx: Ctx, tableName: string) {
  const queryInterface = (
    ctx.db.query as Record<
      string,
      {
        findFirst: (config: unknown) => Promise<unknown>;
        findMany: (config: unknown) => Promise<unknown[]>;
      }
    >
  )[tableName];
  if (!queryInterface || typeof queryInterface.findFirst !== 'function') {
    throw new ServiceError(
      400,
      `Query interface missing for table: ${tableName}`,
    );
  }
  return queryInterface;
}

export class BaseService<
  TInsert extends GenericInsertType,
  TSelect extends GenericSelectType,
> {
  protected ctx: Ctx;

  constructor(
    public schema: SQLiteTable,
    ctx: Ctx,
  ) {
    this.ctx = ctx;
  }

  #prepareData(
    data: Partial<TInsert>,
    {
      isCreate = false,
      autoUpdateUpdatedAt = false,
    }: { isCreate?: boolean; autoUpdateUpdatedAt?: boolean } = {},
  ): Partial<TInsert> {
    const columns = getTableColumns(this.schema);
    let preparedData = { ...data };

    // Validate Enums
    for (const column of Object.values(this.schema)) {
      if ('enumValues' in column && column.enumValues) {
        const fieldValue = preparedData[column.name];
        if (fieldValue && !column.enumValues.includes(fieldValue)) {
          throw new ServiceError(
            400,
            `Invalid value '${fieldValue}' for ${column.name}`,
          );
        }
      }
    }

    // Prepare Date fields
    const dateFields = [
      'createdAt',
      'updatedAt',
      'deletedAt',
      'publishedAt',
    ] as const;
    dateFields.forEach((field) => {
      if (
        field in columns &&
        preparedData[field] !== undefined &&
        preparedData[field] !== null
      ) {
        preparedData[field] = toSQLiteUTCString(preparedData[field]);
      }
    });

    if (autoUpdateUpdatedAt && 'updatedAt' in columns) {
      preparedData.updatedAt = toSQLiteUTCString(new Date());
    }

    // Prepare Slug
    if (
      'slug' in columns &&
      (!preparedData.slug || !(preparedData.slug as string).trim())
    ) {
      if ('title' in preparedData && typeof preparedData.title === 'string') {
        preparedData.slug = slugify(preparedData.title, {
          lower: true,
          strict: true,
        });
      } else if (isCreate) {
        throw new ServiceError(
          400,
          "Slug is empty and 'title' field is missing or invalid.",
        );
      }
    }

    return preparedData;
  }

  async create(
    data: Omit<TInsert, 'id' | 'shortId'> &
      Partial<Pick<TInsert, 'id' | 'shortId'>>,
  ): Promise<TSelect> {
    // Get schema columns dynamically
    const columns = getTableColumns(this.schema);

    // Explicitly convert incoming data to Partial<TInsert> for compatibility
    const inputData = data as Partial<TInsert>;

    const currentDate = toSQLiteUTCString(new Date());
    if ('createdAt' in columns && !inputData.createdAt) {
      inputData.createdAt = currentDate;
    }
    if ('updatedAt' in columns && !inputData.updatedAt) {
      inputData.updatedAt = currentDate;
    }

    // Prepare date fields dynamically
    let finalData = this.#prepareData(inputData, { isCreate: true });

    // Check and set 'id' dynamically if present in schema and not provided
    if ('id' in columns && !finalData.id) {
      finalData.id = uuidv7() as TInsert['id'];
    }

    // Check and set 'shortId' dynamically if present in schema and not provided
    if ('shortId' in columns && !finalData.shortId) {
      finalData.shortId = generateShortId() as TInsert['shortId'];
    }

    // Perform insertion explicitly typed
    const insertedRows = await this.ctx.db
      .insert(this.schema)
      .values(finalData as TInsert)
      .returning();

    if (!insertedRows || insertedRows.length === 0) {
      throw new ServiceError(500, 'Insertion failed: No rows returned.');
    }

    // Type assertion to explicitly guarantee TSelect compatibility
    return insertedRows[0] as TSelect;
  }

  async update(id: string, data: Partial<TInsert>): Promise<TSelect> {
    // Dynamically get schema columns
    const columns = getTableColumns(this.schema);

    // Validate the data with valid enum fields
    const finalData = this.#prepareData(data, { autoUpdateUpdatedAt: true });

    // Ensure the 'id' field is part of schema before forming the WHERE condition
    if (!('id' in columns)) {
      throw new ServiceError(
        400,
        `Schema does not have an 'id' field, cannot update.`,
      );
    }

    // Perform update query explicitly typed
    const updatedRows = await this.ctx.db
      .update(this.schema)
      .set(finalData as TInsert)
      .where(eq(columns.id, id))
      .returning();

    // Check if update affected any row
    if (!updatedRows || updatedRows.length === 0) {
      throw new ServiceError(404, `No record found with ID: ${id}`);
    }

    // Explicitly ensure returned data matches TSelect
    return updatedRows[0] as TSelect;
  }

  async delete(id: string, permanent = false): Promise<TSelect> {
    const columns = getTableColumns(this.schema);

    // Ensure 'id' field exists in schema
    if (!('id' in columns)) {
      throw new ServiceError(
        400,
        "Schema does not have an 'id' field, cannot perform delete operation.",
      );
    }

    if (permanent) {
      // Perform permanent deletion
      const deletedRows = await this.ctx.db
        .delete(this.schema)
        .where(eq(columns.id, id))
        .returning();

      if (!deletedRows || deletedRows.length === 0) {
        throw new ServiceError(404, `No record found with ID: ${id}`);
      }

      return deletedRows[0] as TSelect;
    } else {
      // Soft deletion: ensure 'deletedAt' field exists
      if (!('deletedAt' in columns)) {
        throw new ServiceError(
          400,
          "Schema does not have a 'deletedAt' field, cannot perform soft delete.",
        );
      }

      const now = toSQLiteUTCString(new Date());

      const updatedRows = await this.ctx.db
        .update(this.schema)
        .set({ deletedAt: now } as Partial<TInsert>)
        .where(eq(columns.id, id))
        .returning();

      if (!updatedRows || updatedRows.length === 0) {
        throw new ServiceError(404, `No record found with ID: ${id}`);
      }

      return updatedRows[0] as TSelect;
    }
  }

  async getById(id: string, includeDeleted = false): Promise<TSelect | null> {
    const columns = getTableColumns(this.schema);

    if (!('id' in columns)) {
      throw new ServiceError(
        400,
        "Schema does not have an 'id' field, cannot perform getById operation.",
      );
    }

    const tableName = getTableName(this.schema);
    const tableQuery = getTableQuery(this.ctx, tableName);

    const record = await tableQuery.findFirst({
      where: (fields: unknown) => {
        const conditions = [eq(columns.id, id)];

        if (
          !includeDeleted &&
          typeof fields === 'object' &&
          fields &&
          'deletedAt' in fields
        ) {
          conditions.push(isNull(columns.deletedAt));
        }

        return and(...conditions);
      },
    });

    return (record as TSelect) ?? null;
  }

  // Method to get record by shortId if the schema has the shortId column
  async getByShortId(
    shortId: string,
    includeDeleted = false,
  ): Promise<TSelect | null> {
    const columns = getTableColumns(this.schema);

    if (!('shortId' in columns)) {
      throw new ServiceError(400, "Schema does not have a 'shortId' field.");
    }

    const tableQuery = getTableQuery(this.ctx, getTableName(this.schema));

    const record = await tableQuery.findFirst({
      where: (fields: unknown) => {
        const conditions = [eq(columns.shortId, shortId)];

        if (
          !includeDeleted &&
          typeof fields === 'object' &&
          fields &&
          'deletedAt' in fields
        ) {
          conditions.push(isNull(columns.deletedAt));
        }

        return and(...conditions);
      },
    });

    return (record as TSelect) ?? null;
  }

  async getMany(ids: string[], includeDeleted = false): Promise<TSelect[]> {
    if (!ids.length) return [];

    const columns = getTableColumns(this.schema);

    if (!('id' in columns)) {
      throw new ServiceError(
        400,
        "Schema does not have an 'id' field, cannot perform getMany operation.",
      );
    }

    const tableQuery = getTableQuery(this.ctx, getTableName(this.schema));

    const conditions = [inArray(columns.id, ids)];

    if ('deletedAt' in columns && !includeDeleted) {
      conditions.push(isNull(columns.deletedAt));
    }

    const records = await tableQuery.findMany({
      where: and(...conditions),
    });

    return records as TSelect[];
  }

  async getList(
    range?: [number, number],
    sort?: [keyof TSelect, 'ASC' | 'DESC'],
    filter?: Partial<Record<keyof TSelect, any>>,
    includeDeleted = false,
  ): Promise<TSelect[]> {
    const columns = getTableColumns(this.schema);
    const tableName = getTableName(this.schema);
    const tableQuery = getTableQuery(this.ctx, tableName);

    const conditions = [];

    // Soft delete condition, if applicable and not including deleted
    if ('deletedAt' in columns && !includeDeleted) {
      conditions.push(isNull(columns.deletedAt));
    }

    // Apply provided filter conditions
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (key in columns && value !== undefined) {
          if (Array.isArray(value)) {
            conditions.push(inArray(columns[key], value)); // Handle array values
          } else {
            conditions.push(eq(columns[key], value)); // Handle single values
          }
        }
      });
    }

    const records = await tableQuery.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: (fields: any) => {
        if (sort && Object.keys(sort).length > 0) {
          return sort[1] === 'ASC' ? fields[sort[0]] : desc(fields[sort[0]]);
        }
        // Default to id desc if available
        if ('id' in columns) {
          return desc(fields.id);
        }
        return undefined;
      },
      limit: range ? range[1] - range[0] + 1 : undefined,
      offset: range ? range[0] : undefined,
    });

    return records as TSelect[];
  }

  async getCount(
    filter?: Partial<Record<keyof TSelect, any>>,
    includeDeleted = false,
  ): Promise<number> {
    const columns = getTableColumns(this.schema);
    const conditions = [];

    // Soft delete condition, if applicable and not including deleted
    if ('deletedAt' in columns && !includeDeleted) {
      conditions.push(isNull(columns.deletedAt));
    }

    let countFn = count();
    if ('id' in columns) {
      countFn = count(columns.id);
    }

    // Apply provided filter conditions
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (key in columns && value !== undefined) {
          if (Array.isArray(value)) {
            conditions.push(inArray(columns[key], value)); // Handle array values
          } else {
            conditions.push(eq(columns[key], value)); // Handle single values
          }
        }
      });
    }

    const query = this.ctx.db.select({ count: countFn }).from(this.schema);
    let rowCount = 0;
    if (conditions.length) {
      rowCount = (await query.where(and(...conditions)))?.[0]?.count;
    } else {
      rowCount = (await query)?.[0]?.count;
    }
    return rowCount;
  }

  async getManyReference(
    referenceField: keyof TSelect,
    id: string,
    range?: [number, number],
    sort?: [keyof TSelect, 'ASC' | 'DESC'],
    filter?: Partial<Record<keyof TSelect, any>>,
    includeDeleted = false,
  ): Promise<TSelect[]> {
    const columns = getTableColumns(this.schema);

    if (!(referenceField in columns)) {
      throw new ServiceError(
        400,
        `Reference field ${String(referenceField)} does not exist in schema.`,
      );
    }

    const refFilter = {
      ...(filter ?? {}),
      [referenceField]: id,
    } as Partial<Record<keyof TSelect, any>>;

    return this.getList(range, sort, refFilter, includeDeleted);
  }

  async bulkUpdate(
    updates: { id: string; data: Partial<TInsert> }[],
  ): Promise<TSelect[]> {
    if (!updates.length) return [];

    // Validate each update explicitly
    updates.forEach(({ id, data }) => {
      if (!id) {
        throw new ServiceError(
          400,
          'bulkUpdate error: Every update must include a valid ID.',
        );
      }
      if (typeof data !== 'object' || !data) {
        throw new ServiceError(
          400,
          `bulkUpdate error: Update data for ID ${id} is invalid.`,
        );
      }
    });

    // Execute updates sequentially or in parallel
    return Promise.all(updates.map(({ id, data }) => this.update(id, data)));
  }

  async bulkDelete(ids: string[], permanent = false): Promise<TSelect[]> {
    if (!ids.length) return [];

    // Validate each id explicitly
    ids.forEach((id, index) => {
      if (typeof id !== 'string' || !id.trim()) {
        throw new ServiceError(
          400,
          `bulkDelete error: Invalid ID provided at position ${index}.`,
        );
      }
    });

    const columns = getTableColumns(this.schema);

    if (!('id' in columns)) {
      throw new ServiceError(
        400,
        "Schema does not have an 'id' field, cannot perform getById operation.",
      );
    }

    if (permanent) {
      const deletedRows = await this.ctx.db
        .delete(this.schema)
        .where(inArray(columns.id, ids))
        .returning();

      return deletedRows as TSelect[];
    } else {
      const now = toSQLiteUTCString(new Date());
      const updatedRows = await this.ctx.db
        .update(this.schema)
        .set({ deletedAt: now })
        .where(inArray(columns.id, ids))
        .returning();
      return updatedRows as TSelect[];
    }
  }
}
