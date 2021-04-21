var svgWidth = 600;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 20,
    bottom: 100,
    left: 80
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append an SVG group and shift it by the left and top margins.
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "age";
var chosenYAxis = "healthcare";

// Function used for updating x-scale var upon click on axis label
function xScale(censusData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
    .domain([
        d3.min(censusData, d => d[chosenXAxis]) * 0.8,
        d3.max(censusData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

    return xLinearScale;
}

// Function used for updating y-scale var upon click on axis label
function yScale(censusData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
    .domain([
        d3.min(censusData, d => d[chosenYAxis]) * 0.8,
        d3.max(censusData, d => d[chosenYAxis]) * 1.2
    ])
    .range([height, 0]);

    return yLinearScale;
}

// Function used for updating xAxis var upon click on axis label
function renderXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

// Function used for updating yAxis var upon click on axis label
function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return xAxis;
}

// Function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

// Function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    var xLabel;
    var yLabel;

    // Conditions to customize info in tooltips depending on chosenXAxis
    if (chosenXAxis === "age") {
        xLabel = "Median Age:";
    }
    else if (chosenXAxis === "poverty") {
        xLabel = "In Poverty:";
    }
    else if (chosenXAxis === "income") {
        xLabel = "Median Household Income:";
    };

    // Conditions to customize info in tooltips depending on chosenYAxis
    if (chosenYAxis === "healthcare") {
        yLabel = "Lacks Healthcare:";
    }
    else if (chosenYAxis === "smokes") {
        yLabel = "Smokes:";
    }
    else if (chosenYAxis === "obesity") {
        yLabel = "Obese:";
    };

    // Only when the chosenXAxis is "poverty" rate do we need a "%" for the xLabel
    if (chosenXAxis === "poverty") {
        var toolTip = d3.tip()
            .attr("class", "d3-tip")
            .offset([50, 50])
            .html(function(d) {
                return (
                    `${d.state}<br>
                    ${xLabel} ${d[chosenXAxis]}%<br>
                    ${yLabel} ${d[chosenYAxis]}%`);
            })
    }
    else {
        var toolTip = d3.tip()
            .attr("class", "d3-tip")
            .offset([50, 50])
            .html(function(d) {
                return (
                    `${d.state}<br>
                    ${xLabel} ${d[chosenXAxis]}<br>
                    ${yLabel} ${d[chosenYAxis]}%`);
            })
    };

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("./assets/data/data.csv").then(function(censusData, err) {
    if (err) throw err;

    // Parse data and turn strings into numbers
    censusData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
        data.healthcare = +data.healthcare;
    });

    // Create x scale function using the created xScale() function
    var xLinearScale = xScale(censusData, chosenXAxis);

    // Create y scale function using the created yScale() function
    var yLinearScale = yScale(censusData, chosenXAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // Append y axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    // Append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(censusData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 8)
        .attr("fill", "LightSlateGray")
        .attr("opacity", ".7");

    // Create group for x-axis labels
    var labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    // Append x labels
    var ageLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "age")
        .attr("dy", "0.75em")
        .classed("x-label active", true)
        .text("Age (Median)");
    
    var povertyLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "poverty")
        .attr("dy", "0.75em")
        .classed("x-label inactive", true)
        .text("In Poverty (%)");

    var incomeLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income")
        .attr("dy", "0.75em")
        .classed("x-label inactive", true)
        .text("Household Income (Median)");

    // Append y labels
    var labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(0, ${height / 2})`);

    var healthcareLabel = labelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -20)
        .attr("y", 0)
        .attr("value", "healthcare")
        .attr("dy", "0.75em")
        .classed("y-label active", true)
        .text("Lacks Healthcare (%)")

    var smokesLabel = labelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -40)
        .attr("y", 0)
        .attr("value", "smokes")
        .attr("dy", "0.75em")
        .classed("y-label inactive", true)
        .text("Smokes (%)")

    var obeseLabel = labelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -60)
        .attr("y", 0)
        .attr("value", "obesity")
        .attr("dy", "0.75em")
        .classed("y-label inactive", true)
        .text("Obese (%)")

    // Update tooltips with info from the new axes on the new circlesGroup using the created updateToolTip() function
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // X-axis labels event listener
    labelsGroup.selectAll("text").on("click", function() {
        // Get value of the selected x or y label
        var xValue;
        var yValue;
        var value = d3.select(this).attr("value");
            if (value === "age" || value === "poverty" || value === "income") {
                xValue = value;
                yValue = chosenYAxis;
            }
            else {
                yValue = value;
                xValue = chosenXAxis;
            }

        // Re-render all the plot components based on new selections
        if (xValue !== chosenXAxis || yValue !== chosenYAxis) {

            // Replace chosenXAxis and/or chosenYAxis with xValue/yValue
            chosenXAxis = xValue;
            chosenYAxis = yValue;

            console.log(chosenXAxis);
            console.log(chosenYAxis);

            // Update x scale for new data using the created xScale() function
            xLinearScale = xScale(censusData, chosenXAxis);
            // Update y scale for new data using the created yScale() function
            yLinearScale = yScale(censusData, chosenYAxis);

            // Update x axis with transition using the created renderXAxis() function
            xAxis = renderXAxis(xLinearScale, xAxis);
            // Update y axis with transition using the created renderYAxis() function
            yAxis = renderYAxis(yLinearScale, yAxis);

            // Update circles with new x and y values using the created renderCircles() function
            circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

            // Update tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            // Change classes to change bold text for x labels
            if (chosenXAxis === "poverty") {
                povertyLabel
                    .classed("active", true)
                    .classed("inactive", false);
                incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else if (chosenXAxis === "income") {
                incomeLabel
                    .classed("active", true)
                    .classed("inactive", false);
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else if (chosenXAxis === "age") {
                ageLabel
                    .classed("active", true)
                    .classed("inactive", false);
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }

            // Change classes to change bold text for y labels
            if (chosenYAxis === "smokes") {
                smokesLabel
                    .classed("active", true)
                    .classed("inactive", false);
                obeseLabel
                    .classed("active", false)
                    .classed("inactive", true);
                healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else if (chosenYAxis === "obesity") {
                obeseLabel
                    .classed("active", true)
                    .classed("inactive", false);
                healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
                smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else if (chosenYAxis === "healthcare") {
                healthcareLabel
                    .classed("active", true)
                    .classed("inactive", false);
                smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
                obeseLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
        }
    });
}).catch(function(error) {
  console.log(error);
});

