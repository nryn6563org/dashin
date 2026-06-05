 function callMBService()
{
	window.open( '/qbot11/mb/service.jsp?snCust=' + document.getElementById('snCust').value);
}
 
 function callMBMain()
{
	document.location.href = '/qbot11/mb/index.jsp?snCust=' + document.getElementById('snCust').value;
}

 function callMBListMain()
{
	document.location.href = '/qbot11/mb/join_qbot.jsp?snCust=' + document.getElementById('snCust').value;
}

function callMBListMainP()
{
	parent.location.href = '/qbot11/mb/join_qbot.jsp?snCust=' + document.getElementById('snCust').value;
}

 function callMBMyMain()
{
	document.location.href = '/qbot11/mb/my_qbot.jsp?snCust=' + document.getElementById('snCust').value;
}

 function callMBMyMainP()
{
	parent.location.href = '/qbot11/mb/my_qbot.jsp?snCust=' + document.getElementById('snCust').value;
}

function callMBSELLogicStr(logic_str,pos)
{
	document.location.href = "/qbot11/mb/pms_info/T001_C_pre.jsp?snCust="+document.getElementById('snCust').value+"&lgstr="+logic_str+"&pos="+pos;
}

function callMBSELLogic()
{
	document.location.href = "/qbot11/mb/pms_info/T001.jsp?snCust="+document.getElementById('snCust').value+"&pms_code="+document.getElementById('pms_code').value+"&pos=my_qbot";
}

function setMBMainLogic()
{
	var pPms_code = getRadioValue("rdoPms_code");
	
	setMBLogic(pPms_code,"join");
	
	return;
}

function setMBLogic(pPms_code,pos)
{	
	if (document.getElementById('snCust').value == '')
	{
		alert('본 서비스는 퀀트 서비스 신청 후 \n사용 하실 수 있습니다.');
		return;
	}
	else if (pPms_code == '')
	{
		alert('등록할 전략정보가 선택되지 않았습니다.\n다시 시도하여 주세요.');
		return;
	}
	else if (pPms_code ==document.getElementById('pms_code').value)
	{
		alert('해당 전략은 고객님께서 기존에 설정하신 전략입니다.');
		return;
	}
	else
	{
		var goFlag = false;
		if (document.getElementById('pms_code').value == '')
		{
			if (confirm('해당 전략을 등록하시겠습니까?')) {	goFlag = true;	}
			else {	goFlag = false;	}
		}
		else
		{
			if (confirm('등록된 전략이 있습니다.\n변경 등록 하시겠습니까?')) {	goFlag = true;}
			else {	goFlag = false;	}
		}

		if (goFlag)
		{
			
			var idCheckUrl = "https://qbot.thinkpool.com:449/qbot11/pms_info/regLogic_json.jsp";
				
			jQuery.ajax({
				type: 'POST',
				async : false,
				url: idCheckUrl,
				data: {
					pagetype:'json',snCust:document.getElementById('snCust').value,pms_code:pPms_code
				},
				success: function(data){
															
					if(data.rdata == "1")
					{
						alert("전략선택이 완료 되었습니다.");
						if(pos=="tabGbD")	callMBMyMainP();
						else		callMBMyMain();
					}
					else
					{
						if(pos=="tabGbD")	callMBListMainP();
						else	callMBListMain();
					}					
				},
				dataType: "json"
			});
			
			;					
		}
		else
		{
			alert("변경을 취소하셨습니다");
			
			return;
		}
	}
}


function goUrl(combo) {

	if (combo.value != "")
		location.href = combo.value;

}

function showLayer(pIdLayer)
{
	if (document.getElementById(pIdLayer).style.display == 'none')
	{
		document.getElementById(pIdLayer).style.display = 'block';
	}
	else
	{
		document.getElementById(pIdLayer).style.display = 'none';
	}
}


