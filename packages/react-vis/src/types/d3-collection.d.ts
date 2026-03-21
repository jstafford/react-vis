declare module 'd3-collection' {
  interface D3Set {
    has(value: string): boolean;
    add(value: string): this;
    remove(value: string): boolean;
    clear(): void;
    values(): string[];
    each(callback: (value: string) => void): void;
    empty(): boolean;
    size(): number;
  }
  export function set(array?: string[]): D3Set;
  export function set<T>(array: T[], accessor: (d: T) => string): D3Set;
}
