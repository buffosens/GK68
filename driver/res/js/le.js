/*********变量区*********/
var CMS = {}
var lightEditMode = 0;   //0代表灯效列表，1为帧设置，2为灯效指定设置页面
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
  $.getJSON("device/" + CMS.deviceID + "/data/keymap.js", function(json) {
    //Le.keymap = json;
    Le.keymap = [];
    for(var item in json) {
       if(json[item].LocationCode !== -1) {
      Le.keymap.push(json[item]);
       }
    }
    if(CMS.deviceConfig.AspectRatio) {
      $('#device').device({
        aspectratio: CMS.deviceConfig.AspectRatio,
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
    initUIEvent();
  });
  window.parent.setLanguage(false);
});

$(document).click(function() {
  $("#playlist").hide();
  $("#breath_frame_setting").hide();
});

function initDeviceImage() {
  $("#device").empty();
  var str = '';
  str +=  '<img src="device/' + CMS.deviceID + '/img/device_outline.png" class="device-outline" />\
  <img src="device/' + CMS.deviceID + '/img/device_panel.png" class="device-panel" />\
  <img src="device/' + CMS.deviceID + '/img/device_keycap.png" class="device-keycap" />';
  $("#device").append(str);
  disableImgDraggable();
}

function initColorPicker() {
  $('#colorpickerHolder').ColorPicker({flat: true});

  $('#colorpickerHolder2').ColorPicker({
      flat: true,
      color: '#00ff00',
      onSubmit: function(hsb, hex, rgb) {
          $('#colorSelector2 div').css('backgroundColor', '#' + hex);
      }
  });
  $('#colorpickerHolder2>div').css('position', 'absolute');
  var widt = false;
  $('#colorSelector2').bind('click', function() {
      $('#colorpickerHolder2').stop().animate({height: widt ? 0 : 173}, 500);
      widt = !widt;
  });

  $('#colorpickerField1, #colorpickerField2, #colorpickerField3').ColorPicker({
      onSubmit: function(hsb, hex, rgb, el) {
          $(el).val(hex);
          $(el).ColorPickerHide();
      },
      onBeforeShow: function () {
          $(this).ColorPickerSetColor(this.value);
      }
  })
  .bind('keyup', function() {
      $(this).ColorPickerSetColor(this.value);
  });
  $('#colorSelector').ColorPicker({
      color: '#0000ff',
      onShow: function (colpkr) {
          $(colpkr).fadeIn(500);
          return false;
      },
      onHide: function (colpkr) {
          $(colpkr).fadeOut(500);
          return false;
      },
      onChange: function (hsb, hex, rgb) {
          $('#colorSelector div').css('backgroundColor', '#' + hex);
      }
  });
}

//渲染灯效列表
function initUI() {
  Le.les = CMS.les;
  renderThemeLightList();
  initColorPicker();
}

//初始化UI配置
function initUIEvent() {
  keyOperate();
  lightManaging();
  frameManaging();
  lightConfigManaging();
}

//主题灯效列表显示
function renderThemeLightList() {
  $('.lamp-1 #lamp-con').empty();
  for(var i = 0; i < Le.les.length; i++) {
    if(Le.les[i].LeType == "combination")
      continue;
    if(CMS.deviceConfig.LeCate && Le.les[i].LeCate && (CMS.deviceConfig.LeCate == Le.les[i].LeCate)) {
      var current = i;
      var conTextDiv = $('<div></div>');
      conTextDiv.addClass('con-text').attr('lightguid', Le.les[i]['GUID']);
      if(current === (Le.les.length-1)) {
        conTextDiv.addClass('con-text-act');
        Le.letype = Le.les[i].LeType;
      }
      var keySpan = $('<span></span>');
      keySpan.addClass('key-108');
      var conTextInput = $('<input />');
      conTextInput.addClass('con-text-input').attr('type', 'text').val(Le.les[i]['Name']).attr("readonly", "readonly");
      conTextDiv.append(keySpan).append(conTextInput);
      var conShareDiv = $('<div></div>');
      conShareDiv.addClass('con-share');
      conTextDiv.append(conShareDiv);
      $('#lamp-con').append(conTextDiv);
    } else if (!CMS.deviceConfig.LeCate && !Le.les[i].LeCate) {
      var current = i;
      var conTextDiv = $('<div></div>');
      conTextDiv.addClass('con-text').attr('lightguid', Le.les[i]['GUID']);
      if(current === (Le.les.length-1)) {
        conTextDiv.addClass('con-text-act');
        Le.letype = Le.les[i].LeType;
      }
      var keySpan = $('<span></span>');
      keySpan.addClass('key-108');
      var conTextInput = $('<input />');
      conTextInput.addClass('con-text-input').attr('type', 'text').val(Le.les[i]['Name']).attr("readonly", "readonly");
      conTextDiv.append(keySpan).append(conTextInput);
      var conShareDiv = $('<div></div>');
      conShareDiv.addClass('con-share');
      conTextDiv.append(conShareDiv);
      $('#lamp-con').append(conTextDiv);
    }
  }
  $('#lamp-con').scrollTop( $('#lamp-con')[0].scrollHeight);
  lightOperate();
}

//灯效的操作
function lightOperate() {
  //初始化默认灯效
  initDefaultLight();
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
      $.le('play', Le.leData);
    });
  });

  //修改名称
  $("#lamp-con").find(".con-text").find(".con-text-input").dblclick(function() {
    $(this).prop("readonly", false);
    $(this).focus().select();
  });

  //修改名称成功
  $("#lamp-con").find(".con-text").find(".con-text-input").blur(function() {
    $this = $(this);
    $this.attr('readonly', 'readonly');
    var lightName = $this.val();
    var lightGUID = $this.parent().attr("lightguid");
    if(lightName == "") {
      window.parent.warning($.multilang("le_name_empty"));
      window.parent.readLE(lightGUID, function(data) {
        $this.val(data.Name);
        $this.focus();
      });
      return;
    }

    var flag = true;
    for(var i = 0; i < Le.les.length; i++) {
      if(lightName == Le.les[i].Name && lightGUID == Le.les[i].GUID) {
        flag = false;
        break;
      }else if(lightName == Le.les[i].Name && lightGUID != Le.les[i].GUID) {
        console.log(lightName,lightGUID,i)
        console.log(Le.les[i].Name, Le.les[i].GUID,i)
        flag = false;
        window.parent.warning($.multilang("le_name_exist"));
        window.parent.readLE(lightGUID, function(data) {
          $this.val(data.Name);
        });
        break;
      }
    }

    if(flag) {
      Le.leData.Name = lightName;
      window.parent.writeLE(Le.leData.GUID, Le.leData, function(data) {
        for (var i = 0; i < Le.les.length; i++) {
          if (Le.les[i].GUID == Le.leData.GUID) {
            Le.les[i].Name = Le.leData.Name;
            break;
          }
        }
        window.parent.writeLEList(Le.les);
      });
    }
    
    $.le('stop');
    $('#device').device({
      display: {
        default: '#000'
      }
    });
  });

}

//帧列表显示
function renderThemeLightFrameList(guid) {
  window.parent.readLE(guid, function(data) {
    if(!data)
      return;
    Le.leData = data;
    showFrames();
  });
}

//生成帧列表
function showFrames() {
  var lightData = Le.leData;
  var lightGUID = lightData.GUID;
  var themeLightData = lightData.Frames;
  $("#con-frame").empty();
  $("#animate").attr("lightguid", lightGUID);
  if(themeLightData.length > 0)
    $("#animate").attr("frameindex", themeLightData.length - 1);
  for(var i = 0; i < themeLightData.length; i++) {
    var conTextListDiv = $('<div></div>');
    i == themeLightData.length-1 ? conTextListDiv.addClass('con-text-list con-text-list-act') : conTextListDiv.addClass('con-text-list');
    var conTextNumDiv = $('<div></div>');
    conTextNumDiv.addClass('con-text-num');
    var input = $('<input />');
    input.attr('type', 'text').val(themeLightData[i].Count).attr('value', themeLightData[i].Count);
    conTextNumDiv.append(input);
    var conTextNameInput = $('<input />');
    conTextNameInput.addClass('con-text-name').attr('type', 'text').val(themeLightData[i].Name).attr('readonly', 'readonly').attr('value', themeLightData[i].Name);
    var conTextSpanDeleteSpan = $('<span></span>');
    conTextSpanDeleteSpan.addClass('con-text-span-delete');
    conTextListDiv.append(conTextNumDiv).append(conTextNameInput).append(conTextSpanDeleteSpan);
    $("#con-frame").append(conTextListDiv);
  }
  frameOperate();
}

//灯效配置列表显示
function renderLightConfig() {
  var lightData = Le.leData;
  var lightConfig = lightData.LEConfigs;

  $("#con-color").empty();
  if(lightConfig === null)
    return;
  if(Object.prototype.toString.call(lightConfig) === '[object Array]' && lightConfig.length === 0)
    return;
  var lightConfigStr = '';
  if(lightConfig.length > 0)
    $("#light_setting").attr("lightconfigindex", lightConfig.length - 1);

  for (var i = 0; i < lightConfig.length; i++) {
    if(lightConfig[i].Type == 1) {
      lightConfigStr += '<div class="con-text-list">\
        <div class="con-text-num">\
        <input type="text" value="'+ lightConfig[i].Count +'" class="framecount-setting framecount-common">\
        </div>\
        <div class="con-defult" color="'+ lightConfig[i].Color +'"></div>\
        <p class="con-text-color-name" cms-lang="le_monochrome1">'+$.multilang('le_rgb')+'</p>\
        <span class="con-text-span-delete"></span>\
        </div>'
    } else if(lightConfig[i].Type == 0) {
      lightConfigStr += '<div class="con-text-list">\
        <div class="con-text-num">\
        <input type="text" value="'+ lightConfig[i].Count +'" class="framecount-setting framecount-common">\
        </div>\
        <div class="con-defult" color="'+ lightConfig[i].Color +'"></div>\
        <p class="con-text-color-name" cms-lang="le_monochrome1">'+$.multilang('le_monochrome')+'</p>\
        <span class="con-text-span-delete"></span>\
        </div>'
    } else if(lightConfig[i].Type == 2) {
      lightConfigStr += '<div class="con-text-list">\
        <div class="con-text-num">\
        <input type="text" value="'+ lightConfig[i].Count + '+' + lightConfig[i].StayCount +'" class="framecount-setting framecount-breath">\
        </div>\
        <div class="con-defult" color="'+ lightConfig[i].Color +'"></div>\
        <p class="con-text-color-name" cms-lang="le_monochrome1">'+$.multilang('le_breathing')+'</p>\
        <span class="con-text-span-delete"></span>\
        </div>'
    }
  }
  $("#con-color").append(lightConfigStr);
  $('#lightcolor_setting').scrollTop( $('#lightcolor_setting')[0].scrollHeight );

  lightConfigOperate();
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

//显示灯效配置
function playLightConfig(lightConfigIndex) {
  stopLightConfig();
  var lightData = Le.leData;
  var lightConfig = lightData.LEConfigs;
  var keyArray = lightConfig[lightConfigIndex].Keys;
  var keyColor = lightConfig[lightConfigIndex].Color;
  var lightType = lightConfig[lightConfigIndex].Type;
  keyColor = keyColor.replace("0x","#");
  var config = {};
  if(keyArray === null || ((Object.prototype.toString.call(keyArray) === '[object Array]') && (keyArray.length === 0)))
    return;
  for (var  j = 0; j < keyArray.length; j++) {
    var index = keyArray[j];
    config[index] = keyColor;
  }
  var data = {
    "default": null,
    "config": config
  }

  $('#device').device({"display": data});
}

//停止显示灯效配置
function stopLightConfig() {
  var data = {
    "default": "#000000",
    "config": null
  }
  $('#device').device({"display": data});
}

function keyOperate() {
  $('#device').device({
    "onSingleSelect": function (keyItem) {
      if (Le.leData === null)
        return;
      var lightData = Le.leData;
      var themeLightData = lightData.Frames;
      var lightConfig = lightData.LEConfigs;
      var keyColor;
      var locationCode = keyItem.LocationCode;

      if(lightEditMode == 1) {
        var frameIndex = $("#animate").attr("frameIndex");
        if(typeof(frameIndex) != "undefined") {
          frameIndex = parseInt(frameIndex);
          var config = {}
          if(!themeLightData[frameIndex].Data.hasOwnProperty(locationCode)) {
            keyColor = "0xffffff";
            themeLightData[frameIndex].Data[locationCode] = keyColor;
          } else {
            delete themeLightData[frameIndex].Data[locationCode];
          }
          for(var index in themeLightData[frameIndex].Data) {
            config[index] = themeLightData[frameIndex].Data[index].replace("0x", "#")
          }
        }
      } else if(lightEditMode == 2) {
        var lightConfigIndex = $("#light_setting").attr("lightconfigindex");
        if(typeof(lightConfigIndex) != "undefined") {
          lightConfigIndex = parseInt(lightConfigIndex);
          locationCode = parseInt(locationCode);
          var locationCodeIndex = lightConfig[lightConfigIndex].Keys.indexOf(locationCode);
          var config = {}
          if (locationCodeIndex === -1) {
            lightConfig[lightConfigIndex].Keys.push(locationCode);
          } else {
            lightConfig[lightConfigIndex].Keys.splice(locationCodeIndex, 1);
          }
          for(var i = 0; i < lightConfig[lightConfigIndex].Keys.length; i++) {
            config[lightConfig[lightConfigIndex].Keys[i]] = lightConfig[lightConfigIndex].Color.replace("0x", "#");
          }
        }
      } else {
        return false;
      }

      var data = {
        "default": null,
        "config": config
      }

      $('#device').device({"display": data});
    }
  });

  $('#device').device({
    "onMultiSelect": function (locationCodes) {
      if (Le.leData === null)
        return;
      var lightData = Le.leData;
      var themeLightData = lightData.Frames;
      var lightConfig = lightData.LEConfigs;
      var keyColor;
      if(lightEditMode == 1) {
        var frameIndex = $("#animate").attr("frameIndex");
        if(typeof(frameIndex) != "undefined") {
          frameIndex = parseInt(frameIndex);
          var config = {};
          for (var i = 0; i < locationCodes.length; i++) {
            var locationCode = locationCodes[i];
            if(!themeLightData[frameIndex].Data.hasOwnProperty(locationCode)) {
              keyColor = "0xffffff";
              themeLightData[frameIndex].Data[locationCode] = keyColor;
            } else {
              delete themeLightData[frameIndex].Data[locationCode];
            }
          }
          for(var index in themeLightData[frameIndex].Data) {
            config[index] = themeLightData[frameIndex].Data[index].replace("0x", "#")
          }
        }
      } else if(lightEditMode == 2) {
        var lightConfigIndex = $("#light_setting").attr("lightconfigindex");
        if(typeof(lightConfigIndex) != "undefined") {
          lightConfigIndex = parseInt(lightConfigIndex);
          var config = {};
          for (var i = 0; i < locationCodes.length; i++) {
            var locationCode = locationCodes[i];
            var locationCodeIndex = lightConfig[lightConfigIndex].Keys.indexOf(locationCode);
            if( locationCodeIndex === -1) {
              lightConfig[lightConfigIndex].Keys.push(locationCode);
            } else {
              lightConfig[lightConfigIndex].Keys.splice(locationCodeIndex, 1);
            }
          }
          for(var i = 0; i < lightConfig[lightConfigIndex].Keys.length; i++) {
            config[lightConfig[lightConfigIndex].Keys[i]] = lightConfig[lightConfigIndex].Color.replace("0x", "#");
          }
        }
      } else {
        return false;
      }

      var data = {
        "default": null,
        "config": config
      }
      $('#device').device({"display": data});
    }
  });

  $("#num_row").find("li").click(function() {
    var index = $(this).index();
    var lightData = Le.leData;
    var themeLightData = lightData.Frames;
    var lightConfig = lightData.LEConfigs;
    var keyColor;
    var config = {};
    var isLight = true;

    if(lightEditMode == 1) {
      var frameIndex = $("#animate").attr("frameIndex");
      if(typeof(frameIndex) === "undefined")
        return false;
      frameIndex = parseInt(frameIndex);
      keyColor = "0xffffff";
      if(index < 6) {
        var startIndex = 22 * index;
        var endIndex = 22 * (index + 1);
        for (var k = startIndex; k < endIndex; k++) {
          for (var i = 0; i < $(".device-keylight").length; i++) {
            if($(".device-keylight").eq(i).data("locationcode") == k) {
              if(!themeLightData[frameIndex].Data.hasOwnProperty(k.toString()))
                isLight = false;
            }
          }
        }

        if(!isLight) {
          for (var k = startIndex; k < endIndex; k++) {
            for (var i = 0; i < $(".device-keylight").length; i++) {
              if($(".device-keylight").eq(i).data("locationcode") == k) {
                themeLightData[frameIndex].Data[k.toString()] = keyColor;
              }
            }
          }
        } else {
          for (var k = startIndex; k < endIndex; k++) {
            for (var i = 0; i < $(".device-keylight").length; i++) {
              if($(".device-keylight").eq(i).data("locationcode") == k) {
                delete themeLightData[frameIndex].Data[k.toString()];
              }
            }
          }
        }
      } else if(index === 6) {
        for (var k = 0 ; k < 132; k++) {
          themeLightData[frameIndex].Data[k.toString()] = keyColor;
        }
      } else if(index === 7) {
        for (var k = 0 ; k < 132; k++) {
          delete themeLightData[frameIndex].Data[k.toString()];
        }
      }

      for(var index in themeLightData[frameIndex].Data) {
        config[index] = keyColor.replace("0x", "#");
      }
    } else if(lightEditMode == 2) {
      var lightConfigIndex = $("#light_setting").attr("lightconfigindex");
      if(typeof(lightConfigIndex) === "undefined")
        return false;
      lightConfigIndex = parseInt(lightConfigIndex);
      keyColor = lightConfig[lightConfigIndex].Color;
      if(index < 6) {
        var startIndex = 22 * index;
        var endIndex = 22 * (index + 1);
        for (var k = startIndex; k < endIndex; k++) {
          for (var i = 0; i < $(".device-keylight").length; i++) {
            if($(".device-keylight").eq(i).data("locationcode") == k) {
              if(lightConfig[lightConfigIndex].Keys.indexOf(k) == -1)
                isLight = false;
            }
          }
        }

        if(!isLight) {
          for (var k = startIndex; k < endIndex; k++) {
            for (var i = 0; i < $(".device-keylight").length; i++) {
              if($(".device-keylight").eq(i).data("locationcode") == k && lightConfig[lightConfigIndex].Keys.indexOf(k) == -1) {
                lightConfig[lightConfigIndex].Keys.push(k);
              }
            }
          }
        } else {
          for (var k = startIndex; k < endIndex; k++) {
            for (var i = 0; i < $(".device-keylight").length; i++) {
              if($(".device-keylight").eq(i).data("locationcode") == k && lightConfig[lightConfigIndex].Keys.indexOf(k) != -1) {
                var configKeyIndex = lightConfig[lightConfigIndex].Keys.indexOf(k);
                lightConfig[lightConfigIndex].Keys.splice(configKeyIndex, 1);
              }
            }
          }
        }
      } else if(index === 6) {
        for (var k = 0 ; k < 132; k++) {
          lightConfig[lightConfigIndex].Keys.push(k);
        }
      } else if(index === 7) {
        for (var k = 0 ; k < 132; k++) {
          var configKeyIndex = lightConfig[lightConfigIndex].Keys.indexOf(k);
          lightConfig[lightConfigIndex].Keys.splice(configKeyIndex, 1);
        }
      }
      for (var j = 0; j < lightConfig[lightConfigIndex].Keys.length; j++) {
        config[lightConfig[lightConfigIndex].Keys[j]] = keyColor.replace("0x", "#");
      }
    } else {
      return false;
    }

    var leData = {
        "default": null,
        "config": config
    }
    $('#device').device({"display": leData});

  });
}

//灯效的管理
function lightManaging() {
  $('#custom_light .lamp-con-left').find('.addcon').click(function(e) {
    onAddLightProfile('simple');
  })

  $('#custom_light .lamp-con-left').find('.con-text-span').click(function() {
    var lightGUID = $('.con-text-act').attr('lightguid');
    if(!lightGUID) return;
    if (lightGUID == Le.leData.GUID) {
      $.le('stop');
      $('#device').device({
        display: {
          default: '#000'
        }
      });
    }
    onDeleteLightProfile(lightGUID);
  });

  $('#custom_light .lamp-con-left').find('.con-text-copy').click(function() {
    var lightGUID = $('.con-text-act').attr('lightguid');
    if(!lightGUID) return;
    window.parent.readLE(lightGUID, function(data) {
        if(!data)
          return;
        Le.leData = data;
        data.GUID=window.getGuid();
        var nameIndex = 1;
        var nameSuffix = data.Name + nameIndex;
        var flag=true;
        while(flag)
        {
          var i = 0;
          for (i;i<Le.les.length;i++) {
            if (nameSuffix === Le.les[i].Name) {
              nameIndex++;
              nameSuffix = data.Name + nameIndex;
              break;
            }
          }

          if(i==Le.les.length)
            flag=false;
        }

        data.Name=nameSuffix;
        window.parent.writeLE(data.GUID, data, function() {
          var newProfileItem = {
            "GUID": data.GUID,
            "Name": data.Name,
          }
          if(CMS.deviceConfig.LeCate) {
            newProfileItem.LeCate = CMS.deviceConfig.LeCate;
          }
          newProfileItem.LeType = data.hasOwnProperty('Canvases') ? 'combination' : 'simple';
          Le.les.push(newProfileItem);
          renderThemeLightList();
        });
      });
  });

  $('#custom_light .lamp-con-left').find('.con-text-button').click(function() {
    var guid = $('.con-text-act').attr('lightguid');
    if(!guid) return;
    $('.lamp-two-buttom').show();
    if(!$('.lamp-2 #more').hasClass('disable-color'))
      $('.lamp-2 #more').addClass('disable-color');

    renderThemeLightFrameList(guid);
    $("#lamp-con").find(".con-text-input").removeClass("con-selected");
    $("#lamp-con").find(".con-text-p").removeClass("con-selected");
    $.le('stop');
    $('#device').device({
      display: {
        default: '#000'
      }
    });
    $("#custom_light").hide();
    $("#animate").show();
    $("#num_row").show();
    lightEditMode = 1;
    var MultiSelectFlag = {
      "flag": true
    }
    $('#device').device({"MultiSelectFlag": MultiSelectFlag});
    $('.lamp-2').show();
    $('.lamp-2 .lamp-con-left').show();
    $('.lamp-2 .lamp-two').show();
    $(".lamp-2 .play-bg").show();
    $('.lamp-2 .lamp-cancel').show();
    $('.lamp-2 .lamp-save').show();
    $(".lamp-3 .play-bg").show();
    $('.lamp-3 .lamp-cancel').show();
    $('.lamp-3 .lamp-save').show();
  });
 //导出灯效配置文件
  $("#download_le").click(function() {
    var eleItem = $("#lamp-con").find(".con-text.con-text-act");
    if(eleItem.length > 0) {
      onExportLightProfile();
    } else {
      window.parent.warning($.multilang("le_export_lightfile_warning"));
    }
  });

  //导入灯效配置文件
  $("#import_le").click(function() {
      onImportLightProfile();
  });
}

/*初始化默认灯效*/
function initDefaultLight() {
  if($("#lamp-con .con-text").length > 0) {
    $("#lamp-con .con-text").removeClass('con-text-act');
    $("#lamp-con .con-text:last").addClass('con-text-act');
    activeThemeLight($("#lamp-con .con-text:last").attr('lightguid'));
  }
}

//帧管理
function frameManaging() {
  $("#animate .lamp-con-left").find(".con-text-copy").click(function() {
    var frameIndex = $('.con-text-list-act').index();
    var currentFrammeData = Le.leData['Frames'][frameIndex];
    var newFrammeData = $.extend(true, {}, currentFrammeData);
    newFrammeData['Name'] = currentFrammeData['Name'] + '_copy';
    Le.leData['Frames'].push(newFrammeData);
    showFrames();
  });

  $("#animate .lamp-con-left").find(".addcon").click(function() {
    addFrame();
  });

  $('.con-text-addcon').click(function() {
    addFrame();
  });

  $("#animate .lamp-con-left").find(".con-text-span").click(function() {
    var frameIndex = $('.con-text-list-act').index();
    deleteLightFrame(frameIndex);
  });

  $("#animate .lamp-con-left").find('.up-key').click(function() {
    var frameIndex = $('.con-text-list-act').index();
    moveUpFrame(frameIndex);
  })

  $("#animate .lamp-con-left").find('.down-key').click(function() {
    var frameIndex = $('.con-text-list-act').index();
    moveDownFrame(frameIndex);
  })

  $('#frame_bottom .lamp-button .lamp-cancel').click(function() {
    if ($("#frame_bottom").find(".play-bg").is(":hidden")) {
      $("#frame_bottom").find(".play-stop").hide();
      $.le('stop');
      $('#device').device({
        display: {
          default: '#000'
        }
      });
    }

    stopLightFrame();

    $("#animate").hide();
    $("#num_row").hide();
    $("#custom_light").show();
    var currentleguid = $("#lamp-con").find(".con-text.con-text-act").attr('lightguid');
    if(currentleguid) {
      activeThemeLight(currentleguid);
    }else{
      initDefaultLight();
    }

    lightEditMode = 0;
    var MultiSelectFlag = {
        "flag": false
    }
    $('#device').device({"MultiSelectFlag": MultiSelectFlag});
    $('#breath_frame_setting').css('display','none');
    $('#color_select').css('display','none');
  });

  $('#frame_bottom .lamp-button .lamp-save').click(function() {
    if ($("#light_setting_bottom").find(".play-bg").is(":hidden")) {
      $("#light_setting_bottom").find(".play-stop").hide();
      $("#light_setting_bottom").find(".play-bg").show();
      $.le('stop');
      $('#breath_frame_setting').css('display','none');
      $('#color_select').css('display','none');
    }
    $("#lamp-con").find(".con-text.con-text-act").attr('lightguid');
    window.parent.writeLE(Le.leData.GUID, Le.leData, function() {
      location.reload();
    });

    $(".lamp-1").show();
    $(".lamp-2").hide();
    $(".lamp-3").hide();
  })

  $("#frame_bottom").find(".lamp-two-buttom-play").click(function() {
    if($(this).find(".play-bg").is(":visible")) {
      $(this).find(".play-bg").hide();
      $(this).find(".play-stop").show();
      $.le('play', Le.leData);
    } else {
      $(this).find(".play-stop").hide();
      $(this).find(".play-bg").show();
      $.le('stop');
      $('#device').device({
        display: {
          default: '#000'
        }
      });
    }
  });

  $(".lamp-2 #detail").click(function() {
    if ($("#frame_bottom").find(".play-bg").is(":hidden")) {
      $("#frame_bottom").find(".play-stop").hide();
      $.le('stop');
      $('#device').device({
        display: {
          default: '#000'
        }
      });
    }
    $("#lamp_frame").find(".con-text-name").removeClass("con-selected");
    stopLightFrame();
    $(".lamp-2 .lamp-con-left").hide();
    $(".lamp-2 .lamp-two").hide();
    $(".lamp-2").hide();
    $(".lamp-3").show();
    $(".lamp-3 .lamp-con-left").show();
    $(".lamp-3 .lamp-two").show();
    $('.play-bg').show();
    if(!$('.lamp-3 #more').hasClass('disable-color')) {
      $('.lamp-3 #more').addClass('disable-color');
    }

    $("#light_setting").show();
    lightEditMode = 2;
    var MultiSelectFlag = {
        "flag": true
    }
    $('#device').device({"MultiSelectFlag": MultiSelectFlag});

    renderLightConfig();
  });

  $("#animate_question").click(function() {
  });

  $(".button-trigger").find("span").unbind('click').click(function() {
    if ($(this).hasClass("add-text")) {
      $(this).removeClass("add-text").addClass("delete-text");
      $(this).parent("div").find("input").prop("readonly", false);
      $(this).parent("div").find("input").css({'background-color': '#101010'});
      $(this).parent("div").find("input").focus();
      window.parent.startHotKey(function(data) {
        $(this).parent("div").find("input").val(data.HotKeyName);
        if (data.IsShortCut)
          return;
        Le.leData.HotKey = data.HotKeyRowValue;
        Le.leData.HotKeyName = data.HotKeyName;
        $(this).parent("div").find("input").val(data.HotKeyName);
      }.bind(this));
      $(this).parent("div").find("input").unbind('blur').blur(function() {
        window.parent.stopHotKey();
        $(this).parent("div").find("input").prop("readonly", true);
        $(this).parent("div").find("input").css({'background-color': '#303030'});
      });
    } else {
      Le.leData.HotKey = '';
      Le.leData.HotKeyName = '';
      $(this).removeClass("delete-text").addClass("add-text");
      $(this).parent("div").find("input").val("");
      $(this).parent("div").find("input").css({'background-color': '#303030'});
      $(this).parent("div").find("input").prop("readonly", true);
    }
  });
}

//所有有关于帧的操作
function frameOperate() {
  //初始化帧
  initDefaultFrame();

  $('#con-frame .con-text-list .con-text-name').on('focus', function() {
    $.le('stop');
    var conTextListDiv = $(this).parent();
    var index = $(this).parent().index();
    conTextListDiv.addClass('con-text-list-act');
    conTextListDiv.siblings().removeClass('con-text-list-act');
    $("#animate").attr("frameindex", index);
    stopLightFrame();
    playLightFrame(index);
  });

  $('#con-frame .con-text-list').on('click', function() {
    $.le('stop');
    var index = $(this).index();
    $(this).addClass('con-text-list-act');
    $(this).siblings().removeClass('con-text-list-act');
    $("#animate").attr("frameindex", index);
    stopLightFrame();
    playLightFrame(index);
  });

  $('#con-frame .con-text-list .con-text-name').on('click', function() {
    $(this).removeAttr('readonly');
  });

  $('#con-frame .con-text-list .con-text-name').on('blur', function() {
    $(this).attr('readonly', 'readonly');
    var frameIndex = $(this).parent().index();
    var name = $(this).val();
    var lightData = Le.leData;
    var themeLightData = lightData.Frames;
    themeLightData[frameIndex]['Name'] = name;
    window.parent.writeLE(Le.leData['GUID'], Le.leData, function() {});
  });

  $("#con-frame .con-text-list .con-text-num").find('input').on('blur', function() {
    var frameIndex = $(this).parent().parent().index();
    var frameCount = $(this).val();
    var lightData = Le.leData;
    var themeLightData = lightData.Frames;
    themeLightData[frameIndex].Count = parseInt(frameCount);
  });

  $("#con-frame .con-text-list .con-text-span-delete").on('click', function() {
    var frameIndex = $(this).parent().index();
    deleteLightFrame(frameIndex);
  })

  $('.lamp-2 #more').on('click', function() {
    $('.lamp-2 .lamp-con-left').hide();
    $('.lamp-2 .lamp-con').hide();
    $('.lamp-4').show();
    $('.lamp-4 .lamp-con-left').show();
    $('.lamp-4 .lamp-con').show();
    renderLightMoreSelect();
  })
}

//初始化帧
function initDefaultFrame() {
  if(Le.leData.Frames.length > 0) {
    var frameIndex = Le.leData.Frames.length -1;
    playLightFrame(frameIndex);
    $("#con-frame").find(".con-text-list").eq(frameIndex).addClass("con-text-list-act");
  }
}

//播放某一灯效的具体帧
function playLightFrame(frameIndex) {
  var lightData = Le.leData;
  var themeLightData = lightData.Frames;
  var config = {};
  for(var index in themeLightData[frameIndex].Data) {
    config[index] = "#ffffff";
  }

  var data = {
    "default": null,
    "config": config
  }
  $('#device').device({"display": data});
}

function stopLightFrame() {
  var data = {
    "default": "#000000",
    "config": null,
  }
  $('#device').device({"display": data});
}

function lightConfigManaging() {
  $('.lamp-3 .lamp-con-left .addcon').on('click', function() {
    $(this).siblings('ul').show();
  });

  $('.add-color-choice').on('mouseleave', function() {
    $('.add-color-choice').hide();
  })

  $('.lamp-3 .lamp-con-left .con-text-span').on('click', function() {
    var lightData = Le.leData;
    if(lightData.LEConfigs.length <= 1) {
      return;
    }
    var index = $('.con-text-list-act').index();
    lightData.LEConfigs.splice(index, 1);
    $('.con-text-list-act').remove();
  });

  $('.lamp-3 .lamp-con-left .con-text-copy').on('click', function() {
    var index = $('.lesubmit-act').index();
    if(index !== -1) {
      var lightData = Le.leData;
      var currentLEConfig = lightData.LEConfigs[index];
      var newLEConfig = $.extend(true, {}, currentLEConfig);
      lightData.LEConfigs.push(newLEConfig);
      renderLightConfig();
    }
  });

  $(".con-text-color-li").click(function() {
    var lightData = Le.leData;
    var lightConfig = lightData.LEConfigs;
    var lightConfigIndex = lightConfig.length;
    var color = "0xff0000";
    var colorName = $(this).text();
    var lightType = parseInt($(this).attr("lighttype"));
    var str = '';
    var lekeys = [];
    jQuery.each(Le.keymap, function(i, val) {
      lekeys[i] = val.LocationCode;
    });
    if(lightType == 0) {
      var configItem = {
        Keys: lekeys,
        Color: color,
        Type: lightType,
        Count: 1
      }
    } else if(lightType == 1) {
      var configItem = {
        Keys: lekeys,
        Color: color,
        Type: lightType,
        Count: 100
      }
    } else if(lightType == 2) {
      var configItem = {
        Keys: lekeys,
        Color: color,
        Type: lightType,
        Count: 30,
        StayCount: 10
      }
    }
    lightConfig.push(configItem);
    renderLightConfig();
  });

  $("#color_select").find(".con-text-save").click(function() {
    var index = parseInt($("#color_select").attr("index"));
    var backgroundColor = "#"+$(".colorpicker_hex").find(":text").val();
    var keyColor = backgroundColor.replace("#","0x");
    $('.con-defult').eq(index).css({"background-color": backgroundColor});
    $('.con-defult').eq(index).attr("color",keyColor);
    $("#color_select").removeAttr("index");
    $("#color_select").hide();
    var lightData = Le.leData;
    lightData.LEConfigs[index].Color = keyColor;
  });

  $("#color_select").find(".con-text-cancel").click(function() {
    $("#color_select").removeAttr("index");
    $("#color_select").hide();
  });

  $("#light_setting_bottom").find(".lamp-play").click(function() {
    if($(this).find(".play-bg").is(":visible")) {
      $(this).find(".play-bg").hide();
      $(this).find(".play-stop").show();
      $.le('play', Le.leData);
    } else {
      $(this).find(".play-stop").hide();
      $(this).find(".play-bg").show();
      $.le('stop');
      $('#device').device({
        display: {
          default: '#000'
        }
      });
    }
  });

  $('.lamp-3 .lamp-cancel').click(function() {
    if ($("#light_setting_bottom").find(".play-bg").is(":hidden")) {
      $("#light_setting_bottom").find(".play-stop").hide();
      $("#light_setting_bottom").find(".play-bg").show();
      $.le('stop');
      $('#device').device({
        display: {
          default: '#000'
        }
      });
    }

    stopLightConfig();
    $("#animate").hide();
    $("#num_row").hide();
    $(".lamp-3").hide();
    $("#custom_light").show();
    $(".lamp-1").show();

    lightEditMode = 1;

    var currentleguid = $("#lamp-con").find(".con-text.con-text-act").attr('lightguid');
    if(currentleguid) {
      activeThemeLight(currentleguid);
    }else{
      initDefaultLight();
    }
    var MultiSelectFlag = {
      "flag": true
    }
    $('#device').device({"MultiSelectFlag": MultiSelectFlag});
    $('#breath_frame_setting').css('display','none');
    $('#color_select').css('display','none');
  });

  $('.lamp-3 #animation').click(function() {
    if ($("#light_setting_bottom").find(".play-bg").is(":hidden")) {
      $("#light_setting_bottom").find(".play-stop").hide();
      $("#light_setting_bottom").find(".play-bg").show();
      $.le('stop');
      $('#device').device({
        display: {
          default: '#000'
        }
      });
    }

    $('.lamp-3 .lamp-con-left').hide();
    $('.lamp-3 .lamp-two').hide();
    $('.lamp-3').hide();
    $('.lamp-2').show();
    $('.lamp-2 .lamp-con-left').show();
    $('.lamp-2 .lamp-two').show();

    stopLightConfig();
    $("#light_setting").hide();
    $("#animate").show();
    lightEditMode = 1;

    initDefaultFrame();
    var MultiSelectFlag = {
      "flag": true
    }
    $('#device').device({"MultiSelectFlag": MultiSelectFlag});
    $('#breath_frame_setting').css('display','none');
    $('#color_select').css('display','none');
  });

  $('.lamp-3 #more').on('click', function() {
    $('.lamp-3 .lamp-con-left').hide();
    $('.lamp-3 .lamp-two').hide();
    $('.lamp-3').hide();
    $('.lamp-4').show();
    $('.lamp-4 .lamp-two').show();
    $('.lamp-4 .lamp-con-left').show();
    renderLightMoreSelect();
  })

  $(".lamp-3 .lamp-two-buttom-play").click(function() {
    if($(this).find(".play-bg").is(":visible")) {
      $(this).find(".play-bg").hide();
      $(this).find(".play-stop").show();
      $.le('play', Le.leData);
    } else {
      $(this).find(".play-stop").hide();
      $(this).find(".play-bg").show();
      $.le('stop');
      $('#device').device({
        display: {
          default: '#000'
        }
      });
    }
  });

  $('.lamp-3 .lamp-save').click(function() {
    if ($("#light_setting_bottom").find(".play-bg").is(":hidden")) {
      $("#light_setting_bottom").find(".play-stop").hide();
      $("#light_setting_bottom").find(".play-bg").show();
      $.le('stop');
    }

    window.parent.writeLE(Le.leData.GUID, Le.leData, function() {
      //location.reload();
      activeThemeLight(Le.leData.GUID);
      $(".lamp-2,.lamp-3").hide()
      $(".lamp-1").show()
    });
  });
  $('#breath_frame_setting').css('display','none');
  $('#color_select').css('display','none');
}

// 灯效设置操作
function lightConfigOperate() {
  initDefaultLightConfig();

  $(".con-defult").each(function(index) {
    var configColor = $(".con-defult").eq(index).attr("color");
    if(configColor) {
      configColor = configColor.toString().replace("0x","#");
      $(".con-defult").eq(index).css({"background-color":configColor});
    }
  });

  $("#con-color").find(".con-defult").click(function() {
    if($("#color_select").is(":visible")) {
      $("#color_select").removeAttr("index");
      $("#color_select").hide();
    } else {
      $("#color_select").show();
      var index = $(this).parent().index();
      var currentcolor = $(this).attr("color");
      $("#color_select").attr("index",index);
      $("#colorpickerHolder").ColorPickerSetColor(currentcolor);
      return false;
    }
  });

  $("#lightcolor_setting").find(".framecount-breath").click(function() {
    var breathdata = this.value;
    var breathdataarr = breathdata.split('+');
    $("#frame_count").val(breathdataarr[0]);
    $("#stay_count").val(breathdataarr[1]);
    if($("#breath_frame_setting").is(":visible")) {
      $("#breath_frame_setting").removeAttr("index");
      $("#breath_frame_setting").hide();
    }　else {
      var index = $(this).parent().parent().index();
      $("#breath_frame_setting").attr("index",index);
      $("#breath_frame_setting").show();
      return false;
    }
  });

  $("#breath_frame_setting").find(".con-text-breath-submit").click(function() {
    var frameCount = parseInt($("#frame_count").val());
    var stayCount = parseInt($("#stay_count").val());
    var reg = new RegExp("^[1-9][0-9]*$");

    if(reg.test(frameCount) && reg.test(stayCount)) {
      var index = parseInt($("#breath_frame_setting").attr("index"));
      var str = frameCount + "+" + stayCount;
      var lightData = Le.leData;
      lightData.LEConfigs[index].Count = frameCount;
      lightData.LEConfigs[index].StayCount = stayCount;
      $("#breath_frame_setting").hide();
      $("#con-color").find(".framecount-setting").eq(index).val(str);
    } else {
      $("#frame_count").val("");
      $("#stay_count").val("");
      window.parent.warning($.multilang("le_input_warning"));
      return;
    }
  });

  $("#breath_frame_setting").find(".con-text-breath-cancel").click(function() {
    $("#breath_frame_setting").hide();
  });

  $("#breath_frame_setting").click(function() {
    return false;
  });

  $('#con-color .con-text-list .con-text-num').find('.framecount-common').blur(function() {
    var lightData = Le.leData;
    var lightConfig = lightData.LEConfigs;
    var frameCount = $(this).val();
    var lightConfigIndex = $(this).parent().parent().index();
    lightConfig[lightConfigIndex].Count = parseInt(frameCount);
  });

  $('#light_setting .con-text-list').click(function() {
    var parent = $(this).parent();
    $(this).siblings().removeClass('con-text-list-act');
    $(this).addClass('con-text-list-act');
    $(this).siblings().removeClass('lesubmit-act');
    $(this).addClass('lesubmit-act');
    var lightConfigIndex = $(this).index();
    $("#light_setting").attr("lightconfigindex", lightConfigIndex);
    playLightConfig(lightConfigIndex);
  })

  $("#con-color").find(".con-text-span-delete").click(function() {
    var index = $(this).parent().index();
    var lightData = Le.leData;
    if(lightData.LEConfigs.length <= 1) {
      return;
    }
    lightData.LEConfigs.splice(index, 1);
    $("#con-color").find(".con-text-list").eq(index).remove();
  });
}

function initDefaultLightConfig() {
  if(Le.leData.LEConfigs.length > 0) {
    var lightConfigIndex = Le.leData.LEConfigs.length - 1;
    $("#con-color").find(".con-color").eq(lightConfigIndex).find(".con-text-color-name").addClass("con-selected");
    playLightConfig(lightConfigIndex);
  }
}

/*增加灯效配置文件*/
function onAddLightProfile() {
  var nameIndex = Le.les.length + 1;
  var nameSuffix = $.multilang("le_lamp") + nameIndex;
  var flag = true;
  while (flag) {
    var i = 0;
    for (i;i<Le.les.length;i++) {
      if (nameSuffix === Le.les[i].Name) {
        nameIndex++;
        nameSuffix = $.multilang("le_lamp") + nameIndex;
        break;
      }
    }
    if (i == Le.les.length)
      flag = false;
  }
  window.parent.prompt($.multilang("le_prompt"),$.multilang("le_add_lamp"), nameSuffix, function(result, value) {
    if (!result)
      return;
    if (value.replace(/\s+/g,"")=="") {
      window.parent.warning($.multilang("le_name_empty"));
      return false;
    }
    addLightProfile(value);
  });
}

//增加灯效配置文件
function addLightProfile(profilename) {
  //检测新增名称不可重复
  var flag = false;
  for (var i = 0;i < Le.les.length; i++) {
    if(profilename === Le.les[i].Name) {
      flag = true;
      break;
    }
  }

  if (flag) {
    window.parent.warning($.multilang("le_file_exist"));
    return false;
  }
  var newProfile = {};
  newProfile.GUID = getGuid();
  newProfile.Name = profilename;
  if(CMS.deviceConfig.LeCate) {
    newProfile.LeCate = CMS.deviceConfig.LeCate;
  }

  var keyColor = "#ffffff";
  var configdata = {}
  for (var k = 0 ; k < 132; k++) {
    for (var i = 0; i < $(".device-keylight").length; i++) {
      if($(".device-keylight").eq(i).data("locationcode") == k) {
        configdata[k.toString()] = keyColor;
      }
    }
  }

  newProfile.Frames = [{
    "Count" : 1,
    "Name" : "frame0",
    "Data" : configdata
  }];
  newProfile.LEConfigs = [];
  window.parent.writeLE(newProfile.GUID, newProfile, function(data) {
    var newProfileItem = {
      "GUID": newProfile.GUID,
      "Name": newProfile.Name
    }
    if(CMS.deviceConfig.LeCate) {
      newProfileItem.LeCate = CMS.deviceConfig.LeCate;
    }
    Le.les.push(newProfileItem);
    window.parent.writeLEList(Le.les, function() {
      renderThemeLightList();
    });
  });
}

/*删除灯效配置文件*/
function onDeleteLightProfile(lightguid) {
  if(Le.les.length == 1) {
    window.parent.alert($.multilang("le_prompt"),$.multilang("le_delete_error"));
    return;
  }

  var fileName = "";
  for(var i = 0;i< Le.les.length; i++) {
    if(Le.les[i].GUID == lightguid) {
      fileName = Le.les[i].Name;
      break;
    }
  }
  window.parent.confirm($.multilang("le_prompt"), $.multilang("le_delete_confirm") + fileName, function(result) {
    if (!result)
      return;
    deleteLightProfile(lightguid);
  });
}

//删除灯效配置文件
function deleteLightProfile(lightguid) {
  window.parent.deleteLE(lightguid, function() {
    for (var i = 0; i < Le.les.length; i++) {
      if(Le.les[i].GUID == lightguid) {
        Le.les.splice(i, 1);
        break;
      }
    }
    window.parent.writeLEList(Le.les, function() {
      renderThemeLightList();
    });
  },function(faildata) {
    for (var i = 0; i < Le.les.length; i++) {
      if(Le.les[i].GUID == lightguid) {
        Le.les.splice(i, 1);
        break;
      }
    }

    renderThemeLightList();
  }
  );
}

/*导出灯效配置文件*/
function onExportLightProfile() {
  window.parent.exportLE(Le.leData,function(data) {});
}

/*导入灯效配置文件*/
function onImportLightProfile() {
  window.parent.importLE(function (data) {
    var newLeData = JSON.parse(data);
    var flag = true;
    for(var j = 0; j < Le.les.length; j++) {
      //配置文件已存在
      if(Le.les[j].GUID === newLeData.GUID) {
        flag = false;
        newLeData.Name = Le.les[j].Name;
        window.parent.confirm($.multilang("le_prompt"), $.multilang("le_file_exist"), function() {
          window.parent.writeLE(newLeData.GUID, newLeData, function(data) {
            if(Le.leData.GUID === newLeData.GUID) {
              Le.leData = newLeData;
              renderThemeLightList();
            }
          });
        });
      }
    }
    if(flag) {
      window.parent.writeLE(newLeData.GUID, newLeData, function(data) {
        var newLeItem = {
          "GUID": newLeData.GUID,
          "Name": newLeData.Name
        }
        if(CMS.deviceConfig.LeCate){
          newLeItem.LeCate = CMS.deviceConfig.LeCate;
        }
        Le.les.push(newLeItem);
        window.parent.writeLEList(Le.les,function() {
          renderThemeLightList();
        });
      });
    }
  });
}

//增加新的帧
function addFrame() {
    var lightData = Le.leData;
    var ledFrames = {};
    var themeLightData = lightData.Frames;
    var frameIndex = $("#animate").attr("frameIndex");
    frameIndex = parseInt(frameIndex);
    ledFrames.Count = 1;
    ledFrames.Name = "frame" + lightData.Frames.length;
    if (lightData.Frames.length) {
      ledFrames.Data = clone(lightData.Frames[lightData.Frames.length-1].Data);
    } else {
      ledFrames.Data = {};
    }
    for(var keyinmap in Le.keymap) {
      ledFrames.Data[Le.keymap[keyinmap].LocationCode.toString()] = "#ffffff";
    }
    lightData.Frames.push(ledFrames);
    showFrames();
}

//删除当前灯效的具体帧
function deleteLightFrame(frameIndex) {
  var lightData = Le.leData;
  if(lightData.Frames.length <= 1 || frameIndex > lightData.Frames.length - 1) {
    return;
  }
  lightData.Frames.splice(frameIndex, 1);
  if(frameIndex == $("#animate").attr("frameindex")) {
    $("#animate").removeAttr("frameindex")
  }
  $("#con-frame").find(".con-text-list").eq(frameIndex).remove();
}

//当前灯效具体帧上移
function moveUpFrame(frameIndex) {
  var lightData = Le.leData;
  if(frameIndex == 0 || lightData.Frames.length <= 1) {
      return;
  }
  var tmp = lightData.Frames[frameIndex];
  var tmp2 = lightData.Frames[frameIndex-1];
  lightData.Frames.splice(frameIndex, 1, tmp2);
  lightData.Frames.splice(frameIndex-1, 1, tmp);
  var source = $("#con-frame").find(".con-text-list").eq(frameIndex);
  var target = $("#con-frame").find(".con-text-list").eq(frameIndex-1);

  var node1 = source.html();
  var node2 = target.html();
  source.html(node2);
  target.html(node1);

  source.removeClass('con-text-list-act');
  target.removeClass('con-text-list-act');
  target.addClass('con-text-list-act');

  frameOperate();
}

//当前灯效具体帧下移
function moveDownFrame(frameIndex) {
  var lightData = Le.leData;
  if(frameIndex >= lightData.Frames.length-1 || lightData.Frames.length <= 1) {
      return;
  }
  var tmp = lightData.Frames[frameIndex];
  var tmp2 = lightData.Frames[frameIndex+1];
  lightData.Frames.splice(frameIndex, 1, tmp2);
  lightData.Frames.splice(frameIndex+1, 1, tmp);
  var source = $("#con-frame").find(".con-text-list").eq(frameIndex);
  var target = $("#con-frame").find(".con-text-list").eq(frameIndex+1);

  var node1 = source.html();
  var node2 = target.html();
  source.html(node2);
  target.html(node1);

  source.removeClass('con-text-list-act');
  target.removeClass('con-text-list-act');
  target.addClass('con-text-list-act');

  frameOperate();
}

//js克隆对象
function clone(obj) {
    var o;
    switch(typeof obj) {
    case 'undefined': break;
    case 'string'   : o = obj + '';break;
    case 'number'   : o = obj - 0;break;
    case 'boolean'  : o = obj;break;
    case 'object'   :
        if(obj === null) {
            o = null;
        }else{
            if(obj instanceof Array) {
                o = [];
                for(var i = 0, len = obj.length; i < len; i++) {
                    o.push(clone(obj[i]));
                }
            }else{
                o = {};
                for(var k in obj) {
                    o[k] = clone(obj[k]);
                }
            }
        }
        break;
    default:
        o = obj;break;
    }
    return o;
}