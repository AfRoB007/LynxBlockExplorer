function LastTransactionTable(){
    this.url = '/ext/getlasttxs/0.00000001';
    this.params = {
        pageIndex : 1,
        pageSize : 10
    };
    this.result = {
        count : 0,
        data : [],
        pageIndex : 1,
        pageSize : 10
    };
    this.selector = {
        tbody : $('#last-transactions-table tbody'),
        tfoot : $('#last-transactions-table tfoot'),       
        pageSize : $('.table-page-size .form-control'),
        pageInfo :  null,
        pagination : null,
    };

    this.getStartIndex = function(){
        return ((this.result.pageIndex - 1) * this.result.pageSize) + 1;
    }
    this.getEndIndex = function(){
        var index = (this.result.pageIndex * this.result.pageSize);
        return (index < this.result.count) ? index : this.result.count;
    }
    this.init = function(){
        var _this = this;
        this.selector.pageSize.on('change',function(e){
            var value = +e.target.value;
            _this.params = {
                pageIndex : 1,
                pageSize : value
            };
            console.log('init');
            _this.load();
        });
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
            if($('#last-transactions-table tfoot .page-info').length===0){
                console.log('create tfoot');
                this.selector.tfoot.html('<tr><td colspan="5"><p class="page-info"></p><ul class="pagination pull-right"></ul></td></tr>');
                this.selector.pageInfo = $('#last-transactions-table tfoot .page-info');
                this.selector.pagination = $('#last-transactions-table tfoot .pagination');
            }
            setTimeout(function(){
                _this.selector.pagination.twbsPagination({
                    totalPages: Math.ceil(_this.result.count / _this.result.pageSize),
                    onPageClick: function (event, page) {
                        _this.params = {
                            pageIndex : page,
                            pageSize : _this.result.pageSize
                        };
                        _this.load();
                    }
                });
                _this.updatePageInfo();
            },1000);
        }else{
            this.selector.tfoot.html('<tr><td class="text-center" colspan="5">No items found.</td></tr>');
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