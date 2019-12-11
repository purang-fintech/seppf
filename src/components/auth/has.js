function install(Vue, options = {}) {
  Vue.directive(options.name || "has", {
    inserted(el, binding) {
      if (!check(binding.value)) {
        el.parentNode && el.parentNode.removeChild(el);
      }
    }
  });
}

function getCurrentAuthority() {
  if (!sessionStorage.roleCodes) {
    return [];
  }
  return JSON.parse(sessionStorage.roleCodes);
}

function check(roles) {
  return getCurrentAuthority().some(item => roles.includes(item));;
}

export default {
  install
};
