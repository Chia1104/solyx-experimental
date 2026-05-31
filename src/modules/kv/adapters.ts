import type { MMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

export const createZustandKvStorage = (kv: MMKV): StateStorage => ({
  getItem: name => kv.getString(name) ?? null,
  setItem: (name, value) => {
    kv.set(name, value);
  },
  removeItem: name => {
    kv.remove(name);
  },
});

export interface AsyncKvPersisterStorage {
  getItem: (key: string) => string | undefined;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

export const createAsyncKvPersisterStorage = (kv: MMKV): AsyncKvPersisterStorage => ({
  getItem: key => kv.getString(key),
  setItem: (key, value) => {
    kv.set(key, value);
  },
  removeItem: key => {
    kv.remove(key);
  },
});
