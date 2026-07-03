(function (window, document) {
  var embed = window.QbotEmbed || {};
  var rootSelector = '.qbot-embed-m';

  function getRoot() {
    return document.querySelector(rootSelector) || document;
  }

  function getValue(id) {
    var root = getRoot();
    var el = root.querySelector ? root.querySelector('#' + id) : document.getElementById(id);
    return el ? el.value : '';
  }

  function getRadioValue(name) {
    var root = getRoot();
    var radios = root.querySelectorAll ? root.querySelectorAll('input[name="' + name + '"]') : document.getElementsByName(name);
    for (var i = 0; i < radios.length; i++) {
      if (radios[i].checked) return radios[i].value;
    }
    return '';
  }

  function go(path) {
    document.location.href = path;
  }

  function goParent(path) {
    parent.location.href = path;
  }

  embed.callMBService = function () {
    window.open('service.html');
  };

  embed.callMBMain = function () {
    go('list01.html');
  };

  embed.callMBListMain = function () {
    go('list02.html');
  };

  embed.callMBListMainP = function () {
    goParent('list02.html');
  };

  embed.callMBMyMain = function () {
    go('list03.html');
  };

  embed.callMBMyMainP = function () {
    goParent('list03.html');
  };

  embed.callMBSELLogicStr = function (logicStr) {
    go('list04_1.html');
  };

  embed.callMBSELLogic = function () {
    go('list04_1.html');
  };

  embed.setMBMainLogic = function () {
    embed.setMBLogic(getRadioValue('rdoPms_code'), 'join');
  };

  embed.setMBLogic = function (pPmsCode, pos) {
    if (getValue('snCust') === '') {
      alert('본 서비스는 퀀트 서비스 신청 후 \n사용 하실 수 있습니다.');
      return;
    }
    if (pPmsCode === '') {
      alert('등록할 전략정보가 선택되지 않았습니다.\n다시 시도하여 주세요.');
      return;
    }
    if (pPmsCode === getValue('pms_code')) {
      alert('해당 전략은 고객님께서 기존에 설정하신 전략입니다.');
      return;
    }

    if (!confirm(getValue('pms_code') === '' ? '해당 전략을 등록하시겠습니까?' : '등록된 전략이 있습니다.\n변경 등록 하시겠습니까?')) {
      alert('변경을 취소하셨습니다');
      return;
    }

    alert('전략선택이 완료 되었습니다.');
    if (pos === 'tabGbD') embed.callMBMyMainP();
    else embed.callMBMyMain();
  };

  embed.goUrl = function (combo) {
    if (combo.value !== '') location.href = combo.value;
  };

  embed.showLayer = function (id) {
    var root = getRoot();
    var layer = root.querySelector ? root.querySelector('#' + id) : document.getElementById(id);
    if (!layer) return;
    layer.style.display = layer.style.display === 'none' || layer.style.display === '' ? 'block' : 'none';
  };

  window.QbotEmbed = embed;

  var legacyNames = ['callMBService', 'callMBMain', 'callMBListMain', 'callMBListMainP', 'callMBMyMain', 'callMBMyMainP', 'callMBSELLogicStr', 'callMBSELLogic', 'setMBMainLogic', 'setMBLogic', 'goUrl', 'showLayer'];
  for (var i = 0; i < legacyNames.length; i++) {
    if (!window[legacyNames[i]]) window[legacyNames[i]] = embed[legacyNames[i]];
  }
})(window, document);
