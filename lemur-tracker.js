const LEMUR_SITE_URL = "http://localhost:8000" // Укажите URL API

async function postEvent(eventType){
  let eventData = null;
  let dateData = new Date();

  if (eventType == "eventSiteEntry"){
    let location = await (async function geolocationType() {
      const geoData = await getGeolocation();
      
      if (typeof geoData === "string") {
        return JSON.parse(geoData);
      } else {
        return geoData;
      }
    })();

    eventData = {
      event: eventType,
      date: dateData.getDate() + "." + (dateData.getMonth() + 1) + "." + dateData.getFullYear(),
      time: dateData.getHours() + ":" + dateData.getMinutes() + ":" + dateData.getSeconds(),
      timezoneOffset: String(dateData.getTimezoneOffset() / (-60)),
      device: getDevice(),
      countryCode: location.countryCode,
      region: location.region,
      browser: getBrowser(),
      trafficSource: getTrafficSource()
    }
  }
  else{
    eventData = {
      event: eventType,
      date: dateData.getDate() + "." + (dateData.getMonth() + 1) + "." + dateData.getFullYear(),
      time: dateData.getHours() + ":" + dateData.getMinutes() + ":" + dateData.getSeconds(),
      timezoneOffset: String(dateData.getTimezoneOffset() / (-60)),
      device: getDevice(),
      countryCode: "[null]",
      region: "[null]",
      browser: getBrowser(),
      trafficSource: getTrafficSource(),
    }
  }
 
  console.log(eventData)
  makeRequest(`${LEMUR_SITE_URL}/api/events`, "POST", {"Content-Type": "application/json"}, eventData);
}

function getTrafficSource() {
    const referrer = document.referrer;
    const currentDomain = window.location.hostname;
    
    let source = 'direct';

    if (referrer) {
      try {
        const referrerUrl = new URL(referrer);

        if (referrerUrl.hostname === currentDomain) {
          source = 'internal'
        } 
        else {
          source = 'referral';
        }
      } 
      catch (error) {
        console.log('Ошибка парсинга реферера:', error);
      }
    }
    return source;
}

function getBrowser(){
  const ua = navigator.userAgent;

  if (/EdgA|EdgiOS|Edg\//i.test(ua)) 
    return "Microsoft Edge";
  if (/OPR|Opera/i.test(ua)) 
    return "Opera";
  if (/Brave\//i.test(ua)) 
    return "Brave";
  if (/SamsungBrowser/i.test(ua)) 
    return "Samsung Internet";
  if (/UCBrowser/i.test(ua)) 
    return "UC Browser";
  if (/YaBrowser/i.test(ua)) 
    return "Yandex Browser";
  if (/CriOS/i.test(ua)) 
    return "Chrome iOS";
  if (/FxiOS/i.test(ua)) 
    return "Firefox iOS";
  if (/Chrome\/\d+/i.test(ua) && !/Edg|OPR|Brave\//i.test(ua)) 
    return "Chrome";
  if (/Firefox\/\d+/i.test(ua)) 
    return "Firefox";
  if (/Safari\/\d+/i.test(ua) && !/Chrome|Chromium|CriOS|Android/i.test(ua)) 
    return "Safari";
  if (/MSIE |Trident\//i.test(ua)) 
    return "Internet Explorer";
  if (/Android/i.test(ua) && /Version\/\d+/i.test(ua)) 
    return "Android Browser";

  return "Другое";
}

function getDevice(){
  const ua = navigator.userAgent;

  const isTablet = /\b(iPad|Tablet|Tab|PlayBook|Silk|Kindle|Nexus 7|Nexus 9|SM-T|GT-P|Xoom|SCH-I800|Lenovo|FIRE|Pixel C)\b/i.test(ua)
    || (/\bAndroid\b/i.test(ua) && !/\bMobile\b/i.test(ua));

  const isSmartphone = /\b(iPhone|iPod|Android.*Mobile|Windows Phone|IEMobile|BlackBerry|BB10|Mobile)\b/i.test(ua)
    && !isTablet;

  const isDesktop = /\b(Windows NT|Macintosh|Mac OS X|X11|CrOS|Linux x86_64|WOW64|Win64)\b/i.test(ua)
    && !isTablet && !isSmartphone;

  const isOther = !isSmartphone && !isTablet && !isDesktop;

  const devices = {
    smartphone: isSmartphone,
    tablet: isTablet,
    desktop: isDesktop,
    otherDevice: isOther
  };

  for (const device in devices){
    if (devices[device]){
      return device;
    }
  }
}

async function getIp(){
  let result = await makeRequest(`${LEMUR_SITE_URL}/api/client_ip`, "GET", {"Content-Type": "application/json"});
  let ip = await result.json();
  return ip;
}

async function getGeolocation() {
  const storedGeo = sessionStorage.getItem("geolocation");
  
  if (storedGeo) {
    return JSON.parse(storedGeo);
  } 
  else {
    try {
      const result = await makeRequest(`http://ip-api.com/json/${"92.39.217.161"}`, "GET", {"Content-Type": "application/json"});
      const geolocation = await result.json();

      let countryCode = null;
      let region = null;

      if (geolocation.status == "success") {
        countryCode = geolocation.countryCode;
        region = geolocation.region;
      }

      const geoData = { countryCode: countryCode, region: region };
      sessionStorage.setItem("geolocation", JSON.stringify(geoData));
      
      return geoData;
    } 
    catch (error) {
      console.error("Ошибка получения геолокации:", error);
      return { countryCode: null, region: null };
    }
  }
}

async function makeRequest(url, method, headers, bodyData = 0) {
  if (bodyData != 0){
    let result = await fetch(url, {
    method: method,
    headers: headers,
    body: JSON.stringify(bodyData)
    });
    return result;
  }
  else{
    let result = await fetch(url, {
    method: method,
    headers: headers
    });
    return result;    
  }
}

postEvent('eventSiteEntry')
