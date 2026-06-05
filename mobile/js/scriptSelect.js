	function getRadioValue(name)
	{
		var r = document.getElementsByName(name);
		for(var i = 0; i < r.length; i ++)
		{
			if(r[i].checked)
			{
				return r[i].value;
			}
		}
		
		return '';
	}	
	
	function getChkValues(name)
	{
		var retrunValue = "";
		var chkBox = document.getElementsByName(name);
		for(var i = 0; i < chkBox.length; i ++)
		{
			if(chkBox[i].checked){
				
				retrunValue += chkBox[i].value;
				
			}
		}
		
		return retrunValue;
	}
	
	
	function chkBox(name)
	{
		var chkBox = document.getElementsByName(name);
		for(var i = 0; i < chkBox.length; i ++)
		{
			if(chkBox[i].checked) return true;
		}
		
		return false;
	}	
	
	function chkBoxCount(name)
	{
		var cnt = 0;
		var chkBox = document.getElementsByName(name);
		for(var i = 0; i < chkBox.length; i ++)
		{
			if(chkBox[i].checked) cnt++;;
		}
		
		return cnt;
	}	
	
	function getSelValues(name)
	{
				
		var selBox = document.getElementById(name);
		var pars = '';
		for(var i = 0; i < selBox.options.length; i ++)
		{
			if(selBox.options[i].selected == true)
			{
				pars = selBox.options[i].value;
			}
		}
					
		return pars;
	}	
	
	function isNumeric( inStr ) {
	    if (inStr.length > 0) {

	      for (i=0; i < inStr.length; i++) {

			if (!(inStr.charAt(i) >= '0' && inStr.charAt(i) <= '9') ) {
			return false;

			}

	      }

	      return true;
	    }
	    else { return false; }
	}		
	
	function setSelValues(name,ret)
	{
				
		var selBox = document.getElementById(name);
		var pars = '';
		for(var i = 0; i < selBox.options.length; i ++)
		{
			if(selBox.options[i].value == ret)
			{
				selBox.selectedIndex = i;
				return;
			}
		}					
	}	
	
	function setRadioValue(name,ret)
	{
		var r = document.getElementsByName(name);		
		
		for(var i = 0; i < r.length; i ++)
		{
			if(r[i].value == ret)
			{
				r[i].checked = true;
				return;
			}
		}		
	}	
	
	function setChkValues(name,ret)
	{
		var chkBox = document.getElementsByName(name);
		for(var i = 0; i < chkBox.length; i ++)
		{
			if(chkBox[i].value == ret){
				
				chkBox[i].checked = true;
				return;
			}
			else
				chkBox[i].checked = false;
		}
	}				
	
	
	function _snd_twitter(subject, longurl)
	{
		var longURL = longurl;
		var pars = $H({longUrl:longURL}).toQueryString();
		new Ajax.Request('/live/menu/getShortURL.jsp',
		{
			method:'post',
			parameters:pars,
			onComplete:function(data)
			{
				var xml = data.responseXML;
				var shortURL = xml.getElementsByTagName("shortURL")[0].firstChild.nodeValue;
				var twitter_url = 'http://twitter.com/home?status='+subject+encodeURIComponent(shortURL);
				_openSnsWin(twitter_url);

			}
		});

	}

	function _snd_me2day(subject, longurl,tagStr)
	{
		var longURL = longurl;
		var pars = $H({longUrl:longURL}).toQueryString();
		new Ajax.Request('/live/menu/getShortURL.jsp',
		{
			method:'post',
			parameters:pars,
			onComplete:function(data)
			{
				var xml = data.responseXML;
				var shortURL = xml.getElementsByTagName("shortURL")[0].firstChild.nodeValue;
				var me2day_url = 'http://me2day.net/posts/new?new_post[body]='+subject+encodeURIComponent(shortURL)+'&new_post[tags]='+tagStr;
				window.open(me2day_url);
			}
		});


	}	
	
	function _snd_facebook(subject, longurl)
	{
		var longURL = longurl;
		var pars = $H({longUrl:longURL}).toQueryString();
		new Ajax.Request('/live/menu/getShortURL.jsp',
		{
			method:'post',
			parameters:pars,
			onComplete:function(data)
			{
				var xml = data.responseXML;
				var shortURL = xml.getElementsByTagName("shortURL")[0].firstChild.nodeValue;
				var facebook_url = 'http://www.facebook.com/sharer.php?u='+encodeURI(subject)+'&&t='+encodeURIComponent(shortURL);
				window.open(facebook_url);
			}
		});


	}
		
	function _snsSend(type, subject, longurl)
	{			
		var opensns = "";
		
		var longURL = longurl;		
		var pars = $H({longUrl:longURL}).toQueryString();
		new Ajax.Request('/live/menu/getShortURL.jsp',
		{
			method:'post',
			parameters:pars,
			onComplete:function(data)
			{
				var xml = data.responseXML;
				var shortURL = xml.getElementsByTagName("shortURL")[0].firstChild.nodeValue;		
								
				var snsUrl = encodeURI(shortURL);
				var snsCopy = encodeURI("씽크풀");
				var snsTitle = encodeURI(subject);
	
				if(type == "cyworld"){
					opensns += "http://csp.cyworld.com/bi/bi_recommend_pop.php?url="+snsUrl;
					opensns += "&title="+snsTitle;
					_openSnsWin(opensns);
				}else if(type == "facebook"){
					opensns +="http://www.facebook.com/sharer.php?u="+snsUrl;
					opensns += "&t="+snsTitle;
					_openSnsWin(opensns);
				}else if(type == "me2day"){
					opensns += "http://me2day.net/posts/new?new_post[body]=";
					opensns += "\""+snsTitle+"\":"+snsUrl;
					opensns += "&new_post[tags]="+snsCopy;
					_openSnsWin(opensns);
				}else if(type == "twitter"){
					opensns = "http://twitter.com/intent/tweet?text="+snsTitle+"&url="+snsUrl;
					_openSnsWin(opensns);
				}else if(type == "yozm"){
					opensns += "http://yozm.daum.net/api/popup/prePost?link="+snsUrl;
					opensns += "&prefix="+snsTitle;
					_openSnsWin(opensns);
				}				
			}
		});
				
	}
	
	function _openSnsWin(opensns) {
		var winObj;
		winObj = window.open(opensns,"","width=560, height=520, scrollbars=yes, resizable=yes");
	}	