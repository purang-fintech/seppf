import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
  routes: [{
      path: '/',
      redirect: '/index',
      meta: {
        requireAuth: true,
        keepAlive: true
      }
    },
    {
      path: '/home',
      component: resolve => require(['@/components/Home.vue'], resolve),
      children: [
        {
          path: '/monitor',
          name: 'monitor',
          meta: {
              requireAuth: true,
              keepAlive: false
          },
          component: resolve => require(['@/components/monitor/MonitorAdmin.vue'], resolve)
        }, 
        {
          path: '/message',
          name: 'message',
          meta: {
            requireAuth: true,
            keepAlive: false
          },
          component: resolve => require(['@/components/center/message/MessageCenter.vue'], resolve)
        },
        {
          path: '/release',
          name: 'release',
          meta: {
            requireAuth: true,
            keepAlive: true
          },
          component: resolve => require(['@/components/sep/rel/Release.vue'], resolve)
        },
        {
          path: '/prereq',
          name: 'prereq',
          meta: {
            requireAuth: true,
            keepAlive: true
          },
          component: resolve => require(['@/components/sep/req/RequestSubmit.vue'], resolve)
        },
        {
          path: '/request',
          name: 'request',
          meta: {
            requireAuth: true,
            keepAlive: true
          },
          component: resolve => require(['@/components/sep/req/Request.vue'], resolve)
        },
        {
          path: '/reqbpmn',
          name: 'reqbpmn',
          meta: {
            requireAuth: true,
            keepAlive: true
          },
          component: resolve => require(['@/components/sep/req/Audit.vue'], resolve)
        },
        {
          path: '/change',
          name: 'change',
          meta: {
            requireAuth: true,
            keepAlive: true
          },
          component: resolve => require(['@/components/sep/req/Change.vue'], resolve)
        },
        {
          path: '/problem',
          name: 'problem',
          meta: {
            requireAuth: true,
            keepAlive: true
          },
          component: resolve => require(['@/components/sep/opr/Problem.vue'], resolve)
        },
        {
          path: '/build',
          name: 'build',
          meta: {
            requireAuth: true,
            keepAlive: true
          },
          component: resolve => require(['@/components/sep/opr/BuildList.vue'], resolve)
        },
        {
          path: '/device',
          name: 'device',
          meta: {
            requireAuth: true,
            keepAlive: true
          },
          component: resolve => require(['@/components/sep/opr/Device.vue'], resolve)
        },
        {
          path: '/jobs',
          name: 'jobs',
          meta: {
            requireAuth: true,
            keepAlive: true
          },
          component: resolve => require(['@/components/mgr/jobs/JobManage.vue'], resolve)
        },
        {
          path: '/dashboard',
          name: 'dashboard',
          meta: {
            requireAuth: true,
            keepAlive: true
          },
          component: resolve => require(['@/components/work/Dashboard.vue'], resolve)
        },
        {
          path: '/missions',
          name: 'missions',
          meta: {
            requireAuth: true,
            keepAlive: true
          },
          component: resolve => require(['@/components/work/Missions.vue'], resolve)
        },
        {
          path: '/testcase',
          name: 'testcase',
          meta: {
            requireAuth: true,
            keepAlive: true
          },
          component: resolve => require(['@/components/sep/test/case/CaseMain.vue'], resolve)
        },
        {
          path: '/testplan',
          name: 'testplan',
          meta: {
            requireAuth: true,
            keepAlive: true
          },
          component: resolve => require(['@/components/sep/test/plan/TestPlan.vue'], resolve)
        },
        {
          path: '/testexec',
          name: 'testexec',
          meta: {
            requireAuth: true,
            keepAlive: true
          },
          component: resolve => require(['@/components/sep/test/exec/TestExec.vue'], resolve)
        },
        {
          path: '/defect',
          name: 'defect',
          meta: {
            requireAuth: true,
            keepAlive: true
          },
          component: resolve => require(['@/components/sep/test/bug/DefectMain.vue'], resolve)
        },
        {
          path: '/testrpt',
          name: 'testrpt',
          meta: {
            requireAuth: true,
            keepAlive: true
          },
          component: resolve => require(['@/components/sep/test/report/TestReport.vue'], resolve)
        },
        {
          path: '/gantt',
          name: 'gantt',
          meta: {
            requireAuth: true,
            keepAlive: true
          },
          component: resolve => require(['@/components/work/Schedule.vue'], resolve)
        },
        {
          path: '/history',
          name: 'history',
          meta: {
            requireAuth: true,
            keepAlive: false
          },
          component: resolve => require(['@/components/center/history/History.vue'], resolve)
        },
        {
          path: '/reqana',
          name: 'reqana',
          meta: {
            requireAuth: true,
            keepAlive: true
          },
          component: resolve => require(['@/components/sqa/ReqAnalysis.vue'], resolve)
        },
        {
          path: '/cmsana',
          name: 'cmsana',
          meta: {
            requireAuth: true,
            keepAlive: true
          },
          component: resolve => require(['@/components/sqa/CmsAnalysis.vue'], resolve)
        },
        {
          path: '/tmsana',
          name: 'tmsana',
          meta: {
            requireAuth: true,
            keepAlive: true
          },
          component: resolve => require(['@/components/sqa/TmsAnalysis.vue'], resolve)
        },
        {
          path: '/bugana',
          name: 'bugana',
          meta: {
            requireAuth: true,
            keepAlive: true
          },
          component: resolve => require(['@/components/sqa/BugAnalysis.vue'], resolve)
        },
        {
          path: '/densities',
          name: 'densities',
          meta: {
            requireAuth: true,
            keepAlive: true
          },
          component: resolve => require(['@/components/sqa/DefectDensityAnalysis.vue'], resolve)
        },
        {
          path: '/comana',
          name: 'comana',
          meta: {
            requireAuth: true,
            keepAlive: true
          },
          component: resolve => require(['@/components/sqa/ComAnalysis.vue'], resolve)
        },
        {
          path: '/404',
          name: '404',
          meta: {
            requireAuth: false,
            keepAlive: true
          },
          component: resolve => require(['@/components/404.vue'], resolve)
        },
        {
          path: '/env',
          name: 'env',
          meta: {
            requireAuth: false,
            keepAlive: true
          },
          component: resolve => require(['@/components/env/info/Environment.vue'], resolve)
        },
        {
          path: '/about',
          name: 'about',
          meta: {
            requireAuth: false,
            keepAlive: false
          },
          component: resolve => require(['@/components/mgr/about/About.vue'], resolve)
        },
        {
          path: '/product',
          name: 'product',
          meta: {
            requireAuth: true,
            keepAlive: false
          },
          component: resolve => require(['@/components/mgr/product/ProductManage.vue'], resolve)
        },
        {
          path: '/module',
          name: 'module',
          meta: {
            requireAuth: true,
            keepAlive: false
          },
          component: resolve => require(['@/components/mgr/product/ModuleManage.vue'], resolve)
        },
        {
          path: '/branch',
          name: 'branch',
          meta: {
            requireAuth: true,
            keepAlive: false
          },
          component: resolve => require(['@/components/mgr/product/BranchManage.vue'], resolve)
        },
        {
          path: '/prdocs',
          name: 'prdocs',
          meta: {
            requireAuth: true,
            keepAlive: true
          },
          component: resolve => require(['@/components/mgr/product/ProductDocument.vue'], resolve)
        },
        {
          path: '/system',
          name: 'system',
          meta: {
            requireAuth: true,
            keepAlive: false
          },
          component: resolve => require(['@/components/mgr/system/SystemSettings.vue'], resolve)
        },
        {
          path: '/workset',
          name: 'workset',
          meta: {
            requireAuth: true,
            keepAlive: false
          },
          component: resolve => require(['@/components/center/personal/PortalSetting.vue'], resolve)
        },
        {
          path: '/team',
          name: 'team',
          meta: {
            requireAuth: true,
            keepAlive: false
          },
          component: resolve => require(['@/components/mgr/team/Organization.vue'], resolve)
        },
        {
          path: '/user',
          name: 'user',
          meta: {
            requireAuth: true,
            keepAlive: false
          },
          component: resolve => require(['@/components/center/personal/UserManage.vue'], resolve)
        },
        {
          path: '/urole',
          name: 'urole',
          meta: {
            requireAuth: true,
            keepAlive: false
          },
          component: resolve => require(['@/components/mgr/priv/UserRoleManage.vue'], resolve)
        },
        {
          path: '/index',
          name: 'index',
          meta: {
            requireAuth: true,
            keepAlive: true
          },
          component: resolve => require(['@/components/work/Workbench.vue'], resolve)
        },
        {
          path: '/fuzzq',
          name: 'fuzzq',
          meta: {
            requireAuth: true,
            keepAlive: true
          },
          component: resolve => require(['@/components/query/FuzzQuery.vue'], resolve)
        },
        {
          path: '/monthly',
          name: 'monthly',
          meta: {
            requireAuth: true,
            keepAlive: true
          },
          component: resolve => require(['@/components/query/Monthly.vue'], resolve)
        },
        {
          path: '/refused',
          name: 'refused',
          meta: {
            requireAuth: true,
            keepAlive: true
          },
          component: resolve => require(['@/components/query/RefusedDefect.vue'], resolve)
        },
        {
          path: '/buildDeployment',
          name: 'buildDeployment',
          meta: {
            requireAuth: true,
            keepAlive: true,
            parent: "/build"
          },
          component: resolve => require(['@/components/sep/opr/BuildDeployment.vue'], resolve)
        },
        {
          path: '/instance',
          name: 'instance',
          meta: {
            requireAuth: true,
            keepAlive: true
          },
          component: resolve => require(['@/components/sep/opr/Instance.vue'], resolve)
        },
        {
          path: '/instanceEnv',
          name: 'instanceEnv',
          meta: {
            requireAuth: true,
            keepAlive: true,
            parent: "/instance"
          },
          component: resolve => require(['@/components/sep/opr/InstanceEnvironment.vue'], resolve)
        },
        {
          path: '/jenkins-build',
          name: 'jenkins-build',
          meta: {
            requireAuth: true,
            keepAlive: true,
            parent: "/instance"
          },
          component: resolve => require(['@/components/sep/opr/JenkinsBuild.vue'], resolve)
        }, 
        {
          path: '/resources',
          name: 'resources',
          meta: {
            requireAuth: true,
            keepAlive: false
          },
          component: resolve => require(['@/components/auth/ResourceConfig.vue'], resolve)
        },
        {
          path: '/menus',
          name: 'menus',
          meta: {
            requireAuth: true,
            keepAlive: false
          },
          component: resolve => require(['@/components/auth/MenuConfig.vue'], resolve)
        },
        {
          path: '/roles',
          name: 'roles',
          meta: {
            requireAuth: true,
            keepAlive: false
          },
          component: resolve => require(['@/components/auth/RoleConfig.vue'], resolve)
        },
        {
          path: '/unauthed',
          name: 'unauthed',
          meta: {
            requireAuth: false,
            keepAlive: false
          },
          component: resolve => require(['@/components/auth/NonAuth.vue'], resolve)
        }
      ]
    },
    {
      path: '/login',
      name: 'login',
      meta: {
        requireAuth: true,
        keepAlive: false
      },
      component: resolve => require(['@/components/Login.vue'], resolve)
    },
    {
      path: '/reporter',
      name: 'reporter',
      meta: {
        requireAuth: false,
        keepAlive: false
      },
      component: resolve => require(['@/components/sep/test/report/ReleaseReport.vue'], resolve)
    },
    {
      path: '/schedule',
      name: 'schedule',
      meta: {
        requireAuth: false,
        keepAlive: false
      },
      component: resolve => require(['@/components/sep/test/report/ScheduleReport.vue'], resolve)
    },
    {
      path: '/exitus',
      name: 'exitus',
      meta: {
        requireAuth: false,
        keepAlive: false
      },
      component: resolve => require(['@/components/sep/test/report/ExitusReport.vue'], resolve)
    },
    {
      path: '/buildLog',
      name: 'buildLog',
      meta: {
        requireAuth: false,
        keepAlive: false
      },
      component: resolve => require(['@/components/sep/opr/BuildLog.vue'], resolve)
    }
  ]
});