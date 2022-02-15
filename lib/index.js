const fs = require('fs');
const inquirer = require('inquirer');
const FontCut = require('./cut');
const cli = {};

function noop() {}

cli.run = () => {
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'targetPath',
        message:
          '请输入拆分目标字体包路径：绝对/相对路径，支持 ttf, woff, woff2, eot, otf, svg 格式（targetPath）：',
        default: './font/HarmonyOS_Sans_SC_Black.ttf',
        validate: function (answer) {
          const targetFile = answer.split('/').pop();
          if (
            !targetFile ||
            typeof targetFile !== 'string' ||
            targetFile.indexOf('.') <= -1
          )
            return '请输入正确路径';
          if (!fs.existsSync(answer)) return '找不到文件';
          return true;
        },
      },
      {
        type: 'input',
        name: 'startCHS',
        message: '请输入开始字符unicode编码，省略前缀U+（startCHS）：',
        default: '0000',
      },
      {
        type: 'input',
        name: 'endCHS',
        message: '请输入开始字符unicode编码（endCHS）：',
        default: '9FCB',
      },
      {
        type: 'number',
        name: 'pageSize',
        message: '请输入每个文件字符包含范围（pageSize）：',
        default: 5000,
      },
    ])
    .then(answers => {
      // console.log(JSON.stringify(answers, null, '  '));
      const targetFile = answers.targetPath.split('/').pop();
      const targetFileName = targetFile.split('.')[0];
      const targetFileType = targetFile.split('.')[1];
      const fontcut = new FontCut({
        ...answers,
        baseFileName: targetFileName,
        targetType: targetFileType,
      });
      fontcut.init();
    })
    .catch(error => {
      console.log(error);
    });
};

module.exports = cli;
