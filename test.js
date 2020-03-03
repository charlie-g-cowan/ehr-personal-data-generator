const axios = require('axios');
const { IntermediatePatient } = require('./IntermediatePatient');
const { EHRCallOptions } = require('./EHRCallOptions');

// axios({
//     method: 'get',
//     url: 'http://localhost:5000/api/Patient',
//     headers: {},
// })
//     .then(function (response) {
//         console.log(response.data[0].entry[0].resource);
//     })
//     .catch(function (error) {
//         console.log(error);
//     });

// axios({
//     method: 'get',
//     url: 'http://localhost:5000/api/Observation/8f789d0b-3145-4cf2-8504-13159edaa747',
//     headers: {},
// })
//     .then(function (response) {
//         console.log(response.data[0].entry[0]);
//     })
//     .catch(function (error) {
//         console.log(error);
//     });

async function getFHIRJSONforIntermediatePatientByFHIRID(patientId) {
    try {
        const response = await axios({
            method: 'get',
            url: 'http://localhost:5000/api/Patient/' + patientId,
            headers: {},
        });
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error(error);
    }
}

async function test() {
    const intermediatePatient1 = await new IntermediatePatient();
    await intermediatePatient1.generateFromFHIRJSONRecord(await getFHIRJSONforIntermediatePatientByFHIRID('8f789d0b-3145-4cf2-8504-13159edaa747'));
    const ehrCallOptions = new EHRCallOptions();
    console.log(await ehrCallOptions.createEHRFromIntermediatePatient(intermediatePatient1));
}

test();
