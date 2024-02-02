#!/usr/bin/env node

import { program } from 'commander';
import { convertArticleToMarkdown, getArticleFromDom } from './background.js';
import fetch from 'node-fetch';
import afterLoad from 'after-load';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, URL } from 'url';
import { dirname } from 'path';

const currentModuleUrl = import.meta.url;
const currentModulePath = fileURLToPath(currentModuleUrl);
const currentModuleDir = (process.pkg) ? process.cwd():dirname(currentModulePath);

// var stdin = process.stdin;
// if (process.argv.length === 2) {
//   process.argv.push('md "' + stdin + '"')
// }
// var content = await convertArticleToMarkdown(await getArticleFromDom(stdin??"<html><body><h1>Hello</h1></body></html>"));
// console.log(content);
program
  .version('1.0.0')
  .description('A string processing command-line utility');


// program
//   .command('<text>')
//   .alias('markdown')
//   .description('Converts the html to markdown')
//   .action(async (text) => {
//     var result = await convertArticleToMarkdown(await getArticleFromDom(stdin ?? "<html><body><h1>Hello</h1></body></html>"));
//     console.log(result);
//   });

function trim(str, ch) {
  var start = 0, 
      end = str.length;

  while(start < end && str[start] === ch)
      ++start;

  while(end > start && str[end - 1] === ch)
      --end;

  return (start > 0 || end < str.length) ? str.substring(start, end) : str;
}

const cleanInput = (s) => { 
  return trim(trim(s, '"'), "'").trim();
}

function isValidURL(string) {
  var res = string.match(/(http(s)?:\/\/.)(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
  return (res !== null)
};

const stringIsAValidUrl = (s) => {
  s = cleanInput(s);
  try {
    new URL(s);
    return true && isValidURL(s);
  } catch (err) {
    return false;
  }
};

function isValidHttpUrl(str) {
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return !!pattern.test(str);
}

// afterLoad("https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url", function(html){
//   console.log(html);
// });

program.action(async (text, options) => {
  // Read from stdin
  if (!options.args.length) {
    let inputData = '';

    process.stdin.setEncoding('utf-8');

    process.stdin.on('readable', () => {
      const chunk = process.stdin.read();
      if (chunk !== null) {
        inputData += chunk;
      }
    });

    process.stdin.on('end', async () => {
      text = cleanInput(inputData);
      if (stringIsAValidUrl(text)) {
        // console.log("Url: " + text);
        text = await fetch(text).then(res => res.text());
      }
      text = `<html><body><div>${text}</div></body></html>`;
      var result = await convertArticleToMarkdown(await getArticleFromDom(text));
      console.log(result.markdown);
    });
  } else {
    text = cleanInput(options.args.join(" "));
    if (stringIsAValidUrl(text)) {
      // console.log("Url: " + text);
      text = await fetch(text).then(res => res.text());
    } else { 
      // Check if the file exists
      // console.log("FilePath text: " + text);
      let filePath = text;
      try {
        fs.accessSync(filePath, fs.constants.F_OK);
      } catch (e) {
        filePath = path.join(currentModuleDir, text);
      }
      // console.log("FilePath: " + filePath);
      try {
        fs.accessSync(filePath, fs.constants.F_OK);
        text = fs.readFileSync(filePath, 'utf8');
      } catch (e) {
        text = `<html><body><div>${text}</div></body></html>`;
      }
    }
    var result = await convertArticleToMarkdown(await getArticleFromDom(text));
    console.log(result.markdown);
  }
});

// Add more commands as needed

program.parse(process.argv);
