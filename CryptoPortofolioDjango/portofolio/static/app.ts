interface HistoryChartJsonData {
    x: string;
    y: number;}

interface PieChartJsonData {
    chartID : string ; 
    values : PieChartJsonValues[];
    }

interface PieChartJsonValues {
    label: string;
    y: number;
}

  $( function() {
    $( "#portofolioPieChartDatePicker" ).datepicker();
    $( "#portofolioPieChartDatePicker" ).datepicker("setDate", new Date());

    $( "#portofolioPieChartDatePickerCompare" ).datepicker();
    $( "#portofolioPieChartDatePickerCompare" ).datepicker("setDate", new Date());
  } );


  class HistoryChart extends CanvasJS.Chart
  {
      addDataPoints(data : HistoryChartJsonData[])
      {
        this.options.data[0].dataPoints = [];
        for (var i = 0; i < data.length; i++) {

            let d_utc : string = data[i].x;
            let d : Date = new Date(d_utc);
            
            var selectedScope = $("input[type='radio']:checked")[0].id;

 

            this.options.data[0].dataPoints.push({
                y: data[i].y,
                x: d,
                indexLabel: ""
            });

        }
    }
  }
  

window.onload = function() {

    $( "#portofolioPieChartDatePicker" ).on('change',function(event){

        let date = $( "#portofolioPieChartDatePicker").datepicker("getDate")
        $.getJSON("/portofolio/piechart",{timestamp: date,chartID : "piechartContainer"} ,addPieData);
    
      })

      $( "#portofolioPieChartDatePickerCompare" ).on('change',function(event){

        let date = $( "#portofolioPieChartDatePickerCompare").datepicker("getDate")
        $.getJSON("/portofolio/piechart",{timestamp: date,chartID : "piechartContainerCompare"} ,addPieData);
    
      })

    let chart = new HistoryChart("chartContainer", {
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
        chart.addDataPoints(data)
        
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
    
    let scopeLabels = document.getElementById("scopeLabels");
    
    if (scopeLabels != null)
    {
        let optionsLabels = scopeLabels.children;

        for (let i  = 0; i <  optionsLabels.length; i++)
    {
        let radioButton : HTMLLabelElement = <HTMLLabelElement>optionsLabels[i];
        if (radioButton != null)
        {
            radioButton.addEventListener("click",onSelectionChanged);
        }
        
       
    }

    }
    

    
   
    


    function onSelectionChanged(event : any)
    {
        //Get the scope of the history to display
        var selectedScope = event.target.children[0].id;
        if (event.target.id == "evolThroughTimeRefCoin" )
        {
            selectedScope = $("input[type='radio']:checked")[0].id;
        }

        
        
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

    let pieChartCompare = new CanvasJS.Chart("piechartContainerCompare", {
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


    let mapPieCharts : { [id: string]: CanvasJS.Chart; } = { };
    mapPieCharts["piechartContainer"] = pieChart;
    mapPieCharts["piechartContainerCompare"] = pieChartCompare;


    function addPieData(data : PieChartJsonData) {

            let chartID: string = data.chartID;
            if (data.values == null)
            {
                $("#status_"+chartID).text( "Data not avalaible for this date" )
                $("#"+chartID).hide();
            }
            let pieChartToUpdate : CanvasJS.Chart;

            let values : PieChartJsonValues[] = data.values;
            

            pieChartToUpdate = mapPieCharts[chartID] ;
        
        
            pieChartToUpdate.options.data[0].dataPoints = []
            if (values.length == null)
            {
                $("#status_"+chartID).text( "Data not avalaible for this date" )
                $("#"+chartID).hide();
            }
            else
            {
                for (var i = 0; i < values.length; i++) {
                    pieChartToUpdate.options.data[0].dataPoints.push({
                        y: values[i].y,
                        label: values[i].label
                    });
        
                }
                $("#"+chartID).show();
                $("#status_"+chartID).text( "Data avalaible for this date!" )
                pieChartToUpdate.render();
               
        
            }
            
        }
        

    $.getJSON("/portofolio/piechart" ,{chartID : "piechartContainer"},addPieData);
    $.getJSON("/portofolio/piechart" ,{chartID : "piechartContainerCompare"},addPieData);

   

   }
