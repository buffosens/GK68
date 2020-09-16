var CMS = {};
var DEVICE = {
  profiles: [],
  modeIndex: 2,
  profile: null,
  keymap: null,
  params: null,
  definecolor: "0xff0000",
  leData:null,
  playle: null,
  modelLE: {
    guid: "",
    name: "",
    params: null
  },
  keySet: {
    index: null,
    menuPID: "",
    menuID: "",
    menuName: "",
    driverValue:"",
    keyLE: {
      GUID: "",
      Name: "",
      Params: null
    }
  }
};
var hoverTimer;
$.multilang=window.parent.$.multilang;
function initUI() {
  initDeviceImage();
  if (CMS.currentProfile && (CMS.currentProfile.ModeIndex > 1))
    DEVICE.modeIndex = CMS.currentProfile.ModeIndex;

  var items = [];

  for(var i = 0; i < CMS.profiles.length; i++) {
    var modeIndex = CMS.profiles[i].ModeIndex;
    if((modeIndex >= 2) && (modeIndex <= 4)) {
      (function(modeIndex) {
        window.parent.readProfile(CMS.deviceID, CMS.profiles[i].GUID, function(data) {
          DEVICE.profiles[modeIndex] = data;
          if (modeIndex == DEVICE.modeIndex) {
            onProfileSelect(DEVICE.modeIndex);
          }
        });
      })(modeIndex);
      if (modeIndex > 1) {
        var item = {
          active: (modeIndex == DEVICE.modeIndex) ? 1 : 0,
          guid: modeIndex,
          icons: {
            select : "res/img/profile_select_offline" + (modeIndex - 1) + "_1.png",
          },
        };
        items[modeIndex - 2] = item;
      }
    }
  }

  $('#profilelist').profilelist({
    maxNum: 3,
    items: items,
    icons: {
      select: "res/img/profile_select_1.png",
      bindapp: "res/img/profile_bindapp_1.png",
      import: "res/img/profile_import_1.png",
      export: "res/img/profile_export_1.png",
      delete: "res/img/profile_delete_1.png",
    },
    onSelect: onProfileSelect,
    onBindApp: null,
    onImport: null,
    onExport: null,
    onDelete: null,
  });
  $.le({
    onDisplay: function(data) {
      $('#device').device({"display": data});
    }
  });

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

      window.parent.writeProfile(CMS.deviceID, DEVICE.profile.GUID, DEVICE.profile, function() {
        window.parent.apply(CMS.deviceID, DEVICE.profile.GUID, function(result) {
          if(!result)
            window.parent.error($.multilang("apply_error"));
          else
            $("#apply").removeClass("btn-breath");
        });
      });
  });
  window.parent.dpiChanged(function(data) {
    if ((data.ModelID === CMS.deviceID) && (data.CurrentMode === CMS.currentProfile.ModeIndex)) {
      $("#sensetivity_level").find(".item[level='"+data.DPILevel+"']").click();
    }
  })
  window.parent.setLanguage(false);
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
});

function onProfileSelect(modeIndex) {
  DEVICE.modeIndex = modeIndex;
  DEVICE.profile = DEVICE.profiles[DEVICE.modeIndex];
  onProfileLoad();
  window.parent.changeMode(CMS.deviceID, modeIndex);
  $("#menu_select").find("li:eq(0)").click();
  $(".yes").removeClass("btn-breath");
  $("#apply").removeClass("btn-breath");
  $("#apply_perform input").removeClass("btn-breath");
  $(".change-cover").css("display","block");
  DEVICE.keySet.index = null;
}

function onProfileLoad() {
  CMS.currentProfile = DEVICE.profile;
  initDeviceImage();
  initDevice();
  initFunc();
  initDeviceEvent()
  initFuncEvent();
}

function onProfileChanged(callback) {
  window.parent.writeProfile(CMS.deviceID, DEVICE.profile.GUID, DEVICE.profile, function() {callback&&callback(); });
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
  DEVICE.keySet.index = null;

  //初始化菜单栏选项
  $("#menu_select").find("li").eq(0).addClass("active").siblings().removeClass("active");
  $("#lamp_setting").is(":visible") && $("#lamp_setting").hide();
  $("#mouse_performance").is(":visible") && $("#mouse_performance").hide();
  $("#func_setting").is(":hidden") && $("#func_setting").show();

  //初始化基本功能按钮状态
  $("#tools_1").find(".ximagebutton").ximagebutton({
    colors: {
      normal: "#787878",
      active: "#00c2ff"
    }
  });
  $("#tools_1").find(".ximagebutton").ximagebutton('inactive');
  $("#tools_1").find(".ximagebutton").eq(0).ximagebutton('active');
  $("#tools_2").find(".functions").hide();
  $("#tools_2").find(".functions").eq(0).show();

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
      DEVICE.keySet.index = data.LogicCode;
      $(".change-cover").css("display","none");
      $(".yes").removeClass("btn-breath");
      var currentyesbtn = $("#tools_2 .functions:visible .confirm .yes");
      isFuncDataChange(currentyesbtn);
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
    onProfileChanged(function() {$("#apply").addClass('btn-breath');});
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
    onProfileChanged(function() {$("#apply").addClass('btn-breath');});
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
          $("#logo_chk").prop("checked", true);
        else
          $("#logo_chk").prop("checked", false);

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
      $selectedLamp.click();
    } else {
      DEVICE.keySet.index = null;
      $(".change-cover").css("display","block");
      $("#bottom_nav").css({'display': 'none'});
      $("#lamp_setting").is(":visible") && $("#lamp_setting").hide();
      $("#mouse_performance").is(":visible") && $("#mouse_performance").hide();
      $("#func_setting").is(":hidden") && $("#func_setting").show();

      $("#device").find(".device-panel").attr('src', 'device/' + CMS.deviceID + '/img/device_key.png');
      //初始化按键
      $('#device').device({
        keymap: DEVICE.keymap,
      });
      $("#button-got").find("span").text("");
      DEVICE.keySet.index = null;
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
      $(".yes").removeClass("btn-breath");
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
    var currentfuncindex = $element.index();
      switch(currentfuncindex) {
        case 0:
          funcSinglebuttonDataProcess();
          break;
        case 1:
          funcMacroDataProcess();
          break;
        case 2:
          funcLightDataProcess();
          break;
        case 3:
          funcMouseDataProcess();
          break;
        case 4:
          funcMediaDataProcess();
          break;
        case 5:
          funcHotbuttonDataProcess();
          break;
        case 6:
          funcForbiddenDataProcess();
          break;
      }
    }
  });

  //单键录制
  $("#com_key").unbind('focus').focus(function() {
    window.parent.startHotKey(function(data) {
      $("#com_key").val(data.HotKeyName);
      $("#com_key").data("driver-value", data.HotKeyValue);
      funcSinglebuttonDataProcess();
    });
  });
  $("#com_key").unbind('blur').blur(function() {
    window.parent.stopHotKey();
  });
  $("#remove_singlebutton").unbind('click').click(function() {
    $("#com_key").val("");
    funcSinglebuttonDataProcess();
  });

  //宏
  $("#tool_macro").find(".func-setting").find("p").find("span").unbind('click').click(function() {
    if (!$(this).hasClass("macro-back")) return
    $(this).removeClass("macro-back");
    $("#macro_menu").find("span").text($.multilang('macro_list'));
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
    funcLightDataProcess();
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

    var currentfuncdivid = $(this).closest(".functions").attr("id");
    if(currentfuncdivid === 'tool_macro') {
      funcMacroDataProcess();
    }else if(currentfuncdivid === 'tool_mouse') {
      funcMouseDataProcess();
    }
    else if(currentfuncdivid === 'tool_media') {
      funcMediaDataProcess();
    }
    else if(currentfuncdivid === 'tool_hotbutton') {
      funcHotbuttonDataProcess();
    }
    else if(currentfuncdivid === 'tool_lamp') {
      isFuncDataChange($("#tool_lamp .confirm .yes"));
    }
  });

  //快捷键
  $("#exe_add").unbind('click').click(function() {
    window.parent.openFileDialog(function(data) {
      var pos = data.lastIndexOf("/");
      $("#exe_path_show").find("input").val(data.substring(pos+1));
      $("#exe_path_show").find("input").data("appdir",data);
    funcShortcutDataProcess();
    });
  });

  //确定键按下
  $(".yes").unbind('click').click(function() {
    var menuPName = $(this).closest(".functions").data("menu-p-name");
    for (var i = 0; i < DEVICE.profile.KeySet.length; i++) {
      if (DEVICE.profile.KeySet[i].Index === DEVICE.keySet.index) {
        if (menuPName == 'light') {
          DEVICE.profile.KeySet[i].KeyLE = DEVICE.keySet.keyLE;
        } else {
          var bakKeySet = JSON.parse(JSON.stringify(DEVICE.profile.KeySet[i]));

          DEVICE.profile.KeySet[i].MenuPID = DEVICE.keySet.menuPID;
          DEVICE.profile.KeySet[i].MenuID = DEVICE.keySet.menuID;
          if (menuPName === 'forbidden') {
            DEVICE.profile.KeySet[i].MenuID = "";
            DEVICE.profile.KeySet[i].MenuPID = 6;
          }
          DEVICE.profile.KeySet[i].MenuName = DEVICE.keySet.menuName;
          DEVICE.profile.KeySet[i].DriverValue = DEVICE.keySet.driverValue;
          if(menuPName == 'macro') {
            DEVICE.profile.KeySet[i].Task = DEVICE.keySet.task;
          }
        }

        if(menuPName == 'macro') {
          if((CMS.deviceConfig.ScrollUpKey === DEVICE.profile.KeySet[i].Index) || (CMS.deviceConfig.ScrollDownKey === DEVICE.profile.KeySet[i].Index)) {
            window.parent.warning($.multilang("index_cannot_macro"));
          }
        }

        if(menuPName == 'shortcut') {
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

    if (menuPName == 'lamp') {
      DEVICE.profile.ModeLE.GUID = DEVICE.modelLE.guid;
      DEVICE.profile.ModeLE.Name = DEVICE.modelLE.name;
      DEVICE.profile.ModeLE.Params = JSON.parse(JSON.stringify(DEVICE.params));
      //设置logo灯效
      var logoleenable = 0;
      if($("#logo_chk").prop("checked")) {
        logoleenable = 1;
      }
      var logoletype = $("#logo_color_set").find(".func-item.active").attr('logotype');
      DEVICE.profile.LogoLE.Enable = logoleenable;
      DEVICE.profile.LogoLE.Type = parseInt(logoletype);
    }
    $(this).removeClass("btn-breath");
    $("#apply").addClass('btn-breath');
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

  $('#logo_chk').click(function() {
    isFuncDataChange($("#tool_lamp .confirm .yes"));
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
      funcMacroDataProcess();
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
      funcMacroDataProcess();
    });
    disableImgDraggable();
  });
  disableImgDraggable();
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
    funcModelLeChangeProcess();
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
  funcModelLeChangeProcess();
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
    $("#le_config_set_color").css({'backgroundColor': DEVICE.params.LEConfigs[index].Color.replace("0x", "#")});
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
    backgroundColor: data
  });
  DEVICE.definecolor = "0x"+data.substring(1,data.length);
  var index = $("#le_config_color_select p").data('index');
  if (DEVICE.params !== null && index !== null) {
    DEVICE.params.LEConfigs[index].Color = DEVICE.definecolor;
    $.le('play', DEVICE.leData, DEVICE.params);
    $("#le_config_set_color").css({
      backgroundColor: data
    });
  }
  DEVICE.definecolor = "0x"+data.substring(1,data.length);
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
        $("#apply_perform input").addClass("btn-breath");
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
      if($(this).attr("level")==CMS.currentProfile.CurrentDPI)
          return;
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
    $("#apply_perform input").addClass("btn-breath");
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
    $("#apply_perform input").addClass("btn-breath");
  });
  //应用按钮按下
  $("#use_settings").click(function() {
      onApplyProfile();
  });
}

//初始化左侧工具栏
function initialize_Tools_left_1() {
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
    $("#apply_perform input").addClass("btn-breath");
    });
}

//频率设置
function onLeverBarInput(ths) {
    DEVICE.profile.DPISet[CMS.currentProfile.CurrentDPI].DPIX = parseInt($(ths).val());
    DEVICE.profile.DPISet[CMS.currentProfile.CurrentDPI].DPIY = parseInt($(ths).val());
    $("#sensetivity_level").find(".num").eq(CMS.currentProfile.CurrentDPI).text($(ths).val());
  $("#apply_perform input").addClass("btn-breath");
}

function mouseSetDataChange() {
  var dpi_select_val = $("#dpi_bar").val();
  alert(dpi_select_val)
  var beform_dpi = CMS.currentProfile.DPISet[CMS.currentProfile.CurrentDPI].DPIX
  alert(beform_dpi)
  if(dpi_select_val !== beform_dpi) {
    $("#apply_perform input").addClass("btn-breath");
  }else{
    $("#apply_perform input").removeClass("btn-breath");
  }
}

$("#apply_perform").click(function() {
  onProfileChanged(function() {
  $("#apply_perform input").removeClass("btn-breath");
  $("#apply").addClass('btn-breath');
  });
});

function isFuncDataChange(obj) {
  var parentobjname = obj.closest('.functions').data("menu-p-name");
  for (var i = 0; i < DEVICE.profile.KeySet.length; i++) {
    if (DEVICE.profile.KeySet[i].Index === DEVICE.keySet.index) {
      if ((DEVICE.profile.KeySet[i].MenuPID !== DEVICE.keySet.menuPID) ||
        (DEVICE.profile.KeySet[i].MenuID !== DEVICE.keySet.menuID) ||
        (DEVICE.profile.KeySet[i].MenuName !== DEVICE.keySet.menuName) ||
        (DEVICE.profile.KeySet[i].DriverValue !== DEVICE.keySet.driverValue)) {
        $(obj).addClass("btn-breath");
      }else{
        $(obj).removeClass("btn-breath");
      }
    }
  }

  if(parentobjname === 'lamp') {
    //设置logo灯效
    var logoleenable = 0;
    if($("#logo_chk")[0].checked) {
      logoleenable = 1;
    }
    var logoletype = parseInt($("#logo_color_set").find(".func-item.active").attr('logotype'));
    if((DEVICE.profile.ModeLE.GUID !== DEVICE.modelLE.guid) || (DEVICE.profile.LogoLE.Enable !== logoleenable) || (DEVICE.profile.LogoLE.Type !== logoletype)) {
      $(obj).addClass("btn-breath");
    }else{
      $(obj).removeClass("btn-breath");
    }
  }
}

function funcSinglebuttonDataProcess() {
  var menuPName = $("#tool_singlebutton").data("menu-p-name");
  var menuPID = $("#tool_singlebutton").index();
  if($("#com_key").val() == "") {
    return;
  }
  DEVICE.keySet.menuPID = menuPID;
  DEVICE.keySet.menuID = "";
  DEVICE.keySet.menuName = $("#com_key").val();
  DEVICE.keySet.driverValue = $("#com_key").data("driver-value");
  DEVICE.keySet.task = {
    "Type": "",
    "Data": {
      "AppPath": ""
    }
  }
  isFuncDataChange($("#tool_singlebutton .confirm .yes"));
}

function funcMacroDataProcess() {
  var menuPName = $("#tool_macro").data("menu-p-name");
  var menuPID = $("#tool_macro").index();
  var menuInfo = {
    "Type": "Macro",
    "Data": {
      "GUID": "",
      "Repeats": 1,
      "StopMode": 1
    }
  }
  if($("#tool_macro").find(".menu-list").find(".menu-item.selected").length === 0) {
    return;
  }

  if($("#now_macro_type").find(".func-item.active").length === 0) {
    return;
  }

  if($("#repeats").val() == "") {
    return;
  }

  menuInfo.Data.StopMode = $("#now_macro_type").find(".func-item.active").index() + 1;
  menuInfo.Data.GUID =  $("#tool_macro").find(".menu-list").find(".menu-item.selected").data("guid");
  menuInfo.Data.Repeats = parseInt($("#repeats").val());

  DEVICE.keySet.menuPID = menuPID;
  DEVICE.keySet.menuID = '';
  DEVICE.keySet.menuName = $("#tool_macro").find(".menu-list").find(".menu-item.selected").text();
  DEVICE.keySet.driverValue = "0x0A010001";
  DEVICE.keySet.task = menuInfo;
  isFuncDataChange($("#tool_macro .confirm .yes"));
}

function funcLightDataProcess() {
  var menuPName = $("#tool_light").data("menu-p-name");
  var menuPID = $("#tool_light").index();
  var menuInfo = {
    "GUID": "",
    "Name": "",
    "Params": null
  }
  if($("#tool_light").find(".func-setting").find("ul").find(".menu-item.selected").length == 0) {
    return;
  }
  menuInfo.GUID = $("#tool_light").find(".func-setting").find("ul").find(".menu-item.selected").data("guid");
  menuInfo.Name = $("#tool_light").find(".func-setting").find("ul").find(".menu-item.selected").text();
  menuInfo.Params = JSON.parse(JSON.stringify(DEVICE.params));
  DEVICE.keySet.keyLE = menuInfo;
  isFuncDataChange($("#tool_light .confirm .yes"));
}

function funcMouseDataProcess() {
  var menuPName = $("#tool_mouse").data("menu-p-name");
  var menuPID = $("#tool_mouse").index();
  var obj = null;
  var objindex = null;
  $("#tool_mouse .func-items .func-item").each(function(index,element) {
    if($(this).hasClass("active")) {
      objindex = $(this).index();//当前激活item的索引
      obj = $("#tool_mouse .func-items .func-item:eq("+ objindex +")");
    }
  });
  if(!obj)
    return;
  DEVICE.keySet.menuPID = menuPID;
  DEVICE.keySet.menuID =  objindex;
  DEVICE.keySet.menuName = obj.attr("menuname");
  DEVICE.keySet.driverValue = obj.attr("drivervalue");
  DEVICE.keySet.task = {
    "Type": "",
    "Data": {
      "AppPath": ""
    }
  }
  isFuncDataChange($("#tool_mouse .confirm .yes"));
}

function funcMediaDataProcess() {
  var menuPName = $("#tool_media").data("menu-p-name");
  var menuPID = $("#tool_media").index();
  var obj = null;
  var objindex = null;
  $("#tool_media .func-items .func-item").each(function(index,element) {
    if($(this).hasClass("active")) {
      objindex = $(this).index();//当前激活item的索引
      obj = $("#tool_media .func-items .func-item:eq("+ objindex +")");
    }
  });
  if(!obj)
    return;
  DEVICE.keySet.menuPID = menuPID;
  DEVICE.keySet.menuID =  objindex;
  DEVICE.keySet.menuName = obj.attr("menuname");
  DEVICE.keySet.driverValue = obj.attr("drivervalue");
  DEVICE.keySet.task = {
    "Type": "",
    "Data": {
      "AppPath": ""
    }
  }
  isFuncDataChange($("#tool_media .confirm .yes"));
}

function funcHotbuttonDataProcess() {
  var menuPName = $("#tool_hotbutton").data("menu-p-name");
  var menuPID = $("#tool_hotbutton").index();
  var obj = null;
  var objindex = null;
  $("#tool_hotbutton .func-items .func-item").each(function(index,element) {
    if($(this).hasClass("active")) {
      objindex = $(this).index();//当前激活item的索引
      obj = $("#tool_hotbutton .func-items .func-item:eq("+ objindex +")");
    }
  });
  if(!obj)
    return;
  DEVICE.keySet.menuPID = menuPID;
  DEVICE.keySet.menuID =  objindex;
  DEVICE.keySet.menuName = obj.attr("menuname");
  DEVICE.keySet.driverValue = obj.attr("drivervalue");
  DEVICE.keySet.task = {
    "Type": "",
    "Data": {
      "AppPath": ""
    }
  }
  isFuncDataChange($("#tool_hotbutton .confirm .yes"));
}

function funcForbiddenDataProcess() {
  var menuPID = $("#tool_forbidden").index();
  DEVICE.keySet.menuName = $.multilang("forbidden");
  DEVICE.keySet.driverValue = "0x02000000";
  DEVICE.keySet.menuID = "";
  DEVICE.keySet.menuPID = menuPID;
  DEVICE.keySet.task = {
    "Type": "",
    "Data": {
      "AppPath": ""
    }
  }
  var forbiddenobj = $("#tool_forbidden .confirm .yes");
  isFuncDataChange(forbiddenobj);
}

function funcModelLeChangeProcess() {
  var menuPName = $("#tool_lamp").data("menu-p-name");
  var guid = $("#tool_lamp").find("ul").find("li.selected").data("guid");
  DEVICE.modelLE.guid = guid;
  DEVICE.modelLE.name = $("#tool_lamp").find("ul").find("li.selected").text();
  DEVICE.modelLE.params = JSON.parse(JSON.stringify(DEVICE.params));
  isFuncDataChange($("#tool_lamp .confirm .yes"));
}
