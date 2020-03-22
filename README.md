#GOSH-FHIRworks2020-fhir-ehr-converter
- A converter between the FHIR and EHR standards.
- Requires connection to both a FHIR server and an EHR server

##Requirements
- Must be running a FHIR server on https://localhost:5001. Please use greenfrogs' module for this: https://github.com/greenfrogs/FHIRworks_2020, following the guide specified there. Please  remember to copy in the secrets to appsettings
- Must create a an authorisation.js file in the format shown in authorisation.js.example, complete with access details for an openEHR CDR. N.B. for testing/marking by UCL, please contact me to obtain authorisation details for the CDR, as it is the same CDR as my main project, so I cannot publicly release the details.

[to confirm] Alternatively, you can forgo connection to either any just return the JSON for axios calls to a server. 

##Current features
[todo]

##Not yet implemented
- Conversion between observations

Due to the very formal structure of EHR compositions, there is currently no implementation of conversion between observations in the two standards.
