global.defaultDateFormat = "yyyy-MM-dd";
global.defaultTimeFormat = "yyyy-MM-dd HH:mm:ss";

var docHeight = document.body.clientHeight;
global.bodyAviHeightTab = docHeight - 185;
global.bodyAviHeightNTab = docHeight - 165;

workCards = [{
    index: 1,
    title: "版本/迭代计划",
    links: ["查看详情"],
    needed: true,
    contents: [{
        name: "待发布",
        count: 4,
        percent: '100.0%',
        showPercent: false,
        color: '#3AB4D7'
      },
      {
        name: "与我相关",
        count: 2,
        percent: '50.0%',
        showPercent: true,
        color: '#ffff00'
      }
    ]
  },
  {
    index: 2,
    title: "项目质量预警",
    links: ["查看详情"],
    needed: false,
    contents: [{
        name: "当前合计",
        count: 45,
        percent: '100.0%',
        showPercent: false,
        color: '#3AB4D7'
      },
      {
        name: "与我相关",
        count: 15,
        percent: '33.3%',
        showPercent: true,
        color: '#ffff00'
      }
    ]
  },
  {
    index: 3,
    title: "产品缺陷",
    links: ["查看详情"],
    needed: true,
    contents: [{
        name: "未关闭",
        count: 44,
        percent: '100.0%',
        showPercent: false,
        color: '#3AB4D7'
      },
      {
        name: "与我相关",
        count: 10,
        percent: '22.7%',
        showPercent: true,
        color: '#ffff00'
      }
    ]
  },
  {
    index: 4,
    title: "产品需求",
    links: ["列表", "看板"],
    needed: true,
    contents: [{
        name: "待排期",
        count: 12,
        percent: '100.0%',
        showPercent: false,
        color: '#3AB4D7'
      },{
        name: "开发中",
        count: 22,
        percent: '100.0%',
        showPercent: false,
        color: '#3AB4D7'
      },
      {
        name: "与我相关",
        count: 10,
        percent: '44.5%',
        showPercent: true,
        color: '#ffff00'
      }
    ]
  },
  {
    index: 5,
    title: "开发任务",
    links: ["列表", "看板"],
    needed: true,
    contents: [{
        name: "未完成",
        count: 88,
        percent: '100.0%',
        showPercent: false,
        color: '#3AB4D7'
      },
      {
        name: "与我相关",
        count: 20,
        percent: '22.7%',
        showPercent: true,
        color: '#ffff00'
      }
    ]
  },
  {
    index: 6,
    title: "测试执行",
    links: ["查看详情"],
    needed: true,
    contents: [{
        name: "集合用例",
        count: 255,
        percent: '100.0%',
        showPercent: false,
        color: '#3AB4D7'
      },
      {
        name: "尚未通过",
        count: 155,
        percent: '60.1%',
        showPercent: true,
        color: '#3AB4D7'
      },
      {
        name: "与我相关",
        count: 55,
        percent: '35.5%',
        showPercent: true,
        color: '#ffff00'
      }
    ]
  },
  {
    index: 7,
    title: "发布流水线",
    links: ["查看详情"],
    needed: true,
    contents: [{
        name: "当前合计",
        count: 10,
        percent: '100.0%',
        showPercent: false,
        color: '#3AB4D7'
      },
      {
        name: "最新失败",
        count: 1,
        percent: '10.0%',
        showPercent: true,
        color: '#ffff00'
      }
    ]
  },
  {
    index: 8,
    title: "代码规范扫描",
    links: ["查看详情", "级别过滤"],
    needed: false,
    contents: [{
        name: "增量",
        count: 3,
        percent: '100.0%',
        showPercent: false,
        color: '#3AB4D7'
      },
      {
        name: "全量",
        count: 13,
        percent: '100.0%',
        showPercent: false,
        color: '#3AB4D7'
      },
      {
        name: "与我相关",
        count: 1,
        percent: '100.0%',
        showPercent: false,
        color: '#ffff00'
      }
    ]
  },
  {
    index: 9,
    title: "代码安全扫描",
    links: ["查看详情", "级别过滤"],
    needed: false,
    contents: [{
        name: "增量",
        count: 0,
        percent: '100.0%',
        showPercent: false,
        color: '#3AB4D7'
      },
      {
        name: "全量",
        count: 10,
        percent: '100.0%',
        showPercent: false,
        color: '#3AB4D7'
      },
      {
        name: "与我相关",
        count: 2,
        percent: '100.0%',
        showPercent: false,
        color: '#ffff00'
      }
    ]
  },
  {
    index: 10,
    title: "自动化用例数",
    links: ["查看详情"],
    needed: false,
    contents: [{
        name: "单元测试",
        count: 75,
        percent: '100.0%',
        showPercent: false,
        color: '#3AB4D7'
      },
      {
        name: "接口测试",
        count: 155,
        percent: '100.0%',
        showPercent: false,
        color: '#3AB4D7'
      },
      {
        name: "Web",
        count: 345,
        percent: '100.0%',
        showPercent: false,
        color: '#3AB4D7'
      },
      {
        name: "Mobile",
        count: 456,
        percent: '100.0%',
        showPercent: false,
        color: '#3AB4D7'
      }
    ]
  },
  {
    index: 11,
    title: "自动化通过数",
    links: ["查看详情"],
    needed: false,
    contents: [{
        name: "单元测试",
        count: 75,
        percent: '100.0%',
        showPercent: false,
        color: '#3AB4D7'
      },
      {
        name: "接口测试",
        count: 154,
        percent: '100.0%',
        showPercent: false,
        color: '#3AB4D7'
      },
      {
        name: "Web",
        count: 289,
        percent: '100.0%',
        showPercent: false,
        color: '#3AB4D7'
      },
      {
        name: "Mobile",
        count: 450,
        percent: '100.0%',
        showPercent: false,
        color: '#3AB4D7'
      }
    ]
  },
  {
    index: 12,
    title: "最新测试覆盖率",
    links: ["查看详情"],
    needed: false,
    contents: [{
        name: "增量",
        count: "98.5%",
        percent: '100.0%',
        showPercent: false,
        color: '#3AB4D7'
      },
      {
        name: "全量",
        count: "45.5%",
        percent: '100.0%',
        showPercent: false,
        color: '#3AB4D7'
      }
    ]
  }
];
