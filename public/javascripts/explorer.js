function LastTransactionTable(){
    this.url = '/ext/getlasttxs/0.00000001';
    this.params = {
        pageIndex : 1,
        pageSize : 10
    };
    this.result = null;
    this.selector = {
        tbody : $('#last-transactions-table tbody'),
        pageInfo :  $('#last-transactions-table .page-info'),
        pagination : $('#last-txn-pagination')
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
            var blockindex = "<a href='/block/" + data[i].blockhash + "'>" + data[i].blockindex + "</a>";
            var txnId = "<a href='/tx/" + data[i].txid + "'>" + data[i].txid + "</a>";
            var recipients = data[i].vout.length;
            var total = (data[i].total / 100000000).toFixed(8);
            var timeStamp = new Date((data[i].timestamp) * 1000).toUTCString();
            tbody += '<tr><td>' + blockindex + '</td><td>' + txnId + '</td><td>' + recipients + '</td><td>' + total + '</td><td>' + timeStamp + '</td></tr>';
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
}

window.Lynx_Explorer = {
    LastTransactionTable : LastTransactionTable
}