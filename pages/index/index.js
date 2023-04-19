import config from '../../utils/config.js'
// 引入SDK核心类
var QQMapWX = require('../../sdk/qqmap-wx-jssdk.js');

// 实例化API核心类
var map = new QQMapWX({
  key: 'LODBZ-HJTKV-RGGPM-UUNIJ-WT4UJ-KNB3R' // 必填
});

//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogin: false,
    isLoad: false,
    isShow: false,
    hasMore: true,
    defLat: '24.442038',
    defLon: '118.068694',
    nowLat: '', //用户当前位置
    nowLon: '', //用户当前位置
    markers: [],
    venueList: [],
    distance: 0, //距离（KM）
    pageNum: 0, //当前页
    pageSize: 20, //显示几条
    totalPage: 0, //总页数
    viewPoint: [], //景点列表
    loginPrompt: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let postData = {
      businessId: app.globalData.businessId, 
      pageNum: this.data.pageNum,
      pageSize: this.data.pageSize
    };

    // app.dataPost({ url: 'rest/viewPoint/viewPointList', data: postData, success: this._load })
    app.dataPost({ url: 'rest/view/viewList', data: postData, success: this._loads })
  },

  loadLocation() {
    let _this = this;
    wx.getLocation({
      success: function (res) {
        console.log('当前位置:::', res);
        _this.setData({
          nowLat: res.latitude, //用户当前位置
          nowLon: res.longitude, //用户当前位置
        });

        console.log('nowLat:', _this.data.nowLat);
        console.log('nowLon:', _this.data.nowLon);

        let postData = {
          businessId: app.globalData.businessId,
          pageNum: _this.data.pageNum,
          pageSize: _this.data.pageSize
        };
        // console.log(postData);
        // app.dataPost({ url: 'rest/viewPoint/viewPointList', data: postData, success: _this.viewPointList })
        app.dataPost({ url: 'rest/view/viewList', data: postData, success: this.viewList })
      },
      fail: function (res) {
        let postData = {
          businessId: app.globalData.businessId,
          pageNum: _this.data.pageNum,
          pageSize: _this.data.pageSize
        };

        // app.dataPost({ url: 'rest/viewPoint/viewPointList', data: postData, success: _this.viewPointList })
        app.dataPost({ url: 'rest/view/viewList', data: postData, success: this.viewList })
      }
    });
  },

  distance: function (la1, lo1, la2, lo2) {
    var La1 = la1 * Math.PI / 180.0;
    var La2 = la2 * Math.PI / 180.0;
    var La3 = La1 - La2;
    var Lb3 = lo1 * Math.PI / 180.0 - lo2 * Math.PI / 180.0;
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(La3 / 2), 2) + Math.cos(La1) * Math.cos(La2) * Math.pow(Math.sin(Lb3 / 2), 2)));
    s = s * 6378.137;//地球半径
    s = Math.round(s * 10000) / 10000;

    return s
  },

  moveToLocation: function () {
    this.mapCtx.moveToLocation();
  },

  openShow() {
    this.setData({
      isShow: false,
    });
  },

  venueDetail(res) {
    console.log(res);
    this.setData({
      venueList: res.data,
    });
  },

  viewDetail(res) {
    console.log(res);
    this.setData({
      venueList: res.data,
    });
  },

  markertap(e) {
    console.log('点击地图点:::', e);
    let id = e.markerId;
    let ind = '';
    this.data.markers.forEach((item) => {
      if(item.id == id) {
        item.iconPath = '../../images/icons/td_d@3x.png';
        item.width = '42';
        item.height = '57';
        ind = item.ind;
      } else {
        item.iconPath = '../../images/icons/td@3x.png';
        item.width = '40.5';
        item.height = '45.7';
      };
    });
    this.setData({
      markers: this.data.markers,
      isShow: true,
      viewPoint: this.data.markers[ind],
      productId: id,
      defLat: this.data.markers[ind].lat,
      defLon: this.data.markers[ind].lon,
    });

    console.log('点::::', this.data.markers);

    this.setData({
      distance: this.distance(this.data.nowLat, this.data.nowLon, this.data.markers[ind].latitude, this.data.markers[ind].longitude).toFixed(2)
    });

    // app.dataGet({ url: 'rest/viewPoint/viewPointDetail?viewPointId=' + this.data.productId, success: this.venueDetail });
    app.dataGet({ url: 'rest/view/viewDetail?viewId=' + this.data.productId, success: this.viewDetail });
  },

  //地图移动加载更多
  scaleMap(e) { 
    let postData = {
      businessId: app.globalData.businessId,
      pageNum: this.data.pageNum,
      pageSize: this.data.pageSize
    };

    // app.dataPost({ url: 'rest/viewPoint/viewPointList', data: postData, success: this._load })
    app.dataPost({ url: 'rest/view/viewList', data: postData, success: this._loads })
  },

  enterDetail(e) {
    console.log(e);
    if(this.data.isLogin) {
      wx.navigateTo({
        url: '../pointDetail/pointDetail?id=' + e.currentTarget.dataset.id,
      });
    } else {
      let page = 'index';
      wx.navigateTo({
        url: '../login/login?page=' + page,
      });
    };
  },

  //查看是否授权
  checkGetSetting() {
    let _this = this;

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        app.dataGet({ url: 'rest/newMallFansUser?code=' + res.code + '&businessId=' + app.globalData.businessId, success: _this.getUser });
      }
    });
  },

  //获取用户信息
  getUser(res) {
    console.log(res);
    let _this = this;

    app.globalData.userId = res.userId;

    wx.getLocation({
      success: function (res) {
        console.log('当前位置:::', res);
        _this.setData({
          nowLat: res.latitude, //用户当前位置
          nowLon: res.longitude, //用户当前位置
        });

        console.log('nowLat:', _this.data.nowLat);
        console.log('nowLon:', _this.data.nowLon);

        let postData = {
          businessId: app.globalData.businessId,
          pageNum: _this.data.pageNum,
          pageSize: _this.data.pageSize
        };
        // console.log(postData);
        // app.dataPost({ url: 'rest/viewPoint/viewPointList', data: postData, success: _this.viewPointList })
        app.dataPost({ url: 'rest/view/viewList', data: postData, success: _this.viewList })
      },
      fail: function (res) {
        let postData = {
          businessId: app.globalData.businessId,
          pageNum: _this.data.pageNum,
          pageSize: _this.data.pageSize
        };

        app.dataPost({ url: 'rest/view/viewList', data: postData, success: _this.viewList })
      }
    });

    if (res.userInfo != '' && res.userInfo != undefined && res.userInfo.sex != '') {
      let obj = {
        userId: res.userId,
        nickName: res.userInfo.name,
        gender: res.userInfo.sex,
        avatarUrl: res.userInfo.avatarImageUrl,
        address: res.area,
        phone: res.phone,
      };

      app.globalData.userInfo = obj;

      this.setData({
        isLogin: true
      });

      //用户授权地理位置
      wx.getLocation({
        success: res => {
          // console.log(res);
          map.reverseGeocoder({
            location: {
              latitude: res.latitude,
              longitude: res.longitude
            },
            success: function (res) {
              console.log('地理位置');
              console.log(res);
              app.globalData.city = res.result.ad_info.city;
              let fansUserId = app.globalData.userId;
              let lon = res.result.ad_info.location.lng;
              let lat = res.result.ad_info.location.lat;
              let nation_code = res.result.ad_info.nation_code; //国际码
              let nation_code_len = res.result.ad_info.nation_code.length; //国际码编码长度
              let _city_code = res.result.ad_info.city_code.substring(0, nation_code_len);
              let city_code_ = '';

              //截取后半段区域码
              if (nation_code == _city_code) {
                city_code_ = res.result.ad_info.city_code.slice(nation_code_len);
              };

              // console.log(city_code_);
              console.log('获取地理位置：用户id');
              console.log(app.globalData.userId);

              //更新用户当前位置
              app.dataGet({ url: 'mobile/fansUser/updateFansUserLocation?fansUserId=' + fansUserId + '&lon=' + lon + '&lat=' + lat, success: _this.updateFansUserLocation });
            },
            fail: function (res) {
              // console.log(res);
            },
            complete: function (res) {
              // console.log(res);
            }
          });
        }
      });

    } else {
      console.log('登录提示:::', this.data.loginPrompt);
      this.setData({
        isLogin: false
      });
      // 查看是否授权
      wx.showModal({
        title: '登录提示',
        content: _this.data.loginPrompt,
        cancelText: '关闭',
        confirmText: '微信登录',
        cancelColor: '#666666',
        confirmColor: '#00CC9D',
        success: function (res) {
          if (res.confirm) {
            let page = 'index';
            wx.navigateTo({
              url: '../login/login?page=' + page,
            });
          } else if (res.cancel) {
            console.log('用户点击取消');
          }
        }
      });
    };
  },

  _load(res) {
    console.log(res);
    this.setData({
      loginPrompt: res.data.loginPrompt,
    });
    if (res.data.viewPointList != '') {
      let markers = this.data.markers;
      let pageNum = this.data.pageNum;
      let pageSize = this.data.pageSize;

      if (this.data.hasMore) {
        res.data.viewPointList.forEach((item, i) => {
          item.ind = i;
          item.name = '';
          item.latitude = item.lat;
          item.longitude = item.lon;
          item.iconPath = "../../images/icons/td@3x.png";
          item.width = 40.5;
          item.height = 45.7;
          markers.push(item);
        });
        console.log(markers);
      };

      if (pageNum + 1 < res.data.totalPage) {
        pageNum++;
        this.setData({ pageNum: pageNum });
      } else {
        this.setData({ hasMore: false });
      };
      console.log('移动点:::', markers);
      this.setData({
        pageNum: pageNum,
        markers: markers,
      });
    }
    //  else {
    //   console.log('无数据:::');
    //   if (this.data.nowLat == '' && this.data.nowLon == '') {
    //     console.log('nowLat:', this.data.nowLat);
    //     console.log('nowLon:', this.data.nowLon);
    //     this.setData({
    //       markers: [],
    //       defLat: '24.442038',
    //       defLon: '118.068694',
    //     });
    //   } else {
    //     this.setData({
    //       markers: [],
    //       defLat: this.data.nowLat,
    //       defLon: this.data.nowLon,
    //     });
    //   };
    // };
  },

  _loads(res) {
    //景区
    console.log('景区：：：：', res);
    this.setData({
      loginPrompt: res.data.loginPrompt,
    });
    if (res.data.viewList != '') {
      let markers = this.data.markers;
      let pageNum = this.data.pageNum;
      let pageSize = this.data.pageSize;

      if (this.data.hasMore) {
        res.data.viewList.forEach((item, i) => {
          item.ind = i;
          item.name = '';
          item.latitude = item.lat;
          item.longitude = item.lon;
          item.iconPath = "../../images/icons/td@3x.png";
          item.width = 40.5;
          item.height = 45.7;
          markers.push(item);
        });
        console.log(markers);
      };

      if (pageNum + 1 < res.data.totalPage) {
        pageNum++;
        this.setData({ pageNum: pageNum });
      } else {
        this.setData({ hasMore: false });
      };
      console.log('移动点:::', markers);
      this.setData({
        pageNum: pageNum,
        markers: markers,
      });
    }
  },

  viewPointList(res) {
    console.log('景点:::', res);
    this.setData({
      loginPrompt: res.data.loginPrompt,
    });

    if (res.data.viewPointList != '') {
      let markers = this.data.markers;
      let pageNum = this.data.pageNum;
      let pageSize = this.data.pageSize;

      if (this.data.hasMore) {
        res.data.viewPointList.forEach((item, i) => {
          item.ind = i;
          item.name = '';
          item.latitude = item.lat;
          item.longitude = item.lon;
          item.iconPath = "../../images/icons/td@3x.png";
          item.width = 40.5;
          item.height = 45.7;
          markers.push(item);
        });
        console.log(markers);
      };

      if (pageNum + 1 < res.data.totalPage) {
        pageNum++;
        this.setData({ pageNum: pageNum });
      } else {
        this.setData({ hasMore: false });
      };
      console.log(markers);
      this.setData({
        pageNum: pageNum,
        markers: markers,
        defLat: '24.442038',
        defLon: '118.068694',
      });
      console.log('当前pageNum:::', this.data.pageNum);
      console.log(this.data.markers);
    } else {
      console.log('无数据:::');
      if (this.data.nowLat == '' && this.data.nowLon == '') {
        console.log('nowLat:', this.data.nowLat);
        console.log('nowLon:', this.data.nowLon);
        this.setData({
          markers: [],
          defLat: '24.442038',
          defLon: '118.068694',
        });
      } else {
        this.setData({
          markers: [],
          defLat: this.data.nowLat,
          defLon: this.data.nowLon,
        });
      };
    };
  },

  viewList(res) {
    console.log('景点:::', res);
    this.setData({
      loginPrompt: res.data.loginPrompt,
    });

    if (res.data.viewList != '') {
      let markers = this.data.markers;
      let pageNum = this.data.pageNum;
      let pageSize = this.data.pageSize;

      if (this.data.hasMore) {
        res.data.viewList.forEach((item, i) => {
          item.ind = i;
          item.name = '';
          item.latitude = item.lat;
          item.longitude = item.lon;
          item.iconPath = "../../images/icons/td@3x.png";
          item.width = 40.5;
          item.height = 45.7;
          markers.push(item);
        });
        console.log(markers);
      };

      if (pageNum + 1 < res.data.totalPage) {
        pageNum++;
        this.setData({ pageNum: pageNum });
      } else {
        this.setData({ hasMore: false });
      };
      console.log(markers);
      this.setData({
        pageNum: pageNum,
        markers: markers,
        defLat: '24.442038',
        defLon: '118.068694',
      });
      console.log('当前pageNum:::', this.data.pageNum);
      console.log(this.data.markers);
    } else {
      console.log('无数据:::');
      if (this.data.nowLat == '' && this.data.nowLon == '') {
        console.log('nowLat:', this.data.nowLat);
        console.log('nowLon:', this.data.nowLon);
        this.setData({
          markers: [],
          defLat: '24.442038',
          defLon: '118.068694',
        });
      } else {
        this.setData({
          markers: [],
          defLat: this.data.nowLat,
          defLon: this.data.nowLon,
        });
      };
    };
  },

  /**
   * 动态设置title
   */
  setTitleText(word) {
    wx.setNavigationBarTitle({
      title: word
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setTitleText(app.globalData.appName);
    this.mapCtx = wx.createMapContext('map');
    this.setData({
      defLat: '24.442038',
      defLon: '118.068694',
    });
    this.checkGetSetting();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  //分享链接
  onShareAppMessage(res) {
    let nickName = app.globalData.appName || '悠易游';
    let url = '';
    if (app.globalData.userInfo) {
      nickName = app.globalData.userInfo.nickName
    };

    let userId = app.globalData.userId;

    return {
      title: nickName + '向您推荐一个值得信赖的旅游平台！',
      path: '/pages/index/index',
      imageUrl: '../../images/sample/share.png'
    }
  },
})