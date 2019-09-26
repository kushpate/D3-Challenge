//define SVG 
var width = parseInt(d3.select('#scatter')
    .style("width"));

var height = width * 2/3;
var margin = 10;
var labelArea = 110;
var padding = 45;

//create SVG object 
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "chart");

//labels
//first gtag for xaxis 
svg.append("g").attr("class", "xText");
var xText = d3.select(".xText");

//adjust xtext
var bottomTextX =  (width - labelArea)/2 + labelArea;
var bottomTextY = height - margin - padding;
xText.attr("transform",`translate(
    ${bottomTextX}, 
    ${bottomTextY})`
    );

// xaxis
// build xtext
xText.append("text")
    .attr("y", -19)
    .attr("data-name", "poverty")
    .attr("data-axis", "x")
    .text("In Poverty (%)");

//yaxis 
//second gtag for ytext for css
svg.append("g").attr("class", "yText");
var yText = d3.select(".yText");

//adjust ytext
var leftTextX =  margin + padding;
var leftTextY = (height + labelArea) / 2 - labelArea;
yText.attr("transform",`translate(${leftTextX}, ${leftTextY})rotate(-90)`
    );

//build ytext
yText .append("text")
    .attr("y", 22)
    .attr("data-name", "healthcare")
    .attr("data-axis", "y")
    .text("Lacks Healthcare (%)");
     
//define dynamic circle radius
var cRadius;
function adjustRadius() {
  if (width <= 530) {
    cRadius = 7;}
  else { 
    cRadius = 10;}
}
adjustRadius();

//read data 
d3.csv("assets/data/data.csv").then(function(data) {
    visualize(data);
});

function visualize (csvData) {
   var xMin;
   var xMax;
   var yMin;
   var yMax;

   //default x&y
   var currentX = "poverty";
   var currentY = "obesity";

   //tool tip box 
   var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([40, -60])
      .html(function(d) {
            //build text box for data display
            var stateLine = `<div>${d.state}</div>`;
            var yLine = `<div>${currentY}: ${d[currentY]}%</div>`;
            if (currentX === "poverty") {
                xLine = `<div>${currentX}: ${d[currentX]}%</div>`}          
            else {
                xLine = `<div>${currentX}: ${parseFloat(d[currentX]).toLocaleString("en")}</div>`;}             
            return stateLine + xLine + yLine  
        });

    //add tooltip to svg
    svg.call(toolTip);

    //finding the x and y max values in order to place the graph 
    function xMinMax() {
      xMin = d3.min(csvData, function(d) {
        return parseFloat(d[currentX]) * 0.85;
      });
      xMax = d3.max(csvData, function(d) {
        return parseFloat(d[currentX]) * 1.15;
      });     
    }

    function yMinMax() {
      yMin = d3.min(csvData, function(d) {
        return parseFloat(d[currentY]) * 0.85;
      });
      yMax = d3.max(csvData, function(d) {
        return parseFloat(d[currentY]) * 1.15;
      }); 
    }

    //setting up the x and y axis measurements
    xMinMax();
    yMinMax();

    var xScale = d3 
        .scaleLinear()
        .domain([xMin, xMax])
        .range([margin + labelArea, width - margin])

    var yScale = d3
        .scaleLinear()
        .domain([yMin, yMax])
        .range([height - margin - labelArea, margin])

    //create scaled x,y axis
    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);

    // append axis to the svg as group elements
    svg.append("g")
        .call(xAxis)
        .attr("class", "xAxis")
        .attr("transform", `translate(0, ${height - margin - labelArea})`
        );

    svg.append("g")
        .call(yAxis)
        .attr("class", "yAxis")
        .attr("transform", `translate(${margin + labelArea}, 0 )`
        );

    // Append the circles for each row of data
    var allCircles = svg.selectAll("g allCircles").data(csvData).enter();

    allCircles.append("circle")
        .attr("cx", function(d) {
            return xScale(d[currentX]);
        })
        .attr("cy", function(d) {
            return yScale(d[currentY]);
        })
        .attr("r", cRadius)
        .attr("class", function(d) {
            return "stateCircle " + d.abbr;
        })
        .on("mouseover", function(d) {
            //show data on mouseover
            toolTip.show(d, this);
            //borders circles when mouse is over a data point
            d3.select(this).style("stroke", "#323232");
        })
        .on("mouseout", function (d) {
            //removes data when mouse is not hovering over data point
            toolTip.hide(d);
            //removes the border that shows when hovering over a data point
            d3.select(this).style("stroke", "#e3e3e3")
        });

        //add state names when hovering over data points and remove the data when mouse moves out of the circle
        allCircles
            .append("text")
            .attr("font-size", cRadius)
            .attr("class", "stateText")
            .attr("dx", function(d) {
               return xScale(d[currentX]);
            })
            .attr("dy", function(d) {
              //center the names in middle of circle
              return yScale(d[currentY]) + cRadius /3;
            })
            .text(function(d) {
                return d.abbr;
              })

            .on("mouseover", function(d) {
                toolTip.show(d);
                d3.select("." + d.abbr).style("stroke", "#323232");
            })

            .on("mouseout", function(d) {
                toolTip.hide(d);
                d3.select("." + d.abbr).style("stroke", "#e3e3e3");
            });
      }