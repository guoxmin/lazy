/*! lazy http://zzsvn.pcauto.com.cn/svn/doc/javascript/%cd%bc%c6%ac%b0%b4%d0%e8%bc%d3%d4%d8/lazy.js */

/*
@author chenjiaming

1¡¢¸ü¸ÄthisÖ¸Õë£¬Ö¸Ïòµ±Ç°DOM½Úµã
2¡¢js°´ÐèÖ´ÐÐ£¬Ö§³ÖFunctionÀàÐÍ¡£
update by guoxuemin 2014-05-19

1¡¢¸Ä½ølazyId½Ó¿Ú£¬Ö§³ÖÊý×é¸ñÊ½¡£ÈçlazyId:["id1","id2"]
update by guoxuemin 2014-06-23

Ö÷ÒªÓÃÓÚ´¦ÀíÍ¼Æ¬°´Ðè¼ÓÔØ£¬Ò²¿É×öµ½¹ö¶¯µ½Ä³Ò»ÔªËØºóÔËÐÐÖ¸¶¨js

ÓÃ·¨:

Lazy.create({
    lazyId: 'outer_element_id',
    trueSrc: 'the_real_src_attribute_name'
});

Èç£º

var jsList_ = [
{id:"test1",js:function(){alert("test1")}},
{id:"test2",js:"alert('test2')"}
];

var xx = Lazy.create({
    lazyId:"Jbody",
    jsList:jsList_,
    trueSrc:'#src'
});
Lazy.init(xx);


documentations:

Lazy.create(options);

options
    lazyId: {String||Array} °üº¬ÐèÒª°´Ðè¼ÓÔØÍ¼Æ¬µÄÔªËØµÄ id
    trueSrc: {String} °üº¬Í¼Æ¬ÕæÊµµØÖ·µÄÊôÐÔ£¬Èç src2 »ò #src µÈ
    delay: {Number} ¹ö¶¯´¥·¢¼ÓÔØÇ°µÄÑÓÊ±£¬ÓÃÓÚ¹ö¶¯½ÚÁ÷£¬Ä¬ÈÏÖµÊÇ 100£¬µ¥Î»ºÁÃë
    delay_ot: {Number} ¹ö¶¯¹ý³ÌÖÐ¶à³¤Ê±¼äºóÇ¿ÐÐ´¥·¢Ò»´Î£¬Ä¬ÈÏÖµÊÇ 1000£¬µ¥Î»ºÁÃë
    preOffset: {Number} ÉÏÒ»ÆÁµÄÉ¨Ãè¸ß¶È£¬Ä¬ÈÏÊÇµ±Ç°´°¿Ú¸ß¶È
    offset: {Number} ÏÂÒ»ÆÁµÄÉ¨Ãè¸ß¶È£¬Ä¬ÈÏÊÇµ±Ç°´°¿Ú¸ß¶È
    unNeedListen: {Boolean} ÊÇ·ñ¼àÌý¹ö¶¯ÊÂ¼þ£¬Îª true Ê±Á¢¿ÌÓÃ img trueSrc µÄÖµÌæ»» src µÄÖµÀ´¼ÓÔØÍ¼Æ¬£¬·ñÔò¹ö¶¯¼ÓÔØ¡£Ã»ÓÐÄ¬ÈÏÖµ
    jsList: {Array} ¹ö¶¯°´ÐèµÄ js ÁÐ±í
        jsListItem: {Object} jsList ÀïµÄÏî£¬{id: 'domId', js: String|Function}£¬Èç {id: 'jsTest_2', js: 'alert("2")'}»ò{id: 'jsTest_2', js: function(){alert("2")}}

*/
var Lazy = {
    eCatch: {},
    eHandle: 0,
    isFunction: function( obj ) {
        return Object.prototype.toString.call(obj) === "[object Function]";
    },
    addEvent: function(o, e, func) {
        if (o.addEventListener) {
            o.addEventListener(e, func, false);
        } else {
            o.attachEvent("on" + e, func);
        }
        this.eCatch[++this.eHandle] = {
            "handler": func
        };
        return this.eHandle;
    },
    removeEvent: function(o, e, func) {
        if (o.addEventListener) {
            o.removeEventListener(e, this.eCatch[func].handler, false);
        } else {
            o.detachEvent("on" + e, this.eCatch[func].handler);
        }
    },
    $$: function(id) {
        return (typeof(id) == 'object') ? id : document.getElementById(id);
    },
    converNodeToArray:function(nodes){
        var array = [];
        try{
            array = Array.prototype.slice.call(nodes,0);
        }catch(e){
            /*ie6-8*/
            for(var i=0,len=nodes.length;i<len;i++){
                array.push(nodes[i]);
            }
        }
        return array;
    },
    each:function(o,fn){
        for(var i=0,len = o.length;i<len;i++){
            fn.call(o[i],i,o[i]);
        }
    },
    create: function(o) {
        var that = this;
        o.loading = false;
        o.timmer = undefined;
        o.time_act = 0;
        o.delay = o.delay || 100;
        o.delay_tot = o.delay_tot || 1000;
        o.imgList = [];
        var lazyId = o.lazyId, imgList = [];
        lazyId = (typeof lazyId)=="string" ? [].concat(lazyId):lazyId;
        that.each(lazyId,function(i,v){
            var lid = document.getElementById(v);
            if(!lid) return;
            var imgs;
            if (document.querySelectorAll) {
                imgs = document.querySelectorAll('#' + v + ' img');
            } else {
                imgs = lid.getElementsByTagName("img");
            }
            imgList = imgList.concat(imgs&&that.converNodeToArray(imgs));
        });

        that.each(imgList,function(i,v){
            if (v.getAttribute(o.trueSrc)) {
                o.imgList.push(v);
            }
        });
        o.imgCount = o.imgList.length;
        if (o.jsList) {
            o.jsCount = o.jsList.length;
            for (var i = 0; i < o.jsCount; i++) {
                o.jsList[i].oDom = (typeof(o.jsList[i].id) == 'object') ? o.jsList[i].id : document.getElementById(o.jsList[i].id);
            }
        } else {
            o.jsList = [];
            o.jsCount = 0;
        }
        
        this.init(o);
        
        return o;
    },
    checkPhone: function(ua) {
        if (ua.indexOf("android") > -1 || ua.indexOf("iphone") > -1 || ua.indexOf("ipod") > -1 || ua.indexOf("ipad") > -1) {
            this.isPhone = true;
        } else {
            this.isPhone = false;
        }
    },
    checkLazyLoad: function(ua) {
        if (ua.indexOf("opera mini") > -1) {
            return false;
        } else {
            return true;
        }
    },
    init: function(o) {
        if (o.unNeedListen) {
            this.loadOnce(o);
            return;
        }
        if (o.imgCount == 0 && o.jsCount == 0) return;
        var ua = navigator.userAgent.toLowerCase();
        if (this.checkLazyLoad(ua)) {
            this.checkPhone(ua);
            o.e1 = this.addEvent(window, "scroll", this.load(o));
            o.e2 = this.addEvent(window, "touchmove", this.load(o));
            o.e3 = this.addEvent(window, "touchend", this.load(o));
            this.loadTime(o);
        } else {
            this.loadOnce(o);
        }
    },
    getYGetBound: function(o, sH) {
        var y = o.getBoundingClientRect().top || 0;
        return y == 0 ? null : (y + sH);
    },
    getYOffSet: function(o) {
        var y = 0;
        while (o.offsetParent) {
            y += o.offsetTop;
            o = o.offsetParent;
        }
        return y == 0 ? null : y;
    },
    getHideY: function(o, fn, sH) {
        // 140422fixed: if argument [fn]'s return value is zero,it would throw error 'undefined is not a function'
        // coz document has no property 'getBoundingClientRect'
        while (o && o !== document) {
            var y = fn(o, sH);
            if (y != null) return y;
            o = o.parentNode;
        }
        return 0;
    },
    getY: function(o, wT) {
        var oTop;
        if (o.getBoundingClientRect) {
            oTop = this.getHideY(o, this.getYGetBound, wT);
        } else {
            oTop = this.getHideY(o, this.getYOffSet);
        }
        return oTop;
    },
    load: function(o) {
        return function() {
            if (o.loading == true) return;
            o.loading = true;
            if (o.time_act && ((1 * new Date() - o.time_act) > o.delay_tot)) {
                o.timmer && clearTimeout(o.timmer);
                Lazy.loadTime(o);
            } else {
                o.timmer && clearTimeout(o.timmer);
                o.timmer = setTimeout(function() {
                    Lazy.loadTime(o);
                }, o.delay);
            }
            o.loading = false;
        };
    },
    setSrc: function(o, l) {
        o.setAttribute("src", o.getAttribute(l));
        o.removeAttribute(l);
    },
    setJs: function(js) {
        Lazy.isFunction(js) ? js.call(this):eval(js);
    },
    loadTime: function(o) {
        o.time_act = 1 * new Date();
        var winH, winTop, winTot;
        if (this.isPhone) {
            winH = window.screen.height;
            winTop = window.scrollY;
            winTot = winTop + winH;
        } else {
            winH = document.documentElement.clientHeight || document.body.clientHeight;
            winTop = Math.max(document.documentElement.scrollTop, document.body.scrollTop);
            winTot = winH + winTop;
        }
        o.offset = o.offset || winH;
        o.preOffset = o.preOffset || winH;
        if (o.imgCount) {
            var imgCache = [];
            for (var i = 0; i < o.imgCount; i++) {
                var img = o.imgList[i],
                    imgTop;
                var imgTop = this.getY(img, winTop);
                if (imgTop > (winTop - o.preOffset) && imgTop < (winTot + o.offset)) {
                    if (imgTop > winTop && imgTop < winTot) {
                        this.setSrc(img, o.trueSrc);
                    } else {
                        imgCache.push(img);
                    }
                    o.imgList.splice(i, 1);
                    i--;
                    o.imgCount--;
                }
            }
            var imgCacheL = imgCache.length;
            if (imgCacheL) {
                for (var i = 0; i < imgCacheL; i++) {
                    var img = imgCache[i];
                    this.setSrc(img, o.trueSrc);
                }
            }
        }
        if (o.jsCount) {
            for (var i = 0; i < o.jsCount; i++) {
                var oJs = o.jsList[i];
                var jsTop = this.getY(oJs.oDom, winTop);
                if (jsTop < (winTot + o.offset)) {
                    this.setJs.call(oJs.oDom,oJs.js);
                    o.jsList.splice(i, 1);
                    i--;
                    o.jsCount--;
                }
            }
        }
        if (o.imgCount == 0 && o.jsCount == 0) {
            this.removeEvent(window, "scroll", o.e1);
            this.removeEvent(window, "touchmove", o.e2);
            this.removeEvent(window, "touchend", o.e3);
        }
    },
    loadOnce: function(o) {
        for (var i = 0; i < o.imgCount; i++) {
            var img = o.imgList[i];
            this.setSrc(img, o.trueSrc);
        }
        if (o.jsList) {
            for (var i = 0; i < o.jsCount; i++) {
                var oJs = o.jsList[i];
                this.setJs.call(oJs.oDom,oJs.js);
            }
        }
    }
};