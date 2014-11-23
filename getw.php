<?php
header('Access-Control-Allow-Origin: *');
header("Content-Type:text/javascript;charset=utf-8");
/**
 * 获取用户真实 IP
 */
function getIP()
{
    static $realip;
    if (isset($_SERVER)){
        if (isset($_SERVER["HTTP_X_FORWARDED_FOR"])){
            $realip = $_SERVER["HTTP_X_FORWARDED_FOR"];
        } else if (isset($_SERVER["HTTP_CLIENT_IP"])) {
            $realip = $_SERVER["HTTP_CLIENT_IP"];
        } else {
            $realip = $_SERVER["REMOTE_ADDR"];
        }
    } else {
        if (getenv("HTTP_X_FORWARDED_FOR")){
            $realip = getenv("HTTP_X_FORWARDED_FOR");
        } else if (getenv("HTTP_CLIENT_IP")) {
            $realip = getenv("HTTP_CLIENT_IP");
        } else {
            $realip = getenv("REMOTE_ADDR");
        }
    }


    return $realip;
}


/**
 * 获取 IP  地理位置
 * 淘宝IP接口
 * @Return: array
 */
function getCity($ip)
{
	$url="http://ip.taobao.com/service/getIpInfo.php?ip=".$ip;
	$ip=json_decode(file_get_contents($url));	
	if((string)$ip->code=='1'){
	   return false;
 	}
 	$data = $ip->data->city;
	return $data;	
}

function getWeather($cityId)
{
	$url="http://m.weather.com.cn/data/".$cityId.".html";
	$weather=json_decode(file_get_contents($url));
	return $weather;	
}
function json_to_array($web){
	$arr=array();
	foreach($web as $k=>$w){
		if(is_object($w)) $arr[$k]=json_to_array($w); //判断类型是不是object
		else $arr[$k]=$w;
	}
	return $arr;
}
$city = getCity(getIP());
$city = str_split($city,strlen($city)-3);
$city =$city[0];
$cityUrl = "http://evenle.com/wei/20130921/city.php";
$web=json_decode(file_get_contents($cityUrl));
$arr=json_to_array($web);
$weatherInfo = getWeather($arr[$city]);
echo('weather(');
echo(json_encode($weatherInfo));
echo(")");

?>