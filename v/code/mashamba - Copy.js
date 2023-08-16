//Access the server services by importing all the facilities that are in the
//server module in the schema foler of our library
import * as server from "../../../schema/v/code/server.js";
//
//Declare the elements of interests
//
//The image element in in the panel one
var first_page;
//
//This is the panel that represents the other pages of the document
var other_pages;
//
//The couner for documents being displayed
var counter = 0;
//
//Save the results of interrogating the database to an array of documnets
var docs;
//
//Loading multipe titles that can move from one title to ythe other
export async function load_mutiples_titles() {
    //
    //Initialize the variabls that represent html elemens in our page, 
    //including settinup the event listeners
    await initialize();
    //
    //Load the current title
    load_title();
}
//
//Initializing the element will
async function initialize() {
    //
    //intialize the page one panel
    first_page = document.getElementById("first_page");
    //
    //intialize the other pages panel
    other_pages = document.getElementById("other_pages");
    //
    // Attach an event listener for moving to the document
    document.getElementById("nxt_btn").onclick = () => move_next();
    //
    // Attach an event listener for moving to the document
    document.getElementById("previous_btn").onclick = () => move_previous();
    //
    // Attach an event listener for saving the transcriptions
    document.getElementById("save_data_btn").onclick = () => save_data();
    //
    //Read the data from the masjambe database and save it ith the documents
    //array
    docs = await server.exec("database", ["mutall_mashamba", false], "get_sql_data", ["/mashamba/v/code/mashamba.sql", "file"]);
}
//
// Load the current document tothehome page depending
async function load_title() {
    //
    // Clear all the 3 panels, viz., first_page, other_pages and transcription
    clear_panels();
    //
    // Get the pages of the given current document number
    const pages = JSON.parse(docs[counter].pages);
    //
    // Create the first page, including its image
    create_first_page(pages[0]);
    //
    // Fill the transcription panel
    for (const key of [
        "document",
        "title_no",
        "category",
        "area",
        "owner",
        "regno",
    ])
        fill_transcriptions(key);
    //
    // Create and show the other_pages panel
    for (let i = 1; i < pages.length; i++)
        create_other_page(pages[i]);
}
function create_other_page(page) {
    //
    // Create an image element for this page
    const image = document.createElement("img");
    //
    // Set the source of the image to the URL of the page
    image.src = `http://localhost${page.url}`;
    //
    // Attach the image element to the other-pages div element
    other_pages.appendChild(image);
}
//clear all the 3 panels
function clear_panels() {
    //
    // Clear the first page
    first_page.innerHTML = "";
    //
    // Clear the other_pages panels
    other_pages.innerHTML = "";
    //
    // Clear all the inputs of the transcription panel, by looping over all
    // the keys of a document, except the pages key
    /*
      document:string,
          pages:string,
          title_no:string,
          category:string,
          area:number,
          owner:string,
          regno:string
      */
    for (const key of [
        "document",
        "title_no",
        "category",
        "area",
        "owner",
        "regno",
    ]) {
        //
        // Skip the pages key (because it is a special key)
        if (key === "pages")
            continue;
        //
        // Get the named element
        const element = document.getElementById(key);
        //
        // Se its value to empty
        element.value = "";
    }
}
//
// Set the url of the first image of the pages
function create_first_page(page) {
    //
    // Get url of of the first page
    const url = page.url;
    //
    // Create the first page image
    const image1 = document.createElement("img");
    //
    // Attach the image to page1
    first_page.appendChild(image1);
    //
    // Set the url of the page
    image1.src = `http://localhost${url}`;
}
//
// this will help in moving to next document
function move_next() {
    //
    // Increate the counter by 1
    counter++;
    // Load tthe titles using the new counter
    load_title();
}
//
// this will help in moving to next document
function move_previous() {
    //
    // Increate the counter by 1
    counter--;
    // Load tthe titles using the new counter
    load_title();
}
// Fill the transcriptions, by transferring the values from from the global
// array, data array to
// the transciption panel
function fill_transcriptions(key) {
    //
    //Skip the pages key (because it is a special key)
    if (key === "pages")
        return;
    //
    //Get the named element
    const element = document.getElementById(key);
    //
    //Get the value that maches the key
    const value = docs[counter][key];
    //
    //Set the element vale only if the value is not null
    if (value !== null)
        element.value = String(value);
}
//
// Get the data from the input elements and send and save them to various 
// tables in the mutall_mashamba database 
async function save_data() {
    //
    //Collect the data to save, as layouts
    //
    //Get the ids of the html elements that hp;d the data
    const ids = {
        document: ['document', 'id'],
        title_no: ['title', 'id'],
        category: ['category', 'name'],
        area: ['document', 'area'],
        owner: ['document', 'person'],
        regno: ['document', 'regno']
    };
    //
    //The elements will now bw mapped with layouts
    const layouts = Object.keys(ids).map(k => {
        //
        //Coerce k into of of the document keys
        const key = k;
        //
        //Get the values of the elements
        const value = document.getElementById(key).value;
        //
        //Show the entity name where the data will be saved in the database 
        const ename = ids[key][0];
        //
        //Show which column in the database the value will be saved
        const cname = ids[key][1];
        //
        //Get the values ready for saving
        return [value, ename, cname];
    });
    //
    //Use questionnaire to save the data and get the results
    const result = await server.exec(
    //
    //The name of the PHP class to use is questionnaire
    "questionnaire", 
    //
    //The constructor parameter of questionnare is one: database name
    ['mutall_mashamba'], 
    //
    //The name of the questionnare method to use is the common lodig system
    'load_common', 
    //
    //The mandory parameter of the load commom method is one: layput
    [layouts]);
    //
    //Report the result
    alert(result);
}