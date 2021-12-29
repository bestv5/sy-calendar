(function(){
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
          var pattern = /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/;
          var dateString= d.day + '000000';
          var formatedDate = dateString.replace(pattern, '$1/$2/$3 $4:$5:$6');
          newEvents.push({title: '笔记数:' + d.count, desc: '当前日期，你一共写了'+d.count+ '篇笔记',allDay:true, start: new Date(formatedDate)})
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
})();


