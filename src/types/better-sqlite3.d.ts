declare module 'better-sqlite3' {
  export interface RunResult {
    changes: number
    lastInsertRowid: number | bigint
  }

  export interface Statement<Result = unknown> {
    run(...params: unknown[]): RunResult
    get(...params: unknown[]): Result | undefined
    all(...params: unknown[]): Result[]
  }

  export interface Database {
    pragma(source: string): unknown
    exec(source: string): this
    prepare<Result = unknown>(source: string): Statement<Result>
    transaction<T extends (...args: never[]) => unknown>(fn: T): T
  }

  export default class DatabaseConstructor implements Database {
    constructor(filename: string)
    pragma(source: string): unknown
    exec(source: string): this
    prepare<Result = unknown>(source: string): Statement<Result>
    transaction<T extends (...args: never[]) => unknown>(fn: T): T
  }
}
