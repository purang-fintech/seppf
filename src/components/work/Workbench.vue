<template>
  <div class="index-content">
    <el-card class="my-project">
      <div slot="header">
        <span style="font-size:15px;font-weight:600">我参与的项目</span>
        <span style="float:right">当前项目：{{productName}}</span>
      </div>
      <el-card v-for="(item, index) in userProducts" :key="index" class="project-list" shadow="never" @dblclick.native="chooseProject(item)">
        <div slot="header">
          <el-popover placement="right-start" width="150" trigger="hover" title="拥有角色：" popper-class="role-list">
            <p v-for="(role, index) in getRoles(item.productId).roleNames" :key="index"><i class="el-icon-user"/>{{role}}</p>
            <span style="color:#FFF" slot="reference">{{item.productName}}</span>
          </el-popover>
          <el-link type="primary" style="float:right" @click="chooseProject(item)" :disabled="productName==item.productName" :underline="false" icon="el-icon-right">进入</el-link>
        </div>
      </el-card>
      <el-card class="project-list" shadow="never" :class="[userProducts.length%4 > 0 ? 'special-list-wb': 'normal-list-wb']">
        <div slot="header">
          <el-link type="primary" @click="showNew=true" style="float:left" :underline="false" icon="el-icon-plus">新建产品/项目</el-link>
        </div>
      </el-card>
    </el-card>

    <el-dialog :close-on-click-modal="modalClose" :visible.sync="showNew" width="950px">
      <v-prod ref="createProduct"></v-prod>
      <div slot="footer">
        <el-button type="primary" icon="el-icon-close" @click="showNew=false" size="mini">取消</el-button>
        <el-button type="primary" icon="el-icon-check" @click="saveCreate()" size="mini">保存</el-button>
      </div>
    </el-dialog>

    <el-drawer title="版本 / 迭代计划 —— 待发布" :visible.sync="showAllRelease" direction="rtl" size="50%">
      <el-table :data="release.allData" size="mini" stripe :border="showBorder" :max-height="maxHeight">
        <el-table-column type="index" width="100" label="序号" align="center"></el-table-column>
        <el-table-column prop="branchName" label="版本分支" align="center" sortable>
        </el-table-column>
        <el-table-column prop="relCode" label="版本编号" align="center" sortable>
        </el-table-column>
        <el-table-column prop="relDate" width="150" label="计划发布日期" align="center" sortable>
        </el-table-column>
      </el-table>
    </el-drawer>

    <el-drawer title="版本 / 迭代计划 —— 待发布" :visible.sync="showMyRelease" direction="rtl" size="50%">
      <el-table :data="release.mineData" size="mini" stripe :border="showBorder" :max-height="maxHeight">
        <el-table-column type="index" width="100" label="序号" align="center"></el-table-column>
        <el-table-column prop="branchName" label="版本分支" align="center" sortable>
        </el-table-column>
        <el-table-column prop="relCode" label="版本编号" align="center" sortable>
        </el-table-column>
        <el-table-column prop="relDate" width="150" label="计划发布日期" align="center" sortable>
        </el-table-column>
      </el-table>
    </el-drawer>

    <el-drawer title="产品需求 —— 待排期" :visible.sync="showPooledRequest" direction="rtl" size="50%">
      <el-table :data="requirement.pooledData" size="mini" stripe :border="showBorder" :max-height="maxHeight">
        <el-table-column type="index" width="100" label="序号" align="center"></el-table-column>
        <el-table-column prop="id" width="100" label="需求编号" align="center" sortable>
        </el-table-column>
        <el-table-column prop="summary" label="需求摘要" header-align="center" show-overflow-tooltip>
        </el-table-column>
        <el-table-column prop="expectDate" width="150" label="期望完成日期" align="center" sortable>
        </el-table-column>
      </el-table>
    </el-drawer>

    <el-drawer title="产品需求 —— 开发中" :visible.sync="showDevRequest" direction="rtl" size="50%">
      <el-table :data="requirement.devingData" size="mini" stripe :border="showBorder" :max-height="maxHeight">
        <el-table-column type="index" width="100" label="序号" align="center"></el-table-column>
        <el-table-column prop="id" width="100" label="需求编号" align="center" sortable>
        </el-table-column>
        <el-table-column prop="summary" label="需求摘要" header-align="center" show-overflow-tooltip>
        </el-table-column>
        <el-table-column prop="expectDate" width="150" label="期望完成日期" align="center" sortable>
        </el-table-column>
      </el-table>
    </el-drawer>

    <el-drawer title="产品需求 —— 与我相关" :visible.sync="showMyRequest" direction="rtl" size="50%">
      <el-table :data="requirement.mineData" size="mini" stripe :border="showBorder" :max-height="maxHeight">
        <el-table-column type="index" width="100" label="序号" align="center"></el-table-column>
        <el-table-column prop="id" width="100" label="需求编号" align="center" sortable>
        </el-table-column>
        <el-table-column prop="summary" label="需求摘要" header-align="center" show-overflow-tooltip>
        </el-table-column>
        <el-table-column prop="expectDate" width="150" label="期望完成日期" align="center" sortable>
        </el-table-column>
      </el-table>
    </el-drawer>

    <el-drawer title="产品缺陷 —— 未关闭" :visible.sync="showAllDefect" direction="rtl" size="50%">
      <el-table :data="defect.allData" size="mini" stripe :border="showBorder" :max-height="maxHeight">
        <el-table-column type="index" width="100" label="序号" align="center"></el-table-column>
        <el-table-column prop="id" width="100" label="缺陷编号" align="center" sortable>
        </el-table-column>
        <el-table-column prop="summary" label="缺陷摘要" header-align="center" show-overflow-tooltip>
        </el-table-column>
        <el-table-column prop="foundTime" width="150" label="发现时间" align="center" sortable>
        </el-table-column>
      </el-table>
    </el-drawer>

    <el-drawer title="产品缺陷 —— 与我相关" :visible.sync="showMyDefect" direction="rtl" size="50%">
      <el-table :data="defect.mineData" size="mini" stripe :border="showBorder" :max-height="maxHeight">
        <el-table-column type="index" width="100" label="序号" align="center"></el-table-column>
        <el-table-column prop="id" width="100" label="缺陷编号" align="center" sortable>
        </el-table-column>
        <el-table-column prop="summary" label="缺陷摘要" header-align="center" show-overflow-tooltip>
        </el-table-column>
        <el-table-column prop="foundTime" width="150" label="发现时间" align="center" sortable>
        </el-table-column>
      </el-table>
    </el-drawer>

    <el-drawer title="开发任务 —— 未完成" :visible.sync="showAllCms" direction="rtl" size="50%">
      <el-table :data="cms.allData" size="mini" stripe :border="showBorder" :max-height="maxHeight">
        <el-table-column type="index" width="100" label="序号" align="center"></el-table-column>
        <el-table-column prop="id" width="100" label="任务编号" align="center" sortable>
        </el-table-column>
        <el-table-column prop="summary" label="任务摘要" header-align="center" show-overflow-tooltip>
        </el-table-column>
        <el-table-column prop="planTo" width="150" label="计划完成日期" align="center" sortable>
        </el-table-column>
      </el-table>
    </el-drawer>

    <el-drawer title="开发任务 —— 与我相关" :visible.sync="showMyCms" direction="rtl" size="50%">
      <el-table :data="cms.mineData" size="mini" stripe :border="showBorder" :max-height="maxHeight">
        <el-table-column type="index" width="100" label="序号" align="center"></el-table-column>
        <el-table-column prop="id" width="100" label="任务编号" align="center" sortable>
        </el-table-column>
        <el-table-column prop="summary" label="任务摘要" header-align="center" show-overflow-tooltip>
        </el-table-column>
        <el-table-column prop="planTo" width="150" label="计划完成日期" align="center" sortable>
        </el-table-column>
      </el-table>
    </el-drawer>

    <el-card class="project-work">
      <div slot="header">
        <span style="font-size:15px;font-weight:600">{{productName}}——项目工作</span>
        <span style="float:right">展示内容可通过『个人中心/工作台配置』定制</span>
      </div>
      <el-card class="work-card" v-if="toBeShown(1)">
        <div slot="header">
          <span>版本 / 迭代计划</span>
          <el-link type="primary" @click="$router.push('/release')" :underline="false">查看详情<i class="el-icon-tickets"></i></el-link>
        </div>
        <div class="work-content" style="width:48.5%;display:inline-block">
          <div class="content-name">待发布</div>
          <div style="width:100%;text-align:center">
            <el-link type="primary" class="content-number" @click="showAllRelease=true" :underline="false">{{release.count}}</el-link>
          </div>
        </div>
        <el-divider direction="vertical"></el-divider>
        <div class="work-content" style="width:48.5%;display:inline-block">
          <div class="content-name" style="color: yellow">与我相关</div>
          <div style="width:100%;text-align:center">
            <el-link type="primary" class="content-number" @click="showMyRelease=true" :underline="false">{{release.mine}}
              <span style="font-size:16px;font-weight:500">{{release.count == 0 ? '0.0%' : (release.mine * 100 / release.count).toFixed(1) + '%'}}</span>
            </el-link>
          </div>
        </div>
      </el-card>
      <el-card class="work-card" v-if="toBeShown(2)">
        <div slot="header">
          <span>项目质量预警</span>
          <el-link type="primary" @click="$router.push('/warning')" :underline="false">查看详情<i class="el-icon-tickets"></i></el-link>
        </div>
        <div class="work-content" style="width:48.5%;display:inline-block">
          <div class="content-name">当前合计</div>
          <div style="width:100%;text-align:center">
            <el-link type="primary" class="content-number" :underline="false">{{warning.count}}</el-link>
          </div>
        </div>
        <el-divider direction="vertical"></el-divider>
        <div class="work-content" style="width:48.5%;display:inline-block">
          <div class="content-name" style="color: yellow">与我相关</div>
          <div style="width:100%;text-align:center">
            <el-link type="primary" class="content-number" :underline="false">{{warning.mine}}
              <span style="font-size:16px;font-weight:500">{{warning.count == 0 ? '0.0%' : (warning.mine * 100 / warning.count).toFixed(1) + '%'}}</span>
            </el-link>
          </div>
        </div>
      </el-card>
      <el-card class="work-card" v-if="toBeShown(3)">
        <div slot="header">
          <span>产品缺陷</span>
          <el-link type="primary" @click="$router.push('/defect')" :underline="false">查看详情<i class="el-icon-tickets"></i></el-link>
        </div>
        <div class="work-content" style="width:48.5%;display:inline-block">
          <div class="content-name">未关闭</div>
          <div style="width:100%;text-align:center">
            <el-link type="primary" class="content-number" @click="showAllDefect=true" :underline="false">{{defect.count}}</el-link>
          </div>
        </div>
        <el-divider direction="vertical"></el-divider>
        <div class="work-content" style="width:48.5%;display:inline-block">
          <div class="content-name" style="color: yellow">与我相关</div>
          <div style="width:100%;text-align:center">
            <el-link type="primary" class="content-number" @click="showMyDefect=true" :underline="false">{{defect.mine}}
              <span style="font-size:16px;font-weight:500">{{defect.count == 0 ? '0.0%' : (defect.mine * 100 / defect.count).toFixed(1) + '%'}}</span>
            </el-link>
          </div>
        </div>
      </el-card>
      <el-card class="work-card" v-if="toBeShown(4)">
        <div slot="header">
          <span>产品需求</span>
          <el-link type="primary" @click="$router.push('/request')" :underline="false">列表<i class="el-icon-tickets"></i></el-link>
          <el-link type="primary" @click="$router.push({name: 'dashboard', params: {type: 'req'}})" :underline="false">看板<i class="el-icon-s-grid"></i></el-link>
        </div>
        <div class="work-content" style="width:31.5%;display:inline-block">
          <div class="content-name">待排期</div>
          <div style="width:100%;text-align:center">
            <el-link type="primary" class="content-number" @click="showPooledRequest=true" :underline="false">{{requirement.pooled}}</el-link>
          </div>
        </div>
        <el-divider direction="vertical"></el-divider>
        <div class="work-content" style="width:31.5%;display:inline-block">
          <div class="content-name">开发中</div>
          <div style="width:100%;text-align:center">
            <el-link type="primary" class="content-number" @click="showDevRequest=true" :underline="false">{{requirement.deving}}</el-link>
          </div>
        </div>
        <el-divider direction="vertical"></el-divider>
        <div class="work-content" style="width:31.5%;display:inline-block">
          <div class="content-name" style="color: yellow">与我相关</div>
          <div style="width:100%;text-align:center">
            <el-link type="primary" class="content-number" @click="showMyRequest=true" :underline="false">{{requirement.mine}}
              <span style="font-size:16px;font-weight:500">{{requirement.pooled == 0 && requirement.deving == 0 ? '0.0%' : (requirement.mine * 100 / (requirement.pooled + requirement.deving)).toFixed(1) + '%'}}</span>
            </el-link>
          </div>
        </div>
      </el-card>
      <el-card class="work-card" v-if="toBeShown(5)">
        <div slot="header">
          <span>开发任务</span>
          <el-link type="primary" @click="$router.push({name: 'missions', params: {type: 'coding'}})" :underline="false">列表<i class="el-icon-tickets"></i></el-link>
          <el-link type="primary" @click="$router.push({name: 'dashboard', params: {type: 'cms'}})" :underline="false">看板<i class="el-icon-s-grid"></i></el-link>
        </div>
        <div class="work-content" style="width:48.5%;display:inline-block">
          <div class="content-name">未完成</div>
          <div style="width:100%;text-align:center">
            <el-link type="primary" class="content-number" @click="showAllCms=true" :underline="false">{{cms.count}}</el-link>
          </div>
        </div>
        <el-divider direction="vertical"></el-divider>
        <div class="work-content" style="width:48.5%;display:inline-block">
          <div class="content-name" style="color: yellow">与我相关</div>
          <div style="width:100%;text-align:center">
            <el-link type="primary" class="content-number" @click="showMyCms=true" :underline="false">{{cms.mine}}
              <span style="font-size:16px;font-weight:500">{{cms.count == 0 ? '0.0%' : (cms.mine * 100 / cms.count).toFixed(1) + '%'}}</span>
            </el-link>
          </div>
        </div>
      </el-card>
      <el-card class="work-card" v-if="toBeShown(6)">
        <div slot="header">
          <span>测试执行</span>
          <el-link type="primary" @click="$router.push('/testexec')" :underline="false">查看详情<i class="el-icon-tickets"></i></el-link>
        </div>
        <div class="work-content" style="width:31.5%;display:inline-block">
          <div class="content-name">集合用例</div>
          <div class="content-number" style="color:#FFF">{{testcase.count}}</div>
        </div>
        <el-divider direction="vertical" class="special-divider"></el-divider>
        <div class="work-content" style="width:31.5%;display:inline-block">
          <div class="content-name">尚未通过</div>
          <div class="content-number" style="color:#FFF">{{testcase.notPassed}}
            <span style="font-size:16px;font-weight:500">{{testcase.count == 0 ? '0.0%' : (testcase.notPassed * 100 / testcase.count).toFixed(1) + '%'}}</span>
          </div>
        </div>
        <el-divider direction="vertical" class="special-divider"></el-divider>
        <div class="work-content" style="width:31.5%;display:inline-block">
          <div class="content-name" style="color: yellow">与我相关</div>
          <div class="content-number" style="color:#FFF">{{testcase.mine}}
            <span style="font-size:16px;font-weight:500">{{testcase.notPassed == 0 ? '0.0%' : (testcase.mine * 100 / testcase.notPassed).toFixed(1) + '%'}}</span>
          </div>
        </div>
      </el-card>
      <el-card class="work-card" v-if="toBeShown(7)">
        <div slot="header">
          <span>发布流水线</span>
          <el-link type="primary" @click="$router.push('/build')" :underline="false">查看详情<i class="el-icon-tickets"></i></el-link>
        </div>
        <div class="work-content" style="width:48.5%;display:inline-block">
          <div class="content-name">当前合计</div>
          <div style="width:100%;text-align:center">
            <el-link type="primary" class="content-number" :underline="false">{{pipeline.count}}</el-link>
          </div>
        </div>
        <el-divider direction="vertical"></el-divider>
        <div class="work-content" style="width:48.5%;display:inline-block">
          <div class="content-name" style="color: yellow">最新失败</div>
          <div style="width:100%;text-align:center">
            <el-link type="primary" class="content-number" :underline="false">{{pipeline.failed}}
              <span style="font-size:16px;font-weight:500">{{pipeline.count == 0 ? '0.0%' : (pipeline.failed * 100 / pipeline.count).toFixed(1) + '%'}}</span>
            </el-link>
          </div>
        </div>
      </el-card>
      <el-card class="work-card" v-if="toBeShown(8)">
        <div slot="header">
          <span>代码规范扫描</span>
          <el-link type="primary" @click="$router.push('/sonarScan')" :underline="false">查看详情<i class="el-icon-tickets"></i></el-link>
          <el-link type="primary" :underline="false">级别过滤<i class="el-icon-arrow-down"></i></el-link>
        </div>
        <div class="work-content" style="width:31.5%;display:inline-block">
          <div class="content-name">增量</div>
          <div style="width:100%;text-align:center">
            <el-link type="primary" class="content-number" :underline="false">{{codeScan.addition}}</el-link>
          </div>
        </div>
        <el-divider direction="vertical"></el-divider>
        <div class="work-content" style="width:31.5%;display:inline-block">
          <div class="content-name">全量</div>
          <div style="width:100%;text-align:center">
            <el-link type="primary" class="content-number" :underline="false">{{codeScan.all}}
            </el-link>
          </div>
        </div>
        <el-divider direction="vertical"></el-divider>
        <div class="work-content" style="width:31.5%;display:inline-block">
          <div class="content-name" style="color: yellow">与我相关</div>
          <div style="width:100%;text-align:center">
            <el-link type="primary" class="content-number" :underline="false">{{codeScan.mine}}
            </el-link>
          </div>
        </div>
      </el-card>
      <el-card class="work-card" v-if="toBeShown(9)">
        <div slot="header">
          <span>代码安全扫描</span>
          <el-link type="primary" @click="$router.push('/securityScan')" :underline="false">查看详情<i class="el-icon-tickets"></i></el-link>
          <el-link type="primary" :underline="false">级别过滤<i class="el-icon-arrow-down"></i></el-link>
        </div>
        <div class="work-content" style="width:31.5%;display:inline-block">
          <div class="content-name">增量</div>
          <div style="width:100%;text-align:center">
            <el-link type="primary" class="content-number" :underline="false">{{securityScan.addition}}</el-link>
          </div>
        </div>
        <el-divider direction="vertical"></el-divider>
        <div class="work-content" style="width:31.5%;display:inline-block">
          <div class="content-name">全量</div>
          <div style="width:100%;text-align:center">
            <el-link type="primary" class="content-number" :underline="false">{{securityScan.all}}
            </el-link>
          </div>
        </div>
        <el-divider direction="vertical"></el-divider>
        <div class="work-content" style="width:31.5%;display:inline-block">
          <div class="content-name" style="color: yellow">与我相关</div>
          <div style="width:100%;text-align:center">
            <el-link type="primary" class="content-number" :underline="false">{{securityScan.mine}}
            </el-link>
          </div>
        </div>
      </el-card>
      <el-card class="work-card" v-if="toBeShown(10)">
        <div slot="header">
          <span>自动化用例</span>
          <el-link type="primary" @click="$router.push('/autotest')" :underline="false">查看详情<i class="el-icon-tickets"></i></el-link>
        </div>
        <div class="work-content" style="width:23%;display:inline-block">
          <div class="content-name">单元测试</div>
          <div style="width:100%;text-align:center">
            <el-link type="primary" class="content-number" :underline="false">{{autotest.unitTest}}</el-link>
          </div>
        </div>
        <el-divider direction="vertical"></el-divider>
        <div class="work-content" style="width:23%;display:inline-block">
          <div class="content-name">接口测试</div>
          <div style="width:100%;text-align:center">
            <el-link type="primary" class="content-number" :underline="false">{{autotest.interface}}
            </el-link>
          </div>
        </div>
        <el-divider direction="vertical"></el-divider>
        <div class="work-content" style="width:23%;display:inline-block">
          <div class="content-name">Web</div>
          <div style="width:100%;text-align:center">
            <el-link type="primary" class="content-number" :underline="false">{{autotest.web}}
            </el-link>
          </div>
        </div>
        <el-divider direction="vertical"></el-divider>
        <div class="work-content" style="width:23%;display:inline-block">
          <div class="content-name">Mobile</div>
          <div style="width:100%;text-align:center">
            <el-link type="primary" class="content-number" :underline="false">{{autotest.mobile}}
            </el-link>
          </div>
        </div>
      </el-card>
      <el-card class="work-card" v-if="toBeShown(11)">
        <div slot="header">
          <span>自动化通过数</span>
          <el-link type="primary" @click="$router.push('/autotest')" :underline="false">查看详情<i class="el-icon-tickets"></i></el-link>
        </div>
        <div class="work-content" style="width:23%;display:inline-block">
          <div class="content-name">单元测试</div>
          <div style="width:100%;text-align:center">
            <el-link type="primary" class="content-number" :underline="false">{{autotestPassed.unitTest}}</el-link>
          </div>
        </div>
        <el-divider direction="vertical"></el-divider>
        <div class="work-content" style="width:23%;display:inline-block">
          <div class="content-name">接口测试</div>
          <div style="width:100%;text-align:center">
            <el-link type="primary" class="content-number" :underline="false">{{autotestPassed.interface}}
            </el-link>
          </div>
        </div>
        <el-divider direction="vertical"></el-divider>
        <div class="work-content" style="width:23%;display:inline-block">
          <div class="content-name">Web</div>
          <div style="width:100%;text-align:center">
            <el-link type="primary" class="content-number" :underline="false">{{autotestPassed.web}}
            </el-link>
          </div>
        </div>
        <el-divider direction="vertical"></el-divider>
        <div class="work-content" style="width:23%;display:inline-block">
          <div class="content-name">Mobile</div>
          <div style="width:100%;text-align:center">
            <el-link type="primary" class="content-number" :underline="false">{{autotestPassed.mobile}}
            </el-link>
          </div>
        </div>
      </el-card>
      <el-card class="work-card" v-if="toBeShown(12)">
        <div slot="header">
          <span>最新测试覆盖率</span>
          <el-link type="primary" @click="$router.push('/coverage')" :underline="false">查看详情<i class="el-icon-tickets"></i></el-link>
        </div>
        <div class="work-content" style="width:48.5%;display:inline-block">
          <div class="content-name">增量</div>
          <div style="width:100%;text-align:center">
            <el-link type="primary" class="content-number" :underline="false">{{coverage.addition}}</el-link>
          </div>
        </div>
        <el-divider direction="vertical"></el-divider>
        <div class="work-content" style="width:48.5%;display:inline-block">
          <div class="content-name">全量</div>
          <div style="width:100%;text-align:center">
            <el-link type="primary" class="content-number" :underline="false">{{coverage.all}}
            </el-link>
          </div>
        </div>
      </el-card>
    </el-card>

    <el-card class="release-progress">
      <div slot="header">
        <span style="font-size:15px;font-weight:600">版本 / 迭代进展</span>
        <span style="float:right">点击仪表盘可查看进度详情</span>
      </div>

      <el-tabs v-model="activeName" type="card" id="progressTab">
        <el-tab-pane v-for="item in release.allData" :key="item.id" :label="'[' + item.branchName + '] ' + item.relCode" :name="item.relCode">
          <div class="progress-div" :style="{width: progressWidth + 'px'}">
            <el-progress type="dashboard" :stroke-width="13" :percentage="schedule.req.value" :color="colors" :width="progressWidth - 50"></el-progress>
            <div class="process-title" @click="toRequest(item.id)">{{schedule.req.name}}</div>
          </div>
          <div class="progress-div" :style="{width: progressWidth + 'px'}">
            <el-progress type="dashboard" :stroke-width="13" :percentage="schedule.cms.value" :color="colors" :width="progressWidth - 50"></el-progress>
            <div class="process-title" @click="toMission(item.id)">{{schedule.cms.name}}</div>
          </div>
          <div class="progress-div" :style="{width: progressWidth + 'px'}">
            <el-progress type="dashboard" :stroke-width="13" :percentage="schedule.test.value" :color="colors" :width="progressWidth - 50"></el-progress>
            <div class="process-title" @click="toExec(item.id)">{{schedule.test.name}}</div>
          </div>
          <div class="progress-div" :style="{width: progressWidth + 'px'}">
            <el-progress type="dashboard" :stroke-width="13" :percentage="schedule.bug.value" :color="colors" :width="progressWidth - 50"></el-progress>
            <div class="process-title" @click="toDefect(item.id)">{{schedule.bug.name}}</div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import { dateFormat } from "@/util/date.js";
import commonQuery from '../util/CommonQuery.vue';
import createProduct from "@/components/mgr/product/ProductCreate.vue";
export default {
  data() {
    return {
      showBorder: sessionStorage.tableShowBorder == 1,
      modalClose: sessionStorage.dialogAutoClose == 1,
      maxHeight: document.body.clientHeight - 65,
      defects: [],
      priorities: [],
      influences: [],
      productName: sessionStorage.productName,
      userDefined: [],
      showNew: false,
      showAllRelease: false,
      showMyRelease: false,
      showPooledRequest: false,
      showDevRequest: false,
      showMyRelease: false,
      showAllDefect: false,
      showMyDefect: false,
      showAllRequest: false,
      showMyRequest: false,
      showAllCms: false,
      showMyCms: false,
      userProducts: [],
      release: {
        count: 0,
        mine: 0,
        allData: [],
        mineData: []
      },
      warning: {
        count: 0,
        mine: 0,
        allData: [],
        mineData: []
      },
      defect: {
        count: 0,
        mine: 0,
        allData: [],
        mineData: []
      },
      requirement: {
        pooled: 0,
        deving: 0,
        mine: 0,
        pooledData: [],
        devingData: [],
        mineData: []
      },
      cms: {
        count: 0,
        mine: 0,
        allData: [],
        mineData: []
      },
      testcase: {
        count: 0,
        mine: 0,
        notPassed: 0
      },
      pipeline: {
        count: 0,
        failed: 0,
        data: []
      },
      codeScan: {
        addition: 0,
        all: 0,
        mine: 0,
        allData: [],
        mineData: []
      },
      securityScan: {
        addition: 0,
        all: 0,
        mine: 0,
        allData: [],
        mineData: []
      },
      autotest: {
        unitTest: 0,
        interface: 0,
        web: 0,
        mobile: 0,
        data: []
      },
      autotestPassed: {
        unitTest: 0,
        interface: 0,
        web: 0,
        mobile: 0,
        data: []
      },
      coverage: {
        addition: '0.0%',
        all: '0.0%'
      },
      types: [],
      periods: [],
      activeName: "",
      reqCount: 0,
      bugCount: 0,
      colors: [
        {percentage: 20, color: '#EE6F6F'}, 
        {percentage: 40, color: '#DEAF6C'}, 
        {percentage: 60, color: '#9CA9C4'}, 
        {percentage: 80, color: '#3AB4D7'}, 
        {percentage: 100, color: '#6BBD6B'}
      ],
      schedule: {
        req: { value: 100, name: "产品需求"},
        cms: { value: 100, name: "开发任务"},
        test: { value: 100, name: "测试执行"},
        bug: { value: 100, name: "产品缺陷"}
      },
      progressWidth: 250,
      isMounted: false
    };
  },

  components: {
    vProd: createProduct
  },

  watch: {
    activeName: function(val) {
      this.schedule = {
        req: { value: 100, name: "产品需求"},
        cms: { value: 100, name: "开发任务"},
        test: { value: 100, name: "测试执行"},
        bug: { value: 100, name: "产品缺陷"}
      };
      let release = this.release.allData.find(item => {
        return item.relCode === val;
      });
      if (release) {
        this.loadSchedule(release.id);
      }
    }
  },

  created() {
    let _self =  this;
    _self.userProducts.splice(0, _self.userProducts.length);
    let userPrivs = localStorage.getItem("userProducts");
    if (commonQuery.isNull(userPrivs) || eval(JSON.parse(userPrivs)).length == 0) {
      return;
    }
    eval(JSON.parse(userPrivs)).forEach(item => {
      _self.userProducts.push({
        productId: item.productId,
        roles: item.roles,
        roleNames: item.roleNames,
        productName: item.productName,
        productCode: item.productCode
      });
    });

    if (!sessionStorage.portalConfig) {
      _self.$message.warning("用户工作台配置数据异常！");
      return;
    }

    _self.userDefined.splice(0, _self.userDefined.length);
    sessionStorage.portalConfig.split(",").forEach(d => {
      _self.userDefined.push(parseInt(d));
    });

    _self.productReleaseQuery();    //版本/迭代数据
    _self.productRequestQuery();    //需求数据
    _self.productMissionQuery();    //开发任务数据
    _self.productDefectQuery();   //缺陷数据
    _self.productTestingQuery();    //测试用例数据
    _self.productPipelineQuery();   //部署流水线数据

    if (_self.toBeShown(2)) {
      _self.productWarningQuery();
    }
    if (_self.toBeShown(8)) {   //代码规范扫描
      _self.productCodeHealthyQuery();
    }
    if (_self.toBeShown(9)) {   //代码安全扫描
      _self.productCodeSecurityQuery();
    }
    if (_self.toBeShown(10) || _self.toBeShown(11)) {   //自动化测试用例情况
      _self.productAutotestQuery();
    }
    if (_self.toBeShown(12)) {    //代码测试覆盖率情况
      _self.productCoverageQuery();
    }
  },

  mounted() {
    let width = window.getComputedStyle(document.querySelector("#progressTab")).width;
    this.progressWidth = width.substr(0, width.length - 2) / 4 - 20;
  },

  methods: {
    chooseProject(item){
      if (sessionStorage.productName == item.productName) {
        return;
      }
      this.productName = item.productName;
      const thisProject = this.getRoles(item.productId);
      sessionStorage.setItem("productName", item.productName);
      sessionStorage.setItem("productId", item.productId);
      sessionStorage.setItem("roles", thisProject.roles.toString());
      sessionStorage.setItem("roleNames", thisProject.roleNames);
      localStorage.setItem("lastProduct", item.productId);
      window.location.reload();
    },

    saveCreate(){
      this.$refs.createProduct.checkProductCreate();
    },

    getRoles(productId){
      if (this.userProducts.length == 0) {
        return {roles: [], roleNames: []};
      }
      return this.userProducts.find(item => {return item.productId == productId});
    },

    toBeShown(index){
      return this.userDefined.indexOf(index) > -1;
    },

    toRequest(id) {
      this.$router.push({ name: "dashboard", params: { relId: id, type: "req" } });
    },

    toMission(id) {
      this.$router.push({ name: "dashboard", params: { relId: id, type: "cms" } });
    },

    toExec(id) {
      this.$router.push({ name: "testexec", params: { relId: id } });
    },

    toDefect(id) {
      this.$router.push({ name: "defect", params: { relId: id } });
    },

    productReleaseQuery() {
      let _self =  this;
      _self.$axios.post("/dashboard/release")
      .then(function(res) {
        let result = res.data;
        if (!result || result.allData.length == 0) {
          _self.$message.warning("该产品没有待发布版本 / 迭代计划！");
          return;
        }
        _self.release.allData = result.allData;
        _self.release.mineData = result.mineData;
        _self.release.count = result.count;
        _self.release.mine = result.mine;
        _self.activeName = _self.release.allData[0].relCode;
      })
    },

    productRequestQuery() {
      let _self =  this;
      _self.$axios.post("/dashboard/request")
      .then(function(res) {
        let result = res.data;
        // 后端只查了status为1、2、3、4、5的数据
        _self.requirement.allData = result.allData;
        _self.requirement.mineData = result.mineData;
        _self.requirement.pooledData = result.allData.filter(item => {return item.status == 1});
        _self.requirement.devingData = result.allData.filter(item => {return item.status > 1});
        _self.requirement.pooled = _self.requirement.pooledData.length;
        _self.requirement.deving = _self.requirement.devingData.length;
        _self.requirement.mine = result.mine;
      })
    },

    productMissionQuery() {
      let _self =  this;
      _self.$axios.post("/dashboard/cms")
      .then(function(res) {
        let result = res.data;
        _self.cms.allData = result.allData;
        _self.cms.mineData = result.mineData;
        _self.cms.count = result.count;
        _self.cms.mine = result.mine;
      })
    },

    productDefectQuery() {
      let _self =  this;
      _self.$axios.post("/dashboard/defect")
      .then(function(res) {
        let result = res.data;
        _self.defect.allData = result.allData;
        _self.defect.mineData = result.mineData;
        _self.defect.count = result.count;
        _self.defect.mine = result.mine;
      })
    },

    productTestingQuery() {
      let _self =  this;
      _self.$axios.post("/dashboard/testing")
      .then(function(res) {
        let result = res.data;
        _self.testcase.count = result.count;
        _self.testcase.notPassed = result.notPassed;
        _self.testcase.mine = result.mine;
      })
    },

    productPipelineQuery() {
      let _self =  this;
      // _self.$axios.post("/dashboard/pipeline")
      // .then(function(res) {
      //   let result = res.data;
      //   _self.pipeline.count = result.count;
      //   _self.pipeline.failed = result.failed;
      // })
    },

    productWarningQuery() {
      let _self =  this;
      // _self.$axios.post("/dashboard/warning")
      // .then(function(res) {
      //   let result = res.data;
      //   _self.warning.count = result.count;
      //   _self.warning.mine = result.mine;
      // })
    },

    productCodeHealthyQuery() {
      let _self =  this;
      // _self.$axios.post("/dashboard/code_healthy")
      // .then(function(res) {
      //   let result = res.data;
        // _self.codeScan.addition = result.addition;
      //   _self.codeScan.all = result.all;
      //   _self.codeScan.mine = result.mine;
      // })
    },

    productCodeSecurityQuery() {
      let _self =  this;
      // _self.$axios.post("/dashboard/code_security")
      // .then(function(res) {
      //   let result = res.data;
      //   _self.securityScan.addition = result.addition;
      //   _self.securityScan.all = result.all;
      //   _self.securityScan.mine = result.mine;
      // })
    },

    productAutotestQuery() {
      let _self =  this;
      // _self.$axios.post("/dashboard/autotest")
      // .then(function(res) {
      //   let result = res.data;
      //   _self.autotest.unitTest = result.unitTest;
      //   _self.autotest.interface = result.interface;
      //   _self.autotest.web = result.web;
      //   _self.autotest.mobile = result.mobile;
      //   _self.autotestPassed.unitTest = result.unitTestPassed;
      //   _self.autotestPassed.interface = result.interfacePassed;
      //   _self.autotestPassed.web = result.webPassed;
      //   _self.autotestPassed.mobile = result.mobilePassed;
      // })
    },

    productCoverageQuery() {
      let _self =  this;
      // _self.$axios.post("/dashboard/coverage")
      // .then(function(res) {
      //   let result = res.data;
      //   _self.coverage.addition = result.addition;
      //   _self.coverage.all = result.all;
      // })
    },

    loadSchedule(relId) {
      this.relRequestSchedule(relId);
      this.relMissionSchedule(relId);
      this.relTestSchedule(relId);
      this.relDefectSchedule(relId);
    },

    relRequestSchedule(relId) {
      let _self =  this;
      _self.$axios({
          method: "post",
          url: "/index/rel_req_query",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            relId: relId
          }
        })
        .then(function(res) {
          let results = eval(res.data);
          if (results.length === 0) {
            _self.schedule.req.value = 0;
            return;
          }
          let completed = results.filter(item => {
            return item.status === 0 || item.status > 5;
          });
          _self.schedule.req.value = parseInt((completed.length / results.length) * 100);
        })
    },

    relMissionSchedule(relId) {
      let _self =  this;
      _self.$axios({
          method: "post",
          url: "/index/rel_cms_query",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            relId: relId
          }
        })
        .then(function(res) {
          let results = eval(res.data);
          if (results.length === 0) {
            _self.schedule.cms.value = 0;
            return;
          }
          let completed = results.filter(item => {
            return item.status == 0 || item.status >= 5; 
          });
          _self.schedule.cms.value = parseInt((completed.length / results.length) * 100);
        })
    },

    relTestSchedule(relId) {
      let _self =  this;
      _self.$axios({
          method: "post",
          url: "/index/rel_test_query",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            relId: relId
          }
        })
        .then(function(res) {
          if (!res.data || res.data.caseCount === 0) {
            _self.schedule.test.value = 0;
            return;
          }
          let caseCount = res.data.caseCount;
          let passCount = res.data.passCount;
          _self.schedule.test.value = parseInt((passCount / caseCount) * 100);
        })
    },

    relDefectSchedule(relId) {
      let _self =  this;
      _self.$axios({
          method: "post",
          url: "/index/rel_bug_query",
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          },
          params: {
            relId: relId
          }
        })
        .then(function(res) {
          let results = eval(res.data);
          if (results.length == 0) {
            _self.schedule.bug.value = 0;
            return;
          }
          let completed = results.filter(item => {
            return item.status == 0;
          });
          _self.schedule.bug.value = parseInt((completed.length / results.length) * 100);
        })
    }
  }
};
</script>

<style>
.my-project, .project-work, .release-progress {
  margin-bottom: 1%; 
  border-radius: 0; 
}

.my-project .el-card__body,
.project-work .el-card__body {
  padding: 1% 0 0.5% 1%;
}

.special-list-wb {
  position:absolute;
  width: 23.6% !important;
  padding: 10px !important;
}

.normal-list-wb {
  width: 24.3%;
}

.special-list-wb .el-card__header,
.normal-list-wb .el-card__header{
  padding: 10px !important;
}

.project-list {
  display: inline-grid;
  width: 24.3%;
  margin: 0 0.5% 0.5% 0;
  font-size: 15px;
  background-color: #4d5a6b !important;
}

.project-list .el-card__header{
  padding: 10px 20px;
  border: none;
}

.project-list .el-card__body {
  padding: 0;
}

.work-card {
  width: 32.38%;
  display: inline-grid;
  border-radius: 2px;
  margin: 0 0.5% 0.5% 0;
  font-size: 15px;
  background-color: #4d5a6b !important;
}

.index-content .el-card__header>div>span{
  color: #FFF;
  font-size: 15px;
}

.work-card .el-card__header{
  padding: 12px 20px 0;
  height: 45px;
  margin: 0;
}

.work-card .work-content {
  margin: 20px 0;
  display:inline-block;
} 

.work-card .work-content .content-name {
  text-align:center;
  font-size:15px;
  color:#FFF;
}

.work-card .work-content .content-number {
  font-size: 26px;
  font-weight: 600;
  margin-top: 30px;
  text-align:center;
}

.work-card .special-divider {
  margin-top: -60px !important;
}

.work-card .el-divider--vertical {
  display: inline-block;
  height: 75px;
  margin: -20px 0 0;
}

.index-content .el-card {
  background-color: #3b434e;
}

.index-content .el-card__header>div>a{
  float: right;
  margin-left: 10px;
  height: 21px;
  line-height: 21px;
  font-size: 14px;
}

.index-content .el-link i{
  margin-left: 2px;
}

.release-progress .el-card__body {
  padding: 1%;
}

.release-progress .el-tabs__item {
  color: #fff;
}

.release-progress .el-tabs__item.is-active {
  background-color: #4d5a6b;
  color: #3AB4D7;
}

.release-progress .el-card {
  border: none;
}

.release-progress .el-tabs .el-tabs__content{
  background-color: #4d5a6b !important;
  border: 1px solid #EBEEF5;
  border-radius: 2px;
}

.release-progress .el-progress__text{
  color: #fff;
}

.index-content {
  background-color: transparent;
  width: 100%;
  height: auto;
  overflow: hidden;
}

.process-title {
  text-align: center;
  font-size: 16px;
  position: relative;
  top: -50px;
  color: #3AB4D7;
  cursor: pointer;
  height: 10px;
  line-height: 10px;
}

.process-title:hover {
  color: #FFF;
  font-weight: 600;
}

.card-content {
  text-align: center;
  vertical-align: middle;
  margin-top: 30px;
  color: #fff;
  font-size: 48px;
  font-weight: 700;
}

.progress-div {
  display: inline-block;
  margin: 40px 0 0 10px;
}

.progress-div .el-progress {
  margin: 10px 0;
  margin-left: 6%;
}

.role-list {
  background-color: #3b434e;
  color: #fff;
}

.role-list .el-popover__title {
  color: #fff;
  font-weight: 600;
}

.role-list p{
  font-size:14px;
  margin:8px 0 0 15px;
}

.role-list p i{
  margin-right:5px;
}
</style>
