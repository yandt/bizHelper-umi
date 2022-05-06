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
    name: '数据管理',
    path: '/grid',
    routes: [
      {
        name: 'Connect',
        access: 'routeFilter',
        path: '/grid/connect',
        component: './grid/connect/List',
      },
      {
        name: 'Console',
        access: 'routeFilter',
        path: '/grid/console',
        component: './grid/console/List',
      },
      {
        component: './404',
      },
    ],
  },
  {
    name: '系统管理',
    path: '/admin',
    icon: 'crown',
    access: 'routeFilter',
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
