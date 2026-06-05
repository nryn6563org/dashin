// --------------------------------------------------------------------
// dropdown : div 레이어를 이용한 selectbox 관련 소스 /S line 1 ~ 214
// ====================================================================
(function($){
	$.widget( "mobile.dropdown", $.mobile.widget, {
		options: {
			url: null,
			height: 200,
			scroll: false,
			onChanged: function(){},
			itemWidth: 0,
			itemHeight: 0
		},
		_create: function(inittype){
			this.el = this.element;
			//var w = this.el.width();
			//this.el.find('div').eq(0).width(w - 105);
			
			this.init(inittype);
		},
		init: function(inittype){

			if(inittype != "refresh")
			{
				this.el.addClass('ui-dropdown');
				// 초기 SUB DIV 추가 없이 동작하도록 추가함. /S  by kks
				this.el.append("<div/>");
				// 초기 SUB DIV 추가 없이 동작하도록 추가함. /E  by kks
			}
				this.contain = $('<div>', {
					'class': 'ui-dropdown-contain'
				});
			this.data_list = $('<div class="ui-dropdown-list" />');
			
			var data_ul = $('<ul />'), list = [];
			var list = $.map(this.options.data, function(val, i){
				var html = [
		            '<li drop_val="'+val.value+'" drop_name="'+val.name+'">',
		            	val.name,
		            '</li>'
				];

				return html.join('');
			});
			// defaultData 관련 추가 /S  by kks
			var defaultData = this.options.defaultData;
			if(this.options.defaultData){
				data_ul.html('<li drop_val="'+defaultData.value+'" drop_name="'+defaultData.name+'">' + defaultData.name + '</li>');
				data_ul.append(list.join(''));

			}else{
				data_ul.html(list.join(''));
			}
			
			// defaultData 관련 추가 /E  by kks

			this.data_list.append(data_ul);
			this.contain.append(this.data_list);
			
			$(document.body).append(this.contain);
			
			if(this.options.itemHeight){
				this.data_list.height(this.options.itemHeight);
			}

			var clickstr = "vclick";
			if(gPlatform == "Win32" || iphone == true || ipad == true){
				clickstr = "click";
			}

			this.contain.off(clickstr).on(clickstr, {me: this}, function(e){
				var me = e.data.me;
				me.hide();
				return false;
			});
			
			if(this.options.selectedName){
				this.el.children(':first-child').html(this.options.selectedName);
			}
			
			if(this.options.selectedValue){
				this.el.val(this.options.selectedValue);
			}

			this.el.off(clickstr).on(clickstr, {me: this}, function(e){
				var me = e.data.me;
				me.show();
				return false;
			});

			//data_ul.children('li').off('taphold').on('taphold', function(){
			//누르는 즉시 변경해달라고 요청옴
			data_ul.children('li').off('vmousedown').on('vmousedown', function(){
				// 기존값 초기화
				for(var i=0; i < data_ul.find('li').length; i++)
				{
					var elem = data_ul.find('li')[i];
					$(elem).removeClass("active");
				}
				
				$(this).addClass('active');
				return true;
			});

			data_ul.children('li').off('mouseup').on('mouseup', {me: this}, function(e){
				$(this).removeClass('active');
				return false;
			});
			
			//***** 에뮬레이터와 휴대폰 클릭시 항목 선택안되는 문제로 인해 두가지 이벤트로 구분해서 처리 - S - 2013.02.13

			data_ul.find('li').off(clickstr).on(clickstr, {me: this}, function(e){

				var me = e.data.me;
				me.select(this);
				return false;
			});
			//***** 에뮬레이터와 휴대폰 클릭시 항목 선택안되는 문제로 인해 두가지 이벤트로 구분해서 처리 - E -  2013.02.13

			if(this.options.itemWidth){
				this.data_list.width(this.options.itemWidth + 2);
			}else{
				this.data_list.width(this.el.width() + 2);
			}
		},
		refresh: function(data, d){
			this.data_list.remove();
			this.contain.remove();
			if(d){
				this.options.data = data;
				this.options.selectedValue = d.selectedValue;
				this.options.selectedName = d.selectedName;

			}else{
				this.options.data = data;
			}
			
			this._create("refresh");
		},
		show: function(){
			//top 10만큼 띄움(디자인)
			var gap = 10;
			var offset = this.el.offset();
			var toppos = offset.top + this.el.height() + gap;
			var listheight = this.options.height;

			this.data_list.css({
				left: offset.left,
				top: toppos
			});

			//넓이 재구성
			this.data_list.width(this.el.width() + 2);

			//스크롤이 화면 넘어갔는지 체크 및 위치 재조정
			var scrollheight = $(window).height() + $(window).scrollTop();//scroll높이로 변경해야 함.
			var movepos = 0;
			var data_listheight = this.data_list.height();
			if(scrollheight < toppos + data_listheight)
				movepos = (toppos + data_listheight) - scrollheight + gap + 10 ;

			if(movepos != 0)
			{
				toppos -= movepos;
				this.data_list.css({
					left: offset.left,
					top: toppos
				});
			}
			//배경 높이 지정 추가 후 보여지도록 수정
			this.contain.height(top.document.body.scrollHeight);
			this.contain.show();

			// 선택값
			var selectedValue = this.el.val();
			// 선택값 활성화
			for(var i=0; i < this.data_list.find('ul li').length; i++)
			{
				var elem = this.data_list.find('ul li')[i];
				var elemValue = $(elem).attr("drop_val");
				if(selectedValue == elemValue)
				{
					$(elem).addClass("active");
					if(this.scroll){
						this.scroll.scrollToElement(elem, 100);
					}
				}
				else
					$(elem).removeClass("active");
			}
			if(this.data_list.height() > listheight){
				if(this.scroll){
					this.scroll.refresh();
				}else{
					this.data_list.height(listheight+1).addClass("c-scroll-abled");
				
					this.scroll = new iScroll(this.data_list.get(0), { bouncetop:false, bouncebottom:false, hScrollbar: false, vScrollbar: true, fadeScrollbar: true, hideScrollbar: true});
				}
			}
		},
		hide: function(){
			this.contain.hide();
		},
		getValue: function(){
			return this.el.val();
		},
		select: function(li){
			li = $(li);
			var val = li.attr('drop_val');
			var name = li.attr('drop_name');
			this.el.val(val);
			
			if(this.options.type !== 'button'){
				this.el.children('div').get(0).innerHTML = name;
			}
			this.contain.hide();
			
			if(this.options.onChanged){
				this.options.onChanged.call(this.el.get(0), val, name);
			}
		},
		selectByIndex: function(index){
			var li = this.data_list.find('li').eq(index);
			var val = li.attr('drop_val');
			var name = li.attr('drop_name');

			//값이 없을 경우 셋팅안함
			if(!val || !name)
			{
				return;
			}

			this.el.val(val);
			this.el.children('div').get(0).innerHTML = name;
			this.contain.hide();
			
			return val;
		},
		selectByValue: function(value){
			var li = this.data_list.find('li[drop_val=' + value + ']');
			var val = li.attr('drop_val');
			var name = li.attr('drop_name');
			//값이 없을 경우 0번째 index값으로 셋팅함
			if(!val || !name)
			{
				li = this.data_list.find('li').eq(0);
				val = li.attr('drop_val');
				name = li.attr('drop_name');
			}

			this.el.val(val);
			this.el.children('div').get(0).innerHTML = name;
			this.contain.hide();
			
			return val;
		},
		disable: function(){
			var clickstr = "vclick";
			if(gPlatform == "Win32" || iphone == true || ipad == true){
				clickstr = "click";
			}
			this.el.addClass("ui-dropdown-disable");
			this.el.off(clickstr);
		},
		enable: function(){
			var clickstr = "vclick";
			if(gPlatform == "Win32" || iphone == true || ipad == true){
				clickstr = "click";
			}
			this.el.removeClass("ui-dropdown-disable");
			//this._create();
			this.el.off(clickstr).on(clickstr, {me: this}, function(e){
				var me = e.data.me;
				me.show();
				return false;
			});
		}
	});
})(jQuery);
// --------------------------------------------------------------------
// dropdown : div 레이어를 이용한 selectbox 관련 소스 /E line 1 ~ 214
// ====================================================================


// --------------------------------------------------------------------
// 스크롤러 관련 소스 /S line 217 ~ line 1010
// ====================================================================
// 스크롤러 셋팅
kb.widget.scroll = function(_scrolldata)
{
	//연속조회 관련 셋팅
	var nextkeytr = _scrolldata.nextkeytr || "";
	var haveprev = kb.widget.scroll.getkey("haveprev", nextkeytr) || "";
	var havenext = kb.widget.scroll.getkey("havenext", nextkeytr) || "";
	var nextkey = kb.widget.scroll.getkey("nextkey", nextkeytr) || "";

	// 연속조회 구분
	if(haveprev == "Y")
	{
		var id = _scrolldata.targetid || "";
		var data = _scrolldata.scrolldata || "";
		kb.widget.scroll.insert(id, data);
		kb.widget.scroll.refresh();
		kb.widget.scroll.setkey("haveprev", nextkeytr, havenext);
		kb.widget.scroll.setkey("prevkey", nextkeytr, nextkey);
	}
	else if(haveprev == "")
	{
		kb.widget.scroll.setScroll(_scrolldata);
		kb.widget.scroll.setkey("haveprev", nextkeytr, havenext);
		kb.widget.scroll.setkey("prevkey", nextkeytr, nextkey);
	}
}

//스크롤별 분기
kb.widget.scroll.setScroll = function(_scrolldata)
{
	kb.widget.scroll.obj = {};
	var scrolldata = _scrolldata.scrolldata;
	var fixedcolumn = _scrolldata.fixedcolumn;
	var scrolltype = _scrolldata.scrolltype;
	if(typeof(scrolldata) == "undefined")
		kb.widget.scroll._makeNormalScroller(_scrolldata, "normal");
	else if(typeof(fixedcolumn) != "undefined")
		kb.widget.scroll._makeLeftFixedScroller(_scrolldata, "leftfixed");
	else if(typeof(scrolltype) != "undefined" && scrolltype == "none")
		kb.widget.scroll._makeNoneScroller(_scrolldata, "none");
	else
		kb.widget.scroll._makeEndlessScroller(_scrolldata, "endless");
}

// 스크롤러 기본값
kb.widget.scroll.defaultSetting = {
	'background':'#FFFFFF',							//스크롤시 배경색
	'wrapperborder':'border:1px solid #AAAAAA',		//스크롤러 테두리
	'leftarrowimg':'http://img.thinkpool.com/concert/qbot/qbot11/mb/images/arrow_left.png',		//고정열 좌측화살표
	'rightarrowimg':'http://img.thinkpool.com/concert/qbot/qbot11/mb/images/arrow_right.png',	//고정열 우측화살표
	'arrowwidth':9,									//고정열 화살표 넓이
	'arrowheight':15								//고정열 화살표 높이
}

kb.widget.scroll.init = function(id, headertemplateid, displaycolumn)
{
	// TODO - fixed grid처리 해야 함
	id = id || "divGrid";
	var gridObj = document.getElementById(id);

	// 처음 로딩 시 attribute 추가
	gridObj.headertemplateid = gridObj.headertemplateid || headertemplateid;
	gridObj.displaycolumn = gridObj.displaycolumn || displaycolumn;

	var templateObj = document.getElementById(gridObj.headertemplateid);
	if(!templateObj)
		alert("template 로딩 에러");
	gridObj.innerHTML = templateObj.innerHTML;

	if(gridObj.displaycolumn)
	{
		//고정열 존재하는 경우 처리

		// display열 기준으로 template 넓이 재계산
		var headertemplateObj = gridObj.querySelector("table");
		var headercollist = headertemplateObj.querySelectorAll("col");
		var availableWidth = gridObj.clientWidth;
		var displaycolumn = parseInt(gridObj.displaycolumn, 10) || 2;

		//index재정의(colspan/rowspan처리위함)
		kb.widget.scroll.setCellIndex(headertemplateObj);

		//전체 넓이 구하기
		var colwidth = 0;
		for(var i=0; i < headercollist.length; i++)
		{
			if(i >= displaycolumn)
				break;
			colwidth += parseInt(headercollist[i].width);
		}
		var totalwidth = parseInt(availableWidth/colwidth*100,10);

		//넓이 재적용
		for(var i=0; i < headercollist.length; i++)
		{
			var colObj = headercollist[i];
			colObj.width = parseInt(totalwidth * parseInt(colObj.width,10)/100,10) + "px";
		}

		//좌측 고정 제목 삭제
		for(var i=0; i < headertemplateObj.rows.length; i++)
		{
			var row = headertemplateObj.rows[i];
			var celllength = row.cells.length;
			var cellindex = row.cells[celllength-1].currentCellIndex;
			var cellgap = cellindex - (celllength-1);
			for(var m=celllength-1; m >= displaycolumn - cellgap; m--)
			{
				row.removeChild(row.cells[m]);
			}
		}

	}
	else
	{
		//일반 경우 처리
		//var templateObj = document.getElementById(headertemplateid);
		//gridObj.innerHTML = templateObj.innerHTML;
	}

	//iscroll존재 할 경우 삭제
	kb.widget.scroll.remove(id);
}

// 테이블 넓이 재조정
kb.widget.scroll.recalc = function(id, type)
{
	if(type == "normal")
	{
		try
		{
			var targetid = id;
			var headerid = targetid+"_header";
			var contentsid = targetid+"_contents";
			var headerObj = document.getElementById(headerid);
			var contentsObj = document.getElementById(contentsid);

			//해더없는 경우(normal type)
			if(!headerObj || !contentsObj)
				return;

			var contentsTrObj = contentsObj.querySelector("table>tbody>tr");
			var headerColgroupObj = headerObj.querySelector("colgroup");
			if(!contentsTrObj || !headerColgroupObj)
				return;
			for(var i=0; i < contentsTrObj.children.length; i++)
			{
				var clientwidth = contentsTrObj.children[i].clientWidth;
				if(clientwidth > 0)
				{
					headerColgroupObj.children[i].width = clientwidth + "px";
				}
			}
		}
		catch(ex){
			//alert(ex.message);
		}
	}
	else if(type == "fixed")
	{
		try
		{
			var targetid = id;
			var fixedheaderid = targetid+"_fixedHeader";
			var flexableheaderid = targetid+"_flexableHeader";
			var fixedwrapperid = targetid+"_fixedWrapper";
			var flexablewrapperid = targetid+"_flexableWrapper";
			var containsersublistid = targetid+"_list";

			var headerLeftObj = document.getElementById(fixedheaderid);
			var headerRightObj = document.getElementById(flexableheaderid);
			var contentsLeftObj = document.getElementById(fixedwrapperid);
			var contentsRightObj = document.getElementById(flexablewrapperid);

			var headerRightScrollerObj = headerRightObj.querySelector("div");
			var contentsLeftScrollerObj = contentsLeftObj.querySelector("div");
			var contentsRightScrollerObj = contentsRightObj.querySelector("div");

			var headerLeftTableObj = headerLeftObj.querySelector("table");
			var headerRightTableObj = headerRightScrollerObj.querySelector("table");
			var contentsLeftTableObj = contentsLeftScrollerObj.querySelector("table");
			var contentsRightTableObj = contentsRightScrollerObj.querySelector("table");

			//좌측
			var contentsLeftTableTrObj = contentsLeftScrollerObj.querySelector("table>tbody>tr");
			var headerLeftTableColgroupObj = headerLeftObj.querySelector("colgroup");
			for(var i=0; i < contentsLeftTableTrObj.children.length; i++)
			{
				var clientwidth = contentsLeftTableTrObj.children[i].clientWidth;
				if(clientwidth > 0)
				{
					headerLeftTableColgroupObj.children[i].width = clientwidth + "px";
				}
			}
			//우측
			var contentsRightTableTrObj = contentsRightScrollerObj.querySelector("table>tbody>tr");
			var headerRightTableColgroupObj = headerRightScrollerObj.querySelector("colgroup");
			for(var i=0; i < contentsRightTableTrObj.children.length; i++)
			{
				var clientwidth = contentsRightTableTrObj.children[i].clientWidth;
				if(clientwidth > 0)
				{
					headerRightTableColgroupObj.children[i].width = clientwidth + "px";
				}
			}
		}
		catch(ex){}
	}
}

// 스크롤 재계산
kb.widget.scroll.refresh = function(id)
{
	if(id)
		eval(kb.widget.scroll.obj[id].refresh());
	else
	{
		for(elem in kb.widget.scroll.obj)
		{
			if(typeof(kb.widget.scroll.obj[elem]) == "object" && elem != "refresh")
			{
				var htmlObj = document.getElementById(elem);
				//넓이 재조정 로직 추가
				if(elem.indexOf("_") != -1)
				{
					/*
					divGrid_fixedWrapper
					divGrid_flexableWrapper
					divGrid_flexableHeader
					*/
					//반복계산 방지 위해 1번만 수행하게 함.
					if(elem.indexOf("_flexableWrapper") == -1 && elem.indexOf("_flexableHeader") == -1)
					{
						var targetid = elem.split("_")[0];
						kb.widget.scroll.recalc(targetid, "fixed");
					}
				}
				else
				{
					kb.widget.scroll.recalc(elem, "normal");
				}

				//fixedColumn이 0일경우 처리, 화면에 없을 경우 처리
				if(htmlObj && htmlObj.style && htmlObj.style.display != "none"
				&& htmlObj.clientWidth != 0)
				{
					eval(kb.widget.scroll.obj[elem].refresh());
				}
			}
		}
	}
}

// 삭제
kb.widget.scroll.remove = function(id)
{
	if(id)
	{
		if(kb.widget.scroll.obj && kb.widget.scroll.obj[id])
			eval(kb.widget.scroll.obj[id] = null);
	}
	else
	{
		for(elem in kb.widget.scroll.obj)
		{
			eval(kb.widget.scroll.obj[elem] = null);
		}
		kb.widget.scroll.obj = {};
	}
}

//연속조회 관련 변수
kb.widget.scroll.haveprev = new Object;		//이전다음페이지 유무
kb.widget.scroll.prevkey = new Object;		//이전페이지 키값
kb.widget.scroll.havenext = new Object;		//다음페이지 유무
kb.widget.scroll.nextkey = new Object;		//다음페이지 키값

//연속키관련(get key)
kb.widget.scroll.getkey = function(type, trid)
{
	var value = "";
	if(type == "haveprev")
		value = kb.widget.scroll.haveprev[trid] || "";//이전다음페이지 유무
	else if(type == "prevkey")
		value = kb.widget.scroll.prevkey[trid] || "";//이전페이지 키값
	else if(type == "havenext")
		value = kb.widget.scroll.havenext[trid] || "";//다음페이지 유무
	else if(type == "nextkey")
		value = kb.widget.scroll.nextkey[trid] || "";//다음페이지 키값
	return value;
}
//연속키관련(set key)
kb.widget.scroll.setkey = function(type, trid, value)
{
	if(type == "haveprev")
		kb.widget.scroll.haveprev[trid] = value;//이전다음페이지 유무
	else if(type == "prevkey")
		kb.widget.scroll.prevkey[trid] = value;//이전페이지 키값
	else if(type == "havenext")
		kb.widget.scroll.havenext[trid] = value;//다음페이지 유무
	else if(type == "nextkey")
		kb.widget.scroll.nextkey[trid] = value;//다음페이지 키값
}

// 데이터 추가
kb.widget.scroll.insert = function(targetid, data){
	var target = document.getElementById(targetid);
	var templateid = target.contentstemplateid;
    var template = document.getElementById(templateid).innerHTML;

    for(var i=0; i < data.length; i++)
    {
		kb.widget.scroll.insertGridData(targetid, data[i], template);
    }	
}

// 데이터 추가(실제)
kb.widget.scroll.insertGridData = function(targetid, data, template){

	//컨텐츠영역 테이블
	var targetObj = document.getElementById(targetid);
	var scrolltype = targetObj.scrolltype;

	//마지막 표시 할지?
	if(data.length == 0)
		return;
	if(scrolltype == "endless")
	{
		var gridObj = document.getElementById(targetid+"_contentsscroll").children[0];
		for(var elem in data)
		{
			//변수 정규식 처리 안되어 루프 처리
			var replaceStr = '{'+elem+'}';
			while(template.indexOf(replaceStr) != -1)
			{
				template = template.replace(replaceStr,data[elem]);
			}
		}

		//복사 할 데이터 객체 형태로 생성
		var tempdiv = document.createElement("DIV");
		tempdiv.innerHTML = template;
		var rows = tempdiv.querySelectorAll("table>tbody>tr");

		var contentsObj = document.getElementById(targetid+"_contents");
		var tableobj = contentsObj.querySelector("table");
		var tbodyobj = contentsObj.querySelector("tbody");

		var tablerows = tableobj.rows.length;
		var term = rows.length*2;
		//row 색 번갈아 표시 있을 경우 처리
		if(tablerows % term == 0)
			template = template.replace(/alterclass1/g,"class");
		else
			template = template.replace(/alterclass2/g,"class");
		tempdiv.innerHTML = template;

		rows = tempdiv.querySelectorAll("table>tbody>tr");
		for(var i=0; i < rows.length; i++)
		{
			tbodyobj.appendChild(rows[i].cloneNode(true));
		}

		//초기화
		tempdiv.innerHTML = "";
	}
	else if(scrolltype == "leftfixed")
	{
		var fixedColumn = targetObj.fixedcolumn;
		var fixedwrapper = document.getElementById(targetid+"_fixedWrapper");
		var flexablewrapper = document.getElementById(targetid+"_flexableWrapper");
		var fixedwrapperGridObj = fixedwrapper.querySelector("table");
		var flexablewrapperGridObj = flexablewrapper.querySelector("table");

		for(var elem in data)
		{
			//변수 정규식 처리 안되어 루프 처리
			var replaceStr = '{'+elem+'}';
			while(template.indexOf(replaceStr) != -1)
			{
				template = template.replace(replaceStr,data[elem]);
			}
		}

		//복사 할 데이터 객체 형태로 생성
		var tempdiv1 = document.createElement("DIV");
		tempdiv1.innerHTML = template;

		//template 파일 변경
		var rows = tempdiv1.querySelectorAll("table>tbody>tr");
		var tablerows = flexablewrapperGridObj.rows.length;
		var term = rows.length*2;
		//row 색 번갈아 표시 있을 경우 처리
		if(tablerows % term == 0)
			template = template.replace(/alterclass1/g,"class");
		else
			template = template.replace(/alterclass2/g,"class");
		tempdiv1.innerHTML = template;

		var temptblobj1 = tempdiv1.children[0];
		//index재정의(colspan/rowspan처리위함)
		kb.widget.scroll.setCellIndex(temptblobj1);

		//좌측 고정 내용 삭제
		var rows = tempdiv1.querySelectorAll("table>tbody>tr");
		for(var i=0; i < rows.length; i++)
		{
			var celllength = rows[i].cells.length;
			for(var m=celllength-1; m >= 0; m--)
			{
				var cellindex = rows[i].cells[m].currentCellIndex;
				if(fixedColumn > cellindex)
					break;
				rows[i].removeChild(rows[i].cells[m]);
			}
		}

		//생성한 데이터 추가
		var tbodyobj = fixedwrapperGridObj.querySelector("tbody");
		for(var i=0; i < rows.length; i++)
		{
			tbodyobj.appendChild(rows[i].cloneNode(true));
		}
		
		//초기화
		tempdiv1.innerHTML = "";

		var tempdiv2 = document.createElement("DIV");
		tempdiv2.innerHTML = template;
		var temptblobj2 = tempdiv2.children[0];
		//index재정의(colspan/rowspan처리위함)
		kb.widget.scroll.setCellIndex(temptblobj2);

		// 우측 스크롤 내용 삭제
		var rows2 = tempdiv2.querySelectorAll("table>tbody>tr");
		for(var i=0; i < rows2.length; i++)
		{
			var celllength = rows2[i].cells.length;
			for(var m=0; m < celllength-1; m++)
			{
				rows2[i].removeChild(rows2[i].cells[0]);
				var cellindex = rows2[i].cells[m].currentCellIndex;
				if(fixedColumn <= cellindex)
					break;
			}
		}
		
		//생성한 데이터 추가
		var tbodyobj = flexablewrapperGridObj.querySelector("tbody");
		for(var i=0; i < rows2.length; i++)
		{
			tbodyobj.appendChild(rows2[i].cloneNode(true));
		}
		
		//초기화
		tempdiv2.innerHTML = "";
	}
}

// ROW/CELL INDEX를 할당해주는 함수.
kb.widget.scroll.setCellIndex = function(tblObj)
{
	// table matrix 구성
	var tableMatrix = new Array;

	// table matrix 생성
	var rows = tblObj.querySelectorAll("table>tbody>tr");
	if(rows.length == 0)
		rows = tblObj.querySelectorAll("table>thead>tr");
	for(var i=0; i < rows.length; i++)
	{
		tableMatrix[i] = new Array;	
	}

	for(var i=0; i < rows.length; i++)
	{
		var currentRowIndex = 0;
		for(var k=0; k < rows[i].cells.length; k++, currentRowIndex++)
		{
			var cell = rows[i].cells[k];
			var rowSpan = cell.rowSpan;
			var colSpan = cell.colSpan;
			
			// 현재 CELL에 값이 존재 할 경우
			while(tableMatrix[i][currentRowIndex] != undefined)
				currentRowIndex++;
			
			// 현재 CELL에 실제 위치에 대한 INDEX 부여
			tableMatrix[i][currentRowIndex] = "-";
			rows[i].cells[k].currentRowIndex = i;
			rows[i].cells[k].currentCellIndex = currentRowIndex;
			
			// rowSpan이 존재 할 경우
			while(rowSpan > 1)
			{
				rowSpan--;
				tableMatrix[i+rowSpan][currentRowIndex] = "-";
			}
			// colSpan이 존재 할 경우
			while(colSpan > 1)
			{
				colSpan--;
				tableMatrix[i][currentRowIndex+colSpan] = "-";
				currentRowIndex++;
			}
		}
	}
}

//스크롤만 있는 경우
kb.widget.scroll._makeNormalScroller = function(_scrolldata, scrolltype)
{
	//wrapper 기본 스타일
	var contentsheight = _scrolldata.height || "100%";
	if(contentsheight != "100%")
		contentsheight = "height:"+_scrolldata.height+";";
	var contentsstyle = "position:relative;overflow:auto;height:0px;";
	var contentsbackground = _scrolldata.background || "background:"+kb.widget.scroll.defaultSetting.background+";";
	var contentswrapperborder = "";//_scrolldata.wrapperborder || kb.widget.scroll.defaultSetting.wrapperborder+";";
	contentsstyle += contentsbackground + contentswrapperborder + contentsheight;

	var targetid = _scrolldata.targetid;
	var targetObj = document.getElementById(targetid);
	targetObj.style.cssText = contentsstyle;
	var scrollObj = document.createElement("DIV");
	scrollObj.id = targetid + "_scroll";
	var targetObjlen = targetObj.children.length;
	var hscrollbar = _scrolldata.hscrollbar || "true";
	var vscrollbar = _scrolldata.vscrollbar || "true";

	//SWAP위해서 2번 사용 - TODO - insertBefore오류??
	var tempObj = document.createElement("DIV");
	for(var i=targetObjlen-1; i >= 0 ; i--)
	{
		tempObj.appendChild(targetObj.children[i]);
	}
	for(var i=targetObjlen-1; i >= 0 ; i--)
	{
		scrollObj.appendChild(tempObj.children[i]);
	}
	tempObj = null;

	targetObj.appendChild(scrollObj);

	//하단영역까지 높이 자동 조정
	if(contentsheight == "100%")
	{
		var availHeight = $(window).height();//document.body.clientHeight;
		var targetHeight = targetObj.clientHeight;
		var leftY = posY(targetObj);

		var paddingBottom = 5;//TODO - 기본값 셋팅
		var tempObj = targetObj.parentNode;
		for(var i=0; i<50; i++)
		{
			paddingBottom += parseInt($(tempObj).css('padding-bottom'),10) || 0;
			//paddingBottom += parseInt($(tempObj).css('padding-top'),10) || 0;
			if(!tempObj || !tempObj.parentNode)
				break;
			tempObj = tempObj.parentNode;
		}
		targetObj.style.height = (availHeight - leftY - paddingBottom).toString() + "px";
		//안드로이드 2.x버전에서 영역 안구해지는 문제로 임시 추가
		if(parseInt(targetObj.style.height,10) == 0)
			targetObj.style.height = "80%";
	}
	//스크롤바 제어
	var hscrollbarstr = "";
	var vscrollbarstr = "";
	if(hscrollbar.toLowerCase() == "false")
		hscrollbarstr = ",hScrollbar:false";
	if(vscrollbar.toLowerCase() == "false")
		vscrollbarstr = ",vScrollbar:false";

	var iscrollobj;
	iscrollobj = "kb.widget.scroll.obj." + targetid + " = new iScroll(targetid, {\
		onBeforeScrollStart: function (e) {\
				var target = e.target;\
				while (target.nodeType != 1) target = target.parentNode;\
				if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA')\
					e.preventDefault();\
					e.stopPropagation();\
				},\
		bounceleft : false,bounceright : false";
	iscrollobj += hscrollbarstr;
	iscrollobj += vscrollbarstr;
	iscrollobj += "});";
	
    eval(iscrollobj);
	//scroll refresh
	setTimeout(function(){kb.widget.scroll.refresh()},300);
	setTimeout(function(){kb.widget.scroll.refresh()},1000);
}

//스크롤 없는 형식
kb.widget.scroll._makeNoneScroller = function(_scrolldata, scrolltype)
{
    if(!_scrolldata || !_scrolldata.targetid || !_scrolldata.scrolldata
		 || !_scrolldata.headertemplate || !_scrolldata.contentstemplate)
    {
        alert("scroll데이터가 올바르지 않습니다.");
        return;
    }

	//wrapper 기본 스타일
	var contentsheight = _scrolldata.height || "100%";
	if(contentsheight != "100%" && contentsheight.indexOf("-") == -1)
		contentsheight = "height:"+_scrolldata.height+";";
	var contentsstyle = "position:relative;overflow:auto;height:0px;";
	var contentsbackground = _scrolldata.background || "background:"+kb.widget.scroll.defaultSetting.background+";";
	var contentswrapperborder = _scrolldata.wrapperborder || kb.widget.scroll.defaultSetting.wrapperborder+";";
	contentsstyle += contentsbackground + contentswrapperborder + contentsheight;
//임시
contentsstyle = "";
	var targetid = _scrolldata.targetid;
	var headertemplateid = _scrolldata.headertemplate;
	var contentstemplateid = _scrolldata.contentstemplate;
    var target = document.getElementById(targetid);
	target.scrolltype = scrolltype;
	target.headertemplateid = headertemplateid;
	target.contentstemplateid = contentstemplateid;
    var scrollhtml = new Array;
    
    var containerid = targetid+"_container";
    var containsersublistid = targetid+"_list";
    var scrolldata = _scrolldata.scrolldata;
    
    var headertemplate = document.getElementById(headertemplateid).innerHTML;
    var contentstemplate = document.getElementById(contentstemplateid).innerHTML;
    
    var searchnodataclass = _scrolldata.searchnodataclass;
    
    var headerid = targetid+"_header";
    var contentsid = targetid+"_contents";
    var contentsscrollid = targetid+"_contentsscroll";
    var pullendaction = _scrolldata.pullendaction;
	var clickaction = _scrolldata.clickaction;
    
    //TODO - regular expression으로 변경필요
    var contentstemplateLowerCase = contentstemplate.toLowerCase();
    var contentsheader = "";
    var contentsbody = "";
    var contentsfooter = "";//footer있는경우??
    var contentsend = "</tbody></table>";
	var contentstbody = "<tbody>";
    
    var colgroupStartStr = "<colgroup>";
    var colgroupEndStr = "</colgroup>";

    var colgroupStartIndex = contentstemplateLowerCase.indexOf(colgroupStartStr);
    var colgroupEndIndex = contentstemplateLowerCase.indexOf(colgroupEndStr)+colgroupEndStr.length;

    // 데이터 없는 경우 처리 하기 위하여 colgroup분리
    var contentsheader1 = contentstemplate.substring(0, colgroupStartIndex);//<colgroup> 이전까지 내용 저장
    var contentsheader2 = contentstemplate.substring(colgroupStartIndex, colgroupEndIndex);//<colgroup>~</colgroup> 까지 내용 저장
    
    contentsbody = contentstemplate.substring(colgroupEndIndex);
    contentsbody = contentsbody.replace('</table>','');
    contentsbody = contentsbody.replace('<tbody>','');
    contentsbody = contentsbody.replace('</tbody>','');
    
    scrollhtml.push('<div id="'+headerid+'">');
    scrollhtml.push(headertemplate);
    scrollhtml.push('</div>');          
    scrollhtml.push('<div id="'+contentsid+'" style="'+contentsstyle+'">');
    scrollhtml.push('<div id="'+contentsscrollid+'">');
    scrollhtml.push(contentsheader1);

    //데이터 존재하지 않을 경우
    if(scrolldata.length == 0)
    {
		scrollhtml.push(contentstbody);
    }
    else
    {
        scrollhtml.push(contentsheader2);
		scrollhtml.push(contentstbody);
        for(var i=0; i < scrolldata.length; i++)
        {
            var bodydata = contentsbody;
			//row 색 번갈아 표시 있을 경우 처리
			if(i % 2 == 0)
				bodydata = bodydata.replace(/alterclass1/g,"class");
			else
				bodydata = bodydata.replace(/alterclass2/g,"class");

            var row = scrolldata[i];
			for(var elem in row)
			{
                //변수 정규식 처리 안되어 루프 처리
                var replaceStr = '{'+elem+'}';
                while(bodydata.indexOf(replaceStr) != -1)
                {
                    bodydata = bodydata.replace(replaceStr,row[elem]);
                }
			}
			scrollhtml.push(bodydata);
        }
    }

    scrollhtml.push(contentsend);
    scrollhtml.push('</div>');
    scrollhtml.push('</div>');
	         
    target.innerHTML = scrollhtml.join("");

	//TODO-setting 찾아봐야함
	var contentsTableObj = document.getElementById(contentsid);
	contentsTableObj.style.borderLeft = "none";
	contentsTableObj.style.borderRight = "none";
	//// TODO - 왼쪽고정열 테이블 우측 border안없어짐.
	//contentsLeftTableObj.style.borderRight = "none";

	if(clickaction)
	{
		var last_click_x = 0, last_click_y = 0, last_click_time = new Date().getTime();
		var contentsObj = document.getElementById(contentsscrollid).children[0];
		$(contentsObj).off("click").on('click', function(e){
			var click_x = e["pageX"], click_y = e["pageY"], click_time = e["timeStamp"];
			if (click_x && click_y && click_time &&
				(Math.abs(click_x - last_click_x) < 10) &&
				(Math.abs(click_y - last_click_y) < 10) &&
				(click_time - last_click_time) < 1000) {
					e.stopImmediatePropagation();
					return false;
			}    
			last_click_x = click_x;
			last_click_y = click_y;
			last_click_time = click_time;
			
			var e = e ? e : window.event;
			var targetObj = e.target ? e.target : e.srcElement;
			var tempObj = targetObj;
			for(var i=0; i < 10; i++)
			{
				if(tempObj && tempObj.tagName != "TR")
					tempObj = tempObj.parentNode;
				else
					break;
			}
			if(!tempObj)
				return;
			var rowObj = tempObj;
			var rowIndex = rowObj.rowIndex;
			var cellIndex = targetObj.cellIndex;
			var tableobj = [contentsObj];
			var rowdata = new Array;
			for(var i=0; i < rowObj.cells.length; i++)
			{
				rowdata.push(rowObj.cells[i].innerText);
			}
			var sender = {
				"event":e,
				"targetObj":targetObj,
				"rowObj":rowObj,
				"rowIndex":rowIndex,
				"cellIndex":cellIndex,
				"tableObj":tableobj,
				"rowData":rowdata
			};
			eval(clickaction + "(sender)");
		});
	}
}


//일반 스크롤 형식
kb.widget.scroll._makeEndlessScroller = function(_scrolldata, scrolltype)
{
    if(!_scrolldata || !_scrolldata.targetid || !_scrolldata.scrolldata
		 || !_scrolldata.headertemplate || !_scrolldata.contentstemplate)
    {
        alert("scroll데이터가 올바르지 않습니다.");
        return;
    }

	//wrapper 기본 스타일
	var contentsheight = _scrolldata.height || "100%";
	if(contentsheight != "100%" && contentsheight.indexOf("-") == -1)
		contentsheight = "height:"+_scrolldata.height+";";
	var contentsstyle = "position:relative;overflow:auto;height:0px;";
	var contentsbackground = _scrolldata.background || "background:"+kb.widget.scroll.defaultSetting.background+";";
	var contentswrapperborder = _scrolldata.wrapperborder || kb.widget.scroll.defaultSetting.wrapperborder+";";
	contentsstyle += contentsbackground + contentswrapperborder + contentsheight;

	var targetid = _scrolldata.targetid;
	var headertemplateid = _scrolldata.headertemplate;
	var contentstemplateid = _scrolldata.contentstemplate;
    var target = document.getElementById(targetid);
	target.scrolltype = scrolltype;
	target.headertemplateid = headertemplateid;
	target.contentstemplateid = contentstemplateid;
    var scrollhtml = new Array;
    
    var containerid = targetid+"_container";
    var containsersublistid = targetid+"_list";
    var scrolldata = _scrolldata.scrolldata;
	var hscrollbar = _scrolldata.hscrollbar || "true";
	var vscrollbar = _scrolldata.vscrollbar || "true";
    
    var headertemplate = document.getElementById(headertemplateid).innerHTML;
    var contentstemplate = document.getElementById(contentstemplateid).innerHTML;
	var addcontents = "";
	if(_scrolldata.addcontents)
		addcontents = document.getElementById(_scrolldata.addcontents).innerHTML;
    
    var searchnodataclass = _scrolldata.searchnodataclass;
    
    var headerid = targetid+"_header";
    var contentsid = targetid+"_contents";
    var contentsscrollid = targetid+"_contentsscroll";
    var pullendaction = _scrolldata.pullendaction;
	var clickaction = _scrolldata.clickaction;
    
    //TODO - regular expression으로 변경필요
    var contentstemplateLowerCase = contentstemplate.toLowerCase();
    var contentsheader = "";
    var contentsbody = "";
    var contentsfooter = "";//footer있는경우??
    var contentsend = "</tbody></table>";
	var contentstbody = "<tbody>";
    
    var colgroupStartStr = "<colgroup>";
    var colgroupEndStr = "</colgroup>";

    var colgroupStartIndex = contentstemplateLowerCase.indexOf(colgroupStartStr);
    var colgroupEndIndex = contentstemplateLowerCase.indexOf(colgroupEndStr)+colgroupEndStr.length;

    // 데이터 없는 경우 처리 하기 위하여 colgroup분리
    var contentsheader1 = contentstemplate.substring(0, colgroupStartIndex);//<colgroup> 이전까지 내용 저장
    var contentsheader2 = contentstemplate.substring(colgroupStartIndex, colgroupEndIndex);//<colgroup>~</colgroup> 까지 내용 저장
    
    contentsbody = contentstemplate.substring(colgroupEndIndex);
    contentsbody = contentsbody.replace('</table>','');
    contentsbody = contentsbody.replace('<tbody>','');
    contentsbody = contentsbody.replace('</tbody>','');
    
    scrollhtml.push('<div id="'+headerid+'">');
    scrollhtml.push(headertemplate);
    scrollhtml.push('</div>');          
    scrollhtml.push('<div id="'+contentsid+'" style="'+contentsstyle+'">');
    scrollhtml.push('<div id="'+contentsscrollid+'">');
    scrollhtml.push(contentsheader1);

    //데이터 존재하지 않을 경우
    if(scrolldata.length == 0)
    {
		scrollhtml.push(contentstbody);
    }
    else
    {
        scrollhtml.push(contentsheader2);
		scrollhtml.push(contentstbody);
        for(var i=0; i < scrolldata.length; i++)
        {
            var bodydata = contentsbody;
			//row 색 번갈아 표시 있을 경우 처리
			if(i % 2 == 0)
				bodydata = bodydata.replace(/alterclass1/g,"class");
			else
				bodydata = bodydata.replace(/alterclass2/g,"class");

            var row = scrolldata[i];
			for(var elem in row)
			{
                //변수 정규식 처리 안되어 루프 처리
                var replaceStr = '{'+elem+'}';
                while(bodydata.indexOf(replaceStr) != -1)
                {
                    bodydata = bodydata.replace(replaceStr,row[elem]);
                }
			}
			scrollhtml.push(bodydata);
        }
    }

    scrollhtml.push(contentsend);
	//추가컨텐츠 있을 경우
	if(addcontents)
	    scrollhtml.push(addcontents);
    scrollhtml.push('</div>');
    scrollhtml.push('</div>');
	         
    target.innerHTML = scrollhtml.join("");

	//TODO-setting 찾아봐야함
	var contentsTableObj = document.getElementById(contentsid);
	contentsTableObj.style.borderLeft = "none";
	contentsTableObj.style.borderRight = "none";
	//// TODO - 왼쪽고정열 테이블 우측 border안없어짐.
	//contentsLeftTableObj.style.borderRight = "none";

	//하단영역까지 높이 자동 조정
	if(contentsheight == "100%" || contentsheight.indexOf("-") != -1)
	{
		var targetObj = document.getElementById(targetid);
		var headerObj = document.getElementById(headerid);
		var wrapperObj = document.getElementById(contentsid);

		var availHeight = document.body.clientHeight;
		var targetHeight = targetObj.clientHeight;
		var headerHeight = headerObj.clientHeight;
		var leftY = posY(targetObj);
		var height = 0;
		if(contentsheight.indexOf("-") != -1)
			height = parseInt(contentsheight,10);


		var paddingBottom = 5;//TODO - 기본값 셋팅
		var tempObj = targetObj.parentNode;
		for(var i=0; i<50; i++)
		{
			paddingBottom += parseInt($(tempObj).css('padding-bottom'),10) || 0;
			//paddingBottom += parseInt($(tempObj).css('padding-top'),10) || 0;
			if(!tempObj || !tempObj.parentNode)
				break;
			tempObj = tempObj.parentNode;
		}
		wrapperObj.style.height = (availHeight - headerHeight - leftY - paddingBottom + height).toString() + "px";
		//안드로이드 2.x버전에서 영역 안구해지는 문제로 임시 추가
		if(parseInt(wrapperObj.style.height,10) == 0)
			wrapperObj.style.height = "80%";
	}

	//스크롤바 제어
	var hscrollbarstr = "";
	var vscrollbarstr = "";
	if(hscrollbar.toLowerCase() == "false")
		hscrollbarstr = ",hScrollbar:false";
	if(vscrollbarstr.toLowerCase() == "false")
		vscrollbarstr = ",vScrollbar:false";

	var iscrollobj;
	iscrollobj = "kb.widget.scroll.obj." + targetid + " = new iScroll(contentsid, {\
		onBeforeScrollStart: function (e) {\
				var target = e.target;\
				while (target.nodeType != 1) target = target.parentNode;\
				if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA')\
					e.preventDefault();\
					e.stopPropagation();\
				},\
		onScrollEnd: function () {\
			if(pullendaction && this.y < (this.maxScrollY + 25))\
				eval('"+pullendaction+"(targetid)');\
		}"
	iscrollobj += hscrollbarstr;
	iscrollobj += vscrollbarstr;
	iscrollobj += "});";
	
    eval(iscrollobj);

	//scroll refresh
	setTimeout(function(){kb.widget.scroll.refresh()},300);
	setTimeout(function(){kb.widget.scroll.refresh()},1000);

	if(clickaction)
	{
		var last_click_x = 0, last_click_y = 0, last_click_time = new Date().getTime();
		var contentsObj = document.getElementById(contentsscrollid).children[0];
		$(contentsObj).off("click").on('click', function(e){
			var click_x = e["pageX"], click_y = e["pageY"], click_time = e["timeStamp"];
			if (click_x && click_y && click_time &&
				(Math.abs(click_x - last_click_x) < 10) &&
				(Math.abs(click_y - last_click_y) < 10) &&
				(click_time - last_click_time) < 1000) {
					e.stopImmediatePropagation();
					return false;
			}    
			last_click_x = click_x;
			last_click_y = click_y;
			last_click_time = click_time;

			var e = e ? e : window.event;
			var targetObj = e.target ? e.target : e.srcElement;
			var tempObj = targetObj;
			for(var i=0; i < 10; i++)
			{
				if(tempObj && tempObj.tagName != "TR")
					tempObj = tempObj.parentNode;
				else
					break;
			}
			if(!tempObj)
				return;
			var rowObj = tempObj;
			var rowIndex = rowObj.rowIndex;
			var cellIndex = targetObj.cellIndex;
			var tableobj = [contentsObj];
			var rowdata = new Array;
			for(var i=0; i < rowObj.cells.length; i++)
			{
				rowdata.push(rowObj.cells[i].innerText);
			}
			var sender = {
				"event":e,
				"targetObj":targetObj,
				"rowObj":rowObj,
				"rowIndex":rowIndex,
				"cellIndex":cellIndex,
				"tableObj":tableobj,
				"rowData":rowdata
			};
			eval(clickaction + "(sender)");
		});
	}

	//테이블 넓이 맞춤
	kb.widget.scroll.recalc(targetid, "normal");
}

//고정열 형식
kb.widget.scroll._makeLeftFixedScroller = function(_scrolldata, scrolltype)
{
    if(!_scrolldata || !_scrolldata.targetid || !_scrolldata.scrolldata
		 || !_scrolldata.headertemplate || !_scrolldata.contentstemplate)
    {
        alert("scroll데이터가 올바르지 않습니다.");
        return;
    }
	
	//wrapper 기본 스타일
	var contentsheight = _scrolldata.height || "100%";
	if(contentsheight != "100%" && contentsheight.indexOf("-") == -1)
		contentsheight = "height:"+_scrolldata.height+";";
	var contentsstyle = "position:relative;overflow:auto;float:left;";
	var headerstyle = contentsstyle;
	var contentsbackground = _scrolldata.background || "background:"+kb.widget.scroll.defaultSetting.background+";";
	var contentswrapperborder = _scrolldata.wrapperborder || kb.widget.scroll.defaultSetting.wrapperborder+";";
	contentsstyle += contentsbackground + contentswrapperborder + contentsheight;
	headerstyle += contentsbackground + contentswrapperborder;

	var targetid = _scrolldata.targetid;
	var headertemplateid = _scrolldata.headertemplate;
	var contentstemplateid = _scrolldata.contentstemplate;
    var target = document.getElementById(targetid);
	target.scrolltype = scrolltype;
	target.headertemplateid = headertemplateid;
	target.contentstemplateid = contentstemplateid;
	var fixedColumn = _scrolldata.fixedcolumn;
	target.fixedcolumn = fixedColumn;
    var scrollhtml = new Array;

	var fixedheaderid = targetid+"_fixedHeader";
	var flexableheaderid = targetid+"_flexableHeader";
	var fixedwrapperid = targetid+"_fixedWrapper";
	var flexablewrapperid = targetid+"_flexableWrapper";
	var leftarrowid = targetid+"_leftarrow";
	var rightarrowid = targetid+"_rightarrow";
	var leftarrowimg = _scrolldata.leftarrowimg || kb.widget.scroll.defaultSetting.leftarrowimg;
	var rightarrowimg = _scrolldata.rightarrowimg || kb.widget.scroll.defaultSetting.rightarrowimg;
	var fullsize = _scrolldata.fullsize;

	var containertitleclass = _scrolldata.containertitleclass;    
    var containsersublistid = targetid+"_list";
    var scrolldata = _scrolldata.scrolldata;
	var displaycolumn = _scrolldata.displaycolumn;

	// display열 기준으로 template 넓이 재계산
    var headertemplateObj = document.getElementById(headertemplateid);
    var contentstemplateObj = document.getElementById(contentstemplateid);
	var headercollist = headertemplateObj.querySelectorAll("col");
	var contentscollist = contentstemplateObj.querySelectorAll("col");
	var availableWidth = target.clientWidth;

	var contentstemplateTableObj = contentstemplateObj.querySelector("table");

	//컨텐츠 우측 마지막열 border없앰(넓이 맞추기 위함)
	for(var i=0; i < contentstemplateTableObj.rows.length; i++)
	{
		var row = contentstemplateTableObj.rows[i];
		row.cells[row.children.length-1].style.borderRight = "none";
	}


	//전체 넓이 구하기
	var colwidth = 0;
	for(var i=0; i < headercollist.length; i++)
	{
		if(i >= displaycolumn)
			break;
		colwidth += parseInt(headercollist[i].width);
	}
	var totalwidth = parseInt(availableWidth/colwidth*100,10);

	//넓이 재적용
	for(var i=0; i < headercollist.length; i++)
	{
		var colObj = headercollist[i];
		colObj.width = parseInt(totalwidth * parseInt(colObj.width,10)/100,10) + "px";
	}
	for(var i=0; i < contentscollist.length; i++)
	{
		var colObj = contentscollist[i];
		colObj.width = parseInt(totalwidth * parseInt(colObj.width,10)/100,10) + "px";
	}


    var headertemplate = document.getElementById(headertemplateid).innerHTML;
    var contentstemplate = document.getElementById(contentstemplateid).innerHTML;
    var pullendaction = _scrolldata.pullendaction;
	var clickaction = _scrolldata.clickaction;



    //TODO - regular expression으로 변경필요
    var contentstemplateLowerCase = contentstemplate.toLowerCase();
    var contentsheader = "";
    var contentsbody = "";
    var contentsfooter = "";//footer있는경우??
    var contentsend = "</tbody></table>";
	var contentstbody = "<tbody>";
    
    var colgroupStartStr = "<colgroup>";
    var colgroupEndStr = "</colgroup>";

    var colgroupStartIndex = contentstemplateLowerCase.indexOf(colgroupStartStr);
    var colgroupEndIndex = contentstemplateLowerCase.indexOf(colgroupEndStr)+colgroupEndStr.length;

    // 데이터 없는 경우 처리 하기 위하여 colgroup분리
    var contentsheader1 = contentstemplate.substring(0, colgroupStartIndex);//<colgroup> 이전까지 내용 저장
    var contentsheader2 = contentstemplate.substring(colgroupStartIndex, colgroupEndIndex);//<colgroup>~</colgroup> 까지 내용 저장
    
    contentsbody = contentstemplate.substring(colgroupEndIndex);
    contentsbody = contentsbody.replace('</table>','');
    contentsbody = contentsbody.replace('<tbody>','');
    contentsbody = contentsbody.replace('</tbody>','');

	var contentshtml = new Array;
	contentshtml.push(contentsheader1);
    //데이터 존재하지 않을 경우
    if(scrolldata.length == 0)
    {
		contentshtml.push(contentstbody);
    }
    else
    {
        contentshtml.push(contentsheader2);
		contentshtml.push(contentstbody);
        for(var i=0; i < scrolldata.length; i++)
        {
            var bodydata = contentsbody;
			//row 색 번갈아 표시 있을 경우 처리
			if(i % 2 == 0)
				bodydata = bodydata.replace(/alterclass1/g,"class");
			else
				bodydata = bodydata.replace(/alterclass2/g,"class");

            var row = scrolldata[i];
			for(var elem in row)
			{
                //변수 정규식 처리 안되어 루프 처리
                var replaceStr = '{'+elem+'}';
                while(bodydata.indexOf(replaceStr) != -1)
                {
                    bodydata = bodydata.replace(replaceStr,row[elem]);
                }
			}
            contentshtml.push(bodydata);
        }
    }
    contentshtml.push(contentsend);

	var fixedheaderid = targetid+"_fixedHeader";
	var flexableheaderid = targetid+"_flexableHeader";
	var fixedwrapperid = targetid+"_fixedWrapper";
	var flexablewrapperid = targetid+"_flexableWrapper";
    var containsersublistid = targetid+"_list";

	var leftarrowid = targetid+"_leftarrow";
	var rightarrowid = targetid+"_rightarrow";
	//arrow추가(좌표문제가 있어 target영역에 넣음)
	var leftarrowhtml = '<img src="'+leftarrowimg+'" border="0" align="absmiddle">';
	var rightarrowhtml = '<img src="'+rightarrowimg+'" border="0" align="absmiddle">';
	target.insertAdjacentHTML('beforeBegin','<div id="'+leftarrowid+'" style="position:absolute; z-index:3;display:table-cell;vertical-align:middle;display:none">'+leftarrowhtml+'</div>');
	target.insertAdjacentHTML('beforeBegin','<div id="'+rightarrowid+'" style="position:absolute; z-index:3;display:table-cell;vertical-align:middle;display:none">'+rightarrowhtml+'</div>');

	//wrapper추가
	scrollhtml.push('<div id="'+fixedheaderid+'" style="'+headerstyle+';overflow:hidden;border-bottom:none;" >');
	scrollhtml.push(headertemplate);
	scrollhtml.push('</div>');
	scrollhtml.push('<div id="'+flexableheaderid+'" style="'+headerstyle+';overflow-y:hidden;border-bottom:none;"><div>');
	scrollhtml.push(headertemplate);
	scrollhtml.push('</div></div>');
	scrollhtml.push('<div id="'+fixedwrapperid+'" style="'+contentsstyle+';clear:both;border-top:none;border-right:none;"><div>');
	scrollhtml.push(contentshtml.join(""));
	scrollhtml.push('</div></div>');
	scrollhtml.push('<div id="'+flexablewrapperid+'" style="'+contentsstyle+';border-left:none;border-top:none;"><div>');
	scrollhtml.push(contentshtml.join(""));
	scrollhtml.push('</div></div>');
    target.innerHTML = scrollhtml.join("");

	var headerLeftObj = document.getElementById(fixedheaderid);
	var headerRightObj = document.getElementById(flexableheaderid);
	var contentsLeftObj = document.getElementById(fixedwrapperid);
	var contentsRightObj = document.getElementById(flexablewrapperid);

	var headerRightScrollerObj = headerRightObj.querySelector("div");
	var contentsLeftScrollerObj = contentsLeftObj.querySelector("div");
	var contentsRightScrollerObj = contentsRightObj.querySelector("div");

	var headerLeftTableObj = headerLeftObj.querySelector("table");
	var headerRightTableObj = headerRightScrollerObj.querySelector("table");
	var contentsLeftTableObj = contentsLeftScrollerObj.querySelector("table");
	var contentsRightTableObj = contentsRightScrollerObj.querySelector("table");

	// row/cell index설정
	//index재정의(colspan/rowspan처리위함)
	kb.widget.scroll.setCellIndex(headerLeftTableObj);
	kb.widget.scroll.setCellIndex(headerRightTableObj);
	kb.widget.scroll.setCellIndex(contentsLeftTableObj);
	kb.widget.scroll.setCellIndex(contentsRightTableObj);

	var headerLeftColgroupObj = headerLeftObj.querySelector("colgroup");
	var headerRightColgroupObj = headerRightTableObj.querySelector("colgroup");
	var contentsRightColgroupObj = contentsRightObj.querySelector("colgroup");

	//TODO-Border표시로 어긋나는 문제. setting 찾아봐야함
	headerRightObj.style.borderLeft = "none";
	contentsRightTableObj.style.border = "none";
	contentsLeftTableObj.style.border = "none";

	headerLeftObj.style.borderLeft = "none";
	contentsLeftObj.style.borderLeft = "none";
	headerRightObj.style.borderRight = "none";
	contentsRightObj.style.borderRight = "none";

	// 좌측 colgroup 삭제 및 넓이 계산
	var leftwidth = 0;
	var maxwidth = 0;
	var leftcolgroup = headerLeftColgroupObj;
	var leftcolgrouplength = leftcolgroup.children.length;
	for(var i=0; i < leftcolgroup.children.length; )
	{
		maxwidth += parseInt(leftcolgroup.children[i].width, 10);
		if(fixedColumn > i)
		{
			leftwidth += parseInt(leftcolgroup.children[i].width, 10);
			i++;
		}
		else
		{
			leftcolgroup.removeChild(leftcolgroup.children[i]);
		}
	}

	// 우측 header colgroup 삭제
	var rightcolgroup = headerRightColgroupObj;
	if(rightcolgroup)
	{
		for(var i=0; i < fixedColumn; i++)
		{
			rightcolgroup.removeChild(rightcolgroup.children[0]);
		}
	}

	// 우측 contents colgroup 삭제	
	var contentsrightcolgroup = contentsRightColgroupObj;
	if(contentsrightcolgroup)
	{
		for(var i=0; i < fixedColumn; i++)
		{
			contentsrightcolgroup.removeChild(contentsrightcolgroup.children[0]);
		}
	}
	

	//좌측 고정 제목 삭제
	for(var i=0; i < headerLeftTableObj.rows.length; i++)
	{
		var row = headerLeftTableObj.rows[i];
		var celllength = row.cells.length;
		for(var m=celllength-1; m >= 0; m--)
		{
			var cellindex = row.cells[m].currentCellIndex;
			if(fixedColumn > cellindex)
				break;
			row.removeChild(row.cells[m]);
		}
	}

	//좌측 고정 내용 삭제
	for(var i=0; i < contentsLeftTableObj.rows.length;i++)
	{
		var row = contentsLeftTableObj.rows[i];
		var celllength = row.cells.length;
		for(var m=celllength-1; m >= 0; m--)
		{
			var cellindex = row.cells[m].currentCellIndex;
			if(fixedColumn > cellindex)
				break;
			row.removeChild(row.cells[m]);
		}
	}

	// 우측 스크롤 제목 삭제
	for(var i=0; i < headerRightTableObj.rows.length; i++)
	{
		var row = headerRightTableObj.rows[i];
		var celllength = row.cells.length;
		for(var m=0; m < celllength-1; m++)
		{
			row.removeChild(row.cells[0]);
			var cellindex = row.cells[m].currentCellIndex;
			if(fixedColumn <= cellindex)
				break;
		}
	}

	// 우측 스크롤 내용 삭제
	for(var i=0; i < contentsRightTableObj.rows.length;i++)
	{
		var row = contentsRightTableObj.rows[i];
		var celllength = row.cells.length;
		for(var m=0; m < celllength-1; m++)
		{
			row.removeChild(row.cells[0]);
			var cellindex = row.cells[m].currentCellIndex;
			if(fixedColumn <= cellindex)
				break;
		}
	}

	var marginwidth = 1;//TODO - 어떻게 구할지??
	var availableWidth = target.clientWidth;
	var contentswidth = maxwidth - leftwidth - marginwidth;
	var rightwidth = maxwidth - leftwidth - marginwidth;
	if(maxwidth > availableWidth)
		rightwidth = availableWidth - leftwidth - marginwidth;

	// 넓이 재조정(우측은 윈도우 넓이로)
	//TODO - contents영역 넓이 1어긋남. 이유??
	headerLeftObj.style.width = leftwidth+"px";
	headerRightObj.style.width = rightwidth+"px";
	contentsLeftObj.style.width = leftwidth+1+"px";
	contentsRightObj.style.width = rightwidth+"px";

	//우측영역 넓이 재조정
	headerRightScrollerObj.style.width = contentswidth+"px";
	contentsRightScrollerObj.style.width = contentswidth+"px";

	//하단영역까지 높이 자동 조정
	if(contentsheight == "100%" || contentsheight.indexOf("-") != -1)
	{
		var targetObj = document.getElementById(targetid);
		var headerLeftObj = document.getElementById(fixedheaderid);
		var headerRightObj = document.getElementById(flexableheaderid);
		var contentsLeftObj = document.getElementById(fixedwrapperid);
		var contentsRightObj = document.getElementById(flexablewrapperid);
		var height = 0;
		if(contentsheight.indexOf("-") != -1)
			height = parseInt(contentsheight,10);

		//var targetObj = document.getElementById(targetid);
		//var headerObj = document.getElementById(headerid);
		//var wrapperObj = document.getElementById(contentsid);

		var availHeight = document.body.clientHeight;
		var targetHeight = targetObj.clientHeight;
		var headerHeight = headerLeftObj.clientHeight;
		var leftY = posY(targetObj);

		var paddingBottom = 5;//TODO - 기본값 셋팅
		var tempObj = targetObj.parentNode;
		for(var i=0; i<50; i++)
		{
			paddingBottom += parseInt($(tempObj).css('padding-bottom'),10) || 0;
			//paddingBottom += parseInt($(tempObj).css('padding-top'),10) || 0;
			if(!tempObj || !tempObj.parentNode)
				break;
			tempObj = tempObj.parentNode;
		}
		var contentsHeight = (availHeight - headerHeight - leftY - paddingBottom + height).toString() + "px";
		//안드로이드 2.x버전에서 영역 안구해지는 문제로 임시 추가
		if(parseInt(contentsHeight,10) == 0)
			contentsHeight = "80%";
		contentsLeftObj.style.height = contentsHeight;
		contentsRightObj.style.height = contentsHeight;

	}

	var iscrollobj1;
	var iscrollobj2;
	var iscrollobj3;

	// iscroll설정
	iscrollobj1 = "kb.widget.scroll.obj." + fixedwrapperid + " = new iScroll(fixedwrapperid, {\
        bounceleft : false,\
        bounceright : false,\
        bouncetop : true,\
        bouncebottom : true,\
        vScrollbar: false,\
		onBeforeScrollStart: function (e) {\
				var target = e.target;\
				while (target.nodeType != 1) target = target.parentNode;\
				if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA')\
					e.preventDefault();\
					e.stopPropagation();\
				},\
        onScrollMove: function (){\
            eval('kb.widget.scroll.obj."+flexablewrapperid+"._pos(this.x, this.y)');\
            eval('kb.widget.scroll.obj."+flexableheaderid+"._pos(this.x, 0)');\
        },\
        onScrollEnd: function (){\
            eval('kb.widget.scroll.obj."+flexablewrapperid+"._pos(this.x, this.y)');\
			if(pullendaction && this.y < (this.maxScrollY + 25))\
				eval('"+pullendaction+"(targetid)');\
        },\
        onAnimationDoing: function (){\
            eval('kb.widget.scroll.obj."+flexablewrapperid+"._pos(this.x, this.y)');\
        }\
    });";

	iscrollobj2 = "kb.widget.scroll.obj." + flexablewrapperid + " = new iScroll(flexablewrapperid, {\
        hScrollbar: false,\
        bounceleft : false,\
        bounceright : false,\
        bouncetop : true,\
        bouncebottom : true,\
		onBeforeScrollStart: function (e) {\
				var target = e.target;\
				while (target.nodeType != 1) target = target.parentNode;\
				if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA')\
					e.preventDefault();\
					e.stopPropagation();\
				},\
        onScrollMove: function (){\
			var leftarrow = document.getElementById(leftarrowid);\
			var rightarrow = document.getElementById(rightarrowid);\
			if(this.x == 0)\
				leftarrow.style.display = 'none';\
			else\
				leftarrow.style.display = 'block';\
			if(this.x == this.maxScrollX)\
				rightarrow.style.display = 'none';\
			else\
				rightarrow.style.display = 'block';\
            eval('kb.widget.scroll.obj."+fixedwrapperid+"._pos(this.x, this.y)');\
            eval('kb.widget.scroll.obj."+flexableheaderid+"._pos(this.x, 0)');\
        },\
        onScrollEnd: function (){\
			var leftarrow = document.getElementById(leftarrowid);\
			var rightarrow = document.getElementById(rightarrowid);\
			if(this.x == 0)\
				leftarrow.style.display = 'none';\
			else\
				leftarrow.style.display = 'block';\
			if(this.x == this.maxScrollX)\
				rightarrow.style.display = 'none';\
			else\
				rightarrow.style.display = 'block';\
            eval('kb.widget.scroll.obj."+fixedwrapperid+"._pos(this.x, this.y)');\
            eval('kb.widget.scroll.obj."+flexableheaderid+"._pos(this.x, 0)');\
			if(pullendaction && this.y < (this.maxScrollY + 25))\
				eval('"+pullendaction+"(targetid)');\
        },\
        onAnimationDoing: function (){\
			var leftarrow = document.getElementById(leftarrowid);\
			var rightarrow = document.getElementById(rightarrowid);\
			if(this.x == 0)\
				leftarrow.style.display = 'none';\
			else\
				leftarrow.style.display = 'block';\
			if(this.x == this.maxScrollX)\
				rightarrow.style.display = 'none';\
			else\
				rightarrow.style.display = 'block';\
            eval('kb.widget.scroll.obj."+fixedwrapperid+"._pos(this.x, this.y)');\
            eval('kb.widget.scroll.obj."+flexableheaderid+"._pos(this.x, 0)');\
        }\
    });";
	
	iscrollobj3 = "kb.widget.scroll.obj." + flexableheaderid + " = new iScroll(flexableheaderid, {\
        vScrollbar: false,\
        hScrollbar: false,\
        bounceleft : false,\
        bounceright : false,\
        bouncetop : false,\
        bouncebottom : false,\
		onBeforeScrollStart: function (e) {\
				var target = e.target;\
				while (target.nodeType != 1) target = target.parentNode;\
				if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA')\
					e.preventDefault();\
					e.stopPropagation();\
				},\
        onScrollMove: function (){\
			var leftarrow = document.getElementById(leftarrowid);\
			var rightarrow = document.getElementById(rightarrowid);\
			if(this.x == 0)\
				leftarrow.style.display = 'none';\
			else\
				leftarrow.style.display = 'block';\
			if(this.x == this.maxScrollX)\
				rightarrow.style.display = 'none';\
			else\
				rightarrow.style.display = 'block';\
			eval('kb.widget.scroll.obj."+fixedwrapperid+"._pos(this.x, 0)');\
			eval('kb.widget.scroll.obj."+flexablewrapperid+"._pos(this.x, 0)');\
        },\
        onScrollEnd: function (){\
			var leftarrow = document.getElementById(leftarrowid);\
			var rightarrow = document.getElementById(rightarrowid);\
			if(this.x == 0)\
				leftarrow.style.display = 'none';\
			else\
				leftarrow.style.display = 'block';\
			if(this.x == this.maxScrollX)\
				rightarrow.style.display = 'none';\
			else\
				rightarrow.style.display = 'block';\
			eval('kb.widget.scroll.obj."+fixedwrapperid+"._pos(this.x, 0)');\
			eval('kb.widget.scroll.obj."+flexablewrapperid+"._pos(this.x, 0)');\
        },\
        onAnimationDoing: function (){\
			var leftarrow = document.getElementById(leftarrowid);\
			var rightarrow = document.getElementById(rightarrowid);\
			if(this.x == 0)\
				leftarrow.style.display = 'none';\
			else\
				leftarrow.style.display = 'block';\
			if(this.x == this.maxScrollX)\
				rightarrow.style.display = 'none';\
			else\
				rightarrow.style.display = 'block';\
			eval('kb.widget.scroll.obj."+fixedwrapperid+"._pos(this.x, 0)');\
			eval('kb.widget.scroll.obj."+flexablewrapperid+"._pos(this.x, 0)');\
        }\
    });";

	eval(iscrollobj1);
	eval(iscrollobj2);
	eval(iscrollobj3);

	//고정열 없을 경우
	if(fixedColumn == 0)
	{
		//headerLeftObj.style.display = "none";
		//contentsLeftObj.style.display = "none";
		//border가 없어지는 것 때문에 사용(디자인에 따라 변동될듯 함)
		headerLeftObj.style.borderRight = "none";
		contentsLeftObj.style.borderRight = "none";
	}

	//scroll refresh
	setTimeout(function(){kb.widget.scroll.refresh()},300);
	setTimeout(function(){kb.widget.scroll.refresh()},1000);

	// 화살표 크기 자동으로 구하기 위하여 setTimeout사용
	// kb.widget.scroll안에서 setTimeout두번 호출 문제 있어서 임시로 막음
	//window.setTimeout(function()
	//{
		// 가로 스크롤 있는 경우 화살표 표시
		if(contentsRightScrollerObj.style.width != contentsRightObj.style.width)
		{
			var rightarrow = document.getElementById(rightarrowid);
			rightarrow.style.display = 'inline';
		}
/*
		//TODO - 속도 향상 위하여 동적으로 구하는 로직 뺌
		// 좌우 화살표 크기 구하기
		var tempdiv = document.createElement("DIV");
		tempdiv.innerHTML = document.getElementById(rightarrowid).innerHTML;
		var leftarrowobj = tempdiv.children[0];
		var arrowwidth = leftarrowobj.naturalWidth;
		var arrowheight = leftarrowobj.naturalHeight;
		tempdiv = "";
*/
		var arrowwidth = kb.widget.scroll.defaultSetting.arrowwidth;
		var arrowheight = kb.widget.scroll.defaultSetting.arrowheight;

		// 좌우 화살표 좌표 구하기
		var leftarrow = document.getElementById(leftarrowid);
		var rightarrow = document.getElementById(rightarrowid);

		var margin = 3;//양끝여백
		var leftX = posX(headerLeftObj);
		var leftY = posY(headerLeftObj);
		var rightX = posX(headerRightObj);
		var rightY = posY(headerRightObj);
		var leftObjWidth = headerLeftObj.clientWidth;
		var rightObjWidth = headerRightObj.clientWidth;
		var leftObjHeight = headerLeftObj.clientHeight;
		var rightObjHeight = headerRightObj.clientHeight;

		var leftPosX = rightX + margin;
		var rightPosX = rightX + rightObjWidth - arrowwidth - margin;
		var leftPosY = leftY + leftObjHeight/2 - arrowheight/2;
		var rightPosY = rightY + rightObjHeight/2 - arrowheight/2;

		leftarrow.style.left = leftPosX + "px";
		leftarrow.style.top = rightPosY + "px";
		rightarrow.style.left = rightPosX + "px";
		rightarrow.style.top = rightPosY + "px";
	//},100);

	if(clickaction)
	{
	    var last_click_x = 0, last_click_y = 0, last_click_time = new Date().getTime();
		$(contentsLeftObj).off("click").on('click', function(e){
			var click_x = e["pageX"], click_y = e["pageY"], click_time = e["timeStamp"];
			if (click_x && click_y && click_time &&
				(Math.abs(click_x - last_click_x) < 10) &&
				(Math.abs(click_y - last_click_y) < 10) &&
				(click_time - last_click_time) < 1000) {
					e.stopImmediatePropagation();
					return false;
			}    
			last_click_x = click_x;
			last_click_y = click_y;
			last_click_time = click_time;

			var e = e ? e : window.event;
			var targetObj = e.target ? e.target : e.srcElement;
			var tempObj = targetObj;
			for(var i=0; i < 10; i++)
			{
				if(tempObj && tempObj.tagName != "TR")
					tempObj = tempObj.parentNode;
				else
					break;
			}
			if(!tempObj)
				return;
			var rowObj = tempObj;
			var rowIndex = rowObj.rowIndex;
			var cellIndex = targetObj.cellIndex;
			var table1obj = contentsLeftObj.querySelector("div>table");
			var table2obj = contentsRightObj.querySelector("div>table");
			var tableobj = [table1obj, table2obj];
			var rowdata = new Array;
			for(var i=0; i < rowObj.cells.length; i++)
			{
				rowdata.push(rowObj.cells[i].innerText);
			}
			var sender = {
				"event":e,
				"targetObj":targetObj,
				"rowObj":rowObj,
				"rowIndex":rowIndex,
				"cellIndex":cellIndex,
				"tableObj":tableobj,
				"rowData":rowdata
			};
			eval(clickaction + "(sender)");
		});

		$(contentsRightObj).off("click").on('click', function(e){
			var click_x = e["pageX"], click_y = e["pageY"], click_time = e["timeStamp"];
			if (click_x && click_y && click_time &&
				(Math.abs(click_x - last_click_x) < 10) &&
				(Math.abs(click_y - last_click_y) < 10) &&
				(click_time - last_click_time) < 1000) {
					e.stopImmediatePropagation();
					return false;
			}    
			last_click_x = click_x;
			last_click_y = click_y;
			last_click_time = click_time;

			var e = e ? e : window.event;
			var targetObj = e.target ? e.target : e.srcElement;
			var tempObj = targetObj;
			for(var i=0; i < 10; i++)
			{
				if(tempObj && tempObj.tagName != "TR")
					tempObj = tempObj.parentNode;
				else
					break;
			}
			if(!tempObj)
				return;
			var rowObj = tempObj;
			var rowIndex = rowObj.rowIndex;
			var cellIndex = targetObj.cellIndex;
			var table1obj = contentsLeftObj.querySelector("div>table");
			var table2obj = contentsRightObj.querySelector("div>table");
			var tableobj = [table1obj, table2obj];
			var rowdata = new Array;
			for(var i=0; i < rowObj.cells.length; i++)
			{
				rowdata.push(rowObj.cells[i].innerText);
			}
			var sender = {
				"event":e,
				"targetObj":targetObj,
				"rowObj":rowObj,
				"rowIndex":rowIndex,
				"cellIndex":cellIndex,
				"tableObj":tableobj,
				"rowData":rowdata
			};
			eval(clickaction + "(sender)");
		});
	}

	//테이블 넓이 맞춤
	kb.widget.scroll.recalc(targetid, "fixed");
}

// --------------------------------------------------------------------
// 스크롤러 관련 소스 /E line 217 ~ line 1226
// ====================================================================

// --------------------------------------------------------------------
// 텝 관련 소스 /S line 1230 ~ line 1375
// ====================================================================
kb.widget.tab = function(data){
	var containerclass = data.containerclass;
	var tabclass = data.tabclass;
	var tabid = data.tabid;
	var defaultindex = data.defaultindex - 1;
	var clickaction = data.clickaction;

	this.id = tabid;
	this.setSelectedTab = function(index){
		// 기존값 초기화
		var tabObj = document.getElementById(tabid);
		var alllist = tabObj.querySelectorAll("."+tabclass+".active");
		for(var i=0; i < alllist.length; i++)
		{
			var targetObj = alllist[i];
			var prevObj = targetObj.previousElementSibling;
			var nextObj = targetObj.nextElementSibling;
			if(nextObj.className.indexOf("end") == -1)
				targetObj.className = tabclass+" line";
			else
				targetObj.className = tabclass;
			if(prevObj.previousElementSibling)
				prevObj.className = tabclass+" line";
			if(nextObj.nextElementSibling && nextObj.nextElementSibling.className.indexOf("end") == -1)
				nextObj.className = tabclass+" line";
		}

		tabObj.selectedTab = tabObj.children[index+1];
		tabObj.selectedTab.className = tabclass + " active";
		var prevObj = tabObj.selectedTab.previousElementSibling;
		var nextObj = tabObj.selectedTab.nextElementSibling;
		if(prevObj.previousElementSibling)
			prevObj.className = tabclass;
		if(nextObj.nextElementSibling && nextObj.nextElementSibling.className.indexOf("end") == -1)
			nextObj.className = tabclass + " line";
	};
	this.createTab = function(){
		var tabObj = document.getElementById(this.id);
		tabObj.className = containerclass;
		var tabHTML = new Array;
		tabHTML.push('<div class="'+tabclass+' end"></div>');
		for(var i=0; i < tabObj.children.length; i++)
		{
			var line = "";
			if(i != tabObj.children.length-1)
				line = " line";
			var tabtext = tabObj.children[i].innerHTML;
			var tabhtml = '<div class="'+tabclass+line+'" onclick="kb.widget.tab.prototype.TabClickHandler(event,\''+this.id+'\',\''+clickaction+'\')" onmouseover="kb.widget.tab.prototype.TabMouseOverHandler(event,\''+this.id+'\',\''+tabclass+'\')" onmouseout="kb.widget.tab.prototype.TabMouseOutHandler(event,\''+this.id+'\',\''+tabclass+'\')">'+tabtext+'</div>';
			tabHTML.push(tabhtml);
		}
		tabHTML.push('<div class="'+tabclass+' end"></div>');
		tabObj.innerHTML = tabHTML.join("");

		// 넓이 재조정
		//임시(480보다 적을 경우 470으로 맞춤-팝업때문)
		var availableWidth = tabObj.clientWidth || 470;
		if(gPhoneType == 1 && availableWidth < 470)
			availableWidth = 470;
		var tabcount = tabObj.children.length-2;
		var padding = 5;
		var cellwidth = parseInt((availableWidth-(4*padding)-(tabcount*(2*padding)))/tabcount, 10);
		for(var i=0; i < tabObj.children.length; i++)
		{
			var divObj = tabObj.children[i];
			if(divObj.className.indexOf("end") == -1)
			{
				divObj.style.width = cellwidth + "px";
			}
		}
		
		//로딩 문제로 한번 더 처리(임시)
		setTimeout(function(){
			//임시(480보다 적을 경우 480으로 맞춤-팝업때문))
			var availableWidth = tabObj.clientWidth || 470;
			if(gPhoneType == 1 && availableWidth < 470)
				availableWidth = 470;
			var tabcount = tabObj.children.length-2;
			var padding = 5;
			var cellwidth = parseInt((availableWidth-(4*padding)-(tabcount*(2*padding)))/tabcount, 10);
			for(var i=0; i < tabObj.children.length; i++)
			{
				var divObj = tabObj.children[i];
				if(divObj.className.indexOf("end") == -1)
				{
					divObj.style.width = cellwidth + "px";
				}
			}
		},100);
		tabObj.tabObj = this;
	};
	this.createTab();
	this.setSelectedTab(defaultindex);
};

kb.widget.tab.prototype.TabMouseOverHandler=function(e, tabid, tabclass)
{
	// 기존값 초기화
	var tabObj = document.getElementById(tabid);
	var alllist = tabObj.querySelectorAll("."+tabclass+".active");
	for(var i=0; i < alllist.length; i++)
	{
		var targetObj = alllist[i];
		var prevObj = targetObj.previousElementSibling;
		var nextObj = targetObj.nextElementSibling;
		if(nextObj.className.indexOf("end") == -1)
			targetObj.className = tabclass+" line";
		else
			targetObj.className = tabclass;
		if(prevObj.previousElementSibling)
			prevObj.className = tabclass+" line";
		if(nextObj.nextElementSibling && nextObj.nextElementSibling.className.indexOf("end") == -1)
			nextObj.className = tabclass+" line";
	}

	var e = e ? e : window.event;
	var targetObj = e.target ? e.target : e.srcElement;
	targetObj.className = tabclass+" active";
	var prevObj = targetObj.previousElementSibling;
	var nextObj = targetObj.nextElementSibling;
	if(prevObj.previousElementSibling)
		prevObj.className = tabclass;
	if(nextObj.nextElementSibling && nextObj.nextElementSibling.className.indexOf("end") == -1)
		nextObj.className = tabclass+" line";
};

kb.widget.tab.prototype.TabMouseOutHandler=function(e, tabid, tabclass)
{
	var e = e ? e : window.event;
	var targetObj = e.target ? e.target : e.srcElement;
	var prevObj = targetObj.previousElementSibling;
	var nextObj = targetObj.nextElementSibling;
	if(nextObj.className.indexOf("end") == -1)
		targetObj.className = tabclass+" line";
	else
		targetObj.className = tabclass;
	if(prevObj.previousElementSibling)
		prevObj.className = tabclass+" line";
	if(nextObj.nextElementSibling && nextObj.nextElementSibling.className.indexOf("end") == -1)
		nextObj.className = tabclass+" line";

	// 기존값 표시
	var controlobj = eval(tabid);
	var targetObj = controlobj.selectedTab;
	targetObj.className = tabclass+" active";
	var prevObj = targetObj.previousElementSibling;
	var nextObj = targetObj.nextElementSibling;
	if(prevObj.previousElementSibling)
		prevObj.className = tabclass;
	if(nextObj.nextElementSibling && nextObj.nextElementSibling.className.indexOf("end") == -1)
		nextObj.className = tabclass+" line";
};

kb.widget.tab.prototype.TabClickHandler=function(e, tabid, _clickaction)
{
	var e = e ? e : window.event;
	var targetObj = e.target ? e.target : e.srcElement;
	if(_clickaction)
	{
		var controlobj = eval(tabid);
		controlobj.selectedTab = targetObj;
		eval(_clickaction+"('"+targetObj.innerHTML+"')");
	}
};
// --------------------------------------------------------------------
// 텝 관련 소스 /E line 1230 ~ line 1375
// ====================================================================


// --------------------------------------------------------------------
// 통신 관련 소스 /S 
// ====================================================================
//데이터 보내기
kb.widget.request = function(sender)
{

	var trid = sender.trid;
	var trsubid = sender.trsubid;
	var trsubitems = sender.trsubitems;
	var senddata = "$senddata('trid',[value])";
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

	try
	{
		UXBridge.request( senddata, kb.widget.callback, this);
	}
	catch(ex)
	{
		alert("[UXBridge.request]:"+ex.message);
	}
}
kb.widget.callback = function(data)
{
	//console.log(data);
}
// --------------------------------------------------------------------
// 통신 관련 소스 /E 
// ====================================================================


// ====================================================================
//  HTML5 Local STORAGE관련 정의 /S
// --------------------------------------------------------------------
// ====================================================================
// STORAGE 관련 시작
// --------------------------------------------------------------------
kb.storage.isAvailableStorage = function(type){
	var available = false;
	
	if(type == "" || type == undefined)
		type = "local";

	switch(type){
		case "local" :
			if(window.localStorage)
				available = true;
			break;
		case "session" :
			if(window.sessionStorage)
				available = true;
			break;
	}
	return available;
};
//로컬스토리지 저장
kb.storage.set = function(key, data, type){
	var storageType = "";

	if(type == undefined && data == undefined){
		data = key;
		key = "tmpKey";
	}
	
	if(type == undefined){
		type = "local";
		storageType = "localStorage";
	}

	if(type == "session")
		storageType = "sessionStorage";
	if(kb.storage.isAvailableStorage(type)){
		eval("window." + storageType + ".setItem('" + key + "', '" + data + "');");
	}else{
		alert("Storage 미지원!!");
		return;
	}
};
//로컬스토리지 불러오기
kb.storage.get = function(key, type){
	var storageType = "";
	
	if(key == "" || key == undefined){
		key = "tmpKey";
	}

	if(type == "" || type == undefined){
		type = "local";
		storageType = "localStorage";
	}

	if(type == "session")
		storageType = "sessionStorage";

	if(kb.storage.isAvailableStorage(type)){
		return eval("window." + storageType + ".getItem('" + key + "');");
	}else{
		alert("Storage 미지원!!");
		return;
	}
};
//임시스토리지 저장
kb.storage.tset = function(key, data){
	var tmp = "";
	if(key == undefined || key == ""){
		alert("임시스토리지 저장 방법이 잘못되었습니다.");
		return;
	}

	if(data == undefined || data == ""){
		tmp = key;
		key = "tmpKey";
		data = tmp;
	}

	$(document).data(key, data);
};
//임시스토리지 불러오기
kb.storage.tget = function(key){
	if(key == undefined || key == ""){
		key = "tmpKey";
	}
	
	return $(document).data(key);
};
// --------------------------------------------------------------------
// STORAGE 관련 끝
// ====================================================================
// --------------------------------------------------------------------
//   HTML5 Local STORAGE관련 정의 /E
// ====================================================================

// ====================================================================
//  사용자정보 세팅  /S
// --------------------------------------------------------------------
kb.storage.delUserInfo = function()
{
	kb.user = {};
	kb.storage.set("userInfo", "");
};
kb.storage.setUserInfo = function(callback)
{
	callback = callback || "kb.storage.userinfo_callback";
	var sender = {
		"type":"userinfo"
		,"action":"list"
		,"callback":callback
	};
	kb.bridge.call(sender);
};
kb.storage.userinfo_callback = function(data)
{
	kb.user = eval("("+data+")");
	kb.storage.set("userInfo", data.replace(/\'/g,"\""));
};
kb.storage.getUserInfo = function(){
	var userInfo = kb.storage.get("userInfo") || "";
	if(userInfo != ""){
		userInfo = eval("("+userInfo+")");
	}
	return userInfo;
};
kb.storage.getAccountInfo = function(){
	var accountInfo = kb.storage.get("accountInfo") || "";
	if(accountInfo != ""){
		accountInfo = eval("("+accountInfo+")");
	}
	return accountInfo;
};
// --------------------------------------------------------------------
//  사용자정보 세팅  /E
// ====================================================================
// ====================================================================
//  TR조회된 전체 텍스트 로그로 보기  /S
// --------------------------------------------------------------------
kb.log = function(jsondata)
{
	document.body.innerHTML = "<div id='logConsole'>"+JSON.stringify(jsondata)+"</div>";
	return false;
};
// --------------------------------------------------------------------
//  사용자정보 세팅  /E
// ====================================================================

// ====================================================================
//  메시지 박스  /S
// --------------------------------------------------------------------
kb.widget.msgbox = function(msg, type)
{
	if(type == undefined || type == ""){
		alert(msg);
	}else if (type == "confirm"){
		if(confirm(msg)){
			return true;
		}else{
			return false;
		}
	}
}
// --------------------------------------------------------------------
//  TR조회된 전체 텍스트 로그로 보기  /E
// ====================================================================

// --------------------------------------------------------------------
// 버튼 터치 효과 관련 시작
// ====================================================================
$(document).ready( function (){
// ###############동적 이벤트($(document)등)이 아이폰에서 걸리지 않아 동작없는 이벤트만 걸어줌./S ###############
// ###############(안드로이드는 없어도 동작하나 아이폰은 없으면 동적일때 제대로 동작하지 않음 /S ###############
	$("#contents").on("vmouseup", function(){
	});
	$("#contents").on("vmousedown", function(){
	});
	$("#contents").on("vclick", function(){
	});
	$("#contents").on("click", function(){
	});
	$("#contents").on("change", function(){
	});
// ###############동적 이벤트($(document)등)이 아이폰에서 걸리지 않아 동작없는 이벤트만 걸어줌./E ###############

// ###############흰색 -> 회색 선택된 상태 버튼 vmousedown, mouseup 이벤트 /S ###############
	$(document).on("vmousedown", ".c-tab-btn", function(){
		$(this).addClass("active");
	});
	$(document).on("vmouseup", ".c-tab-btn", function(){
		$(this).removeClass("active");
	});
// ###############흰색 -> 회색 선택된 상태 버튼 vmousedown, vmouseup 이벤트 /E ###############

// ###############검색 버튼 버튼 vmousedown, vmouseup 이벤트 /S ###############
	$(document).on("vmousedown", ".btn-search", function(){
		$(this).addClass("active");
	});
	$(document).on("vmouseup", ".btn-search", function(){
		$(this).removeClass("active");
	});
	$(document).on("vmousedown", ".btn-search2", function(){
		$(this).addClass("active");
	});
	$(document).on("vmouseup", ".btn-search2", function(){
		$(this).removeClass("active");
	});
	$(document).on("vmousedown", ".btn-b", function(){
		$(this).addClass("active");
	});
	$(document).on("vmouseup", ".btn-b", function(){
		$(this).removeClass("active");
	});
	$(document).on("vmousedown", ".btn-gray1", function(){
		$(this).addClass("active");
	});
	$(document).on("vmouseup", ".btn-gray1", function(){
		$(this).removeClass("active");
	});
	$(document).on("vmousedown", ".btn-red1", function(){
		$(this).addClass("active");
	});
	$(document).on("vmouseup", ".btn-red1", function(){
		$(this).removeClass("active");
	});
	$(document).on("vmousedown", ".btn-green1", function(){
		$(this).addClass("active");
	});
	$(document).on("vmouseup", ".btn-green1", function(){
		$(this).removeClass("active");
	});
	$(document).on("vmousedown", ".btn-brown1", function(){
		$(this).addClass("active");
	});
	$(document).on("vmouseup", ".btn-brown1", function(){
		$(this).removeClass("active");
	});
// ###############검색 버튼 버튼 vmousedown, vmouseup 이벤트 /E ###############

// ###############팝업 닫기버튼 click 이벤트 /S ###############
	//X버튼에 아래의 ID를 모두 붙여서 닫기 처리해야함..
	$(document).on("click", "#popupClose", function(){
		closePopup();
	});
// ###############팝업 닫기버튼 click 이벤트 /E ###############


// ###############사용자 정보 호출 함수 /S ###############
kb.storage.setUserInfo();
// ###############사용자 정보 호출 함수 /S ###############

});
// --------------------------------------------------------------------
// 버튼 터치 효과 관련 끝
// ====================================================================
