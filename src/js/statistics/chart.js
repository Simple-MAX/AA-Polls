/****************************************************
*                                                   *
*                AA-Polls - chart.js                *
*                                                   *
*        Date of development : December 2017        *
*                                                   *
*       Copyrights @ https://github.com/BluDay      *
*                                                   *
*                      (o.0)                        *
*                                                   *
* /**************************************************
*/

// Renders a chart using the Chart.js library with given stats
function renderChart(canvasId, data) {
    // Gets the chart canvas element
    let canvas = getElement(canvasId);

    // Gets the context of the canvas element
    let context = canvas.getContext("2d");

    // Creates options and inserts chart data
    const options = {
        type: chartType,
        data: {
            labels: data.labels,
            datasets: [{
                label: "",
                data: [],
                backgroundColor: "transparent",
                borderColor: "#00a1ff",
                borderWidth: 4,
                pointRadius: 6,
                pointBackgroundColor: "#fff",
            }, {
                label: "",
                data: [],
                backgroundColor: "transparent",
                borderColor: "#0ace00",
                borderWidth: 4,
                pointRadius: 6,
                pointBackgroundColor: "#fff",
            }, {
                label: "",
                data: [],
                backgroundColor: "transparent",
                borderColor: "#ffe100",
                borderWidth: 4,
                pointRadius: 6,
                pointBackgroundColor: "#fff",
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true
                    }
                }]
            }
        }
    };

    // Renders the actual chart with options
    let myChart = new Chart(context, options);
}