// 解决recharts与redux 5.0.1版本不兼容的类型问题
// 这个声明文件覆盖了recharts中使用但在redux 5.0.1中不存在的所有类型

declare module 'redux' {
  // 为redux模块添加缺少的类型
  export type EmptyObject = Record<string, never>;
  export type CombinedState<S> = S;
  export interface Action<T = any> {
    type: T;
  }
  export interface AnyAction extends Action {
    [extraProps: string]: any;
  }
  export type Reducer<S = any, A extends Action = AnyAction> = (
    state: S | undefined,
    action: A
  ) => S;
  export interface ReducersMapObject<S = any, A extends Action = AnyAction> {
    [key: string]: Reducer<S[keyof S], A>;
  }
  export interface Dispatch<A extends Action = AnyAction> {
    <T extends A>(action: T): T;
  }
  export interface MiddlewareAPI<D extends Dispatch = any, S = any> {
    dispatch: D;
    getState(): S;
  }
  // 修改Middleware类型定义以支持0到3个类型参数
  export type Middleware<D extends Dispatch = any, S = any, NextDispatch extends Dispatch = any> = (
    api: MiddlewareAPI<D, S>
  ) => (next: NextDispatch) => D;
  export interface Store<S = any, A extends Action = AnyAction> {
    dispatch: Dispatch<A>;
    getState(): S;
    subscribe(listener: () => void): () => void;
    replaceReducer(nextReducer: Reducer<S, A>): void;
  }
}