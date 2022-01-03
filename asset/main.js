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
        this.server_ip = ip;
        this.server_port = port;
        this.server_api_base = 'http://' + ip + ':' + port + '/api';
    },


    querySql:function(sql,callback){
      var api_url = this.server_api_base + '/query/sql';
      let param = {"stmt": sql}
      this.doRequest(api_url,param,callback);
    },
    doRequest:function(url,data,callback){
      $.post(
          url,JSON.stringify(data),'json'
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


//----------------------------------//
// 初始化
  SiyuanApi.init('localhost',6806);
  initCalendar();

//----------------------------------//

window.notelook = function(noteId){
  alert("正在开发，请点击左侧标题跳转到笔记");
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
          action +=  `<a href="javascript:void(0);" onclick="window.notelook('${note.id}');">查看</a>`;
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


