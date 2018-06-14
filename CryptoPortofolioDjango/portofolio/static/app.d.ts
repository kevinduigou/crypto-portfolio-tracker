/// <reference types="canvasjs" />
interface HistoryChartJsonData {
    x: string;
    y: number;
}
interface PieChartJsonData {
    label: string;
    y: number;
}
declare class HistoryChart extends CanvasJS.Chart {
    addDataPoints(data: HistoryChartJsonData[]): void;
}
