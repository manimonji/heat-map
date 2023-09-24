let w = 800;
let h = 400;

let padding = [0,50,50,60];

let svg = d3.select("body")
            .append("svg")
            .attr("width", w + padding[1] + padding[3])
            .attr("height", h + padding[0] + padding[2]);


fetch("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json")
    .then(response => response.json())
    .then(data => {
        let minYear = d3.min(data.monthlyVariance, d => d.year);
        let maxYear = d3.max(data.monthlyVariance, d => d.year);

        d3.select("body")
          .append("p")
          .text(`${minYear}-${maxYear}: base-temperature ${data.baseTemperature}°C`)
          .attr("id","description");

        monthScale = d3.scaleBand([0,1,2,3,4,5,6,7,8,9,10,11],[0, h]);
        dateScale = d3.scaleTime([d3.min(data.monthlyVariance, d => new Date(d.year,0)),d3.max(data.monthlyVariance, d => new Date(d.year,0))],[0,w]); 

        console.log(d3.max(data.monthlyVariance, d => new Date(d.year,0)));

        monthAxis = d3.axisLeft(monthScale)
                      .tickFormat((d) => (new Date(1,d)).toLocaleString('en-US', { month: 'long' }));
        dateAxis = d3.axisBottom(dateScale);
        
        svg.append("g")
           .attr("transform",`translate(${padding[3]},${padding[0]})`)
           .call(monthAxis);
        
        svg.append("g")
           .attr("transform",`translate(${padding[3]},${padding[0] + h})`)
           .call(dateAxis);
        
        svg.selectAll("rect")
           .data(data.monthlyVariance)
           .enter()
           .append("rect")
           .classed("cell", true);
    });
