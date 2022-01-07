(function(){
  const pattern = /(\d{4})(\d{2})(\d{2})/;
  const syCalendarConfig = {
    countPrePage : 10
  };

  //思源api
  const SiyuanApi = {
    server_api_base:'',
    server_ip : '127.0.0.1',
    server_port : '6806',
    init:function(ip,port){
        if(ip && ip != ''){
          this.server_ip = ip;
        }
        if(port && port!=""){
          this.server_port = port;
        }
        this.server_api_base = 'http://' +  this.server_ip + ':' +  this.server_port + '/api';
    },


    querySql:function(sql,callback){
      var api_url =  '/query/sql';
      let param = {"stmt": sql}
      this.doRequest(api_url,param,callback);
    },
    doRequest:function(url,data,callback){
      $.post(
        this.server_api_base + url,JSON.stringify(data),'json'
      ).done(result => {
        if(result.code === 0){
            if(typeof callback == 'function'){
              callback(result.data);
            }
        }else{
          console.error('请求出错!,result code = ' + result.code + ',详细结果:');
          console.info(result);
        }
      });
    }


  };

var initCalendar = function(){
    $('#calendar').calendar({
      clickEvent:function(event){
        console.info(event);
        showNoteList(event.event.data.day, 1);
      },
      clickNextBtn: function() {
        var calendar = $('#calendar').data('zui.calendar');
        console.info(calendar.date.format('YYYYMM'));
        addCount(calendar.date.format('YYYYMM'));
      },
      clickPrevBtn:function(){
        var calendar = $('#calendar').data('zui.calendar');
        console.info(calendar.date.format('YYYYMM'));
        addCount(calendar.date.format('YYYYMM'));
      },
      clickTodayBtn:function(){
        var calendar = $('#calendar').data('zui.calendar');
        console.info(calendar.date)
        addCount(calendar.date.format('YYYYMM'));
     }
    });
    addCount(new Date().format('YYYYMM'));
    

}

var cleanCalender = function(){
  var calendar = $('#calendar').data('zui.calendar');
  calendar.resetData({events: []});
}

var callback = function(data){
    cleanCalender();
    if(data!=null && data.length > 0){
      var calendar = $('#calendar').data('zui.calendar');
       /* 增加内容 */
    var newEvents = [];
      data.forEach((d)=>{
        if(d.count > 0){
          var dateString= d.day;
          var formatedDate = dateString.replace(pattern, '$1/$2/$3 00:00:00');
          // newEvents.push({title: '待办:' + d.count, desc: '当前日期，你一共写了'+d.count+ '篇笔记',allDay:true, start: new Date(formatedDate)});
          newEvents.push({title: '笔记:' + d.count, desc: '当前日期，你一共写了'+d.count+ '篇笔记',allDay:true, start: new Date(formatedDate),data:{'day':dateString}});
        }
      });
      calendar.addEvents(newEvents);
      
    }
    
};
//添加笔记数量
var addCount = function (date) {
  SiyuanApi.querySql(`select t.day,count(1) as count from (
    select substr(created,1,8) day from blocks where type = 'd' and created like '${date}%'
  ) t group by t.day order by t.day asc
  `,callback);
}
var getElementOffset = function(element) {
  element = element
    ? element
    : window.frameElement.parentElement || window.frameElement;
  var result = { left: element.offsetLeft, top: element.offsetTop };
  element.offsetParent ? (element = element.offsetParent) : null;
  while (element) {
    result["left"] += element.offsetLeft;
    result["top"] += element.offsetTop;
    element = element.offsetParent;
  }
  return result;
};

//----------------------------------//
// 初始化
  SiyuanApi.init('',6806);
  initCalendar();

//----------------------------------//

window.notelook = function(event){
  console.info(event);
  let noteId = $(event.target).attr('data-id');
      let id = noteId;
      id = id.replace("((", "").replace("))", "");
      let 挂件坐标 = getElementOffset(window.frameElement);
      console.info(挂件坐标);

      let 虚拟链接 = top.document.createElement("span");
      虚拟链接.setAttribute("data-type", "block-ref");
      虚拟链接.setAttribute("data-id", id);
      let 临时目标 = top.document.querySelector(
        ".protyle-wysiwyg div[data-node-id] div[contenteditable]"
      );
      


      console.info(event.screenY  + '，' + event.screenX);
      虚拟链接.style = `position:fixed;top:${event.screenY}px;left:${event.screenX}px;`;
      // 虚拟链接.style.top = event.screenY + 'px;';// 挂件坐标.top;
      // 虚拟链接.style.left = event.screenX  + 'px;';// 挂件坐标.left;
      console.info(虚拟链接);
      临时目标.appendChild(虚拟链接);
      let 点击事件 = top.document.createEvent("MouseEvents");
      点击事件.initMouseEvent(
        "mouseover",
        true,
        false,
        window.parent,
        1,
        100,
        100,
        100,
        100,
        false,
        false,
        false,
        false,
        0,
        null
      );
      虚拟链接.dispatchEvent(点击事件);
      
  setTimeout(function(){
    let find = false;
    let panel = top.document.querySelector(`.block__popover[data-oid="${noteId}"]`);
    console.info(panel);
    if (panel) {
      find = true;
      panel.style.display = "none";
      panel.style.top = 挂件坐标.top + "px";
      panel.style.left = 挂件坐标.left +"px";
      panel.style.display = "flex";
      panel.style.height='400px';
    }
    虚拟链接.remove();
    return;
  }, 800);

}
window.nodegoto = function (noteId){
    top.window.location.href="siyuan://blocks/"+noteId;
}

var showNoteList = function(day,page){

  SiyuanApi.querySql(`select count(1) totalCount from blocks where type = 'd' and created like '${day}%'`,function(noteCount){
  
      SiyuanApi.querySql(`select id,name,content,* from blocks where type = 'd' and created like '${day}%' order by created desc `,function(notes){
        console.info(notes);
        var html = [];
        notes.forEach((note)=>{
          let action ='';
          let name = `<a href="javascript:void(0);" onclick="window.nodegoto('${note.id}');">${note.content}</a>`;
          action +=  `<a href="javascript:void(0);" data-id="${note.id}" onclick="window.notelook(event,'${note.id}');">查看</a>`;
          // action += ` <a href="javascript:void(0);" onclick="window.nodegoto('${note.id}');" target="_blank">转到</a>`;
            html.push({'name':name,'action': action});
        });
        let dataSource = {
              cols:[
                  {name: 'name', label: '笔记标题',minWidth:450,html:true},
                  {name: 'action', label: '动作', minWidth: 50,html:true},
              ],
              array:html
          }
        var myDataGrid = $('#myDataGrid').data('zui.datagrid');
        if(!myDataGrid){
          $('#myDataGrid').datagrid({
              showHeader:false,
              dataSource: dataSource,
              states: {
                pager: {page: 1, recPerPage: syCalendarConfig.countPrePage}
            }
          });
          myDataGrid = $('#myDataGrid').data('zui.datagrid');
        }
        myDataGrid.setDataSource(dataSource);
        myDataGrid.setPager(1,noteCount,syCalendarConfig.countPrePage);
        $('#myDataGrid .datagrid-scrollbar-v').remove();
        $('#myModal').modal('show');
      });

  });
}





})();


