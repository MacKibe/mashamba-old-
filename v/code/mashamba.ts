//Access the server services by importing all the facilities that are in the
//server module in the schema foler of our library
import * as server from "../../../schema/v/code/server.js";
//
//Access the library needed for saving data to a database from Javascript
import * as quest from "../../../schema/v/code/questionnaire.js";

//Access to Page class of our library
import * as view from "../../../outlook/v/code/view.js";

//
//Get the documents to drive our page. A document has the following structure:-
type doc = {
  document: string;
  pages: string;
  title_no: string;
  category: string;
  area: number;
  owner: string;
  regno: string;
};
//
//A page comprises of just a number and the url of the image
type page = { num: string; url: string; name: string };
//
//
type keys = "document" | "title_no" | "category" | "area" | "owner" | "regno";
//
//Extend the page class with our own version, called mashamba
export class mashamba extends view.page {
  //
  //Declare the elements of interests
  //
  //The image element in in the panel one
  public first_page: HTMLElement;
  //
  //This is the panel that represents the other pages of the document
  public other_pages: HTMLElement;
  //
  //The couner for documents being displayed
  public counter: number = 0;
  //
  //The results of interrogating the database is an array of documents
  public docs?: Array<doc>;
  //
  //
  constructor() {
    super();
    //
    //intialize the page one panel
    this.first_page = document.getElementById("first_page")!;
    //
    //intialize the other pages panel
    this.other_pages = document.getElementById("other_pages")!;
    //
    // Attach an event listener for moving to the document
    document.getElementById("nxt_btn")!.onclick = () => this.move_next();
    //
    // Attach an event listener for moving to the document
    document.getElementById("previous_btn")!.onclick = () =>
      this.move_previous();
    //
    // Attach an event listener for saving the transcriptions
    document.getElementById("save_data_btn")!.onclick = () => this.save_data();
  }
  //
  //Replace the show pannels method with our own version
  public async show_panels(): Promise<void> {
    //
    //Load documents
    this.docs = <Array<doc>>(
      await server.exec(
        "database",
        ["mutall_mashamba", false],
        "get_sql_data",
        ["/mashamba/v/code/mashamba.sql", "file"]
      )
    );
    //
    //Load the current title
    this.load_title();
  }
  //
  // this will help in moving to next document
  move_next() {
    //
    // Check if there are any empty required fields before moving to the next document
    if (this.areRequiredFieldsEmpty()) {
      alert(
        "Please fill all required fields before moving to the next document."
      );
      return;
    }
  }
  //
  // Checking if fields are empty
  public areRequiredFieldsEmpty(): boolean {
    //
    // Define an array of keys for the required fields
    const requiredKeys: keys[] = [
      "document",
      "title_no",
      "category",
      "area",
      "owner",
      "regno",
    ];
    //
    // Loop through the required keys and check if any of the corresponding input fields are empty
    for (const key of requiredKeys) {
      const element = document.getElementById(key) as HTMLInputElement;
      if (!element.value.trim()) {
        return true;
      }
    }

    return false;
  }
  //
  // this will help in moving to next document
  move_previous() {
    //
    // Increate the counter by 1
    this.counter--;

    // Load tthe titles using the new counter
    this.load_title();
  }
  //
  // Load the current document tothehome page depending
  async load_title() {
    //
    // Clear all the 3 panels, viz., first_page, other_pages and transcription
    this.clear_panels();
    //
    // Get the pages of the given current document number
    const pages: Array<page> = JSON.parse(this.docs![this.counter].pages);
    //
    // Create the first page, including its image
    this.create_first_page(pages[0]);
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
      this.fill_transcriptions(<keyof doc>key);
    //
    // Create and show the other_pages panel
    for (let i = 1; i < pages.length; i++) this.create_other_page(pages[i]);
  }
  //
  // Set the url of the first image of the pages
  create_first_page(page: page) {
    //
    // Get url of of the first page
    const url: string = page.url;
    //
    // Create the first page image
    const image1 = document.createElement("img");
    //
    // Add a class to the image
    image1.classList.add("image");
    //
    // Attach the image to page1
    this.first_page.appendChild(image1);
    //
    // Add event listener to change border color when clicked
    image1.addEventListener("click", () => {
      image1.classList.toggle("imgSelected");
    });
    //
    // Set the url of the page
    image1.src = `http://localhost${url}`;
  }
  //
  // Add the rest of the images in the other_page section
  create_other_page(page: page) {
    // Remove previously selected image, if any
    const selectedImage = document.querySelector(".imgSelected");
    if (selectedImage) {
      selectedImage.classList.remove("imgSelected");
    }

    // Create an image element for this page
    const image = document.createElement("img");

    // Add a class to the image
    image.classList.add("image");

    // Set the source of the image to the URL of the page
    image.src = `http://localhost${page.url}`;

    // Add event listener to change border color when clicked
    image.addEventListener("click", () => {
      // Remove the "imgSelected" class from the previously selected image
      const prevSelectedImage = document.querySelector(".imgSelected");
      if (prevSelectedImage) {
        prevSelectedImage.classList.remove("imgSelected");
      }

      // Add the "imgSelected" class to the clicked image
      image.classList.add("imgSelected");
    });

    // Replace the content of the other-pages div element with the new image
    this.other_pages.innerHTML = "";
    this.other_pages.appendChild(image);
  }
  //
  //clear all the 3 panels
  clear_panels() {
    //
    // Clear the first page
    this.first_page.innerHTML = "";
    //
    // Clear the other_pages panels
    this.other_pages.innerHTML = "";
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
      if (key === "pages") continue;
      //
      // Get the named element
      const element = <HTMLInputElement>document.getElementById(key);
      //
      // Se its value to empty
      element.value = "";
    }
  }
  // Fill the transcriptions, by transferring the values from from the global
  // array, data array to
  // the transciption panel
  fill_transcriptions(key: keyof doc) {
    //
    //Skip the pages key (because it is a special key)
    if (key === "pages") return;
    //
    //Get the named element
    const element = <HTMLInputElement>document.getElementById(key);
    //
    //Get the value that maches the key
    const value = this.docs![this.counter][key];
    //
    //Set the element vale only if the value is not null
    if (value !== null) element.value = String(value);
  }
  //
  // Get the data from the input elements and send and save them to various
  // tables in the mutall_mashamba database
  async save_data() {
    //
    //Collect the data to save, as layouts
    //
    //Get the ids of the html elements that hp;d the data
    const ids: { [key in keys]: [string, string] } = {
      document: ["document", "id"],
      title_no: ["title", "id"],
      category: ["category", "name"],
      area: ["document", "area"],
      owner: ["document", "person"],
      regno: ["document", "regno"],
    };
    //
    //The elements will now be mapped to their layouts
    const layouts: Array<quest.layout> = Object.keys(ids).map((k) => {
      //
      //Coerce k into of of the document keys
      const key = <keys>k;
      //
      //Get the values of the elements
      const value = (<HTMLInputElement>document.getElementById(key)).value;
      //
      //Show the entity name where the data will be saved in the database
      const ename: string = ids[key][0];
      //
      //Show which column in the database the value will be saved
      const cname: string = ids[key][1];
      //
      //Get the values ready for saving
      return [value, ename, cname];
    });
    //
    //Use questionnaire to save the data and get the results
    const result: "Ok" | string = await server.exec(
      //
      //The name of the PHP class to use is questionnaire
      "questionnaire",
      //
      //The constructor parameter of questionnare is one: database name
      ["mutall_mashamba"],
      //
      //The name of the questionnare method to use is the common lodig system
      "load_common",
      //
      //The mandory parameter of the load commom method is one: layput
      [layouts]
    );
    //
    //Report the result.
    alert(result);
  }
}
