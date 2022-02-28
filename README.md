### fontcut 拆分字体包提供前端字体动态加载

### 支持
输入类型支持：ttf, woff, woff2, eot, otf, svg

输出类型：ttf、woff、woff2

### 安装

```
npm i fontcut -g
```
### 使用

```
# fontcut

? 请输入拆分目标字体包路径：绝对/相对路径，支持 ttf, woff, woff2, eot, otf, svg 格式（targetPath）： 
./font/HarmonyOS_Sans_SC_Black.ttf

? 请输入开始字符unicode编码，省略前缀U+（startCHS）： 0000

? 请输入开始字符unicode编码（endCHS）： 9FCB

? 请输入每个文件字符包含范围（pageSize）： 5000
```

会在当前目录下创建`font-pieces`目录，并放入拆分好的碎片字体文件和引用css文件
