import { GenerationPerProduction, BsProductionType } from "./bs-types"
import { CsvContent } from "./csv-reader"


export class CsvParser {


    ParseGenerationPerProduction(csv: CsvContent) : GenerationPerProduction {

        console.log("ParseGenerationPerProduction");
        console.log("header: "+csv.header);
        console.log("data: "+csv.data);

        var data = csv.data;
        var production = new GenerationPerProduction(data.length);


        var productionTypes : BsProductionType[];
        //this.productionByType = new Array<Array<number>>(BsProductionType._Lenght);

        for(var dataIndex = 0; dataIndex < data.length ; dataIndex++)
        {
            var dataEntry = data[dataIndex];

            for(var columnIndex = 0; columnIndex < dataEntry.length ; columnIndex++)
            {
                var productionValue = 0;
                // TODO
                //ParseProductionValue(dataEntry[columnIndex])
                //if()

                production.GetUsedProductionTypes();

                production.plop();
                production.SetProduction(dataIndex, productionTypes[columnIndex], productionValue);
            }
        }



        return production;
    }
}
