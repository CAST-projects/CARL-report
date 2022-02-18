//console.log('PDF Maker initializating...');

var path = require('path');
var os = require('os');
var readline = require('readline')

var myArgs = process.argv.slice(2);

var input = '';
var output = '';
var report = '';
var format = 'PDF';

const version = "1.2.1";

var doc;

if ( myArgs.length > 0) {

  for (var i = 0; i < myArgs.length; i++ ) {

    if ( myArgs[i] == '--help' ) {
      displayhelp();
    }

    if ( myArgs[i] == '--input' ) {
      input = myArgs[i+1];

      input = path.normalize(input);

      //console.log("intput="+input);
    }

    if ( myArgs[i] == '--output' ) {
      output = myArgs[i+1];

      output = path.normalize(output);

      //console.log("output="+output);
    }

    if ( myArgs[i] == '--format' ) {
      format = myArgs[i+1];

      //console.log("format="+format);
    }

    if ( myArgs[i] == '--report' ) {
      report = myArgs[i+1];

      //console.log("report="+report);
    }
  }
}
else {
  displayhelp();
}

var template;

if(report!='') {
  try {
    template = require(/*path.join(*/'./templates/'+report+'.template.js');
  }
  catch(error) {
    console.log("Cannot load the template from report:"+report);
    console.error(error);
    process.exit(1);
  }
}

//console.log(template.templatetitle);

function displayhelp() {

  console.log("CARL Report Maker Help ("+version+")");
  console.log("--input: path to the folder where to find the CARL output");
  console.log("--output: path where the report will be saved");
  console.log("--report: OWASP2021|OWASP2017|OWASP2013|CWETop252011|CWETop252019|OWASPMobile2016|PCI-DSS (CAST Health Factors if empty)");
  console.log("--format: PDF|HTML (PDF by default)");

  process.exit(1);
}

const fs   = require('fs');
const pdf = require('pdfjs');

// read the application json file
let rawdata = fs.readFileSync(input+'/ApplicationSummary.json');
let applicationSummary;

try {
  applicationSummary = JSON.parse(rawdata);

  console.log("CARL Report Maker ("+version+") initialized!")
  console.log("Starting "+applicationSummary["Application Name"]+' report...');
}
catch(error) {
  console.error(error);
  process.exit(1);
}

// read the results by QRs json file
let byQRsData = [];
let readInterfaces = [];
let readInterfaceIndexes = [];
let readInterfaceFilePaths = [];
let allScannedFiles = [];

let closedInterfaces = 0;
let allBookmarksByRuleId = {};
let dataflowRuleId = {}; // rule ID -> [internal ID]

let fileresultPaths = []

// save bookmark from rule using path (dataflow) technics
const resultsWithPath = path.join(input+"/resultWithPath")
files = fs.readdirSync(resultsWithPath);

files.forEach(function(file) {

   let byQRResults;

    try {

      //console.log("resultWithPath start parsing "+file);

      let byFileRawdata = fs.readFileSync(path.join(resultsWithPath,file));
      byQRResults = JSON.parse(byFileRawdata);
    }
    catch(error) {

        console.log("Cannot parse "+file+ " as json...");
        //console.error(error);
        //process.exit(1);
    }

    if(byQRResults) {

      var violationId = byQRResults["ViolationId"]
      var violationInternalId = byQRResults["ID"]

        if(violationId) {
          var bookmarks = [];
          var internalIDs = [];

          try {
            internalIDs = dataflowRuleId[violationId];
          }
          catch(error) {
            console.log("dataflowRuleId no previous table for "+violationId);
          }

          if(!internalIDs) {
            internalIDs = [];
          }

          internalIDs.push(violationInternalId);
          dataflowRuleId[violationId] = internalIDs;

          //console.log(dataflowRuleId);

          var violationbookmarks = byQRResults["bookmarks"];
          //console.log("adding "+violationbookmarks.length+" bookmarks");

          violationbookmarks.forEach((violationbookmark, i) => {

              bookmarks.push({"file":violationbookmark["path"],"ID":violationInternalId,"bookmark":violationbookmark,"step":violationbookmark["step"],"codes":[]});


            if(allScannedFiles.indexOf(violationbookmark["path"])==-1) {

              //console.log("BEFORE:"+violationbookmark["file"]);
              allScannedFiles.push(violationbookmark["path"])
            }
          });

          var existingbookmarks = []

          try {
            existingbookmarks = allBookmarksByRuleId[violationId];
          }
          catch(error) {

          }
          if(existingbookmarks) {
            if(existingbookmarks.length > 0) {
              bookmarks = existingbookmarks.concat(bookmarks)
            }
          }

          allBookmarksByRuleId[violationId] = bookmarks;
        }
    }
});

// save bookmark from rule using other technics
const resultsByFilePath = path.join(input+"/resultByQualityRule")
files = fs.readdirSync(resultsByFilePath);


files.forEach(function(file) {

  // check if we have a sub-folder
  let filePathToCheck = path.join(resultsByFilePath,file)

  console.log("Path to check:"+filePathToCheck);
  
  try {
    if(fs.lstatSync(filePathToCheck).isDirectory()) {

      console.log("folder detected:"+filePathToCheck);
      let subfiles = fs.readdirSync(filePathToCheck);
      subfiles.forEach(function(subfile) {

        let subfilePathToCheck = path.join(filePathToCheck,subfile)

        if(subfilePathToCheck.endsWith('.json'))
        {
          fileresultPaths.push(subfilePathToCheck);
        }
      });
    }
    else {
      console.log("we can proceed "+filePathToCheck);
      fileresultPaths.push(filePathToCheck);
    }
  }
  catch(e) {
  }
});

console.log("Number of result file to investigate: "+fileresultPaths.length)

fileresultPaths.forEach(function(fileResultPath) {

  // let scan file by file and regroup the information by rule id for rendering
  //
  // rule id => file => (primary) bookmarks -> associated bookmarks

  let byQRResults;

  try {

    //console.log("resultByQualityRule start parsing "+file);

    let byFileRawdata = fs.readFileSync(fileResultPath);
    byQRResults = JSON.parse(byFileRawdata);
  }
  catch(error) {

      console.log("Cannot parse "+fileResultPath+ " as json...");
      //console.error(error);
      //process.exit(1);
  }

  if(byQRResults) {

    //console.log(file+" : investigate the results...");

    var violationList = byQRResults["ViolationList"];

    if(violationList == undefined) // no longer as list format but there is only one rule per file
    {

      violationList = [byQRResults]
    }

    violationList.forEach((item, i) => {

        if(item["ViolationId"]) {
          var bookmarks = [];

          if(Object.keys(allBookmarksByRuleId).indexOf(item["ViolationId"])!=-1) {
            bookmarks = allBookmarksByRuleId[item["ViolationId"]];
          }
          else {
            allBookmarksByRuleId[item["ViolationId"]] = bookmarks;
          }

          var violations = item["Violations"];
          violations.forEach((violationitem, i) => {

            var violationbookmarks = violationitem["bookmarks"];
            //console.log("adding "+violationbookmarks.length+" bookmarks");

            violationbookmarks.forEach((violationbookmark, i) => {

              //console.log("file:"+violationbookmark["file"]);
              // bookmark structure
              // lineStart colStart
              // lineEnd colEnd
              bookmarks.push({"file":violationbookmark["file"],"bookmark":violationbookmark,"associatedbookmark":0,"codes":[]});

              //console.log(typeof violationbookmark["file"]);

              if(allScannedFiles.indexOf(violationbookmark["file"])==-1) {

                //console.log("BEFORE:"+violationbookmark["file"]);
                allScannedFiles.push(violationbookmark["file"])
              }
            });

            // manage associated bookmark
            /*var associatedviolationbookmarks = violationitem["associated-bookmarks"];
            if(associatedviolationbookmarks) {
              console.log(associatedviolationbookmarks);
              associatedviolationbookmarks.forEach((violationbookmark, i) => {

                // assoicated  bookmark flag
                // file reference
                bookmarks.push({"file":violationbookmark["associated-bookmark-file-name"],"associatedbookmark":1,"codes":[],"ID":violationitem["ID"]});
              });
            }*/
      });
      }
    });
  }
});

console.log("Results have been processed...")
console.log("Let scan the "+allScannedFiles.length+" source code files to get the bookmarks");

// get the snippets of code for each bookmark found
allScannedFiles.forEach((thefile,i) => {

    //process.exit(1);

    var readInterface;

    try {
      // we are going to scan the file and keep the bookmarked code

      if(thefile.startsWith('[') && thefile.endsWith(']')) {
        thefile = thefile.slice(1,-1);
      }

      //console.log(thefile);

      readInterface = readline.createInterface({
        input: fs.createReadStream(thefile)
      });

      readInterfaces.push(readInterface);
      readInterfaceIndexes.push(0);
      readInterfaceFilePaths.push(thefile);
    }
    catch(error) {
      console.log(thefile+" cannot be found:"+error);
    }

    //console.log("readInterfaceIndexes:"+readInterfaceIndexes.length);

    //process.exit(1)
    readInterface.on('line', function(line) {

      var interfaceIndex = readInterfaces.indexOf(readInterface);

      var lineindex = readInterfaceIndexes[interfaceIndex];
      lineindex = lineindex+1;
      readInterfaceIndexes[interfaceIndex] = lineindex;
      var filepath = readInterfaceFilePaths[interfaceIndex];

      //console.log("read line "+lineindex+" of "+filepath);

      Object.keys(allBookmarksByRuleId).forEach((ruleid, i) => {

        //console.log("BEFORE:"+allBookmarksByRuleId[ruleid].length);

        allBookmarksByRuleId[ruleid].forEach((bookmarkfile, i) => {

          //console.log(bookmarkfile["file"]);

          if(bookmarkfile["file"]===filepath) {

            if(Object.keys(bookmarkfile).indexOf("associatedbookmark")!=-1)
            {
              var associated = bookmarkfile["associatedbookmark"];
              if(associated == 0) {
                var realBookmark = bookmarkfile["bookmark"];

                if((lineindex >= realBookmark["lineStart"]) && (lineindex <= realBookmark["lineEnd"])) {

                  bookmarkfile["codes"].push([lineindex,line]);
                }
              }
              else {

              }
            }
            else if(Object.keys(bookmarkfile).indexOf("step")!=-1) {

              var step = bookmarkfile["step"];

              var realBookmark = bookmarkfile["bookmark"];
              if((lineindex >= realBookmark["lineStart"]) && (lineindex <= realBookmark["lineEnd"])) {

                bookmarkfile["codes"].push([lineindex,line]);
              }
            }
            else {

            }
          }
        });
      });

    }).on('close', function() {

      closedInterfaces = closedInterfaces+1;

      // last file has been parsed and snippet of code has been copied, we can now generate the report
      if(readInterfaces.length == closedInterfaces)
      {
        //console.log(allBookmarksByRuleId);

        //console.log("allBookmarks:"+Object.keys(allBookmarksByRuleId).length);

        //console.log(allBookmarksByRuleId['7740']);

        // start the document here

        setupDocument();

        // generate the output based on the report
        if(report!="") {

          someDescriptions = "";
          try {
            someDescriptions = template.templatedescriptions;
          }
          catch(error) {
            // do nothing
          }

          generateSecurityReport(template.templatetitle,template.templatetags,template.templateheaders,someDescriptions,allBookmarksByRuleId,dataflowRuleId);
        }
        else {
          generateBasicReport(allBookmarksByRuleId,dataflowRuleId);
        }

        finalizeDocument();
      }
    });
});

const stylecss = " \
body { height:100%; font-family: sans-serif, Arial; } \
h1,h2,h3,h4,h5,h6 {margin-top: 20px; margin-bottom: 6px;} \
.nofindings { color: #909090; } \
table { width: 100%; } \
table, th, td { \
  border: 1px solid black; border-collapse: collapse; padding: 4px; align:left; }\
tbody tr:nth-child(even) { \
  background-color: #f5f5f5; } \
tbody tr { \
    font-size: 14px; \
    color: #101010; \
    line-height: 1.2; \
    font-weight: unset; \
}\
code { padding: 8px; font-size: 13px; line-height: 1.6;}\
.codetable { display: inline-block; width: 100%;} \
.codetablerow { display: inline-block; width: 100%; line-height: 1.6; } \
.codetablelineindexcell {  text-align: right; width: 60px; float: left; font-size: 13px; background-color: #333333; color: #BBB; padding-right: 4px; } \
.codetablelinecell {  text-align: left; float: left; background-color: #333333; color: white; } \
.codetablelinepathcell { text-align: center; color: #BBB; float: left; width: 24px; margin-left:4px; margin-right:4px;} \
.stepnumber { padding: 0px; margin: 4px; display: inline-block; border-radius: 50%; border-color: black; background-color: #BBB; min-width: 24px; line-height: 24px; text-align: center; } \
.flowpath { padding-left: 8px; padding-top:2px; margin-bottom: 8px; background-color: #EEE; border-radius: 8px; } \
}";

const fonts = {
  CourierBold: require('pdfjs/font/Courier-Bold.js'),
  CourierBoldOblique: require('pdfjs/font/Courier-BoldOblique.js'),
  CourierOblique: require('pdfjs/font/Courier-Oblique.js'),
  Courier: require('pdfjs/font/Courier.js'),
  HelveticaBold: require('pdfjs/font/Helvetica-Bold.js'),
  HelveticaBoldOblique: require('pdfjs/font/Helvetica-BoldOblique.js'),
  HelveticaOblique: require('pdfjs/font/Helvetica-Oblique.js'),
  Helvetica: require('pdfjs/font/Helvetica.js'),
  Symbol: require('pdfjs/font/Symbol.js'),
  TimesBold: require('pdfjs/font/Times-Bold.js'),
  TimesBoldItalic: require('pdfjs/font/Times-BoldItalic.js'),
  TimesItalic: require('pdfjs/font/Times-Italic.js'),
  TimesRoman: require('pdfjs/font/Times-Roman.js'),
  ZapfDingbats: require('pdfjs/font/ZapfDingbats.js'),
}

const paddingOptions = { paddingBottom: 0.5*pdf.cm, paddingTop: 0.5*pdf.cm };
const overallCodeOptions = { backgroundColor: 0x000000 };
const paddingBottomOptions = { paddingBottom: 0.5*pdf.cm };
const paddingTopOptions = { paddingTop: 0.3*pdf.cm };
const codeOptions = {font: fonts.Courier, color: 0xFFFFFF  };
const bookmarkOptions = { color: 0xFACD5C };
const bookmarkPaddingOptions = { paddingLeft: 0.4*pdf.com };
const stepOptions = { font: fonts.HelveticaBold, paddingBottom: 0.5*pdf.cm };

const h1 = { fontSize: 24, font: fonts.HelveticaBold };
const h2 = { fontSize: 18, font: fonts.HelveticaBold };
const h3 = { fontSize: 16, font: fonts.HelveticaBold };
const h4 = { fontSize: 14, font: fonts.HelveticaBold };
const paragraphFormat = {fontSize: 11, color: "#AAAAAA"};
const boldFormat = {fontSize: 11, font: fonts.HelveticaBold};
const regularFormat = {fontSize: 11, font: fonts.Helvetica};


function generateSecurityReport(reporttitle, categoriesObjects, headers, descriptions, allBookmarksByRuleId,dataflowRuleId) {

  console.log("==== Security Report "+report+" ====");

  const isHTML = (format == 'HTML');

  var resultTags = applicationSummary["Classify by tag"];

  // 1 - prepare the main and basic information
  if(isHTML) {
    doc.write('<h3>CAST Security Report</h3>');
    doc.write('<h4>'+reporttitle+'</h4>');
    doc.write('<table><tr>');

    headers.forEach((item, i) => {
      doc.write('<th>'+item+'</th>');
    });

    doc.write('</tr>');
  }
  else {
    doc.cell(paddingBottomOptions).text('CAST Security Report',h3);
    doc.cell(paddingBottomOptions).text(reporttitle,h4);

    var widths = [null];
    for(c=1; c<headers.length-1; c++) {
      widths.push(70);
    }
    widths.push(60);

    var table = doc.table({
          widths: widths,
          borderHorizontalWidths: function(i) { return i < 2 ? 1 : 0.1 },
          padding: 5})

    var tr = table.header({ font: fonts.HelveticaBold, fontSize: 9, borderBottomWidth: 1.5 })

    headers.forEach((item, i) => {
      tr.cell(item);
    });
  }

  // prepare data with key-value mapping by reviewing all categories
  for(k = 0; k < resultTags.length; k++)
  {
      var tagName = resultTags[k]["Tag Name"];
      var nbViolation = resultTags[k]["Number of violation"];

      for (let [key, value] of Object.entries(categoriesObjects)) {

        if(value["id"]==tagName) {
          value["nbviolation"] =  nbViolation;
        }
      }
  }

  // 2 - build the overall table view of violations per security category
  // this section can include predefined column coming from the template
  Object.keys(categoriesObjects).forEach(k => {

    var customs;
    try{
      customs = categoriesObjects[k]["custom"];
    }
    catch(error) {
      // no custom but this is not mandatory
    }

    if(isHTML) {
      if(categoriesObjects[k]["applicable"]=="1") {
        doc.write('<tr><td>'+categoriesObjects[k].name+'</td>');

        if(customs)
        {
          var allKeys = Object.keys(customs);
          for(p=0;p<allKeys.length; p++)
          {
            var block = customs[allKeys[p]];
            doc.write('<td bgColor="'+block["backgroundColor"]+'">'+block["title"]+'</td>')
          }
        }

        doc.write('<td with="80" align="right">'+categoriesObjects[k].nbviolation.toString()+'</td></tr>');
      }
      else {
        doc.write('<tr><td class="nofindings">'+categoriesObjects[k].name+'</td>');
        if(customs)
        {
          var allKeys = Object.keys(customs);
          for(p=0;p<allKeys.length; p++)
          {
            var block = customs[allKeys[p]];
            doc.write('<td bgColor="'+block["backgroundColor"]+'">'+block["title"]+'</td>')
          }
        }
        doc.write('<td with="80" align="right">N/A</td></tr>');
      }
    }
    else {
      var row = table.row()
      if(categoriesObjects[k]["applicable"]=="1") {
        row.cell(categoriesObjects[k].name);

        if(customs)
        {
          var allKeys = Object.keys(customs);
          for(p=0;p<allKeys.length; p++)
          {
            var block = customs[allKeys[p]];
            row.cell(block["title"],{'backgroundColor':block["backgroundColor"]});
          }
        }

        row.cell(categoriesObjects[k].nbviolation.toString(),{textAlign:'right'});
      }
      else {
        row.cell(categoriesObjects[k].name,{color: "#CCCCCC"});

        if(customs)
        {
          var allKeys = Object.keys(customs);
          for(p=0;p<allKeys.length; p++)
          {
            var block = customs[allKeys[p]];
            row.cell(block["title"],{'backgroundColor':block["backgroundColor"]});
          }
        }

        row.cell("N/A",{textAlign:'right',color: "#CCCCCC"});
      }
    }
  });

  if(isHTML) {
    doc.write('</table>');
  }


  // 3 - Display details per security category
  Object.keys(categoriesObjects).forEach(k => {

    currentRuleIdsWithViolations = [];

    if(isHTML) {
      doc.write('<h4>'+categoriesObjects[k].name+'</h4>');
    }
    else {
      doc.pageBreak();
      doc.cell(paddingOptions).text(categoriesObjects[k].name,h4);
    }

    // description of category
    if(descriptions)
    {
      if(isHTML) {
        doc.write("<p>"+descriptions[k].description+"</p>");
      }
      else {
        doc.cell(paddingOptions).text(descriptions[k].description);
      }
    }

    var theCategoryId = categoriesObjects[k].id;
    var hasFindings = 0;

    for(j = 0; j < resultTags.length; j++) {

          //some findings could be displayed
          if(theCategoryId == resultTags[j]["Tag Name"]) {
            hasFindings = 1
            addDetails(resultTags[j]["Details"]);

            var results = resultTags[j]["Details"];
            results.forEach( (quickresult,index) => {
              currentRuleIdsWithViolations.push(quickresult["Violation Id"])
            });


            console.log(theCategoryId);
            console.log(currentRuleIdsWithViolations.length + " rules" );
            console.log(currentRuleIdsWithViolations );
          }
    }

    if(hasFindings == 0) {

      if(isHTML) {

        doc.write("<p class='nofindings'>No findings</p>");
      }
      else {

        doc.text("No findings",paragraphFormat);
      }
    }
    else {

      //console.log(currentRuleIdsWithViolations);

      currentRuleIdsWithViolations.forEach((ruleid, i) => {

        var alreadyPrinted = 0;
        var violationIds = dataflowRuleId[ruleid];


        if(isHTML) {

          if(violationIds) {
            doc.write("<p><b>"+ruleid+" - "+violationIds.length+" Findings Flows</b></p>");
          }
          else {
            doc.write("<p><b>"+ruleid+" - Findings Bookmarks</b></p>");
          }
        }
        else {
          if(violationIds) {
            doc.cell(Object.assign({},boldFormat,paddingOptions)).text(ruleid+" - "+violationIds.length+" Findings Flows");
          }
          else {
            doc.cell(Object.assign({},boldFormat,paddingOptions)).text(ruleid+" - Findings Bookmarks");
          }
        }

        // each rule has several bookmarks
        var allQRBookmarks = allBookmarksByRuleId[ruleid];

        generateBookmarksOutput(allQRBookmarks,violationIds);

      });
    }
  });
}

function generateBasicReport(allBookmarksByRuleId,dataflowRuleId) {

  console.log("==== Basic Report "+report+" ====");

  const isHTML = (format == 'HTML');
    
  // 1 - prepare the main and basic information
  if(isHTML) {

      doc.write('<h3>Quality Report</h3>');
      doc.write('<h4>By Health Factors</h4>');
  }
  else {
      doc.text('Quality Report',h3);
      doc.text('By Health Factors',h4);
  }


  let rawdata = fs.readFileSync(input+'/categories.json');
  let categoriesOutput;

  try {
      categoriesOutput = JSON.parse(rawdata);

      //console.log("categoriesOutput="+categoriesOutput.length);
  }
  catch(error) {
      console.error(error);
  }

  if(isHTML) {

  doc.write('<table><tr><th>ID</th><th>Category</th><th align="right"># Violations</th></tr>')
  }
  else {

  var table = doc.table({
      widths: [50, null, 200],
      borderHorizontalWidths: function(i) { return i < 2 ? 1 : 0.1 },
      padding: 5
  })

  var tr = table.header({ font: fonts.HelveticaBold, borderBottomWidth: 1.5 })
    tr.cell('ID')
    tr.cell('Category')
    tr.cell('# Violations', { textAlign: 'right' })
  }

  // 2 - include all the number of violations per health factors
  for(j=0; j<categoriesOutput.length; j++) {

      //console.log("category="+categoriesOutput[j]["category"]+" with "+categoriesOutput[j]["totalViolations"]+" violations");

      if(isHTML) {
        doc.write('<tr><td width="80">'+categoriesOutput[j]["id"].toString()+'</td>');
        doc.write('<td>'+categoriesOutput[j]["category"]+'</td>');
        doc.write('<td width="140" align="right">'+categoriesOutput[j]["totalViolations"].toString()+'</td></tr>');
      }
      else {
        var row = table.row()
        row.cell(categoriesOutput[j]["id"].toString());
        row.cell(categoriesOutput[j]["category"]);
        row.cell(categoriesOutput[j]["totalViolations"].toString(),{textAlign:'right'});
      }
  }

  if(isHTML) {
    doc.write('</table>');
  }
    
  // 3 - Display details per security
  for(j=0; j<categoriesOutput.length; j++) {

    var listOfRulesArray = categoriesOutput[j]["listOfRules"];

    if(isHTML) {

      doc.write('<h3>'+categoriesOutput[j]["category"]+" details</h3>")
      doc.write('<table width="100%"><tr><th>ID</th><th>Rule Name</th><th align="right"># Violations</th>')

      for(k=0; k<listOfRulesArray.length; k++)
      {
        doc.write('<tr><td width="80">'+listOfRulesArray[k]["id"].toString()+'</td>');
        doc.write('<td>'+listOfRulesArray[k]["violationName"]+'</td>');
        doc.write('<td width="140" align="right">'+listOfRulesArray[k]["violationCount"].toString()+'</td></tr>');
      }

      doc.write('</table>');
    }
    else {

      doc.pageBreak();

      doc.text(categoriesOutput[j]["category"]+" details",h3)
      var cattable = doc.table({
          widths: [80, null, 200],
          borderHorizontalWidths: function(i) { return i < 2 ? 1 : 0.1 },
          padding: 5
      })

      var tr = cattable.header({ font: fonts.HelveticaBold, borderBottomWidth: 1.5 })
        tr.cell('ID')
        tr.cell('Rule Name')
        tr.cell('# Violations', { textAlign: 'right' })


      for(k=0; k<listOfRulesArray.length; k++)
      {
        var row = cattable.row()
        row.cell(listOfRulesArray[k]["id"].toString());
        row.cell(listOfRulesArray[k]["violationName"]);
        row.cell(listOfRulesArray[k]["violationCount"].toString(),{textAlign:'right'});

      }
    }
      
    for(k=0; k<listOfRulesArray.length; k++)
    {
        var ruleid = listOfRulesArray[k]["id"];
        
        // each rule has several bookmarks
        var violationIds = dataflowRuleId[ruleid];

         if(isHTML) {

          if(violationIds) {
            doc.write("<p><b>"+ruleid+" - "+violationIds.length+" Findings Flows</b></p>");
          }
          else {
            doc.write("<p><b>"+ruleid+" - Findings Bookmarks</b></p>");
          }
        }
        else {
          if(violationIds) {
            doc.cell(Object.assign({},boldFormat,paddingOptions)).text(ruleid+" - "+violationIds.length+" Findings Flows");
          }
          else {
            doc.cell(Object.assign({},boldFormat,paddingOptions)).text(ruleid+" - Findings Bookmarks");
          }
        }

        // print the code snippets for all bookmarks
        var allQRBookmarks = allBookmarksByRuleId[ruleid];

        generateBookmarksOutput(allQRBookmarks,violationIds);
    }
  }
}

/*
 *  Internal useful functions
 */

/* Generate code snippets from bookmarks */
function generateBookmarksOutput(allQRBookmarks,violationIds) {
    
    const isHTML = (format == 'HTML');
    const MARKSTARTPLACEHOLDER = "!MARK!";
    const MARKENDPLACEHOLDER = "!/MARK!";

    if(allQRBookmarks) {

      var currentStepID = -1

      allQRBookmarks.forEach((qrBookmark, j) => {

        var step = qrBookmark["step"];
        var stepID = qrBookmark["ID"];
        var bookmark = qrBookmark["bookmark"];
        var allCodes = qrBookmark["codes"];

        if(stepID) {
          if(isHTML) {

            if(stepID!=currentStepID) {

              if(currentStepID!=-1) {
                doc.write("</div></div>"); // from previous block created.
              }

              currentStepID = stepID;
              doc.write("<div class='flowpath'><p><b>Finding #"+(1+violationIds.indexOf(stepID))+"</b></p><div class='codetable'>");
            }

            doc.write("<div class='stepbookmark'><div class='stepnumber'>"+(1+step)+"</div>");
          }
          else {
            if(stepID!=currentStepID) {
              currentStepID = stepID;
              doc.cell(Object.assign({},boldFormat,paddingOptions)).text("Finding #"+(1+violationIds.indexOf(stepID)));
            }
          }
        }
        else {

          if(isHTML) {
            if(currentStepID!=-1) {
              doc.write("</div></div>"); // from previous block created.
            }
            doc.write("<p>");
          }

          currentStepID = -1;
        }

        if(bookmark && allCodes) {

          if(isHTML) {

            doc.write(qrBookmark["file"]+" starts at line: "+bookmark["lineStart"]+"&nbsp;("+bookmark["colStart"]+") and ends at line:&nbsp;"+bookmark["lineEnd"]+"&nbsp;("+bookmark["colEnd"]+")");

            //doc.write("<div class='codetable'>");

            allCodes.forEach((thecode, i) => {

                var thelineindex = thecode[0];
                var theline = thecode[1];

                const colStart = parseInt(bookmark["colStart"]);
                const colEnd = parseInt(bookmark["colEnd"]);

                
            if((i==0) && i==(allCodes.length-1)) {
                theline = theline.substring(0,colStart)+MARKSTARTPLACEHOLDER+theline.substring(colStart,colEnd)+MARKENDPLACEHOLDER+theline.substring(colEnd);
            }
            else if(i==0) {
              theline = theline.substring(0,colStart)+MARKSTARTPLACEHOLDER+theline.substring(colStart)+MARKENDPLACEHOLDER;
            }
            else if(i==(allCodes.length-1)) {
              theline = MARKSTARTPLACEHOLDER+theline.substring(0,colEnd)+MARKENDPLACEHOLDER+theline.substring(colEnd);
            }
            else {
                theline = MARKSTARTPLACEHOLDER+theline+MARKENDPLACEHOLDER;
            }

            //console.log("BEFORE:"+theline);

            theline = theline.replace(new RegExp('&','g'),'&amp;');
            theline = theline.replace(new RegExp('\t','g'),'&nbsp;');
            theline = theline.replace(new RegExp('<','g'),'&lt;');
            theline = theline.replace(new RegExp('>','g'),'&gt;');
            theline = theline.replace(new RegExp(MARKSTARTPLACEHOLDER,'g'),'<mark>');
            theline = theline.replace(new RegExp(MARKENDPLACEHOLDER,'g'),'</mark>');

            doc.write("<div class='codetablerow'>");
            if(stepID) {
              doc.write("<div class='codetablelinepathcell'>|</div>");
            }
            doc.write("<div class='codetablelineindexcell'>"+thelineindex+"</div>");
            doc.write("<div class='codetablelinecell'><code>"+theline+"</code></div>");
            doc.write("</div>");
          });

        doc.write("</div>");
        }
        else {

          if(stepID) {
            doc.cell(paddingTopOptions).text("Step #"+(1+step)+" > ",stepOptions).append(qrBookmark["file"]+" starts at line: "+bookmark["lineStart"]+" ("+bookmark["colStart"]+") and ends at line: "+bookmark["lineEnd"]+" ("+bookmark["colEnd"]+")",regularFormat);

          }
          else {
            doc.cell(paddingTopOptions).text(qrBookmark["file"]+" starts at line: "+bookmark["lineStart"]+" ("+bookmark["colStart"]+") and ends at line: "+bookmark["lineEnd"]+" ("+bookmark["colEnd"]+")",paddingOptions);
          }

          // foreach bookmark we must have some pieces of code to display
          allCodes.forEach((thecode, i) => {

            var thelineindex = thecode[0];
            var theline = thecode[1];
            const colStart = parseInt(bookmark["colStart"]);
            const colEnd = parseInt(bookmark["colEnd"]);

            // comparison with prebuilt line
            //doc.cell(paddingOptions).text(thelineindex+":"+theline,codeOptions);


            if((i==0) && (i==(allCodes.length-1))) {

              var bookmarkfirstpart = theline.substring(0,colStart);
              var lastchar = bookmarkfirstpart.charAt(bookmarkfirstpart.length-1)
              var completeChar = "";

              if(lastchar!="(") {
                completeChar = " ";
              }

              doc.cell(overallCodeOptions).text(codeOptions).append(thelineindex+":").append(bookmarkfirstpart).append(completeChar+theline.substring(colStart,colEnd), bookmarkOptions).append(theline.substring(colEnd));
            }
            else if(i==0) {
                doc.cell(overallCodeOptions).text(codeOptions).append(thelineindex+":").append(theline.substring(0,colStart)).append(theline.substring(colStart),bookmarkOptions);
            }
            else if(i==(allCodes.length-1)) {
              doc.cell(overallCodeOptions).text(codeOptions).append(thelineindex+":").append(theline.substring(0,colEnd),bookmarkOptions).append(theline.substring(colEnd));
            }
            else {
                doc.cell(overallCodeOptions).text(codeOptions).append(thelineindex+":").append(theline,bookmarkOptions);
            }
          });
        }
        }

      });

      if(isHTML) {

        if(currentStepID!=-1) {
          doc.write("</div></div>");
        }
      }
    }
}

function addDetails(somedetails) {

  const isHTML = (format == 'HTML');

  if(somedetails.length>0) {

        if(isHTML) {
          doc.write('<table><tr><th>ID</th><th>Name</th><th># Violations</th></tr>')

        }
        else {
          var table = doc.table({
                    widths: [80, null, 200],
                    borderHorizontalWidths: function(i) { return i < 2 ? 1 : 0.1 },
                    padding: 5
          })

          var tr = table.header({ font: fonts.HelveticaBold, borderBottomWidth: 1.5 })
          tr.cell('ID')
          tr.cell('Name')
          tr.cell('# Violations', { textAlign: 'right' })
        }

          for(detailsj=0; detailsj<somedetails.length; detailsj++) {

            if(isHTML)
            {
              doc.write('<tr><td width="80">'+somedetails[detailsj]["Violation Id"].toString()+'</td>');
              doc.write('<td>'+somedetails[detailsj]["Violation Name"]+'</td>');
              doc.write('<td align="right" width="140">'+somedetails[detailsj]["Number of violation"].toString()+'</td></tr>');

            }
            else {
              var row = table.row()
              row.cell(somedetails[detailsj]["Violation Id"].toString());
              row.cell(somedetails[detailsj]["Violation Name"]);
              row.cell(somedetails[detailsj]["Number of violation"].toString(),{textAlign:'right'});

            }
          }

          if(isHTML) {
            doc.write('</table>');
          }

    }
    else { // no findings

        if(isHTML) {
          doc.write("<p class='nofindings'>No findings</p>");
        }
        else {
          doc.text("No findings",paragraphFormat);
        }
    }
}

function setupDocument() {

  if(format == "PDF") {
    console.log('Report Maker create a new PDF document...');
    doc = new pdf.Document({
      font:    fonts.Helvetica,
      padding: 10
    });

    doc.pipe(fs.createWriteStream(output));

    doc.footer()
       .pageNumber(function(curr, total) { return curr + ' / ' + total }, { textAlign: 'center' })

    // common part
    const logocast = fs.readFileSync('cast.jpg');
    const logoImgCast = new pdf.Image(logocast);

    var cell = doc.cell({ paddingBottom: 0.5*pdf.cm })
    cell.image(logoImgCast, { height: 0.70*pdf.cm , align: 'right'})

    cell.text(applicationSummary["Application Name"], h1)
    //cell.text.br()
    cell.text("Analysis date: "+applicationSummary["Analysis date"])
    cell.text("Number of Files: "+applicationSummary["Total count of Files"])
    cell.text("Number of Rules: "+applicationSummary["Total number of rules"])

    doc.cell(paddingOptions).text('Report generated by CARL Report ('+version+')');

  }
  else {
    console.log('Report Maker create HTML document...');

    doc = fs.createWriteStream(output);

    // common part
    doc.write("<html><head><style>"+stylecss+"</style></head><body>");

  /*  const logocast = fs.readFileSync('cast.jpg');
    const logoImgCast = new pdf.Image(logocast);

    var cell = doc.cell({ paddingBottom: 0.5*pdf.cm })
    cell.image(logoImgCast, { height: 0.25*pdf.cm , align: 'right'})*/

    doc.write("<h1>"+applicationSummary["Application Name"]+"</h1>");
    doc.write("<ul><li>Analysis date:&nbsp;"+applicationSummary["Analysis date"]+"</li>");
    doc.write("<li>Number of Files:&nbsp;"+applicationSummary["Total count of Files"]+"</li>");
    doc.write("<li>Number of Rules:&nbsp;"+applicationSummary["Total number of rules"]+"</li></ul>");

    doc.write('<p><i>Report generated by CARL Report ('+version+')</i></p>');
  }
}

function finalizeDocument() {

  console.log('Document to be saved!');

  if(report == 'HTML') {
      doc.write("</body></html>");
  }

  try {
    doc.end();
  }
  catch(error) {
    console.log("Cannot close the document "+error);
    process.exit(1);
  }
}
