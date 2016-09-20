# game-palace
game palace

#神秘宫殿

##如何使用

``` 

require.async(["palace_h5"]).then(function(palace){//引入模块

palace.render('#continer'); //初始化
$('.restart').on('click',function(){
	palace.restart();//重新开始
})
palace.init({
	//游戏回调函数
	start:function(){},//开始游戏
	success:function(){},//游戏成功
	lose:function(){},//游戏失败

});

palace.restart(); //重新开始

palace.close(); //隐藏模块

palace.open(); //显示模块

});


```
