//Run in google apps script, data will be out put to a spreadsheet
function renderTableau(){
  renderByKeyword("tableau");
}


function renderPowerBI(){
  renderByKeyword("powerbi");
}

function renderByKeyword(keyword){
   var today = makeTodayString();
   var sheetName = today + "_" + keyword;
   var sp = SpreadsheetApp.openById("YourSpreadS");
   var sheet = sp.getSheetByName(sheetName) || sp.insertSheet(sheetName);
    //clear once
   sheet.clear();
  //render measure names first
   var titleValues = [properties];
   renderValueIntoSheetByName(sheet, titleValues);
   
  //get all results
   var values = [];
  //concat all the results
   cities.forEach(function(cityId){
     //start fetch each city
     var i = 0;
     var result = getResultArray(i, cityId, keyword);
     values = values.concat(result);
     
     //if the result size is over 90 (have next page), continue getting next page
     while (result.length == 90) {
       i += 1;
       result = getResultArray(i, cityId, keyword);
       values = values.concat(result);
    }
  });
  
  //render all the results into sheet
  renderValueIntoSheetByName(sheet, values);

}

/*
*return {array} : array created from the response object
*@i {Integer} : result page number, index to start
*@cityId {string} : cityId
*@keyword{string} : keyword
*/
function getResultArray(i,cityId,keyword){
     Utilities.sleep(2000);  //sleep for 2 seconds
     var response = JSON.parse(UrlFetchApp.fetch(createKeywordSearchParams(i*90,cityId,keyword,-1)));
     //stop if there is an error
     if(response["code"] != 200){
       return;
     }
  
     var result = response["data"]["results"];
     if(result){
       var values =  result.map(function(job){
               //properties is globally defined
               return properties.map(function(prop){
                 if(prop.match(/\./)){
                   var subprops = prop.split(".");
                   return subprops.reduce(function(accumulator, currentValue) {
                     return accumulator[currentValue];
                   }, job);
                 }else{
                   return job[prop];
                 }
               })
       });
    }
    return values;
}



/*
*return {string} : the string used to fetch url
*@start {Integer} : number to start
*@cityId {Integer} : city ide
*@kw {string} : keyword
*@companyType {Integer} : 
*/
//jl=531&sf=0&st=0&kw=tableau&kt=3
function createKeywordSearchParams(start,cityId,kw,companyType) {
  var url = "https://fe-api.zhaopin.com/c/i/sou?";
  var optionParam = {
    'start': start,
    'pageSize': 90,
    'cityId': cityId,
    'salary': "0,0", //默认为0
    'workExperience': -1,
    'education': -1,
    'companyType': companyType,
    'employmentType' : -1,
    'jobWelfareTag': -1,
    'kw': kw,
    'kt': 3 //确认
  };

  for (keys in optionParam) {
    //encode value string
    var keyValueString = keys + "=" + encodeURIComponent(optionParam[keys]);
    (keys === "kt") ? (keyValueString += "") : (keyValueString += "&");
    url += keyValueString;
  }
  return url;
}


/*
*return : render value to sheets from last row
*@sheet {string} : sheet name
*@values {array} : values array
*/

function renderValueIntoSheetByName(sheet, values){
  if(sheet){
     var lastRow = sheet.getLastRow();
    if(values && values.length){
      sheet.getRange(lastRow + 1, 1, values.length, values[0].length).setValues(values);
    }
  }

}



function makeTodayString(){
   var now = Moment.moment().format('YYYY-MM-DD'); 
   return String(now);
}

