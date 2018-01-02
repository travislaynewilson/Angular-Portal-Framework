import { Component, OnInit } from '@angular/core';



@Component({
	selector: 'app-charts',
	templateUrl: './charts.component.html',
	styleUrls: ['./charts.component.scss']
})
export class ChartsComponent implements OnInit {

	// Chart data
	public multiChartData: Array<any> = [
		{ data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' },
		{ data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B' },
		{ data: [18, 48, 77, 9, 100, 27, 40], label: 'Series C' }
	];
	get singleChartData(): Array<any> {
		return [this.multiChartData[0]];
	}
	public lineChartLabels: Array<any> = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
	public lineChartOptions: any = {
		responsive: true
	};
	public lineChartColors: Array<any> = [];


	constructor () { }

	ngOnInit() {
	}



	public randomize(): void {
		let _multiChartData: Array<any> = new Array(this.multiChartData.length);
		for (let i = 0; i < this.multiChartData.length; i++) {
			_multiChartData[i] = { data: new Array(this.multiChartData[i].data.length), label: this.multiChartData[i].label };
			for (let j = 0; j < this.multiChartData[i].data.length; j++) {
				_multiChartData[i].data[j] = Math.floor((Math.random() * 100) + 1);
			}
		}
		this.multiChartData = _multiChartData;
	}

	// Events
	public chartClicked(e: any): void {
		console.log(e);
	}

	public chartHovered(e: any): void {
		console.log(e);
	}

	public chartResized(e: any): void {
		console.log(e);
	}
}
