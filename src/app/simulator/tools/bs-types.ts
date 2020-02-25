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

export class GenerationPerProduction {

    usedProductionTypes :BsProductionType[];
    productionByType : Array<Array<number>>;

    constructor(duration: number) {
        this.productionByType = new Array<Array<number>>(BsProductionType._Lenght);

        console.warn("constructor this.productionByType.length="+ this.productionByType.length);
        console.warn("duration="+ duration);

        for(var i: number = 0; i < this.productionByType.length; i++) {
            //this.productionByType[i] = new Array<number>(duration);
            this.productionByType[i] = [];
        }
    }

    GetUsedProductionTypes() : BsProductionType[] {
        return this.usedProductionTypes;
    }

    SetProduction(time : number, productionType : BsProductionType, productionValue: number) : void {
        if(productionValue != 0)
        {
            // TODO update used without search
        }

        this.productionByType[productionType][time] = productionValue;
    }
}

export class ProductionValue {
    isValid : boolean = false;
    isEnd : boolean = false;
    production : number;
}
