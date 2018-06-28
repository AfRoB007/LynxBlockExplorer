function ConnectionsTable(){
    this.url = '/ext/connections';
    this.params = {
        pageIndex : 1,
        pageSize : 10
    };
    this.result = null;
    this.selector = {
        tbody : $('#connections-table .table tbody'),
        pageInfo :  $('#connections-table .table .page-info'),
        pagination : $('#connections-table .table .pagination')
    };

    this.getStartIndex = function(){
        return ((this.result.pageIndex - 1) * this.result.pageSize) + 1;
    }
    this.getEndIndex = function(){
        var index = (this.result.pageIndex * this.result.pageSize);
        return (index < this.result.count) ? index : this.result.count;
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
            tbody += '<tr><td>' + data[i].address + '</td><td>' + data[i].protocol + '</td><td>' + data[i].version + '</td><td>' + data[i].country + '</td></tr>';
        }
        this.selector.tbody.html(tbody);
    }
    this.paginate = function(){
        var _this = this;
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
    this.updatePageInfo = function(){
        var info = 'Showing ' + this.getStartIndex() + ' to ' + this.getEndIndex() + ' of ' + this.result.count + ' entries';
        this.selector.pageInfo.html(info);
    }
}

window.Lynx_Network = {
    ConnectionsTable : ConnectionsTable
}