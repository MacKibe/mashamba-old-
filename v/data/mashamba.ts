//Access the server services by importing all the facilities that are in the
//server module in the schema foler of our library
import * as server from "../../../schema/v/code/server.js";
//
//Access the library needed for saving data to a database from Javascript
import * as quest from "../../../schema/v/code/questionnaire.js";
//
//Import the registration library.
//Access the registration services from the registration class
import {registration} from "../../../registration/v/code/registration.js";
//
//Access the user class to use it as a data type for holding the
//user credentials
import {user} from "../../../outlook/v/code/app.js";
//
//Access to Page class of our library
import * as view from "../../../outlook/v/code/view.js";
import {mutall_error} from "../../../schema/v/code/schema.js";
//
//Import the dialog class to help with collection of input from the user
import{dialog} from "./dialog.js"
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
type page = {num: string; url: string; name: string};
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

//Souce of content
type source =
    {
        type: "local";
        files: FileList; //Using a file selector
    }
    | {
        type: "digital ocean";
        path: string; //Name of folder or file on the server
    }
    | {
        type: "other server";
        url: string // The universal resource locator pointing to the image
    };

type Iimagery = {
    //
    //Source of content either local or remote
    source: source;
    //
    //Metadata - Descriptions of the content that should be saved to the database
    //
    //Where to save the content on your server
    destination: string; //Path the server 
    //
    //The keywords to attach to every image
    keywords: string;
    //
    //The primary key of the image contributor(Intern)
    contributor: number;
    //
    //The database name where to sae the metadata
    dbname: string;
    //
    //What to do if the content already exist on the server
    action: "overwrite" | "report" | "skip";
};
//
//Data structure to help us handle raw input before validation checks
//?????????
type raw<data extends {[key in keyof data]: data[key]}> = {
    [key in keyof data]: data[key] | Error | null;
};
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
    //An instance of the registration that will help in logging in and out
    public register: registration;
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
        //
        //Create an instance of the registration for signing in and out opreations
        this.register = new registration();
    }

    //
    //Replace the show pannels method with our own version
    public async show_panels(): Promise<void> {
        //
        //Load documents
        this.docs = <Array<doc>> (
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
    //Load upload files to a server and save the metadat to a database
    //Use the Promise approach
    public async load_images(
        //
        //Where to hook the input dialog
        anchor: HTMLElement,
        //
        //??
        data_in?: Iimagery
    ): Promise<void> {
        //
        //Open, i.e., create and show, the dialog for capturing the user input(JM)
        const {dlg, save, cancel} = this.open_dialog(
            anchor,//Where to hook the dialog box
            "./image_form.html",//The HTML fragment
            data_in// The data input in case of modification of existing data
        );
        //
        //Wait for the user to click either save or cancel button and when they 
        //do return the imagery or undefined(JM,SW,JK,GK,GM)
        const result: Iimagery | undefined = await this.load_images_onsave(save, cancel);
        //
        //Close the dialog
        anchor.removeChild(dlg);
        //
        //Update the home page (i.e., show the fist image loaded, ready for 
        //transcripion) if the loading was successful(JK)
        if (result !== undefined) this.update_home_page(result);
    }
    //
    //Open a dialog box that will be used for geting user input.To open a dialog
    //the user must provide:-
    //1.The point where the dialog will be displayed(anchored)
    //2.The data collection form to be used 
    //3.The data that is to be modified in cases where the user is supposed to edit
    //We expect to get a dialog element a save and a cancel button from this process
    //
    //We create a dialog element then get the data collection form and append it 
    //to the dialog box after which we create two buttons the save and cancel and 
    //anchor them to the dialog box.Immediately the creation of the dialog box is 
    //complete we then conditionally fill the form with data if we are editing else
    //we leave the form as it is and show the dialog eventually
    private open_dialog(
        //
        //Point wehere we are going to display our dialog box
        anchor: HTMLElement,
        //
        //The Html form that will be used for data collection
        fragment: string,
        //
        //Data to be modified in edit cases
        data?: Iimagery
    ): {dlg: HTMLDialogElement; save: HTMLButtonElement, cancel: HTMLButtonElement} {
        //
        //Create a dialog box
        const dlg: HTMLDialogElement = this.create_element('dialog', anchor);
        //
        //Attach the input form to the given dialog
        this.append_form(fragment, dlg);
        //
        //Create the save and cancel buttons on the dialog
        //
        //save
        const save: HTMLButtonElement = this.create_element('button', dlg, {textContent: "save"});
        //
        //cancel
        const cancel: HTMLButtonElement = this.create_element('button', dlg, {textContent: "cancel"});
        //
        //Check to see if the data_in was provided an if so populate the releveant inputs
        if (data) this.populate_form(data);
        //
        //Show the dialog
        dlg.showModal();
        //
        //Return the expected html elements
        return {dlg, save, cancel};
    }
    //
    //The end goal is to produce a data collection dialog. Using the provided 
    //path to the form collect the html as a string then use the string to recreate
    //the from inside the dialog using the innerHtml attribute
    private async append_form(
        //
        //The path to the fragment
        fragment: string,
        //
        //The anchor to the fragment
        anchor:HTMLElement
    ): Promise<void>{
        //
        //Request for the content of the file specified by the path 
        //????? Wait for the form fragment
        const response: Response = await fetch(``); 
        //
        //Check whether there was an error in server-client communication 
        if (!response.ok) return;
        //
        //Append the string to the html of the dialog
        anchor.innerHTML = await response.text();
    }
    //
    //We wait for the user to enter the data that is required in the form and initate
    //one of two processes:-
    //1. Save
    //2. Cancel
    //Based on the user selected process we prefom relevant actions
    private load_images_onsave(
        save: HTMLButtonElement,
        cancel: HTMLButtonElement
    ): Promise<Iimagery | undefined> {
        //
        //Wait for the user to enter data and initiate the desired process
        return new Promise((resolve) => {
            //
            //Attach a click event listener to the save button
            save.onclick = async () => await this.get_and_save(resolve);
            //
            //Attach a click event listener to the cancel.
            //Resolve whenever the user aborts the process
            cancel.onclick = () => resolve(undefined);
        });
    }
    //
    //Here we collect the data that the user enterd in the form then save considering 
    //the different sources of the data while reporting any errors to the user
    //and eventually resolving the promised data upon succesful saving.
    private async get_and_save(resolve: (data: Iimagery) => void) {
        //
        //Retrieve the infomation that was enterd by the user(JM)
        //????improve defination of raw???
        const data_out: Iimagery = this.get_data();
        //
        //Save the content in its entierty handling the reporting(GK,SW,JK,GM)
        const result: "ok" | Error = await this.save_images(data_out);
        //
        //Report if the operation was sucesful and resolve 
        //the promised Iimagery on success(KM)
        if (result === "ok") resolve(data_out);
        else this.report_error("report", result.message);
    }
    //
    //???????????Investigate on suitable return type rather than an error???????
    //
    //Save the content in its entierty handling the reporting(GK,SW,JK,GM)
    //Using the data consider the following cases and use appropriate methods to 
    //save data alongside metadata:-
    //1. Data source is in Digital ocean server(SW)
    //2. Data source is from the client(GM,JK,GK)
    //3. Data is generally on other server(cloud storage), i.e. google photos, 
    //here we only load the url to the database as the only metadata (GK) 
    private async save_images(data: Iimagery): Promise<"ok" | Error> {
        //
        //Using the source of the data choose the relevant saving technique
        switch (data.source.type) {
            //
            //Save images and metadata from the digital ocean server(SW)
            case ("digital ocean"): return await this.save_image_digital_ocean(data);
            //
            //Save images and metadata from the client(JK,GM,GK)
            case ("local"): return await this.save_images_client(data);
            //
            //Save metadata from other server(GK)
            case ("other server"): return await this.save_images_other_server(data);
            //
            //Raise an error if the source provided is not correct
            default: return new mutall_error("Please select the correct source!");
        }
    }
    //
    //Save images and metadata from the digital ocean server(SW)
    private async save_image_digital_ocean(data:Iimagery):Promise<"ok"|Error>{}
    //
    //Save images and metadata from the client(JK,GM,GK)
    private async save_images_client(data:Iimagery): Promise<"ok"|Error>{
        //
        //save the content(the image)(JK,GM)
        this.save_content(data);
        //
        //save the metadata to the db(GK)
        const result:"ok"|Error = await this.save_metadata(data);
        //
        return result;
    }
    //
    //Save metadata from other server(GK)
    private async save_images_other_server(data:Iimagery): Promise<"ok"|Error>{}
    //
    //Get the raw data from the form as it is with possibility of errors then perform
    //validation checks on the data reporting the errors to the user 
    private get_data(): Iimagery {
        //
        //Fetch the data from the form.
        const raw: raw<Iimagery> = {
            destination: this.get_value("destination"),
            content: this.get_value("content"),
            keyword: this.get_value("keyword"),
            intern: await this.get_intern_pk(), // The intern that did the uploading of the images ???????
        };
        //
        //Run the checks on the data gotten and if there is any error report and stop the process
        if (!this.check_and_report(raw)) return
        //
    }
    //
    //Get the primary key of the currently logged in intern
    //
    //We first check using the instance of the registration if there is any logged in intern
    //If there is an inter we return the primary key of the user else we initiate the registration process
    private async get_intern_pk(): Promise<number | Error> {
        //
        //Check if there is any intern/user logged in
        let user: user | undefined = this.register.get_current_user();
        //
        //Return the pk of the currently logged in user if a user exists
        if (user) return user.pk;
        //
        //If no user exist initiate the log in sequence
        user = await this.register.administer();
        //
        //Check if the log in process was successful or aborted and return an error while reporting
        //if it was aborted otherwise return the primary key of the user
        if (!user)
            this.report_error(
                "report",
                "We need to know who is uploading the images"
            );
        //
        return user
            ? user.pk
            : new Error("We need to know who is uploading the images");
    }
    //
    //Perform necessary checks on the raw input and report the errors to the user additionally
    //flag any errors by returning a false to indicate discontinuance of the data collection process.
    //True indicates that there was no error and all the required data was supplied
    private check_and_report(data: raw<Iimagery>): boolean {
        //
        //1. Check all the null and erroneous entries
        //
        //1.1 Get all the keys of the data object
        const keys: Array<keyof raw<Iimagery>> = Object.keys(data) as Array<
            keyof raw<Iimagery>
        >;
        //
        //1.2 Filter out the erroneous values
        const err_keys: Array<keyof raw<Iimagery>> = keys.filter(
            (key) => data[key] instanceof Error
        );
        //
        //Report all of the instances of errors or nulls to the user
        //?????? Reporting of the no user found error ???
        err_keys.forEach((key) =>
            this.report_error(
                key,
                data[key]
                    ? (<Error> data[key]).message
                    : `${key} is required for upload but was not supplied`
            )
        );
        //
        //Based on the count of the errors or nulls return the appropriate boolean value
        return err_keys.length ? false : true;
    }
    //
    // loading content(files) to the server using the exec function in the library
    public async upload_content(data_to_use: Iimagery): Promise<void> {}

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
        // Increase the counter by 1
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
            this.fill_transcriptions(<keyof doc> key);
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
            const element = <HTMLInputElement> document.getElementById(key);
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
        const element = <HTMLInputElement> document.getElementById(key);
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
        const ids: {[key in keys]: [string, string]} = {
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
        const layouts: Array<quest.layout> = Object.keys(ids).map(
            async (k) => await this.get_layout(k, ids)
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
    private async get_layout(
        k: string,
        ids: {[key in keys]: [string, string]}
    ): Promise<quest.layout> {
        //
        //Coerce k into of of the document keys
        const key = <keys> k;
        //
        //Define a string value
        let value: string;
        //
        //If the key is a surname use the reg system to get the intern logged in
        if (key === "surname") value = await this.get_current_intern();
        else value = (<HTMLInputElement> document.getElementById(key)).value;
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
    private async get_current_intern(): Promise<string> {
        //
        // Let surname be the result we want.
        let surname: string | null;
        //
        // Use windows local storage to get the currently logged in intern.
        surname = localStorage.getItem("userfullname");
        //
        // If no user is logged in use the registration class to get the user
        if (surname === null)
            surname = await this.get_user_from_registration_system();
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
    private async get_user_from_registration_system(): Promise<string | null> {
        //
        // Administer the pop up to get the user
        // User data type is found in the app.ts file of outlook
        const user: user | undefined = await this.register.administer();
        //
        // Return the user name
        if (user) return user.name;
        //
        // If user is undefined return null
        return null;
    }
}

class imagery extends dialog<Iimagery>{
    //
    //
    constructor(fragment:string,anchor:HTMLElement,data?:Iimagery){
        //
        //
        super(fragment,anchor,data);
    }
    //
    //
    public async submit(resolve:(i:Iimagery)=>void):Promise<void>{
        
    }
    //
    //
    public populate(data:Iimagery):void{
        
    }
    
}
