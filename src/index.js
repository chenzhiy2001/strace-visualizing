const fs = require("fs");
const config = require("./config");
const htmlCreator = require("html-creator");

const json2Table = require("json-to-table");


const all_count = JSON.parse( fs.readFileSync(config.dev.count_json_dir+"/output_1.json") );

// { type: 'table', content: [{ type: 'td', content: 'I am in a table!' }] }

const tableHead = {type:'tr',content:[{type:'th',content:'Syscall'},{type:'th',content:'Count'},{type:'th',content:'Args'}]};

const tableArray = json2Table(all_count);



function syscallName2Link(str){
    return [{type:'a',content:str ,attributes: { href: './'+str+'.html', target: '_blank' },}]
}




let tableBodies = [];

for(let i = 0; i < tableArray.length;i++){
    tableBodies.push( {type:'tr',content: [ {type:'td',content:syscallName2Link(tableArray[i][0])},{type:'td',content:tableArray[i][1]},{type:'td',content:tableArray[i][2]} ]});
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



