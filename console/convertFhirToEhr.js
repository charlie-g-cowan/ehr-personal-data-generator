const { convertFHIRPatientToEHRPatient } = require("../src/convertFHIRPatientToEHRPatient");
async function run() {
    console.log(await convertFHIRPatientToEHRPatient(process.argv[2]));
}
run();

