// Define SVG area dimensions
var svgWidth = 960;
var svgHeight = 500;

// Define the chart's margins as an object
var margin = {
  top: 60,
  right: 60,
  bottom: 60,
  left: 80
};

// Define dimensions of the chart area
var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

// Select body, append SVG area to it, and set its dimensions
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append a group area, then set its margins
var chartGroup = svg
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Load data from data.csv
d3.csv("assets/data/data.csv")
  .then(function(stateData) {
    console.log(stateData);

    // Convert each value to a number
    stateData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.healthcare = +data.healthcare;
    });

    // xLinearScale function above csv import
    var xLinearScale = d3
      .scaleLinear()
      .domain([
        d3.min(stateData, d => d.healthcare) * 1.8,
        d3.max(stateData, d => d.poverty) * 1.2
      ])
      .range([0, chartWidth]);

    var yLinearScale = d3
      .scaleLinear()
      .domain([0, d3.max(stateData, d => d.healthcare * 1.2)])
      .range([chartHeight, 0]);

    // Create axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x and y axis
    chartGroup
      .append("g")
      .attr("transform", `translate(0, ${chartHeight})`)
      .call(bottomAxis);

    chartGroup.append("g").call(leftAxis);

    /*Create the circle group for each state */
    var circles = chartGroup.selectAll("g circle").data(stateData);

    var r = 10;
    var circlesGroup = circles
      .enter()
      .append("g")
      .attr("id", "circlesGroup");

    // Generate circle
    circlesGroup
      .append("circle")
      .attr("cx", d => xLinearScale(d.poverty))
      .attr("cy", d => yLinearScale(d.healthcare))
      .attr("r", r)
      .classed("stateCircle", true);

    // Add text to circle
    circlesGroup
      .append("text")
      .attr("x", d => xLinearScale(d.poverty))
      .attr("y", d => yLinearScale(d.healthcare))
      .classed("stateText", true)
      .text(d => d.abbr)
      .attr("font-size", r * 0.95);

    //Initialize tool tip
    var toolTip = d3
      .tip()
      .attr("class", "d3-tip")
      .offset([40, -20])
      .html(function(d) {
        return `${d.state}<br>Poverty: ${d.poverty}% <br>Lacks Healthcare: ${d.healthcare}%`;
      });

    svg.call(toolTip);

    circlesGroup
      .on("mouseover", function(data) {
        toolTip.show(data, this);
      })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });

    // Create axes labels
    chartGroup
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 20)
      .attr("x", 0 - (chartHeight - 100))
      .attr("dy", "1em")
      .attr("class", "axisText")
      .text("Lacks Healthcare(%)");

    chartGroup
      .append("text")
      .attr(
        "transform",
        `translate(${chartWidth / 2}, ${chartHeight + margin.top - 10})`
      )
      .attr("class", "axisText")
      .text("In Poverty(%)");
  })
  .catch(function(error) {
    console.log(error);
  });
