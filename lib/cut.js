// read font file
const Font = require('fonteditor-core').Font;
const woff2 = require('fonteditor-core').woff2;
const fs = require('fs');

// const baseUnicodePre = 'U+'; // unicode前缀
const output = 'font-pieces'; // 输出目录

/**
 * 默认配置
 * @param startCHS 开始字符unicode编码
 * @param endCHS 结束字符unicode编码
 * @param pageSize 每个文件字符包含范围
 * @param baseFileName 拆分文件基础名
 * @param targetPath 目标字体包路径
 * @param targetType 目标字体包类型
 */
const defaultConfig = {
  startCHS: '0000',
  endCHS: '9FCB',
  pageSize: 5000,
  baseFileName: '', // HarmonyOS_Sans_SC_Black
  targetPath: '', // ./font/HarmonyOS_Sans_SC_Black.ttf
  targetType: 'ttf',
};

class FontCut {
  constructor(config) {
    this.config = {
      ...defaultConfig,
      ...config,
    };
  }
  /**
   * 初始化font
   */
  init() {
    if (!this.checkOutput(output)) return;
    console.log('字体文件拆分中...请勿中断操作...');
    this.currentCHS = this.config.startCHS;
    this.resolveComplate = false; // 是否结束切分
    this.fontCss = ''; // 批量生成font-face
    const { endCHS, pageSize, targetPath, targetType } = this.config;
    woff2
      .init()
      .then(() => {
        const buffer = fs.readFileSync(targetPath);
        let fontFileIdx = 1;
        while (!this.resolveComplate) {
          const subsetMap = this.addSubset(this.currentCHS, endCHS, pageSize);
          // read font data
          let font = Font.create(buffer, {
            type: targetType, // support ttf, woff, woff2, eot, otf, svg
            subset: subsetMap.subset, // 筛选列表（十进制数组 [65, 66]）
            hinting: true, // save font hinting
            compound2simple: true, // transform ttf compound glyf to simple
            inflate: null, // inflate function for woff
            combinePath: false, // for svg path
          });
          // let fontObject = font.get();
          const outPath = `./${output}/${this.config.baseFileName}_${fontFileIdx}_${subsetMap.startCHS}_${subsetMap.endCHS}`;
          this.addCss(outPath, subsetMap);
          this.writeFontFile(font, 'ttf', outPath);
          this.writeFontFile(font, 'woff', outPath);
          this.writeFontFile(font, 'woff2', outPath);
          console.log('完成文件 :>> ', outPath);
          fontFileIdx++;
        }
      })
      .then(() => {
        this.createFontCss();
        console.log('拆分完成！');
      });
  }
  /**
   * 检测输出目录
   * @param {String} output 输出目录
   */
  checkOutput(output) {
    if (existDir(output)) {
      console.log(`输出目录${output}已存在 `);
      return false;
    } else {
      fs.mkdirSync(output);
      return true;
    }
  }
  /**
   * 累加筛选字
   * @description 将16进制转为10进制，遍历累加出当前筛选列表
   * @param {String} startCHS 开始字符unicode编码
   * @param {String} endCHS 结束文件字符包含范围
   * @param {Number} pageSize 每个文件字符包含范围
   * @returns {Object} 筛选范围信息对象
   */
  addSubset(startCHS, endCHS, pageSize) {
    let subset = []; // 筛选列表
    for (let i = 0; i < pageSize; i++) {
      const startNum = parseInt(startCHS, 16) + i;
      if (startNum > parseInt(endCHS, 16)) {
        this.resolveComplate = true;
      } else {
        subset.push(startNum);
        this.currentCHS = startNum.toString(16);
      }
    }
    return {
      startCHS,
      endCHS: this.currentCHS,
      subset,
    };
  }
  /**
   * 写入字体文件
   * @param {Object} fontObj font对象
   * @param {String} type 输出字体类型
   * @param {String} outPath 输出字体文件完整路径
   * @returns {Buffer} buffer
   */
  writeFontFile(fontObj, type = 'ttf', outPath) {
    // write font file
    const buffer = fontObj.write({
      type: type, // support ttf, woff, woff2, eot, svg
      hinting: true, // save font hinting
      deflate: null, // deflate function for woff
      support: { head: {}, hhea: {} }, // for user to overwrite head.xMin, head.xMax, head.yMin, head.yMax, hhea etc.
    });
    fs.writeFileSync(`${outPath}.${type}`, buffer);
    return buffer;
  }
  /**
   * 累加css
   * @param {String} outPath 开始字符unicode编码
   * @param {Object}} subsetMap 当前筛选字体包含范围
   */
  addCss(outPath, subsetMap) {
    this.fontCss += `@font-face {
      font-family: '${this.config.baseFileName}';
      src: url('${outPath}.woff2') format('woff2'),
        url('${outPath}.woff') format('woff'),
        url('${outPath}.ttf') format('truetype');
      unicode-range: U+${subsetMap.startCHS}-${subsetMap.endCHS};
    }`;
  }
  /**
   * 批量写入css
   */
  createFontCss() {
    // 如果当前目录下没有这个写入内容的文件，那么系统会自动帮我们创建
    fs.writeFileSync(`./${output}/font.css`, this.fontCss, (err, writeOfContent) => {
      try {
        console.log(writeOfContent); // undefined
      } catch (e) {
        console.log('写入内容失败', e);
      }
    });
  }
}

function existDir(file) {
  try {
    return fs.statSync(file).isDirectory();
  } catch (e) {
    return false;
  }
}

module.exports = FontCut;
