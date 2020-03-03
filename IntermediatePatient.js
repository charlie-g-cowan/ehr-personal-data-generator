const getObjectPropertyIfExists = (object, propertyName) => {
    return propertyName in object ? object[propertyName] : ''
};

class IntermediatePatient {
    constructor () {
        this.data = {}
    }

    async makeNameFromFHIR(fhir) {
        this.data.name = {};
        this.data.name.firstName = getObjectPropertyIfExists(fhir, 'given')[0];
        this.data.name.familyName = getObjectPropertyIfExists(fhir, 'family');
        this.data.name.prefix = getObjectPropertyIfExists(fhir, 'prefix')[0];
    }

    async generateFromFHIRJSONRecord(fhirJson) {
        this.idList = {};
        this.idList.fhirId =  getObjectPropertyIfExists(fhirJson, 'id');
        this.makeNameFromFHIR(fhirJson.name[0]);
    }
}

exports.Patient = IntermediatePatient;
