import { Component, OnInit } from '@angular/core';
import { CsvReader, CsvFormat, CsvContent } from "./tools/csv-reader"
import { CsvParser } from "./tools/csv-parser"
import { BsGenerationPerProductionType, BsInstalledCapacityPerProductionType, BsTypeUtils, BsLoad } from './tools/bs-types';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-simulator',
  templateUrl: './simulator.component.html',
  styleUrls: ['./simulator.component.css']
})

@Injectable()
export class SimulatorComponent implements OnInit {

  multi: any[];
  view: any[];
  
  // options
  legend: boolean = true;
  showLabels: boolean = true;
  animations: boolean = true;
  xAxis: boolean = true;
  yAxis: boolean = true;
  showYAxisLabel: boolean = true;
  showXAxisLabel: boolean = true;
  xAxisLabel: string = 'Date';
  yAxisLabel: string = 'Production (MW)';
  timeline: boolean = true;


  load_chart_data: any[];
  load_chart_view: any[];
  load_chart_xAxis: boolean = true;
  load_chart_yAxis: boolean = true;
  load_chart_showYAxisLabel: boolean = true;
  load_chart_showXAxisLabel: boolean = true;
  load_chart_xAxisLabel: string = 'Date';
  load_chart_yAxisLabel: string = 'Load (MW)';

  csvContent: string;


  private interval: any;


  colorScheme = {
    domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5']
  };

  actualProductionCsvReader: CsvReader;
  installedCapacityCsvReader: CsvReader;
  totalLoadCsvReader: CsvReader;

  constructor(private http: HttpClient) {
    this.actualProductionCsvReader = new CsvReader((csv : CsvContent) => { this.onActualGenerarationPerProductionCsvLoaded(csv);} )
    this.installedCapacityCsvReader = new CsvReader((csv : CsvContent) => { this.onInstalledCapacityCsvLoaded(csv);} )
    this.totalLoadCsvReader = new CsvReader((csv : CsvContent) => { this.onTotalLoadCsvLoaded(csv);} )
  }

  ngOnInit(): void {
    this.http.get('assets/database.json', {responseType: 'text'})
        .subscribe(data => console.log(data));
      this.http.get('assets/database/entsoe_germany_2019/installed_capacity.csv', {responseType: 'text'})
        .subscribe(data => console.log(data));
  }

  onSelect(data): void {
    console.log('Item clicked', JSON.parse(JSON.stringify(data)));
  }

  onActivate(data): void {
    console.log('Activate', JSON.parse(JSON.stringify(data)));
  }

  onDeactivate(data): void {
    console.log('Deactivate', JSON.parse(JSON.stringify(data)));
  }


  onActualGenerarationPerProductionCsvLoaded(csv : CsvContent) : void
  {
    let parser = new CsvParser();
    let generation : BsGenerationPerProductionType = parser.ParseGenerationPerProductionType(csv);
    this.multi = [];

    console.log("Actual generation duration: "+generation.duration);


    for(const generationType of generation.usedProductionTypes) {

      const production = generation.productionByType[generationType];
      let productionFormated = [];
      for(let i = 0; i< production.length; i++ )
      {
        productionFormated.push({name: i, value: production[i]});
      }

      this.multi.push({name: BsTypeUtils.GetProductionTypeLabel(generationType), series: productionFormated});
    }

    this.multi = [...this.multi];
  }

  onInstalledCapacityCsvLoaded(csv : CsvContent) : void
  {
    let parser = new CsvParser();
    let installedCapacity : BsInstalledCapacityPerProductionType = parser.ParseInstalledCapacityPerProductionType(csv);

    console.log(installedCapacity);
  }
  
  onTotalLoadCsvLoaded(csv : CsvContent) : void
  {
    let parser = new CsvParser();
    let load : BsLoad = parser.ParseLoad(csv);

    this.load_chart_data = [];

    console.log("Load duration: "+load.load.length+ " samples ("+load.predictedValueCount+" using prediction,"+load.repairCount+" repaired)");
    let loadFromated = [];
    for(let i = 0; i< load.load.length; i++ )
    {
      loadFromated.push({name: i, value: load.load[i]});
    }

    this.load_chart_data.push({name: "Load", series: loadFromated});

    this.load_chart_data = [...this.load_chart_data];
  }



  onFileSelect(input: HTMLInputElement) {
    if(input.name == "actual_generation")
    {
      this.actualProductionCsvReader.ReadFromFile(input, CsvFormat.ENTSOE);
    }
    else if(input.name == "installed_capacity")
    {
      this.installedCapacityCsvReader.ReadFromFile(input, CsvFormat.ENTSOE);
    }
    else if(input.name == "total_load")
    {
      this.totalLoadCsvReader.ReadFromFile(input, CsvFormat.ENTSOE);
    }
  }
}
