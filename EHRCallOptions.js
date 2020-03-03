const querystring = require('querystring');

class EHRCallOptions {
    async createEHRFromIntermediatePatient(patient) {
        return {
            'method': 'post',
            'url': 'https://cdr.code4health.org/rest/v1/ehr',
            'headers': {},
            'params': { 'subjectId': patient.idList.fhirId, 'subjectNamespace': 'fhirId'},
            'body': { "queryable": "true", "modifiable": "true" }
        };
    }
}

exports.EHRCallOptions = EHRCallOptions;
