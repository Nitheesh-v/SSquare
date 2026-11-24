import { randomBytes } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { createInitialSeedStore } from './seed.data';

function generateObjectId(): string {
  return randomBytes(12).toString('hex');
}

const STORE_DIR = path.join(process.cwd(), '.data');
const STORE_PATH = path.join(STORE_DIR, 'store.json');

let memoryStore: Record<string, any[]> | null = null;

function getStore(): Record<string, any[]> {
  if (memoryStore) return memoryStore;
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        memoryStore = parsed;
        return memoryStore!;
      }
    }
  } catch {
    // Fallback to initial seed store
  }
  memoryStore = createInitialSeedStore();
  persistStore();
  return memoryStore;
}

function persistStore(): void {
  if (!memoryStore) return;
  try {
    fs.mkdirSync(STORE_DIR, { recursive: true });
    fs.writeFileSync(STORE_PATH, JSON.stringify(memoryStore, null, 2), 'utf-8');
  } catch {
    // Ignore filesystem errors in read-only environments
  }
}

function clone<T>(val: T): T {
  return val === undefined || val === null
    ? val
    : JSON.parse(JSON.stringify(val));
}

function matchesCondition(docValue: any, cond: any): boolean {
  if (cond && typeof cond === 'object' && !Array.isArray(cond)) {
    if ('$regex' in cond) {
      const flags = cond.$options || '';
      const regex =
        cond.$regex instanceof RegExp
          ? cond.$regex
          : new RegExp(String(cond.$regex), flags);
      return regex.test(String(docValue ?? ''));
    }
    if ('$in' in cond && Array.isArray(cond.$in)) {
      return cond.$in.map(String).includes(String(docValue));
    }
    if ('$gte' in cond && Number(docValue) < Number(cond.$gte)) return false;
    if ('$lte' in cond && Number(docValue) > Number(cond.$lte)) return false;
    if ('$ne' in cond) return String(docValue) !== String(cond.$ne);
  }
  return String(docValue) === String(cond);
}

function matchesFilter(doc: any, filter: Record<string, any> = {}): boolean {
  if (!filter || Object.keys(filter).length === 0) return true;

  for (const [key, cond] of Object.entries(filter)) {
    if (cond === undefined) continue;
    if (key === '$or' && Array.isArray(cond)) {
      const anyMatch = cond.some((subFilter) => matchesFilter(doc, subFilter));
      if (!anyMatch) return false;
      continue;
    }
    if (!matchesCondition(doc[key], cond)) {
      return false;
    }
  }
  return true;
}

const POPULATE_MAP: Record<string, string> = {
  category: 'Category',
  user: 'User',
  product: 'Product',
};

function applyProjection(
  modelName: string,
  doc: any,
  selectFields?: string,
): any {
  if (!doc) return doc;
  const copy = clone(doc);
  if (modelName === 'User') {
    const includePassword =
      selectFields && selectFields.split(/\s+/).includes('+password');
    if (!includePassword) {
      delete copy.password;
    }
  }
  if (selectFields && !selectFields.includes('+')) {
    const tokens = selectFields.trim().split(/\s+/);
    const exclusions = tokens.filter((t) => t.startsWith('-'));
    for (const ex of exclusions) {
      delete copy[ex.slice(1)];
    }
  }
  return copy;
}

function applyPopulate(doc: any, populatePaths: string[]): any {
  if (!doc || populatePaths.length === 0) return doc;
  const store = getStore();
  const copy = clone(doc);

  for (const rawPath of populatePaths) {
    const parts = rawPath.split('.');
    if (parts.length === 1) {
      const field = parts[0];
      const targetModel = POPULATE_MAP[field];
      if (targetModel && copy[field] && typeof copy[field] === 'string') {
        const found = (store[targetModel] || []).find(
          (item) => String(item._id) === String(copy[field]),
        );
        if (found) {
          copy[field] = applyProjection(targetModel, found);
        }
      }
    } else if (parts.length === 2) {
      const [arrField, subField] = parts;
      const targetModel = POPULATE_MAP[subField];
      if (Array.isArray(copy[arrField]) && targetModel) {
        copy[arrField] = copy[arrField].map((entry: any) => {
          if (entry && typeof entry[subField] === 'string') {
            const found = (store[targetModel] || []).find(
              (item) => String(item._id) === String(entry[subField]),
            );
            if (found) {
              return {
                ...entry,
                [subField]: applyProjection(targetModel, found),
              };
            }
          }
          return entry;
        });
      }
    }
  }

  return copy;
}

class InMemoryQuery<T = any> {
  private selectSpec?: string;
  private sortSpec?: Record<string, 1 | -1>;
  private skipCount = 0;
  private limitCount?: number;
  private populatePaths: string[] = [];

  constructor(
    private readonly modelName: string,
    private readonly resolver: () => any,
    private readonly isArrayResult: boolean,
  ) {}

  select(spec: string) {
    this.selectSpec = spec;
    return this;
  }

  sort(spec: Record<string, 1 | -1> | string) {
    if (typeof spec === 'string') {
      const desc = spec.startsWith('-');
      const key = desc ? spec.slice(1) : spec;
      this.sortSpec = { [key]: desc ? -1 : 1 };
    } else {
      this.sortSpec = spec;
    }
    return this;
  }

  skip(n: number) {
    this.skipCount = Math.max(0, Number(n) || 0);
    return this;
  }

  limit(n: number) {
    this.limitCount = Math.max(0, Number(n) || 0);
    return this;
  }

  populate(pathSpec: string | { path: string }) {
    const p = typeof pathSpec === 'string' ? pathSpec : pathSpec.path;
    if (p) this.populatePaths.push(p);
    return this;
  }

  lean() {
    return this;
  }

  async exec(): Promise<T> {
    const raw = this.resolver();
    if (!this.isArrayResult) {
      if (!raw) return null as unknown as T;
      const projected = applyProjection(this.modelName, raw, this.selectSpec);
      return applyPopulate(projected, this.populatePaths) as T;
    }

    let list: any[] = Array.isArray(raw) ? [...raw] : [];

    if (this.sortSpec) {
      const entries = Object.entries(this.sortSpec);
      list.sort((a, b) => {
        for (const [k, dir] of entries) {
          if (a[k] < b[k]) return -1 * dir;
          if (a[k] > b[k]) return 1 * dir;
        }
        return 0;
      });
    }

    if (this.skipCount > 0) {
      list = list.slice(this.skipCount);
    }
    if (this.limitCount !== undefined) {
      list = list.slice(0, this.limitCount);
    }

    const mapped = list.map((item) => {
      const projected = applyProjection(this.modelName, item, this.selectSpec);
      return applyPopulate(projected, this.populatePaths);
    });

    return mapped as unknown as T;
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this.exec().then(onfulfilled, onrejected);
  }
}

export function createInMemoryMongooseModel(modelName: string) {
  const ensureCollection = (): any[] => {
    const store = getStore();
    if (!store[modelName]) {
      store[modelName] = [];
    }
    return store[modelName];
  };

  return {
    modelName,

    find(filter: Record<string, any> = {}) {
      return new InMemoryQuery(
        modelName,
        () => ensureCollection().filter((doc) => matchesFilter(doc, filter)),
        true,
      );
    },

    findOne(filter: Record<string, any> = {}) {
      return new InMemoryQuery(
        modelName,
        () =>
          ensureCollection().find((doc) => matchesFilter(doc, filter)) || null,
        false,
      );
    },

    findById(id: string) {
      return new InMemoryQuery(
        modelName,
        () =>
          ensureCollection().find((doc) => String(doc._id) === String(id)) ||
          null,
        false,
      );
    },

    async create(payload: Record<string, any>) {
      const collection = ensureCollection();
      const now = new Date().toISOString();
      const doc = {
        _id: payload._id || generateObjectId(),
        ...clone(payload),
        createdAt: payload.createdAt || now,
        updatedAt: now,
      };
      collection.push(doc);
      persistStore();
      return {
        ...applyProjection(modelName, doc),
        toObject: () => applyProjection(modelName, doc),
      };
    },

    findByIdAndUpdate(
      id: string,
      update: Record<string, any>,
      _options: Record<string, any> = { new: true },
    ) {
      return new InMemoryQuery(
        modelName,
        () => {
          const collection = ensureCollection();
          const idx = collection.findIndex(
            (doc) => String(doc._id) === String(id),
          );
          if (idx === -1) return null;

          const patch = update.$set ? update.$set : update;
          const updated = {
            ...collection[idx],
            ...clone(patch),
            _id: collection[idx]._id,
            updatedAt: new Date().toISOString(),
          };
          collection[idx] = updated;
          persistStore();
          return updated;
        },
        false,
      );
    },

    findOneAndUpdate(
      filter: Record<string, any>,
      update: Record<string, any>,
      options: Record<string, any> = { new: true },
    ) {
      return new InMemoryQuery(
        modelName,
        () => {
          const collection = ensureCollection();
          const idx = collection.findIndex((doc) => matchesFilter(doc, filter));
          const patch = update.$set ? update.$set : update;
          const now = new Date().toISOString();

          if (idx === -1) {
            if (!options.upsert) return null;
            const created = {
              _id: generateObjectId(),
              ...clone(filter),
              ...clone(patch),
              createdAt: now,
              updatedAt: now,
            };
            collection.push(created);
            persistStore();
            return created;
          }

          const updated = {
            ...collection[idx],
            ...clone(patch),
            _id: collection[idx]._id,
            updatedAt: now,
          };
          collection[idx] = updated;
          persistStore();
          return updated;
        },
        false,
      );
    },

    findByIdAndDelete(id: string) {
      return new InMemoryQuery(
        modelName,
        () => {
          const collection = ensureCollection();
          const idx = collection.findIndex(
            (doc) => String(doc._id) === String(id),
          );
          if (idx === -1) return null;
          const [removed] = collection.splice(idx, 1);
          persistStore();
          return removed;
        },
        false,
      );
    },

    countDocuments(filter: Record<string, any> = {}) {
      return {
        exec: async () =>
          ensureCollection().filter((doc) => matchesFilter(doc, filter)).length,
        then: (resolve: (n: number) => any, reject?: (e: any) => any) =>
          Promise.resolve(
            ensureCollection().filter((doc) => matchesFilter(doc, filter))
              .length,
          ).then(resolve, reject),
      };
    },
  };
}
