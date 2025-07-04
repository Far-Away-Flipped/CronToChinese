# cron-to-chinese

将cron表达式转换为中文描述的JavaScript库

## 安装

```bash
npm install cron-to-chinese
```

## 使用

```javascript
const cronToChinese = require('cron-to-chinese');

console.log(cronToChinese('* * * * *')); // 每分钟每小时
console.log(cronToChinese('*/5 * * * *')); // 每5分钟每小时
console.log(cronToChinese('0 8 * * *')); // 在0分在8点
console.log(cronToChinese('0 8-18 * * *')); // 在0分从8点到18点
```

## 功能

- 支持基本的cron表达式解析
- 将表达式转换为自然的中文描述
- 支持星号(*)、范围(-)、步长(/)、列表(,)等语法

## 贡献

欢迎提交PR或issue来改进这个项目。