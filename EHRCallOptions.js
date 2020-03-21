//https://www.hl7.org/fhir/valueset-administrative-gender.html#expansion
//https://ckm.openehr.org/ckm/archetypes/1013.1.1745
function fhirToEhrGender(fhirvalue) {
    return { 'male': 'Male', 'female': 'Female', 'other': 'Undetermined', 'unknown': 'Not known' }[fhirvalue];
}

class EHRCallOptions {
    static getQueryParamsForGettingEHRFromEHRId(ehrId) {
        return {
            'method': 'get',
            'url': '/rest/v1/ehr/' + ehrId,
        };
    }

    static getQueryParamsForCreatingEHRFromIntermediatePatientObject(patient) {
        return this.getQueryParamsForCreatingEHRFromFHIRId(patient.idList.fhirId);
    }

    static getQueryParamsForCreatingEHRFromFHIRId(fhirId) {
        return {
            'method': 'post',
            'url': '/rest/v1/ehr',
            'headers': {},
            'params': { 'subjectId': fhirId, 'subjectNamespace': 'fhirId' },
            'data': { "queryable": "true", "modifiable": "true" }
        };
    }

    static getQueryParamsForGettingEHRFromIntermediatePatientObject(patient) {
        return this.getQueryParamsForGettingEHRFromFHIRId(patient.idList.fhirId);
    }

    static getQueryParamsForGettingEHRFromFHIRId(fhirId) {
        return {
            'method': 'get',
            'url': '/rest/v1/ehr',
            'params': { 'subjectId': fhirId, 'subjectNamespace': 'fhirId' },
        };
    }

    static getQueryParamsForGettingDemographicsFromEHRId(ehrId) {
        return {
            'method': 'get',
            'url': '/rest/v1/demographics/ehr/' + ehrId + '/party',
        };
    }

    static getQueryParamsForCreatingDemographicsFromEHRId(ehrId) {
        return {
            'method': 'post',
            'url': '/rest/v1/demographics/party',
            'data': {
                "partyAdditionalInfo": [
                    {
                        "key": "ehrId",
                        "value": ehrId
                    }
                ]
            }
        };
    }

    static async setEHRbirthYearAndAdminGender(patient) {
        const toWrite = {
            "@class": "ITEM_TREE",
            "items": [
                {
                    "@class": "CLUSTER",
                    "archetype_details": {
                        "@class": "ARCHETYPED",
                        "archetype_id": {
                            "@class": "ARCHETYPE_ID",
                            "value": "openEHR-EHR-CLUSTER.person_anonymised_parent.v1"
                        },
                        "rm_version": "1.0.1"
                    },
                    "archetype_node_id": "openEHR-EHR-CLUSTER.person_anonymised_parent.v1",
                    "items": [
                        {
                            "@class": "ELEMENT",
                            "name": {
                                "@class": "DV_TEXT",
                                "value": "Administrative Gender"
                            },
                            "archetype_node_id": "at0001",
                            "value": {
                                "@class": "DV_CODED_TEXT",
                                "value": fhirToEhrGender(patient.administrativeGender),
                                "defining_code": {
                                    "@class": "CODE_PHRASE",
                                    "terminology_id": {
                                        "@class": "TERMINOLOGY_ID",
                                        "value": "local"
                                    },
                                    "code_string": "at0009"
                                }
                            }
                        },
                        // {
                        //     "@class": "ELEMENT",
                        //     "name": {
                        //         "@class": "DV_TEXT",
                        //         "value": "Vital Status"
                        //     },
                        //     "archetype_node_id": "at0003",
                        //     "value": {
                        //         "@class": "DV_CODED_TEXT",
                        //         "value": "Alive",
                        //         "defining_code": {
                        //             "@class": "CODE_PHRASE",
                        //             "terminology_id": {
                        //                 "@class": "TERMINOLOGY_ID",
                        //                 "value": "local"
                        //             },
                        //             "code_string": "at0004"
                        //         }
                        //     }
                        // },
                        {
                            "@class": "ELEMENT",
                            "name": {
                                "@class": "DV_TEXT",
                                "value": "Birth Year"
                            },
                            "archetype_node_id": "at0014",
                            "value": {
                                "@class": "DV_DATE",
                                "value": patient.birthDate.substr(0, 4),
                            }
                        }
                    ]
                }
            ]
        };
        return {
            'method': 'put',
            'url': '/rest/v1/ehr/' + patient.idList.ehrId + '/status/other_details',
            'headers': {},
            'data': toWrite
        };
    }
}

exports.EHRCallOptions = EHRCallOptions;
