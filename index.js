import axios from 'axios'
import qs from 'qs'

let api
let prefix = "" // mock

if (process.env.NODE_ENV === "development") {
  prefix = "/api"
  api = {
    getToken: `${prefix}/getwxtoken`,
    getUserAuth: `${prefix}/getuserauth`,
    deviceID: `${prefix}/getdeviceid`,
    scanQRCode: `${prefix}/scanqrcode`,
    userinfo: `${prefix}/getuserinfo`,
  }
} else if (process.env.NODE_ENV === "production") {
  prefix = ""
  api = {
    getToken: `${prefix}/getwxtoken`,
    getUserAuth: `${prefix}/getuserauth`,
    deviceID: `${prefix}/getdeviceid`,
    scanQRCode: `${prefix}/scanqrcode`,
    userinfo: `${prefix}/getuserinfo`,
  }
}

const API = api

class WXX {
  constructor() {
    this.id = "";
    this.qrcodeUrl = "";
    this.cbList = [];
    this.userInfo = null;
    this.isWX = this.judgeWX();
    this.http = new HttpService();
  }
  config(config) {
    this.onReady = config.onReady;
    this.onError = config.onError;
    this.onUserInfo = config.onUserInfo;
    if (this.isWX) {
      this.getDeviceId()
        .then(({ data }) => {
          this.id = data;
          console.log("获取id", data);
          if (window.localStorage && window.localStorage.getItem('wxxdeviceid' !== this.id)) {
            window.localStorage.setItem('wxxdeviceid', this.id);
          }

          this.qrcodeUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${config.appId}&redirect_uri=${window.location.href.replace(/#.*/, '')}&response_type=code&scope=snsapi_userinfo&state=rand#wechat_redirect`
          return this.http.get(API.getUserAuth, {
            code: this.getParam('code'),
            grant_type: 'authorization_code',
            deviceid: this.id
          })
        })
        .then(res => {
          console.log('用户授权返回', res);
          this.userInfo = res.data;
          this.onUserInfo(this.userInfo)
        });


      this.http.get(API.getToken, {
        timestamp: config.timestamp,
        nonceStr: config.nonceStr,
        url: window.location.href.replace(/#.*/, '')
      })
        .then((res) => {
          config.signature = res.data; // 必填，签名
          // console.log("获取签名", config);

          if (res.data) {
            wx.config(config);
            wx.ready(() => {
              this.onReady();
              console.log("wx sdk 接入成功")
            })
            wx.error(function(res){
              console.error(res);
              this.onError(res);
              // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
              // setTimeout(() => {
              // self.Init();
              // }, 3000)
            });
          } else {
            console.error("获取签名失败")
          }

        });
    } else {
      this.getDeviceId()
        .then(({ data }) => {
          console.log("获取id", data);
          this.id = data;
          if (window.localStorage && window.localStorage.getItem('wxxdeviceid' !== this.id)) {
            window.localStorage.setItem('wxxdeviceid', this.id);
          }
          // this.qrcodeUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${config.appId}&redirect_uri=http://www.wxapidev.cn/wxsimulator/?deviceid=${this.id}&response_type=code&scope=snsapi_userinfo&state=rand#wechat_redirect`

          this.qrcodeUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${config.appId}&redirect_uri=http://www.wxapidev.cn/wxsimulator/?deviceid=${this.id}&response_type=code&scope=snsapi_userinfo&state=rand#wechat_redirect`
          this.getUserInfo();
          // this.ready();
          this.onReady();
        });
    }
  }
  // ready(cb) {
  //
  // }
  getUserInfo() {
    // warn: 只用于开发环境
    this.http.get(API.userinfo, { deviceid: this.id })
      .then(res => {
        if (res.data) {
          // console.log('用户信息', res);
          this.userInfo = res.data;
          this.onUserInfo(this.userInfo)
        } else {
          setTimeout(() => {
            this.getUserInfo();
          }, 3000)
        }
      })
  }
  getParam(name) {
    let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$|\\#)', 'i')
    let r = window.location.search.substr(1).match(reg)
    if (r !== null) {
      return decodeURIComponent(r[2])
    }
    return null
  }
  getDeviceId() {
    if (window.localStorage && window.localStorage.getItem('wxxdeviceid')) {
      return new Promise((resolve) => {
        resolve({
          data: window.localStorage.getItem('wxxdeviceid')
        });
      });

    } else {
      return this.http.get(API.deviceID)
    }
  }
  updateAppMessageShareData(config) {
    if (this.isWX) {
      return new Promise(resolve => {
        config.success = function () {
          resolve("分享设置成功")
        }
        wx.updateAppMessageShareData(config);
      })
    } else {
      // TODO: 通知模拟器进行分享设置
    }
  }
  updateTimelineShareData(config) {
    if (this.isWX) {
      return new Promise(resolve => {
        config.success = function () {
          resolve("分享朋友圈设置成功")
        }
        wx.updateTimelineShareData(config);
      })
    } else {
      // TODO: 通知模拟器进行分享设置
    }
  }
  onMenuShareWeibo(config) {
    if (this.isWX) {
      return new Promise(resolve => {
        config.success = function () {
          resolve("分享微博设置成功")
        }
        wx.onMenuShareWeibo(config);
      })
    } else {
      // TODO: 通知模拟器进行分享设置
    }
  }
  onMenuShareQZone(config) {
    if (this.isWX) {
      return new Promise(resolve => {
        config.success = function () {
          resolve("分享QQ空间设置成功")
        }
        wx.onMenuShareQZone(config);
      })
    } else {
      // TODO: 通知模拟器进行分享设置
    }
  }
  chooseImage(config) {
    if (this.isWX) {
      return new Promise(resolve => {
        config.success = function (res) {
          // var localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
          resolve(res)
        }
        wx.chooseImage(config);
      })
    } else {
      // TODO: 通知模拟器进行图片选择
    }
  }
  previewImage(config) {
    if (this.isWX) {
      wx.previewImage(config);
    } else {
      // TODO: 通知模拟器进行图片预览
    }
  }
  uploadImage(config) {
    if (this.isWX) {
      return new Promise(resolve => {
        config.success = function (res) {
          // var serverId = res.serverId; // 返回图片的服务器端ID
          resolve(res)
        }
        wx.uploadImage(config);
      })
    } else {
      // TODO: 通知模拟器进行图片上传
    }
  }
  downloadImage(config) {
    if (this.isWX) {
      return new Promise(resolve => {
        config.success = function (res) {
          // var localId = res.localId; // 返回图片下载后的本地ID
          resolve(res)
        }
        wx.downloadImage(config);
      })
    } else {
      // TODO: 通知模拟器进行图片下载
    }
  }
  getLocalImgData(config) {
    if (this.isWX) {
      return new Promise(resolve => {
        config.success = function (res) {
          // var localData = res.localData; // localData是图片的base64数据，可以用img标签显示
          resolve(res)
        }
        wx.getLocalImgData(config);
      })
    } else {
      // TODO: 通知模拟器进行获取本地图片
    }
  }
  scanQRCode(config) {
    if (this.isWX) {
      return new Promise((resolve) => {
        config.success = function (res) {
          let result = res.resultStr; // 当needResult 为 1 时，扫码返回的结果
          console.log('扫一扫返回', result);
          resolve({
            data: result
          });
        };
        wx.scanQRCode(config);
      });

    } else {
      return this.http.get(API.scanQRCode, {
        deviceid: this.id,
        seqno: Date.now() / 1000 >> 0
      })
    }
  }
  judgeWX() {
    let isMicromessenger = navigator.userAgent.toLowerCase().match(/MicroMessenger/i);
    if (isMicromessenger && isMicromessenger.length > 0) {
      return isMicromessenger[0] === "micromessenger";
    } else {
      return false
    }
  }
}

class HttpService {
  constructor () {
    this.$http = axios
  }
  /**
   * @method
   * @description Send a get request
   * @param { String } api
   * @param { Object } params - Url params
   * @example (new HttpService()).get("http://www.example.com", { name: "Daibin Li", age: 25 })
   * @returns { Promise } Returns the promise handler of get request
   * */
  get (api, params) {
    console.log('发送get请求', api, params)
    if (api) {
      return this.$http.get(`${api}?${qs.stringify(params)}`, params
        // {
        //   timeout: 3 * 1000
        // }
      )
    } else {
      throw new Error(`请求url无效 ${api}`)
    }
  }

  post (header, api, params) {
    let http = this.$http
    if (!header) {
      header = {
        "Content-type": "application/json"
      }
    }
    http = this.$http.create({
      headers: header
    })
    console.log('发送post请求', header, api, params)
    if (api) {
      return http.post(api, params
        // {
        //   timeout: 3 * 1000
        // }
      )
    } else {
      throw new Error(`请求url无效 ${api}`)
    }
  }
  put (api, params) {
    console.log('发送put请求', api, params)
    if (api) {
      return this.$http.put(api, params)
    } else {
      throw new Error(`请求url无效 ${api}`)
    }
  }

  delete (api, params) {
    return this.$http.delete(api, params)
  }
}

export const wxx = new WXX();
