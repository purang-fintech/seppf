<script>
import axios from "axios";
import Vue from 'vue';
import {
  dateFormat
} from "@/util/date.js";

export default {
  isNull(obj) {
    return null === obj || undefined === obj || 'undefined' === obj || obj === '';
  },

  pickListFilter(val, input) {
    if (this.isNull(val)) {
      return input;
    }

    let output = [];
    let existsGroups = [];
    // 优先匹配前N个字母
    input.forEach(group => {
      let subFilterFirst = group.options.filter(item => {
        return item.account.toUpperCase().indexOf(val.toUpperCase()) == 0 || item.name.toUpperCase().indexOf(val.toUpperCase()) == 0;
      });
      if (subFilterFirst.length > 0) {
        output.push({
          label: group.label,
          options: subFilterFirst
        });
        existsGroups.push(group.label);
      }
    });

    // 其次匹配字符串中间的字母
    input.forEach(group => {
      let subFilterOther = group.options.filter(item => {
        return item.account.toUpperCase().indexOf(val.toUpperCase()) > 0 || item.name.toUpperCase().indexOf(val.toUpperCase()) > 0;
      });
      if (subFilterOther.length > 0) {
        let tempArr = subFilterOther.filter(d => {
          return existsGroups.indexOf(group.label) != -1
        })
        if (tempArr && tempArr.length > 0) { // 已有的group，直接追加到options里面去
          output.find(d => {
            return d.label == group.label
          }).options.push(tempArr);
        } else { // 不存在的group，追加分组的key(label)和options
          output.push({
            label: group.label,
            options: subFilterOther
          });
        }
      }
    });

    return output;
  },

  memberQueryAll(callback) {
    let result = {
      users: [],
      usersFull: []
    };
    axios({
        method: "post",
        url: "/user/query",
        headers: {
          "Content-type": "application/x-www-form-urlencoded"
        }
      })
      .then(function (res) {
        let json = eval(res.data);
        let accounted = [];
        let groups = [];
        let groupKey = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
        for (let i = 0; i < json.length; i++) {
          result.users.push({
            label: json[i].userName,
            value: json[i].userId,
            account: json[i].userAccount,
            email: json[i].userEmail
          });
          accounted.push({
            label: json[i].userAccount + " - " + json[i].userName,
            account: json[i].userAccount,
            name: json[i].userName,
            value: json[i].userId,
            email: json[i].userEmail
          });
        }
        groupKey.forEach(key => {
          let current = {
            label: key,
            options: []
          };
          accounted.forEach(item => {
            if (item.label.substring(0, 1) == key) {
              current.options.push({
                label: item.label,
                account: item.account,
                name: item.name,
                value: item.value,
                email: item.email
              });
            }
          });
          groups.push(current);
        });
        result.usersFull = groups.filter(item => {
          return item.options.length > 0;
        });
        Vue.prototype.$nextTick(() => {
          if (typeof callback == "function") {
            callback(result);
          }
        });
      })
  },

  memberQuery(callback) {
    let result = {
      users: [],
      usersFull: []
    };
    axios({
        method: "post",
        url: "/user/query_p",
        headers: {
          "Content-type": "application/x-www-form-urlencoded"
        }
      })
      .then(function (res) {
        let json = eval(res.data);
        let accounted = [];
        let groups = [];
        let groupKey = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
        for (let i = 0; i < json.length; i++) {
          result.users.push({
            label: json[i].userName,
            account: json[i].userAccount,
            value: json[i].userId,
            email: json[i].userEmail
          });
          accounted.push({
            label: json[i].userAccount + " - " + json[i].userName,
            account: json[i].userAccount,
            name: json[i].userName,
            value: json[i].userId,
            email: json[i].userEmail
          });
        }
        groupKey.forEach(key => {
          let current = {
            label: key,
            options: []
          };
          accounted.forEach(item => {
            if (item.label.substring(0, 1) == key) {
              current.options.push({
                label: item.label,
                account: item.account,
                name: item.name,
                value: item.value,
                email: item.email
              });
            }
          });
          groups.push(current);
        });
        result.usersFull = groups.filter(item => {
          return item.options.length > 0;
        });
        Vue.prototype.$nextTick(() => {
          if (typeof callback == "function") {
            callback(result);
          }
        });
      })
  },

  roleMemberQuery(productId, roleId, callback) {
    let result = {
      users: [],
      usersFull: []
    };
    axios.post("/user/query_p_r/" + productId + "/" + roleId)
      .then(function (res) {
        let json = eval(res.data);
        let accounted = [];
        let groups = [];
        let groupKey = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
        for (let i = 0; i < json.length; i++) {
          result.users.push({
            label: json[i].userName,
            account: json[i].userAccount,
            value: json[i].userId,
            email: json[i].userEmail
          });
          accounted.push({
            label: json[i].userAccount + " - " + json[i].userName,
            account: json[i].userAccount,
            name: json[i].userName,
            value: json[i].userId,
            email: json[i].userEmail
          });
        }
        groupKey.forEach(key => {
          let current = {
            label: key,
            options: []
          };
          accounted.forEach(item => {
            if (item.label.substring(0, 1) == key) {
              current.options.push({
                label: item.label,
                account: item.account,
                name: item.name,
                value: item.value,
                email: item.email
              });
            }
          });
          groups.push(current);
        });
        result.usersFull = groups.filter(item => {
          return item.options.length > 0;
        });
        Vue.prototype.$nextTick(() => {
          if (typeof callback == "function") {
            callback(result);
          }
        });
      })
  },

  memberQueryProduct(productId) {
    let result = {
      users: [],
      usersFull: []
    };
    axios.post("/user/query_product/" + productId)
      .then(function (res) {
        let json = res.data;
        for (let i = 0; i < json.length; i++) {
          result.users.push({
            label: json[i].userName,
            value: json[i].userId
          });
          result.usersFull.push({
            label: json[i].userAccount + " - " + json[i].userName,
            value: json[i].userId
          });
        }
      })
    return result;
  },

  releaseQuery(callback) {
    let _self = this;
    let result = {
      releases: [],
      releasesWithBranch: [],
      original: []
    };
    axios({
        method: "post",
        url: "/release/query",
        headers: {
          "Content-type": "application/x-www-form-urlencoded"
        }
      })
      .then(function (res) {
        result.original = eval(res.data.list);
        result.original.forEach(item => {
          result.releases.push({
            value: item.id,
            label: item.relCode,
            rdate: item.relDate,
            disabled: item.status === 0
          });
          result.releasesWithBranch.push({
            value: item.id,
            label: item.relCode,
            key: item.branchName,
            rdate: item.relDate,
            disabled: item.status === 0
          });
        });
        Vue.prototype.$nextTick(() => {
          if (typeof callback == "function") {
            callback && callback(result);
          }
        });
      })
  },

  openRelQuery(callback) {
    let _self = this;
    let result = {
      releases: [],
      releasesWithBranch: [],
      original: []
    };
    axios({
        method: "post",
        url: "/release/opening",
        headers: {
          "Content-type": "application/x-www-form-urlencoded"
        }
      })
      .then(function (res) {
        result.original = eval(res.data);
        result.original.forEach(item => {
          result.releases.push({
            value: item.id,
            label: item.relCode,
            rdate: item.relDate,
            disabled: item.status === 0
          });
          result.releasesWithBranch.push({
            value: item.id,
            label: "[" + item.branchName + "] " + item.relCode,
            rdate: item.relDate,
            disabled: item.status === 0
          });
        });
        Vue.prototype.$nextTick(() => {
          if (typeof callback == "function") {
            callback && callback(result);
          }
        });
      })
    },
    openRelQuerySonar(callback) {
      let _self =  this;
      let result = {
        releases: [],
        releasesWithBranch: [],
        original: []
      };
      let mst={
        value: "master",
        label: "master",
        rdate: "",
        disabled: false
      };
      let rels={
        value: "release",
        label: "release",
        rdate: "",
        disabled: false
      };
      axios({
        method: "post",
        url: "/release/opening",
        headers: {
          "Content-type": "application/x-www-form-urlencoded"
        }
      })
        .then(function (res) {
          result.original = eval(res.data);
          result.original.forEach(item => {
            result.releases.push({
              value: item.id,
              label: item.relCode,
              rdate: item.relDate,
              disabled: item.status === 0
            });
            result.releasesWithBranch.push({
              value: item.id,
              label: "[" + item.branchName + "] " + item.relCode,
              rdate: item.relDate,
              disabled: item.status === 0
            });
          });
          result.releases.push(mst);
          result.releases.push(rels);
          Vue.prototype.$nextTick(() => {
            if (typeof callback == "function") {
              callback && callback(result);
            }
          });
        })
    },


  attachmentQuery(fileIds) {
    let _self = this;
    let attachs = [];
    if (_self.isNull(fileIds)) {
      return [];
    }
    axios.post("/file/query/" + fileIds)
      .then(function (res) {
        let json = eval(res.data);
        if (json.length == 0) {
          return [];
        }
        json.forEach(item => {
          attachs.push({
            id: item.id,
            name: item.fileName,
            uploadDate: item.uploadDate,
            uploadUser: item.uploadUser,
            uploadUserName: item.uploadUserName,
            url: item.url
          });
        })
      })
    return attachs;
  },

  attachmentDelete(file, fileList, callback) {
    let _self = this;
    let id = null;
    if (!file || (!file.id && !file.response)) {
      return;
    } else {
      id = file.id ? file.id : file.response[0].id
    }
    axios.post("/file/delete/" + id)
      .then(function (res) {
        if (res.data > 0) {
          Vue.prototype.$message.success("文件删除成功！");
          if (typeof callback == "function") {
            callback && callback(fileList);
          }
        } else {
          Vue.prototype.$message.info("文件删除失败");
          console.log(res);
        }
      })
  },

  attachmentUpload(file, fileList, callback) {
    let _self = this;
    let temp = file.name.split("#");
    let len = temp.length;
    let tempName = "";
    for (let i = 0; i < len; i++) {
      tempName += temp[i] + (i == len - 1 ? "" : " ");
    }
    let pureName = tempName.substring(0, tempName.lastIndexOf("."));
    let verNo = 1;
    for (let i = 0; i < fileList.length; i++) {
      if (pureName == fileList[i].name.split("_V")[0]) {
        verNo++;
      }
    }
    let fileName = pureName + "_V" + verNo + " @ " + dateFormat(new Date(), "yyyyMMddHhmmss") + " @ " +
      sessionStorage.userAccount + file.name.substring(file.name.lastIndexOf("."));

    let formData = new FormData();
    formData.append("file", file);

    axios({
        method: "post",
        url: "/file/upload",
        headers: {
          "Content-type": "multipart/form-data"
        },
        params: {
          fileName: fileName
        },
        data: formData
      })
      .then(function (res) {
        if (!res.data || res.data.length == 0) {
          Vue.prototype.$message.info("文件上传失败！");
          console.log(res);
          return;
        }
        Vue.prototype.$message.success("文件上传成功！");
        fileList.push(res.data[0]);
        if (typeof callback == "function") {
          callback && callback(fileList);
        }
      })
  },

  attachmentDownload(fileData) {
    axios({
        method: "post",
        url: "/file/download",
        headers: {
          "Content-type": "application/json"
        },
        params: {
          file: fileData
        },
        responseType: 'blob'
      })
      .then(res => {
        if (!res) {
          return
        }
        if (fileData.name == undefined) {
          fileData.name = fileData.label;
        }
        let url = window.URL.createObjectURL(new Blob([res.data]))
        let link = document.createElement('a')
        link.style.display = 'none'
        link.href = url
        link.setAttribute('download', fileData.name)
        document.body.appendChild(link)
        link.click()
      })
      .catch(function (response) {
        Vue.prototype.$message.warning("文件链接已失效，无法下载！");
        console.log(response);
      });
  },

  roleAllow(target) {
    if (!sessionStorage.roles) {
      return false;
    }
    let roles = sessionStorage.roles.split(",");
    for (let i = 0; i < roles.length; i++) {
      if (target.indexOf(parseInt(roles[i])) > -1) {
        return true;
      }
    }
    return false;
  },

  roleAllowStrict(target) {
    if (!sessionStorage.roles) {
      return false;
    }

    let allRoles = [];
    let restRoles = [];
    const userRoles = localStorage.getItem("userRoles");
    eval(userRoles).forEach(item => {
      allRoles.push(parseInt(item.roleId));
    });
    allRoles.forEach(d => {
      if (target.indexOf(d) == -1) {
        restRoles.push(d);
      }
    });
    let targetContains = false;
    let restExcluded = false;
    let roles = sessionStorage.roles.split(",");
    for (let i = 0; i < roles.length; i++) {
      if (target.indexOf(parseInt(roles[i])) > -1) {
        targetContains = true;
      }
      if (restRoles.indexOf(parseInt(roles[i])) == -1) {
        restExcluded = true;
      } else {
        return false;
      }
    }
    return targetContains && restExcluded;
  },

  checkUrl(url) {
    const strRegex = '^((https|http|ftp)?://)';
    let re = new RegExp(strRegex);
    if (re.test(url)) {
      return true;
    } else {
      return false;
    }
  }
};
</script>
