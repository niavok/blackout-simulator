import { BsGenerationPerProductionType, BsProductionType, BsProductionValue, GetBsProductionTypeLabel } from "./bs-types"
import { CsvContent } from "./csv-reader"


export class CsvParser {


    ParseGenerationPerProduction(csv: CsvContent) : BsGenerationPerProductionType {

        console.log("ParseGenerationPerProduction");
        console.log("header: "+csv.header);

        let data = csv.data;
        let production = new BsGenerationPerProductionType();


        //var productionTypesColumns : BsProductionType[];
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

            for(let productionType = 0; productionType < BsProductionType._Lenght ; productionType++)
            {
                let columnIndex = productionTypesColumns[productionType];
                if(columnIndex == -1)
                {
                    continue;
                }

                let productionValue : BsProductionValue;
                productionValue = this.ParseProductionValue(dataEntry[columnIndex]);

                if(!productionValue.isEnd)
                {
                    isEnd = false;
                }

                productionValues[productionType] = productionValue;
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
                        console.warn("Repair " + missingValueCount + " values for " +GetBsProductionTypeLabel(productionType)+ " at "+ dataIndex + "("+productionValue.production+")");

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
                            console.log("repair " + repairIndex + " at " + repairProduction);
                        }
                    }

                    production.SetProduction(dataIndex, productionType, productionValue.production);
                    lastValidDataIndex[productionType] = dataIndex;
                    lastValidDataProduction[productionType] = productionValue.production;
                }
                // TOOD production.GetUsedProductionTypes();
            }
        }

        production.Compile();
        console.log("Production duration: "+ production.duration);
        production.usedProductionTypes.forEach(type => {
            console.log("- " + GetBsProductionTypeLabel(type)+ " min="+production.productionMinByType[type]+ " max="+production.productionMaxByType[type]+ " sum="+production.productionSumByType[type]+" avg="+production.productionAverageByType[type]+ " sd="+production.productionSDByType[type]);
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
        if (typeStr == "Biomass  - Actual Aggregated [MW]" ) {
            return BsProductionType.Biomass;
        }
        if (typeStr == "Fossil Brown coal/Lignite  - Actual Aggregated [MW]") {
            return BsProductionType.FossilBrownCoal;
        }
        if (typeStr == "Fossil Coal-derived gas  - Actual Aggregated [MW]" ) {
            return BsProductionType.FossilCoalDerivedGas;
        }
        if (typeStr == "Fossil Gas  - Actual Aggregated [MW]" ) {
            return BsProductionType.FossilGas;
        }
        if (typeStr == "Fossil Hard coal  - Actual Aggregated [MW]" ) {
            return BsProductionType.FossilHardCoal;
        }
        if (typeStr == "Fossil Oil  - Actual Aggregated [MW]" ) {
            return BsProductionType.FossilOil;
        }
        if (typeStr == "Fossil Oil shale  - Actual Aggregated [MW]" ) {
            return BsProductionType.FossilOilShale;
        }
        if (typeStr == "Fossil Peat  - Actual Aggregated [MW]" ) {
            return BsProductionType.FossilPeat;
        }
        if (typeStr == "Geothermal  - Actual Aggregated [MW]" ) {
            return BsProductionType.Geothermal;
        }
        if (typeStr == "Hydro Pumped Storage  - Actual Aggregated [MW]" ) {
            return BsProductionType.HydroPumpedStorage;
        }
        if (typeStr == "Hydro Run-of-river and poundage  - Actual Aggregated [MW]" ) {
            return BsProductionType.HydroRunOfRiverAndPondage;
        }
        if (typeStr == "Hydro Water Reservoir  - Actual Aggregated [MW]" ) {
            return BsProductionType.HydroWaterReservoir;
        }
        if (typeStr == "Marine  - Actual Aggregated [MW]" ) {
            return BsProductionType.Marine;
        }
        if (typeStr == "Nuclear  - Actual Aggregated [MW]" ) {
            return BsProductionType.Nuclear;
        }
        if (typeStr == "Other  - Actual Aggregated [MW]" ) {
            return BsProductionType.Other;
        }
        if (typeStr == "Other renewable  - Actual Aggregated [MW]" ) {
            return BsProductionType.OtherRenewable;
        }
        if (typeStr == "Solar  - Actual Aggregated [MW]" ) {
            return BsProductionType.Solar;
        }
        if (typeStr == "Waste  - Actual Aggregated [MW]" ) {
            return BsProductionType.Waste;
        }
        if (typeStr == "Wind Offshore  - Actual Aggregated [MW]" ) {
            return BsProductionType.WindOffshore;
        }
        if (typeStr == "Wind Onshore  - Actual Aggregated [MW]" ) {
            return BsProductionType.WindOnshore;
        }

        if (typeStr == "Hydro Pumped Storage  - Actual Consumption [MW]" ) {
            // Not production, ignore
            return BsProductionType._Lenght;
        }

        console.warn("Failed to parse production type: " + typeStr+ ". 'Other' type will be used ")

        return BsProductionType.Other;
    }
}
