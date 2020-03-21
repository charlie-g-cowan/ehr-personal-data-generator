const axios = require('axios');

const fhirUrl = 'http://localhost:5000';

function convertOptions(options) {
    const processedOptions = options;
    processedOptions.url = fhirUrl + options.url;
    return processedOptions;
}

class FHIRCall {
    static async run(options) {
        const processedOptions = convertOptions(options);
        try {
            return await axios(processedOptions);
        } catch (error) {
            throw error;
        }
    }
}

exports.FHIRCall = FHIRCall;
