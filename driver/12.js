webpackJsonp([12],{114:function(e,t,a){"use strict";function o(e){a(569)}Object.defineProperty(t,"__esModule",{value:!0});var i=a(560),r=a(566),c=a(26),n=o,l=c(i.a,r.a,!1,n,null,null);t.default=l.exports},560:function(e,t,a){"use strict";var o=a(64),i=a.n(o);t.a={data:function(){return{loading:!0,schfilter:"",macrofilter:"",filtermacrolist:[],disabled:!1,macroname:"",macrocfg:{GUID:"",StopMode:1,Repeats:1}}},props:["height","macrolist"],created:function(){},mounted:function(){var e=this;setTimeout(function(){e.filtermacrolist=e.macrolist[0].Data,e.loading=!1,e.macrofilter=e.macrolist[0].Name},1e3)},watch:{schfilter:function(e,t){this.filtermacrolist=this.macrolist[0].Data.filter(function(t){return~t.Name.indexOf(e)})}},methods:{changeMacroType:function(e){console.log("macro type changed "+e);var t=this;t.filtermacrolist=t.macrolist[e].Data},handleCurrentChange:function(e){this.macroname=e.Name,this.macrocfg.GUID=e.GUID},setMacro:function(){var e=this;if(""==e.macrocfg.GUID)return void e.alertInfo("提示","请先选择要设置的宏！",800);var t=JSON.parse(i()(this.macrocfg));t.Repeats=parseInt(t.Repeats),console.log(i()(t),e.macroname),e.$emit("setKeyMacro",e.macroname,t)},alertInfo:function(e,t,a){this.$notify({title:e,type:t,duration:a,position:"bottom"})}}}},563:function(e,t,a){t=e.exports=a(10)(void 0),t.push([e.i,".el-input-group__prepend{width:3rem}.macrolist-oper{padding:.4rem 1rem}.edit-cell{background:#333;-webkit-appearance:none;background-image:none;border-radius:4px;border:1px solid #111;box-sizing:border-box;color:#aaa;display:inline-block;font-size:inherit;height:1.6rem;line-height:1.6rem;outline:0;padding:0 1rem;transition:border-color .2s cubic-bezier(.645,.045,.355,1);width:100%}.edit-cell.mini{width:3rem;padding:0 .2rem;text-align:center}",""])},566:function(e,t,a){"use strict";var o=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("el-row",[a("el-col",{staticStyle:{padding:".5rem"},attrs:{span:24}},[a("el-card",{staticStyle:{position:"relative"}},[a("div",{staticClass:"disablediv",class:{disablehide:!e.disabled}}),e._v(" "),a("template",{slot:"header"},[a("i",{staticClass:"header-icon el-icon-document"}),e._v(" "+e._s(e.$t("macro.macro_setting_title"))+"\n      ")]),e._v(" "),a("el-input",{staticClass:"input-with-select",attrs:{placeholder:e.$t("common.input_search_text"),size:"mini"},model:{value:e.schfilter,callback:function(t){e.schfilter=t},expression:"schfilter"}},[a("el-select",{staticStyle:{width:"7rem"},attrs:{slot:"prepend",placeholder:e.$t("common.please_select")},on:{change:e.changeMacroType},slot:"prepend",model:{value:e.macrofilter,callback:function(t){e.macrofilter=t},expression:"macrofilter"}},e._l(e.macrolist,function(e,t){return a("el-option",{key:e.index,attrs:{label:e.Name,value:t}})}),1),e._v(" "),a("el-button",{attrs:{slot:"append",icon:"el-icon-search"},slot:"append"})],1),e._v(" "),a("el-table",{directives:[{name:"loading",rawName:"v-loading",value:e.loading,expression:"loading"}],attrs:{data:e.filtermacrolist,"show-header":!1,border:"",height:e.height,size:"mini","highlight-current-row":"","empty-text":e.$t("common.no_data")},on:{"current-change":e.handleCurrentChange}},[a("el-table-column",{scopedSlots:e._u([{key:"default",fn:function(t){return[a("i",{staticClass:"el-icon-document"}),e._v(" "),a("span",{staticStyle:{"margin-left":"10px"}},[e._v(e._s(t.row.Name))])]}}])})],1),e._v(" "),a("div",{staticClass:"macrolist-oper"},[a("el-radio",{attrs:{label:1},model:{value:e.macrocfg.StopMode,callback:function(t){e.$set(e.macrocfg,"StopMode",t)},expression:"macrocfg.StopMode"}},[e._v(e._s(e.$t("macro.macro_btn_execute"))),a("input",{directives:[{name:"model",rawName:"v-model",value:e.macrocfg.Repeats,expression:"macrocfg.Repeats"}],staticClass:"edit-cell mini",domProps:{value:e.macrocfg.Repeats},on:{input:function(t){t.target.composing||e.$set(e.macrocfg,"Repeats",t.target.value)}}}),e._v(e._s(e.$t("macro.n_times_stop")))]),a("br"),e._v(" "),a("el-radio",{attrs:{label:2},model:{value:e.macrocfg.StopMode,callback:function(t){e.$set(e.macrocfg,"StopMode",t)},expression:"macrocfg.StopMode"}},[e._v(e._s(e.$t("macro.macro_btn_execute_release_to_stop")))]),a("br"),e._v(" "),a("el-radio",{attrs:{label:3},model:{value:e.macrocfg.StopMode,callback:function(t){e.$set(e.macrocfg,"StopMode",t)},expression:"macrocfg.StopMode"}},[e._v(e._s(e.$t("macro.macro_btn_execute_pressagain_to_stop")))]),e._v(" "),a("el-button",{staticStyle:{position:"absolute",right:".3rem",bottom:".4rem"},attrs:{icon:"el-icon-view",loading:!1},on:{click:e.setMacro}},[e._v(e._s(e.$t("common.use")))])],1)],2)],1)],1)},i=[],r={render:o,staticRenderFns:i};t.a=r},569:function(e,t,a){var o=a(563);"string"==typeof o&&(o=[[e.i,o,""]]),o.locals&&(e.exports=o.locals);a(18)("61a3b411",o,!0,{})}});