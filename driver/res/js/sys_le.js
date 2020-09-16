/*********变量区*********/
var CMS = null;
var DEVICE = {
  profile: null
};
var Le = {
  "les": null,
  "leData": null,
  "keymap": null
}
$.multilang=window.parent.$.multilang;
//函数入口
$(document).ready(function() {
  CMS = window.parent.CMS;
  initDeviceImage();
  $("img").attr("draggable","false");
  var keymapname = "keymap";
  if(CMS.deviceID === 655491218){
    keymapname = "keymapshow";
  }
  $.getJSON("device/" + window.parent.CMS.deviceID + "/data/" + keymapname + ".js", function(json) {
    Le.keymap = [];
    for(var item in json) {
       if(json[item].LocationCode !== -1) {
      Le.keymap.push(json[item]);
       }
    }
    if(window.parent.CMS.deviceConfig.AspectRatio) {
      $('#device').device({
        aspectratio: window.parent.CMS.deviceConfig.AspectRatio,
      });
    }
    $('#device').device({"keymap": Le.keymap});
    $('#device').device({
      "display": {
        "default": "#000"
      }
    });
    $.le({
      onDisplay: function(data) {
        $('#device').device({"display": data});
      }
    });
    initUI();
  });
  window.parent.setLanguage(false);
});

$(document).click(function() {
  // $("#playlist").hide();
  // $("#breath_frame_setting").hide();
});

function initDeviceImage() {
  $("#device").empty();
  var str = '';
  var deviceimgdir = "img";
  if(CMS.deviceID === 655491218){
    deviceimgdir = "imgshow";
  }
  str +=  '<img src="device/' + window.parent.CMS.deviceID + '/' + deviceimgdir + '/device_outline.png" class="device-outline" style="z-index:1;"/>\
  <img src="device/' + window.parent.CMS.deviceID + '/' + deviceimgdir + '/device_panel.png" class="device-panel" />\
  <img src="device/' + window.parent.CMS.deviceID + '/' + deviceimgdir + '/device_keycap.png" class="device-keycap" />';
  $("#device").append(str);
}

//渲染灯效列表
function initUI() {
  Le.les = window.parent.CMS.les;
  renderThemeLightList();
  initProfile();
  $("#apply").click(function() {
    var lightGUID = $('.con-text-act').attr('lightguid');
    var lightName = $('.con-text-act input.con-text-input').val();
    if(lightGUID){
      DEVICE.profile.ModeLE.Name = lightName;
      DEVICE.profile.ModeLE.GUID = lightGUID;
      for(var i=0;i<CMS.devices.length;i++){
        window.parent.changeMode(CMS.devices[i].ModelID, 0);
      }
      onProfileChanged();
    }
  });
  setTimeout(function(){
    var objcomble = $("#lamp-con .con-text[lightguid='" + DEVICE.profile.ModeLE.GUID + "']");
    if(objcomble.length > 0){
      objcomble.click();
      $('#lamp-con').scrollTop(objcomble.index()*36);
      objcomble.index()
    }else{
      initDefaultLight();
    }
  },100);
}

//主题灯效列表显示
function renderThemeLightList() {
  $('.lamp-1 #lamp-con').empty();
  var lampnum = 0;
  for(var i = 0; i < Le.les.length; i++) {
    if(Le.les[i].LeType == "combination") {
      lampnum++;
      var current = i;
      var conTextDiv = $('<div></div>');
      conTextDiv.addClass('con-text').attr('lightguid', Le.les[i]['GUID']);
      
      //var keySpan = $('<span>💻</span>');
      var keySpan = $('<span>' + lampnum + '</span>');
      keySpan.addClass('key-108');
      var conTextInput = $('<input />');
      conTextInput.addClass('con-text-input').attr('type', 'text').val(Le.les[i]['Name']).attr("readonly", "readonly");
      conTextDiv.append(keySpan).append(conTextInput);

      conTextDiv.attr('letype', 'lecombination');
      var combinationLampDiv = $('<div></div>');
      combinationLampDiv.addClass('combination-lamp');
      conTextDiv.append(combinationLampDiv);
      $('#lamp-con').append(conTextDiv);
    }
  }
  //$('#lamp-con').scrollTop( $('#lamp-con')[0].scrollHeight);
  lightOperate();
}

//灯效的操作
function lightOperate() {
  //初始化默认灯效
  //initDefaultLight();
  //触发播放主题灯效
  $("#lamp-con").find(".con-text").click(function() {
    $.le('stop');
    $('#device').device({
      display: {
        default: '#000'
      }
    });
    $("#lamp-con").find(".con-text").removeClass("con-text-act");
    $("#lamp-con").find(".con-text").find(".con-text-input").attr('readonly', 'readonly');
    $(this).addClass("con-text-act");
    var guid = $(this).attr("lightguid");
    window.parent.readLE(guid, function(data) {
      if(!data)
        return;
      Le.leData = data;
      for(var i=0;i<CMS.models.length;i++){
        if(CMS.models[i].ModelID === CMS.deviceID){
          for(var j=0;j<Le.leData.Canvases.length;j++){
            if($.inArray(CMS.models[i].LEType, Le.leData.Canvases[j].DeviceTypes) !== -1){
              $.le('play', Le.leData.Canvases[j]);
              break;
            }
          }
          break;
        }
      }
      //$.le('play', Le.leData.Canvases[0]);
    });
    if(guid === DEVICE.profile.ModeLE.GUID){
      $("#apply").removeClass('btn-breath');
    }else{
      if(!$("#apply").hasClass("btn-breath")){
        $("#apply").addClass('btn-breath');
      }
    }
  });
}

//切换灯效文件
function activeThemeLight(guid) {
  window.parent.readLE(guid, function(data) {
    if(!data)
      return;
    Le.leData = data;
    $.le('play', Le.leData);
  });
}

/*初始化默认灯效*/
function initDefaultLight() {
  if($("#lamp-con .con-text").length > 0) {
    $("#lamp-con .con-text").removeClass('con-text-act');
    $("#lamp-con .con-text:last").addClass('con-text-act');
    activeThemeLight($("#lamp-con .con-text:last").attr('lightguid'));
    $("#lamp-con .con-text:last").click();
    $('#lamp-con').scrollTop( $('#lamp-con')[0].scrollHeight);
  }
}

/*初始化在线默认模式profile*/
function initProfile() {
  var active = false;
  for (var i = 0; (i < CMS.profiles.length); i++) {
    if (CMS.profiles[i].ModeIndex == 0) {
      if (!active && CMS.profiles[i].Active) {
        active = true;
        if (!DEVICE.profile || (DEVICE.profile.GUID != CMS.profiles[i].GUID)) {
          window.parent.readProfile(CMS.deviceID, CMS.profiles[i].GUID, function(data) {
            DEVICE.profile = data;
          });
        }
      }
    }
  }
  if(!active) {
    window.parent.readProfile(CMS.deviceID, CMS.profiles[1].guid, function(data) {
      DEVICE.profile = data;
      DEVICE.profile.Active = 1;
    });
  }
}

function onProfileChanged() {
  window.parent.writeProfile(CMS.deviceID, DEVICE.profile.GUID, DEVICE.profile, function() {
    window.parent.apply(CMS.deviceID, DEVICE.profile.GUID, function(result) {
      $("#apply").removeClass("btn-breath");
      if(!result)
        window.parent.error($.multilang("apply_error"));
    });
  });
}