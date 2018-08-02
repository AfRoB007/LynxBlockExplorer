var Decimal = require('decimal.js');

exports.ifEquals = function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
};

exports.ifNotEquals = function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.inverse(this) : options.fn(this);
};

exports.formatNumber = function(value, options) {
    return Number(value).toLocaleString('en-US', { style: 'decimal', maximumFractionDigits: 0 });
};

exports.toFixed = function(value, fractionDigits=2) {    
    if(typeof value === 'string'){
        return new Decimal(value).toFixed(fractionDigits);
    }
    return value.toFixed(fractionDigits);
};

exports.toAmount = function(value, fractionDigits=2) {        
    return (value/100000000).toFixed(fractionDigits);
};

exports.toKB = function(value, fractionDigits=2) {    
    if(typeof value === 'string'){
        return new Decimal(value).dividedBy(1024).toFixed(fractionDigits);
    }
    return (value/1024).toFixed(fractionDigits);
};

exports.toUnixTime = function(unixtime){
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

exports.blockConfirmationClass = function(value1, value2, options) {
    if(value1 >= value2) return 'bg-success';
    else if(value1 < (value2 / 2)) return 'bg-danger';
    return 'bg-warning';
};