export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        name: '用户登录',
        path: '/user/login',
        component: './ums/user/Login',
      },
    ],
  },
  {
    path: '/',
    redirect: '/welcome',
  },
  {
    path: '/welcome',
    name: '欢迎',
    icon: 'smile',
    component: './Welcome',
  },
  {
    rule: '/admin',
    name: '系统管理',
    icon: 'crown',
    access: 'routeFilter',
    // component: './Admin',
    routes: [
      {
        name: '用户管理',
        path: '/admin/user',
        component: './ums/user/List',
        access: 'routeFilter',
      },
      {
        name: '部门管理',
        path: '/admin/company',
        component: './ums/company/List',
        access: 'routeFilter',
      },
      {
        name: '字典管理',
        path: '/admin/dict',
        component: './dms/dict/List',
        access: 'routeFilter',
      },
      {
        name: '权限管理',
        path: '/admin/rule',
        component: './ums/rule/List',
        access: 'routeFilter',
      },
      {
        name: '角色管理',
        access: 'routeFilter',
        path: '/admin/role',
        component: './ums/role/List',
      },
      {
        name: '菜单管理',
        access: 'routeFilter',
        path: '/admin/menu',
        component: './dms/menu/List',
      },
      {
        component: './404',
      },
    ],
  },
  {
    component: './404',
  },
];
