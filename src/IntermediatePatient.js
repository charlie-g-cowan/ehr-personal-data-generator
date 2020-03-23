const { FHIRCall } = require("./FHIRCall");
const { EHRCall } = require("./EHRCall");
const { EHRCallOptions } = require("./EHRCallOptions");

const getObjectPropertyIfExists = (object, propertyName) => {
    return propertyName in object ? object[propertyName] : ''
};

//https://www.hl7.org/fhir/valueset-administrative-gender.html#expansion
//https://ckm.openehr.org/ckm/archetypes/1013.1.1745
function fhirToEhrGender(fhirvalue) {
    return { 'male': 'Male', 'female': 'Female', 'other': 'Undetermined', 'unknown': 'Not known' }[fhirvalue];
}

function ehrToFhirGender(fhirvalue) {
    return { 'Male': 'male', 'Female': 'female', 'Undetermined': 'other', 'Not known': 'unknown' }[fhirvalue];
}

// Get the JSON of a FHIR record from a FHIR ID
async function getFHIRJSONRecordByFHIRId(patientId) {
    return (await FHIRCall.run({
        method: 'get',
        url: '/api/Patient/' + patientId
    })).data;
}

// If there is already an EHR associated to this FHIR ID, return its EHR ID.
// If not, create a new one and return its EHR ID.
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

// Get the id of the demographics party (separate object defining personal data for a patient) from the ehr id
async function getDemographicsPartyIdFromEHRId(ehrId) {
    try {
        const retrievalResult = await EHRCall.run(EHRCallOptions.getQueryParamsForGettingDemographicsFromEHRId(ehrId));
        if (retrievalResult.status === 200) {
            return retrievalResult.data.party.id;
        }
    } catch (e) {
        if (e.response.status === 404) {
            const creationResult = await EHRCall.run(EHRCallOptions.getQueryParamsForCreatingDemographicsFromEHRId(ehrId));
            if (creationResult.status === 201) {
                try {
                    const retrievalSecondAttemptResult = await EHRCall.run(EHRCallOptions.getQueryParamsForGettingDemographicsFromEHRId(ehrId));
                    if (retrievalSecondAttemptResult.status === 200) {
                        return retrievalSecondAttemptResult.data.party.id;
                    } else {
                        console.log("Can't retrieve demographics party even after creation");
                        // throw e;
                    }
                } catch (e2) {
                    console.log("Error when retrieving demographics party, likely no ehr id was passed")
                }
            } else {
                console.log("Can't create demographics party")
                // throw 'Error: ' + JSON.stringify(creationResult, null, 2);
            }
        } else {
            console.log("No demographics party exists and unknown response code so can't create")
            // throw e;
        }
    }
}

class IntermediatePatient {
    constructor() {
        this.data = {};
        this.idList = {};
    }

    async makeNameFromFHIRName(fhirName) {
        this.data.name = {};
        this.data.name.firstName = getObjectPropertyIfExists(fhirName, 'given')[0];
        this.data.name.familyName = getObjectPropertyIfExists(fhirName, 'family');
        this.data.name.prefix = getObjectPropertyIfExists(fhirName, 'prefix')[0];
    }

    async readInFromFHIRJSONRecord(fhirJson) {
        this.idList.fhirId = getObjectPropertyIfExists(fhirJson, 'id');
        this.data.administrativeGender = getObjectPropertyIfExists(fhirJson, 'gender');
        const birthDate = getObjectPropertyIfExists(fhirJson, 'birthDate');
        this.data.birthDate = {
            year: birthDate.substr(0, 4),
            month: birthDate.substr(5, 2),
            day: birthDate.substr(8, 2)
        };
        this.makeNameFromFHIRName(fhirJson.name[0]);
    }

    async initializeFromFhirId(fhirId) {
        try {
            await this.readInFromFHIRJSONRecord(await getFHIRJSONRecordByFHIRId(fhirId));
        } catch (e) {
            throw e;
        }
    }

    async initializeFromEhrId(ehrId) {
        await this.readInFromEHRStatusJson((await EHRCall.run(EHRCallOptions.getQueryParamsForGettingEHRFromEHRId(ehrId))).data);
    }

    async readInFromEHRStatusJson(ehrStatusJson) {
        this.idList.ehrId = getObjectPropertyIfExists(ehrStatusJson, 'ehrId');
        if ('ehrStatus' in ehrStatusJson) {
            if (ehrStatusJson.ehrStatus.subjectNamespace === 'fhirId' && 'subjectId' in ehrStatusJson.ehrStatus) {
                this.idList.fhirId = getObjectPropertyIfExists(ehrStatusJson.ehrStatus, 'subjectId');
            }
            if ('otherDetails' in ehrStatusJson.ehrStatus) {
                ehrStatusJson.ehrStatus.otherDetails.items.forEach((item) => {
                    if (item.archetype_node_id === 'openEHR-EHR-CLUSTER.person_anonymised_parent.v1') {
                        item.items.forEach((subitem) => {
                            if (subitem.archetype_node_id === 'at0001') {
                                this.data.administrativeGender = ehrToFhirGender(subitem.value.value);
                            } else if (subitem.archetype_node_id === 'at0014') {
                                this.data.birthDate = {};
                                this.data.birthDate.year = subitem.value.value;
                            }
                        });
                    }
                });
            }
        }
    }

    async readInFromEHRDemographicsPartyJson(party) {
        this.data.administrativeGender = getObjectPropertyIfExists(party, 'gender');
        const birthDate = getObjectPropertyIfExists(party, 'dateOfBirth');
        this.data.birthDate = {
            year: birthDate.substr(0, 4),
            month: birthDate.substr(5, 2),
            day: birthDate.substr(8, 2)
        };
        if (!('name' in this.data)) {
            this.data.name = {};
        }
        this.data.name.firstName = getObjectPropertyIfExists(party, 'firstNames');
        this.data.name.familyName = getObjectPropertyIfExists(party, 'lastNames');
    }

    async readInFromEHRDemographicsPartyId(demographicsId) {
        const party = (await EHRCall.run(EHRCallOptions.getQueryParamsForGettingDemographicsFromDemographicsId(demographicsId))).data.party;
        await this.readInFromEHRDemographicsPartyJson(party);
    }

    async writeToEHRAndDemographics() {
        const ehrId = await getEHRIdFromFHIRId(this.idList.fhirId);
        const data = {
            "dateOfBirth": this.data.birthDate.year + "-" + this.data.birthDate.month + "-" + this.data.birthDate.day,
            "firstNames": this.data.name.firstName,
            "gender": fhirToEhrGender(this.data.administrativeGender).toUpperCase(),
            "lastNames": this.data.name.familyName,
            "id": parseInt(await getDemographicsPartyIdFromEHRId(ehrId)),
            "partyAdditionalInfo": [
                {
                    "key": "ehrId",
                    "value": ehrId
                }
            ]
        };
        try {
            await EHRCall.run(EHRCallOptions.getQueryParamsForUpdatingDemographicsFromData(data));
        } catch (e) {
            if (e.response.status === 409) { // Updated too many times already
                // DO SOMETHING
                await EHRCall.run(EHRCallOptions.getQueryParamsForDeletingDemographicsById(await getDemographicsPartyIdFromEHRId(ehrId)));
                const data = {
                    "dateOfBirth": this.data.birthDate.year + "-" + this.data.birthDate.month + "-" + this.data.birthDate.day,
                    "firstNames": this.data.name.firstName,
                    "gender": fhirToEhrGender(this.data.administrativeGender).toUpperCase(),
                    "lastNames": this.data.name.familyName,
                    "partyAdditionalInfo": [
                        {
                            "key": "ehrId",
                            "value": ehrId
                        }
                    ]
                };
                await EHRCall.run(EHRCallOptions.getQueryParamsForCreatingDemographicsFromData(data));
            } else {
                console.log("ERROR:", e.response.status);
            }
        }
    }
}

exports.IntermediatePatient = IntermediatePatient;
exports.getEHRIdFromFHIRId = getEHRIdFromFHIRId;
exports.getDemographicsPartyIdFromEHRId = getDemographicsPartyIdFromEHRId;
