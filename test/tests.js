const { getDemographicsPartyIdFromEHRId } = require("../src/IntermediatePatient");
const { IntermediatePatient } = require("../src/IntermediatePatient");
const { convertFHIRPatientToEHRPatient } = require("../src/convertFHIRPatientToEHRPatient");

// Have a go with other patient IDs!

async function testConvertFHIRPatientToEHRPatient() {
    console.log("EHR ID: ", await convertFHIRPatientToEHRPatient('be0b14f1-8ade-4061-aad8-ee4d7a784682'));
}

async function testInitializeFromFhirId() {
    const intermediatePatient = await new IntermediatePatient();
    await intermediatePatient.initializeFromFhirId('8f789d0b-3145-4cf2-8504-13159edaa747');
    console.log(intermediatePatient);
}

async function testInitializeFromEhrId() {
    const ehrId = '32a2d984-510b-40f8-8c4d-7e1556082455';
    const intermediatePatient = await new IntermediatePatient();
    await intermediatePatient.initializeFromEhrId(ehrId);
    await intermediatePatient.readInFromEHRDemographicsPartyId(await getDemographicsPartyIdFromEHRId(ehrId));
    console.log(intermediatePatient);
}

async function runTests() {
    await testConvertFHIRPatientToEHRPatient();
    console.log();
    await testInitializeFromFhirId();
    console.log();
    await testInitializeFromEhrId();
}
runTests();
