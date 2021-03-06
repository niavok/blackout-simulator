import { 
    BsGenerationPerProductionType,
    BsProductionType,
    BsProductionValue,
    BsTypeUtils,
    BsInstalledCapacityPerProductionType,
    BsLoad,
 } from "./bs-types"
import { CsvContent } from "./csv-reader"


export class CsvParser {

    ParseGenerationPerProductionType(csv: CsvContent) : BsGenerationPerProductionType {

        console.log("ParseGenerationPerProduction");
        console.log("header: "+csv.header);

        let data = csv.data;
        let production = new BsGenerationPerProductionType();

        let productionTypesColumns = new Array<number>(BsProductionType._Lenght);
        let lastValidDataIndex = new Array<number>(BsProductionType._Lenght);
        let lastValidDataProduction = new Array<number>(BsProductionType._Lenght);

        for(let productionIndex = 0; productionIndex < BsProductionType._Lenght ; productionIndex++)
        {
            productionTypesColumns[productionIndex] = -1;
            lastValidDataIndex[productionIndex] = -1;
            lastValidDataProduction[productionIndex] = 0;
        }


        // Parse header, skip 2 fisrt column
        for(let columnIndex = 2; columnIndex < csv.header.length ; columnIndex++)
        {
            let productionType : BsProductionType;
            productionType = this.ParseActualGenerationProductionType(csv.header[columnIndex]);
            if(productionType != BsProductionType._Lenght)
            {
                productionTypesColumns[productionType] = columnIndex;
            }
        }

        for(let dataIndex = 0; dataIndex < data.length ; dataIndex++)
        {
            let dataEntry = data[dataIndex];

            let isEnd :boolean = true;

            let productionValues = [];
            let isEmptyLine = true;

            for(let productionType = 0; productionType < BsProductionType._Lenght ; productionType++)
            {
                let columnIndex = productionTypesColumns[productionType];
                if(columnIndex == -1)
                {
                    continue;
                }

                if(dataEntry[columnIndex] != "")
                {
                    isEmptyLine = false;
                }
                let productionValue : BsProductionValue;
                productionValue = this.ParseProductionValue(dataEntry[columnIndex]);

                if(!productionValue.isEnd)
                {
                    isEnd = false;
                }

                productionValues[productionType] = productionValue;
            }

            if(isEmptyLine)
            {
                // Empty line problem, don't use at 0 but as invalid
                console.warn("Empty line at " + dataIndex + ":"+ dataEntry);
                continue;
            }

            if(isEnd)
            {
                break;
            }

            for(let productionType = 0; productionType < BsProductionType._Lenght ; productionType++)
            {
                let productionValue = productionValues[productionType];

                if(productionValue.isValid)
                {
                    if(lastValidDataIndex[productionType] != (dataIndex - 1))
                    {
                        // Generate missing data
                        let missingValueCount = dataIndex - lastValidDataIndex[productionType] - 1;
                        console.warn("Repair " + missingValueCount + " values for " +BsTypeUtils.GetProductionTypeLabel(productionType)+ " at "+ dataIndex + "("+productionValue.production+")");

                        let initialProduction : number = lastValidDataProduction[productionType];
                        let finalProduction : number = productionValue.production;
                        let intervalCount : number = missingValueCount + 1;
                        let deltaProduction : number = (finalProduction - initialProduction) / intervalCount;

                        console.log("repair from " + initialProduction + " to " + finalProduction);
                        for(let i = 0; i < missingValueCount; i++)
                        {
                            let repairIndex = dataIndex - missingValueCount + i;
                            let repairProduction = Math.round(initialProduction + deltaProduction * (i+1));
                            production.SetProduction(repairIndex, productionType, repairProduction);
                        }

                        production.repairCount+=missingValueCount;
                    }

                    production.SetProduction(dataIndex, productionType, productionValue.production);
                    lastValidDataIndex[productionType] = dataIndex;
                    lastValidDataProduction[productionType] = productionValue.production;
                }
            }
        }

        production.Compile();
        console.log("Production duration: "+ production.duration+ " samples ("+production.repairCount+" repaired)");
        production.usedProductionTypes.forEach(type => {
            console.log("- " + BsTypeUtils.GetProductionTypeLabel(type)+ " min="+production.productionMinByType[type]+ " max="+production.productionMaxByType[type]+ " sum="+production.productionSumByType[type]+" avg="+production.productionAverageByType[type]+ " sd="+production.productionSDByType[type]);
        });
        return production;
    }

    ParseProductionValue(powerStr : string) : BsProductionValue {
        let value = new BsProductionValue();

        if(powerStr == "n/e") {
            return value;
        }

        if(powerStr == "N/A") {
            return value;
        }

        let power : number;
        if(powerStr == "-") {
            value.isEnd = true;
            power = 0;
        } else if(powerStr == "") {
            power = 0;
        }
        else{
            power = parseInt(powerStr);
            if(isNaN(power)) {
                console.error("Invalide power value: "+ powerStr);
                return value;
            }
        }

        value.production = power;
        value.isValid = true;

        return value;
    }

    ParseActualGenerationProductionType(typeStr : string) : BsProductionType {
        if (typeStr == "Hydro Pumped Storage  - Actual Consumption [MW]" ) {
            // Not production, ignore
            return BsProductionType._Lenght;
        }

        for(let productionType=0; productionType < BsProductionType._Lenght; productionType++) {
            if(typeStr == BsTypeUtils.GetProductionTypeENTSOELabel(productionType) + "  - Actual Aggregated [MW]")
            {
                return productionType;
            }
        }

        console.warn("Failed to parse production type: " + typeStr+ ". 'Other' type will be used ")

        return BsProductionType.Other;
    }

    ParseInstalledCapacityPerProductionType(csv: CsvContent) : BsInstalledCapacityPerProductionType {
        console.log("ParseInstalledCapacityPerProductionType");
        console.log("header: "+csv.header);

        let data = csv.data;
        let installedCapacities = new BsInstalledCapacityPerProductionType();

        for(let dataIndex = 0; dataIndex < data.length ; dataIndex++)
        {
            let dataEntry = data[dataIndex];

            if(dataEntry.length != 2) {
                console.error("invalid installed capacity line format: "+dataEntry);
                continue;
            }

            let productionTypeStr = dataEntry[0];
            let productionValue = this.ParseProductionValue(dataEntry[1]);

            let dataProductionType = BsProductionType._Lenght;

            for(let productionType = 0; productionType < BsProductionType._Lenght ; productionType++)
            {
                if(productionTypeStr == BsTypeUtils.GetProductionTypeENTSOELabel(productionType))
                {
                    dataProductionType = productionType;
                    break;
                }
            }

            if(dataProductionType != BsProductionType._Lenght)
            {
                if(productionValue.isValid && productionValue.production > 0)
                {
                    installedCapacities.installedCapacityTypes.push(dataProductionType);
                    installedCapacities.installedCapacityByType[dataProductionType] = productionValue.production;
                }
            }
            else if(productionTypeStr != "Total Grand capacity")
            {
                console.error("invalid installed capacity line values: "+dataEntry);
            }
        }

        console.log("Installed capacities: ");
        installedCapacities.installedCapacityTypes.forEach(type => {
            console.log("- " + BsTypeUtils.GetProductionTypeLabel(type)+ ": "+installedCapacities.installedCapacityByType[type]+ "MW");
        });
        return installedCapacities;
    }

    ParseLoad(csv: CsvContent) : BsLoad {
        console.log("ParseLoad");
        console.log("header: "+csv.header);

        let data = csv.data;
        let load = new BsLoad();

        let lastValidDataIndex = -1;
        let lastValidDataLoad = 0;

        for(let dataIndex = 0; dataIndex < data.length ; dataIndex++)
        {
            let dataEntry = data[dataIndex];

            if(dataEntry.length != 3) {
                console.error("invalid load line format at "+dataIndex+": "+dataEntry);
                continue;
            }

            if(dataEntry[2] == "" && dataEntry[1] == "")
            {
                // Empty line problem, don't use at 0 but as invalid
                console.warn("Empty line at " + dataIndex + ":"+ dataEntry);
                continue;
            }

            let loadValue = this.ParseProductionValue(dataEntry[2]);

            if(loadValue.isEnd)
            {
                break;
            }

            let RepairData = (finalLoad : number) : void => {
                // Generate missing data
                let missingValueCount = dataIndex - lastValidDataIndex - 1;
                console.warn("Repair " + missingValueCount + " values at "+ dataIndex);

                let initialLoad : number = lastValidDataLoad;
                let intervalCount : number = missingValueCount + 1;
                let deltaLoad : number = (finalLoad - initialLoad) / intervalCount;

                console.log("repair from " + initialLoad + " to " + finalLoad);
                for(let i = 0; i < missingValueCount; i++)
                {
                    let repairIndex = dataIndex - missingValueCount + i;
                    let repairLoad = Math.round(initialLoad + deltaLoad * (i+1));
                    load.load.push(repairLoad);
                    load.repairCount++;
                    console.log("repair " + repairIndex + " at " + repairLoad);
                }
            }

            if(loadValue.isValid)
            {
                if(lastValidDataIndex != (dataIndex - 1))
                {
                    RepairData(loadValue.production);
                }

                load.load.push(loadValue.production);
                lastValidDataIndex = dataIndex;
                lastValidDataLoad = loadValue.production;
            }
            else
            {
                let predictedLoadValue = this.ParseProductionValue(dataEntry[1]);
                if(predictedLoadValue.isValid)
                {
                    if(lastValidDataIndex != (dataIndex - 1))
                    {
                        RepairData(predictedLoadValue.production);
                    }

                    load.load.push(predictedLoadValue.production);
                    load.predictedValueCount++;
                    lastValidDataIndex = dataIndex;
                    lastValidDataLoad = loadValue.production;
                    console.log("use predicted at " + dataIndex+ " ("+load.predictedValueCount+")");
                }
            }
        }
        return load;
    }

}
