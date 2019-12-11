function install(Vue, options = {}) {
  Vue.directive(options.name || "auth", {
    inserted(el, binding) {
      if (!check(binding.value)) {
        el.parentNode && el.parentNode.removeChild(el);
      }
    }
  });
}

function getCurrentAuthority() {
  if (!sessionStorage.roles) {
    return [];
  }
  let roleIds = [];
  sessionStorage.roles.split(",").forEach(d => {
    roleIds.push(parseInt(d));
  });
  return roleIds;
}

function check(authInfo) {
  const currentAuthority = getCurrentAuthority();
  let auth = localStorage.getItem(authInfo.component);
  let authJson = JSON.parse(auth);
  for (let authData of authJson) {
    if (authData.authId == authInfo.id) {
      return currentAuthority.some(item => authData.roleIds.includes(item));
    }
  }
  return false;
}

export default {
  install
};
