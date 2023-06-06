//Access the server services by importing all the facilities that are in the
//server module in the schema foler of our library
import * as server from "./../../../schema/v/code/server.js";
//
//Declare the elements of interests
//
//The image element in in the panel one
<<<<<<< HEAD
var first_page:HTMLElement;
//
//This is the panel that represents the other pages of the document
var other_pages: HTMLElement;
=======
var image_one_panel:HTMLElement;
//
//This is the panel that represents the other pages of the document
var other_pages_panel: HTMLElement;
>>>>>>> refs/remotes/origin/main
//
// This is the next button element for displaying the next document
var next_button: HTMLButtonElement;
//
<<<<<<< HEAD
// This is the save button element for saving data to the database
var save_data_button: HTMLButtonElement;
//
=======
>>>>>>> refs/remotes/origin/main
// This is the previous button element for displaying the previous document
var previous_button: HTMLButtonElement;
//
//The couner for documents being displayed
var counter:number=0;
//
//Declare the trsnscrption elements
var category:HTMLInputElement;

//
<<<<<<< HEAD
//Get the documents to drive our page. A document has the following structure:-
type document = {
        document:string,
        pages:string,
        title_no:string,
        category:string,
        area:number,
        owner:string,
        regno:string
   }
 
 //A page comprises of just a number and teh url of the image
 type page = {num:string, url:string, name:string};    
   
//
//Save the results of interrogating the database to an array of documnets   
var documents:Array<document>;
=======
//Get the data to drive our page. It has teh following structure:-
//{document, category, pages} The pages is a json text that is an array indiviual page scans
//with the followinf strucrure:= [..., {num, url, name}, ...]
var data:Array<{document:string, category:string, pages:string}> = await server.exec(
    'database',
    ['mutall_mashamba', false],
    'get_sql_data',
    ['/mutall_mashamba/v/code/mashamba.sql', 'file']
 );
>>>>>>> refs/remotes/origin/main
 //
//Loading multipe titles that can move from one title to ythe other
export async function load_mutiples_titles(){
    //
    //Initialize the variabls that represent html elemens in ou page, including settinup the event listeners
<<<<<<< HEAD
    await initialize(); 
=======
    initialize(); 
>>>>>>> refs/remotes/origin/main
    //
    //Load the current title
    load_title();
}

//
//Initializing the element will
<<<<<<< HEAD
async function initialize(){
    //
    //intialize the page one panel
    first_page= document.getElementById('first_page')!;
=======
function initialize(){
    //
    //intialize the page one panel
    image_one_panel = document.getElementById('first_page')!;
   //
   //intialize the other pages panel
   other_pages_panel = document.getElementById('other_pages')!;
   //
   //initialize the next button
   next_button = <HTMLButtonElement>document.getElementById('nxt_btn');
   //
   //initialize the previous button
   previous_button = <HTMLButtonElement>document.getElementById('previous_btn');
   //
   // Attach an event listener for moving to the document
   next_button.onclick = () => move_next();
   //
   // Attach an event listener for moving to the document
   previous_button.onclick = () => move_previous();
   //
   //Initialize the transcription elements
   category=<HTMLInputElement>document.getElementById('type');
}

//
// It loads the current title to othrt home page depending on the counter settings
async function load_title(){
    //
    //clear the panels
    image_one_panel.innerHTML = "";
    other_pages_panel.innerHTML= "";
    //
    //Get the pages of the given document number
    const pages:Array<{num:string, url:string, name:string}> = JSON.parse(data[counter].pages);
    //
    //Get url of of the first page
    const url:string = pages[counter].url;
>>>>>>> refs/remotes/origin/main
    //
    //intialize the other pages panel
    other_pages = document.getElementById('other_pages')!;
    //
    //initialize the next button
    next_button = <HTMLButtonElement>document.getElementById('nxt_btn');
    //
    //initialize the previous button
    previous_button = <HTMLButtonElement>document.getElementById('previous_btn');
    //
    //initialize the save button
    save_data_button = <HTMLButtonElement>document.getElementById('save_data_btn');
    //
    // Attach an event listener for moving to the document
    next_button.onclick = () => move_next();
    //
    // Attach an event listener for moving to the document
    previous_button.onclick = () => move_previous();
    //
    // Attach an event listener for moving to the document
    save_data_button.onclick = () => save_data();
    //
    //Initialize the transcription elements
    category=<HTMLInputElement>document.getElementById('type');
    //
    //Read the data from the masjambe database and save it ith the documents
    //array
    documents= await server.exec(
     'database',
     ['mutall_mashamba', false],
     'get_sql_data',
     ['/mashamba/v/code/mashamba.sql', 'file']
  );
}

//
// Load the current document tothehome page depending
async function load_title(){
    //
    // Clear all the 3 panels, viz., first_page, other_pages and transcription
    clear_panels();
    //
    // Get the pages of the given current document number
    const pages:Array<page> = JSON.parse(documents[counter].pages);
    //
    // Create the first page, including its image
    create_first_page(pages[0]);
    //
    // Fill the transcription panel
    for(const key in document) fill_transcriptions(<keyof document>key);
    //
    // Create and show show the other_pages panel
    for (let i = 1; i < pages.length; i++) create_other_page(pages[i]);
    
}

function create_other_page(page:page){
    //
    // Create an image element for this page
    const image = document.createElement('img');
    //
    // Set the source of the image to the URL of the page
    image.src = `http://localhost${page.url}`;
    //
    // Attach the image element to the other-pages div element
    other_pages.appendChild(image);
}

//clear all the 3 panels
function clear_panels(){
    //
    // Clear the first page 
    first_page.innerHTML = "";
    //
    // Clear the other_pages panels
    other_pages.innerHTML= "";
    //
    // Clear all the inputs of the transcription panel, by looping over all
    // the keys of a document, except the pages key
    for(const key in document){
        //
        // Skip the pages key (because it is a special key)
        if (key==='pages') continue;
        //
        // Get the named element
        const element  = <HTMLInputElement>document.getElementById(key);
        //
        // Se its value to empty
        element.value='';
    }
} 
    
//
// Set the url of the first image of the pages
function create_first_page(page:page){
    //
    // Get url of of the first page
    const url:string = page.url;
    //
    // Create the first page image
    const image1 = document.createElement('img');
    //
<<<<<<< HEAD
    // Attach the image to page1
    first_page.appendChild(image1);
    //
    // Set the url of the page
    image1.src = `http://localhost${url}`;
}
    
//
// this will help in moving to next document
function move_next(){
    //
    // Increate the counter by 1
    counter++;
    
    // Load tthe titles using the new counter
=======
    //Attach the image to page1
    image_one_panel.appendChild(image1);
    //
    //Set the url of the page
    image1.src = url;
    //
    //Fill the transiption panel
    fill_transcriptions();
    //
    //Show the rest of the pages
    for (let i = 1; i < pages.length; i++) {
        const page = pages[i];
        //
        // Create an image element for this page
        const image = document.createElement('img');
        //
        // Set the source of the image to the URL of the page
        image.src = page.url;
        //
        // Attach the image element to the other-pages div element
        other_pages_panel.appendChild(image);
    }
}
//
// this will help in moving to next document
function move_next(){
    //
    //Increate the counter by 1
    counter++;
    
    //Load tthe titles using the new counter
>>>>>>> refs/remotes/origin/main
    load_title();
}  
//
// this will help in moving to next document
function move_previous(){
    //
<<<<<<< HEAD
    // Increate the counter by 1
    counter--;
    
    // Load tthe titles using the new counter
    load_title();
} 

// Fill the transcriptions, by transferring the values from from the global 
// array, data array to
// the transciption panel
function fill_transcriptions(key:keyof document){
    
    //Skip the pages key (because it is a special key)
    if (key==='pages') return;
    //
    //Get the named element
    const element  = <HTMLInputElement>document.getElementById(key);
    //
    //Set its value to the corersponding one in the current document
    element.value= String(documents[counter][key]);
}   
//
// Get the data from the input elements and send and save them to various 
// tables in the mutall_mashamba database 
function save_data(){

}
=======
    //Increate the counter by 1
    counter--;
    
    //Load tthe titles using the new counter
    load_title();
} 

function fill_transcriptions(){
    //
    const title:{document:string, category:string, pages:string} = data[counter];
    //
    category.value = title.category;
    
}   
>>>>>>> refs/remotes/origin/main
