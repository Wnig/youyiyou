// components/adImage.js
import config from '../../utils/config.js'

Component({
  data: {
    // tabBar: [
    //   {
    //     "current": 0,
    //     "pagePath": "../../pages/circum/circum",
    //     "text": "周边",
    //     "iconPath": "../../images/tabBar/zb@3x.png",
    //     "selectedIconPath": "../../images/tabBar/zb_xz@3x.png"
    //   },
    //   {
    //     "current": 0,
    //     "pagePath": "../../pages/index/index",
    //     "text": "线路",
    //     "iconPath": "../../images/tabBar/xl@3x.png",
    //     "selectedIconPath": "../../images/tabBar/xl_xz@3x.png"
    //   },
    //   {
    //     "current": 0,
    //     "pagePath": "../../pages/exhibition/exhibition",
    //     "text": "会展",
    //     "iconPath": "../../images/tabBar/hz@3x.png",
    //     "selectedIconPath": "../../images/tabBar/hz_xz@3x.png"
    //   },
    //   {
    //     "current": 0,
    //     "pagePath": "../../pages/my/my",
    //     "text": "我的",
    //     "iconPath": "../../images/tabBar/wd@3x.png",
    //     "selectedIconPath": "../../images/tabBar/wd_xz@3x.png"
    //   },
    // ]
  },
  methods: {
    onLoad: function () {
      this.tabbarmain("tabBar", 1, this);
    },
    tabbarmain(bindName = "tabdata", id, target) {
      var that = target;
      var bindData = {};
      var otabbar = this.data.tabBar;
      otabbar[id]['iconPath'] = otabbar[id]['selectedIconPath']; //换当前的icon
      otabbar[id]['current'] = 1;
      bindData[bindName] = otabbar;
      that.setData({ bindData });
    }
  },
});
