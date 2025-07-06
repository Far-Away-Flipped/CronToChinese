# cron-to-chinese

将cron表达式转换为中文描述的JavaScript库

## 安装

```bash
npm install cron-to-chinese
```

## 使用

```javascript
import cronToChinese from 'cron-to-chinese';

console.log(cronToChinese('* * * * *')); // 每分钟执行一次
console.log(cronToChinese('0 15 10 * * ? 2005')); // 2005年每天10点15分执行一次
console.log(cronToChinese('0 15 10 ? * ? 2002-2005')); // 2002-2005年每天10点15分执行一次
console.log(cronToChinese('0 15 10 ? * 2-6')); // 每周的周一到周五每天10点15分执行一次
console.log(cronToChinese('* * * * Apr,JUN 5L 2012-2014')); // 2012-2014年每年4、6月每月最后一个周四,每秒执行一次
console.log(cronToChinese('8/10 0/5 3/4 * * ?')); // 每天从3点开始到23点范围内,每隔4小时每小时从0分开始到55分范围内,每隔5分钟从8秒开始到58秒范围内,每隔10秒执行一次
```

## 功能

- 支持基本的cron表达式解析
- 将表达式转换为自然的中文描述
- 支持星号(*)、范围(-)、步长(/)、列表(,)等语法

## 贡献

欢迎提交PR或issue来改进这个项目。