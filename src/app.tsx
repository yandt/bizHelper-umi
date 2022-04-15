import type {Settings as LayoutSettings} from '@ant-design/pro-layout';
import {PageLoading, SettingDrawer} from '@ant-design/pro-layout';
import type {RunTimeLayoutConfig} from 'umi';
import {history, Link, RequestConfig} from 'umi';
import RightContent from '@/components/RightContent';
import Footer from '@/components/Footer';
import {currentUser as queryCurrentUser} from './services/ant-design-pro/api';
import {BookOutlined, LinkOutlined} from '@ant-design/icons';
import defaultSettings from '../config/defaultSettings';
import { RequestOptionsInit } from 'umi-request';
import _request from "@/utils/bhRequest";
import {Role} from "@/pages/ums/role/List/data";
// import errorHandler from "@/utils/errorHandler";

const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';

/** 获取用户信息比较慢的时候会展示一个 loading */
export const initialStateConfig = {
  loading: <PageLoading />,
};

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      const msg = await queryCurrentUser();
      return msg.data;
    } catch (error) {
      history.push(loginPath);
    }
    return undefined;
  };
  // 如果不是登录页面，执行
  if (history.location.pathname !== loginPath) {
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
      settings: defaultSettings,
    };
  }
  return {
    fetchUserInfo,
    settings: defaultSettings
  };
}


const fetchMenuData = (params: {
  uid?: number
}) => {
  return _request<Role[]>('GET', '/api/pub/menu_list', {
    showMsg: false,
    params: {
      ...params,
    },
  });
}


// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  return {
    rightContentRender: () => <RightContent />,
    disableContentMargin: false,
    waterMarkProps: {
      content: initialState?.currentUser?.name,
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        history.push(loginPath);
      }
    },
    links: isDev
      ? [
          <Link key="openapi" to="/umi/plugin/openapi" target="_blank">
            <LinkOutlined />
            <span>OpenAPI 文档</span>
          </Link>,
          <Link to="/~docs" key="docs">
            <BookOutlined />
            <span>业务组件文档</span>
          </Link>,
        ]
      : [],
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children, props) => {
      // if (initialState?.loading) return <PageLoading />;
      return (
        <>
          {children}
          {!props.location?.pathname?.includes('/login') && (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              settings={initialState?.settings}
              onSettingChange={(settings) => {
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  settings,
                }));
              }}
            />
          )}
        </>
      );
    },
    menu: {
      // 每当 initialState?.currentUser?.userid 发生修改时重新执行 request
      params: {
        uid: initialState?.currentUser?.uid,
      },
      request: async (params) => {
        // initialState.currentUser 中包含了所有用户信息
        const menuData = await fetchMenuData(params);
        return menuData.data;
      },
    },
    ...initialState?.settings,
  };
};


const authHeaderInterceptor = (url: string, options: RequestOptionsInit) => {
  const access = sessionStorage.getItem('access') || '{}';
  const access_data = JSON.parse(access)
  const token = access_data.token ?? '';
  const token_type = access_data.type ?? '';
  const authHeader = { Authorization: `${token_type} ${token}` };
  return {
    url: `${url}`,
    options: { ...options, interceptors: true, headers: authHeader },
  };
};

export const request: RequestConfig = {
  credentials: 'include',
  // 新增自动添加AccessToken的请求前拦截器
  requestInterceptors: [authHeaderInterceptor],
  // errorHandler: errorHandler,
  errorConfig: {
    // adaptor: res => {
    //   return {
    //     success: res.code == 200,
    //     data: res.data,
    //     errorMessage: res.message,
    //     errorCode: res.code
    //   }
    // }
  }
}

