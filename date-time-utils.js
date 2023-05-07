function formatDateTime(epochTimeStamp,) {
    var d = new Date(epochTimeStamp * 1000);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = d.getFullYear();
    var month = months[d.getMonth()];
    var date = d.getDate();
    var hour = d.getHours();
    var min = (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
    var sec = (d.getSeconds() < 10 ? '0' : '') + d.getSeconds();
    var time = date + '. ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
    return time;
}