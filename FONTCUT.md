### 前端字体动态加载方案

> 背景：字体加载时一个字体包可能就要近10M，很影响性能和体验，现在也有字蛛、fontmin等方案，体积可以缩小为几十KB，但是对动态文本可能就不太实用。

思路：总体思路是字体文件的分块和按需加载，将大体积的字体文件拆分成多个小文件，当页面中渲染到某个文字时检查`unicode`范围按需加载。

- [fonteditor-core](https://www.npmjs.com/package/fonteditor-core)进行拆分
  - 确认整个字体包的`unicode`范围，每种字体格式均拆分成多个文件（注意命名）
  - ```javascript
      // read font file
      const Font = require('fonteditor-core').Font;
      const fs = require('fs');

      let buffer = fs.readFileSync('font.ttf');
      // read font data
      let font = Font.create(buffer, {
        type: 'ttf', // support ttf, woff, woff2, eot, otf, svg
        subset: [65, 66], // only read `a`, `b` glyf 筛选列表（十进制数组 [65, 66]）
        hinting: true, // save font hinting
        compound2simple: true, // transform ttf compound glyf to simple
        inflate: null, // inflate function for woff
        combinePath: false, // for svg path
      });
      let fontObject = font.get();
      console.log(Object.keys(fontObject));
    ```
  - `fonteditor-core`中`subset`的范围为每个拆分文件的范围，所以`unicode`的范围需要自行分组（需要十进制）
- [CSS unicode-range特定字符使用font-face自定义字体](https://www.zhangxinxu.com/wordpress/2016/11/css-unicode-range-character-font-face/)
  张鑫旭老师这里可以看到`unicode-range`的解释和字符集的`unicode`范围，这里我们默认`0000`到`9FCB`，包含英文数字和符号
  - css属性`unicode-range`根据`unicode`范围按需加载
  - 根据文本分块，自动生成css文件，批量生成`font-face`

> TODO: 目前以实现为主，代码简陋些，文件读写的性能等还需优化
