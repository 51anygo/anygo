<?php  
$typeNu = $_GET["nu"];  //快递单号
$debugcnt=$_GET["debugcnt"]; 
if($debugcnt>0)
{
    if($debugcnt<1) $debugcnt=1;
    if($debugcnt>4) $debugcnt=4;
    $aa=array();//
    $aa[0] = '﻿2013-11-22 11:44:17    已收件';
    $aa[1] = '2013-11-22 13:31:45    快件在 深圳 ,准备送往下一站 深圳集散中心 
        2013-11-22 11:44:17    已收件';
    $aa[2] = '2013-11-22 14:14:58    快件在 深圳集散中心 ,准备送往下一站 深圳集散中心 
        2013-11-22 13:31:45    快件在 深圳 ,准备送往下一站 深圳集散中心 
        2013-11-22 11:44:17    已收件';
    $aa[3] = '﻿2013-11-23 08:03:39    正在派件..(派件人:邹可仲,电话:13917582976)
        2013-11-23 06:11:07    快件在 上海集散中心 ,准备送往下一站 上海 
        2013-11-22 22:44:00    快件在 深圳集散中心 ,准备送往下一站 上海集散中心 
        2013-11-22 14:14:58    快件在 深圳集散中心 ,准备送往下一站 深圳集散中心 
        2013-11-22 13:31:45    快件在 深圳 ,准备送往下一站 深圳集散中心 
        2013-11-22 11:44:17    已收件';
    echo $aa[$debugcnt-1].'(^_^,此信息用来测试)';
    exit(4);
}
$curl = curl_init();
curl_setopt ($curl, CURLOPT_URL, 'http://www.kuaidi100.com/autonumber/auto?num='.$typeNu);
curl_setopt ($curl, CURLOPT_HEADER,0);
curl_setopt ($curl, CURLOPT_RETURNTRANSFER, 1);
curl_setopt ($curl, CURLOPT_USERAGENT,$_SERVER['HTTP_USER_AGENT']);
curl_setopt ($curl, CURLOPT_TIMEOUT,5);
$infos = curl_exec($curl);
curl_close ($curl);
$infos = json_decode($infos);
$typeCom = $infos[0]->comCode;  

 
$url ='http://www.kuaidi100.com/query?type='.$typeCom .'&postid='.$typeNu.'&id=1&valicode='; 

//优先使用curl模式发送数据
if (function_exists('curl_init') == 1){ 
  $curl = curl_init();
  curl_setopt ($curl, CURLOPT_URL, $url);
  curl_setopt ($curl, CURLOPT_HEADER,0);
  curl_setopt ($curl, CURLOPT_RETURNTRANSFER, 1);
  curl_setopt ($curl, CURLOPT_USERAGENT,$_SERVER['HTTP_USER_AGENT']);
  curl_setopt ($curl, CURLOPT_TIMEOUT,5);
  $get_content = curl_exec($curl);
  curl_close ($curl);  
}else{
  include("snoopy.php");
  $snoopy = new snoopy();
  $snoopy->referer = 'http://www.google.com/';//伪装来源
  $snoopy->fetch($url);
  $get_content = $snoopy->results;
} 
$str = ''; 
$temArr = json_decode($get_content); 
if(!$temArr)
{
	exit('网络延迟，请重试！');
}
if($temArr->status ==201){
	exit($temArr->message);
} 
if($temArr->status <> 200){
	exit($temArr->message);
} 

foreach($temArr->data as $v ){ 
	$str .= $v->time.'    '.$v->context."\n\r";
} 
echo $str;
?>
