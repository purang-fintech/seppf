import axios from 'axios';
import router from '../router';
import {
  Notification
} from 'element-ui';

// 全局请求参数加上当前用户ID、产品ID、角色ID
axios.interceptors.request.use(
  config => {
    let except = ['/user/query', '/user/query_p_r', '/role/p_r_query_user', '/product/query', '/product/update', '/product/delete',  '/priv/query', '/base/query'];
    if (except.indexOf(config.url) === -1) {
      config.params = {
        ...config.params,
        userId: sessionStorage.userId ? sessionStorage.userId : -1,
        productId: sessionStorage.productId ? sessionStorage.productId : -1
      };
    }
    return config
  },
  function (error) {
    return Promise.reject(error)
  }
)

axios.interceptors.response.use((response) => {
  if (response.data && response.data.error) {
    router.push({
      path: '/login'
    });
    Notification.closeAll();
    return;
  }
  return response;
}, error => {
  if (error.response.data && error.response.data.code === 1001) {
    Notification.error(error.response.data.message);
    throw error.response.data;
  }
  throw error;
});
