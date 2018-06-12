window.onload = function () {
    var chart = new CanvasJS.Chart("chartContainer", {
        animationEnabled: true,
        theme: "light2",
        title: {
            text: ""
        },
        axisY: {
            includeZero: false
        },
        data: [{
                type: "spline",
                dataPoints: []
            }]
    });
    //Feed the Chart    
    var evolThroughTimeRefCoin = document.getElementById("evolThroughTimeRefCoin");
    var selectedOption = evolThroughTimeRefCoin.options[evolThroughTimeRefCoin.selectedIndex].value;
    var selectedScope = $("input[type='radio']:checked")[0].id;
    $.getJSON("/portofolio/historychart", { coinRef: selectedOption, scope: selectedScope }, addChartData);
    function addChartData(data) {
        chart.options.data[0].dataPoints = []; //Reset All previous data in the Chart
        for (var i = 0; i < data.length; i++) {
            var d_utc = data[i].x;
            var d = new Date(d_utc);
            chart.options.data[0].dataPoints.push({
                y: data[i].y,
                x: d
            });
        }
        var loaderElem = $("#loader");
        if (loaderElem != null) {
            loaderElem.hide();
        }
        chart.render();
    }
    //When the history chart options changes (Ref Coin or Scope then "onSelectionChanged" is triggered)
    if (evolThroughTimeRefCoin != null) {
        evolThroughTimeRefCoin.addEventListener("change", onSelectionChanged);
    }
    var radioButtonInput = $(".btn-group-toggle input:radio");
    radioButtonInput.on('change', function () {
        //Trigger an update of the history chart
        onSelectionChanged();
    });
    function onSelectionChanged() {
        //Get the scope of the history to display
        var selectedScope = $("input[type='radio']:checked")[0].id;
        selectedOption = "option0"; //default Option Selected
        if (evolThroughTimeRefCoin != null) {
            //Get the reference currency for displaying the history chhart
            selectedOption = evolThroughTimeRefCoin.options[evolThroughTimeRefCoin.selectedIndex].value;
        }
        var loaderElem = $("#loader");
        if (loaderElem != null) {
            loaderElem.show();
        }
        $.getJSON("/portofolio/historychart", { coinRef: selectedOption, scope: selectedScope }, addChartData);
    }
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
                dataPoints: []
            }]
    });
    function addPieData(data) {
        for (var i = 0; i < data.length; i++) {
            pieChart.options.data[0].dataPoints.push({
                y: data[i].y,
                label: data[i].label
            });
        }
        pieChart.render();
    }
    $.getJSON("/portofolio/piechart", addPieData);
};
