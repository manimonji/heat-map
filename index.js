let w = 800;
let h = 600;

let padding = [50,50,50,50];

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
    });
