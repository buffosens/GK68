webpackJsonp([6],{116:function(e,t,i){"use strict";function o(e){i(610)}Object.defineProperty(t,"__esModule",{value:!0});var s=i(573),n=i(599),a=i(26),r=o,l=a(s.a,n.a,!1,r,null,null);t.default=l.exports},545:function(e,t,i){e.exports={default:i(547),__esModule:!0}},546:function(e,t,i){"use strict";t.__esModule=!0;var o=i(545),s=function(e){return e&&e.__esModule?e:{default:e}}(o);t.default=function(e,t,i){return t in e?(0,s.default)(e,t,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[t]=i,e}},547:function(e,t,i){i(548);var o=i(5).Object;e.exports=function(e,t,i){return o.defineProperty(e,t,i)}},548:function(e,t,i){var o=i(16);o(o.S+o.F*!i(8),"Object",{defineProperty:i(11).f})},573:function(e,t,i){"use strict";var o,s=i(546),n=i.n(s),a=i(64),r=i.n(a),l=document.getElementById("mainbox").offsetHeight,c=document.getElementById("mainbox").offsetWidth;t.a={data:function(){return{mainh:l,mainw:c,offsettop:0,offsetleft:0,isshowkeyset:!0,showstdset:!1,device:window.DEVICE,ismutiselect:!1,hasfnx:!1,stdfnxval:"",mutiselect:{startpos:{x:0,y:0},endpos:{x:0,y:0},left:0,top:0,width:0,height:0,display:"none",ismousedown:!1},mutiselecttype:0,mutiselectkeys:[],quickselects:window.CMS.deviceConfig.QuickSelect,isfnlayer:!1}},props:["deviceid","scale","scaleplus","keymap","showbtn","isfnkeyset","isediting"],computed:{showkeymap:function(){var e=this.scale,t=[];this.offsetleft=this.scaleplus/2*1200,this.offsettop=this.scaleplus/2*600;for(var i=0;i<this.keymap.length;i++){var o=JSON.parse(r()(this.keymap[i]));o.Position.Top=this.keymap[i].Position.Top*e-this.offsettop,o.Position.Left=this.keymap[i].Position.Left*e-this.offsetleft,o.Position.Width=this.keymap[i].Position.Width*e,o.Position.Height=this.keymap[i].Position.Height*e,t.push(o)}return t},did:function(){return this.deviceid}},mounted:function(){},watch:{deviceid:function(e){this.deviceid=e,this.hasfnx=!1},"device.currentProfile.ModeIndex":function(e,t){var i=this;1==e?(this.showstdset=!0,this.$nextTick(function(){i.showStdBtns(),$("std_conf_showbox").classList.add("key-breath"),setTimeout(function(){$("std_conf_showbox")&&$("std_conf_showbox").classList.remove("key-breath")},2e3)})):this.showstdset=!1},mutiselectkeys:function(e){console.log("selectkeys changed!"),console.log(r()(e),e.length);var t=this;t.$emit("selLeKeys",e,t.mutiselecttype)}},methods:(o={initKeyset:function(){var e=this,t="KeySet";e.isfnkeyset?(t="FnKeySet",e.isfnlayer=!0,DEVICE.currentProfile.KeySet.forEach(function(e,t){var i=document.getElementById("key"+e.Index);i&&(i.classList.remove("seted"),i.classList.remove("fnseted"),i.classList.remove("key-breath"),i.setAttribute("data-func",""),i.setAttribute("data-le",""),i.innerHTML="<span></span>")})):e.isfnlayer=!1,DEVICE.currentProfile[t].forEach(function(i,o){var s=document.getElementById("key"+i.Index);s&&(s.classList.remove("seted"),s.classList.remove("fnseted"),s.setAttribute("data-func",""),s.setAttribute("data-le",""),s.innerHTML="<span></span>",e.isfnkeyset&&s.classList.add("fnseted"),DEVICE.currentProfile[t][o].MenuName&&(s.children[0].classList.add("hasfunc"),s.classList.add("seted"),"0x0A010001"==DEVICE.currentProfile[t][o].DriverValue?(s.children[0].innerHTML=i.MenuName,s.setAttribute("data-func",i.MenuName)):(console.log(i.DriverValue),window.KeyFunc[i.DriverValue]?(window.KeyFunc[i.DriverValue].hasOwnProperty("Icon")&&s.children[0].classList.add(window.KeyFunc[i.DriverValue].Icon),window.KeyFunc[i.DriverValue].ShowClass&&s.children[0].classList.add(window.KeyFunc[i.DriverValue].ShowClass),s.setAttribute("data-func",e.$t("keys")[window.KeyFunc[i.DriverValue].LangTitle]),window.KeyFunc[i.DriverValue].Icon?s.children[0].innerHTML="":s.children[0].innerHTML=e.$t("keys")[window.KeyFunc[i.DriverValue].LangTitle]):(s.setAttribute("data-func",i.MenuName),i.MenuName.length<=5?s.children[0].innerHTML=i.MenuName:s.children[0].innerHTML=i.MenuName.substring(0,4)+"..."))),DEVICE.currentProfile.KeySet[o].KeyLE&&""!==DEVICE.currentProfile.KeySet[o].KeyLE.GUID&&(s.classList.add("seted"),s.setAttribute("data-le",DEVICE.currentProfile.KeySet[o].KeyLE.Name)))})},initStdKeyset:function(){var e=this;window.DefaultProfiles[0].KeySet.forEach(function(e,t){var i=$("key"+e.Index);i&&(i.classList.remove("seted"),i.setAttribute("data-func",""),i.setAttribute("data-le",""),i.innerHTML="<span></span>")}),CMS.deviceConfig.IsFnx&&(e.hasfnx=!0,DEVICE.currentProfile.hasOwnProperty("KeySet")&&(e.stdfnxval=e.device.currentProfile.KeySet[0].DriverValue.toString()))},changeFnx:function(e){var t=this;DEVICE.currentProfile.KeySet[0].DriverValue=e,t.$emit("fnxChange")},handleRemoveLight:function(){this.$emit("removeKeyLE")},handleRemoveFunc:function(){this.$emit("removeKeyFunc")},showStdBtns:function(){$("conf_showbox").style.setProperty("visibility","hidden","important");var e=$("std_conf_showbox"),t=CMS.deviceConfig.DriverLEKey,i=$("key"+t);i.offsetWidth,i.offsetLeft,i.offsetTop,e.offsetWidth,e.offsetHeight;e.style.setProperty("left","1rem","important"),e.style.setProperty("bottom","3rem","important")},showConfig:function(e){var t=$("conf_showbox");if(1!=DEVICE.currentProfile.ModeIndex){var i=$("key"+e),o={KeyFUNC:"",KeyLE:""};o.KeyFUNC=i.getAttribute("data-func"),o.KeyLE=i.getAttribute("data-le"),$("config_key").innerText=o.KeyFUNC?o.KeyFUNC:this.$t("common.key_func_no_config"),$("config_le")&&($("config_le").innerText=o.KeyLE?o.KeyLE:this.$t("common.key_le_no_config")),$("config_key").setAttribute("data-key",e);var s=i.offsetWidth,n=i.offsetLeft,a=i.offsetTop,r=t.offsetWidth,l=t.offsetHeight,c=n+s/2-r/2,d=a-l;t.style.setProperty("left",c+"px","important"),t.style.setProperty("top",d+"px","important"),t.style.setProperty("visibility","visible","important")}},hideConfig:function(){var e=$("conf_showbox");e&&e.style.setProperty("visibility","hidden","important")},handleKeyClick:function(e){var t=this;if(1==DEVICE.currentProfile.ModeIndex)return void t.alertInfo(t.$t("common.std_key_func_not_edit"),"warning",1e3);if(0===e)return void t.alertInfo(t.$t("common.fn_not_edit"),"warning",1e3);var i=!1,o=DEVICE.currentProfile.KeySet;t.isfnkeyset&&(o=DEVICE.currentProfile.FnKeySet);for(var s=0;s<o.length;s++)if(e==o[s].Index){i=!0;break}if(i){DEVICE.editKeyCode=e;var n=$("key"+e);n.classList.add("key-breath"),window.removeClass(window.siblings(n),"key-breath")}else t.alertInfo(t.$t("common.key_already_preset_func"),"warning",1e3)},handleSelectKeyLE:function(){this.$emit("showKeyLeSelect")},handleSelectStdLE:function(e){DEVICE.lestdindex=parseInt(e),this.$emit("selectStdLE")},handleRemoveStdLE:function(e){DEVICE.lestdindex=parseInt(e),this.$emit("removeStdLE")},renderFrame:function(e){for(var t=0;t<DEVICE.keymap.length;t++){var i=DEVICE.keymap[t].LocationCode;i=i.toString(),e[i]||$("le"+i)&&$("le"+i).style.setProperty("background","#000")}for(var o in e){var s=$("le"+o);s&&s.style.setProperty("background",window.toJS(e[o]))}},playLe:function(){var e=this,t=0,i=0,o=0,s=0;if(LeData.Canvases)for(var n=0;n<LeData.Canvases.length;n++)if(LeData.Canvases[n].DeviceTypes.indexOf(CMS.deviceConfig.DeviceType.toString())>=0){LeData=JSON.parse(r()(LeData.Canvases[n]));break}for(var a=0;a<LeData.Frames.length;a++)s+=LeData.Frames[a].Count;DEVICE.timer&&(clearInterval(DEVICE.timer),DEVICE.timer=null);var l=0;DEVICE.timer=setInterval(function(){++o==s&&(o=0);for(var n=JSON.parse(r()(LeData.LEConfigs)),a={},c=0;c<n.length;c++){switch(n[c].Color||(n[c].Color="0xffffff"),n[c].Type){case 0:n[c].Color=window.toJS(n[c].Color);break;case 1:var d=window.toHSB(n[c].Color);d.h=(d.h+l%n[c].Count*(360/n[c].Count))%360,n[c].Color=window.fromRGB(window.fromHSB(d));break;case 2:var d=window.toHSB(n[c].Color);d.b=d.b-l%(n[c].Count+n[c].StayCount)/(n[c].Count+n[c].StayCount)*100,n[c].Color=window.fromRGB(window.fromHSB(d))}for(var f in n[c].Keys)a[n[c].Keys[f]]=n[c].Color}var u={};for(var m in LeData.Frames[t].Data)a[m]?u[m]=a[m]:u[m]="0xffffff";LeData.Frames[t].Count>1?(i==LeData.Frames[t].Count-1&&(t++,i=0,t==LeData.Frames.length&&(t=0)),e.renderFrame(u),i++):(LeData.Frames[t].Data&&e.renderFrame(u),++t==LeData.Frames.length&&(t=0)),l++},100)},drag:function(e){var t=this;if(t.ismutiselect){var i=$("cms_header").offsetHeight;t.mutiselect.startpos.x=e.pageX,t.mutiselect.startpos.y=e.pageY,t.mutiselect.display="",t.mutiselect.left=e.pageX,t.mutiselect.top=e.pageY-i,t.mutiselect.ismousedown=!0,t.mutiselecttype=0,$("device").onmousemove=function(e){t.mutiselect.ismousedown&&(console.log("mouse move"),t.mutiselect.endpos.x=e.pageX,t.mutiselect.endpos.y=e.pageY,t.mutiselect.left=Math.min(e.pageX,t.mutiselect.startpos.x),t.mutiselect.top=Math.min(e.pageY-i,t.mutiselect.startpos.y-i),t.mutiselect.width=Math.abs(t.mutiselect.endpos.x-t.mutiselect.startpos.x),t.mutiselect.height=Math.abs(t.mutiselect.endpos.y-t.mutiselect.startpos.y))},document.onmouseup=function(){if(t.mutiselect.ismousedown){console.log("mouse up"),t.mutiselect.ismousedown=!1,t.mutiselect.display="none";for(var e=[],o=0;o<t.keymap.length;o++){var s=$("le"+t.keymap[o].LocationCode);s&&(t.mutiselect.width>0||t.mutiselect.height>0)?s.offsetLeft<Math.max(t.mutiselect.startpos.x,t.mutiselect.endpos.x)&&s.offsetLeft+s.offsetWidth>Math.min(t.mutiselect.startpos.x,t.mutiselect.endpos.x)&&s.offsetTop<Math.max(t.mutiselect.startpos.y-i,t.mutiselect.endpos.y-i)&&s.offsetTop+s.offsetHeight>Math.min(t.mutiselect.startpos.y-i,t.mutiselect.endpos.y-i)&&e.push(t.keymap[o].LocationCode):0!=t.mutiselect.width&&0!=t.mutiselect.height||t.mutiselect.startpos.x>=s.offsetLeft&&t.mutiselect.startpos.x<=s.offsetLeft+s.offsetWidth&&t.mutiselect.startpos.y-i>=s.offsetTop&&t.mutiselect.startpos.y-i<=s.offsetTop+s.offsetHeight&&e.push(t.keymap[o].LocationCode)}t.mutiselect.startpos.x=0,t.mutiselect.startpos.y=0,t.mutiselect.endpos.x=0,t.mutiselect.endpos.y=0,t.mutiselect.left=0,t.mutiselect.top=0,t.mutiselect.width=0,t.mutiselect.height=0,t.mutiselectkeys=e}}}},selectQuickKeys:function(e){console.log(e);var t=this,i=[];i="all"==e?window.getAllLocationCodes():"none"==e?[]:e,t.mutiselectkeys=i}},n()(o,"selectQuickKeys",function(e){console.log(e);var t=this,i=[];"all"==e?i=window.getAllLocationCodes():"none"==e?(i=[],t.$emit("selLeKeys",[])):i=e,t.mutiselecttype=1,t.mutiselectkeys=i}),n()(o,"switchFnLayer",function(){DEVICE.currentProfile.FnKeySet&&(this.isfnlayer=!this.isfnlayer,this.$emit("openFnLayer",this.isfnlayer))}),n()(o,"alertInfo",function(e,t,i){this.$notify({title:e,type:t,duration:i,position:"bottom-left"})}),o)}},588:function(e,t,i){t=e.exports=i(10)(void 0),t.push([e.i,".device{width:100%;height:100%;position:relative;z-index:0}.device .device-panel{position:absolute;z-index:0}.device .device-keycap{position:absolute;z-index:1}.device .device-outline{position:absolute;z-index:-1;-webkit-animation-timing-function:ease-in-out;-webkit-animation-name:device-outline;-webkit-animation-duration:1s;-webkit-animation-iteration-count:infinite;-webkit-animation-direction:alternate}.device-fn{position:absolute;z-index:11;cursor:pointer}.device-fn.active{border:2px solid red;border-radius:.4rem;box-shadow:inset 0 0 10px 10px rgba(0,194,255,.6)}@keyframes device-outline{0%{-webkit-filter:opacity(.2);transfrom:scale(.4)}to{-webkit-filter:opacity(1);transfrom:scale(1.2)}}.device-light{position:absolute;background-color:red;z-index:-1}.device-key{position:absolute;text-align:center;text-overflow:hidden;display:table;z-index:10;box-sizing:border-box}.device-key.noshowkeyset span{display:none}.device-key.seted{border-bottom:.3rem solid #00c2ff}.device-key span{display:table-cell;vertical-align:middle;text-align:center;width:100%;height:100%;z-index:12;cursor:pointer}.device-key span.hasfunc{color:#fff;background-color:hsla(0,0%,8%,.6)}.key-breath{border:1px solid #2b92d4;border-radius:2px;color:#fff;text-align:center;cursor:pointer;box-shadow:0 1px 2px rgba(0,0,0,.3);overflow:hidden;-webkit-animation-timing-function:ease-in-out;-webkit-animation-name:keybreathe;-webkit-animation-duration:.3s;-webkit-animation-iteration-count:infinite;-webkit-animation-direction:alternate}.el-tooltip__popper{border:1px solid #00c2ff}.el-tooltip__popper .popper__arrow{border-width:6px;bottom:-6px;left:calc(50% - 6px);margin-right:3px;border-bottom-width:0;border-top-color:#00c2ff}.el-tooltip__popper .popper__arrow:after{bottom:1px;margin-left:-6px;border-top-color:#303133;border-bottom-width:0}.key-func{color:gray}.key-func tr td{padding:.1rem}.key-func tr td.cval{color:#eee}.key-func tr td i{color:red;font-size:1.2rem;cursor:pointer}.key-func tr td i.warning{color:#ff0}.dis-edit{color:red}#conf_showbox{position:absolute;display:block}#std_conf_showbox td{border:1px solid #00778a;padding:.2rem .3rem}.device-multiselect{position:absolute;z-index:2;border:2px dotted #0af;filter:alpha(opacity=50)}#quick_sel{position:absolute;text-align:center;z-index:2}",""])},599:function(e,t,i){"use strict";var o=function(){var e=this,t=e.$createElement,i=e._self._c||t;return i("div",{staticClass:"device",attrs:{id:"device"},on:{mousedown:function(t){return e.drag(t)}}},[i("img",{staticClass:"device-panel",style:{width:1200*e.scale+"px",height:600*e.scale+"px",left:-e.offsetleft+"px",top:-e.offsettop+"px"},attrs:{src:e.APPCFG.devices[e.did].img_panel,draggable:"false"}}),e._v(" "),i("img",{staticClass:"device-keycap",style:{width:1200*e.scale+"px",height:600*e.scale+"px",left:-e.offsetleft+"px",top:-e.offsettop+"px"},attrs:{src:e.APPCFG.devices[e.did].img_keycap,draggable:"false"},on:{mouseout:e.hideConfig}}),e._v(" "),i("img",{staticClass:"device-outline",style:{width:1200*e.scale+"px",height:600*e.scale+"px",left:-e.offsetleft+"px",top:-e.offsettop+"px"},attrs:{src:e.APPCFG.devices[e.did].img_outline,draggable:"false"}}),e._v(" "),e._l(e.showkeymap,function(e){return i("div",{staticClass:"device-light",style:{left:e.Position.Left+"px",top:e.Position.Top+"px",width:e.Position.Width+"px",height:e.Position.Height+"px",transform:"rotate("+e.Position.Rotate+"deg)"},attrs:{id:"le"+e.LocationCode}})}),e._v(" "),e._l(e.showkeymap,function(t){return 0==t.LogicCode?i("div",{staticClass:"device-fn",class:{active:e.isfnlayer},style:{left:t.Position.Left+"px",top:t.Position.Top+"px",width:t.Position.Width+"px",height:t.Position.Height+"px",transform:"rotate("+t.Position.Rotate+"deg)"},on:{click:e.switchFnLayer}}):e._e()}),e._v(" "),i("div",{staticClass:"keybox"},e._l(e.showkeymap,function(t){return e.showbtn&&t.LogicCode>0?i("div",{staticClass:"device-key",class:{noshowkeyset:!e.isshowkeyset},style:{left:t.Position.Left+"px",top:t.Position.Top+"px",width:t.Position.Width+"px",height:t.Position.Height+"px",transform:"rotate("+t.Position.Rotate+"deg)"},attrs:{id:"key"+t.LogicCode,"data-logic":t.LogicCode},on:{mouseover:function(i){return e.showConfig(t.LogicCode)},click:function(i){return e.handleKeyClick(t.LogicCode)}}}):e._e()}),0),e._v(" "),i("div",{staticClass:"device-multiselect",style:{left:e.mutiselect.left+"px",top:e.mutiselect.top+"px",width:e.mutiselect.width+"px",height:e.mutiselect.height+"px",display:e.mutiselect.display}}),e._v(" "),e.showbtn?i("div",{staticClass:"el-tooltip__popper is-dark",staticStyle:{visibility:"hidden"},attrs:{id:"conf_showbox"}},[i("div",[i("table",{staticClass:"key-func"},[i("tr",[i("td",[e._v(e._s(e.$t("common.key_func"))+" :")]),e._v(" "),i("td",{staticClass:"cval",attrs:{id:"config_key",colspan:"2"}},[e._v(e._s(e.$t("common.key_func_no_config")))]),e._v(" "),i("td",[i("i",{staticClass:"el-icon-delete",on:{click:e.handleRemoveFunc}})])]),e._v(" "),e.isfnkeyset?e._e():i("tr",[i("td",[e._v(e._s(e.$t("common.key_light"))+" :")]),e._v(" "),i("td",{staticClass:"cval",attrs:{id:"config_le"}},[e._v(e._s(e.$t("common.key_le_no_config")))]),e._v(" "),i("td",[i("i",{staticClass:"el-icon-more-outline warning",on:{click:e.handleSelectKeyLE}})]),e._v(" "),i("td",[i("i",{staticClass:"el-icon-delete",on:{click:e.handleRemoveLight}})])])])]),e._v(" "),i("div",{staticClass:"popper__arrow"})]):e._e(),e._v(" "),e.showstdset?i("div",{staticClass:"el-tooltip__popper is-dark",staticStyle:{padding:"6px"},attrs:{id:"std_conf_showbox"}},[i("div",[i("table",{staticClass:"key-func"},[i("tr",{staticStyle:{height:"1.8rem","line-height":"1.8rem"}},[i("th",[e._v(e._s(e.$t("common.light_effect"))+":")]),e._v(" "),e._l(e.device.currentProfile.DriverLE,function(t,o){return i("td",{key:o,staticClass:"cval"},[i("span",{attrs:{id:"std_le_"+o}},[e._v(e._s(t.GUID?t.Name:e.$t("common.key_le_no_config")))]),e._v(" "),i("i",{staticClass:"el-icon-more-outline warning",on:{click:function(t){return e.handleSelectStdLE(o)}}}),e._v(" "),i("i",{staticClass:"el-icon-delete error",on:{click:function(t){return e.handleRemoveStdLE(o)}}})])})],2),e._v(" "),e.hasfnx?i("tr",[i("th",{staticStyle:{"text-align":"right"}},[e._v("Fnx:")]),e._v(" "),i("td",{staticStyle:{border:"none","text-align":"left"},attrs:{colspan:"5"}},[i("el-radio-group",{attrs:{size:"mini"},on:{change:e.changeFnx},model:{value:e.stdfnxval,callback:function(t){e.stdfnxval=t},expression:"stdfnxval"}},[i("el-radio-button",{attrs:{label:"0x0a070002"}},[e._v(e._s(e.$t("keys.key_mode_offline_1")))]),e._v(" "),i("el-radio-button",{attrs:{label:"0x0a070003"}},[e._v(e._s(e.$t("keys.key_mode_offline_2")))]),e._v(" "),i("el-radio-button",{attrs:{label:"0x0a070004"}},[e._v(e._s(e.$t("keys.key_mode_offline_3")))])],1)],1)]):e._e()])]),e._v(" "),i("div",{staticClass:"popper__arrow",staticStyle:{left:"2rem"}})]):e._e(),e._v(" "),e.isediting?i("div",{style:{bottom:.4*e.mainh+"px",width:.76*e.mainw+"px"},attrs:{id:"quick_sel"}},[i("el-row",[i("el-col",{attrs:{span:24}},[e._l(e.quickselects,function(t,o){return i("el-button",{key:o,attrs:{size:"mini"},on:{click:function(i){return e.selectQuickKeys(t.lcodes)}},nativeOn:{mouseenter:function(t){e.ismutiselect=!1},mouseleave:function(t){e.ismutiselect=!0}}},[e._v(e._s(e.$t("common")[t.lang]))])}),e._v(" "),i("el-button",{attrs:{size:"mini"},on:{click:function(t){return e.selectQuickKeys("all")}},nativeOn:{mouseenter:function(t){e.ismutiselect=!1},mouseleave:function(t){e.ismutiselect=!0}}},[e._v(e._s(e.$t("common.line_all")))]),e._v(" "),i("el-button",{attrs:{size:"mini"},on:{click:function(t){return e.selectQuickKeys("none")}},nativeOn:{mouseenter:function(t){e.ismutiselect=!1},mouseleave:function(t){e.ismutiselect=!0}}},[e._v(e._s(e.$t("common.line_none")))])],2)],1)],1):e._e()],2)},s=[],n={render:o,staticRenderFns:s};t.a=n},610:function(e,t,i){var o=i(588);"string"==typeof o&&(o=[[e.i,o,""]]),o.locals&&(e.exports=o.locals);i(18)("0678c9e0",o,!0,{})}});