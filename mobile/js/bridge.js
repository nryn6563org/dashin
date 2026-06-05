/*  글로벌 변수 선언부 시작  */
var kb					= {};					//최상위 전역패키지명
	kb.widget			= {};					//위젯 최상위 패키지명
	kb.widget.scroll	= {};					//UI 스크롤관련 패키지명
	kb.widget.tab		= {};					//UI 탭관련 패키지명
	kb.message			= {};					//메세지 관련 패키지명
	kb.bridge			= {};					//XHTM연동 패키지명
	kb.storage			= {};					//XHTM연동스토리지 패키지명
	kb.user				= {};					//XHTM연동스토리지에 저장된 사용자정보 패키지명
	kb.docinfo			= {};					//PDF등 문서파일 정보

var gServer 		= "http://m.kb.com";	//웹서버 url

var gWebViewHistory = [];					//웹페이지 히스토리 관리용 변수

//var gNamecheckUrl = "http://121.189.63.14/newID/accSupplement/scioutput_mobile.jsp";
var gNamecheckUrl = "https://m.kbsec.co.kr/common/sms/scioutput_mobile.jsp";
/*  글로벌 변수 선언부 종료  */

/*  플랫폼 확인  */
var ptPC = 0;
var ptANDROID = 1;
var ptIPHONE = 2;

var gPlatform = navigator.platform;
var gUserAgent = navigator.userAgent;
var gPhoneType = ptPC;						// 0:pc, 1:android, 2:iphone
if (gUserAgent.indexOf("Android") != -1)	// Andorid
{
	gPhoneType = ptANDROID;
}
else if (gUserAgent.indexOf ("AppleWebKit") != -1 &&
gUserAgent.indexOf ("Mobile") != -1)		// XecureWeb for iPhone
{
	gPhoneType = ptIPHONE;
}

/* #########################UXBridge 패키지 /S ############################*/
var UXBridge = {};
UXBridge.isLock = false;  // only for ios
UXBridge.platform = (function () {
    var userAgent = navigator.userAgent.toLowerCase();
    var flatform = navigator.platform;

    var iPhone = /iPhone/i.test(flatform),
		iPad = /iPad/i.test(flatform),
		iPod = /iPod/i.test(flatform);

    var win = /win/i.test(flatform),
		mac = /mac/i.test(flatform),
		linux = /linux/i.test(flatform),
		iOs = iPhone || iPad || iPod;

    var android = /android/i.test(userAgent);
    return {
        isIos: iOs,
        isWindows: win,
        isMac: mac,
        isLinux: linux,
        isDesktop: win || (!android && linux) || mac,
        iPod: iPod,
        iPhone: iPhone,
        iPad: iPad,
        android: android,
        hasTouch: ('ontouchstart' in window)
    };
})();

UXBridge.toJSONString = function (o, noescape) 
{
    noescape = noescape || false;
    try {
        if (o == null) return "null";
        else if (o.constructor == String) return "\"" + o.escapeString(noescape) + "\"";
        else if (o.constructor == Number) return o.toString();
        else if (o.constructor == Boolean) return o.toString();
        else if (o.constructor == Date) {
            function f(n) { return n < 10 ? '0' + n : n; }
            return '"' + o.getFullYear() + '-' + f(o.getMonth() + 1) + '-' + f(o.getDate()) + ' ' +
                    f(o.getHours()) + ':' + f(o.getMinutes()) + ':' + f(o.getSeconds()) + '"';
        }
        else if (o.constructor.toString() == Array.toString()) {
            var v = [];
            for (var i = 0; i < o.length; i++) v.push(this.toJSONString(o[i], noescape));
            return "[" + v.join(",") + "]";
        }
        else {
            var v = [];
            for (attr in o) {
                if (o[attr] == null) v.push("\"" + attr + "\":null");
                else if (typeof o[attr] == "function");
                else v.push(("\"" + attr.escapeString(noescape) + "\"") + ":" + this.toJSONString(o[attr], noescape));
            }
            return "{" + v.join(",") + "}";
        }
    }
    catch (e) {
        if (e.number == -2147418113) {
            var v = [];
            for (var i = 0; i < o.length; i++) v.push(this.toJSONString(o[i], noescape));
            return "[" + v.join(",") + "]";
        }
    }
};

UXBridge.makeRequestId = function ()
{
	var randomKey = (""+(new Date()).getTime()) + (""+Math.round(Math.random()*10000));
	return randomKey;
};

UXBridge._RequestForiOS = function (requestUrl)
{
    if(UXBridge.isLock)
    {
        var retryRequest = requestUrl;
        window.setTimeout(function(){ UXBridge._RequestForiOS(retryRequest); }, 100);
    }
    else{
		UXBridge.isLock = true;
        document.location = requestUrl;
    }
};

UXBridge.OnResponse = function (requestId, data)
{
	var callback = UXBridge.response[requestId];
    if (callback) {
        window.setTimeout(function () {
            callback.fn.call(callback.scope, data);
            delete UXCommgate.response[requestId];
        }, 0);
    }

}
UXBridge.response = {};
UXBridge.request = function (action, callback, scope) {
	if(!action)return;
	var requestId = UXBridge.makeRequestId();
	if(callback)
	{
		UXBridge.response[requestId] = { "scope": scope || window, "fn": kb.bridge.callback};
	}
    if (UXBridge.platform.android) {
		window.webview.request(requestId, action , "UXBridge.OnResponse");
    }
    else if (UXBridge.platform.isWindows) {
        window.webview.request(requestId, action , "UXBridge.OnResponse");
    }
    else 
    {
		// ios
        var arrReq = [];
        arrReq.push('uxbridge://request?{"requestId":"' + requestId + '",');        
//        arrReq.push('"callback":"' + (sCallback) + '",');
        arrReq.push('"callback":"UXBridge.OnResponse",');
        arrReq.push('"action":' + UXBridge.toJSONString(action || {}, true));
        arrReq.push('}');
        var requestParam = arrReq.join('');

		UXBridge._RequestForiOS(requestParam);
    }
};
/* #########################UXBridge 패키지 /E ############################*/
/* #########################UXCommgate 패키지 /S ############################*/
var UXCommgate = { package: "commgate" };

UXCommgate.response = {};
UXCommgate.push_response = {};

UXCommgate.onCallback = function (requestId, oData) {
    var callback = UXCommgate.response[requestId];
    if (callback) {
        window.setTimeout(function () {
            callback.fn.call(callback.scope, oData);
            delete UXCommgate.response[requestId];
        }, 0);
    }
};

UXCommgate.onPushCallback = function (trcode, oData) {
    var code = oData.shcode;
    var callback_list = UXCommgate.push_response[trcode] || [];
    var _cnt = callback_list.length;
    for (var i = 0; i < _cnt; i++) {
        var callback = callback_list[i];
        callback.fn.call(callback.scope, oData);
    }
};

// trcode : string, trcode
// subscr_id: string, screen id
// param : object, tr param
// callback : function object 
// scope : scope
UXCommgate.connect = function (callback, scope) {

    var requestId = UXBridge.makeRequestId();
    UXCommgate.response[requestId] = { "scope": scope || window, "fn": callback };
    var oParam = {};
    UXBridge.Request(UXCommgate.package, "connect", requestId, oParam, "UXCommgate.onCallback");
    return true;
};

UXCommgate.disconnect = function (callback, scope) {

    var requestId = UXBridge.makeRequestId();
    UXCommgate.response[requestId] = { "scope": scope || window, "fn": callback };
    var oParam = {};
    UXBridge.Request(UXCommgate.package, "disconnect", requestId, oParam, "UXCommgate.onCallback");
    return true;
};

UXCommgate.request = function (trcode, subscr_id, trdata, callback, scope) {

    if (!trcode || !trdata || !callback) return false;
    if (!trdata) return false;
    var requestId = UXBridge.makeRequestId();
    UXCommgate.response[requestId] = { "scope": scope || window, "fn": callback };

    var oParam = {
        "trcode": trcode,
        "subscr_id": subscr_id || "",
        "trdata": trdata
    };

    UXBridge.Request(UXCommgate.package, "request", requestId, oParam, "UXCommgate.onCallback");
    return true;
};

UXCommgate.advise = function (trcode, codes, callback, scope) {

    if (!trcode || !codes || !callback) return false;

    if (!UXCommgate.push_response[trcode])
        UXCommgate.push_response[trcode] = [];
    UXCommgate.push_response[trcode].push({ "scope": scope || window, "fn": callback });
    var requestId = "";

    var oParam = {
        "trcode": trcode,
        "codes": codes
    };

    UXBridge.Request(UXCommgate.package, "advise", requestId, oParam, "UXCommgate.onPushCallback");
    return true;
};

UXCommgate.unadvise = function (trcode, codes) {
    if (!trcode || !codes ) return false;
    var requestId = "";

    var oParam = {
        "trcode": trcode,
        "codes": codes
    };

    UXBridge.Request(UXCommgate.package, "unadvise", requestId, oParam, null);
    return true;
};

UXCommgate.unadviseall = function () {
    var requestId = "";

    UXBridge.Request(UXCommgate.package, "unadviseall", requestId, {}, null);
    return true;
};
/* #########################UXCommgate 패키지 /S ############################*/

var callbackstack = new Object;
/* 내용 추가 */
//TR요청후 실행되는 함수
function OnDataReady(name, value)
{
	//waitcursor 닫기
	setTimeout(function(){
		if(typeof(_waitcursor) == "undefined" || _waitcursor == true)
			waitcursor("end");
	},100);

	try
	{
		if(!value)
			return;
		value = value.replace(/\n/g,"\\n");
		//임시(오류 막기 위함)
		value = value.replace(/\?\,/g,"?\",");
		value = value.replace("\"확인\"","확인");
		var obj = eval("("+value+")");

		//연속조회 관련 셋팅
		if((obj.havenext||"") != "" && (obj.next||"") != ""){	//다음 페이지 조회를 위한 처리
			kb.widget.scroll.setkey("havenext", obj.trcode, obj.havenext);//다음페이지 유무
			kb.widget.scroll.setkey("nextkey", obj.trcode, obj.next);//다음페이지 키값
		}

		if(callbackstack[obj.trcode])
		{
			eval(callbackstack[obj.trcode]+"(obj)");
			callbackstack[obj.trcode] = null;
		}
	}
	catch(ex)
	{
		//alert("[OnDataReady] Error - func : "+callbackstack[obj.trcode] + "\nmsg : "+ex.message);
	}
}	

// callback
kb.bridge.callback = function(data)
{
	//필요가 없어 처리 안함.
}

var _sender = null;
var _senderintervalid = null;
//_sender 초기화
kb.bridge.senderInit = function()
{
	_sender = null;
}

// Bridge Call함수
kb.bridge.call = function(sender)
{
	var type = sender.type.toLowerCase();
	//tr, account, userinfo, changemenu는 제외
	if(type != "tr" && type != "account" && type != "userinfo" && type != "changemenu" && type != "waitcursor")
	{
		//time시간만큼 같은 요청 들어오는 것 막기
		var time = 1000;
		if(_sender)
		{
			var status = false;
			for(elem in sender)
			{
				if(sender[elem] != _sender[elem])
				{
					status = true;
				}
			}
			if(status == false)
			{
				return;
			}
			_sender = sender;
			//기존ID삭제
			if(_senderintervalid)
				clearTimeout(_senderintervalid);
			//time초후 초기화
			_senderintervalid = setTimeout(function(){kb.bridge.senderInit();},time);
		}
		else
		{
			_sender = sender;
			//기존ID삭제
			if(_senderintervalid)
				clearTimeout(_senderintervalid);
			//time초후 초기화
			_senderintervalid = setTimeout(function(){kb.bridge.senderInit();},time);
		}
	}
	

	switch(type)
	{
		case "account" : kb.bridge.call.account(sender); break;
		case "cert" : kb.bridge.call.cert(sender); break;
		case "changemenu" : kb.bridge.call.changemenu(sender); break;
		case "config" : kb.bridge.call.config(sender); break;
		case "connect" : kb.bridge.call.connect(sender); break;
		case "datepicker" : kb.bridge.call.datepicker(sender); break;
		case "keypad" : kb.bridge.call.keypad(sender); break;
		case "movepage" : kb.bridge.call.movepage(sender); break;
		case "pdf" : kb.bridge.call.pdf(sender); break;
		case "phone" : kb.bridge.call.phone(sender); break;
		case "popup" : kb.bridge.call.popup(sender); break;
		case "stockinfo" : kb.bridge.call.stockinfo(sender); break;
		case "searchstock" : kb.bridge.call.searchstock(sender); break;
		case "tr" : kb.bridge.call.tr(sender); break;
		case "userinfo" : kb.bridge.call.userinfo(sender); break;
		case "waitcursor" : kb.bridge.call.waitcursor(sender); break;

		default : break;
	}
}

// DATE PICKER
kb.bridge.call.datepicker = function(sender)
{
	var callback = sender.callback;
	var targetid = sender.targetid;
	var value1 = sender.value1 || $("#"+targetid).text().onlyNumber() || "";
	if(value1.length != 8)
		value1 = "";
	UXBridge.request("callaction('hybrid_datepicker','"+callback+"','"+targetid+"','"+value1+"')", null, this);
}

// TR통신
kb.bridge.call.tr = function(sender)
{
/*
HEADER값 - JSON형태로 넣으면 됨. 단, key값에 '는 빼야 함.
ex) brno:'001',funccode:'C'

* 직접입력 가능항목
"termno":단말번호 (세션 키)
"uid":Login User ID
"brno":지점번호 default:"001"
"lang":K:한국 E:영어 C:중국 J:일본. default:"K"
"rqcnt":요청건수 default:"0000"
"loan":파워론 (1:파워론, 0:사용안함). default:"0"
"commmedia":통신매체 구분
"acgroup":그룹계좌 ID
"funccode": 처리구분. default: 'C'. 조회시 연속조회 설정을 하면 '7'로 변경되어 입력됨.
* 간접입력 항목(직접입력 불가)
"cont": 연속구분. default: 'N', 조회시 연속조회 설정을 하면 'Y'로 변경되어 입력됨.
"contkey": 연속키. default: 'N', 조회시 연속조회 설정을 하면 해당값이 입력됨.
"sendseqno": 전송TR SeqNo. 자동 입력됨.
*/
	var trid = sender.trid;
	var trsubid = sender.trsubid;
	var trsubitems = sender.trsubitems;
	var header = sender.header || "";
	var nextkey = sender.nextkey || "";
	var serverdata = sender.serverdata || "";

	//연속조회 관련 셋팅
	if(kb.widget.scroll.getkey("haveprev", trid) == "Y")//다음페이지 유무
		nextkey = kb.widget.scroll.getkey("prevkey", trid) || "";

	if(nextkey)
		nextkey = ","+nextkey.replace(/\&\#39\;/g,"'");

	var callback = sender.callback;
	var waitcursorstr = "waitcursor(1);";
	if(typeof(_waitcursor) != "undefined" && _waitcursor == false)
		waitcursorstr = "";

	var senddata = serverdata + waitcursorstr + "$senddata('trid',[value],'','',[header]nextkey)";
	var data = new Array;
	for(var i=0; i < trsubid.length; i++)
	{
		if(data.length != 0)
			data.push(',');
		data.push('"'+trsubid[i]+'":');
		data.push(trsubitems[i]);
	}
	senddata = senddata.replace(/trid/,trid);
	senddata = senddata.replace(/value/,data.join(""));
	senddata = senddata.replace(/header/,header);
	senddata = senddata.replace(/nextkey/,nextkey);

	var header = document.getElementById("txtSend");
	if(header)
	{
		header.value += senddata + "\n";
	}

	try
	{
		callbackstack[sender.trid] = sender.callback;
		UXBridge.request(senddata, callback, this);
	}
	catch(ex)
	{
		alert("[kb.bridge.request]:"+ex.message);
	}
}

//서버 통신에 필요한 TR ID등록
kb.bridge.setInfo = function(trlist)
{
	if(typeof(trlist) != "undefined")
	{
		var serverdatastr = 'this.serverdata="trcode"';
		var trtemplate = "code:code:code:tr:json";
		var trcode = new Array;
		for(var i=0; i < trlist.length; i++)
		{
			if(trcode.length != 0)
				trcode.push("~");
			trcode.push(trtemplate.replace(/code/g,trlist[i]));
		}
		serverdatastr = serverdatastr.replace(/trcode/, trcode.join(""));

		try
		{
			UXBridge.request( serverdatastr, kb.bridge.callback, this);
		}
		catch(ex)
		{
			alert("[kb.bridge.request] : " + ex.message);
		}
	}
}

// POPUP
kb.bridge.call.popup = function(sender)
{
	var action = sender.action;
	var callback = sender.callback;
	var url = sender.url || "";
	var codename = sender.codename || "";
	var pagename = sender.pagename || "";
	var popscreenid = sender.popscreenid || "";

	//XHTM popscreen 직접 닫을 경우 예외처리
	if(popscreenid != "" && action == "close")
		url = popscreenid;
	
	//투자정보 체크
	if(action == "s0204")
		UXBridge.request("callaction('hybrid_popup_s0204','"+pagename+"','"+codename+"')");
	else if(action == "s020403")
		UXBridge.request("callaction('hybrid_popup_s020403','"+pagename+"')");
	else
		UXBridge.request("callaction('hybrid_popup','"+action+"','"+url+"','"+callback+"')");

}

// key(title | description), url
kb.docinfo = {
	"집합투자규약|펀드매매-매수" : "http://www.kbsec.co.kr/upload/fnmall/agreeFile/article_{codename}.pdf"
	,"투자설명서|펀드매매-매수" : "http://www.kbsec.co.kr/upload/fnmall/investFile/detail_{codename}.pdf"
	,"간이투자설명서|펀드매매-매수" : "http://www.kbsec.co.kr/upload/fnmall/pointInfoFile/summary_{codename}.pdf"

	,"자동이체(CMS) 약관 확인|펀드-자동이체신청-은행" : "http://www.kbsec.co.kr/upload/fnmall/fundtrad/cms_service_docu.pdf"
	,"자동대체서비스 약관 확인|펀드-자동이체신청-KB" : "http://www.kbsec.co.kr/upload/fnmall/fundtrad/fund_auto_service_docu.pdf"

	,"투자설명서|ELS-청약신청" : "http://bbs.kbsec.co.kr/upload/els/investFile/{codename}.pdf"
	,"간이투자설명서|ELS-청약신청" : "http://bbs.kbsec.co.kr/upload/els/pointInfoFile/{codename}.pdf"
	,"위험고지|ELS-청약신청" : "http://bbs.kbsec.co.kr/upload/els/noticeFile/{codename}.pdf"

	,"투자설명서|장외채권-매수" : "http://www.kbsec.co.kr/fileDownloadAction.action?basePath=upload/fnmall/bond/&fileName={codename}.pdf"
	,"투자설명서|공모주청약-청약신청" : "http://www.kbsec.co.kr/fileDownloadAction.action?basePath=/upload/right&fileName={codename}.pdf"

	,"서비스코드전체보기|고객만족센터-서비스코드전체보기" : "http://down.kbsec.co.kr/download/ARS_MENU.pdf"

	,"개인(신용)정보동의서|금융거래설정" : "http://down.kbsec.co.kr/download/custinfo_rule_2.pdf"
	,"개인(신용)정보동의서|개인(신용)정보 조회동의서" : "http://down.kbsec.co.kr/download/custinfo_rule_3.pdf"
	,"개인(신용)정보동의서|상품서비스 안내" : "http://down.kbsec.co.kr/download/custinfo_rule_4.pdf"
	,"개인(신용)정보동의서|개인(신용)처리방침" : "http://down.kbsec.co.kr/download/custinfo_rule_1.pdf"
	
	,"처음거래시작하기|정회원가입-약관동의" : "http://down.kbsec.co.kr/download/clause/fullmember_clause_all.pdf"

	//,"개인(신용)정보동의서|금융거래설정" : "http://dev.kbsec.co.kr/upload/useinfo/custinfo_rule_2.pdf"
	//,"개인(신용)정보동의서|개인(신용)정보 조회동의서" : "http://dev.kbsec.co.kr/upload/useinfo/custinfo_rule_3.pdf"
	//,"개인(신용)정보동의서|상품서비스 안내" : "http://dev.kbsec.co.kr/upload/useinfo/custinfo_rule_4.pdf"
	//,"개인(신용)정보동의서|개인(신용)처리방침" : "http://dev.kbsec.co.kr/upload/useinfo/custinfo_rule_1.pdf"
	
	
}

// PDF
kb.bridge.call.pdf = function(sender)
{
	var action = "open";
	var pdfurl = sender.pdfurl || "";
	var pdfname = sender.pdfname;
	var codename = sender.codename || "";

	//URL로 바로 보내는 경우 처리
	if(pdfurl == "")
	{
		if(!kb.docinfo[pdfname])
		{
			alert("PDF 정보를 찾을 수 없습니다.");
			return;
		}

		var filename = kb.docinfo[pdfname];
		// 코드명 존재 할 경우
		if(codename)
			filename = filename.replace("{codename}",codename);
		var pdftitle = pdfname.split("|")[0];
		pdfurl = filename;
		//타이틀 셋팅 필요 할 경우
		//kb.storage.set("pdftitle", pdftitle);
		//kb.storage.set("pdfurl", pdfurl);
	}
	if(iphone == true || ipad == true){
		UXBridge.request("callaction('hybrid_popup_pdfviewer','"+pdfurl+"')");
	}else{
		UXBridge.request("callaction('hybrid_pdfviewer','"+pdfurl+"')");
	}
}

// KEYPAD
kb.bridge.call.keypad = function(sender)
{
	var action = sender.action;
	var keypadtype = sender.keypadtype;
	var callback = sender.callback;
	var endcallback = sender.callback;
	var keypadtype = sender.keypadtype;
	var targetid = sender.targetid;
	var value1 = sender.value1 || "";
	var value2 = sender.value2 || "";
	var obj = document.getElementById(targetid);
	var value3 = "";
	var value4 = "";
	var value5 = 0;		//현재 오브젝트키의 위치
	var value6 = 0;		//현재 웹뷰의 전체 높이
	var checkReadonly = false;
	if(obj)
	{
		value3 = obj.getAttribute("maxlength") || "50";
		value4 = obj.value || "";
		value5 = (posY(obj) + obj.offsetHeight) - top.document.body.scrollTop;//window.event.clientY;//window.event.clientY;//posY(obj);
		value6 = top.document.body.clientHeight;
		//readonly 속성일경우
		checkReadonly = obj.getAttribute("readonly") || false;
		if(checkReadonly == "true")
		{
			var widgettype = obj.getAttribute("widgettype");
			if(widgettype != "accountpassword")
				setOutline(targetid, "add");
		}
		//TODO - 키패드가 인풋을 가릴때 좌표계산
		//alert("pageYoffset :" + document.body.scrollTop + " posY : " + posY(obj) + "scrollHeight : " + top.document.body.scrollHeight+ "clientHeight : " + top.document.body.clientHeight+ "offsetHeight : " + top.document.body.offsetHeight);

	}


	var popup = sender.popup || "false";
	if(keypadtype == "password" || keypadtype == "passwordinput")
		callback = "keypad_callback";
	if(action == "open")
		UXBridge.request("callaction('hybrid_keypad','open','"+callback+"','"+endcallback+"','"+targetid+"','"+keypadtype+"','"+value1+"','"+value2+"','"+value3+"','"+value4+"',"+value5+","+value6+")", null, this);
	else if(action == "close")
		UXBridge.request("callaction('hybrid_keypad','close')", null, this);
}

// ACCOUNT
kb.bridge.call.account = function(sender)
{
	var action = sender.action;
	var value1 = sender.value1 || "";
	var value2 = sender.value2 || "";
	var value3 = sender.value3 || "";
	var targetid = sender.targetid;
	var callback = sender.callback;
	if(action == "checkpassword")
		UXBridge.request("callaction('hybrid_account','checkpassword','"+value1+"','"+value2+"','"+value3+"','"+targetid+"','"+callback+"')");
	else if(action == "info")
		UXBridge.request("callaction('hybrid_account','info',\""+value1+"\",\""+value2+"\",'"+value3+"','"+targetid+"','"+callback+"')");
	else if(action == "password")
		UXBridge.request("callaction('hybrid_account','password','"+value1+"','"+value2+"','"+value3+"','"+targetid+"','"+callback+"')");
}

// ACCOUNT
kb.bridge.call.userinfo = function(sender)
{
	var action = sender.action;
	var callback = sender.callback;
	var key = sender.key || "";
	var value = sender.value || "";
	UXBridge.request("callaction('hybrid_userinfo','"+callback+"','"+action+"','"+key+"','"+value+"')");
}

// STOCK
kb.bridge.call.stockinfo = function(sender)
{
	var callback = sender.callback;
	var action = sender.action;
	var code = sender.code || "";
	var value1 = sender.value1 || "";
	var value2 = sender.value2 || "";
	var value3 = sender.value3 || "";
	UXBridge.request("callaction('hybrid_stockinfo','"+callback+"','"+action+"','"+code+"','"+value1+"','"+value2+"','"+value3+"')");
}

// SEARCH STOCK
kb.bridge.call.searchstock = function(sender)
{
	var value1 = sender.value1;
	var value2 = sender.value2;
	UXBridge.request("callaction('hybrid_searchstock','"+value1+"','"+value2+"')");
}

// KEYPAD
kb.bridge.call.changemenu = function(sender)
{
	var value1 = sender.value1;
	var value2 = sender.value2 

	UXBridge.request("callaction('hybrid_changemenu','"+value1+"','"+value2+"')");
}

// PHONE
kb.bridge.call.phone = function(sender)
{
	var value1 = sender.value1;

	UXBridge.request("callaction('hybrid_phone','"+value1+"')");
}

// 환경설정
kb.bridge.call.config = function(sender)
{
	var action = sender.action;
	var callback = sender.callback || "";
	var value1 = sender.value1 || "";
	var value2 = sender.value2 || "";

	UXBridge.request("callaction('hybrid_config','"+action+"','"+callback+"','"+value1+"','"+value2+"')");
}

// XHTM 이용하여 페이지 이동
kb.bridge.call.movepage = function(sender)
{
	var action = sender.action;
	var value1 = sender.value1 || "";
	var value2 = sender.value2 || "";
	var value3 = sender.value3 || "";

	UXBridge.request("callaction('hybrid_movepage','"+action+"','"+value1+"','"+value2+"','"+value3+"')");
}

// WAITCURSOR 호출
kb.bridge.call.waitcursor = function(sender)
{
	var action	 = sender.action;
	var timeryn  = sender.timeryn;
	UXBridge.request("callaction('hybrid_waitcursor','"+action+"','"+timeryn+"')");
}

// CONNECTION 관련
kb.bridge.call.connect = function(sender)
{
	var action = sender.action;
	UXBridge.request("callaction('hybrid_connect','"+action+"')");
}

// 인증서
kb.bridge.call.cert = function(sender)
{
	/* KB_MTS_API_Reference 최신버전 참조*/
	var action = sender.action;
	var callback = sender.callback || "";
	var value1 = sender.value1 || "";
	var value2 = sender.value2 || "";
	var value3 = sender.value3 || "";
	var value4 = sender.value4 || "";

	UXBridge.request("callaction('hybrid_cert','"+action+"','"+callback+"','"+value1+"','"+value2+"','"+value3+"','"+value4+"')", null, this);
}
//임시아이디비밀번호초기화변수 가져오기
kb.bridge.call.pwdyn = function()
{
	UXBridge.request("callaction('hybrid_pwdyn')");
}