const { convertFHIRPatientToEHRPatient } = require("./convertFHIRPatientToEHRPatient");
const { getDemographicsPartyIdFromEHRId } = require("./IntermediatePatient");
const { getEHRIdFromFHIRId } = require("./IntermediatePatient");
const { IntermediatePatient } = require('./IntermediatePatient');
const { EHRCallOptions } = require('./EHRCallOptions');
const { EHRCall } = require('./EHRCall');

// axios({
//     method: 'get',
//     url: 'http://localhost:5000/api/Observation/8f789d0b-3145-4cf2-8504-13159edaa747',
//     headers: {},
// })
//     .then(function (response) {
//         console.log(response.data[0].entry[0].resource);
//     })
//     .catch(function (error) {
//         console.log(error);
//     });

async function test1() {
    const intermediatePatient1 = await new IntermediatePatient();
    await intermediatePatient1.initializeFromFhirId('8f789d0b-3145-4cf2-8504-13159edaa747');
    console.log(intermediatePatient1.idList); // Should return the two ids
}

async function test2() {
    const intermediatePatient1 = await new IntermediatePatient();
    await intermediatePatient1.initializeFromFhirId('8f789d0b-3145-4cf2-8504-13159edaa747');
    const intermediatePatient1Duplicate = await new IntermediatePatient();
    await intermediatePatient1Duplicate.initializeFromEhrId(await getEHRIdFromFHIRId(intermediatePatient1.idList.fhirId));
    console.log(intermediatePatient1);
    console.log(intermediatePatient1Duplicate);
    // EHRCallOptions.setEHRbirthYearAndAdminGender(intermediatePatient1))));
}

async function test3() {
    const intermediatePatient = await new IntermediatePatient();
    await intermediatePatient.initializeFromEhrId('32a2d984-510b-40f8-8c4d-7e1556082455');
    console.log(await getDemographicsPartyIdFromEHRId(intermediatePatient.idList.ehrId));
}

// async function test4() {
//     console.log(await convertFHIRPatientToEHRPatient('be0b14f1-8ade-4061-aad8-ee4d7a784682'));
// }
//
// test4();
// test1();
// test2();
// test3();
