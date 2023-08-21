import { evalMaybeFunction, type MaybeFunction } from './util';

export type ViewAction<Args extends any[] = [Record<string, string>]> = {
  link?: MaybeFunction<string, Args>;
  callback?: (...args: Args) => void;
  enabled?: MaybeFunction<boolean, Args>;
  style?: ViewActionStyle;
  text: MaybeFunction<string, Args>;
  icon?: MaybeFunction<string, Args>;
};

export type ViewActionEval = {
  link?: string;
  callback?: () => void;
  style: ViewActionStyle;
  text: string;
  icon: string;
};

export type ViewActionStyle = 'primary' | 'alert';

export function evalViewAction(action: ViewAction, data: Record<string, string>): ViewActionEval {
  if (!evalMaybeFunction(action.enabled, data)) {
    return;
  }

  return {
    link: evalMaybeFunction(action.link, data),
    callback: typeof action.callback === 'function' ? () => action.callback(data) : undefined,
    style: action.style || 'primary',
    text: evalMaybeFunction(action.text, data),
    icon: evalMaybeFunction(action.icon, data),
  };
}

export function processViewActions<T = ViewActionEval>(
  actions: ViewAction[],
  data: Record<string, string>,
  mapper: (action: ViewActionEval) => T = (action) => action as unknown as T,
): T[] {
  return actions
    .map((action) => evalViewAction(action, data))
    .filter((action) => action)
    .map(mapper);
}
