var CMS = {};
var DEVICE = {
  profile: null,
  playle: null,
  keymap: null,
  leData: null,
  params: null,
  definecolor: "0xff0000"
};
var hoverTimer;
var MENU = {
  "index": null,
  "menuPID":"",
  "menuID":"",
  "menuName":"",
  "keyLE": "",
  "driverValue":""
};
$.multilang=window.parent.$.multilang;
function initUI() {
  initDeviceImage();

  $('#profilelist').profilelist({
    icons: {
      select : "res/img/profile_select_1.png",
      bindapp: "res/img/profile_bindapp_1.png",
      import : "res/img/profile_import_1.png",
      export : "res/img/profile_export_1.png",
      delete : "res/img/profile_delete_1.png",
    },
    maxNum: 3,
    onSelect: onProfileSelect,
    onDblClick: onProfileRename,
    onBindApp: onProfileBindApp,
    onBindAppIn: onBindAppIn,
    onBindAppOut: onBindAppOut,
    onImport: null,
    onExport: null,
    onDelete: onProfileDelete,
    onAdd: onProfileAdd
  });
  $.le({
    onDisplay: function(data) {
      $('#device').device({"display": data});
    }
  });
  refreshProfileList();
  window.parent.setLanguage(false);

  $('#apply').on('click', function() {
    var isLECheckResult = checkLE();
    if(!isLECheckResult) {
      window.parent.warning($.multilang("not_found_light_file"));
      return;
    }

    var isMacroCheckResult = checkMacro();
    if(!isMacroCheckResult) {
      window.parent.warning($.multilang("not_found_macro_file"));
      return;
    }
    window.parent.apply(CMS.deviceID, DEVICE.profile.GUID, function(result) {
      if(result)
        window.parent.success($.multilang("apply_success"));
      else
        window.parent.error($.multilang("apply_error"));
    });
  });
  window.parent.onProfileActive(function(data) {
    if(data.ModelID===CMS.deviceID)
    {
      for(var i = 0;i<CMS.profiles.length;i++) {
        if(CMS.profiles[i].GUID == data.GUID)
          CMS.profiles[i].Active = 1;
        else
          CMS.profiles[i].Active = 0;
      }
      refreshProfileList();
    }
  });
  window.parent.dpiChanged(function(data) {
  if ((data.ModelID === CMS.deviceID) && (data.CurrentMode === CMS.currentProfile.ModeIndex)) {
      CMS.currentProfile.CurrentDPI = parseInt(data.DPILevel);
      $("#sensetivity_level").find(".item[level='"+data.DPILevel+"']").click();
    }
  })
}

function initDeviceImage() {
  $("#device").empty();
  var str = '';
  str +=  '<img src="device/' + CMS.deviceID + '/img/device_outline.png" class="device-outline" />\
  <img src="device/' + CMS.deviceID + '/img/device_key.png" class="device-panel" />';
  $("#device").append(str);
  disableImgDraggable();
}

$(document).ready(function() {
  CMS = window.parent.CMS;
  $.getJSON("device/" + CMS.deviceID + "/data/keymap.js", function(json) {
    DEVICE.keymap = json;
    initUI();
  });
  $('#mouse_sensor_check').click(function() {
  window.parent.openModelWindow('Loading');
    window.parent.sensorCheck(CMS.deviceID,function(sensordata) {
      if (sensordata.SensorResult == 0) {
      }else if (sensordata.SensorResult == 2) {
        window.parent.success($.multilang("sensor_check_ok"));
        window.parent.openModelWindow('');
      }else if (sensordata.SensorResult == 3) {
        window.parent.error($.multilang("sensor_check_fail"));
        window.parent.openModelWindow('');
      }
    })
  });
});

function onProfileSelect(guid) {
  window.parent.changeProfile(CMS.deviceID, guid, DEVICE.profile.GUID, function(guid) {
    window.parent.readProfile(CMS.deviceID, guid, function(data) {
      DEVICE.profile = data;
      refreshProfileList();
      onProfileLoad();
      $("#menu_select").find("li:eq(0)").click();
      window.parent.apply(CMS.deviceID, DEVICE.profile.GUID, function(result) {
        if(!result)
          window.parent.error($.multilang("apply_error"));
      });
    });
  });
}

function onProfileRename() {
  var $this = $(this);
  var name = DEVICE.profile.Name;
  window.parent.prompt($.multilang("rename_config"), $.multilang("rename_prompt"), name, function(result, value) {
    if(!result) return;

    if(value == name) {
      window.parent.warning($.multilang("rename_same_name"));
      return;
    }

    for (var i = 0; i < CMS.profiles.length; i++) {
      if (CMS.profiles[i].Name == value)
        break;
    }
    if (i != CMS.profiles.length) {
      window.parent.warning($.multilang("rename_exist_name"));
      return;
    }

    DEVICE.profile.Name = value;
    window.parent.writeProfile(CMS.deviceID, DEVICE.profile.GUID, DEVICE.profile, function() {
      for (var i = 0; i < CMS.profiles.length; i++) {
        if (CMS.profiles[i].ModeIndex === 0 && CMS.profiles[i].GUID == DEVICE.profile.GUID) {
          CMS.profiles[i].Name = DEVICE.profile.Name;
          break;
        }
      }
      $this.text(DEVICE.profile.Name);
    });
  });
}

function onProfileBindApp() {
  var $this = $(this);
  window.parent.openFileDialogEx(function(data) {
    var pos = data.lastIndexOf("/");
    DEVICE.profile.Application.AppName = data.substring(pos + 1);
    DEVICE.profile.Application.AppPath = data;

    for (var i = 0; i < CMS.profiles.length; i++) {
      if (CMS.profiles[i].ModeIndex === 0 && CMS.profiles[i].GUID == DEVICE.profile.GUID) {
        CMS.profiles[i].Application.AppName = DEVICE.profile.Application.AppName;
        CMS.profiles[i].Application.AppPath = DEVICE.profile.Application.AppPath;
        break;
      }
    }
    onProfileChanged();
  });
}

function onProfileBindGame() {
  var $this = $(this);
  window.parent.openModelWindow("GameBind");
}

function profileBindGameSave(gamename,gameguid) {
  DEVICE.profile.Application.AppName = gamename;
  DEVICE.profile.Application.AppPath = gameguid;

  for (var i = 0; i < CMS.profiles.length; i++) {
    if (CMS.profiles[i].ModeIndex === 0 && CMS.profiles[i].GUID == DEVICE.profile.GUID) {
      CMS.profiles[i].Application.AppName = DEVICE.profile.Application.AppName;
      CMS.profiles[i].Application.AppPath = DEVICE.profile.Application.AppPath;
      break;
    }
  }
  onProfileChanged();
}

function onBindAppIn() {
  clearTimeout(hoverTimer);
  var $this = $(this);
  var appName = DEVICE.profile.Application.AppName;
  if(!appName)
    appName = $.multilang("no_config");
  $this.parent().find(".bind-function").find(".text").text(appName);
  $this.parent().find(".bind-function").hover(function() {
    clearTimeout(hoverTimer);
  },function() {
    clearTimeout(hoverTimer);
    hoverTimer = setTimeout(function() {
      $this.parent().find(".bind-function").fadeOut("fast");
    }, 200);
  });

  $this.parent().find(".bind-function").find(".remove").unbind().click(function() {
    $this.parent().find(".bind-function").find(".text").text($.multilang("no_config"));
    $this.data("change-value",null);
    DEVICE.profile.Application.AppName = ""
    DEVICE.profile.Application.AppPath = ""
    window.parent.writeProfile(CMS.deviceID, DEVICE.profile.GUID, DEVICE.profile, function() {
      window.parent.warning($.multilang("clear_success"));
      for (var i = 0; i < CMS.profiles.length; i++) {
        if (CMS.profiles[i].ModeIndex === 0 && CMS.profiles[i].GUID == DEVICE.profile.GUID) {
          CMS.profiles[i].Application.AppName = DEVICE.profile.Application.AppName;
          CMS.profiles[i].Application.AppPath = DEVICE.profile.Application.AppPath;
          break;
        }
      }
    });
  }.bind(this));
  $(this).parent().find(".bind-function").fadeIn("fast");
}

function onBindAppOut() {
  clearTimeout(hoverTimer);

  hoverTimer = setTimeout(function() {
    $(this).parent().find(".bind-function").fadeOut("fast");
  }.bind(this), 200);
}

function onProfileDelete() {
  var countProfiles = 0;
  var newGUID = null;
  for (var i = 0; i < CMS.profiles.length; i++) {
    if (CMS.profiles[i].ModeIndex === 0) {
      countProfiles++;
      if(!newGUID && CMS.profiles[i].GUID != DEVICE.profile.GUID)
        newGUID = CMS.profiles[i].GUID;
    }
  }
  if((countProfiles <= 1) || !newGUID) {
    window.parent.warning($.multilang("delete_config_prompt"));
    return;
  }
  window.parent.changeProfile(CMS.deviceID, newGUID, DEVICE.profile.GUID, function(guid) {
    window.parent.deleteProfile(CMS.deviceID, DEVICE.profile.GUID, function(result) {
      if(!result) {
        window.parent.error($.multilang("delete_config_error"));
        return;
      }

      for (var i = 0; i < CMS.profiles.length; i++) {
        if (CMS.profiles[i].GUID === DEVICE.profile.GUID) {
          break;
        }
      }
      CMS.profiles.splice(i, 1);
      refreshProfileList();
    });
  });
}

function onProfileAdd() {
  var items = [];
  for (var i = 0; i < CMS.profiles.length; i++) {
    if (CMS.profiles[i].ModeIndex === 0) {
      items.push(CMS.profiles[i].Name);
    }
  }
  var name = $.multilang("config_name");
  var size = items.length;
  name = getName(name, size + 1, items);
  window.parent.prompt($.multilang("add_config"), $.multilang("add_config_promp"), name, function(result, value) {
    if(!result) return;

    for (var i = 0; i < items.length; i++) {
      if (items[i] == value)
        break;
    }
    if (i != items.length) {
      window.parent.warning($.multilang("rename_exist_name"));
      return;
    }

    window.parent.addProfile(CMS.deviceID, value, function(guid) {
      onProfileSelect(guid);
    });
  });
}

function refreshProfileList() {
  var active = false;
  var items = [];
  var index = 0;
  for (var i = 0; (i < CMS.profiles.length); i++) {
    if (CMS.profiles[i].ModeIndex == 0) {
      index++;
      var item = {
        active: 0,
        guid: CMS.profiles[i].GUID,
        icons: {
          select : "res/img/profile_select_offline" + index + "_1.png",
        }
      };
      if (!active && CMS.profiles[i].Active) {
        item.active = 1;
        active = true;
        if (!DEVICE.profile || (DEVICE.profile.GUID != CMS.profiles[i].GUID)) {
          window.parent.readProfile(CMS.deviceID, CMS.profiles[i].GUID, function(data) {
            DEVICE.profile = data;
            onProfileLoad();

            window.parent.apply(CMS.deviceID, DEVICE.profile.GUID, function(result) {
              if(!result)
                window.parent.error($.multilang("apply_error"));
            });
          });
        }
      }
      items.push(item);
    }
  }
  if(!active && items.length) {
    items[0].active = 1;
    window.parent.readProfile(CMS.deviceID, items[0].guid, function(data) {
      DEVICE.profile = data;
      onProfileLoad();
      DEVICE.profile.Active = 1;
      window.parent.writeProfile(CMS.deviceID, DEVICE.profile.GUID, DEVICE.profile, function() {
        window.parent.warning($.multilang("not_found_config_warning",DEVICE.profile.Name));
      });
    });
  }
  $('#profilelist').profilelist({ items: items });
}

function onProfileLoad() {
  CMS.currentProfile = DEVICE.profile;
  initDeviceImage();
  initDevice();
  initFunc();
  initDeviceEvent()
  initFuncEvent();
}

function onProfileChanged() {
  window.parent.writeProfile(CMS.deviceID, DEVICE.profile.GUID, DEVICE.profile, function() {
      window.parent.apply(CMS.deviceID, DEVICE.profile.GUID, function(result) {
        if(!result)
          window.parent.error($.multilang("apply_error"));
    });
  });
}

function initDevice() {
  //初始化按键
  if(CMS.deviceConfig.AspectRatio) {
  $('#device').device({
      aspectratio: CMS.deviceConfig.AspectRatio,
    });
  }
  $('#device').device({
    keymap: DEVICE.keymap,
  });

  //初始化按键样式
  $(".device-keystate").removeClass("button-active").removeClass("button-hover").removeClass("border");

  //初始化按键初始状态
  var index_no_configuration = $.multilang("no_config");
  var kb_func = $.multilang("kb_func");
  var kb_lamp = $.multilang("kb_lamp");
  if($("#device").find(".show-function").length <= 0) {
    var add = '<div class="show-function">\
    <div class="show-function-content">\
    '+kb_func+': <span class="text" id="basic_config">' + index_no_configuration + '</span>\
    <span class="remove" id="basic_remove">\
    </span>\
    </div>\
    <div class="show-function-content">\
    '+kb_lamp+': <span class="text" id="light_config">' + index_no_configuration + '</span>\
    <span class="remove" id="light_remove">\
    </span>\
    </div>\
    </div>';
    $("#device").append(add);
  }

  for (var i = 0; i < DEVICE.profile.KeySet.length; i++) {
    var logicCode = DEVICE.profile.KeySet[i].Index;
    var $element = $(".device-keystate[data-logiccode='" + logicCode + "']");
    var change_value = null;
    var change_value_light = null;
    if (DEVICE.profile.KeySet[i].MenuName !== "")
      change_value = DEVICE.profile.KeySet[i].MenuName;
    if (DEVICE.profile.KeySet[i].KeyLE.Name !== "")
      change_value_light = DEVICE.profile.KeySet[i].KeyLE.Name;

    $element.data("change-value", change_value);
    $element.data("change-value-light", change_value_light);
    if (change_value || change_value_light)
      !$element.hasClass("border") && $element.addClass("border");
    else
      $element.hasClass("border") && $element.removeClass("border");
  }
}

function initFunc() {
  //初始化左侧选择键以及默认功能菜单索引
  $("#button-got").find("span").text("");
  MENU.index = null;

  //初始化菜单栏选项
  $("#menu_select").find("li").eq(0).addClass("active").siblings().removeClass("active");
  $("#lamp_setting").is(":visible") && $("#lamp_setting").hide();
  $("#mouse_performance").is(":visible") && $("#mouse_performance").hide();
  $("#func_setting").is(":hidden") && $("#func_setting").show();

  //初始化基本功能按钮状态
  $("#tools_1,#tools_mouse_1").find(".ximagebutton").ximagebutton({
    colors: {
      normal: "#787878",
      active: "#00c2ff"
    }
  });
  $("#tools_1").find(".ximagebutton").ximagebutton('inactive');
  $("#tools_1").find(".ximagebutton").eq(0).ximagebutton('active');
  $("#tools_2").find(".functions").hide();
  $("#tools_2").find(".functions").eq(0).show();
  $("#tools_mouse_1").find(".functions").hide();
  $("#tools_mouse_1").find(".functions").eq(0).show();

  //初始化单键录制功能
  $("#com_key").val("");
  $("#com_key").data("driver-value", null);

  //初始化宏;
  renderMacroList();

  //初始化按键灯效;
  renderLightList();

  //初始化鼠标、媒体、热键切换
  if(!$("#tool_mouse").find(".func-items").find(".func-item").eq(0).hasClass("active")) {
    var pic = $("#tool_mouse").find(".func-items").find(".func-item").eq(0).find("img").attr("src");
    $("#tool_mouse").find(".func-items").find(".func-item").eq(0).addClass("active").siblings(".func-item").removeClass("active");
    $("#tool_mouse").find(".func-items").find(".func-item").eq(0).find("img").attr("src",pic.substring(0,pic.length-5)+"3.png");
    $("#tool_mouse").find(".func-items").find(".func-item").eq(0).siblings(".func-item").find("img").attr("src",pic.substring(0,pic.length-5)+"1.png");
  }
  if(!$("#tool_media").find(".func-items").find(".func-item").eq(0).hasClass("active")) {
    var pic = $("#tool_media").find(".func-items").find(".func-item").eq(0).find("img").attr("src");
    $("#tool_media").find(".func-items").find(".func-item").eq(0).addClass("active").siblings(".func-item").removeClass("active");
    $("#tool_media").find(".func-items").find(".func-item").eq(0).find("img").attr("src",pic.substring(0,pic.length-5)+"3.png");
    $("#tool_media").find(".func-items").find(".func-item").eq(0).siblings(".func-item").find("img").attr("src",pic.substring(0,pic.length-5)+"1.png");
  }
  if(!$("#tool_hotbutton").find(".func-items").find(".func-item").eq(0).hasClass("active")) {
    var pic = $("#tool_hotbutton").find(".func-items").find(".func-item").eq(0).find("img").attr("src");
    $("#tool_hotbutton").find(".func-items").find(".func-item").eq(0).addClass("active").siblings(".func-item").removeClass("active");
    $("#tool_hotbutton").find(".func-items").find(".func-item").eq(0).find("img").attr("src",pic.substring(0,pic.length-5)+"3.png");
    $("#tool_hotbutton").find(".func-items").find(".func-item").eq(0).siblings(".func-item").find("img").attr("src",pic.substring(0,pic.length-5)+"1.png");
  }

  //初始化快捷键
  $("#exe_path_show").find("input").val("");
  $("#exe_path_show").find("input").data("appdir",null);

  //初始化禁用功能；
  $("#current_key_name").text("");

    //初始化模式灯光功能按钮
  $("#tools_lamp_1").find(".ximagebutton").ximagebutton({
    colors: {
      normal: "#787878",
      active: "#00c2ff"
    }
  });
  $("#tools_lamp_1").find(".ximagebutton").eq(0).ximagebutton('active');
  $("#tools_mouse_1").find(".ximagebutton").eq(0).ximagebutton('active');

  //初始化静态灯效
  renderStaticLamp();
  //初始化模式灯效
  renderLamp();
  $.le('stop');
  if (DEVICE.profile.ModeLE.GUID) {
    window.parent.readLE(DEVICE.profile.ModeLE.GUID, function(data) {
      var params = null;
      if(DEVICE.profile.ModeLE.Params)
        params = DEVICE.profile.ModeLE.Params;
      DEVICE.leData = data;
      DEVICE.params = null;
      $.le('play', data, params);
      DEVICE.playle = DEVICE.profile.ModeLE.GUID;
    });
  } else {
    if (!DEVICE.profile.ModeLE.LEData) {
      DEVICE.profile.ModeLE.LEData = {};
    }
    var leData = DEVICE.profile.ModeLE.LEData;
    DEVICE.leData = DEVICE.profile.ModeLE.LEData;
    DEVICE.params = null;
    var config = {};
    for(var index in leData) {
      config[index] = leData[index].replace("0x", "#");
    }
    var data = {
      "config": config
    };
    $('#device').device({
      display: data
    });
  }

  //初始化颜色下拉选择设定功能
  $("#le_config_color_select").off('click').click(function() {
    if ($("#le_config_colors").is(":hidden")) {
      $("#le_config_colors").show();
      $("#le_color_dropdown").addClass("hover-up");
    } else {
      $("#le_config_colors").hide();
      $("#le_color_dropdown").removeClass("hover-up");
    }

    return false;
  });

  $(document).click(function() {
    $("#le_config_colors").hide();
    $("#le_color_dropdown").removeClass("hover-up");
  });
}

function initDeviceEvent() {
  $('#device').find('.device-keystate').off('click mouseenter mouseleave');
  $('#device').device({
    onSingleSelect: onSingleSelect,
    onMouseEnter: onMouseEnter,
    onMouseLeave: onMouseLeave,
  });
}

function onSingleSelect(data) {
  for (var i = 0; i < DEVICE.profile.KeySet.length; i++) {
    if(DEVICE.profile.KeySet[i].Index === data.LogicCode) {
      $("#button-got").find("span").text(data.Show);
      $("#current_key_name").text(data.Show);
      $(this).addClass("button-active");
      $(this).siblings().removeClass("button-active");
      MENU.index = data.LogicCode;
      break;
    }
  }
}

function onMouseEnter(data) {
  if (data.LogicCode === -1) {
    return;
  }
  clearTimeout(hoverTimer);
  var change_value = $(this).data("change-value");
  var change_value_light = $(this).data("change-value-light");
  var top = parseInt($(this).css("top").replace("px")) - 66;
  var left = parseInt($(this).css("left").replace("px")) + $(this).width() / 2 - 60;
  var $showButtonFunction = $("#device").find(".show-function");
  var $this = $(this);
  if (change_value)
    $("#basic_config").text(change_value);
  else
    $("#basic_config").text($.multilang("no_config"));

  if (change_value_light)
    $("#light_config").text(change_value_light);
  else
    $("#light_config").text($.multilang("no_config"));

  $showButtonFunction.hover(function() {
    clearTimeout(hoverTimer);
  }.bind(this),function() {
    clearTimeout(hoverTimer);
    hoverTimer = setTimeout(function() {
      $("#device").find(".show-function").fadeOut("fast");
    }, 200);
  }.bind(this));

  $("#basic_remove").unbind('click').click(function() {
    $("#basic_config").text($.multilang("no_config"));
    $this.data("change-value",null);
    !$this.data("change-value-light") && $this.removeClass("border");
    for (var index = 0; index < DEVICE.profile.KeySet.length; index++) {
      if (DEVICE.profile.KeySet[index].Index == $this.data("logiccode")) {
        DEVICE.profile.KeySet[index].MenuPID = "";
        DEVICE.profile.KeySet[index].MenuID = "";
        DEVICE.profile.KeySet[index].MenuName = "";
        DEVICE.profile.KeySet[index].DriverValue = "0xffffffff";
        delete DEVICE.profile.KeySet[index].Task;
        break;
      }
    }
    onProfileChanged();
  });

  $("#light_remove").unbind('click').click(function() {
    $("#light_config").text($.multilang("no_config"));
    $this.data("change-value-light",null);
    !$this.data("change-value") && $this.removeClass("border");
    for (var index = 0; index < DEVICE.profile.KeySet.length; index++) {
      if (DEVICE.profile.KeySet[index].Index == $this.data("logiccode")) {
        DEVICE.profile.KeySet[index].KeyLE = {
          "GUID": "",
          "Name": ""
        }
        break;
      }
    }
    onProfileChanged();
  });

  $showButtonFunction.css({"top": top + "px", "left": left + "px"});
  $showButtonFunction.fadeIn("fast");
}

function onMouseLeave(data) {
  if (data.LogicCode === -1) {
    return;
  }
  clearTimeout(hoverTimer);
  hoverTimer = setTimeout(function() {
    $("#device").find(".show-function").fadeOut("fast");
  }, 200);
}

function initFuncEvent() {
  //灯效和功能指定切换
  $("#menu_select").find("li").unbind('click').click(function() {
    $(this).addClass("active").siblings().removeClass("active");
    if($(this).index() === 1) {
      $("#bottom_nav").css({'display': 'none'});
      $("#lamp_setting").is(":visible") && $("#lamp_setting").hide();
      $("#func_setting").is(":visible") && $("#func_setting").hide();
      $("#mouse_performance").is(":hidden") && $("#mouse_performance").show();
      initialize_Tools_left_1();
      changeLevel();
      if (DEVICE.profile.ModeLE.GUID && (DEVICE.profile.ModeLE.GUID !== DEVICE.playle)) {
        $.le('stop');
        window.parent.readLE(DEVICE.profile.ModeLE.GUID, function(data) {
          $.le('play', data);
          DEVICE.playle = DEVICE.profile.ModeLE.GUID;
        });
      }
    } else if($(this).index() === 2) {
      $("#func_setting").is(":visible") && $("#func_setting").hide();
      $("#mouse_performance").is(":visible") && $("#mouse_performance").hide();
      $("#lamp_setting").is(":hidden") && $("#lamp_setting").show();

      if (DEVICE.profile.LogoLE) {
        if(DEVICE.profile.LogoLE.Enable === 1)
          $("#logo_chk").prop("checked",true);
        else
          $("#logo_chk").prop("checked",false);

        $("#logo_color_set").find(".func-item").eq([DEVICE.profile.LogoLE.Type]).click();
      }

      $("#device").find(".device-panel").attr('src', 'device/' + CMS.deviceID + '/img/device_panel.png');
      keymap = [];
      for(var item in DEVICE.keymap) {
        if(DEVICE.keymap[item].LogicCode === -1) {
          keymap.push(DEVICE.keymap[item])
        }
      }
      //初始化按键
      $('#device').device({
        keymap: keymap,
      });
      $("#tools_lamp_2").find("ul").find("li").removeClass("selected");
      $("#bottom_nav").css({'display': 'flex'});
      var $selectedLamp = $("#tools_lamp_2").find("ul").find("li[data-guid='" + DEVICE.profile.ModeLE.GUID + "']");
      if($selectedLamp.length > 0){
        $selectedLamp.addClass("selected");
        $selectedLamp.parent().parent().scrollTop($("#tools_lamp_2").find("ul").find("li[data-guid='" + DEVICE.profile.ModeLE.GUID + "']").index()*32);
      }

      //初始化按键样式
      $(".device-keystate").removeClass("button-active").removeClass("button-hover").removeClass("border");

      for (var i = 0; i < DEVICE.profile.KeySet.length; i++) {
        var logicCode = DEVICE.profile.KeySet[i].Index;
        var $element = $(".device-keystate[data-logiccode='" + logicCode + "']");
        $element.data("change-value", null);
        $element.data("change-value-light", null);
      }
      $('#device').device({
        onSingleSelect: null,
        onMouseEnter: null,
        onMouseLeave: null,
      });
      if (!DEVICE.profile.ModeLE.GUID) {
        DEVICE.leData = DEVICE.profile.ModeLE.LEData;
        DEVICE.params = null;
        lightenKeyFunc();
      } else {
        $("#le_configs").css({'display': 'flex'});
        window.parent.readLE(DEVICE.profile.ModeLE.GUID, function(data) {
          var params = null;
          if(DEVICE.profile.ModeLE.Params)
            params = DEVICE.profile.ModeLE.Params;
          else
            params = $.le('params', data);
          DEVICE.leData = data;
          DEVICE.params = null;
          setColorConfig(data, params);
        });
      }
    } else {
      DEVICE.leData = null;
      DEVICE.params = null;
      $("#bottom_nav").css({'display': 'none'});
      $("#lamp_setting").is(":visible") && $("#lamp_setting").hide();
      $("#mouse_performance").is(":visible") && $("#mouse_performance").hide();
      $("#func_setting").is(":hidden") && $("#func_setting").show();

      $("#device").find(".device-panel").attr('src', 'device/' + CMS.deviceID + '/img/device_key.png');
      //初始化按键
      $('#device').device({
        keymap: DEVICE.keymap,
      });
      if (DEVICE.profile.ModeLE.GUID && (DEVICE.profile.ModeLE.GUID !== DEVICE.playle)) {
        $.le('stop');
        window.parent.readLE(DEVICE.profile.ModeLE.GUID, function(data) {
          $.le('play', data);
          DEVICE.playle = DEVICE.profile.ModeLE.GUID;
        });
      }

      //初始化按键样式
      for (var i = 0; i < DEVICE.profile.KeySet.length; i++) {
        var logicCode = DEVICE.profile.KeySet[i].Index;
        var $element = $(".device-keystate[data-logiccode='" + logicCode + "']");
        var change_value = null;
        var change_value_light = null;
        if (DEVICE.profile.KeySet[i].MenuName !== "")
          change_value = DEVICE.profile.KeySet[i].MenuName;
        if (DEVICE.profile.KeySet[i].KeyLE.Name !== "")
          change_value_light = DEVICE.profile.KeySet[i].KeyLE.Name;
        $element.data("change-value", change_value);
        $element.data("change-value-light", change_value_light);

        if (change_value || change_value_light)
          !$element.hasClass("border") && $element.addClass("border");
        else
          $element.hasClass("border") && $element.removeClass("border");
      }
      $('#device').device({
        onSingleSelect: null,
        onMultiSelect: null,
      });

      $('#device').device({
        onSingleSelect: onSingleSelect,
        onMouseEnter: onMouseEnter,
        onMouseLeave: onMouseLeave,
      });
    }
  });

  //初始化鼠标性能按钮
  $("#tools_mouse_1").find(".ximagebutton").ximagebutton({
    onClick: function() {
      $element = this;
      var index = $element.index();
      $("#tools_mouse_2").find(".functions").hide();
      $("#tools_mouse_2").find(".functions").eq(index).show();
      $element.ximagebutton('active');
      $element.siblings().ximagebutton('inactive');
    }
  });

  //初始化基本功能按钮
  $("#tools_1").find(".ximagebutton").ximagebutton({
    onClick: function() {
      $element = this;
      var index = $element.index();
      $("#tools_2").find(".functions").hide();
      $("#tools_2").find(".functions").eq(index).show();
      $element.ximagebutton('active');
      $element.siblings().ximagebutton('inactive');
      if ((index === 2) && ($("#tool_light").find(".func-setting").find("ul").find(".menu-item.selected").length > 0)) {
        $("#bottom_nav").css({'display': 'flex'});
      }else{
        $("#bottom_nav").hide();
      }
    }
  });

  //单键录制
  $("#com_key").unbind('focus').focus(function() {
    window.parent.startHotKey(function(data) {
      $("#com_key").val(data.HotKeyName);
      $("#com_key").data("driver-value", data.HotKeyValue);
    });
  });
  $("#com_key").unbind('blur').blur(function() {
    window.parent.stopHotKey();
  });
  $("#remove_singlebutton").unbind('click').click(function() {
    $("#com_key").val("");
  });

  //宏
  $("#tool_macro").find(".func-setting").find("p").find("span").unbind('click').click(function() {
    if (!$(this).hasClass("macro-back")) return
    $(this).removeClass("macro-back");
    $("#macro_menu").find(".macrogroup-now").remove();
    $("#tool_macro").find(".func-setting").find(".menu-list").find("li").removeClass("selected");
    renderMacroList();
  });
  $("#repeats").unbind('keyup').keyup(function() {
    if ($(this).val() > 100000000)
      $(this).val(100000000);
    if ($(this).val() = 0 )
      $(this).val(1);
  });

  //灯效
  $("#tool_light").find(".func-setting").find(".menu-item-light").unbind('click').click(function() {
    $(this).addClass("selected").siblings().removeClass("selected");
    var guid = $(this).data("guid");
    if(!guid) return;
    $("#bottom_nav").css({'display': 'flex'});
    window.parent.readLE(guid, function(data) {
      var params = $.le('params', data);
      setColorConfig(data, params, 0);
    });
  });

  //鼠标、媒体、热键切换
  $(".functions").find(".func-items").find(".func-item").unbind('mouseenter mouseleave').hover(
    function() {
      if ($(this).hasClass("active")) return;
      var pic = $(this).find("img").attr("src");
      $(this).find("img").attr("src",pic.substring(0,pic.length-5)+"2.png");
    },
    function() {
      if ($(this).hasClass("active")) return;
      var pic = $(this).find("img").attr("src");
      $(this).find("img").attr("src",pic.substring(0,pic.length-5)+"1.png");
    }
  );

  $(".functions").find(".func-items").find(".func-item").unbind('click').click(function() {
    var pic = $(this).find("img").attr("src");
    $(this).siblings(".func-item").removeClass("active");
    $(this).siblings(".func-item").find("img").attr("src",pic.substring(0,pic.length-5)+"1.png");
    (!$(this).hasClass("active")) && $(this).addClass("active");
    $(this).find("img").attr("src",pic.substring(0,pic.length-5)+"3.png");
  });

  //快捷键
  $("#exe_add").unbind('click').click(function() {
    window.parent.openFileDialog(function(data) {
      var pos = data.lastIndexOf("/");
      $("#exe_path_show").find("input").val(data.substring(pos+1));
      $("#exe_path_show").find("input").data("appdir",data);
    });
  });

  //确定键按下
  $(".yes").unbind('click').click(function() {
    MENU.menuPName = $(this).closest(".functions").data("menu-p-name");
    MENU.menuPID = $(this).closest(".functions").index();

    if(MENU.index === null && MENU.menuPName != 'lamp') {
      window.parent.warning($.multilang("select_key_config"));
      return;
    }
    switch(MENU.menuPName) {
      case 'singlebutton':{
        if($("#com_key").val() == "") {
          window.parent.warning($.multilang("index_menuitem_cannot_empty"));
          return;
        }

        MENU.menuID = "";
        MENU.menuName = $("#com_key").val();
        MENU.driverValue = $("#com_key").data("driver-value");
        MENU.task = {
          "Type": "",
          "Data": {
            "AppPath": ""
          }
        }
      };
      break;
      case 'macro':{
        var menuInfo = {
          "Type": "Macro",
          "Data": {
            "GUID": "",
            "Repeats": 1,
            "StopMode": 1
          }
        }
        if($("#tool_macro").find(".menu-list").find(".menu-item.selected").length === 0) {
            window.parent.warning($.multilang("index_menuitem_cannot_empty"));
            return;
        }

        if($("#now_macro_type").find(".func-item.active").length === 0) {
            window.parent.warning($.multilang("apply_macro_type"));
            return;
        }

        if($("#repeats").val() == "") {
            window.parent.warning($.multilang("apply_macro_times"));
            return;
        }

        menuInfo.Data.StopMode = $("#now_macro_type").find(".func-item.active").index() + 1;
        menuInfo.Data.GUID =  $("#tool_macro").find(".menu-list").find(".menu-item.selected").data("guid");
        menuInfo.Data.Repeats = parseInt($("#repeats").val());

        MENU.menuID = '';
        MENU.menuName = $("#tool_macro").find(".menu-list").find(".menu-item.selected").text();
        MENU.driverValue = "0x0A010001";
        MENU.task = menuInfo;
      };
      break;
      case 'light':{
        var menuInfo = {
          "GUID": "",
          "Name": "",
          "Params": null
        }
        if($("#tool_light").find(".func-setting").find("ul").find(".menu-item.selected").length == 0) {
          window.parent.alertify.warning($.multilang("index_menuitem_cannot_empty"));
          return;
        }
        menuInfo.GUID = $("#tool_light").find(".func-setting").find("ul").find(".menu-item.selected").data("guid");
        menuInfo.Name = $("#tool_light").find(".func-setting").find("ul").find(".menu-item.selected").text();
        menuInfo.Params = JSON.parse(JSON.stringify(DEVICE.params));
        MENU.keyLE = menuInfo;
      };
      break;
      case 'mouse':
      case 'media':
      case 'hotbutton':{
        var items = $("#tool_"+MENU.menuPName).find(".func-item");
        for(var x = 0; x < items.length; x++) {
          if($(items[x]).hasClass("active")) {
            MENU.driverValue = $(items[x]).attr("DriverValue");
            MENU.menuID = x;
            MENU.menuName = $(items[x]).attr("MenuName");
            MENU.task = {
              "Type": "",
              "Data": {
                "AppPath": ""
              }
            }
            break;
          }
        }
        if(MENU.menuID === "") {
          window.parent.warning($.multilang("index_menuitem_cannot_empty"));
          return;
        }
      };
      break;
      case 'shortcut':{
        var menuInfo = {
          "Type": "OpenURL",
          "Data": {
            "AppPath": ""
          }
        };
        if($("#exe_path_show").find("input").val() == "") {
          window.parent.warning($.multilang("index_menuitem_cannot_empty"));
          return;
        }
        menuInfo.Data.AppPath = $("#exe_path_show").find("input").data("appdir");
        MENU.menuName = $("#exe_path_show").find("input").val();;
        MENU.menuID = "";
        MENU.driverValue = "0x0A030001";
        MENU.task = menuInfo;
        };
      break;
      case 'forbidden':{
        MENU.menuName = $.multilang("forbidden");
        MENU.driverValue = "0x02000000";
        MENU.menuID = "";
        MENU.task = {
          "Type": "",
          "Data": {
            "AppPath": ""
          }
        }
      };
      break;
      case 'lamp' :{
        var guid = $(this).closest(".lamp").find("ul").find("li.selected").data("guid");
        DEVICE.profile.ModeLE.GUID = guid;
        DEVICE.profile.ModeLE.Name = $(this).closest(".lamp").find("ul").find("li.selected").text();
        DEVICE.profile.ModeLE.Params = JSON.parse(JSON.stringify(DEVICE.params));
        //设置logo灯效
        var logoleenable = 0;
        if($("#logo_chk").prop("checked")) {
          logoleenable = 1;
        }
        var logoletype = $("#logo_color_set").find(".func-item.active").attr('logotype');
        DEVICE.profile.LogoLE.Enable = logoleenable;
        DEVICE.profile.LogoLE.Type = parseInt(logoletype);
        onProfileChanged();
        return;
      }
      break;
    }

    for (var i = 0; i < DEVICE.profile.KeySet.length; i++) {
      if (DEVICE.profile.KeySet[i].Index === MENU.index) {
        var bakKeySet = JSON.parse(JSON.stringify(DEVICE.profile.KeySet[i]));
        if (MENU.menuPName == 'light') {
          DEVICE.profile.KeySet[i].KeyLE = MENU.keyLE;
        } else {
          DEVICE.profile.KeySet[i].MenuPID = MENU.menuPID;
          DEVICE.profile.KeySet[i].MenuID = MENU.menuID;
          DEVICE.profile.KeySet[i].MenuName = MENU.menuName;
          DEVICE.profile.KeySet[i].DriverValue = MENU.driverValue;
          DEVICE.profile.KeySet[i].Task = MENU.task;
        }
        if(MENU.menuPName == 'macro') {
          if((CMS.deviceConfig.ScrollUpKey === DEVICE.profile.KeySet[i].Index) || (CMS.deviceConfig.ScrollDownKey === DEVICE.profile.KeySet[i].Index)) {
            window.parent.warning($.multilang("index_cannot_macro"));
          }
        }

        if(MENU.menuPName == 'shortcut') {
          if((CMS.deviceConfig.ScrollUpKey === DEVICE.profile.KeySet[i].Index) || (CMS.deviceConfig.ScrollDownKey === DEVICE.profile.KeySet[i].Index)) {
            window.parent.warning($.multilang("index_cannot_shortcut"));
          }
        }

        var leftCounter = 0;
        for(var j = 0;j<DEVICE.profile.KeySet.length;j++)
        {
            if ((DEVICE.profile.KeySet[j].DriverValue == "0x01010001") ||
               ((DEVICE.profile.KeySet[j].Index == 0) &&
                (DEVICE.profile.KeySet[j].DriverValue == "0xFFFFFFFF")))
            {
                leftCounter++;
                break;
            }
        }

        if(leftCounter == 0)
        {
            DEVICE.profile.KeySet[i] = bakKeySet;
            window.parent.warning($.multilang("index_configuration_is_not_valid"));
            return;
        }
        var change_value = null;
        var change_value_light = null;
        if (DEVICE.profile.KeySet[i].MenuName)
          change_value = DEVICE.profile.KeySet[i].MenuName;
        if (DEVICE.profile.KeySet[i].KeyLE.Name)
          change_value_light = DEVICE.profile.KeySet[i].KeyLE.Name;

        $(".device-keystate[data-logiccode='" + DEVICE.profile.KeySet[i].Index + "']").data("change-value", change_value);
        $(".device-keystate[data-logiccode='" + DEVICE.profile.KeySet[i].Index + "']").data("change-value-light", change_value_light);
        $(".device-keystate[data-logiccode='" + DEVICE.profile.KeySet[i].Index + "']").addClass("border")
        break;
      }
    }
    onProfileChanged();
  });

  //初始化模式灯光功能按钮
  $("#tools_lamp_1").find(".ximagebutton").ximagebutton({
    onClick: function() {
      $element = this;
      var index = $element.index();
      $("#tools_lamp_2").find(".functions").hide();
      $("#tools_lamp_2").find(".functions").eq(index).show();
      $element.ximagebutton('active');
      $element.siblings().ximagebutton('inactive');
    }
  });

  //主题灯效配置
  staticLampFunc();
  lampfunc();
  bindingEvent();
}

function renderMacroList() {
  if (CMS.macros.length ==0) {
    return;
  }
  $("#tool_macro").find(".menu-list").find("ul").empty();
  var str='';
  for (var i = 0; i < CMS.macros.length; i++) {
    if(!CMS.macros[i].Icon)
      var icon = 'res/img/macro/macro_name_1.png';
    else
      var icon = 'res/img/macro/' + CMS.macros[i].Icon ;

    if (CMS.macros[i].Type === 1) {
      str += '<li class="menu-item menu-item-dir" data-index="' + i + '" data-type="' + 1 + '">\
      <img src="' + icon + '"/><span>' + CMS.macros[i].Name + '</span>\
      </li>';
    } else {
      str += '<li class="menu-item menu-item-file" data-index="' + i + '" data-type="' + 0 + '" data-guid="' + CMS.macros[i].GUID + '">\
      <img src="' + icon + '"/><span>' + CMS.macros[i].Name + '</span>\
      </li>';
    }
  }
  $("#tool_macro").find(".menu-list").find("ul").append(str);
  $("#tool_macro").find(".menu-list").find("li").click(function() {
    if ($(this).data("type") == 0) {
      $(this).addClass("selected").siblings().removeClass("selected");
      return;
    }
    var index = $(this).data("index");
    if (CMS.macros[index].Data.length) {
      $("#tool_macro").find(".menu-list").find("ul").empty();
      $("#macro_menu").find("span").addClass("macro-back");
      $("#macro_menu").append('<span class="macrogroup-now">/' + CMS.macros[index].Name + '</span>');
      var str =''
      for (var i = 0 ; i < CMS.macros[index].Data.length; i++) {
        if(!CMS.macros[index].Data[i].Icon)
          var icon = 'res/img/macro/macro_name_1.png';
        else
          var icon = 'res/img/macro/' + CMS.macros[index].Data[i].Icon;

        str +='<li class="menu-item menu-item-dir" data-index="' + i + '" data-type="' + 0 + '" data-guid="' + CMS.macros[index].Data[i].GUID + '">\
        <img src="' + icon + '"/><span>' + CMS.macros[index].Data[i].Name + '</span>\
        </li>';
      }
      $("#tool_macro").find(".menu-list").find("ul").append(str);
    }

    $("#tool_macro").find(".menu-list").find("ul").find(".menu-item").click(function() {
      $(this).addClass("selected").siblings().removeClass("selected");
    });

  });
}

function renderLightList() {
  if (CMS.les.length ==0) {
    return;
  }
  $("#tool_light").find(".menu-list").find("ul").empty();
  var str='';
  for (var i = 0; i < CMS.les.length; i++) {
    if(CMS.les[i].LeType == "combination")
      continue;
    if(CMS.deviceConfig.LeCate && CMS.les[i].LeCate && (CMS.deviceConfig.LeCate == CMS.les[i].LeCate)) {
      str += '<li class="menu-item menu-item-light menu-item-file" data-index="' + i + '" data-type="' + 0 + '" data-guid="' + CMS.les[i].GUID + '">\
      <span>' + CMS.les[i].Name + '</span>\
      </li>';
    } else if (!CMS.deviceConfig.LeCate && !CMS.les[i].LeCate) {
      str += '<li class="menu-item menu-item-light menu-item-file" data-index="' + i + '" data-type="' + 0 + '" data-guid="' + CMS.les[i].GUID + '">\
      <span>' + CMS.les[i].Name + '</span>\
      </li>';
    }
  }
  $("#tool_light").find(".menu-list").find("ul").append(str);
}

function renderStaticLamp() {
  $("#tool_lamp").find(".static-lelist").find("ul").empty();
  var str = '<li class="menu-item menu-item-light" data-guid=""><span>'+$.multilang("kb_static_light")+'</span></li>';
  $("#tool_lamp").find(".static-lelist").find("ul").append(str);

  $("#bottom_nav").hide();
}

function staticLampFunc() {
  $("#tool_lamp").find(".func-static-lelist").find("ul").find(".menu-item").unbind('click').click(function() {
    $(this).addClass("selected").siblings().removeClass("selected");
    $("#tool_lamp").find(".func-setting").find("ul").find(".menu-item").removeClass("selected");
    $.le('stop');
    DEVICE.playle = '';
    $("#le_config_color_select p").data('index', null);
    lightenKeyFunc();
    if(!DEVICE.profile.ModeLE.LEData) {
      DEVICE.profile.ModeLE.LEData = {};
    }
    var leData = DEVICE.profile.ModeLE.LEData;
    DEVICE.leData = leData;
    DEVICE.params = null;

    var config = {};
    for(var index in leData) {
      config[index] = leData[index].replace("0x", "#");
    }
    var data = {
      "config": config
    };
    $('#device').device({
      display: data
    });
  });
}

function lightenKeyFunc() {
  $("#bottom_nav").css({'display': 'flex'});
  $("#le_configs").css({'display': 'none'});
  $('#device').device({
    onSingleSelect: null,
    onMultiSelect: null
  });
  $('#device').device({
    onSingleSelect: lighten,
    onMultiSelect: lightenMulti
  });
}

function lighten(keyItem) {
  var locationCode = keyItem.LocationCode;
  if (DEVICE.definecolor === null) {
    window.parent.warning($.multilang("kb_select_color"));
    return;
  }
  if(locationCode === -1) {
    return;
  }
  DEVICE.profile.ModeLE.LEData[locationCode] = DEVICE.definecolor;
  var leData = DEVICE.profile.ModeLE.LEData;
  var config = {};
  for(var index in leData) {
    config[index] = leData[index].replace("0x", "#");
  }
  var data = {
    "config": config
  };
  $('#device').device({
    display: data
  });
}

function lightenMulti(locationCodes) {
  if (DEVICE.definecolor === null) {
    window.parent.warning($.multilang("kb_select_color"));
    return;
  }
  for (var i = 0; i < locationCodes.length; i++) {
    var locationCode = locationCodes[i];
    if(locationCode === -1) {
      continue;
    }
    DEVICE.profile.ModeLE.LEData[locationCode] = DEVICE.definecolor;
  }
  var leData = DEVICE.profile.ModeLE.LEData;
  var config = {};
  for(var index in leData) {
    config[index] = leData[index].replace("0x", "#");
  }
  var data = {
    "config": config
  };
  $('#device').device({
    display: data
  });
}

function cancelKeyFunc() {
  $("#bottom_nav").css({'display': 'flex'});
  $('#device').device({
    'display': {
      'config': {}
    }
  });
  $('#device').device({
    onSingleSelect: null,
    onMultiSelect: null
  });
}

function renderLamp() {
  if (CMS.les.length ==0) {
    return;
  }
  $("#tool_lamp").find(".menu-list").find("ul").empty();
  var str = '';
  for (var i = 0; i < CMS.les.length; i++) {
    if(CMS.les[i].LeType == "combination")
      continue;
    if(CMS.deviceConfig.LeCate && CMS.les[i].LeCate && (CMS.deviceConfig.LeCate == CMS.les[i].LeCate)) {
      str += '<li class="menu-item menu-item-light menu-item-file" data-index="' + i + '" data-type="' + 0 + '" data-guid="' + CMS.les[i].GUID + '">\
      <span>' + CMS.les[i].Name + '</span>\
      </li>';
    } else if (!CMS.deviceConfig.LeCate && !CMS.les[i].LeCate) {
      str += '<li class="menu-item menu-item-light menu-item-file" data-index="' + i + '" data-type="' + 0 + '" data-guid="' + CMS.les[i].GUID + '">\
      <span>' + CMS.les[i].Name + '</span>\
      </li>';
    }
  }
  $("#tool_lamp").find(".menu-list").find("ul").append(str);
}

function lampfunc() {
  $("#tool_lamp").find(".func-setting").find("ul").find(".menu-item").unbind('click').click(function() {
    $(this).addClass("selected").siblings().removeClass("selected");
    $("#tool_lamp").find(".func-static-lelist").find("ul").find(".menu-item").removeClass("selected");
    cancelKeyFunc();
    var guid = $(this).data("guid");
    if(guid) {
      window.parent.readLE(guid, function(data) {
        var params = null;
        if (guid == DEVICE.profile.ModeLE.GUID) {
          if(DEVICE.profile.ModeLE.Params)
            params = DEVICE.profile.ModeLE.Params;
        }
        params = $.le('play', data, params);
        DEVICE.leData = data;
        DEVICE.params = null;
        setColorConfig(data, params);
        DEVICE.playle = guid;
      });
    } else {
      $.le('stop');
      DEVICE.playle = '';
    }
  });
}

function setColorConfig(data, params) {
  $("#le_configs").css({'display': 'flex'});
  $("#le_config_colors").empty();
  $("#le_config_set").css({'display': 'none'});
  if (!params) return;
  if(params && params.hasOwnProperty('LEConfigs') && Object.prototype.toString.call(params.LEConfigs) == '[object Array]') {
    var leConfigs = params.LEConfigs;
    initLeColorSet(leConfigs);
    leColorSetFunc(data, params);
  }
}

function initLeColorSet(leConfigs) {
  var text = $.multilang('color_param_set');
  $("#le_config_color_select p").text(text);
  $("#le_config_color_select p").data('index', null);
  var str = '';
  for (var i = 0; i < leConfigs.length; i++) {
    str += '<div class="item">' + $.multilang('color_param') + i + ' : ' + $.multilang(leConfigs[i].Key) + '</div>';
  }
  $("#le_config_colors").append(str);
}

function leColorSetFunc(data, params) {
  $("#le_config_colors").find(".item").off('mouseenter mouseleave').hover(function() {
    $(this).css({'outline': '1px solid #00c2ee'});
  }, function() {
    $(this).css({'outline': 'none'});
  });

  $("#le_config_colors").find(".item").off('click').click(function() {
    $("#le_config_colors").hide();
    $("#le_color_dropdown").removeClass("hover-up");
    var text = $(this).text();
    var index = $(this).index();
    $("#le_config_color_select p").text(text);
    $("#le_config_color_select p").data('index', index);
    DEVICE.params = params;
    $.le('play', data, DEVICE.params);
    $("#le_config_set").css({'display': 'flex'});
    $("#le_config_set_color").css({'backgroundColor': params.LEConfigs[index].Color.replace("0x", "#")});
  });

}

function bindingEvent() {
  //取色器颜色变化
  $('.picker').each( function() {
    $(this).minicolors({
      inline: $(this).attr('data-inline') === 'true',
      change: function(hex, opacity) {
        onColorChanged(hex);
      },
      theme: 'default'
    });
  });

  //颜色块选择框点击
  $("#choose_color").find(".item").click(function() {
    $("#current_color").css({
      backgroundColor: $(this).css("background-color")
    });
    $("#le_config_set_color").css({
      backgroundColor: $(this).css("background-color")
    });
    var rgb = $(this).css('background-color');
    rgb = jQuery.Color(rgb).toHexString();
    rgb = "0x"+rgb.substring(1,rgb.length);
    DEVICE.definecolor = rgb;
    var index = $("#le_config_color_select p").data('index');
    if (DEVICE.params !== null && index !== null) {
      DEVICE.params.LEConfigs[index].Color = DEVICE.definecolor;
      $.le('play', DEVICE.leData, DEVICE.params);
      $("#le_config_set_color").css({
        backgroundColor: $(this).css("background-color")
      });
    }
  });

}

//颜色改变回调
function onColorChanged(data) {
  $("#current_color").css({
    'backgroundColor': data
  });

  DEVICE.definecolor = "0x"+data.substring(1,data.length);
  var index = $("#le_config_color_select p").data('index');
  if (DEVICE.params !== null && index !== null) {
    DEVICE.params.LEConfigs[index].Color = DEVICE.definecolor;
    $.le('play', DEVICE.leData, DEVICE.params);

    $("#le_config_set_color").css({
      'backgroundColor': data
    });
  }
}

function getName(name, size, items) {
  if(typeof(name) !== "string") return;
  var flag = true;
  for (var i = 0; i < items.length; i++) {
    if (items[i] == (name + size)) {
      flag = false;
      break;
    }
  }
  if (flag) {
    return name + size;
  } else {
    size = size + 1;
    return getName(name, size, items);
  }
}

function checkLE() {
  var flag = true;
  var modelLEFlag = checkModelLE();
  var keyLEFlag = checkKeyLE();

  if (!(modelLEFlag && keyLEFlag)) {
    flag = false;
  }
  return flag;
}

//检查模式灯效
function checkModelLE() {
  if (!DEVICE.profile.ModeLE.GUID)
    return true;
  var flag = true;
  for (var j = 0; j < CMS.les.length; j++) {
    if (DEVICE.profile.ModeLE.GUID == CMS.les[j].GUID) {
      if (DEVICE.profile.ModeLE.Name != CMS.les[j].Name) {
        DEVICE.profile.ModeLE.Name = CMS.les[j].Name;
      }
      flag = false;
      break;
    }
  }
  if (flag)
    return false; //模式灯效文件已被删除
  else
    return true;  //模式灯效文件存在
}

//检查按键配置灯效
function checkKeyLE() {
  var isCompleted =true;
  for (var i = 0; i < DEVICE.profile.KeySet.length; i++) {
    if (!DEVICE.profile.KeySet[i].KeyLE.GUID)
      continue;
    var flag = true;
    for (var j = 0; j < CMS.les.length; j++) {
      if (DEVICE.profile.KeySet[i].KeyLE.GUID == CMS.les[j].GUID) {
        if (DEVICE.profile.KeySet[i].KeyLE.Name != CMS.les[j].Name) {
          DEVICE.profile.KeySet[i].KeyLE.Name = CMS.les[j].Name;
        }
        flag = false;
        break;
      }
    }
    if (flag)
      isCompleted = false;
  }
  return isCompleted;
}

function checkMacro() {
  var flag = true;
  var isKeyMacroFlag = checkKeyMacro();
  if (!isKeyMacroFlag)
    flag = false;
  return flag;
}

function checkKeyMacro() {
  var isCompleted =true;
  for (var i = 0; i < DEVICE.profile.KeySet.length; i++) {
    if ((!DEVICE.profile.KeySet[i].Task) || (!DEVICE.profile.KeySet[i].Task.Type != 'Macro'))
      continue;
    var flag = true;
    for (var j = 0; j < CMS.les.length; j++) {
      if (!DEVICE.profile.KeySet[i].Task.Data.GUID)
        continue;
      if (DEVICE.profile.KeySet[i].Task.Data.GUID == CMS.les[j].GUID) {
        if (DEVICE.profile.KeySet[i].MenuName != CMS.les[j].Name) {
          DEVICE.profile.KeySet[i].MenuName = CMS.les[j].Name;
        }
        flag = false;
        break;
      }
    }
    if (flag)
      isCompleted = false;
  }
  return isCompleted;
}

//鼠标性能
function changeLevel() {
    $('#dpi_bar').range({
        from: CMS.deviceConfig.DPIParam.From,
        to: CMS.deviceConfig.DPIParam.To,
        step: CMS.deviceConfig.DPIParam.Step,
        scale: CMS.deviceConfig.DPIParam.Scale,
        format: '%s',
        width: 300,
        showLabels: true,
        snap: true,
        theme:'theme-yellow',
        onChange:function(val) {
          DEVICE.profile.DPISet[CMS.currentProfile.CurrentDPI].DPIX = parseInt(val);
          DEVICE.profile.DPISet[CMS.currentProfile.CurrentDPI].DPIY = parseInt(val);
          $("#sensetivity_level").find(".num").eq(CMS.currentProfile.CurrentDPI).text(val);
        }
    });
    //DPI档位选择
    var items = $("#sensetivity_level").find(".item");
    var dpicoloritems = $(".dpi-color .colors").find(".item");

    for(var x=0;x<items.length;x++) {

        $(items[x]).find(".num").text(CMS.currentProfile.DPISet[x].DPIX);
        if(CMS.currentProfile.CurrentDPI==$(items[x]).attr("level")) {
            $(items[x]).addClass("hover");
            $("#dpi_bar").range('setValue',CMS.currentProfile.DPISet[x].DPIX);
        }else{
          $(items[x]).removeClass("hover");
        }
    }

    items.click(function() {
        DEVICE.profile.CurrentDPI = parseInt($(this).attr("level"));
        items.removeClass("hover");
        $(this).addClass("hover");
        for(var x=0;x<items.length;x++) {
          $(items[x]).find(".num").text(CMS.currentProfile.DPISet[x].DPIX);
          if(CMS.currentProfile.CurrentDPI==$(items[x]).attr("level")) {
            $(items[x]).addClass("hover");
            $("#dpi_bar").range('setValue',CMS.currentProfile.DPISet[x].DPIX);
            for(var y=0;y<dpicoloritems.length;y++) {
              if(CMS.currentProfile.DPISet[CMS.currentProfile.CurrentDPI].DPIColor == $(dpicoloritems[y]).attr("colorindex")) {
                  $(dpicoloritems[y]).addClass("hover");
              }else{
                $(dpicoloritems[y]).removeClass("hover");
              }
            }
          }else{
            $(items[x]).removeClass("hover");
          }
        }
    });

    for(var x=0;x<dpicoloritems.length;x++) {
      if(CMS.currentProfile.DPISet[CMS.currentProfile.CurrentDPI].DPIColor == $(dpicoloritems[x]).attr("colorindex")) {
          $(dpicoloritems[x]).addClass("hover");
      }else{
        $(dpicoloritems[x]).removeClass("hover");
      }
    }

    dpicoloritems.click(function() {
      $(this).siblings().removeClass("hover");
      $(this).addClass("hover");
      DEVICE.profile.DPISet[CMS.currentProfile.CurrentDPI].DPIColor = parseInt($(this).attr('colorindex'));
    });

    //应用按钮按下
    $("#use_settings").click(function() {
        onApplyProfile();
    });
}

function initialize_Tools_left_1() {//初始化左侧工具栏
    //回报率选择按钮
    var hz_select = $("#hz_select").find(".item");

    for(var x=0;x<hz_select.length;x++) {
        var pic = $(hz_select[x]).find("img").attr("src");
        if(CMS.currentProfile.ReportRate == $(hz_select[x]).attr("hz")) {
             $(hz_select[x]).find("img").attr("src", pic.substring(0, pic.length-5)+"2.png");
        }
        else{
             $(hz_select[x]).find("img").attr("src", pic.substring(0, pic.length-5)+"1.png");
        }
    }
    hz_select.click(function() {
        if($(this).attr("hz") == CMS.currentProfile.ReportRate)
            return;
        DEVICE.profile.ReportRate = parseInt($(this).attr("hz"));
        for(var x=0;x<hz_select.length;x++) {
    var pic = $(hz_select[x]).find("img").attr("src")
        if(CMS.currentProfile.ReportRate == $(hz_select[x]).attr("hz"))
             $(hz_select[x]).find("img").attr("src", pic.substring(0, pic.length-5)+"2.png");
        else
             $(hz_select[x]).find("img").attr("src", pic.substring(0, pic.length-5)+"1.png");
        }
    });
}

//频率设置
function onLeverBarInput(ths) {
    DEVICE.profile.DPISet[CMS.currentProfile.CurrentDPI].DPIX = parseInt($(ths).val());
    DEVICE.profile.DPISet[CMS.currentProfile.CurrentDPI].DPIY = parseInt($(ths).val());
    $("#sensetivity_level").find(".num").eq(CMS.currentProfile.CurrentDPI).text($(ths).val());
}

$("#apply_perform").click(function() {
  onProfileChanged();
});