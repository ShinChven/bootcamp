import qs from 'qs';

/**
 * 获取当前的 query 参数
 * @returns {{}|any}
 */
export function getQueries() {
  const urlComponents = window.location.hash.split('?');
  if (urlComponents.length > 1) {
    return qs.parse(urlComponents[1]);
  }
  return {};
}

// noinspection JSUnusedGlobalSymbols
/**
 * 修改或增加 url 中的 queries
 * @param queries queries object
 * @param goto use window.history.pushState when false by default, window.location.href when true
 */
export function swapQueries(queries, goto = false) {
  const currentQueries = getQueries();
  Object.keys(queries).forEach((key) => {
    currentQueries[key] = queries[key];
  });
  const urlComponents = window.location.href.split('?');
  const url = urlComponents[0];
  const path = `${url}?${qs.stringify(currentQueries)}`;
  if (goto) {
    window.location.href = path;
  } else {
    window.history.pushState(undefined, undefined, path);
  }
}

// noinspection JSUnusedGlobalSymbols
/**
 * 完全替换 url 中的 queries
 * @param queries queries object
 * @param goto use window.history.pushState when false by default, window.location.href when true
 */
export function replaceQueries(queries, goto = false) {
  const urlComponents = window.location.href.split('?');
  const url = urlComponents[0];
  const path = `${url}?${qs.stringify(queries)}`;
  if (goto) {
    window.location.href = path;
  } else {
    window.history.pushState(undefined, undefined, path);
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
