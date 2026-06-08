function addLoadEvent(func) {
	var oldonload = window.onload;
	if (typeof window.onload != 'function') {
		window.onload = func;
	} else {
		window.onload = function() {
			oldonload();
			func();
		}
	}
}

function insertAfter(newElement,targetElement) {
	var parent = targetElement.parentNode;
	if (parent.lastChild == targetElement) {
		parent.appendChild(newElement);
	} else {
		parent.insertBefore(newElement,targetElement.nextSibling);
	}
}

function addClass(element,value) {
	if (!element.className) {
		element.className = value;
	} else {
		newClassName = element.className;
		newClassName+= " ";
		newClassName+= value;
		element.className = newClassName;
	}
}

//���� login ��
function logTab(id1,id2){
	document.getElementById('logtab'+id1).className ="on";
	document.getElementById('logtab'+id2).className ="";
	document.getElementById('logcont'+id1).style.display ="block";
	document.getElementById('logcont'+id2).style.display ="none";
}

//���� ��
function mainTab(obj,objid,imgid,n) {
	var obj = document.getElementById(objid).getElementsByTagName(obj);

	tabImg(obj,objid,imgid,n);

	for (i=1; i<=obj.length; i++ ) 
	{
		if (i == n)	document.getElementById(objid+i).style.display = "block";
		else	document.getElementById(objid+i).style.display = "none";
	}
}
// ���̹���
function tabImg(obj,objid,imgid,n){
	var imgSrc, lastIndex, strFileName = "";
	if(imgid != "") {
		imgSrc = document.getElementById(imgid+n).src; // "imgid_on.gif"
		lastIndex = imgSrc.lastIndexOf('_'); //lastIndex = ������ "_"�� ��ġ��ȣ
		strFileName = imgSrc.substring(lastIndex + 1, imgSrc.length); //strFileName = "on.gif"
	}
	//alert(obj.length);
	for (i=1; i<=obj.length; i++ ) 
	{
		if (i == n && imgid != ""){
			if(strFileName != "on.gif") {//�̹� on.gif�� ��� �н�
				document.getElementById(imgid+i).src = document.getElementById(imgid+i).src.replace('.gif','_on.gif');
			}
			document.getElementById(imgid+i).parentNode.className = "on"; //���� ���
		}else{
			if(imgid != ""){
				document.getElementById(imgid+i).src = document.getElementById(imgid+i).src.replace('_on.gif','.gif');
				document.getElementById(imgid+i).parentNode.className = ""; //���� ���
			}
		}
	}
}

//�ѿ��� �̹��� Ŭ���������� ����
//class="imgover" �� �̹����� ����
function initRollovers() {
		if (!document.getElementById) return
		
		var aPreLoad = new Array();
		var sTempSrc;
		var aImages = document.getElementsByTagName('img');

		for (var i = 0; i < aImages.length; i++) {
				if (aImages[i].className == 'imgover') {
						var src = aImages[i].getAttribute('src');
						var ftype = src.substring(src.lastIndexOf('.'), src.length);
						var hsrc = src.replace(ftype, '_on'+ftype);

						aImages[i].setAttribute('hsrc', hsrc);
						
						aPreLoad[i] = new Image();
						aPreLoad[i].src = hsrc;
						
						aImages[i].onmouseover = function() {
								sTempSrc = this.getAttribute('src');
								this.setAttribute('src', this.getAttribute('hsrc'));
						}
						
						aImages[i].onmouseout = function() {
				if (!sTempSrc) sTempSrc = this.getAttribute('src').replace('_on'+ftype, ftype);
				this.setAttribute('src', sTempSrc);
			}
		}
	}
}
addLoadEvent(initRollovers);
addLoadEvent(tableSet);

function showHideElem1(_objId, _param_split, obj){
	var showObj = document.getElementById(_objId);
	if(!showObj) return false;
	//��Ÿ�� ��ü�� �ְ� ���� ��ü�� �ټ��ΰ��
	if(_param_split){
		//���� ��ü�� ���ڿ�(����ٸ� �����ڷ� �Ķ���͸� �޴´�)
		var hideObjId_arr = _param_split.split("_");
		//���� ��ü �迭
		var hideObj_arr = Array();
		for(i=0; i<hideObjId_arr.length; i++){
			hideObj_arr[i] = document.getElementById(hideObjId_arr[i]);
		}
		//���� ��ü �����
		for(i=0; i<hideObj_arr.length; i++){
			if(hideObj_arr[i].style){
				hideObj_arr[i].style.display = "none";
			}else{
				return false;
			}
		}
		//��Ÿ�� ��ü ��Ÿ����
		showObj.style.display = "block";
	}
	//��Ÿ���ų� ���� ��ü�� �Ѱ��� ��� 
	else{
		if(showObj.style.display == "block"){
			showObj.style.display = "none";
		}else{
			showObj.style.display = "block";
		}
	}
}

/* tr seting */
function tableSet(){
	var obj = document.getElementsByTagName("table");
	if(obj.length<=0) return;
	for(i=0;i<obj.length;i++){
		if(obj[i].className.indexOf("tOver") > -1 || obj[i].className.indexOf("tView") > -1){
			var objTr = obj[i].getElementsByTagName("tbody")[0].rows;
			var step = (obj[i].className.indexOf("tView") > -1) ? 2 : 1;
			for(j=0;j<objTr.length;j=j+step){
				if(obj[i].className.indexOf("tView") > -1){
					objTr[j].onclick = function(){tClick(this)};
					objTr[j+1].style.display = "none";
					objTr[j].style.cursor = "pointer";
				}
				objTr[j].onmouseover = function(){ this.className += " this";	}
				objTr[j].onmouseout = function(){ this.className = this.className.replace("this",""); }
			}
		}
		function tClick(obj){
			var objTr = obj.parentNode.rows;
			for(j=0;j<objTr.length;j=j+2){
				if(objTr[j]==obj){
					objTr[j].className += " this";
					objTr[j+1].style.display = (user.IE) ? "block" : "table-row";
					objTr[j].onclick = null;
				}else{
					objTr[j].className = objTr[j].className.replace("this","");
					objTr[j+1].style.display = "none";
					objTr[j].onclick = function(){tClick(this)};
				}
			}
		}
	}
}

function marketSet(){
	var obj = document.getElementsByTagName("dl");
	if(obj.length<=0) return;
	for(i=0;i<obj.length;i++){
		if(obj[i].className.indexOf("tOver") > -1 ){
				obj[i].onmouseover = function(){ 
					this.className += " this";	
				}
				obj[i].onmouseout = function(){ 
					this.className = this.className.replace("this",""); 
				}
		}
	}
}

//Faq���� ������ġ��
function faq_list(){
	var obj_p = document.getElementById('faq-list');
	var obj_li = obj_p.getElementsByTagName('li');
	for(var i=0; i<obj_li.length; i++){
		if(obj_li[i].getElementsByTagName('div')[0].getElementsByTagName('a')[0]){
			obj_li[i].getElementsByTagName('div')[0].getElementsByTagName('a')[0].onclick = function(){
				this.blur();
			}		}else return;
		obj_li[i].getElementsByTagName('div')[0].onclick = function(){
			if(this.parentNode.getElementsByTagName('div')[1].style.display == 'block'){
				this.parentNode.getElementsByTagName('div')[1].style.display = 'none';
				this.className = 'faq-q';
				return false;
			}else{
				this.parentNode.getElementsByTagName('div')[1].style.display = 'block';
				this.className = 'faq-q current';
				return false;
			}
		}
	}
}

/* ��Ʈ�ʽ� ������� */
function partnerRolling(){
	var divId = document.getElementById('partnerRolling');
	var objli = divId.getElementsByTagName("dl");
	for(var i = 0 ; i<objli.length; i++){
		objli[i].onmouseover = function(){
			this.className = "over";
			this.parentNode.className = "over";
		}
		objli[i].onmouseout = function(){
			this.className = "";
			this.parentNode.className = "";
		}
	}
}

function showLayer(layerId){
	allClose('layer');
	document.getElementById(layerId).style.display = "block";
}
function hideLayer(layerId){
	document.getElementById(layerId).style.display = "none";
}

function allClose(layer){
	for(var i=1; i<=10; i++){
		if(document.getElementById(layer+i))
			document.getElementById(layer+i).style.display = "none";
		else return false;
	}
}

//�˾�
function popup(url,name,w,h,s){
	var xPos = (window.screen.availWidth - w)/2;
	var yPos = (window.screen.availHeight - h)/2;
	win = window.open(url,name,'width='+w+',height='+h+',left='+xPos+',top='+yPos+',scrollbars='+s+',status=1');
	win.focus();
}

/* footer select box */
Event = {};
Event.addListener = function(element, name, observer, useCapture) {
		useCapture = useCapture || false;

	if (element.addEventListener) {
		element.addEventListener(name, observer, useCapture);
	} else if (element.attachEvent) {
		element.attachEvent('on' + name, observer);
	}
}
Event.removeListener = function(element, name, observer, useCapture) {
	useCapture = useCapture || false;
	
	if (element.removeEventListener) {
		element.removeEventListener(name, observer, useCapture);
	} else if (element.detachEvent) {
		element.detachEvent('on' + name, observer);
	}
}
Event.getTarget = function(event) {
	if (event == null) return null;
	if (event.target) return event.target;
	else if (event.srcElement) return event.srcElement;
	return null;
}
Event.stopPropagation = function(event) {
	if (event.stopPropagation) {
			event.stopPropagation();
	} else {
			event.cancelBubble = true;
	}
}
Event.preventDefault = function(event) {
	if (event.preventDefault) {
			event.preventDefault();
	} else {
			event.returnValue = false;
	}
}
Event.stopEvent = function(event) {
	Event.stopPropagation(event);
	Event.preventDefault(event);
}
Event.bindAsListener = function(func, obj) {
	return function() {
		return func.apply(obj, arguments);
	}
}

