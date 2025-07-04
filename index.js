// 定义时间单位的中文名称
const CRON_TIME_CN = ['秒', '分', '点', '天', '月', '周', '年'];
const HOURS = 24; // 一天的小时数
const TIMESCALE = 60; // 一小时的分钟数和一分钟的秒数
// 定义星期枚举
const WeekEnum = {
  SUNDAY: { key: '1', nameCn: '周日' },
  MONDAY: { key: '2', nameCn: '周一' },
  TUESDAY: { key: '3', nameCn: '周二' },
  WEDNESDAY: { key: '4', nameCn: '周三' },
  THURSDAY: { key: '5', nameCn: '周四' },
  FRIDAY: { key: '6', nameCn: '周五' },
  SATURDAY: { key: '7', nameCn: '周六' }
};
// 判断星期
/**
 * @param {string} weekNum 星期数字
 * @returns {string} 星期中文
 */
function judgeWeek(weekNum) {
  const weekEntries = Object.values(WeekEnum);
  for (const entry of weekEntries) {
    if (entry.key === weekNum) {
      return entry.nameCn;
    }
  }
  const num = parseInt(weekNum);
  if (isNaN(num) || num < 1 || num > 7) {
    return 'cron表达式有误，dayofWeek数字应为1-7';
  }
  return weekNum;
}
/**
 * @param {string} time 时间
 * @param {number} rangeNum 范围
 * @param {number} index 索引
 * @returns {string} 时间描述 
 */
function appendGapInfo(time, rangeNum, index) {
  const [startNum, gapNum] = time.split('/');
  const endNum = rangeNum + parseInt(startNum) - parseInt(gapNum);
  const timeUnit = CRON_TIME_CN[index];
  return `从${startNum}${timeUnit}开始到${endNum}${timeUnit}范围内,每隔${gapNum}${timeUnit}`;
}

function cronToChinese(cronExp) {
  if (!cronExp || cronExp.trim().length === 0) {
    return 'cron表达式为空';
  }

  const tmpCorns = cronExp.trim().split(/\s+/);
  const result = [];

  // 检查是否所有字段都是*
//   const allAsterisk = tmpCorns.every(field => field === '*');
  const reg = /^(?<s>\*\s+)?(?<m>\*\s+)(?<h>\*\s+)(?<d>(\?|\*)\s+)(?<M>\*\s+)(?<w>(\*|\?))\s+(?=.+)(?<y>\?|\*)\s?$/
  const allAsteriskReg = /^(\*\s+)+((\*|\?)\s+){0,2}(\*|\?)\s?$/
  if (allAsteriskReg.test(cronExp)) {
    // 6|7字段返回每秒，5字段(包含年)返回每分钟
    return tmpCorns.length >= 6 ? '每秒执行一次' : '每分钟执行一次';
  }

  if (tmpCorns.length < 5 || tmpCorns.length > 7) {
    return '表达式格式错误，应为5-7个字段';
  }

  // 解析年 (第7个字段)
  if (tmpCorns.length === 7) {
    const year = tmpCorns[6];
    if (year !== '*' && year !== '?') {
      result.push(`${year}${CRON_TIME_CN[6]}`);
    }
  }

  // 解析月 (第5个字段)
  const months = tmpCorns[4];
  if (months !== '*' && months !== '?') {
    if (months.includes('/')) {
      result.push(appendGapInfo(months, 12, 4));
    } else {
      result.push(`每年${months}${CRON_TIME_CN[4]}`);
    }
  }

  // 解析周 (第6个字段)
  const dayofWeek = tmpCorns[5];
  if (dayofWeek !== '*' && dayofWeek !== '?') {
    if (dayofWeek.includes(',')) {
      result.push(`每周的第${dayofWeek}${CRON_TIME_CN[3]}`);
    } else if (dayofWeek.includes('L') && dayofWeek.length > 1) {
      const weekNum = dayofWeek.split('L')[0];
      const weekName = judgeWeek(weekNum);
      result.push(`每月的最后一周的${weekName}`);
    } else if (dayofWeek.includes('-')) {
      const [start, end] = dayofWeek.split('-');
      const weekOne = judgeWeek(start);
      const weekTwo = judgeWeek(end);
      result.push(`每周的${weekOne}到${weekTwo}`);
    } else {
      let processedDay = dayofWeek === 'L' ? '7' : dayofWeek;
      const weekName = judgeWeek(processedDay);
      result.push(`每周的${weekName}`);
    }
  }

  // 解析日 (第4个字段)
  const days = tmpCorns[3];
  if (days !== '?' && days !== '*') {
    if (days.includes('/')) {
      result.push(appendGapInfo(days, 31, 3));
    } else if (days === 'L') {
      result.push('每月最后一天');
    } else if (days === 'W') {
      result.push('每月最近工作日的');
    } else if (days.includes('#')) {
      const [weekNum, weekOfMonth] = days.split('#');
      const weekName = judgeWeek(weekNum);
      result.push(`每月第${weekOfMonth}${CRON_TIME_CN[5]}${weekName}`);
    } else {
      result.push(`每月第${days}${CRON_TIME_CN[3]}`);
    }
  } else if (result.length === 0 || tmpCorns.length === 7) {
    result.push(`每${CRON_TIME_CN[3]}`);
  }

  // 解析时 (第3个字段)
  const hours = tmpCorns[2];
  if (hours !== '*') {
    if (hours.includes('/')) {
      result.push(appendGapInfo(hours, HOURS, 2));
    } else {
      if (result.length === 0) {
        result.push(`每天${hours}${CRON_TIME_CN[2]}`);
      } else {
        result.push(`${hours}${CRON_TIME_CN[2]}`);
      }
    }
  }

  // 解析分 (第2个字段)
  const minutes = tmpCorns[1];
  if (minutes !== '*') {
    if (minutes.includes('/')) {
      result.push(appendGapInfo(minutes, TIMESCALE, 1));
    } else if (minutes !== '0') {
      if (minutes.includes('-')) {
        const [start, end] = minutes.split('-');
        result.push(`${start}${CRON_TIME_CN[1]}到${end}${CRON_TIME_CN[1]}每分钟`);
      } else {
        result.push(`${minutes}${CRON_TIME_CN[1]}`);
      }
    }
  } else {
    // 分钟为*时添加每分钟描述
    result.push(`每${CRON_TIME_CN[1]}`);
  }

  // 解析秒 (第1个字段)
  const seconds = tmpCorns[0];
  if (seconds !== '*') {
    if (seconds.includes('/')) {
      result.push(appendGapInfo(seconds, TIMESCALE, 0));
    } else if (seconds !== '0') {
      result.push(`第${seconds}${CRON_TIME_CN[0]}`);
    }
  }

  return result.length > 0 ? `${result.join('')}执行一次` : '表达式中文转换异常';
}

// 测试代码
function testCronExpression() {
  const testCases = [
    // 测试只有*和?的情况
    '* * * * *',
    '* * * * * *',
    '* * * * ?',
    '* * * * ? *',
    '0 0 2 1 * ? *',
    '0 15 10 ? * 2-6',
    '0 0 10,14,16 * * ?',
    '0 5 14-16 * * ?',
    '0 15 10 L * ?',
    '0 15 10 ? * 6',
    '0 0 12 * * ? 2002',
    '0 15 10 ? * ? 2002-2005',
    '0 15 10 ? * 6L',
    '0 15 10 6#4 * ?',
    '0 15 10 * * ? *',
    '0 15 10 * * ? 2005',
    '0 * 14 * * ?',
    '0 0/5 14 * * ?',
    '0 0/5 14,18 * * ?',
    '8/10 0/5 3/4 * * ?',
    '* * * * * *',
    '0 * * * * ?'
  ];

  testCases.forEach(cron => {
    console.log(`Cron表达式: ${cron}`);
    console.log(`中文描述: ${cronToChinese(cron)}`);
    console.log('-'.repeat(50));
  });
}

testCronExpression();

console.log(cronToChinese('5 * 4 * * ?'));