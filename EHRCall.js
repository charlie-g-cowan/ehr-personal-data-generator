const { cdrAuthorisation, cdrUrl } = require('./authorisation');
const axios = require('axios');

function convertOptions(options) {
    const processedOptions = options;
    processedOptions.headers = {
        'Ehr-Session-disabled': '{{Ehr-Session}}',
        'Content-Type': 'application/json',
        'Authorization': cdrAuthorisation,
    };
    processedOptions.url = cdrUrl + options.url;
    return processedOptions;
}

class EHRCall {
    static async run(options) {
        const processedOptions = convertOptions(options);
        try {
            return await axios(processedOptions);
        } catch (error) {
            console.error(error);
        }
    }
}

exports.EHRCall = EHRCall;

