window.onload = function() {


    let chart = new CanvasJS.Chart("chartContainer", {
        animationEnabled: true,
        theme: "light2",
        title:{
            text: ""
        },
        axisY:{
            includeZero: false
        },
        data: [{
            type: "spline",
            dataPoints: []
                }]
            });


    function addChartData(data : any) {
        chart.options.data[0].dataPoints = [];
        for (var i = 0; i < data.length; i++) {
            var d = new Date(data[i].x);

            chart.options.data[0].dataPoints.push({
                y: data[i].y,
                x: d
            });

        }

        chart.render();

    }

    let evolThroughTimeRefCoin  = document.getElementById("evolThroughTimeRefCoin");

    if (evolThroughTimeRefCoin != null)
    {   
        evolThroughTimeRefCoin.addEventListener("change", onSelectionChanged)
    }
    

    function onSelectionChanged(event : any)
    {
        //Get the scope of the history to display
        var selectedScope = $("input[type='radio']:checked")[0].id;
        
        if (evolThroughTimeRefCoin != null)
        {   
        //Get the reference currency for displaying the history chhart
            var selectedOption = evolThroughTimeRefCoin.options[evolThroughTimeRefCoin.selectedIndex].value;
        }


         $.getJSON("/portofolio/historychart",{coinRef: selectedOption,scope : selectedScope}, addChartData);
    }


    let selectedOption = evolThroughTimeRefCoin.options[evolThroughTimeRefCoin.selectedIndex].value;

    $.getJSON("/portofolio/historychart",{coinRef: selectedOption}, addChartData);


    let pieChart = new CanvasJS.Chart("piechartContainer", {
            animationEnabled: true,
            title: {
                text: ""
            },
            data: [{
                type: "pie",
                startAngle: 240,
                yValueFormatString: "##0.00\"%\"",
                indexLabel: "{label} {y}",
                dataPoints: []
            }]
    });

    function addPieData(data : any) {
        for (var i = 0; i < data.length; i++) {
            pieChart.options.data[0].dataPoints.push({
                y: data[i].y,
                label: data[i].label
            });

        }

        pieChart.render();

        }

    $.getJSON("/portofolio/piechart" ,addPieData);

    $(".btn-group-toggle input:radio").on('change', function() {
        //Trigger an update of the history chart
        onSelectionChanged(null)

      })

   }
