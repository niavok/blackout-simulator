import { assertNotNull } from '@angular/compiler/src/output/output_ast';

export enum BsProductionType {
    Biomass,
    FossilBrownCoal,
    FossilCoalDerivedGas,
    FossilGas,
    FossilHardCoal,
    FossilOil,
    FossilOilShale,
    FossilPeat,
    Geothermal,
    HydroPumpedStorage,
    HydroRunOfRiverAndPondage,
    HydroWaterReservoir,
    Marine,
    Nuclear,
    Other,
    OtherRenewable,
    Solar,
    Waste,
    WindOffshore,
    WindOnshore,
    _Lenght,
}

export enum BsProductionCategory {
    Biomass,
    Coal,
    Gas,
    Oil,
    Geothermal,
    Hydro,
    Nuclear,
    Solar,
    Waste,
    Wind,
    Other,
}

export enum BsProductionSource {
    Rewnewable,
    Nuclear,
    Fossil,
}

export class BsGenerationPerProductionType {

    usedProductionTypes :BsProductionType[];
    productionByType : Array<Array<number>>;
    productionMinByType : number[];
    productionMaxByType : number[];
    productionSumByType : number[];
    productionAverageByType : number[];
    productionSDByType : number[];
    duration : number;
    repairCount : number;

    constructor() {
        this.productionByType = new Array<Array<number>>(BsProductionType._Lenght);
        this.duration = 0;
        this.repairCount = 0;
        this.usedProductionTypes = [];
        this.productionMinByType = [];
        this.productionMaxByType = [];
        this.productionSumByType = [];
        this.productionAverageByType = [];
        this.productionSDByType = [];

        for(let i: number = 0; i < this.productionByType.length; i++) {
            this.productionByType[i] = [];
        }
    }

    Compile() {
        if(this.usedProductionTypes.length != 0)
        {
            console.error("BsGenerationPerProductionType::Compile: usedProductionTypes should be empty");
            this.usedProductionTypes = [];
        }

        for(let productionType: number = 0; productionType < BsProductionType._Lenght; productionType++) {
            let production = this.productionByType[productionType];
            if(production.length > 0)
            {
                let productionMin = Number.POSITIVE_INFINITY;
                let productionMax = Number.NEGATIVE_INFINITY;
                let productionSum = 0;

                for (const productionValue of production) {
                    productionMin = Math.min(productionMin, productionValue);
                    productionMax = Math.max(productionMax, productionValue);
                    productionSum += productionValue;
                }

                if(productionMax != 0 || productionMin != 0)
                {
                    this.usedProductionTypes.push(productionType);

                    this.productionMinByType[productionType] = productionMin;
                    this.productionMaxByType[productionType] = productionMax;
                    this.productionSumByType[productionType] = productionSum;
                    let productionAverage = productionSum / production.length
                    this.productionAverageByType[productionType] = productionAverage;

                    let productionSumErrorSq = 0;
                    for (const productionValue of production) {
                        productionSumErrorSq += (productionAverage - productionValue) * (productionAverage - productionValue);
                    }

                    let productionVariance = productionSumErrorSq / production.length;
                    let productionSD = Math.sqrt(productionVariance);
                    this.productionSDByType[productionType] = productionSD;

                    if(this.duration > 0 && this.duration != production.length)
                    {
                        console.error("BsGenerationPerProductionType::Compile: Production duration for "+BsTypeUtils.GetProductionTypeLabel(productionType)+" is "+production.length+" but duration is " + this.duration);
                        this.duration = Math.min(production.length, this.duration);
                    }
                    else
                    {
                        this.duration = production.length;
                    }
                }
            }
        }
    }

    SetProduction(time : number, productionType : BsProductionType, productionValue: number) : void {
        this.productionByType[productionType][time] = productionValue;
    }
}

export class BsInstalledCapacityPerProductionType {
    installedCapacityTypes : BsProductionType[];
    installedCapacityByType : number[];

    constructor() {
        this.installedCapacityByType = [];
        this.installedCapacityTypes = [];
    }
}

export class BsLoad {
    load : number[];
    repairCount : number;
    predictedValueCount : number;

    constructor() {
        this.load = [];
        this.repairCount = 0;
        this.predictedValueCount = 0;
    }
}


export class BsProductionValue {
    isValid : boolean = false;
    isEnd : boolean = false;
    production : number;
}

export class BsTypeUtils {

    static GetProductionTypeLabel(type: BsProductionType) : string {
        switch(type)
        {
            case BsProductionType.Biomass:
                return "Biomass";
            case BsProductionType.FossilBrownCoal:
                return "Brown coal";
            case BsProductionType.FossilCoalDerivedGas:
                return "Coal derived gas";
            case BsProductionType.FossilGas:
                return "Gas";
            case BsProductionType.FossilHardCoal:
                return "Hard coal";
            case BsProductionType.FossilOil:
                return "Oil";
            case BsProductionType.FossilOilShale:
                return "Oil shale";
            case BsProductionType.FossilPeat:
                return "Peat";
            case BsProductionType.Geothermal:
                return "Geothermal";
            case BsProductionType.HydroPumpedStorage:
                return "Hydro pumped storage";
            case BsProductionType.HydroRunOfRiverAndPondage:
                return "Hydro run-of-river and poundage";
            case BsProductionType.HydroWaterReservoir:
                return "Hydro water reservoir";
            case BsProductionType.Marine:
                return "Marine";
            case BsProductionType.Nuclear:
                return "Nuclear";
            case BsProductionType.Other:
                return "Other";
            case BsProductionType.OtherRenewable:
                return "Other renewable";
            case BsProductionType.Solar:
                return "Solar";
            case BsProductionType.Waste:
                return "Waste";
            case BsProductionType.WindOffshore:
                return "Wind offshore";
            case BsProductionType.WindOnshore:
                return "Wind onshore";
            default:
                return "Invalid production type";
        }
    }

    static GetProductionTypeENTSOELabel(type: BsProductionType) : string {
        switch(type)
        {
            case BsProductionType.Biomass:
                return "Biomass";
            case BsProductionType.FossilBrownCoal:
                return "Fossil Brown coal/Lignite";
            case BsProductionType.FossilCoalDerivedGas:
                return "Fossil Coal-derived gas";
            case BsProductionType.FossilGas:
                return "Fossil Gas";
            case BsProductionType.FossilHardCoal:
                return "Fossil Hard coal";
            case BsProductionType.FossilOil:
                return "Fossil Oil";
            case BsProductionType.FossilOilShale:
                return "Fossil Oil shale";
            case BsProductionType.FossilPeat:
                return "Fossil Peat";
            case BsProductionType.Geothermal:
                return "Geothermal";
            case BsProductionType.HydroPumpedStorage:
                return "Hydro Pumped Storage";
            case BsProductionType.HydroRunOfRiverAndPondage:
                return "Hydro Run-of-river and poundage";
            case BsProductionType.HydroWaterReservoir:
                return "Hydro Water Reservoir";
            case BsProductionType.Marine:
                return "Marine";
            case BsProductionType.Nuclear:
                return "Nuclear";
            case BsProductionType.Other:
                return "Other";
            case BsProductionType.OtherRenewable:
                return "Other renewable";
            case BsProductionType.Solar:
                return "Solar";
            case BsProductionType.Waste:
                return "Waste";
            case BsProductionType.WindOffshore:
                return "Wind Offshore";
            case BsProductionType.WindOnshore:
                return "Wind Onshore";
            default:
                console.error("GetProductionTypeENTSOELabel - Invalid production type: "+type);
                return "Invalid production type";
        }
    }

}