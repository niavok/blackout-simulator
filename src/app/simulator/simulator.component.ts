import { Component, OnInit } from '@angular/core';
import { CsvReader, CsvFormat, CsvContent } from "./tools/csv-reader"
import { CsvParser } from "./tools/csv-parser"
import { BsGenerationPerProductionType, BsInstalledCapacityPerProductionType, BsTypeUtils } from './tools/bs-types';

@Component({
  selector: 'app-simulator',
  templateUrl: './simulator.component.html',
  styleUrls: ['./simulator.component.css']
})
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

  csvContent: string;


  private interval: any;


  colorScheme = {
    domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5']
  };

  actualProductionCsvReader: CsvReader;
  installedCapacityCsvReader: CsvReader;

  constructor() {
    this.actualProductionCsvReader = new CsvReader((csv : CsvContent) => { this.onActualGenerarationPerProductionCsvLoaded(csv);} )
    this.installedCapacityCsvReader = new CsvReader((csv : CsvContent) => { this.onInstalledCapacityCsvLoaded(csv);} )
  }

  ngOnInit(): void {
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



  onFileSelect(input: HTMLInputElement) {
    if(input.name == "actual_generation")
    {
      this.actualProductionCsvReader.ReadFromFile(input, CsvFormat.ENTSOE);
    }
    else if(input.name == "installed_capacity")
    {
      this.installedCapacityCsvReader.ReadFromFile(input, CsvFormat.ENTSOE);
    }
  }
}
