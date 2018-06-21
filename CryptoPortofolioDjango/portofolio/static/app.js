var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
$(function () {
    $("#portofolioPieChartDatePicker").datepicker();
    $("#portofolioPieChartDatePicker").datepicker("setDate", new Date());
    $("#portofolioPieChartDatePickerCompare").datepicker();
    $("#portofolioPieChartDatePickerCompare").datepicker("setDate", new Date());
});
var HistoryChart = /** @class */ (function (_super) {
    __extends(HistoryChart, _super);
    function HistoryChart() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HistoryChart.prototype.addDataPoints = function (data) {
        this.options.data[0].dataPoints = [];
        for (var i = 0; i < data.length; i++) {
            var d_utc = data[i].x;
            var d = new Date(d_utc);
            var selectedScope = $("input[type='radio']:checked")[0].id;
            this.options.data[0].dataPoints.push({
                y: data[i].y,
                x: d,
                indexLabel: ""
            });
        }
    };
    return HistoryChart;
}(CanvasJS.Chart));
window.onload = function () {
    $("#portofolioPieChartDatePicker").on('change', function (event) {
        var date = $("#portofolioPieChartDatePicker").datepicker("getDate");
        $.getJSON("/portofolio/piechart", { timestamp: date, chartID: "piechartContainer" }, addPieData);
    });
    $("#portofolioPieChartDatePickerCompare").on('change', function (event) {
        var date = $("#portofolioPieChartDatePickerCompare").datepicker("getDate");
        $.getJSON("/portofolio/piechart", { timestamp: date, chartID: "piechartContainerCompare" }, addPieData);
    });
    var chart = new HistoryChart("chartContainer", {
        animationEnabled: true,
        theme: "light2",
        title: {
            text: ""
        },
        axisX: {
            crosshair: {
                enabled: true,
                snapToDataPoint: true
            }
        },
        axisY: {
            includeZero: false,
            crosshair: {
                enabled: true,
                snapToDataPoint: true
            }
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
        chart.addDataPoints(data);
        var loaderElem = $("#loader");
        var historyChartElem = $("#chartContainer");
        if (loaderElem != null && historyChartElem != null) {
            loaderElem.hide();
            historyChartElem.show();
        }
        chart.render();
    }
    //When the history chart options changes (Ref Coin or Scope then "onSelectionChanged" is triggered)
    if (evolThroughTimeRefCoin != null) {
        evolThroughTimeRefCoin.addEventListener("change", onSelectionChanged);
    }
    var scopeLabels = document.getElementById("scopeLabels");
    if (scopeLabels != null) {
        var optionsLabels = scopeLabels.children;
        for (var i = 0; i < optionsLabels.length; i++) {
            var radioButton = optionsLabels[i];
            if (radioButton != null) {
                radioButton.addEventListener("click", onSelectionChanged);
            }
        }
    }
    function onSelectionChanged(event) {
        //Get the scope of the history to display
        var selectedScope = event.target.children[0].id;
        if (event.target.id == "evolThroughTimeRefCoin") {
            selectedScope = $("input[type='radio']:checked")[0].id;
        }
        var selectedRefCoin = "dollar"; //default Option Selected
        if (evolThroughTimeRefCoin != null) {
            //Get the reference currency for displaying the history chhart
            selectedRefCoin = evolThroughTimeRefCoin.options[evolThroughTimeRefCoin.selectedIndex].value;
        }
        var loaderElem = $("#loader");
        var historyChartElem = $("#chartContainer");
        if (loaderElem != null) {
            historyChartElem.hide();
            loaderElem.show();
        }
        $.getJSON("/portofolio/historychart", { coinRef: selectedRefCoin, scope: selectedScope }, addChartData);
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
    var pieChartCompare = new CanvasJS.Chart("piechartContainerCompare", {
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
    pieChartCompare.render();
    var mapPieCharts = {};
    mapPieCharts["piechartContainer"] = pieChart;
    mapPieCharts["piechartContainerCompare"] = pieChartCompare;
    function addPieData(data) {
        var chartID = data.chartID;
        if (data.values == null) {
            $("#status_" + chartID).text("Data not avalaible for this date");
            $("#" + chartID).hide();
        }
        var pieChartToUpdate;
        var values = data.values;
        pieChartToUpdate = mapPieCharts[chartID];
        pieChartToUpdate.options.data[0].dataPoints = [];
        if (values.length == null) {
            $("#status_" + chartID).text("Data not avalaible for this date");
            $("#" + chartID).hide();
        }
        else {
            for (var i = 0; i < values.length; i++) {
                pieChartToUpdate.options.data[0].dataPoints.push({
                    y: values[i].y,
                    label: values[i].label
                });
            }
            $("#" + chartID).show();
            $("#status_" + chartID).text("Data avalaible for this date!");
            pieChartToUpdate.render();
        }
    }
    $.getJSON("/portofolio/piechart", { chartID: "piechartContainer" }, addPieData);
    $.getJSON("/portofolio/piechart", { chartID: "piechartContainerCompare" }, addPieData);
};
