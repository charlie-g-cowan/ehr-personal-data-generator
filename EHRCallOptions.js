const querystring = require('querystring');

class EHRCallOptions {
    createEHRFromIntermediatePatient(patient) {
        const options = {
            'method': 'post',
            'url': 'https://cdr.code4health.org/rest/v1/ehr?subjectId=12345&subjectNamespace=uk.nhs.nhs_number',
            'headers': {},
            'params': { 'subjectId': patient.idList.fhirId, 'subjectNamespace': 'fhirId'},
            'body': { "queryable": "true", "modifiable": "true" }
        };
    }
}
