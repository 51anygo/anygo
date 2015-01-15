var debug = require('debug');
var log = debug('webot-example:log');

var _ = require('underscore')._;
var request = require('request');
var http = require('http');
var myphpurl = 'http://51anygophp.ap01.aws.af.cm';
var suggestmsg='';
var mytimeout=4800;
/**
 * 通过高德地图API查询用户的位置信息
 */
exports.geo2loc = function geo2loc(param, cb){
  var options = {
    url: 'http://restapi.amap.com/rgeocode/simple',
    timeout: mytimeout,
    qs: {
      resType: 'json',
      encode: 'utf-8',
      range: 3000,
      roadnum: 0,
      crossnum: 0,
      poinum: 0,
      retvalue: 1,
      sid: 7001,
      region: [param.lng, param.lat].join(',')
    }
  };
  log('querying amap for: [%s]', options.qs.region);

  //查询
  request.get(options, function(err, res, body){
    if(err){
      error('geo2loc failed', err);
      return cb(err);
    }
    var data = JSON.parse(body);
    if(data.list && data.list.length>=1){
      data = data.list[0];
      var location = data.city.name || data.province.name;
      log('location is %s, %j', location, data);
      return cb(null, location, data);
    }
    log('geo2loc found nth.');
    return cb('geo2loc found nth.');
  });
};
/**
 * 中译英
 *
 * @param  {String}   keyword 关键词
 * @param  {Function} cb            回调函数
 * @param  {Error}    cb.err        错误信息
 * @param  {String}   cb.result     查询结果
 */
exports.translate_english= function(keyword, cb){
  log('searching: %s', keyword);
  var options = {    
	//url:'http://51anygo.sinaapp.com/googlefy/fanyi.php?txt=%D6%D0%B9%FA%C8%CB%C3%F1%B9%B2%BA%CD%B9%FA',
	url:myphpurl+'/googlefy/fanyi.php?txt='+keyword.trim(),
    //url: 'http://51anygo.sinaapp.com/googlefy/fanyi.php?txt='+keyword.trim(),
    timeout: mytimeout,
    qs:{}
	};
  //console.log('options: ' + options.url);
  //request.setTimeout(timeout, [callback]);
  request.get(options, function(err, res, body){
    if (err || !body){
      return cb(null, '现在暂时无法搜索，待会儿再来好吗？');
    }
	console.log(body);  

    var result;
    result = body;
	var pageData = "";
    res.setEncoding('gb2312');
    res.on('data', function (chunk) {
        pageData += chunk;
    });
 
    res.on('end', function(){
        console.log(pageData);
        //这里处理抓取到的数据
    });
    // 则会生成图文列表
    return cb(null, result);
  });
};


/**
 * 搜索音乐
 *
 * @param  {String}   keyword 关键词
 * @param  {Function} cb            回调函数
 * @param  {Error}    cb.err        错误信息
 * @param  {String}   cb.result     查询结果
 */
exports.search_music = function(keyword, cb){
  log('searching: %s', keyword);
  var options = {
     //url:'http://api2.sinaapp.com/search/music/?appkey=0020130430&appsecert=fa6095e1133d28ad&reqtype=music&keyword=%E5%8D%81%E5%B9%B4',
    //url: 'http://api2.sinaapp.com/search/music/?appkey=0020130430&appsecert=fa6095e1133d28ad&reqtype=music&keyword='+keyword.trim(),
	//url:'http://51anygo.sinaapp.com/baidumusic/baidumusic.php?name=%E5%8D%81%E5%B9%B4',
	//url:'http://51anygo.sinaapp.com/baidumusic/baidumusic.php?name=%CA%AE%C4%EA',
	//url:'http://findme.jhost.cn/php/baidumusic/baidumusic.php?name='+keyword.trim(),
    //url: 'http://51anygo.sinaapp.com/baidumusic/baidumusic.php?name='+keyword.trim(),
	//url:'http://findme.jhost.cn/php/xiamimusic/music.php?name='+encodeURI(keyword.trim()),
    url: myphpurl+'/xiamimusic/xm.php?name='+encodeURI(keyword.trim()),
    timeout: mytimeout,
    qs:{}
	};
    //console.log('options: ' + options.url);
  request.get(options, function(err, res, body){
  //http://m.kugou.com/weixin/?action=single&filename=%u6076%u9b54%u5976%u7238-%u636e%u8bf4JZ%u4e5f%u5728%u627e%u540d%u5b57S&issoft=1&timelen=294231&chl=qq_client&MicroBlog=2
//http://m.kugou.com/weixin/?action=single&filename=dreamhigh - loveyou&hash=C112AA214825217A61D04A92F1A923B3&issoft=1&timelen=294231&chl=qq_client&MicroBlog=2
//http://cloud.kugou.com/app/getSearchResult.php?key={loveyou}&pageNo={pageno}&pageSize={pagesize}
    //if (err || !body || body.match("failed") )
    {
      //return cb(null, '现在暂时无法搜索，待会儿再来好吗？');
         result = [{
            //pic: myphpurl+'/cry.jpg',
            url: 'http://m.kugou.com',
            title: '网络不给力啊,试下在线听歌吧！',
            description: ''
        }];
        return cb(null, result);
    }
	console.log(body);
    //var regex = /comCode/gi;
    var i = 1;
	var result;
    var json=body;
    //json = json.force_encoding('UTF-8')
    //json = json.gsub(/[\u0000-\u001f\u007f\u0080-\u009f]/,'')
    try {	
        var jsonObj=JSON.parse(String(json));
        //console.log(jsonObj);  
        if (!jsonObj || !jsonObj.music || !jsonObj.music.title ){	  
            var nofindmsg='找不到您要的歌曲，试下别的歌吧';	           
            var indexfrom=parseInt(Math.random()*(490-1+1));
            var findtag = ' '+indexfrom+'.';   
            var rfindbgn=suggestmsg.indexOf(findtag);
            var findtag = ' '+(indexfrom+10)+'.'; 
            var rfindend=suggestmsg.indexOf(findtag);	
            if(rfindbgn>=0 && rfindend>=0)  
            {  
                suggestmsg = suggestmsg.substring(rfindbgn,rfindend);
                nofindmsg+=',您想试下这些歌曲'+suggestmsg;
            }  
            return cb(null, nofindmsg);
        }       
        
        console.log("jsonObj.music.musicurl:"+jsonObj.music.musicurl);
        console.log("jsonObj.music.description:"+jsonObj.music.description);
        //var m = regex.exec(body);


        result = {
          type: 'music',
          //description: jsonObj.music.description,
          description:  jsonObj.music.description,
          title: jsonObj.music.title,
          musicUrl: jsonObj.music.musicurl,
          hqMusicUrl: jsonObj.music.hqmusicurl
        }
    } catch (err) {
         //console.log('err: ' + err)
         return cb(null, nofindmsg);
    }
    //console.log('STATUS: ' + res.statusCode);
    //console.log('HEADERS: ' + JSON.stringify(res.headers));
    // 则会生成图文列表
    return cb(null, result);
  });
};

 //判断字符串所占的字节数
function GetCharLength(str)
{    
    return (new Buffer(str)).length;   //返回字符所占字节数
}
//若字符串长度超过要求，截掉多余部分
function CutStr(str,len)   //elementID表示要进行处理的对象ID,len表示设置的限制字节数
{
    
    var curStr = "";  //用于实时存储字符串
    for(var i = 0;i<str.length;i++)   //遍历整个字符串
    {
        curStr += str.charAt(i);  //记录当前遍历过的所有字符
        if(GetCharLength(curStr )>len)  //如果当前字符串超过限制长度
        {
            str = str.substring(0,i);  //截取多余的字符,并把剩余字符串赋给要进行处理的对象
            return str;  //结束函数
        }
    }
}      

/**
 * 搜索快递
 *
 * @param  {String}   keyword 关键词
 * @param  {Function} cb            回调函数
 * @param  {Error}    cb.err        错误信息
 * @param  {String}   cb.result     查询结果
 */
exports.search_kd = function(keyword, cb,postmap,autochk){
    var intime=new Date().getTime();
    keyword=keyword.replace("  "," ");    //去掉两个的空格
    var strtmp = keyword.split(" ");
    var strmail='';
    var debugcnt=0;
    var getpos=-1;
    
    keyword = strtmp[0];
    keyword=keyword.trim();
    strmail = strtmp[1];
    debugcnt = strtmp[2];
    if(debugcnt && !autochk){
        debugcnt=1;
    }
    var olddebug=debugcnt;
    if (!autochk && typeof(olddebug) == "undefined") { 
       olddebug=0;
    }
    var setmail=0;
     //没有定义的先发到我邮箱
    if (typeof(strmail) == "undefined") { 
       //strmail='41473064@qq.com'
    }
    else{
        if(strmail.indexOf('@')<0){
            strmail=strmail+'@qq.com'
        }
        setmail=1;
    }  
    console.log("keyword:"+keyword+",strmail:"+strmail);  
    var mypostmap=postmap.context;
    //if(autochk)
    {
        for( i in mypostmap){ 
            //找到单号,而且有变化了，则更新
            if(mypostmap[i].id == keyword ){
               getpos=i;
               debugcnt=mypostmap[i].info.debugcnt;
               break;
            }
        }
    }
    
    if(olddebug==0 && debugcnt>0){
        debugcnt=0; 
        if(getpos>0){
            mypostmap[getpos].info.status='';
        }
    }
     
  
    //console.log("support:"+tmp.context[0].id); 
   /*for( i in mypostmap){  
        console.log(i+":");        
        console.log(mypostmap[i].id); 
        console.log(mypostmap[i].mail); 
        console.log(mypostmap[i].status); 
          //console.log(tmppost['mail']); 
        //console.log(tmppost['status']); 
    }*/

  var mykdurl=myphpurl+'/kuaidi100/get.php?nu='+keyword.trim();
  if(debugcnt>0){
    mykdurl=myphpurl+'/kuaidi100/get.php?nu='+keyword.trim()+'&debugcnt='+debugcnt;
  }
  ////console.log('searching: %s,url: %s', keyword,mykdurl);
  var itime=new Date().getTime();
  var timecount=0;
  //console.log('timecount:%d,new Date().getTime(): %d',++timecount, new Date().getTime());
  var options = {
    url: mykdurl,
    timeout: (mytimeout-(itime-intime)),
	//url: 'http://51anygo.sinaapp.com/kuaidi100/get.php?nu='+keyword.trim(),
    qs: {
    }
  };
  ////console.log('options: ' + options.url);
  //console.log('timecount:%d,new Date().getTime(): %d',++timecount, new Date().getTime());
  request.get(options, function(err, res, body){     
    if (err || !body){
        //console.log('err:timecount:%d,new Date().getTime(): %d',++timecount, new Date().getTime());
        if(!autochk)
            return cb(null , '现在暂时无法搜索，待会儿再来好吗？');
    }
    //var regex = /comCode/gi;
    var i = 1;

    //var m = regex.exec(body);

    var result="";
    //console.log("body:",body);
	result = body;
    if (typeof(result) == "undefined") { 
       result=""
    }
    //console.log('timecount:%d,new Date().getTime(): %d',++timecount, new Date().getTime());
    //console.log("result:"+result); 
    try{
    //修正页面无法访问，报503错误
        if(result.match("异常") || result.match("错误") || result.match("网络延迟") || result.match("html")  ){
            //console.log("body:",body);
            result = [{
                pic: myphpurl+'/cry.jpg',
                url: 'http://m.46644.com/tool/express/?tpltype=weixin',
                title: '快递号无法智能查找,点击链接指定快递公司查找！',
                description: ''
            }];
            if(!autochk)
                return cb(null , result);
        }
    }
    catch (err) {
         //console.log('err: ' + err);
         return cb(null , result);
    }
   
   //if(setmail){
    //找到单号,而且有变化了，则更新
    if(debugcnt>0){
        debugcnt++;
    }
    if(getpos>-1 )
    {
        //console.log("find ok"); 
        //result.setEncoding('utf8');
        //console.log("status:"+mypostmap[getpos].info.status); 
        if(result.length>mypostmap[getpos].info.status.length){
            var resultStr=result;
            if(mypostmap[getpos].info.status.length>0){
               //indexOf函数对回车换行可能不支持，返回-1
               resultStr=result.substring(0,result.length-mypostmap[getpos].info.status.length);                    
               //console.log("result.indexOf(mypostmap[getpos].info.status):"+result.indexOf(mypostmap[getpos].info.status)); 
            }
            console.log("need update!"); 
            mypostmap[getpos].info.newstatus=resultStr;
            //console.log("newstatus:"+mypostmap[getpos].info.newstatus); 
            mypostmap[getpos].info.status=result;
            if(setmail){
                mypostmap[getpos].info.mail=strmail;
            }
            //定时检查则要更新状态
            mypostmap[getpos].info.updatecnt++;
            mypostmap[getpos].info.debugcnt=debugcnt;
            //console.log("newstatus:"+mypostmap[i].info.newstatus); 
            
        }
    }
    
    /*console.log(i+":");         
    console.log(mypostmap[i].id); 
    console.log(mypostmap[i].mail); 
    console.log(mypostmap[i].status); */
    if(getpos<0 && setmail){
        console.log("push ok,keyword:"+keyword); 
        mypostmap.push({
            id : keyword,
            info: {
            mail :strmail,
            status:result,
            newstatus:'',
            //status:'',
            updatecnt:0,
            ichknochgcnt:0,
            iwelcome:1,
            debugcnt:debugcnt,
            },
        });
    }
    //console.log('timecount:%d,new Date().getTime(): %d',++timecount, new Date().getTime());
    //}
    if(!autochk){
        if(!setmail){
          result+='\n亲,快递单号后面加空格加您的QQ号,我将会在快递变化时将状态发送到您邮箱!如输入:'+keyword+' 2669414011';
          result+='\n(请注意打开您微信邮箱提醒功能)'
        }
        else{
            result+='\n亲,恭喜您成功订阅快递邮件提醒功能，我将及时发送更新到您邮箱:'+strmail+',要变更邮箱请再次发送本指令!';
            result+='\n(请注意打开您微信邮箱提醒功能)'
        }
    }
    if(GetCharLength(result)>=2040){
    
       result = CutStr(result,2040);
       //console.log('trim timecount:%d,new Date().getTime(): %d,result;%d,buff size;%d',++timecount, new Date().getTime(),GetCharLength(result),(new Buffer(result)).length);
    }
	////console.log('STATUS: ' + res.statusCode);
    ////console.log('HEADERS: ' + JSON.stringify(res.headers));
	/*var pageData = "";
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
        pageData += chunk;
    });
 
    res.on('end', function(){
        console.log(pageData);
        //这里处理抓取到的数据
    });
    /*if (m.length) {
      result = '在百度搜索:' + keyword +',得到以下结果：\n' 
      result = res;
    } else {
      result = '搜不到任何结果呢';
    }*/

    // result 会直接作为
    // robot.reply() 的返回值
    //
    // 如果返回的是一个数组：
    // result = [{
    //   pic: 'http://img.xxx....',
    //   url: 'http://....',
    //   title: '这个搜索结果是这样的',
    //   description: '哈哈哈哈哈....'
    // }];
    //
    // 则会生成图文列表
    if(!autochk)
        return cb(null, result);
  });
};


/**
 * 搜索百度
 *
 * @param  {String}   keyword 关键词
 * @param  {Function} cb            回调函数
 * @param  {Error}    cb.err        错误信息
 * @param  {String}   cb.result     查询结果
 */
exports.search = function(keyword, cb){
  log('searching: %s', keyword);
  var options = {
    url: 'http://www.baidu.com/s',
    timeout: mytimeout,
    qs: {
      wd: keyword
    }
  };
  request.get(options, function(err, res, body){
    if (err || !body){
      return cb(null, '现在暂时无法搜索，待会儿再来好吗？');
    }
    var regex = /<h3 class="t">\s*(<a.*?>.*?<\/a>).*?<\/h3>/gi;
    var links = [];
    var i = 1;

    while (true) {
      var m = regex.exec(body);
      if (!m || i > 5) break;
      links.push(i + '. ' + m[1]);
      i++;
    }

    var result;
    if (links.length) {
      result = '在百度搜索:' + keyword +',得到以下结果：\n' + links.join('\n');
      result = result.replace(/\s*data-click=".*?"/gi,  '');
      result = result.replace(/\s*onclick=".*?"/gi,  '');
      result = result.replace(/\s*target=".*?"/gi,  '');
      result = result.replace(/<em>(.*?)<\/em>/gi,  '$1');
      result = result.replace(/<font.*?>(.*?)<\/font>/gi,  '$1');
      result = result.replace(/<span.*?>(.*?)<\/span>/gi,  '$1');
    } else {
      result = '搜不到任何结果呢';
    }

    // result 会直接作为
    // robot.reply() 的返回值
    //
    // 如果返回的是一个数组：
    // result = [{
    //   pic: 'http://img.xxx....',
    //   url: 'http://....',
    //   title: '这个搜索结果是这样的',
    //   description: '哈哈哈哈哈....'
    // }];
    //
    // 则会生成图文列表
    return cb(null, result);
  });
};

/**
 * 下载图片
 *
 * 注意:只是简陋的实现,不负责检测下载是否正确,实际应用还需要检查statusCode.
 * @param  {String} url  目标网址
 * @param  {String} path 保存路径
 */
exports.download = function(url, stream){
  log('downloading %s a stream', url);
  return request(url).pipe(stream);
};


/*

exports.hashtable_clear = function hashtable_clear(){ 
    this.hashtable = new Array(); 
} 

exports.hashtable_containsKey = function hashtable_containsKey(key){ 
    var exists = false; 
    for (var i in this.hashtable) { 
        if (i == key && this.hashtable[i] != null) { 
            exists = true; 
            break; 
        } 
    } 
    return exists; 
} 
exports.hashtable_containsValue = function hashtable_containsValue(value){ 
    var contains = false; 
    if (value != null) { 
        for (var i in this.hashtable) { 
            if (this.hashtable[i] == value) { 
                contains = true; 
                break; 
            } 
        } 
    } 
    return contains; 
} 

exports.hashtable_get = function hashtable_get(key){ 
    return this.hashtable[key]; 
} 
exports.hashtable_isEmpty = function hashtable_isEmpty(){ 
    return (this.size == 0) ? true : false; 
} 
exports.hashtable_keys = function hashtable_keys(){ 
    var keys = new Array(); 
    for (var i in this.hashtable) { 
        if (this.hashtable[i] != null) 
        keys.push(i); 
    } 
    return keys; 
} 
exports.hashtable_put = function hashtable_put(key, value){ 
    if (key == null || value == null) { 
        throw 'NullPointerException {' + key + '},{' + value + '}'; 
    }else{ 
        this.hashtable[key] = value; 
    } 
} 
exports.hashtable_remove = function hashtable_remove(key){ 
    var rtn = this.hashtable[key]; 
    //this.hashtable[key] =null; 
    this.hashtable.splice(key,1); 
    return rtn; 
} 
exports.hashtable_size = function hashtable_size(){ 
        var size = 0; 
        for (var i in this.hashtable) { 
        if (this.hashtable[i] != null) 
        size ++; 
        } 
        return size; 
} 
exports.hashtable_toString = function hashtable_toString(){ 
    var result = ''; 
    for (var i in this.hashtable) 
    { 
        if (this.hashtable[i] != null) 
        result += '{' + i + '},{' + this.hashtable[i] + '}\n'; 
    } 
    return result; 
} 
exports.hashtable_values = function hashtable_values(){ 
    var values = new Array(); 
    for (var i in this.hashtable) { 
        if (this.hashtable[i] != null) 
        values.push(this.hashtable[i]); 
    } 
    return values; 
} 

exports.Hashtable = function Hashtable(){ 
    this.clear = hashtable_clear; 
    this.containsKey = hashtable_containsKey; 
    this.containsValue = hashtable_containsValue; 
    this.get = hashtable_get; 
    this.isEmpty = hashtable_isEmpty; 
    this.keys = hashtable_keys; 
    this.put = hashtable_put; 
    this.remove = hashtable_remove; 
    this.size = hashtable_size; 
    this.toString = hashtable_toString; 
    this.values = hashtable_values; 
    this.hashtable = new Array(); 
} 
*/