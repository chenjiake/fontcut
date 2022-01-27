// read font file
const Font = require('fonteditor-core').Font;
const woff2 = require('fonteditor-core').woff2;
const fs = require('fs');

// const baseUnicodePre = 'U+'; // unicode前缀
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
  baseFileName: 'HarmonyOS_Sans_SC_Black',
  targetPath: './font/HarmonyOS_Sans_SC_Black.ttf',
  targetType: 'ttf',
};

class FontResolve {
  constructor(config) {
    this.config = {
      ...defaultConfig,
      ...config,
    };
    this.currentCHS = this.config.startCHS;
    this.resolveComplate = false; // 是否结束切分
  }
  /**
   * 初始化font
   */
  initFont() {
    const { endCHS, pageSize, targetPath, targetType } = this.config;
    woff2.init().then(() => {
      const buffer = fs.readFileSync(targetPath);
      let fontFileIdx = 1;
      while (!this.resolveComplate) {
        const subsetMap = this.addSubset(this.currentCHS, endCHS, pageSize);
        // read font data
        let font = Font.create(buffer, {
          type: targetType, // support ttf, woff, woff2, eot, otf, svg
          subset: subsetMap.subset, // 十进制数组 [65, 66]
          hinting: true, // save font hinting
          compound2simple: true, // transform ttf compound glyf to simple
          inflate: null, // inflate function for woff
          combinePath: false, // for svg path
        });
        // let fontObject = font.get();

        this.writeFontFile(font, subsetMap, 'ttf', fontFileIdx);
        this.writeFontFile(font, subsetMap, 'woff', fontFileIdx);
        this.writeFontFile(font, subsetMap, 'woff2', fontFileIdx);
        fontFileIdx++;
      }
    });
  }
  /**
   * 累加筛选字
   */
  addSubset(startCHS, endCHS, pageSize) {
    let subset = []; // 筛选列表
    for (let i = 0; i < pageSize; i++) {
      const startNum = parseInt(startCHS, 16);
      if (startNum + i > parseInt(endCHS, 16)) {
        this.resolveComplate = true;
      } else {
        subset.push(startNum + i);
        this.currentCHS = (startNum + i).toString(16);
      }
    }
    return {
      startCHS,
      endCHS: this.currentCHS,
      subset,
    };
  }
  writeFontFile(fontObj, subsetMap, type = 'ttf', fontFileIdx) {
    // write font file
    const buffer = fontObj.write({
      type: type, // support ttf, woff, woff2, eot, svg
      hinting: true, // save font hinting
      deflate: null, // deflate function for woff
      support: { head: {}, hhea: {} }, // for user to overwrite head.xMin, head.xMax, head.yMin, head.yMax, hhea etc.
    });
    fs.writeFileSync(
      `./result/${this.config.baseFileName}_${fontFileIdx}_${subsetMap.startCHS}_${subsetMap.endCHS}.${type}`,
      buffer,
    );
    return buffer;
  }
}

const ff = new FontResolve();
ff.initFont();
console.log('拆分导出完成！');
