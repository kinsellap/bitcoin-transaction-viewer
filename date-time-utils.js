const formatDateTime = (epochTimeStamp) => {
    var d = new Date(epochTimeStamp * 1000);
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'Sepember', 'October', 'November', 'December'];
    var month = months[d.getMonth()];
    return d.getUTCDate() + ' ' + month + ' ' + d.getUTCFullYear() + ' at ' + d.getUTCHours() + ':' + d.getUTCMinutes();
}

module.exports = { formatDateTime };