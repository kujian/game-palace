"use strict";
var $ = require("common:jquery");
//引入锦囊组件
// var jn = require.async(["jinnang"]).then(function(jinnang){
//     var gw1 = {
//         txt:'此关通关秘诀在于快速点击发亮的怪物，否则游戏失败结束',
//         ps:'PS：注意把握时间'
//     }
//     jinnang.init(gw1.txt,gw1.ps);

//     // 加载背景音乐
//     // music.load("mmgd");
// })
function isArr(item,arr){
    for(var i = 0, len = arr.length; i<len; i++){
        if(item.pos == arr[i].pos){
            return true;
        }
    }
    return false;
}
var tpl = __inline("palace_h5.tpl");
var palace = {
    duringTime:30000,//游戏总的时间
    scanSpeed:3000,//每次扫描时间
    scanInterval:null,//扫描定时器
    washTime:0,//花费的时间
    outTime:false,//游戏过期
    lostTimes:0,//失败次数
    scanTimes:0,//扫描次数
    render:function(id){
        var _self = this;
        window.clearInterval(_self.scanInterval);
        _self.scanInterval = null;
        if(id){
            $(id).html("");
            _self.box = $(tpl).appendTo(id);
        }else{
            _self.box = $(tpl).appendTo("body");
        }
    },
    //图片加载完毕
    loadImgs: function(images,callback) {
      function imageLoaded() {
             // function to invoke for loaded image
             // decrement the counter
             counter--; 
             if( counter === 0 ) {
                 callback && callback();
             }
          }
          var counter = images.length;  // initialize the counter
          images.each(function() {
              if( this.complete ) {
                  imageLoaded.call( this );
              } else {
                  $(this).one('load', imageLoaded).each(function() {
                    if(this.complete) $(this).load();
                  });
              }
          });
    },
    //开始游戏
    init:function(options){
        var opts = options || {};
        var _self = this;
        var box = this.box;
        var timer = null;
        var images = $('#palaceBox img');
        _self.newPosArr = [];
        _self.loadImgs(images,function(){
               timer = setInterval(function(){
                if($('#palaceBox').css('position') != 'relative'){
                }else{
                    clearInterval(timer);
                    _self.resetBoxHeight();
                    _self.randPosArr = _self.getPartPos();
                    $(window).on('resize',function(){
                        _self.randPosArr = _self.getPartPos();
                    })
                    if(opts.start) opts.start.call(this);
                    // _self.resetPart();
                    _self.start(opts);
                    _self.focus(opts);
                    timer = null;
                }
            },10);
        });      
    },
    //失败之后重新开始
    restart:function(options){
        var opts = options || {};
        var _self = this;
        var box = this.box;
        clearInterval(_self.scanInterval);
        _self.scanInterval = null;
        _self.part = box.find('.part');
        _self.washTime = 0;
        _self.outTime = false;
        // _self.scanSpeed = 4000;
        _self.isSuc = 0;
        _self.restartTimer = null;
        _self.randPosArr = _self.getPartPos();
        $(window).on('resize',function(){
            _self.randPosArr = _self.getPartPos();
        })
        box.find('.lose-game').removeClass('bounceInDown').hide();
        $('#shadowBg').stop(true,true).removeAttr('style');
        var allTime = _self.duringTime / 1000;
        $('#palaceSecond').html(allTime);
        _self.part.each(function(){
            $(this).removeAttr('isClick');
            $(this).removeClass('active isClick');
            $(this).removeAttr('style');
        });

        _self.start(opts);
        _self.focus(opts);
    },
    //设置外围的盒子高度
    resetBoxHeight:function(){
        var winWidth = $(window).width(), winHeight = $(window).height(), designWidth = 1136, designHeight=536;
                winWidth = winWidth<1136 ? 1136 : winWidth;
                var boxHeight = winWidth*designHeight/designWidth;
                var distance = parseInt(winHeight - boxHeight) /2;
                $('#palaceBox').css({
                    height:boxHeight,
                    marginTop:distance
                });

                if(distance<0){
                    var bottom = -distance + 5;
                    $('.iboxs').css('bottom',bottom);
                }
                $(window).on('resize',function(){
                    winWidth = $(window).width(), winHeight = $(window).height(), designWidth = 1136, designHeight=536;
                    winWidth = winWidth<1136 ? 1136 : winWidth;
                    boxHeight = winWidth*designHeight/designWidth;
                    distance = parseInt(winHeight - boxHeight) /2;
                    $('#palaceBox').css({
                        height:boxHeight,
                        marginTop:distance
                    });
                    if(distance<0){
                        var bottom = -distance + 5;
                        $('.iboxs').css('bottom',bottom);
                    }
                });
    },
    //调整物品的位置和宽高自适应
    resetPart:function(){
        var _self = this;
        _self.part = $('#palaceBox .part');
        var designWidth = 1920, designHeight = 960;
        var docWidth = $(document).width(), docHeight = $(document).height();
        _self.part.each(function(el,i){
            // var asWidth = designWidth/docWidth, asHeight = designHeight/docHeight;
            // var objWidth = $(this).width(), objHeight = $(this).height();
            // var objLeft = $(this).offset().left, objTop = $(this).offset().top;
            // var realWidth = objWidth/asWidth, realHeight = objHeight/asHeight;
            // var realLeft = objLeft/asWidth, realTop = objTop/asHeight;
            // realWidth = realWidth/docWidth * 100+'%', realHeight = realHeight/docHeight * 100 + '%';
            // realLeft = realLeft/docWidth * 100 +'%', realTop = realTop/docHeight * 100 +'%';
            var asWidth = designWidth/docWidth;
            var objHeight = $(this).outerHeight();
            var objTop = $(this).offset().top;
            var objBottom = objHeight + objTop;
            var objWidth = $(this).outerWidth();
            var objLeft = $(this).offset().left;
            var realHeight = objHeight/designHeight * 100 +'%';
            var realTop = objTop/designHeight * 100 +'%';
            // console.log(objLeft);
            var realLeft = objLeft/designWidth * 100 +'%';
            var realWidth = objWidth/designWidth * 100 +'%';
            $(this).css({
                'visibility':'visible',
                left:realLeft,
                top:realTop,
                width:realWidth,
                height:realHeight
            })
        })
    },
    //获取页面物品的位置及返回某个时刻的随机值
    getPartPos:function(dir){
        var _self = this;
        _self.part = $('#palaceBox .part');
        var designWidth = 1920, designHeight = 960;
        var docWidth = $(document).width(), docHeight = $(document).height();
        var arr = [];
        _self.part.each(function(i,el){
            var $that = $(this);
            $(window).on('resize',function(){
                $that.removeAttr('data-top');
                $that.removeAttr('data-height');
            });
            // console.log($(this).position().top);
            // console.log($(this).css('top'));
            var objTop = parseFloat($(this).attr('data-top')) || parseFloat($(this).position().top) || parseInt($(this).css('top')), objHeight = parseInt($(this).attr('data-height')) || $(this).outerHeight(), objBottom = objTop+objHeight;
            var obj = {};
            obj.status = false;
            obj.top = objTop;
            obj.bottom = objBottom;
            obj.pos = i;
            $(this).attr('data-top',objTop);
            $(this).attr('data-height',objHeight);
            arr.push(obj);
        });
        return arr;
    },
    //返回随机数组
    shuffle: function(array,n){
        var currentIndex = array.length
        , temporaryValue
        , randomIndex
        ;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

          // Pick a remaining element...
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex -= 1;

          // And swap it with the current element.
          temporaryValue = array[currentIndex];
          array[currentIndex] = array[randomIndex];
          array[randomIndex] = temporaryValue;
      }

      return array;
    },
    //随机从1-3张牌中抽取
    shuffle_pick:function(){
        var _self = this;
        _self.scanTimes++;
        var arr2 = new Array();
        // console.log(_self.randPosArr);
        if(_self.randPosArr == null || _self.randPosArr == '' || !_self.randPosArr.length){
            _self.randPosArr = null;
            _self.randPosArr = [];
            // _self.randPosArr.unshift.apply(_self.randPosArr,_self.newPosArr);
            // _self.randPosArr = unique4(_self.randPosArr);
            _self.randPosArr = _self.newPosArr;
            // console.log(_self.randPosArr);
            _self.box.find('.part').each(function(){
                if(!$(this).attr('isClick')){
                    $(this).removeAttr('style');
                }
            });
            _self.newPosArr = null;
            _self.newPosArr = [];
        }
        _self.randPosArr = _self.shuffle(_self.randPosArr);
        var len = Math.min(_self.randPosArr.length, 3);
        if(len<1) return;
        var randArr2Num = Math.ceil(Math.random()*len);
        // if(_self.scanTimes == 5) randArr2Num = len;
        if(randArr2Num>3) randArr2Num = 3;
        for (var i=0; i<randArr2Num; i++) {
            if(!!_self.randPosArr[i]){
                arr2.push(_self.randPosArr[i]);
                _self.randPosArr.splice(i,1);
            }
        }
        return arr2;
    },
    //随机位置
    randArr:function(arr){//随机位置
        var ret = [],
        i = arr.length,
        n;
        arr = arr.slice(0);
        while (--i >= 0) {
            n = Math.floor( Math.random() * i);
            ret[ret.length] = arr[n];
            arr[n] = arr[i];
        }
        return ret;
    },
    //红外上下扫描
    scanning:function(dir){//红外扫描
        var _self = this;
        var line = $('#scanLine');
        var shadowBg = $('#shadowBg');
        var winH = $(window).height();
        var boxH = $('#palaceBox').height();
        $(window).on('resize',function(){
            boxH = $('#palaceBox').height();
        })
        line.show();
        if(dir == 'toTop'){
            shadowBg.animate({
                top:'-20px'
            },_self.scanSpeed);
            // line.animate({
            //     top:'0'
            // },_self.scanSpeed);
        }else{
            shadowBg.animate({
                top:boxH*1.3
            },_self.scanSpeed);
            // line.show().animate({
            //     top:boxH + 40
            // },_self.scanSpeed);
        }
    },
    //显示物品及消失
    showGif:function(item){//显示物品
        var _self = this,
        palacePos = $('#palaceBox'),
        part = palacePos.find('.part');
        var obj = part.eq(item.pos);
        if(obj.hasClass('active') || obj.attr('prev') || obj.attr('isClick')) return;
        obj.addClass('active flash');
        obj.stop(true,true).animate({
            'opacity':'1'
        },600,function(){
            obj.addClass('flash');
        })
        var timer = setTimeout(function(){
            if(!obj.attr('isClick')){
                obj.fadeOut('normal',function(){
                    obj.css({
                        opacity:0,
                        'display':'block'
                    });
                    obj.removeClass('active flash');
                    // obj.css({
                    //     'visibility':'hidden',
                    //     'display':'block'
                    // });
                    item.status = false;
                    var len = _self.newPosArr.length;
                    if(len>0){
                        if(!isArr(item,_self.newPosArr)){
                            _self.newPosArr.push(item);
                        }
                    }else{
                        _self.newPosArr.push(item);
                    }    
                    clearTimeout(timer);
                    timer = null;
                });
            }
        },_self.scanSpeed);
    },
    //判断红外扫描与出现物品的位置，当扫过物品时，显示出来
    scanShowGif:function(dir){
        var _self = this,
        randArr = _self.shuffle_pick(),
        dir = dir? dir : 'toBottom';
        if(!randArr) {
            return; 
        }
        var timer = null;
        clearInterval(timer);
        if(randArr.length>0){
            for (var i = 0, len = randArr.length; i < len; i++) {
                var item = randArr[i];
                if(!item) {
                    return false;
                }
                item.status = false;
                _self.showGif(item);
                // (function(item,dir) {
                //     var obj = $('#palaceBox .part').eq(item.pos);
                //     obj.removeAttr('prev');
                //     item.status = false;
                //     var timesRun = 0;
                //         timer = setInterval(function() {
                //         if(_self.isSuc == 7){
                //             clearInterval(timer);
                //             timer = null;
                //         }
                //         // console.log('sss');
                //         // console.log('第一次是否执行');
                //         var scanTop = $('#shadowBg').position().top, scanBottom = (scanTop + 40);
                //         if(_self.lostTimes >0 ){
                //         }
                //         if(dir == 'toTop'){
                //             if( (scanTop < item.top) && item.status == false){
                //                 item.status = true;
                //                 _self.showGif(item); 
                //             }
                //         }else{
                //             // console.log('shuotakngitobottom');
                //             if((scanBottom > item.bottom) && item.status == false){
                //                 item.status = true;
                //                 _self.showGif(item);
                //             }
                //         }
                //         timesRun ++;
                //         if(timesRun == _self.scanSpeed/100){
                //             var obj = $('#palaceBox .part').eq(item.pos);
                //             console.log('timesRun='+timesRun);
                //             // item.status = true;
                //             timesRun = 0;
                //             obj.attr('prev',1);
                //         }
                //     }, 100);
                // })(item,dir);
            }
        }
    },
    //点击物品消失动作
    focus:function(options){//点击消失
        var opts = options || {};
        var startTime = new Date().getTime();
        var _self = this,
            palacePos = $('#palaceBox'),
            part = palacePos.find('.part'),
            len = part.length,
            randPos = Math.round(Math.random()*len);
        var focusTimer = null;
        if(_self.washTime>_self.duringTime || !!_self.outTime) {
            clearInterval(focusTimer);
            focusTimer = null;
            // randArr = null;
            return;
        }
        var timesRun = 0, focusSpeed=_self.scanSpeed;
        _self.isSuc = 0;
        var iboxs = $('.iboxs'),iboxs_div = iboxs.find('div'), iboxs_li = iboxs.find('li');
        var iboxTop = iboxs.position().top + parseInt(iboxs_div.css('borderTop') || 5);
        var iboxLeft = iboxs.position().left;
        var divwidth = iboxs_div.width();
        var divheight = iboxs_div.height();
        var liWidth = iboxs_li.outerWidth();
        var liHeight = iboxs_li.outerHeight();
        var iboxLeft = (iboxs.width() - liWidth*7)/2;
        var iboxs_mLeft = parseInt(iboxs_div.css('marginLeft') || 10) + parseInt(iboxs_div.css('borderTop') || 5);
        $(window).on('resize',function(){
            iboxTop = iboxs.position().top + parseInt(iboxs_div.css('borderTop') || 5);
            iboxLeft = iboxs.position().left;
            divwidth = iboxs_div.width();
            divheight = iboxs_div.height();
            liWidth = iboxs_li.outerWidth();
            liHeight = iboxs_li.outerHeight();
            iboxLeft = (iboxs.width() - liWidth*7)/2;
            $('.isClick').each(function(){
                var index = parseInt($(this).attr('isClick'));
                var itemLeft = (index - 1) * liWidth + iboxLeft + iboxs_mLeft;
                $(this).css({
                    top:iboxTop,
                    left:itemLeft,
                    width:divwidth,
                    height:divheight
                })
            })
        });

        part.each(function(){
            var $that = $(this);
            $that.on('click',function(){
                if(_self.outTime) return;
                if(!$that.attr('isClick') && $that.hasClass('active')){
                    
                    _self.isSuc ++;
                    $that.attr('isClick',_self.isSuc);
                    // $that.fadeOut('normal',function(){
                        $that.addClass('isClick');
                        $that.removeClass('flash');
                        var lileft = (_self.isSuc - 1) * liWidth + iboxLeft + iboxs_mLeft;
                        $(window).on('resize',function(){
                            lileft = (_self.isSuc - 1) * liWidth + iboxLeft + iboxs_mLeft;
                        })
                        // $that.removeClass('active');
                        $that.css({
                            'visibility':'visible',
                            'display':'block',
                            'opacity':'1'
                        });
                        $that.stop(true,true).animate({
                            top:iboxTop,
                            left:lileft,
                            width:divwidth,
                            height:divheight,
                            display:'block',
                            opacity:1,
                        },500,function(){
                            if(_self.isSuc == len){
                                if(opts.success) opts.success.call(this); //成功回调函数
                            }
                        });
                        
                        
                    // })
                    if(_self.isSuc == len){
                        var now = new Date().getTime();
                        // _self.washTime = now - startTime;
                        // var second = _self.washTime / 1000;
                        // alert('恭喜你，完成挑战，完成时间为'+second+'秒');
                        $('#shadowBg').hide();
                        $('#scanLine').hide();
                        clearInterval(_self.scanInterval);
                        _self.scanInterval = null;
                        _self.outTime = true;
                        // randArr=null;
                        // _self.isSuc=0;
                        // $that.fadeOut('fast',function(){
                        //     $that.removeClass('active');
                        //     $that.css({
                        //         'visibility':'hidden',
                        //         'display':'block'
                        //     });
                            
                        // });
                        return;
                    }
                    // console.log('点击到了='+_self.isSuc);

                    
                }
            })
        })

    },
    //定时扫描和倒计时
    start:function(options){//开始上下扫描
        var opts = options || {};
        var _self = this;
        var startTime = new Date().getTime();
        var timesRun = 0;
        var allTime = _self.duringTime / 1000;
        var t1 = _self.scanSpeed / 1000;
        var t2,t3;
        _self.scanning();
        _self.scanShowGif();
        $('#palaceSecond').html(allTime);
        clearInterval(_self.scanInterval);
        _self.scanInterval = null;
        _self.scanInterval = setInterval(function(){
            timesRun +=1;
            var thisTime = new Date().getTime();
            // if( (thisTime - startTime)%1000 == 0){
                var second =Math.floor( (thisTime - startTime) / 1000);
                second = second <= second ? second : allTime;
                second = allTime - second;
                $('#palaceSecond').html(second);
            // }
            var now = new Date().getTime();
            if(now - startTime > _self.duringTime){
            // console.log('时间到了');
            clearInterval(_self.scanInterval);
            // alert('时间到了');
            _self.box.find('.lose-game').addClass('bounceInDown').show();
            _self.scanInterval = null;
            _self.outTime = true;
            if(opts.lose) opts.lose.call(this);
            _self.restartTimer = setTimeout(function(){
                clearTimeout(_self.restartTimer);
                _self.restart(opts);
                _self.lostTimes++;
            },3000);
            
            return;
            }
            // if(timesRun>3){
                t2 = (timesRun - t1) % (t1*2);
                t3 = (timesRun - t1*2) % (t1*2);
                if(t2 == 0){
                    // console.log('toTop');
                    _self.scanShowGif('toTop');
                    _self.scanning('toTop');
                }else if(t3 == 0){
                    // console.log('toBottom');
                    _self.scanShowGif();
                    _self.scanning();
                }
            // }
            
        }, 1000);
    },
    close: function() {
        this.box.hide();

    },
    open: function() {
        this.box.show();
    }
}


    // palace.render('#container');

module.exports = palace
