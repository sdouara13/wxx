# 微信js-sdk辅助开发工具

> 可以使用真机调试的微信网页开发

## 安装：

``` bash
# 安装依赖
npm install wxx --save
需要引入微信jssdk

```

## 使用：

```bash
# 引入
import { wxx } from 'wxx'

# 配置
wxx.config({
   debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
   appId: "wx847ad179e85ad077", // 必填，绑定的测试公众号id
   timestamp: Date.now() / 1000 >> 0, // 必填，生成签名的时间戳
   nonceStr: "", // 必填，生成签名的随机串
   jsApiList: ["onMenuShareTimeline", "onMenuShareAppMessage", "onMenuShareQQ", "onMenuShareWeibo", "onMenuShareQZone", "startRecord", "stopRecord", "onVoiceRecordEnd", "playVoice", "pauseVoice", "stopVoice", "onVoicePlayEnd", "uploadVoice", "downloadVoice", "chooseImage", "previewImage", "uploadImage", "downloadImage", "translateVoice", "getNetworkType", "openLocation", "getLocation", "hideOptionMenu", "showOptionMenu", "hideMenuItems", "showMenuItems", "hideAllNonBaseMenuItem", "showAllNonBaseMenuItem", "closeWindow", "scanQRCode", "chooseWXPay", "openProductSpecificView", "addCard", "chooseCard", "openCard", "updateAppMessageShareData", "updateTimelineShareData"],
    // 必填，需要使用的JS接口列表，按需选择
   onReady: () => {
     this.qrcodeUrl = wxx.qrcodeUrl // 真机网页链接
   },
   onError: (err) => {
     
   },
   onUserInfo: (userInfo) => {
    // 用户授权信息
    console.log("用户信息", userInfo);
   }
 })
 
# 功能
  调起微信扫一扫
  wxx.scanQRCode({
          needResult: 1, // 默认为0，扫描结果由微信处理，不返回扫描结果，1则直接返回扫描结果，
          scanType: ["qrCode","barCode"], // 可以指定扫二维码还是一维码，默认二者都有
        })
          .then((res) => {
            // needResult === 1 起效
            console.log("扫一扫", res.data);
          });
          
  ![Image text](https://raw.github.com/yourName/repositpry/master/yourprojectName/img-folder/test.jpg)
```
