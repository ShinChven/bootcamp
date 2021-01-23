import qs from 'qs';
import {history} from "@@/core/history";

/**
 * 获取当前的 query 参数
 * @returns {{}|any}
 */
export function getQueries<T>(typing: Record<string, 'boolean' | 'number'> = {}): T {
  try {
    const urlComponents = window.location.href.split('?');
    if (urlComponents.length > 1) {
      const queries = qs.parse(urlComponents[1]) as Record<string, any>
      Object.keys(typing).forEach((key) => {
        const type = typing[key];
        const value = queries[key];
        switch (type) {
          case "boolean":
            switch (value.toLowerCase()) {
              case "true":
              case "1":
                queries[key] = true;
                break;
              case "false":
              case "0":
                queries[key] = false;
                break;
              default:
                break;
            }
            break;
          case "number":
            if (typeof value === "string") {
              queries[key] = parseInt(value, 10);
            }
            break;
          default:
            break;
        }
      });
      return queries as unknown as T;
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
  }
  return {} as T;
}

// noinspection JSUnusedGlobalSymbols
/**
 * 修改或增加 url 中的 queries
 * @param queries queries object
 * @param goto use window.history.pushState when false by default, window.location.href when true
 */
export function swapQueries<T>(queries: T, goto: boolean = false) {
  const currentQueries = getQueries<T>();
  Object.keys(queries).forEach(key => {
    currentQueries[key] = queries[key];
  });
  const urlComponents = window.location.href.split('?');
  const url = urlComponents[0];
  let path = url;
  if (qs.stringify(currentQueries)) {
    path = `${url}?${qs.stringify(currentQueries)}`;
  }
  if (goto) {
    window.location.href = path;
  } else {
    history.push({
      pathname: window.location.pathname.replace('/console', ''),
      query: currentQueries as unknown as Record<string, string>,
    });
  }
}

// noinspection JSUnusedGlobalSymbols
/**
 * 完全替换 url 中的 queries
 * @param queries queries object
 * @param goto use window.history.pushState when false by default, window.location.href when true
 */
export function replaceQueries<T>(queries: T, goto: boolean = false) {
  const urlComponents = window.location.href.split('?');
  const url = urlComponents[0];
  const path = `${url}?${qs.stringify(queries)}`;
  if (goto) {
    window.location.href = path;
  } else {
    history.push({
      pathname: window.location.pathname.replace('/console', ''),
      query: queries as unknown as Record<string, string>,
    });
  }
}

export const parseUrlId = () => {
  try {
    const urlComponents = window.location.hash.split('/');
    if (urlComponents.length > 0) {
      const text = urlComponents[urlComponents.length - 1];
      return parseInt(text, 10);
    }
  } catch (e) {
    return 0;
  }
  return 0;
};
