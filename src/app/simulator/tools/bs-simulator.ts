import { BsScenario, BsInstalledCapacityPerProductionType, BsGenerationPerProductionType, BsLoad } from './bs-types';

export class BsSimulator {

    referenceScenatio : BsScenario;

    constructor() {
    }

    Simulate() {


        // Output
        let simulationOuput: BsScenario;
    }

}


export class BsSimulatorConfig {
    installedCapacities : BsInstalledCapacityPerProductionType;
}


export class BsBlackoutDescriptor
{
    date: number
    duration: number
    missinGeneration : Array<number>;
}

export class BsSimulatorOutput {
    installedCapacities : BsInstalledCapacityPerProductionType;
    load : BsLoad;
    actualGeneration : BsGenerationPerProductionType;
    duration : number;

    wasteGenerationPerProductionType : Array<Array<number>>;
    wasteGeneration : Array<number>;
    blackoutList : Array<BsBlackoutDescriptor>

    // TotalCost
    // TotalCost/MWh
    // Cost/MWh : Array
    // Total Co2
    // TotalCo2/MWh
    // MarginalCo2 : Array
    // Co2/MWh : Array
}

}