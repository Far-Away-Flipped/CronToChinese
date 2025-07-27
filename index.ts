// 定义时间单位的中文名称
const CRON_TIME_CN = ["秒", "分", "点", "日", "月", "周", "年"];
const CRON_TIME_GAP = ["秒", "分钟", "小时", "天", "月", "星期", "年"];
const HOURS = 24; // 一天的小时数
const TIMESCALE = 60; // 一小时的分钟数和一分钟的秒数
// 定义星期枚举
enum WeekEnum {
  SUN = "1",
  MON = "2",
  TUE = "3",
  WED = "4",
  THU = "5",
  FRI = "6",
  SAT = "7",
}
// 定义月份枚举
enum MonthEnum {
  JAN = "1",
  FEB = "2",
  MAR = "3",
  APR = "4",
  MAY = "5",
  JUN = "6",
  JUL = "7",
  AUG = "8",
  SEP = "9",
  OCT = "10",
  NOV = "11",
  DEC = "12",
}
// 星期数转换为汉字
const week_num_to_ch = {
  [WeekEnum.SUN]: "日",
  [WeekEnum.MON]: "一",
  [WeekEnum.TUE]: "二",
  [WeekEnum.WED]: "三",
  [WeekEnum.THU]: "四",
  [WeekEnum.FRI]: "五",
  [WeekEnum.SAT]: "六",
};
// 判断星期
/**
 * @param {string} weekNum 星期数字
 * @returns {string} 星期中文
 */
function judgeWeek(weekNum: string) {
  const num = parseInt(weekNum);
  if (isNaN(num) || num < 1 || num > 7) {
    throw new TypeError("cron表达式有误，dayofWeek数字应为1-7");
  }

  return week_num_to_ch[weekNum as unknown as keyof typeof week_num_to_ch];
}
/**
 * @param {string} time 时间
 * @param {number} rangeNum 范围
 * @param {number} index 索引
 * @returns {string} 时间描述
 */
function appendGapInfo(time: string, rangeNum: number, index: number) {
  const [startNum, gapNum] = time.split("/");
  const endNum = rangeNum + parseInt(startNum) - parseInt(gapNum);
  const time_unit = CRON_TIME_CN[index];
  const time_unit_gap = CRON_TIME_GAP[index];
  return `从${startNum}${time_unit}开始到${endNum}${time_unit}范围内,每隔${gapNum}${time_unit_gap}`;
}

function cronToChinese(cronExp: string) {
  if (!cronExp || cronExp.trim().length === 0) {
    throw new TypeError("cron表达式不能为空");
  }

  const tmpCorns = cronExp.trim().split(/\s+/);
  if (tmpCorns.length < 5 || tmpCorns.length > 7) {
    throw new TypeError("表达式格式错误，应为5-7个有效字段");
  }

  const result: string[] = [];

  const reg =
    /^((?<s>\S+)\s+)?(?<m>\S+)\s+(?<h>\S+)\s+(?<d>\S+)\s+(?<M>\S+)\s+(?<w>\S+)\s*(\s+(?<y>\S+)\s*)?$/;
  const {
    s: second,
    m: minute,
    h: hour,
    d: day,
    M: month,
    w: week,
    y: year,
  } = cronExp.match(reg)?.groups || {};
  const isAny = {
    second: !second || second === "*",
    minute: minute === "*",
    hour: hour === "*",
    day: day === "*" || day === "?",
    month: month === "*",
    week: week === "*" || week === "?",
    year: !year || year === "*",
  };

  const unit_month = month
    .toUpperCase()
    .replace(
      new RegExp(`(${Object.keys(MonthEnum).join("|")})`, "g"),
      (match: string) => {
        return MonthEnum[match as keyof typeof MonthEnum];
      }
    );

  const unit_week = week
    .toUpperCase()
    .replace(
      new RegExp(`(${Object.keys(WeekEnum).join("|")})`, "g"),
      (match: string) => {
        return WeekEnum[match as keyof typeof WeekEnum];
      }
    );

  console.log(
    `'时间解构结果': 秒：${second}, 分钟：${minute}, 小时：${hour}, 天：${day}, 月： ${month}, 星期：${week}, 年：${year}`
  );

  // 检查是否所有字段都是*
  if (Object.values(isAny).every((val) => val)) {
    return tmpCorns.length >= 6 ? "每秒执行一次" : "每分钟执行一次";
  }

  // 解析年
  if (!isAny.year) {
    result.push(`${year}${CRON_TIME_CN[6]}`);
  }

  // 解析月
  if (!isAny.month) {
    if (month.includes("/")) {
      result.push(appendGapInfo(month, 12, 4));
    } else {
      result.push(
        `${isAny.year || year.length > 4 ? "每年" : ""}${unit_month.replaceAll(
          ",",
          "、"
        )}${CRON_TIME_CN[4]}`
      );
    }
  }
  // 解析周
  if (!isAny.week) {
    if (unit_week.includes(",")) {
      result.push(
        `每${CRON_TIME_CN[5]}的${unit_week
          .split(",")
          .map((w) => CRON_TIME_CN[5] + judgeWeek(w))
          .join("、")}`
      );
    } else if (unit_week.includes("L") && unit_week.length > 1) {
      const weekNum = unit_week.split("L")[0];
      const weekName = judgeWeek(weekNum);
      result.push(
        `${isAny.month || unit_month.match(/,|-|\//) ? "每月" : ""}最后一个${
          CRON_TIME_CN[5]
        }${weekName}`
      );
    } else if (unit_week.includes("-")) {
      const [start, end] = unit_week.split("-");
      const weekOne = judgeWeek(start);
      const weekTwo = judgeWeek(end);
      result.push(
        `每${CRON_TIME_CN[5]}的${CRON_TIME_CN[5] + weekOne}到${
          CRON_TIME_CN[5] + weekTwo
        }`
      );
    } else {
      let processedDay = unit_week === "L" ? "7" : unit_week;
      const weekName = judgeWeek(processedDay);
      result.push(`每${CRON_TIME_CN[5]}的${CRON_TIME_CN[5] + weekName}`);
    }
  }
  // 解析日
  if (!isAny.day) {
    const suffix = isAny.month || unit_month.match(/,|-|\//) ? "每月" : "";
    if (day.includes("/")) {
      result.push(suffix + appendGapInfo(day, 31, 3));
    } else if (day === "L") {
      result.push(`${suffix}的最后一天`);
    } else if (day.match(/W/i)) {
      const [num] = day.split("W");
      if (num === "L") {
        result.push(`${suffix}的最后一个工作日`);
      } else {
        result.push(`${suffix}${num + CRON_TIME_CN[3]}最近的工作日`);
      }
    } else if (day.includes("#")) {
      const [weekNum, weekOfMonth] = day.split("#");
      const weekName = judgeWeek(weekNum);
      result.push(`${suffix}第${weekOfMonth}个${CRON_TIME_CN[5]}${weekName}`);
    } else {
      result.push(`${suffix}${day}${CRON_TIME_CN[3]}`);
    }
  }
  // 解析时
  if (!isAny.hour) {
    const suffix = isAny.day || day.match(/,|-|\//) ? "每天" : "";
    if (hour.includes("/")) {
      result.push(suffix + appendGapInfo(hour, 24, 2));
    } else {
      result.push(`${suffix}${hour}${CRON_TIME_CN[2]}`);
    }
  }
  // 解析分
  if (!isAny.minute) {
    const suffix = isAny.hour || hour.match(/,|-|\//) ? "每小时" : "";
    if (minute.includes("/")) {
      result.push(suffix + appendGapInfo(minute, TIMESCALE, 1));
    } else if (minute.includes("-")) {
      const [start, end] = minute.split("-");
      result.push(
        `${suffix}${start}${CRON_TIME_CN[1]}到${end}${CRON_TIME_CN[1]}`
      );
    } else {
      result.push(`${suffix}${minute === "0" ? "" : minute + CRON_TIME_CN[1]}`);
    }
  }

  // 解析秒
  const suffix_second = isAny.minute || minute.match(/,|-/) ? "每分钟" : "";
  if (!isAny.second) {
    if (second.includes("/")) {
      result.push(suffix_second + appendGapInfo(second, TIMESCALE, 0));
    } else {
      result.push(
        `${suffix_second}${
          second !== "0"
            ? (isAny.minute ? "第" : " ") + second + CRON_TIME_CN[0]
            : ""
        }`
      );
    }
  } else if (second === "*") {
    result.push(`,每秒`);
  }

  return result.length > 0
    ? `${result.join("")}执行一次`
    : "表达式中文转换异常";
}

export default cronToChinese;
