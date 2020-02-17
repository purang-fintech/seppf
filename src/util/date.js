function dateFormat(date, fmt) {
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  let o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'H+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  }
  for (let k in o) {
    let str = o[k] + '';
    if (new RegExp(`(${k})`).test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : padLeftZero(str));
    }
  }
  return fmt;
};

function padLeftZero(str) {
  return ('00' + str).substr(str.length);
}

function strToDate(date_str) {
  var str = date_str.split('-');
  return new Date(str[0], str[1] - 1, str[2]);
}

function dateDiff(date_s, date_e) {
  var dTotal = "";
  var y1 = date_s.getFullYear(); //返回表示月份的数字 (0,1,2,3...11)
  var y2 = date_e.getFullYear();
  var m1 = date_s.getMonth(); //返回表示月份的数字 (0,1,2,3...11)
  var m2 = date_e.getMonth() + (y2 - y1) * 12;
  var w1 = date_s.getDay();
  var w2 = date_e.getDay(); //返回表示星期的某一天的數字 
  var d1 = date_s.getDate(); //還回月份的某一天 (1...31)
  var d2 = date_e.getDate();
  var st = date_s.getHours(); //時間的小時的字段 {0.....23}
  var et = date_e.getHours();
  var min1 = date_s.getMinutes();
  var min2 = date_e.getMinutes();
  var dCount = 0;
  var dMin = 0;
  var dHour = 0;
  var dWeek = 0;
  var dt = 0;
  try {
    if (m2 - m1 > 0) {
      for (var i = m1; i < m2; i++) {
        //判断头尾月份总共多少天
        dt += Check_days(i);
      }
      dCount = dt + d2 - d1;
    } else {
      dCount = d2 - d1; //天數差
    }

    if (w2 - w1 <= 0 && dCount > 0) {
      // 星期天 並且天數差大於0
      dWeek = 1;
    } else if (dCount > 7) { //天數差 7天以上 
      dWeek = parseInt(dCount / 7);
    }

    dHour = et - st; //小時差
    dMin = min2 - min1;
    if (min1 == '20') {
      if (min2 == '20') {
        dMin = (dMin) / 60;
      } else {
        dMin = (dMin + 20) / 60;
      }
    } else {
      dMin = dMin / 60;
    }
    dTotal = (dCount - dWeek) * 8 + dHour + dMin;
    //午休时间判断
    return (st < 12 && et > 12) ? dTotal - 1 : dTotal;
  } catch (e) {
    return e.message;
  }
}

function Check_days(v) {
  var days = 0;
  switch (v) {
    case 0:
    case 2:
    case 4:
    case 6:
    case 7:
    case 9:
    case 11:
      days = 31;
      break;
    case 1:
      days = 28;
      break;
    case 3:
    case 5:
    case 8:
    case 10:
      days = 30;
      break;
  }
  return days;
}

function dateAdd (date, interval, number) {
  var d = date;
  var k = {
    'y': 'FullYear',
    'q': 'Month',
    'm': 'Month',
    'w': 'Date',
    'd': 'Date',
    'h': 'Hours',
    'n': 'Minutes',
    's': 'Seconds',
    'ms': 'MilliSeconds'
  };
  var n = {
    'q': 3,
    'w': 7
  };
  eval('d.set' + k[interval] + '(d.get' + k[interval] + '()+' + ((n[interval] || 1) * number) + ')');
  return d;
}

var pickOptions = {
  shortcuts: [{
      text: "最近一周",
      onClick(picker) {
        const end = new Date();
        const start = new Date();
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
        picker.$emit("pick", [start, end]);
      }
    },
    {
      text: "今天",
      onClick(picker) {
        const end = new Date();
        const start = new Date();
        picker.$emit("pick", [start, end]);
      }
    },
    {
      text: "最近一个月",
      onClick(picker) {
        const end = new Date();
        const start = new Date();
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
        picker.$emit("pick", [start, end]);
      }
    },
    {
      text: "最近三个月",
      onClick(picker) {
        const end = new Date();
        const start = new Date();
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
        picker.$emit("pick", [start, end]);
      }
    }
  ]
}

export {
  dateFormat,
  dateDiff,
  dateAdd,
  strToDate,
  pickOptions
}
