let fs = require("fs");
let path = require("path");

let args = process.argv.slice(2);
let [userPath] = args;

// abbreviations -> name
let books = {
  GEN: "Genesis",
  "1KI": "1 Kings",
  "2KI": "2 Kings",
  "1CH": "1 Chronicles",
  "2CH": "2 Chronicles",
  EZR: "Ezra",
  NEH: "Nehemiah",
  EST: "Esther",
  JOB: "Job",
  PSA: "Psalms",
  PRO: "Proverbs",
  ECC: "Ecclesiastes",
  SOS: "Songs of Solomon",
  ISA: "Isaiah",
  JER: "Jeremiah",
  EXO: "Exodus",
  LAM: "Lamentations",
  EZE: "Ezekiel",
  DAN: "Daniel",
  HOS: "Hosea",
  JOE: "Joel",
  AMO: "Amos",
  OBA: "Obadiah",
  JON: "Jonah",
  MIC: "Micah",
  NAH: "Nahum",
  HAB: "Habakkuk",
  ZEP: "Zephaniah",
  HAG: "Haggai",
  ZEC: "Zechariah",
  MAL: "Malachi",
  MAT: "Matthew",
  MAR: "Mark",
  LUK: "Luke",
  JOH: "John",
  ACT: "Acts",
  ROM: "Romans",
  "1CO": "1 Corinthians",
  "2CO": "2 Corinthians",
  LEV: "Leviticus",
  GAL: "Galatians",
  EPH: "Ephesians",
  PHP: "Philippians",
  COL: "Colossians",
  "1TH": "1 Thessalonians",
  "2TH": "2 Thessalonians",
  "1TI": "1 Timothy",
  "2TI": "2 Timothy",
  TIT: "Titus",
  PHM: "Philemon",
  HEB: "Hebrews",
  JAM: "James",
  "1PE": "1 Peter",
  "2PE": "2 Peter",
  "1JO": "1 John",
  "2JO": "2 John",
  "3JO": "3 John",
  JDE: "Jude",
  REV: "Revelation",
  NUM: "Numbers",
  DEU: "Deuteronomy",
  JOS: "Joshua",
  JDG: "Judges",
  RUT: "Ruth",
  "1SA": "1 Samuel",
  "2SA": "2 Samuel",
};

// this works because references always look like this "Gen 1 2"
let createFileName = (name) => {
  let [book, chapter, verse] = name.split(" ");
  return `${books[book]} ${chapter}:${verse}`;
};

let getBook = (name) => {
  let [book] = name.split(" ");
  return books[book];
};

let getChapter = (name) => {
  let [, chapter] = name.split(" ");
  return `Chapter ${chapter}`;
};

let references = path.resolve(process.cwd(), "refs");
let markdownPath = path.resolve(process.cwd(), userPath || "notes");

let main = async () => {
  let bible = require("./refs/kjv.json");
  // loop through the json files
  fs.readdirSync(references).forEach((file) => {
    // use require (automatically parses it for us)
    let refJson = require(`./refs/${file}`);
    Object.values(refJson).forEach((ref) => {
      let name = createFileName(ref.v);
      let book = getBook(ref.v);
      let chapter = getChapter(ref.v);
      let verse = bible[name];

      // here we create folders for a book and chapter
      // this is so file systems don't crash at 32,102 verses not being nested
      let bookFolder = path.resolve(markdownPath, book);
      if (!fs.existsSync(bookFolder)) fs.mkdirSync(bookFolder);
      let chapterFolder = path.resolve(bookFolder, chapter);
      if (!fs.existsSync(chapterFolder)) fs.mkdirSync(chapterFolder);

      // loop through all the references, creating a wikilink for each reference
      // ex: [[Matthew 2:3]]\n[[Matthew 3:1]]
      let wikiLinks = Object.values(ref.r || {}).reduce(
        (md, refName) => md.concat(`[[${createFileName(refName)}]]\n`),
        ""
      );

      let md = `---\nLinks:\n${wikiLinks}---\n\n"${verse}"`;

      // create a md file for every verse
      fs.writeFileSync(
        path.resolve(markdownPath, book, chapter, `${name}.md`),
        md
      );
    });
  });
};

main();
