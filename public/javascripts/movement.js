function AlertsTable(){
    this.url = null;
    this.params = {
        pageIndex : 1,
        pageSize : 10
    };
    this.result = null;
    this.flagA = null;
    this.flagB = null;
    this.selector = {
        tbody : $('#alerts-table .table tbody'),
        pageInfo :  $('#alerts-table .table .page-info'),
        pagination : $('#alerts-table .pagination')
    };

    this.getStartIndex = function(){
        return ((this.result.pageIndex - 1) * this.result.pageSize) + 1;
    }
    this.getEndIndex = function(){
        var index = (this.result.pageIndex * this.result.pageSize);
        return (index < this.result.count) ? index : this.result.count;
    }
    this.setUrl = function(url){
        this.url = url;
    }    
    this.load = function(){
        var _this = this;
        $.ajax({
            url: this.url,
            data : this.params,
            contentType: 'application/json',
            dataType: 'json',
            success: function (result) {
                _this.result = result;
                _this.render();
                _this.paginate();               
            }
        });
    }
    this.reload = function(){
        this.params = {
            pageIndex : 1,
            pageSize : 10
        };
        this.load();
    }
    this.render = function () {
        var tbody = '';
        var data = this.result.data;
        var length = data.length;
        
        for (var i = 0; i < length; i++) {
            data[i].txid = "<a href='/tx/" + data[i].txid + "' target='_blank'>" + data[i].txid + "</a>";
            
            var amount = data[i].total / 100000000;
            if (amount > this.flagB) {
              data[i].total = "<label class='label label-danger'>" + amount + "</label>";
            } else if (amount > this.flagA) {
              data[i].total = "<label class='label label-warning'>" + amount + "</label>";
            } else {
              data[i].total = "<label class='label label-success'>" + amount + "</label>";
            }             
            tbody += '<tr><td>' + this.formatUnixTime(data[i].timestamp) + '</td><td>' + data[i].txid + '</td><td>' + data[i].total + '</td></tr>';
        }
        this.selector.tbody.html(tbody);
    }
    this.paginate = function(){
        var _this = this;
        if(this.result.count>0){
            this.selector.pagination.twbsPagination({
                totalPages: Math.ceil(this.result.count / this.result.pageSize),
                onPageClick: function (event, page) {
                    _this.params = {
                        pageIndex : page,
                        pageSize : _this.result.pageSize
                    };
                    _this.load();
                }
            });
            this.updatePageInfo();
        }
    }
    this.updatePageInfo = function(){
        var info = 'Showing ' + this.getStartIndex() + ' to ' + this.getEndIndex() + ' of ' + this.result.count + ' entries';
        this.selector.pageInfo.html(info);
    }
    this.formatUnixTime = function (unixtime) {
        var a = new Date(unixtime * 1000);
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var date = a.getDate();
        var hour = a.getHours();
        var min = a.getMinutes();
        var sec = a.getSeconds();
        var suffix = 'th'
        if (date == 1 || date == 21 || date == 31) {
            suffix = 'st';
        }
        if (date == 2 || date == 22 || date == 32) {
            suffix = 'nd';
        }
        if (date == 3 || date == 23) {
            suffix = 'rd';
        }
        if (hour < 10) {
            hour = '0' + hour;
        }
        if (min < 10) {
            min = '0' + min;
        }
        if (sec < 10) {
            sec = '0' + sec;
        }
        var time = date + suffix + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
        return time;
    }
}

window.Lynx_Movement = {
    AlertsTable : AlertsTable
}