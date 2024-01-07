const fs = require("fs");
const config = require("./config");
const htmlCreator = require("html-creator");
const json2Table = require("json-to-table");
const marked = require("marked");
const path = require('path');
const { exec, execSync } = require('child_process');
const jsStringEscape = require('js-string-escape');

const isVarName =require( 'is-var-name');


//generate main page

const all_count = JSON.parse(fs.readFileSync(config.dev.count_json_dir + "/output_1.json"));

const tableHead = { type: 'tr', content: [{ type: 'th', content: 'Syscall' }, { type: 'th', content: 'Count' }, { type: 'th', content: 'Args' }] };

const tableArray = json2Table(all_count);




function syscallName2Link(str) {
  return [{ type: 'a', content: str, attributes: { href: './' + str + '.html', target: '_blank' }, }]
}

function getManSection(syscall_name, section_name) {

}



let tableBodies = [];

for (let i = 0; i < tableArray.length; i++) {
  tableBodies.push({ type: 'tr', content: [{ type: 'td', content: syscallName2Link(tableArray[i][0]) }, { type: 'td', content: tableArray[i][1] }, { type: 'td', content: tableArray[i][2] }] });



}
// console.log(tableBodies);
let tableContents = [];
tableContents.push(tableHead);
tableContents = tableContents.concat(tableBodies);

let table = { type: 'table', content: tableContents };

console.log(tableContents);

const html = new htmlCreator([
  { type: 'head', content: [{ type: 'title', content: 'Syscalls' }] },
  {
    type: 'body',
    attributes: { style: 'padding: 1rem' },
    content: [table]
  },
]);



if (!fs.existsSync(`${config.dev.outdir}`))
  fs.mkdirSync(`${config.dev.outdir}`);

fs.writeFile(
  `${config.dev.outdir}/index.html`,
  html.renderHTML(),
  e => {
    if (e) throw e;
    console.log(`index.html was created successfully`);
  }
);


// // generate per syscall details pages by md files

// if (!fs.existsSync(`${config.dev.outdir}`))
//   fs.mkdirSync(`${config.dev.outdir}`);

// let syscall_details_md_list = fs.readdirSync(config.dev.per_syscall_details_dir);
// for(let i=0;i<syscall_details_md_list.length;i++){
//   let mdFileUint8array = fs.readFileSync(config.dev.per_syscall_details_dir+"/"+syscall_details_md_list[i]);
//   let mdFileString = new TextDecoder().decode(mdFileUint8array);



//       fs.writeFile(
//         `${config.dev.outdir}/${path.parse(syscall_details_md_list[i]).name}.html`,
//         marked.parse(mdFileString),
//         e => {
//           if (e) throw e;
//           console.log(`${syscall_details_md_list[i]}.html was created successfully`);
//         }
//       );

// }


//generate per syscall details pages from json files
const entries_with_unique_first_arg = JSON.parse(fs.readFileSync(config.dev.count_json_dir + "/entries_with_unique_first_arg.json"));
const entries_with_empty_or_null_args = JSON.parse(fs.readFileSync(config.dev.count_json_dir + "/entries_with_empty_or_null_args.json"));
if (!fs.existsSync(`${config.dev.outdir}`))
  fs.mkdirSync(`${config.dev.outdir}`);


function findStringsDFS(obj) {

  if (typeof obj === 'string' || obj instanceof String) {// it's a string

    return [obj];
  }
  else if (Array.isArray(obj)) { //else if is arr

    let result = [];
    for (let i = 0; i < obj.length; i++) {
      result = result.concat(findStringsDFS(obj[i]));
    }
    return result;
  } else if (//else if is object
    typeof obj === 'object' &&
    !Array.isArray(obj) &&
    obj !== null
  ) {

    let result = [];
    for (const property in obj) {
      result = result.concat(findStringsDFS(obj[property]));
      //console.log(`${property}: ${object[property]}`);
    }
    return result;
  }
}

function preHTMLObj(str){
  return {type:'pre',content:str}
}

for (let i = 0; i < entries_with_unique_first_arg.length; i++) {


  
  
    let tokens = findStringsDFS(entries_with_unique_first_arg[i].args);
    console.log(tokens);
    let syscall_parameters=[];
    for (let j = 0; j < tokens.length; j++) {
      if(!isVarName(tokens[j])){
        continue;
      }
      let stdout = execSync(`man 2 ${entries_with_unique_first_arg[i].syscall} | grep -A 1000 -e "       ${tokens[j]}$" -e"       ${tokens[j]} " | awk '{if(/^$/||/^              /||/       ${tokens[j]}$/||/       ${tokens[j]} /)print;else exit}'`);
      console.log("SUCC: "+stdout);
        syscall_parameters.push({type:'pre',content:stdout.toString()});
        console.log(syscall_parameters.toString());
  }
  let null_parameters_example = [];
  for(let k=0;k<entries_with_empty_or_null_args.length;k++){
    if(entries_with_empty_or_null_args[k].syscall===entries_with_unique_first_arg[i].syscall){
      console.log(entries_with_empty_or_null_args[k]);
      null_parameters_example.push({type:'p',content:JSON.stringify(entries_with_empty_or_null_args[k].args)});
    }
  }

  let other_stuff =    [ {type:'h3',content:"Null Parameter Examples"},
  {type:'div',content:null_parameters_example},
  {type:'h3',content:"Complete Man Page"},
  {type:'pre',content:execSync(`man 2 ${entries_with_unique_first_arg[i].syscall}|cat`).toString().replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;')}
];
console.log(execSync(`man 2 ${entries_with_unique_first_arg[i].syscall}|cat`).toString());
  let syscallHtmlObj = [
    { type: 'head', content: [{ type: 'title', content: entries_with_unique_first_arg[i].syscall }] },
    {type:'h2',content:entries_with_unique_first_arg[i].syscall},
    {type:'h3',content:"Frequently Used Parameters"},
    {
      type: 'body',
      attributes: { style: 'padding: 1rem' },
      content: syscall_parameters.concat(other_stuff)
    },

  ];
  

  let htmlstr = (new htmlCreator(syscallHtmlObj)).renderHTML();
  console.log(htmlstr);
  fs.writeFile(
    `${config.dev.outdir}/${entries_with_unique_first_arg[i].syscall}.html`,
    htmlstr,
    e => {
      if (e) throw e;
      console.log(`${config.dev.outdir}/${entries_with_unique_first_arg[i].syscall}.html was created successfully`);
    }
  );
}


