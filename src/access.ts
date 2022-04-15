/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
export default function access(initialState: { currentUser?: API.CurrentUser } | undefined) {
  const { currentUser } = initialState ?? {};
  return {
    // 路由过滤检查，基本规则是：角色未授权的路由不放行，未设置权限的路由放行
    routeFilter: (route: { path: string;rule: string }) =>{
      const pathRule = currentUser?.front[route.path || route.rule]
      if(pathRule == undefined || pathRule == 1 || currentUser?.isAdmin)
        return true
      return false
    },
    // 自定义权限检查，对应的是权限中的自定义权限代码
    hasRule: (code: string) => {
      return currentUser?.defined?.includes(code) || currentUser?.isAdmin
    }
  };
}
