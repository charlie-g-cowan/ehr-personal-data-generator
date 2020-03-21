const axios = require('axios');
const { IntermediatePatient } = require('./IntermediatePatient');
const { EHRCallOptions } = require('./EHRCallOptions');
const { EHRCall } = require('./EHRCall');

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
//         console.log(response.data[0].entry[0].resource);
//     })
//     .catch(function (error) {
//         console.log(error);
//     });

async function getFHIRJSONRecordByFHIRId(patientId) {
    try {
        const response = await axios({
            method: 'get',
            url: 'http://localhost:5000/api/Patient/' + patientId,
            headers: {},
        });
        return response.data;
    } catch (error) {
        console.error(error);
    }
}

async function test() {
    const intermediatePatient1 = await new IntermediatePatient();
    await intermediatePatient1.readInFromFHIRJSONRecord(await getFHIRJSONRecordByFHIRId('8f789d0b-3145-4cf2-8504-13159edaa747'));
    intermediatePatient1.idList.ehrId =
        (await EHRCall.run(EHRCallOptions.getQueryParamsForCreatingEHRFromIntermediatePatientObject(intermediatePatient1))).ehrId;
    console.log(intermediatePatient1.idList);
}

// test();


async function getEHRIdFromFHIRId(fhirId) {
    const result = await EHRCall.run(EHRCallOptions.getQueryParamsForGettingEHRFromFHIRId(fhirId));
    if (result.status === 204) {
        // no ehr with that fhir id
        // create an ehr
        const creationResult = await EHRCall.run(EHRCallOptions.getQueryParamsForCreatingEHRFromFHIRId(fhirId));
        if (creationResult.status === 201) {
            // successfully created ehr
            return creationResult.data.ehrId;
        } else {
            // creation error
            throw 'creation error, data: ' + result.data;
        }
    } else if (result.status === 200) {
        // ehr exists
        return result.data.ehrId;
    } else {
        // (unexpected) error getting the ehr
        throw 'getting error, data: ' + result.data;
    }
}

async function test2() {
    const intermediatePatient1 = await new IntermediatePatient();
    await intermediatePatient1.readInFromFHIRJSONRecord(await getFHIRJSONRecordByFHIRId('8f789d0b-3145-4cf2-8504-13159edaa747'));
    // console.log(await getEHRIdFromFHIRId(intermediatePatient1.idList.fhirId));
    const ehrJson = (await EHRCall.run(EHRCallOptions.getQueryParamsForGettingEHRFromEHRId(await getEHRIdFromFHIRId(intermediatePatient1.idList.fhirId)))).data;
    const intermediatePatient1Duplicate = await new IntermediatePatient();
    await intermediatePatient1Duplicate.readInFromEHRStatusJson(ehrJson);
    console.log(intermediatePatient1);
    console.log(intermediatePatient1Duplicate);
    // EHRCallOptions.setEHRbirthYearAndAdminGender(intermediatePatient1))));
}

async function getDemographicsPartyIdFromEHRId(ehrId) {
    try {
        const retrievalResult = await EHRCall.run(EHRCallOptions.getQueryParamsForGettingDemographicsFromEHRId(ehrId));
        if (retrievalResult.status === 200) {
            return retrievalResult.data.party.id;
        }
    } catch (e) {
        if (e.response.status === 404) {
            const creationResult = await EHRCall.run(EHRCallOptions.getQueryParamsForCreatingDemographicsFromEHRId(ehrId));
            if (creationResult.status = 200) {
                const retrievalSecondAttemptResult = await EHRCall.run(EHRCallOptions.getQueryParamsForGettingDemographicsFromEHRId(ehrId));
                if (retrievalSecondAttemptResult.status === 200) {
                    return retrievalSecondAttemptResult.data.party.id;
                } else {
                    throw e;
                }
            } else {
                throw 'Error: ' + JSON.stringify(creationResult, null, 2);
            }
        } else {
            throw e;
        }
    }
}

async function test3() {
    const intermediatePatient = await new IntermediatePatient();
    const ehrJson = (await EHRCall.run(EHRCallOptions.getQueryParamsForGettingEHRFromEHRId('32a2d984-510b-40f8-8c4d-7e1556082455'))).data;
    await intermediatePatient.readInFromEHRStatusJson(ehrJson);
    console.log(await getDemographicsPartyIdFromEHRId(intermediatePatient.idList.ehrId));
}

async function test4() {
    const intermediatePatient = await new IntermediatePatient();
    const ehrJson = (await EHRCall.run(EHRCallOptions.getQueryParamsForGettingEHRFromEHRId('32a2d984-510b-40f8-8c4d-7e1556082455'))).data;
    await intermediatePatient.readInFromEHRStatusJson(ehrJson);
    const demographicsPartyId = await getDemographicsPartyIdFromEHRId(intermediatePatient.idList.ehrId);

}

test3();
