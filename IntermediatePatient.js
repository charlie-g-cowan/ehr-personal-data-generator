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
}

exports.IntermediatePatient = IntermediatePatient;
