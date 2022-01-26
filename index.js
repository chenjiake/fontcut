// read font file
const Font = require('fonteditor-core').Font;
const woff2 = require('fonteditor-core').woff2;
const fs = require('fs');

// const baseUnicodePre = 'U+'; // unicode前缀
const startCHS = '0000'; // 开始字
const endCHS = '9FCB'; // 结束字
const pageSize = 5000; // 页长
let currentCHS = startCHS; // 当前字
let ISEND = false; // 是否结束切分

/**
 * 累加筛选字
 */
function addSubset(startCHS) {
  let subset = []; // 筛选列表
  for (let i = 0; i < pageSize; i++) {
    const startNum = parseInt(startCHS, 16);
    if (startNum + i > parseInt(endCHS, 16)) {
      ISEND = true;
    } else {
      subset.push(startNum + i);
      currentCHS = (startNum + i).toString(16);
    }
  }
  return {
    startCHS,
    endCHS: currentCHS,
    subset,
  };
}

function writeFontFile(fontObj, subsetMap, type = 'ttf', fontFileIdx) {
  // write font file
  const buffer = fontObj.write({
    type: type, // support ttf, woff, woff2, eot, svg
    hinting: true, // save font hinting
    deflate: null, // deflate function for woff
    support: { head: {}, hhea: {} }, // for user to overwrite head.xMin, head.xMax, head.yMin, head.yMax, hhea etc.
  });
  fs.writeFileSync(
    `./result/HarmonyOS_Sans_SC_Black_${fontFileIdx}_${subsetMap.startCHS}_${subsetMap.endCHS}.${type}`,
    buffer,
  );

  return buffer;
}

woff2.init().then(() => {
  let fontFileIdx = 1;
  while (!ISEND) {
    const subsetMap = addSubset(currentCHS);
    let buffer = fs.readFileSync('./font/HarmonyOS_Sans_SC_Black.ttf');
    // read font data
    let font = Font.create(buffer, {
      type: 'ttf', // support ttf, woff, woff2, eot, otf, svg
      subset: subsetMap.subset || [0, 32, 33, 34, 65, 66], // only read `a`, `b` glyf
      hinting: true, // save font hinting
      compound2simple: true, // transform ttf compound glyf to simple
      inflate: null, // inflate function for woff
      combinePath: false, // for svg path
    });
    let fontObject = font.get();

    writeFontFile(font, subsetMap, 'ttf', fontFileIdx);
    writeFontFile(font, subsetMap, 'woff', fontFileIdx);
    writeFontFile(font, subsetMap, 'woff2', fontFileIdx);
    fontFileIdx++;
  }
});
