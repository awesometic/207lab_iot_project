
var tasks = [
{"startDate":new Date("Sun Dec 08 09:00:00 EST 2012"),"endDate":new Date("Sun Dec 08 12:30:00 EST 2012"),"taskName":"EJ","status":"OFFICE"},
{"startDate":new Date("Sun Dec 08 13:30:00 EST 2012"),"endDate":new Date("Sun Dec 08 16:30:00 EST 2012"),"taskName":"EJ","status":"OFFICE"},
{"startDate":new Date("Sun Dec 08 16:30:00 EST 2012"),"endDate":new Date("Sun Dec 08 18:30:00 EST 2012"),"taskName":"EJ","status":"OUTSIDE"},
{"startDate":new Date("Sun Dec 08 20:00:00 EST 2012"),"endDate":new Date("Sun Dec 08 22:00:00 EST 2012"),"taskName":"EJ","status":"OVERTIME"},

{"startDate":new Date("Sun Dec 08 09:30:00 EST 2012"),"endDate":new Date("Sun Dec 08 12:30:00 EST 2012"),"taskName":"SY","status":"OFFICE"},
{"startDate":new Date("Sun Dec 08 13:30:00 EST 2012"),"endDate":new Date("Sun Dec 08 18:00:00 EST 2012"),"taskName":"SY","status":"OFFICE"},
{"startDate":new Date("Sun Dec 08 19:00:00 EST 2012"),"endDate":new Date("Sun Dec 08 22:00:00 EST 2012"),"taskName":"SY","status":"OVERTIME"},

{"startDate":new Date("Sun Dec 08 09:00:00 EST 2012"),"endDate":new Date("Sun Dec 08 22:00:00 EST 2012"),"taskName":"DG","status":"BTRIP"},

{"startDate":new Date("Sun Dec 08 09:00:00 EST 2012"),"endDate":new Date("Sun Dec 08 12:30:00 EST 2012"),"taskName":"XX","status":"OUTSIDE"},
{"startDate":new Date("Sun Dec 08 13:30:00 EST 2012"),"endDate":new Date("Sun Dec 08 18:00:00 EST 2012"),"taskName":"XX","status":"OFFICE"},

{"startDate":new Date("Sat Dec 08 09:00:00 EST 2012"),"endDate":new Date("Sun Dec 08 12:30:00 EST 2012"),"taskName":"QQ","status":"OFFICE"},
{"startDate":new Date("Sat Dec 08 13:30:00 EST 2012"),"endDate":new Date("Sun Dec 08 18:00:00 EST 2012"),"taskName":"QQ","status":"OFFICE"}
];

var taskStatus = {
    "OUTSIDE" : "bar",
    "OVERTIME" : "bar-failed",
    "OFFICE" : "bar-running",
    "BTRIP" : "bar-killed"
};

var taskNames = [ "SY", "DG", "EJ", "QQ", "XX" ];

// tasks.sort(function(a, b) {
//     return a.endDate - b.endDate;
// });
var maxDate = tasks[tasks.length - 1].endDate;
// tasks.sort(function(a, b) {
//     return a.startDate - b.startDate;
// });
// var minDate = tasks[0].startDate;

var format = "%H";

var gantt = d3.gantt().taskTypes(taskNames).taskStatus(taskStatus).tickFormat(format);
gantt(tasks);