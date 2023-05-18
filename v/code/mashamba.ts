//Access the server services by importing all the facilities that are in the
//server module in the schema foler of our library
import * as server from "./../../../schema/v/code/server.js";
//
//Declare the elements of interests
//
//The image element in in the panel one
var image_one_panel:HTMLElement;
//
//This is the panel that represents the other pages of the document
var other_pages_panel: HTMLElement;
//
// This is the next button element for displaying the next document
var next_button: HTMLButtonElement;
//
// This is the previous button element for displaying the previous document
var previous_button: HTMLButtonElement;
//
//The couner for documents being displayed
var counter:number=0;
//
//Declare the trsnscrption elements
var category:HTMLInputElement;

//
//Get the data to drive our page. It has teh following structure:-
//{document, category, pages} The pages is a json text that is an array indviual page scans
//with the followinf strucrure:= [..., {num, url, name}, ...]
var data:Array<{document:string, category:string, pages:string}> = await server.exec(
    'database',
    ['mutall_mashamba', false],
    'get_sql_data',
    ['/mutall_mashamba/v/code/mashamba.sql', 'file']
 );
 //
//Loading multipe titles that can move from one title to ythe other
export async function load_mutiples_titles(){
    //
    //Initialize the variabls that represent html elemens in ou page, including settinup the event listeners
    initialize(); 
    //
    //Load the current title
    load_title();
}

//
//Initializing the element will
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
    //
    //Create the page1 image
    const image1 = document.createElement('img');
    //
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
    load_title();
}  
//
// this will help in moving to next document
function move_previous(){
    //
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