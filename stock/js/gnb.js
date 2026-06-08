$('#naviWrap').find('#toggle-button').click(function(){
	$(this).parent().parent().parent().find('dd').slideToggle('normal');
});


//GNB 네비게이션
//토글 버튼
function toggleBtn(id, src_a, src_b ){
	var btnImg = document.getElementById(id);
	// 이미지 식별자가 없다면, 함수를 빠져 나간다.
	if( btnImg.length == 0 ) return;
	
	// 이미지 A 를 클릭한 경우 (이미지 경로 정보에 이미지 A 의 경로가 포함되어 있을 경우)
	if ( btnImg.src.indexOf( src_a ) >= 0 ){
		// 이미지 B 로 전환한다.
		btnImg.src = src_b;
		return;
	}	
	// 이미지 B 를 클릭한 경우 (이미지 경로 정보에 이미지 B 의 경로가 포함되어 있을 경우)
	if ( btnImg.src.indexOf( src_b ) >= 0 ){
		// 이미지 A 로 전환한다.
		btnImg.src = src_a;
		return;
	}
	// 함수 종료
	return;
}

//탑네비 변화
var bgChange = document.getElementById('bgChange');
var obj = document.getElementById('naviWrap');
var objdl = obj.getElementsByTagName('dl');
function bg(thisobj,num){
	thisobj.className = 'over';
	bgChange.className = 'bg' + num;
	objA = thisobj.getElementsByTagName('a');
	for(var k=0; k<objA.length; k++){
		objA[k].className += ' over';
	}
}

function bgout(thisobj){
	thisobj.className = '';
	bgChange.className = '';
	objA = thisobj.getElementsByTagName('a');
	for(var k=0; k<objA.length; k++){
		objA[k].className = '';
	}
}
