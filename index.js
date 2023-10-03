let w = 950;
let h = 350;

let padding = [0,50,50,60];

let tooltip = d3.select("body")
                .append("div")
                .attr("id", "tooltip");

let svg = d3.select("body")
            .append("svg")
            .attr("width", w + padding[1] + padding[3])
            .attr("height", h + padding[0] + padding[2]);


fetch("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json")
    .then(response => response.json())
    .then(data => {
        let minYear = d3.min(data.monthlyVariance, d => d.year);
        let maxYear = d3.max(data.monthlyVariance, d => d.year);

        d3.select("p")
          .text(`${minYear}-${maxYear}: base-temperature ${data.baseTemperature}°C`)
          .attr("id","description");

        let monthScale = d3.scaleBand([0,1,2,3,4,5,6,7,8,9,10,11],[0, h]);
        let dateScale = d3.scaleBand(data.monthlyVariance.map(d => d.year),[0,w]); 

        let monthAxis = d3.axisLeft(monthScale)
                      .tickFormat((d) => (new Date(1,d)).toLocaleString('en-US', { month: 'long' }));
        let dateAxis = d3.axisBottom(dateScale)
					 .tickValues(dateScale.domain().filter(year => year % 20 === 0));
        
        svg.append("g")
		   .attr("id", "y-axis")
		   .attr("transform",`translate(${padding[3]},${padding[0]})`)
           .call(monthAxis);
        
        svg.append("g")
		   .attr("id", "x-axis")
           .attr("transform",`translate(${padding[3]},${padding[0] + h})`)
           .call(dateAxis);

        //    ["#4575b4","#74add1","#abd9e9","#e0f3f8","#ffffbf","#fdae61","#f46d43","#d73027"]
        let colorScale = d3.scaleThreshold([2.8, 3.9, 5.0, 6.1, 7.2, 8.3, 9.5, 10.6, 11.7, 12.8], ["#4575b4","#74add1","#abd9e9","#e0f3f8","#ffffbf","#fdae61","#f46d43","#d73027"]);

        // console.log(new Date(1000 * 60 * 60 * 24 * 365) - new Date());
		let legendWidth = 400;
		let legendHeight = 40;

        svg.attr("height", Number(svg.attr("height")) + legendHeight * 2);


        let legendColors = ["#313695","#4575b4","#74add1","#abd9e9","#e0f3f8","#ffffbf","#fee090","#fdae61","#f46d43","#d73027","#a50026"];
        
        var minTemp = data.baseTemperature + d3.min(data.monthlyVariance, d => d.variance);
        var maxTemp = data.baseTemperature + d3.max(data.monthlyVariance, d => d.variance);
        var legendThreshold = d3.scaleThreshold().domain(
        (
            (min, max, count) => {
                var array = [];
                var step = (max - min) / count;
                var base = min;
                for (var i = 1; i < count; i++) {
                    array.push(base + i * step);
                }
                return array;
            }
        ) (minTemp, maxTemp, legendColors.length)
        ).range(legendColors);
        let legendTemperatureScale = d3.scaleLinear([minTemp, maxTemp],[0,legendWidth]);
		let legendTemperatureAxis = d3.axisBottom(legendTemperatureScale)
                                      .tickValues(legendThreshold.domain())
                                      .tickFormat(d3.format('.1f'))
                                      .tickSize(15, 0);
		let legend = svg.append("g")
                        .attr("id","legend")
                        // .attr("width", legendWidth)
                        .attr("transform", `translate(${padding[3]},${h + padding[0] + padding[2]})`);
        legend.append("g")
              .call(legendTemperatureAxis)
              .attr("transform",`translate(0,${legendHeight})`);

        // legend.append("g")
        //       .selectAll("rect")
        //       .data(legendColors)
        //       .enter()
        //       .append("rect")
        //       .attr("width", legendTemperatureScale((maxTemp - minTemp) / legendColors.length))
        //       .attr("height", 40)
        //       .attr("x",0)
        //       .attr("y",0)
        //       .attr("fill", d => d);
        legend.append('g')
              .selectAll('rect')
              .data(
                  legendThreshold.range()
                                 .map((color) => {
                                     var d = legendThreshold.invertExtent(color);
                                     if (d[0] === null) {
                                         d[0] = legendTemperatureScale.domain() [0];
                                     }
                                     if (d[1] === null) {
                                         d[1] = legendTemperatureScale.domain() [1];
                                     }
                                     return d;
                                 })
              )
              .enter()
              .append('rect')
              .attr('fill', d => legendThreshold(d[0]))
              .attr('x', d => legendTemperatureScale(d[0]))
              .attr('y', 0)
              .attr('width',d => d[0] && d[1] ? legendTemperatureScale(d[1]) - legendTemperatureScale(d[0]) : legendTemperatureScale(null))
              .attr('height', legendHeight);

        svg.append("g")
           .attr("id", "map")
           .style("pointer-events", "all")
           .on("mouseenter",() => tooltip.style("display", null))
           .on("mouseleave",() => tooltip.style("display","none"))
           .selectAll("rect")
           .data(data.monthlyVariance)
           .enter()
           .append("rect")
           .classed("cell", true)
           //    .attr("width", dateScale(new Date((1000 * 60 * 60 * 24 * 365 * (Number(minYear) + 2) + 1000 * 60 * 60 * 24) + new Date(0, 0, 1).setFullYear(0))))
           .attr("width", d => dateScale.bandwidth(d.year))
           .attr("height", d => monthScale.bandwidth(d.month))
           //    .attr("x", d => dateScale(new Date(d.year, 0)) + padding[3])
           .attr("x", d => dateScale(d.year) + padding[3])	
           .attr("y", d => monthScale(d.month -  1))
           .attr("fill", d => legendThreshold(d.variance +  data.baseTemperature))
           .attr("data-month", d => d.month -  1)
           .attr("data-year", d => d.year)
           .attr("data-temp", d => d.variance)
           .on("mouseover", (e,d) => {
               tooltip.html(`${d.year} - ${new Date(0,d.month - 1).toLocaleString('en-US', { month: 'long' })} <br> ${(d.variance + data.baseTemperature).toFixed(2)}°C <br> ${d3.format("+.2f")(d.variance)}°C`)
                      .style("left", e.pageX+"px")
                      .style("top", e.pageY+"px")
                      .attr("data-year",d.year);
                      
           });
    });
