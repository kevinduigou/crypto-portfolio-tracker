interface HistoryChartJsonData {
    x: string;
    y: number;}

interface PieChartJsonData {
    label: string;
    y: number;}

window.onload = function() {


    let chart = new CanvasJS.Chart("chartContainer", {
        animationEnabled: true,
        theme: "light2",
        title:{
            text: ""
        },
        axisX:{
            crosshair: {
			enabled: true,
			snapToDataPoint: true
        }
        },
        axisY:{
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
    let evolThroughTimeRefCoin : HTMLSelectElement  = <HTMLSelectElement>document.getElementById("evolThroughTimeRefCoin");

    let selectedOption: string = evolThroughTimeRefCoin.options[evolThroughTimeRefCoin.selectedIndex].value;
    var selectedScope = $("input[type='radio']:checked")[0].id;

    $.getJSON("/portofolio/historychart",{coinRef: selectedOption,scope : selectedScope}, addChartData);


    function addChartData(data : HistoryChartJsonData[]) {
        chart.options.data[0].dataPoints = []; //Reset All previous data in the Chart
        for (var i = 0; i < data.length; i++) {

            let d_utc : string = data[i].x;
            let d : Date = new Date(d_utc);
            
            var selectedScope = $("input[type='radio']:checked")[0].id;

 

            chart.options.data[0].dataPoints.push({
                y: data[i].y,
                x: d,
                indexLabel: ""
            });

        }
        
        var loaderElem = $("#loader");
        var historyChartElem = $("#chartContainer")
        if (loaderElem != null && historyChartElem != null) 
        {
            loaderElem.hide();
            historyChartElem.show();
        }

        chart.render();

    }

    
    //When the history chart options changes (Ref Coin or Scope then "onSelectionChanged" is triggered)
    if (evolThroughTimeRefCoin != null)
    {   
        evolThroughTimeRefCoin.addEventListener("change", onSelectionChanged)
    }
    
    
    let radioButtonInput = $(".btn-group-toggle input:radio");
    radioButtonInput.on('change', function() {
        //Trigger an update of the history chart
        onSelectionChanged()

      })


    function onSelectionChanged()
    {
        //Get the scope of the history to display
        var selectedScope = $("input[type='radio']:checked")[0].id;
        let selectedRefCoin : string = "dollar"; //default Option Selected
        if (evolThroughTimeRefCoin != null)
        {   
            //Get the reference currency for displaying the history chhart
            selectedRefCoin = evolThroughTimeRefCoin.options[evolThroughTimeRefCoin.selectedIndex].value;
        }

        var loaderElem = $("#loader");
        var historyChartElem = $("#chartContainer")
        if (loaderElem != null)
        {
            historyChartElem.hide();
            loaderElem.show();
           
        }
        

         $.getJSON("/portofolio/historychart",{coinRef: selectedRefCoin,scope : selectedScope}, addChartData);
    }


    


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

    function addPieData(data : PieChartJsonData[]) {
        for (var i = 0; i < data.length; i++) {
            pieChart.options.data[0].dataPoints.push({
                y: data[i].y,
                label: data[i].label
            });

        }

        pieChart.render();

        }

    $.getJSON("/portofolio/piechart" ,addPieData);

   

   }
