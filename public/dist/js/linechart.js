var svg = dimple.newSvg("#chartContainer", 590, 600);

// The default data set for these examples has regular times
// and the point of this demo is to show the time axis
// functionality, therefore a small bespoke data set is used.
data = [
  { "Shift":"Start","Date":"1 Aug 2016 08:30","Value":1000 },
  { "Shift":"Start","Date":"2 Aug 2016 08:20","Value":1000 },
  { "Shift":"Start","Date":"3 Aug 2016 09:00","Value":1000 },
  { "Shift":"Start","Date":"4 Aug 2016 08:00","Value":1000 },
  { "Shift":"Start","Date":"5 Aug 2016 09:10","Value":1000 },
  { "Shift":"Start","Date":"6 Aug 2016 08:30","Value":1000 },
  { "Shift":"Start","Date":"7 Aug 2016 08:30","Value":1000 },
  // { "Shift":"Start","Date":"8 Aug 2016 12:00","Value":1000 },
  // { "Shift":"Start","Date":"9 Aug 2016 10:10","Value":1000 },
  // { "Shift":"Start","Date":"10 Aug 2016 11:40","Value":1000},

  // { "Shift":"Start","Date":"1 Dec Aug20Oct10 10:30","Value":1000 },
  // { "Shift":"Start","Date":"5 Dec 2010 09:30","Value":1000 },
  // { "Shift":"Start","Date":"13 Dec 2010 10:50","Value":1000 },
  // { "Shift":"Start","Date":"25 Dec 2010 10:10","Value":1000 },
  // { "Shift":"Start","Date":"30 Dec 2010 10:50","Value":1000 },

  // { "Shift":"Early","Date":"9 Dec 2010 12:20","Value":1700 },
  // { "Shift":"Early","Date":"15 Dec 2010 10:10","Value":1400 },
  // { "Shift":"Early","Date":"20 Dec 2010 10:00","Value":1200 },

  { "Shift":"End","Date":"1 Aug 2016 17:30","Value":1000 },
  { "Shift":"End","Date":"2 Aug 2016 19:30","Value":1000 },
  { "Shift":"End","Date":"3 Aug 2016 20:40","Value":1000 },
  { "Shift":"End","Date":"4 Aug 2016 18:10","Value":1000 },
  { "Shift":"End","Date":"5 Aug 2016 18:00","Value":1000 },
  { "Shift":"End","Date":"6 Aug 2016 19:50","Value":1000 },
  { "Shift":"End","Date":"7 Aug 2016 20:10","Value":1000 },
  // { "Shift":"End","Date":"8 Aug 2016 20:00","Value":1000 },
  // { "Shift":"End","Date":"9 Aug 2016 21:50","Value":1000 },
  // { "Shift":"End","Date":"10 Aug 2016 18:10","Value":1000 },

  // { "Shift":"End","Date":"1 Dec 2010 19:50","Value":1000 },
  // { "Shift":"End","Date":"5 Dec 2010 18:20","Value":1000 },
  // { "Shift":"End","Date":"13 Dec 2010 19:10","Value":1000 },
  // { "Shift":"End","Date":"25 Dec 2010 19:00","Value":1000 },
  // { "Shift":"End","Date":"30 Dec 2010 19:00","Value":1000 }
];

// Create Separate Date and Time, this allows us to draw them
// on separate axes. Despite the time axis only displaying
// the time portion, the whole date is used so they need to
// have the same date allocated
data.forEach(function (d) {
    d["Day"] = d["Date"].substring(0, d["Date"].length - 6);

    d["Time of Day"] =
        "2000-01-01 " + d["Date"].substring(d["Date"].length - 5);
}, this);
// Create the chart as usual
var myChart = new dimple.chart(svg, data);
myChart.setBounds(70, 40, 490, 320)

// Add the x axis reading dates in the format 01 Jan 2012
// and displaying them 01 Jan
var x = myChart.addTimeAxis("x", "Day", "%d %b %Y", "%m/%d(%a)");

// Add the y axis reading dates and times but only outputting
// times.
var y = myChart.addTimeAxis("y", "Time of Day",
    "%Y-%m-%d %H:%M", "%H:%M");

// Size the bubbles by volume
var z = myChart.addMeasureAxis("z", "Value");

// Setting min and max dates requires them to be set
// as actual javascript date objects
x.overrideMin = new Date("2016-07-31");
x.overrideMax = new Date("2016-08-07");
y.overrideMin = new Date("01/01/2000 7:00 am");
y.overrideMax = new Date("01/01/2000 11:00 pm");

// Show a label for every 4 weeks.
x.timePeriod = d3.time.days;
x.timeInterval = 1;

// Control bubble sizes by setting the max and min values
z.overrideMin = 900;
z.overrideMax = 3000;

// Add the bubble series for shift values first so that it is
// drawn behind the lines
myChart.addSeries("Shift", dimple.plot.bubble);

// Add the line series on top of the bubbles. The bubbles
// and line points will naturally fall in the same places
var s = myChart.addSeries("Shift", dimple.plot.line);

// Add line markers to the line because it looks nice
s.lineMarkers = true;

// Show a legend
myChart.addLegend(180, 10, 360, 20, "right");

// Draw everything
myChart.draw();
