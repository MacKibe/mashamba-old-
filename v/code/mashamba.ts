//Access the server services by importing all the facilities that are in the
//server module in the schema foler of our library
import * as server from "./../../../schema/v/code/server.js";
//
// Load one title only.
export async function load_title_1(){
    //
    //Use the exec method of teh server to read ana execute the query that is in
    // /mashamba/v/code/mashamba.sql
    const results:Array<{document:string, category:string, pages:string}> = await server.exec(
        'database',
        ['mutall_mashamba', false],
        'get_sql_data',
        ['/mashamba/v/code/mashamba.sql', 'file']
     );
     //
     //Get the first page element
    const page1: HTMLElement = document.getElementById('first_page')!;
    //
    //Pages of a record
    const pages:Array<{num:string, url:string, name:string}> = JSON.parse(results[0].pages);
    //
    //Get url of of the first page
    const url:string = pages[0].url;
    //
    //Create the page1 image
    const image1 = document.createElement('img');
    //
    //Attach the image to page1
    page1.appendChild(image1);
    //
    //Set the url of the page
    image1.src = url;
    //
    // Get the other_pages element
    const other_pages: HTMLElement = document.getElementById('other_pages')!;
    //
    //Show the rest of the pages
    for(const page of pages){
        //
        // Create an image element for this page
        const images = document.createElement('img');
        //
        // Set thte source of the image to the url of the page 
        images.src = page.url;
        //
        // Attach the image element to the other-pages div element.
        other_pages.appendChild(images);
    }
    
}