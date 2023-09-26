//Access the server services by importing all the facilities that are in the
//server module in the schema foler of our library
import * as server from "../../../schema/v/code/server.js";
//
//Access the library needed for saving data to a database from Javascript
import * as quest from "../../../schema/v/code/questionnaire.js";
//
//Import the registration library.
//Access the registration services from the registration class
import { registration } from "./registration.js";
//
//Access the user class to use it as a data type for holding the
//user credentials
import { user } from "../../../outlook/v/code/app.js";
//
//Access to Page class of our library
import * as view fruom "../../../outlook/v/code/view.js";
import { mutall_error } from "../../../schema/v/code/schema.js";
import { report } from "../../../outlook/v/code/outlook.js";
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
type keys =
  | "document"
  | "title_no"
  | "category"
  | "area"
  | "owner"
  | "regno"
  | "surname";

// this is the data structure we are going to use to hold our images.
interface Iimagery {
  //
  // The location i.e path/folder on our server where to save the data e.g. /imagery/v/images/
  destination: string;
  //
  // The content we are about to upload if it comes from the client then the files will be
  // defined, if it comes from the server then the folder will be defined.
  content: FileList | string;
  //
  // The metadata to upload.
  keyword: string;
}
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
    document.getElementById("save_data_btn")!.onclick = () => this.save();
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
  // First we will be assuming the images are on the server,
  // next assume its on another computer.
  // Process we will be get the images from the selected images from the
  // input element on the site. Then the user to click on the upload button.
  // Data = content(files) + metadata(interfaces).
  public async load_images(data?: Iimagery): Promise<unknown> {
    //
    // 1. If you dont have the data then collect it from the user(JM).
    // Promise/await.
    const data_to_use: Iimagery = data ?? this.get_data_from_user();
    //
    // At this point I have the data i want to use.

    // 2. Use the data to determine whether the content is on the server If its not on the server
    // then transfer it from your PC. i.e., if the content is not on the server then upload it.
    // Use our server exec path command (SW)
    if (typeof data_to_use === "string")
      this.copy_from_content_to_destination(data_to_use);
    //
    // Research on fetch post &global Php variables move_upload_files(JK)
    else this.upload_content(data_to_use);
    //
    // 3. Load the metadata to the appropriate database, this is unconditional (GK).
    const result = this.load_metadata(data_to_use);
    //
    // Report the result. Hint report on the same dialog box (KM/JM)
    this.report(result);
  }

  //
  // This will help in automating the loading of images from my local storage.
  // i.e. my pc to the server
  // hint: I'll be using the Fetch command to send a request from my client to the server.
  public async upload_content(input: Iimagery): Promise< 'ok' | Error> {
    //
    //Form data is is of type body init
    const form = new FormData();
    //
    //Destructure the input to reveal ots keys
    const {destination, content, keyword} = input;
    //
    //We expect content to a filelist; if not, then there is an issue
    if (!(content instanceof FileList)) throw new mutall_error('Content is expected to be a file list');
    //
    // Add the files for sending to the server
    for(let i=0; i<content.length; i++) form.append("input_file[]", content[i]);
    //
    //Add destination and keywords for sendig to the server
    form.append('destination', destination);
    form.append('keyword', keyword)
    //
    //These are the fetch options
    const options:RequestInit = {
        //
        //This corresponds to the method attribute of a form
        method:'post',
        body:form
    };
    //
    //Use the fetch method method to content to the server
    //The action (attribute) of a form matches the resource parameter of the fetch command
    const response:Response = await fetch("./upload.php", options);
    //
    //Test if fetch was succesful if not alert the user with an error
    if (!response.ok) throw 'Fetch request failed...for some reason.';
    //
    //Get the text that was echoed by the php file
    const result:string = await response.text();
    //
    //Alert the result
    if (result === 'ok') return 'ok'; else return new Error(result);
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
    //
    // Increate the counter by 1
    this.counter++;

    // Load tthe titles using the new counter
    this.load_title();
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
  // Load the current document to the home page depending
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
  //
  create_other_page(page: page) {
    //
    // Create an image element for this page
    const image = document.createElement("img");
    //
    // Add a class to the image
    image.classList.add("image");
    //
    // Set the source of the image to the URL of the page
    image.src = `http://localhost${page.url}`;
    //
    // Add event listener to change border color when clicked
    image.addEventListener("click", () => {
      image.classList.toggle("imgSelected");
    });
    //
    // Attach the image element to the other-pages div element
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

  //
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
  //
  // Get the transcription data {including the current logged in intern) from
  // the input form then save them to various
  // tables in the mutall_mashamba database
  public async save(): Promise<void> {
    //
    //Collect the data to save, as layouts
    //
    //Get the ids of the html elements that have the data
    const ids: { [key in keys]: [string, string] } = {
      document: ["document", "id"],
      title_no: ["title", "id"],
      category: ["category", "name"],
      area: ["document", "area"],
      owner: ["document", "person"],
      regno: ["document", "regno"],
      surname: ["intern", "surname"],
    };
    //
    //The elements will now be mapped to their layouts
    const layouts: Array<quest.layout> = Object.keys(ids).map((k) =>
      this.get_layout(k, ids)
    );
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

  //
  // k is the id used to label the input elements in the form
  get_layout(
    k: string,
    ids: { [key in keys]: [string, string] }
  ): quest.layout {
    //
    //Coerce k into of of the document keys
    const key = <keys>k;
    //
    //Define a string value
    let value: string;
    //
    //If the key is a surname use the reg system to get the intern logged in
    if (key === "surname") value = this.get_current_intern();
    else value = (<HTMLInputElement>document.getElementById(key)).value;
    //
    //Show the entity name where the data will be saved in the database
    const ename: string = ids[key][0];
    //
    //Show which column in the database the value will be saved
    const cname: string = ids[key][1];
    //
    //Get the values ready for saving
    return [value, ename, cname];
  }

  //
  // If there is no currently logged in user we kick in the Joshua's registration system.
  // The underline Db must support one or 2 users types this content generator eg Divan
  // and transcriber.
  // The key is a surname use the reg system to get the intern logged in.
  // String is the actual surname of the user logged in.
  private get_current_intern(): string {
    //
    // Let surname be the result we want.
    let surname: string | null;
    //
    // Use windows local storage to get the currently logged in intern.
    surname = localStorage.getItem("userfullname");
    //
    // If no user is logged in use the registration class to get the user
    if (surname === null) surname = this.get_user_from_registration_system();
    //
    // Take the fact that the user may not be active and the registartion system was aborted.
    // chack how to stop a process without using a method.
    if (surname === null)
      throw new mutall_error("I am unable to determine the current user");
    //
    // Return the username.
    return surname;
  }

  //
  // Use the registration class to get the user.
  private get_user_from_registration_system(): string | null {
    //
    // Create registration instance
    // the registation class will be in the registration.ts in the outlook
    const popup = new registration();
    //
    // Administer the pop up to get the user
    // User data type is found in the app.ts file of outlook
    const user: user | undefined = await popup.administer();
    //
    // Return the user name
    //
    // If user is undefined return null
    //
    // otherwise return the name of the user
  }
}
