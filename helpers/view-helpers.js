
exports.ifEquals = function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
};

exports.formatNumber = function(value, options) {
    return Number(value).toLocaleString('en-US', { style: 'decimal', maximumFractionDigits: 0 });
};

exports.toFixed = function(value, fractionDigits=2) {
    return value.toFixed(fractionDigits);
};
