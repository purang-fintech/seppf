import Vue from 'vue';

//前端全局防重复提交，按钮置灰1秒后方可继续操作下一次，直接发请求不在控制之列
Vue.directive('noMoreClick', {
  inserted(el, binding) {
    el.addEventListener('click', e => {
      el.classList.add('is-disabled');
      el.disabled = true;
      setTimeout(() => {
        el.disabled = false;
        el.classList.remove('is-disabled');
      }, 1000)
    })
  }
});
