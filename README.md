# GOSH-FHIRworks2020-fhir-ehr-converter
- A converter between the FHIR and EHR standards.
- Requires connection to both a FHIR server and an EHR server

## Background

My main project for my Systems Engineering module involves working with the openEHR standard. This gave me the inspiration to build a converter for the FHIR hack. Turns out observations are tougher to convert than expected, so for now it only converts basic patient details. If I wanted to be really buzzword-y I'd call it EarthWater as FHIR is pronounced Fire and EHR is pronounced Air but I can't bring myself to be that hipster.

## Requirements
- Must be running a FHIR server on https://localhost:5001. Please use greenfrogs' module for this: https://github.com/greenfrogs/FHIRworks_2020 (included as a submodule in this project), following the guide specified there. Please  remember to copy in the secrets to appsettings.
- Must create a an authorisation.js file in the format shown in authorisation.js.example, complete with access details for an openEHR CDR. N.B. for testing/marking by UCL, please contact me to obtain authorisation details for the CDR, as it is the same CDR as my main project, so I cannot publicly release the details.

## Working features / API
Much of API works on an object called the IntermediatePatient, which is a patient which contains information from either a FHIR or EHR or both, and can write to an EHR (and in future a FHIR database); 

N.B. these key tests are demonstrated in test/tests.js

Generate an EHR from a FHIR, with the key patient details transferred over:
```
console.log(await convertFHIRPatientToEHRPatient('be0b14f1-8ade-4061-aad8-ee4d7a784682'));
```
or in command line:
```
node GOSH-FHIRworks2020-fhir-ehr-converter/console/convertFhirToEhr.js be0b14f1-8ade-4061-aad8-ee4d7a784682
```
If an EHR already existed that was associated with the FHIR ID, it rewrites over that EHR.

Read in from an FHIR into an IntermediatePatient object:
```
const intermediatePatient = await new IntermediatePatient();
await intermediatePatient.initializeFromFhirId('8f789d0b-3145-4cf2-8504-13159edaa747');
```

Read in from an EHR into an IntermediatePatient object:
```
const ehrId = '32a2d984-510b-40f8-8c4d-7e1556082455';
const intermediatePatient = await new IntermediatePatient();
await intermediatePatient.initializeFromEhrId(ehrId);
await intermediatePatient.readInFromEHRDemographicsPartyId(await getDemographicsPartyIdFromEHRId(ehrId));
```


## Not yet implemented
- Conversion between observations - due to the very formal structure of EHR compositions, there is currently no implementation of conversion between observations in the two standards.
- Writing to the FHIR database (conversion from EHR to FHIR) - while we can convert from an EHR into my IntermediatePatient object, I have not had time to work out the process of writing to FHIR. However, all the data is ready in the IntermediatePatient object to write to a FHIR patient.

## Debugging issues
If there are issues with the contents of the submodule not pulling, please run `git submodule update --init --recursive`
