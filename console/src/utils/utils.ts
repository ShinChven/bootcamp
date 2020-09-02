import { parse } from 'querystring';
import pathRegexp from 'path-to-regexp';
import { Route } from '@/models/connect';

/* eslint no-useless-escape:0 import/prefer-default-export:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

export const isUrl = (path: string): boolean => reg.test(path);

export const isAntDesignPro = (): boolean => {
  if (ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION === 'site') {
    return true;
  }
  return window.location.hostname === 'preview.pro.ant.design';
};

// 给官方演示站点用，用于关闭真实开发环境不需要使用的特性
export const isAntDesignProOrDev = (): boolean => {
  const { NODE_ENV } = process.env;
  if (NODE_ENV === 'development') {
    return true;
  }
  return isAntDesignPro();
};

export const getPageQuery = () => parse(window.location.href.split('?')[1]);

/**
 * props.route.routes
 * @param router [{}]
 * @param pathname string
 */
export const getAuthorityFromRouter = <T extends Route>(
  router: T[] = [],
  pathname: string,
): T | undefined => {
  const authority = router.find(
    ({ routes, path = '/', target = '_self' }) =>
      (path && target !== '_blank' && pathRegexp(path).exec(pathname)) ||
      (routes && getAuthorityFromRouter(routes, pathname)),
  );
  if (authority) return authority;
  return undefined;
};

export const getRouteAuthority = (path: string, routeData: Route[]) => {
  let authorities: string[] | string | undefined;
  routeData.forEach((route) => {
    // match prefix
    if (pathRegexp(`${route.path}/(.*)`).test(`${path}/`)) {
      if (route.authority) {
        authorities = route.authority;
      }
      // exact match
      if (route.path === path) {
        authorities = route.authority || authorities;
      }
      // get children authority recursively
      if (route.routes) {
        authorities = getRouteAuthority(path, route.routes) || authorities;
      }
    }
  });
  return authorities;
};

/**
 * 处理返回值
 * @param json
 */
export const resultMsg = (json: { code?: any }) => {
  // console.log(getHealAccessToken);
  // console.log(json);
  let resultFlag = true;
  // 判断传入进来的值是否为空对象
  if (Object.keys(json).length !== 0) {
    const codeNumber = json.code;
    if (codeNumber === 401) {
      // 登录失效直接跳登录
      // console.error(json);
      resultFlag = false;
      window.location.hash = '#/login?error=4016';
    } else if (codeNumber === 403) {
      // 权限验证失败
      console.error(json);
      resultFlag = false;
    } else if (codeNumber === 406) {
      // 参数有误
      resultFlag = false;
      console.error('参数有误');
    } else if (codeNumber === 416) {
      // 没有数据
      resultFlag = false;
    } else if (codeNumber === 400 || codeNumber === 404) {
      // 404：数据不存在
      // message.error(json.message);
      resultFlag = false;
    } else if (codeNumber === 412 || codeNumber === 409 || codeNumber === 405) {
      // 405:选择的区域不存在，添加失败
      // 409:该地区不是大区，删除失败
      // message.error(json.message);
      resultFlag = false;
    } else if (codeNumber === 4001) {
      // 取消物流
      // 系统发生数据错误或运行时异常
      resultFlag = false;
    } else if (codeNumber === 8016) {
      // 下单
      // 重复下单
      resultFlag = false;
    } else if (codeNumber === 8037) {
      // 取消物流
      resultFlag = false;
    } else if (codeNumber === 8019) {
      // 取消物流
      resultFlag = false;
    } else if (codeNumber === 8013) {
      // 查询运单
      resultFlag = false;
    }
  } else {
    resultFlag = false;
  }
  return resultFlag;
};

/**
 * 检查单个字段的值（有值：直接返回值，没值：返回没数据的提示）
 * @param name 字段的值
 * @returns {*}
 */
export const checkFields = (name: any, msg: string): any => {
  if (name) {
    return name;
  }
  return msg || '未填写';
};
