var crypto = require('crypto');


var debug = require('debug');
var log = debug('webot-example:log');
var verbose = debug('webot-example:verbose');
var error = debug('webot-example:error');


var _ = require('underscore')._;
var search = require('../support').search;
var search_kd = require('../support').search_kd;
var search_music = require('../support').search_music;
var translate_english = require('../support').translate_english;
var geo2loc = require('../support').geo2loc;
var support = require('../support');
var nodemailer = require('nodemailer'); 
var mongodb = require('mongodb');
if(process.env.VCAP_SERVICES){
    var env = JSON.parse(process.env.VCAP_SERVICES);
    var mongo = env['mongodb-1.8'][0]['credentials'];
}
else{
    var mongo = {
    "hostname":"localhost",
    "port":27017,
    "username":"",
    "password":"",
    "name":"",
    "db":"db"
    }
}
if(process.env.VCAP_SERVICES){
    var env = JSON.parse(process.env.VCAP_SERVICES);
    var mongo = env['mongodb-1.8'][0]['credentials'];
}
else{
    var mongo = {
    "hostname":"localhost",
    "port":27017,
    "username":"",
    "password":"",
    "name":"",
    "db":"mydb"
    }
}
var generate_mongo_url = function(obj){
        obj.hostname = (obj.hostname || 'localhost');
        obj.port = (obj.port || 27017);
        obj.db = (obj.db || 'test');
        if(obj.username && obj.password){
            return "mongodb://" + obj.username + ":" + obj.password + "@" + obj.hostname + ":" + obj.port + "/" + obj.db;
    }
    else{
        return "mongodb://" + obj.hostname + ":" + obj.port + "/" + obj.db;
    }
}
var mongourl = generate_mongo_url(mongo);
 

var test_kd_status = ['',
  '2015-01-24 22:05:23 深圳市|收件|深圳市【深圳南头分部】，【（棕榈）】已揽收'
  ,'2015-01-26 00:34:40 深圳市|到件|到深圳市【深圳上李朗分拨仓】 2015-01-25 23:04:45 深圳市|发件|深圳市【深圳南头分部】，正发往【深圳分拨中心】 2015-01-24 22:05:23 深圳市|收件|深圳市【深圳南头分部】，【（棕榈）】已揽收'
  ,'2015-01-26 04:56:53 广州市|到件|到广州市【广州分拨中心】 2015-01-26 00:35:51 深圳市|发件|深圳市【深圳上李朗分拨仓】，正发往【广州分拨中心】 2015-01-26 00:34:40 深圳市|到件|到深圳市【深圳上李朗分拨仓】 2015-01-25 23:04:45 深圳市|发件|深圳市【深圳南头分部】，正发往【深圳分拨中心】 2015-01-24 22:05:23 深圳市|收件|深圳市【深圳南头分部】，【（棕榈）】已揽收'
  ,'2015-01-28 12:30:36 石家庄市|签收|石家庄市【桥西五部】，拍照签收 已签收 2015-01-28 11:09:14 石家庄市|派件|石家庄市【桥西五部】，【任翔15369383573】正在派件 2015-01-28 10:25:27 石家庄市|到件|到石家庄市【桥西五部】 2015-01-28 08:08:26 石家庄市|发件|石家庄市【石家庄分拨中心】，正发往【桥西五部】 2015-01-27 15:15:20 石家庄市|到件|到石家庄市【石家庄分拨中心】 2015-01-26 04:57:47 广州市|发件|广州市【广州分拨中心】，正发往【石家庄分拨中心】 2015-01-26 04:56:53 广州市|到件|到广州市【广州分拨中心】 2015-01-26 00:35:51 深圳市|发件|深圳市【深圳上李朗分拨仓】，正发往【广州分拨中心】 2015-01-26 00:34:40 深圳市|到件|到深圳市【深圳上李朗分拨仓】 2015-01-25 23:04:45 深圳市|发件|深圳市【深圳南头分部】，正发往【深圳分拨中心】 2015-01-24 22:05:23 深圳市|收件|深圳市【深圳南头分部】，【（棕榈）】已揽收'
  ];
  
var test_kd_new_status = ['',
  '2015-01-24 22:05:23 深圳市|收件|深圳市【深圳南头分部】，【（棕榈）】已揽收'
  ,'2015-01-26 00:34:40 深圳市|到件|到深圳市【深圳上李朗分拨仓】'
  ,'2015-01-26 04:56:53 广州市|到件|到广州市【广州分拨中心】'
  ,'2015-01-28 12:30:36 石家庄市|签收|石家庄市【桥西五部】，拍照签收 已签收'
  ];
  
  


var mongoose = require('mongoose');  
//For local environment: 
mongoose.connect(mongourl);


var Schema = mongoose.Schema;






var KDSchema = new Schema({
   id        : {type : String,index:true}
  ,title     : {type : String}
  ,status    : {type : String}
  ,newstatus : {type : String}
  ,updatecnt : {type : Number}
  ,ichknochgcnt: {type : Number}
  ,ilastchkcnt: {type : Number}
  //,iwelcome: {type : Number}
  ,debugcnt: {type : Number}
});

var KDMAILSSchema = new Schema({
   id        : {type : String,index:true}
  ,mail      : {type : String,index:true}
  ,iwelcome  : {type : Number}
});

var KDUSERSchema = new Schema({
   id        : {type : String,index:true}
  ,openid    : {type : String,index:true}
  ,iwelcome  : {type : Number}
  ,debugcnt  : {type : Number}
});


var USERMAILSchema = new Schema({
   openid    : {type : String,index:true}
  ,mail      : {type : String,index:true}
});



mongoose.model("KD", KDSchema);


var KD = mongoose.model("KD"); //获得model实例

mongoose.model("KDMAILS", KDMAILSSchema);

var KDMAILS = mongoose.model("KDMAILS"); //获得model实例

mongoose.model("KDUSER", KDUSERSchema);

var KDUSER = mongoose.model("KDUSER"); //获得model实例


mongoose.model("USERMAIL", USERMAILSchema);


var USERMAIL = mongoose.model("USERMAIL"); //获得model实例


var issendmail = true;
//280304922059
var examkdnum='';
var testkdnum='88888888';
var testinfo = new KD();
testinfo.id=examkdnum;    
//testinfo.mail = '41473064@qq.com';
testinfo.status='';
testinfo.newstatus='';
testinfo.updatecnt=0;
testinfo.ichknochgcnt=Date.now();
testinfo.ilastchkcnt=0;
testinfo.debugcnt=0;


var kdmail = new KDMAILS();
kdmail.id=examkdnum;    
kdmail.iwelcome=1;  
kdmail.mail = '41473064@qq.com';

if(examkdnum.length>0) {

    KD.remove({id:testinfo.id},function(err,docs){//删除id为4的记录
         console.log(docs);
         console.log('remove success');
         testinfo.save(function(err) {  //存储
         if (err) {
            console.log('save failed');
         }
          console.log('save success');
        });


    });

    KDMAILS.remove({id:kdmail.id},function(err,docs){//删除id为4的记录
         console.log(docs);
         console.log('remove success');
         kdmail.save(function(err) {  //存储
         if (err) {
            console.log('save failed');
         }
          console.log('save success');
        });


    });

}  
/*
KD.find({id:4},function(err,docs){//查询id为4的记录
     console.log(docs);
     console.log('find success');
});


KD.update({id:4,title:"upill"},function(err,docs){//更新
     console.log(docs);
     console.log('update success');
});


KD.remove({id:4},function(err,docs){//删除id为4的记录
     console.log(docs);
     console.log('remove success');
});


*/
var strmail='lifeassist@126.com'




//var postmap=[];


/*var testinfo={
    id : 12345678,
    info :{
        mail :'2669414011@qq.com',
        status:'',
        newstatus:'',
        updatecnt:0,
        ichknochgcnt:0,
        iwelcome:1,
        debugcnt:0,
    },
    };*/
//var chkstatustime=1000*60*10;
var chkstatustime=1000*10;
//postmap.push(testinfo);

var moment = require('moment')
var nodemailer = require("nodemailer");
 
// 开启一个 SMTP 连接池
var smtpTransport = nodemailer.createTransport("SMTP",{
    host: "smtp.126.com", // 主机
    secureConnection: true, // 使用 SSL
    port: 465, // SMTP 端口
    auth: {
        user: "lifeassist@126.com", // 账号
        pass: "good_1234" // 密码
    }
});

/*
 
// 设置邮件内容
var mailOptions = {
    from: "happy<lifeassist@126.com>", // 发件地址
    to: "41473064@qq.com", // 收件列表
    subject: "Hello world", // 标题
    html: "<b>thanks a for visiting!</b> 世界，你好！" // html 内容
}
 
// 发送邮件
smtpTransport.sendMail(mailOptions, function(error, response){
    if(error){
        console.log(error);
    }else{
        console.log("Message sent: " + response.message);
    }
    smtpTransport.close(); // 如果没用，关闭连接池
});

*/




 function clearString(s){ 
    var pattern = new RegExp("[`~!@#$^&*()=|{}';',\\[\\].<>/?~！@#￥……&*（）&;|{}‘；：”“'。，、？]") 
    var rs = ""; 
    for (var i = 0; i < s.length; i++) { 
        rs = rs+s.substr(i, 1).replace(pattern, ''); 
    } 
    rs=rs.replace(/\ +/g,"");//去掉空格
    rs=rs.replace(/[ ]/g,"");    //去掉空格
    rs=rs.replace(/[\r\n]/g,"");//去掉回车换行    
    return rs;  
}
setInterval(function(){
    //sleep(10000);
//return;
    //查找所有快递单    
    KD.find(function(err,postmap){
        if(err) return console.err(err);
        //console.dir(postmap);
        
        for( i in postmap){    
         if (typeof(postmap[i]) == "undefined") { 
           continue;
        }
		    
        if(postmap[i].id!=testkdnum && (Date.now()-postmap[i].ilastchkcnt) < 5*60*1000){
            //console.log("check freq too much!");  
            continue;            
        }
        var now_time = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
        console.log(now_time+",id:"+postmap[i].id+"Date.now()"+Date.now()+"postmap[i].ilastchkcnt"+postmap[i].ilastchkcnt); 
        //console.log(postmap[i].mail); 
        //console.log(postmap[i].status); 
        //console.log(postmap[i].iwelcome); 
        //console.log("postmap[i].updatecnt:"+postmap[i].updatecnt); 
        var mypostmapobj=new Object();  
        mypostmapobj.context=postmap[i];
        autochk=1;
        var postkey=postmap[i].id.toString();
        /*if((postmap[i].status.indexOf('已签收')>=0)  ||
            (postmap[i].status.indexOf('货物')>=0)){
            console.log("已签收:"+postmap[i].id); 
            delete postmap[i];
            continue;
        }*/
        //console.log("zzzz:"+postmap[i].status); 
        //console.log("aaa:"+postmap[i].status.indexOf('已收取')); 
         //检查30天没变化,就不检查了
         //console.log('Date.now()'+Date.now()+'ichknochgcnt'+postmap[i].ichknochgcnt+'-'+(Date.now()-postmap[i].ichknochgcnt));
        if((Date.now()-postmap[i].ichknochgcnt) > 24*60*60*30*1000){            
            KD.remove({id:postmap[i].id},function(err,docs){//删除id为4的记录
                console.log(docs);
                console.log('remove success');
            });
            
            KDMAILS.remove({id:postmap[i].id},function(err,docs){//删除id为4的记录
                console.log(docs);
                console.log('remove success');
            });
            delete postmap[i];
            continue;
        } 
        
        search_kd(postkey, function(error, strsubject,mypostmap,strnewmail){
       // console.log("345:"); 
        mypostmap.ilastchkcnt=Date.now();       
        if(error){
        console.log(error);
        }else{
           //console.log("123:"); 
                           
                    console.log("查询:"+postkey); 
                     
                    //tomail=mypostmap.mail;    
                    console.log("id:"+mypostmap.id+',updatecnt:'+mypostmap.updatecnt);         
                    if(mypostmap.id==testkdnum || mypostmap.updatecnt>0){
                        //mypostmap.ichknochgcnt=0;
                        //strsubject=clearString(strsubject);
                        //console.log("strsubject:"+strsubject); 
                        /*if(mypostmap.iwelcome==1){
                          // strsubject='您订阅了快递【'+postkey+'】提醒,我会为您提供最新的快递状态！';                   
                           mypostmap.iwelcome=0;
                        }
                        else{
                            if(mypostmap.updatecnt>0)
                                mypostmap.updatecnt--;
                        }*/
						if(mypostmap.updatecnt>0)
                                mypostmap.updatecnt=0;
                        console.log('begin update db ...');
                        KD.update({id:mypostmap.id},{updatecnt:mypostmap.updatecnt
                                ,newstatus:mypostmap.newstatus,status:mypostmap.status,ilastchkcnt:mypostmap.ilastchkcnt}
                                ,function(err,docs){//更新
                            if(err) return console.err(err);
                            //console.log(docs);
                            console.log('update success,id:'+mypostmap.id);
                        });
                        //console.log("newstatus:"+mypostmap.newstatus); 
                        /* console.log('begin send mail');
                       KDMAILS.find({id:mypostmap.id},function(err,bookman){
                            if(err) return console.err(err);
                            //console.dir(postmap);
                            console.log('begin send mail to mail bookman');
                            for( j in bookman){    
                                 if (typeof(bookman[j]) == "undefined") { 
                                   continue;
                                    }
                                console.log('bookman[j].mail'+bookman[j].mail+"mypostmap.length:"+mypostmap.status.length);
								var strsubject='快递【'+mypostmap.id+'】更新了,'+mypostmap.newstatus;    
								if(bookman[j].iwelcome==1){
								  strsubject='您订阅了快递【'+mypostmap.id+'】提醒,我会为您提供最新的快递状态！'; 
								  KDMAILS.update({id:mypostmap.id},{iwelcome:0}
								  ,function(err,docs){//更新
										if(err) return console.err(err);
										//console.log(docs);
										console.log('update  kdmails welcome success,id:'+mypostmap.id);
									});
								}	
                                if (issendmail)
								smtpTransport.sendMail({
                                    sender:strmail, //发送邮件的地址
                                    to:bookman[j].mail, //发给谁
                                    subject:strsubject,//+mypostmap.newstatus, //主题
                                    body:mypostmap.status+'\n'+'提醒来自微信生活服务小助手！', //发送的内容
                                    //html:'<p>hello</p>', //如果要发送html
                                    //attachments: null //如果要发送附件
                                },
                                //回调函数，用户判断发送是否成功，如果失败，输出失败原因。
                                function(error,success){
                                   if(!error){
                                        console.log('message success');
                                   }else{
                                    console.log('failed'+error);
                                   }
                                });
                            }
                        });
                        */
                        KDUSER.find({id:mypostmap.id},function(err,bookman){
                            if(err) return console.err(err);
							if(bookman.length==0){
									 KD.remove({id:mypostmap.id}
										  ,function(err,docs){//更新
												if(err) return console.err(err);
												//console.log(docs);
												console.log('kd remove success,id:'+mypostmap.id);
											});
							  }
							  else {
								console.log('begin send mail to openid bookman');
							  }
                            //console.dir(postmap);
                            
                            for( j in bookman){    
                                 if (typeof(bookman[j]) == "undefined") { 
                                    continue;
                                    }
                                  
                                USERMAIL.find({openid:bookman[j].openid},function(err,mybookman){ 
                                    for( k in mybookman){ 
                                            if (typeof(mybookman[k]) == "undefined") { 
                                                continue;
                                            }                                
                                            var tmpbookman=bookman[j];    
                                            var email_title=mypostmap.newstatus;	
                                            var email_body=mypostmap.status;											
											if(tmpbookman.debugcnt>0){
											 console.log('tmpbookman.id:'+tmpbookman.id+'tmpbookman.openid:'+tmpbookman.openid+'tmpbookman.debugcnt:'+tmpbookman.debugcnt+'tmpbookman.iwelcome:'+tmpbookman.iwelcome);
											   email_title=test_kd_new_status[tmpbookman.debugcnt];
											   email_body=test_kd_status[tmpbookman.debugcnt];
											}
                                            var strsubject='快递【'+tmpbookman.id+'】更新了,'+email_title;                                                                          
                                            if(tmpbookman.iwelcome==1){
                                              strsubject='您订阅了快递【'+tmpbookman.id+'】提醒,我会为您提供最新的快递状态！';
                                            }	
											var newdebugcnt=0;
											if(tmpbookman.id=testkdnum){
												newdebugcnt=tmpbookman.debugcnt+1;
												if(newdebugcnt>(test_kd_new_status.length-1)){
													 KDUSER.remove({id:tmpbookman.id,openid:tmpbookman.openid}
														  ,function(err,docs){//更新
																if(err) return console.err(err);
																//console.log(docs);
																console.log('kduser remove success,id:'+tmpbookman.id+'tmpbookman.openid:'+tmpbookman.openid);
															});
												  }
												  
											 }
											 KDUSER.update({id:tmpbookman.id,openid:tmpbookman.openid},{iwelcome:0,debugcnt:newdebugcnt}
                                              ,function(err,docs){//更新
                                                    if(err) return console.log(err);
                                                    //console.log(docs);
                                                    console.log('update  user mail welcome success,id:'+tmpbookman.id);
                                                });
                                            if (issendmail)
                                            smtpTransport.sendMail({
                                                sender:strmail, //发送邮件的地址
                                                to:mybookman[k].mail, //发给谁
                                                subject:strsubject,//+tmpbookman.newstatus, //主题
                                                body:email_body+'\n'+'提醒来自微信生活服务小助手！', //发送的内容
                                                //html:'<p>hello</p>', //如果要发送html
                                                //attachments: null //如果要发送附件
                                            },
                                            //回调函数，用户判断发送是否成功，如果失败，输出失败原因。
                                            function(error,success){
                                                if(!error){
                                                        console.log('message success');
                                                    }else{
                                                        console.log('failed'+error);
                                                    }
                                                });
                                            }
                                        } 
                                    );
                                }
                            });                                                 
                   
                    
                    //console.log(mypostmap.status); 
                    //console.log(tmppost['mail']); 
                    //console.log(tmppost['status']); 
                  }
				  else{ 
					KD.update({id:mypostmap.id},{ilastchkcnt:mypostmap.ilastchkcnt}
						,function(err,docs){//更新
						if(err) return console.err(err);
						//console.log(docs);
						//console.log('update success');
					});
				}
        }
        
    },mypostmapobj,autochk);
      
    
     }
});
    
},chkstatustime);

function do_test_kd(info, next){
    // pattern的解析结果将放在param里
    var uid =  info.uid;
    var q =  info.text;
    console.log('searching: '+ q);
    console.log('open id: '+ uid);     

        
    USERMAIL.find({openid:uid},function(err,findusermail){
		console.log('find usermail id'+findusermail);
		if(findusermail.length > 0) {
			 //postmap.updatecnt=1;
			//console.dir(postmap);
			 var tmpkduser = new KDUSER();
			 tmpkduser.id=testkdnum;   
			 tmpkduser.openid=uid;
			 tmpkduser.iwelcome=1;
			 tmpkduser.debugcnt=1;
			 tmpkduser.save(function(err) {  //存储
			 if (err) {
				console.log('tmpkduser save failed');
			 }
			  console.log(' tmpkduser save success');
			  
			});	

			KD.find({id:testkdnum},function(err,findkd){
				console.log('find findkd id'+findkd);
				if(findkd.length == 0) {
					 //postmap.updatecnt=1;
					//console.dir(postmap);
					var tmppostmap = new KD();
					tmppostmap.id=testkdnum;    
					//tmppostmap.mail = '';
					tmppostmap.status='';
					tmppostmap.newstatus='';
					tmppostmap.updatecnt=1;
					tmppostmap.ichknochgcnt=Date.now();
					tmppostmap.ilastchkcnt=0;
					tmppostmap.debugcnt=0;
					tmppostmap.save(function(err) {  //存储
					 if (err) {
						console.log('tmppostmap save failed');
					 }
					  console.log(' tmppostmap save success');
					  
					});							
					
				}
			});	 
            var result='';			
			result+='\n亲,测试的快递单号的最新状态将发送到您邮箱:'+findusermail[0].mail;
			result+='\n(请注意打开您微信邮箱提醒功能)';
			return  next(null, result);
		}
        else
        {
            return  next(null, '请先绑定您的QQ邮箱，请直接回复邮箱地址如:12345678@qq.com');
        }


    });


    
}
  

function do_set_mail(info, next){
    // pattern的解析结果将放在param里
    var uid =  info.uid;
    var q =  info.text;
    console.log('searching: '+ q);
    console.log('open id: '+ uid);
        
    var usermail = new USERMAIL();
    usermail.openid=uid;    
    usermail.mail = q;
        
    USERMAIL.remove({openid:uid},function(err,docs){//删除id为4的记录
         console.log(docs);
         console.log('remove  usermail success');
         if(usermail.mail.length>1) {
             usermail.save(function(err) {  //存储
             if (err) {
                console.log('save usermail failed');
             }
              console.log('save usermail success');
              return  next(null, '恭喜您,邮箱绑定成功,直接发送快递单号,将自动订阅快递状态,要取消绑定请直接回复@号');
            });
        }
        else
        {
            return  next(null, '恭喜您,邮箱取消绑定成功，要继续绑定请直接回复邮箱地址');
        }


    });


    
}
  
   function do_search_allnum_kd(info, next){
    // pattern的解析结果将放在param里
    var q =  info.text;
    log('searching: ', q);
    var uid=info.uid;
//console.log(q);  
    // 从某个地方搜索到数据...
    var mypostmapobj=new Object();  
    /*var tmp1=[];
    tmp1.push({
        id : 12345678,
        mail :'41473604@qq.com',
        status:null,
        });*/
    var tmppostmap = new KD();
    tmppostmap.id=q;    
    //tmppostmap.mail = '';
    tmppostmap.status='';
    tmppostmap.newstatus='';
    tmppostmap.updatecnt=0;
    tmppostmap.ichknochgcnt=Date.now();
    tmppostmap.ilastchkcnt=0;
    //tmppostmap.iwelcome=1;
    tmppostmap.debugcnt=0;
    mypostmapobj.context=tmppostmap;
    autochk=0;
    
   
    //var tmp=13;
    //console.log("index:"+mypostmapobj.context[0].id); 
    //console.log("q:"+q);
    
    search_kd(q ,function(err,result,postmap,strbookmail){
            //var booksucc='\n亲,恭喜您成功订阅快递邮件提醒功能，我将及时发送更新到您邮箱:'+strbookmail+',要变更邮箱请再次发送本指令!'+'\n(请注意打开您微信邮箱提醒功能)' ;
            booksucc='\n亲,要订阅快递状态，需要绑定您的邮箱地址，直接回复邮箱地址即可！';
            if(err) return console.err(err); 
            //console.dir(postmap);
            //if(typeof(strbookmail) != "undefined" && strbookmail.length>0 && result.length>0){
			//if(typeof(strbookmail) != "undefined" && strbookmail.length>0){
            if(false){
                 /*
                 KD.find({id:postmap.id},function(err,findkd){
                        //console.log('find findkd id'+findkd);
                        if(findkd.length == 0) {
                             //postmap.updatecnt=1;
                            //console.dir(postmap);
                            tmppostmap.save(function(err) {  //存储
                             if (err) {
                                console.log('tmppostmap save failed');
                             }
                              console.log(' tmppostmap save success');
                              
                            });							
                            
                        }
                    });	                    
                    
                    KDMAILS.find({id:postmap.id},function(err,findkdmail){
                        console.log('find kduser id'+findkdmail);
                        if(findkdmail.length > 0) {
                             //postmap.updatecnt=1;
                            //console.dir(postmap);
                            var tmpkdmail = new KDMAILS();
                            tmpkdmail.id=postmap.id;   
                            tmpkdmail.mail=strbookmail;
                            tmpkdmail.iswelcome=1;
                            tmpkdmail.save(function(err) {  //存储
                             if (err) {
                                console.log('tmpkdmail save failed');
                             }
                              console.log(' tmpkdmail save success');
                            });							
                            
                        }
                    });
                     */
			        result+=booksucc;
                    return next(null, result);
                
            }
            else {
                  USERMAIL.find({openid:uid},function(err,findusermail){
                    console.log('find usermail id'+findusermail);
                    if(findusermail.length > 0) {
                         //postmap.updatecnt=1;
                        //console.dir(postmap);
						 KDUSER.find({openid:uid},function(err,findkduser){
							console.log('find kduser id'+findkduser);
							if(findkduser.length == 0) {
								 var tmpkduser = new KDUSER();
								 tmpkduser.id=q;   
								 tmpkduser.openid=uid;
								 tmpkduser.iwelcome=0;
								 tmpkduser.save(function(err) {  //存储
								 if (err) {
									console.log('tmpkduser save failed');
								 }
								  console.log(' tmpkduser save success');
								  var strsubject='您订阅了快递【'+postmap.id+'】提醒,我会为您提供最新的快递状态！';
								  var email_body = result;
								    if (issendmail)
								    smtpTransport.sendMail({
									sender:strmail, //发送邮件的地址
									to:findusermail[0].mail, //发给谁
									subject:strsubject,//+tmpbookman.newstatus, //主题
									body:email_body+'\n'+'提醒来自微信生活服务小助手！', //发送的内容
									//html:'<p>hello</p>', //如果要发送html
									//attachments: null //如果要发送附件
								    },
								    //回调函数，用户判断发送是否成功，如果失败，输出失败原因。
								    function(error,success){
									if(!error){
										console.log('message success');
									    }else{
										console.log('failed'+error);
									    }
									});
								});	  
							}
                        });	

                        KD.find({id:postmap.id},function(err,findkd){
                            //console.log('find findkd id'+findkd);
                            if(findkd.length == 0) {
                                 //postmap.updatecnt=1;
                                //console.dir(postmap);
                                tmppostmap.save(function(err) {  //存储
                                 if (err) {
                                    console.log('tmppostmap save failed');
                                 }
                                  console.log(' tmppostmap save success');
                                  
                                });							
                                
                            }
                        });	  
                        result+='\n亲,快递单号的最新状态将发送到您邮箱:'+findusermail[0].mail;
                        result+='\n(请注意打开您微信邮箱提醒功能)';
                       
                    }
                    else {
                        result+=booksucc;
                        //result+='\n(请注意打开您微信邮箱提醒功能)';
                    }
                    return next(null, result);
                });	
            }
            
        }
        ,mypostmapobj,autochk);
    //return search_kd(q ,next,mypostmapobj,autochk);
 }
//console.log('5')


/*
var arr={a:1,b:2,c:3};
arr.d = 4;
var property;
for(property in arr) {
    console.log(property + ": " + arr[property]);
    console.log(arr['a']);
}*/
/**
 * 初始化路由规则
 */
module.exports = exports = function(webot){
  //var json='{"errcode":0,"msgtype":"music","music":{"title":"Believe","description":"Cher","musicurl":"http:\/\/m1.file.xiami.com\/1\/828\/15828\/137437\/1532606_637166_l.mp3","hqmusicurl":"http:\/\/m1.file.xiami.com\/1\/828\/15828\/137437\/1532606_637166_l.mp3"}}'
  //var jsonObj=JSON.parse(String(json));
  //console.log(jsonObj); 
  //console.log(jsonObj.music.title);
    
    /*console.log('1');
    function test(){
    setTimeout(function(){console.log('2')},1000);
    }
    test();
    console.log('3');
    setTimeout(function(){console.log('4')},2000);*/


  var reg_help = /^(help|\?)$/i
  webot.set({
    // name 和 description 都不是必须的
    name: 'hello help',
    description: '获取使用帮助，发送 help',
    pattern: function(info) {
      //首次关注时,会收到subscribe event
      return info.is('event') && info.param.event == 'subscribe' || reg_help.test(info.text);
    },
    handler: function(info){
      var reply = {
        title: '感谢你收听生活服务小助手',
        pic: 'http://findme.jhost.cn/php/qrcode.jpg',
        url: '',
        description: [
          '建议你试试这几条指令:',
   //'1. kd+空格+单号 : 查询快递状态',
'1. 快递号码 : 查询快递状态'
//'2. dg+空格+歌名 : 点歌',
//'2. 歌曲名称 : 点歌',
//'3. fy+空格+中文内容 : 中译英',
           // '4. game : 玩玩猜数字的游戏吧',
          //  '6. s+空格+关键词 : 我会帮你百度搜索喔',
          //  '6. 发送你的经纬度',
          //  '7. 重看本指令请回复help或问号',
         //   '8. 更多指令请回复more',
//'9. 商务合作请微信我langdalang001'
        ].join('\n')
      };
      // 返回值如果是list，则回复图文消息列表
      return reply;
    }
  });

/*
  // 更简单地设置一条规则
  webot.set(/^more$/i, function(info){
    var reply = _.chain(webot.gets()).filter(function(rule){
      return rule.description;
    }).map(function(rule){
      //console.log(rule.name)
      return '> ' + rule.description;
    }).join('\n').value();
    
    return ['我的主人还没教我太多东西,你可以考虑帮我加下.\n可用的指令:\n'+ reply,
      '没有更多啦！当前可用指令：\n' + reply];
  });


  webot.set('who_are_you', {
    description: '想知道我是谁吗? 发送: who?',
    // pattern 既可以是函数，也可以是 regexp 或 字符串(模糊匹配)
    pattern: /who|你是[谁\?]+/i,
    // 回复handler也可以直接是字符串或数组，如果是数组则随机返回一个子元素
    handler: ['我是神马生活服务小助手', '贴心的生活服务小助手']
  });


  // 正则匹配后的匹配组存在 info.query 中
  webot.set('your_name', {
    description: '自我介绍下吧, 发送: I am [enter_your_name]',
    pattern: /^(?:my name is|i am|我(?:的名字)?(?:是|叫)?)\s*(.*)$/i,


    // handler: function(info, action){
    //   return '你好,' + info.param[1]
    // }
    // 或者更简单一点
    handler: '你好,{1}'
  });

*/
// function to calculate local time


// in a different city


// given the city's UTC offset


function calcTime(city, offset) {


// create Date object for current location


d = new Date();


 


// convert to msec


// add local time zone offset


// get UTC time in msec


utc = d.getTime() + (d.getTimezoneOffset() * 60000);


 


// create new Date object for different city


// using supplied offset


nd = new Date(utc + (3600000*offset));


 
    return nd;
// return time as a string


//return "The local time in " + city + " is " + nd.toLocaleString();


}



  // 支持一次性加多个（方便后台数据库存储规则）
  webot.set([{
    name: 'morning',
    description: '打个招呼吧, 发送: good morning',
    pattern: /^(早上?好?|(good )?moring)[啊\!！\.。]*$/i,
    handler: function(info){
      var d = new Date();
      var h = d.getHours();
      if (h < 3) return '[嘘] 我这边还是深夜呢，别吵着大家了';
      if (h < 5) return '这才几点钟啊，您就醒了？';
      if (h < 7) return '早啊官人！您可起得真早呐~ 给你请安了！\n 今天想参加点什么活动呢？';
      if (h < 9) return 'Morning, sir! 新的一天又开始了！您今天心情怎么样？';
      if (h < 12) return '这都几点了，还早啊...';
      if (h < 14) return '人家中午饭都吃过了，还早呐？';
      if (h < 17) return '如此美好的下午，是很适合出门逛逛的';
      if (h < 21) return '早，什么早？找碴的找？';
      if (h >= 21) return '您还是早点睡吧...';
    }
  }, {
    name: 'time',
    description: '想知道几点吗? 发送: time',
    pattern: /^(几点了|time)\??$/i,
    handler: function(info) {
      //var d = new Date();
 var d = calcTime('Singapore', '+8');
      var h = d.getHours();
      //var t = '现在是服务器时间' + h + '点' + d.getMinutes() + '分';
 var t = '现在是北京时间' + h + '点' + d.getMinutes() + '分';
      if (h < 4 || h > 22) return t + '，夜深了，早点睡吧 [月亮]';
      if (h < 6) return t + '，您还是再多睡会儿吧';
      if (h < 9) return t + '，又是一个美好的清晨呢，今天准备去哪里玩呢？';
      if (h < 12) return t + '，一日之计在于晨，今天要做的事情安排好了吗？';
      if (h < 15) return t + '，午后的冬日是否特别动人？';
      if (h < 19) return t + '，又是一个充满活力的下午！今天你的任务完成了吗？';
      if (h <= 22) return t + '，这样一个美好的夜晚，有没有去看什么演出？';
      return t;
    }
  }]);


  // 等待下一次回复
  webot.set('guess my sex', {
    pattern: /是男.还是女.|你.*男的女的/,
    handler: '你猜猜看呐',
    replies: {
      '/女|girl/i': '人家才不是女人呢',
      '/男|boy/i': '是的，我就是翩翩公子一枚',
      'both|不男不女': '你丫才不男不女呢',
      '不猜': '好的，再见',
      // 请谨慎使用通配符
      '/.*/': function reguess(info) {
        if (info.rewaitCount < 2) {
          info.rewait();
          return '你到底还猜不猜嘛！';
        }
        return '看来你真的不想猜啊';
      },
    }
    
    // 也可以用一个函数搞定:
    // replies: function(info){
    //   return 'haha, I wont tell you'
    // }


    // 也可以是数组格式，每个元素为一条rule
    // replies: [{
    //   pattern: '/^g(irl)?\\??$/i',
    //   handler: '猜错'
    // },{
    //   pattern: '/^b(oy)?\\??$/i',
    //   handler: '猜对了'
    // },{
    //   pattern: 'both',
    //   handler: '对你无语...'
    // }]
  });


  // 定义一个 wait rule
  webot.waitRule('wait_guess', function(info) {
    var r = Number(info.text);


    // 用户不想玩了...
    if (isNaN(r)) {
      info.resolve();
      return null;
    }


    var num = info.session.guess_answer;


    if (r === num) {
      return '你真聪明!';
    }


    var rewaitCount = info.session.rewait_count || 0;
    if (rewaitCount >= 2) {
      return '怎么这样都猜不出来！答案是 ' + num + ' 啊！';
    }


    //重试
    info.rewait();
    return (r > num ? '大了': '小了') +',还有' + (2 - rewaitCount) + '次机会,再猜.';
  });


  webot.set('guess number', {
    description: '发送: game , 玩玩猜数字的游戏吧',
    pattern: /(?:game|玩?游戏)\s*(\d*)/,
    handler: function(info){
      //等待下一次回复
      var num = Number(info.param[1]) || _.random(1,9);


      verbose('answer is: ' + num);


      info.session.guess_answer = num;


      info.wait('wait_guess');
      return '玩玩猜数字的游戏吧, 1~9,选一个';
    }
  });


  webot.waitRule('wait_suggest_keyword', function(info, next){
    if (!info.text) {
      return next();
    }


    // 按照定义规则的 name 获取其他 handler
    var rule_search = webot.get('search');


    // 用户回复回来的消息
    if (info.text.match(/^(好|要|y)$/i)) {
      // 修改回复消息的匹配文本，传入搜索命令执行
      info.param[0] = 's nodejs';
      info.param[1] = 'nodejs';


      // 执行某条规则
      webot.exec(info, rule_search, next);
      // 也可以调用 rule 的 exec 方法
      // rule_search.exec(info, next);
    } else {
      info.param[1] = info.session.last_search_word;
      // 或者直接调用 handler :
      rule_search.handler(info, next);
      // 甚至直接用命名好的 function name 来调用：
      // do_search(info, next);
    }
    // remember to clean your session object.
    delete info.session.last_search_word;
  });
  // 调用已有的action
  webot.set('suggest keyword', {
    description: '发送: s nde ,然后再回复Y或其他',
    pattern: /^(?:搜索?|search|s\b)\s*(.+)/i,
    handler: function(info){
      var q = info.param[1];
      if (q === 'nde') {
        info.session.last_search_word = q;
        info.wait('wait_suggest_keyword');
        return '你输入了:' + q + '，似乎拼写错误。要我帮你更改为「nodejs」并搜索吗?';
      }
    }
  });


  function do_search(info, next){
    // pattern的解析结果将放在param里
    var q = info.param[1];
    log('searching: ', q);
    // 从某个地方搜索到数据...
    return search(q , next);
  }


  // 可以通过回调返回结果
  webot.set('search', {
    description: '发送: s 关键词 ',
    pattern: /^(?:搜索?|search|百度|s\b)\s*(.+)/i,
    //handler也可以是异步的
    handler: do_search
  });








  
  


  function do_translate_english(info, next){
    // pattern的解析结果将放在param里
    var q = info.param[1];
    log('searching: ', q);
    // 从某个地方搜索到数据...
    return translate_english(q , next);
  }


  // 可以通过回调返回结果
  webot.set('translate_english', {
    description: '发送: fy 关键词 ',
    pattern: /^(?:翻译?|fy|f\y)\f*(.+)/i,
    //handler也可以是异步的
    handler: do_translate_english
  });
  
    function do_search_music(info, next){
    // pattern的解析结果将放在param里
    var q = info.param[1];
    log('searching: ', q);
    // 从某个地方搜索到数据...
    return search_music(q , next);
  }


  // 可以通过回调返回结果
  webot.set('search_music', {
    description: '发送: dg 关键词 ',
    pattern: /^(?:点歌?|dg|d\g)\d*(.+)/i,
    //handler也可以是异步的
    handler: do_search_music
  });


  webot.waitRule('wait_timeout', function(info) {
    if (new Date().getTime() - info.session.wait_begin > 5000) {
      delete info.session.wait_begin;
      return '你的操作超时了,请重新输入';
    } else {
      return '你在规定时限里面输入了: ' + info.text;
    }
  });


  // 超时处理
  webot.set('timeout', {
    description: '输入timeout, 等待5秒后回复,会提示超时',
    pattern: 'timeout',
    handler: function(info) {
      info.session.wait_begin = new Date().getTime();
      info.wait('wait_timeout');
      return '请等待5秒后回复';
    }
  });


  //支持location消息,已经提供了geo转地址的工具，使用的是高德地图的API
  //http://restapi.amap.com/rgeocode/simple?resType=json&encode=utf-8&range=3000&roadnum=0&crossnum=0&poinum=0&retvalue=1&sid=7001&region=113.24%2C23.08
  webot.set('check_location', {
    description: '发送你的经纬度,我会查询你的位置',
    pattern: function(info){
      return info.is('location');
    },
    handler: function(info, next){
      geo2loc(info.param, function(err, location, data) {
        location = location || info.label;
        next(null, location ? '你正在' + location : '我不知道你在什么地方。');
      });
    }
  });


  //图片
  webot.set('check_image', {
    description: '发送图片,我将返回其hash值',
    pattern: function(info){
      return info.is('image');
    },
    handler: function(info, next){
      verbose('image url: %s', info.param.picUrl);
      try{
        var shasum = crypto.createHash('md5');


        var req = require('request')(info.param.picUrl);


        req.on('data', function(data) {
          shasum.update(data);
        });
        req.on('end', function() {
          return next(null, '你的图片hash: ' + shasum.digest('hex'));
        });
      }catch(e){
        error('Failed hashing image: %s', e)
        return '生成图片hash失败: ' + e;
      }
    }
  });


  // 回复图文消息
  webot.set('reply_news', {
    description: '发送news,我将回复图文消息你',
    pattern: /^news\s*(\d*)$/,
    handler: function(info){
      var reply = [
        {title: '图文消息3', description: '图文消息描述3', pic: 'https://raw.github.com/node-webot/webot-example/master/qrcode.jpg', url: 'http://www.baidu.com'}
      ];
      // 发送 "news 1" 时只回复一条图文消息
      return Number(info.param[1]) == 1 ? reply[0] : reply;
    }
  });


  // 可以指定图文消息的映射关系
  webot.config.mapping = function(item, index, info){
    //item.title = (index+1) + '> ' + item.title;
    return item;
  };
  
  
  // 简单的纯文本对话，可以用单独的 yaml 文件来定义
  //require('js-yaml');
  //webot.dialog(__dirname + '/dialog.yaml');
    // 可以通过回调返回结果
    
 

 
   //所有消息都无法匹配时的fallback
  webot.set( 'do_set_mail', {
    description: '发送: 邮箱地址 ',
    pattern:  /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
    //handler也可以是异步的
    handler: do_set_mail
  });

  
  webot.set( 'do_test_kd', {
    description: '发送: 测试 ',
    pattern:  /测试|test/,
    //handler也可以是异步的
    handler: do_test_kd
  });
   //所有消息都无法匹配时的fallback
  webot.set( 'search_allnum_kd', {
    description: '发送: 全部数字 ',
    pattern: /\d/gi,
    //handler也可以是异步的
    handler: do_search_allnum_kd
  });
  
   webot.set('search_kd', {
    description: '发送: kd 关键词 ',
    pattern: /^(?:快递?|kd|k\d)\k*(.+)/i,
    //handler也可以是异步的
    handler: do_search_allnum_kd
  });
  
   function do_search_allhans_music(info, next){
    // pattern的解析结果将放在param里
    var q =  info.text;
    log('searching: ', q);
console.log(q);  
    // 从某个地方搜索到数据...
    return search_music(q , next);
  }
 
   //所有消息都无法匹配时的fallback
  webot.set( 'search_allnum_music', {
    description: '发送: 全部汉字 ',
    pattern: /^[\u4e00-\u9fa5_a-zA-Z0-9\s]+$/ ,
    //handler也可以是异步的
    handler: do_search_allhans_music
  });
  
  //所有消息都无法匹配时的fallback
  webot.set(/.*/, function(info){
    // 利用 error log 收集听不懂的消息，以利于接下来完善规则
    // 你也可以将这些 message 存入数据库
    log('unhandled message: %s', info.text);
    info.flag = true;
    return '你发送了「' + info.text + '」,可惜我太笨了,听不懂. 发送: help 查看可用的指令';
  });
  
  
};
