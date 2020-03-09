# Report Maker

This application will generate a report(PDF or HTML) using the output generated by CARL.

## Out of the box

Run the following command lines with predefined executable
```
ReportMaker-linux --help
ReportMaker-macos --help
ReportMaker-win.exe --help
```

## Installation

Run the following command line if you want to use node.js

```
npm install
node reportmaker.js --help
```
## Instructions

Please follow the instructions and provide the right inputs to generate the expected report:

```
--input: path to the folder where to find the CAST Lite output
--output: path where the report will be saved
--report: OWASP2017|OWASP2013|CWETop252011|CWETop252019|OWASPMobile2016  (CAST Health Factors if empty)
--format: PDF|HTML (PDF by default)
```
## Templates

List of templates:
  - OWASP2017
  - OWASP2013
  - CWETop252011
  - CWETop252019
  - OWASPMobile2016

Don't forget to provide paths according to your OS:
```
UNIX Path: /path/to/my/report
WINDOWS Path: D:\path\to\my\report
```

## Tests

```
npm run test
```
