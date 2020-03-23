const { getEHRIdFromFHIRId } = require("./IntermediatePatient");
const { IntermediatePatient } = require("./IntermediatePatient");

// Takes a FHIR id, returns the EHR id of a created EHR
async function convertFHIRPatientToEHRPatient(fhirId) {
    const intermediatePatient = await new IntermediatePatient();
    await intermediatePatient.initializeFromFhirId(fhirId);
    await intermediatePatient.writeToEHRAndDemographics();
    return await getEHRIdFromFHIRId(intermediatePatient.idList.fhirId);
}

exports.convertFHIRPatientToEHRPatient = convertFHIRPatientToEHRPatient;
