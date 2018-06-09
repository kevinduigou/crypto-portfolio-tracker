window.onload = function() {

    var dataPointsChart = [];

    function addChartData(data) {
             dataPointsChart = []
        chart = new CanvasJS.Chart("chartContainer", {
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
            dataPoints: dataPointsChart
                }]
            });
            for (var i = 0; i < data.length; i++) {
                var d = new Date(data[i].x);

                dataPointsChart.push({
                    y: data[i].y,
                    x: d
                });

            }

            chart.render();

            }

    var evolThroughTimeRefCoin = document.getElementById("evolThroughTimeRefCoin");
    evolThroughTimeRefCoin.addEventListener("change", onSelectionChanged)

    function onSelectionChanged(event)
    {
        //Get the scope of the history to display
        var selectedScope = $("input[type='radio']:checked")[0].id;
        
        //Get the reference currency for displaying the history chhart
        var evolThroughTimeRefCoin = document.getElementById("evolThroughTimeRefCoin");
        var selectedOption = evolThroughTimeRefCoin.options[evolThroughTimeRefCoin.selectedIndex].value;


         $.getJSON("/portofolio/historychart",{coinRef: selectedOption,scope : selectedScope}, addChartData);
    }






        var evolThroughTimeRefCoin = document.getElementById("evolThroughTimeRefCoin");
        var selectedOption = evolThroughTimeRefCoin.options[evolThroughTimeRefCoin.selectedIndex].value;

        $.getJSON("/portofolio/historychart",{coinRef: selectedOption}, addChartData);


        var dataPointsPieChart = [];
        var pieChart = new CanvasJS.Chart("piechartContainer", {
                animationEnabled: true,
                title: {
                    text: ""
                },
                data: [{
                    type: "pie",
                    startAngle: 240,
                    yValueFormatString: "##0.00\"%\"",
                    indexLabel: "{label} {y}",
                    dataPoints: dataPointsPieChart
                }]
        });

        function addPieData(data) {
            for (var i = 0; i < data.length; i++) {
                dataPointsPieChart.push({
                    y: data[i].y,
                    label: data[i].label
                });

            }

            pieChart.render();

            }

        $.getJSON("/portofolio/piechart" ,addPieData);

    $(".btn-group-toggle input:radio").on('change', function() {
        //Trigger an update of the history chart
        onSelectionChanged()

      })

   }
