import { Component, OnInit } from '@angular/core';
import { CsvReader, CsvFormat } from "./tools/csv-reader"

@Component({
  selector: 'app-simulator',
  templateUrl: './simulator.component.html',
  styleUrls: ['./simulator.component.css']
})
export class SimulatorComponent implements OnInit {

  multi: any[];
  plop: number ;
  //view: any[] = [1400, 1000];
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

  constructor() {
    console.log("constructor");
    //Object.assign(this, { multi });
    this.multi = [
      {name: 'Fossil gas', series: []},
      {name: 'Nuclear', series: []},
      {name: 'Solar', series: []},
      {name: 'Wind offshore', series: []},
      {name: 'Wind onshore', series: []}
    ];
    console.log("constructor this.multi: "+ this.multi);
    this.plop = 12;
    this.actualProductionCsvReader = new CsvReader(this.onActualProductionCsvLoaded);

  }

  ngOnInit(): void {
    /*this.interval = setInterval(() => {
      this.multi[0].series.push({name: Date.now(), value: Math.random()});
      this.multi = [...this.multi];
  }, 500);*/
  console.log("ngOnInit this.multi[0]: "+ this.multi[0]);
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


  onActualProductionCsvLoaded(csv : {}) : void
  {
    console.log("onActualProductionCsvLoaded");
    console.log("header: "+csv["header"]);
    console.log("data: "+csv["data"]);

  }

  parsedCsv: string[][];

  onFileLoad(fileLoadedEvent) : void {
    console.log("onFileLoad this.multi: "+ this.multi + " "+ this.plop);

    const csvSeparator = '","';
    const textFromFileLoaded = fileLoadedEvent.target.result;
    this.csvContent = textFromFileLoaded;

    const txt = textFromFileLoaded;
    const csv = [];
    const lines = txt.split('\n');
    lines.forEach(element => {
      const cols: string[] = element.split(csvSeparator);
      csv.push(cols);
    });
    this.parsedCsv = csv;
    console.log(this.parsedCsv[0]);
    console.log("Line count: " + this.parsedCsv.length);

    // TODO custom parseur


    var gasPower = 0;
    var nuclearPower = 0;
    var solarPower = 0;
    var windOffshorePower = 0;
    var windOnshorePower = 0;

    var lineIndex = 0;
    for (let line of this.parsedCsv) {


      if(lineIndex > 0)
      {
        if(line.length < 23)
        {
          continue;
        }

        function parsePower(powerStr, defaultValue)
        {
          if(powerStr == "n/e")
          {
            return 0;
          }

          if(powerStr == "N/A")
          {
            return defaultValue;
          }

          var value : number = parseInt(powerStr);
          if(isNaN(value))
          {
            console.error("Invalide power value: "+ powerStr);
            return defaultValue;
          }

          return value;
        }

        //var date = line[1];
        var date = lineIndex;
        gasPower = parsePower(line[5], gasPower);
        nuclearPower = parsePower(line[16], nuclearPower);
        solarPower = parsePower(line[19], solarPower);
        windOffshorePower = parsePower(line[21], windOffshorePower);
        windOnshorePower = parsePower(line[22], windOffshorePower);
        console.log("Line ("+line.length+"): " + date + " " + gasPower + " " + nuclearPower + " " + solarPower + " " + windOffshorePower + " " + windOnshorePower);


        this.multi[0].series.push({name: date, value: gasPower});
        this.multi[1].series.push({name: date, value: nuclearPower});
        this.multi[2].series.push({name: date, value: solarPower});
        this.multi[3].series.push({name: date, value: windOffshorePower});
        this.multi[4].series.push({name: date, value: windOnshorePower});
      }

      lineIndex++;
    }

    console.log("this.multi: "+ this.multi);
    this.multi = [...this.multi];

    /*this.interval = setInterval(() => {
      this.multi[0].series.push({name: Date.now(), value: Math.random()});
      this.multi = [...this.multi];
  }, 500);*/

}



  onFileSelect(input: HTMLInputElement) {
    console.log("onFileSelect this.multi: "+ this.multi + " "+ this.plop);
    this.actualProductionCsvReader.ReadFromFile(input, CsvFormat.ENTSOE);


    console.log("onFileSelect end this.multi: "+ this.multi + " "+ this.plop);

  }
}
