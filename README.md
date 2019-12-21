## 矩阵2.0架子

## common

common为一个submodule

* behaviors 多个小程序共用的behaviors (可以覆盖到src的behaviors中)
* config 用于前端脚本的配置文件
* ~~json 小程序的配置项~~
* ~~pages 可复用的页面~~
* util 多个小程序用到的util方法 (可以覆盖到src的util中)



> **多个小程序用到的util方法要写好注释和使用**



* core:  所有小程序项目都可用，且跟业务无关，较底层一点的
* sdk：配合公司通用解决方案的客户端方法，如视频上传，abtest，统计
* util：辅助类方法，如日期转换，深拷贝，数组处理等
* globalFunc：跟项目全局数据相关的方法