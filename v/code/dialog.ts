//
//Get pre existing methods usefull for creating elements and other functionality
import {view} from '../../../outlook/v/code/view.js'
//
//For Reporting errors within the program flow
import {mutall_error, basic_value} from "../../../schema/v/code/schema.js";
//
//The general definition of a group of user inputs is characterised by the 
//'type' keyword, a discriminant. This construct allows us to design forms for 
//collecting sophisticated data, Z, defined below:-
/*
A extends group{...}
B extends group{...}
C extends group{...}
type Z = A|B|C 
*/
interface group {
    type:string;
}
//
//The raw data of a clean version(x) is defined as follows:- 
export type raw<x> =
    //
    //If the clean version, x, is a group, then its raw version is the same as x
    //with all the key values converted to raw (except the discriminant, key, 'type')
    x extends group ? { [key in keyof x]:key extends 'type' ? x[key]: raw<x[key]>}
    //
    //If x is not a group, then its raw version includes the Error
    :x|Error| null
//
//This is type a guard for testing whether some user input is a group or not
export function is_group(user_input:any):user_input is group{
    //
    //Any input is a group if it contains a key named 'type' whose type is  
    //string
    return  ('type' in user_input && typeof user_input['type']==='string');
}
//
//Alert is a dialog that is used for serving content to users, i.e., error reporting
//This is supposed to be a substitute for the normal js alert
export class myalert extends view{
    //
    //Visual representation of the dialog class
    public proxy:HTMLDialogElement;
    //
    //
    constructor(
        //
        //Where to apend the dialog box in the current document
        public anchor?:HTMLElement,
        //
        //How to show the dialog, modal or modalless
        public modal:boolean = true,
        //
        //Infomation being served
        public data_original?:string    
    ){
        //
        //Instanciate a view
        super();
        //
        //Create a dialog box on the given anchor. If the anchor is not
        //given, we shall use the document body
        this.proxy = this.create_element("dialog", this.anchor ? this.anchor : this.document.body);
    }
    //
    //This coordinates all dialog processes. It shows the 
    //dialog server the content to the user then await for the user to close
    public async administer():Promise<void>{
        //
        //Show the dialog (there may be a need to fetch a url from the server)
        await this.open();
        //
        //Wait for the user to finish the dialog activities
        await this.get_user_response();
        //
        //Close the dialog unconditional
        this.close();
    }
    //
    //Show the dialog box either modal or modalless depending on the requested use
    //case and after showing the dialog paint the dialog with the content to be served
    //this content is mostlikely under the data_original property of the alert dialog
    private async open():Promise<void>{
        //
        //Show the dialog box, depending on desired mode
        //
        //Check if dialog exist and open it ???????????????? 
        //will it show even after being detached form the document
        if (this.modal) this.proxy.showModal();  else  this.proxy.show();
        //
        //This is where the serving of the content is done 
        await this.onopen(); 
    }
    //
    //Serve the content to the user via the proxy
    public async onopen():Promise<void>{
        //
        //Display the data on the proxy 
        this.proxy.innerHTML = this.data_original!;
        //
        //Create a cancel button that will help in closing of the proxy
        this.create_element("button", this.proxy, {id:"cancel"});
    }
    //
    //We wait for the user input to determine the next course of action with regard
    //to the dialog box
    private get_user_response(): Promise<undefined> {
        //
        //Get the cancel button from the dialog
        const cancel:HTMLElement | null = this.proxy.querySelector("#cancel");
        //
        //Acertain that the cancel button is inside the dialog
        if(!cancel) throw new mutall_error("We are missing a cancel button!!");
        //
        //Wait for the user to enter data and initiate the desired process
        return new Promise((resolve) => {
            //
            // ... terminate the process by canceling
            cancel.onclick = () => resolve(undefined);
        });
    }
    //
    //This closes the dialog when all operations concerning it are done
    private close():void{
        //
        //Close the dialog 
        this.proxy.close();
        //
        //Detach the dialog from the anchor
        //
        //This step is necessary only if the dialogbox was desigend using a
        //html fragment
        if (this.anchor) this.anchor.removeChild(this.proxy);
    }
}
    
//
//Dialog is an abstract class that has 3 public methods:-
//-administer - the collecteds inputs from user
//- populate that filles a dialog box with inputs
//- get_raw_user_inputs that reads the user modified inputs
export abstract class dialog<Idata> extends myalert{
    //
    //This refers to the process that led to the data collection.It might not 
    //nessesarily be saving the data to the database
    abstract save(input:Idata):Promise<"Ok" | Error>;
    //
    //The opposite of populate. It reads and returns data from a dialog
    abstract read():Promise<raw<Idata>>;
    //
    constructor(
        //
        //Where to apend the dialog box in the current document
        public anchor?:HTMLElement,
        //
        //How to show the dialog, modal or modalless
        public modal:boolean = true ,
        //
        //The optional html fragment needed for constructing a dialogbox 
        // This is the path to the data collection form
        public fragment_url?:string
    ){
        //
        //Instantiate myalert which is the parent class of a dialog
        super(anchor,modal);    
    }
    //
    //Process of attaching the form fragment to the dialog box and populating the 
    //form in case of data modification.After all these processes show the dailog
    //box to the user for data entry.
    private async open():Promise<void>{
        //
        //If the html fragment is provided, use it to show the dialog box 
        if (this.fragment_url){
            //
            //Request for the content of the file specified by the path 
            const response: Response = await fetch(this.fragment_url); 
            //
            //Check whether there was an error in server-client communication 
            if (!response.ok) 
                throw new mutall_error(
                    `Fetching ${this.url} failled. Status code${response.status}, 
                    status text ${response.statusText}`
                );
            //
            //Append the string to the html of the dialog
            this.proxy.innerHTML = await response.text();
            //
            //Get whatever form was appended to the dialog
            const form = this.proxy.querySelector("form");
            //
            //Prevent the default submit behaviour of the form if present
            if(form) {
                //
                //Prevent the default submit behaviour of a form
                form.onsubmit = (e) => e.preventDefault()
                //
                //Handle clearance of all error reports on the form
                form.onchange = () => this.on_input();
            };
        }
        //
        //If there is any data avalable use it to populate this page
        if (this.data_original) this.populate(this.data_original);
        //
        //Show the dialog box, depending on desired mode
        if (this.modal) this.proxy.showModal();  else  this.proxy.show();
        //
        //Do the form preparations (adding targeted error reporting and marking 
        //the required fields with asterisk) 
        await this.onopen();     
    }
    //
    //Perform the final preparations on the data collection form ,i.e., adding
    //error reporting sections and also marking the required fields with asteriks
    public async onopen():Promise<void>{
        //
        //Get all the data collection envelops 
        //
        //Add a span with the class error which is for targeted error reporting
        //
        //Check if the field has a requird attribute and append an asterik to indicate
        //that the field is required 
    }
    //
    //Clear the error messages in the input form immedietly the user starts to input
    private on_input():void{
        //
        //Get the elements with class 'error' then remove the error message
        const errors = this.document.querySelectorAll('.error');
        //
        //Clear any error messages on the form
        errors.forEach(error=>error.textContent='');
    }
    //
    //Fill the dialog box with the given data, typically obtained from a database
    //This section is particularly useful in cases of modification of data. 
    //When a dialog instance is created with data then override this method
    //to provide the prefferd way of displaying the data to the dialog form.
    public populate(data:Idata):void{
        //
        throw new mutall_error("Provide us with a way to present your data!!");
    };
    //
    //We wait for the user to enter the data that is required in the form and initate
    //one of two processes:-
    //1. submit
    //2. Cancel
    //Based on the user selected process we prefom relevant actions
    public get_user_response(): Promise<Idata| undefined> {
        //
        //Return the submit and cancel buttons.
        //
        //Confine the search of the submit and the cancel buttons to the specified anchor
        const submit: HTMLElement | null = this.proxy.querySelector('#submit');
        //
        const cancel: HTMLElement | null = this.proxy.querySelector("#cancel");
        //
        //Ensure that both the submit and cancel buttons are found 
        if(!(submit && cancel)) throw new mutall_error("We are missing certain buttons!!");
        //
        //Wait for the user to enter data and initiate the desired process
        return new Promise((resolve) => {
            //. After entering input details the user can either
            //
            // ...submit the data
            submit.onclick = async () => await this.submit(resolve);
            //
            // ... terminate the process by canceling
            cancel.onclick = () => resolve(undefined);
        });
    }
    //
    //Here we collect the data that the user enterd in the form then save considering 
    //the different sources of the data while reporting any errors to the user
    //and eventually resolving the promised data upon succesful saving.
    public async submit(resolve:(i:Idata)=>void):Promise<void>{
        //
        //Retrieve the infromation that was enterd by the user
        const input:raw<Idata> = await this.read();
        //
        //Check the raw data for errors, reporting them if any 
        const output:Idata|undefined = this.check(input);
        //
        //Continue only of there were no errors. Note the explicit use of '===', 
        //just incase output was a boolean value
        if (output===undefined) return; 
        //
        //Save the content 
        const result: "Ok" | Error = await this.save(output);
        //
        //Resolve the promised Idata if the operation was succesful
        if (result === "Ok") resolve(output); 
        //
        ///..otherwise report the error in a general fashion, i.e., not targeting
        //a specific user input
        else this.report_error("report", result.message);
    }
    //
    //Check the raw data for errors, returning with the clean data if there are
    //no errors and void if there are.
    check(input:raw<Idata>):Idata|undefined{
        //
        //Let output be the desired result.
        const output :Idata|undefined = 
            //
            //If the input is a group, return the group check result
            is_group(input) ? this.check_group(input)
            //
            //If the inpt is not a group and us errornous, return the void of the
            //the error report
            : input instanceof Error ? this.report_error('report', input.message)
            //
            //If the input is not an error then return it as the output, casted
            //into clean data
            : <Idata>input; 
        //
        return output;    
    }
    //
    //Check the raw group (of user inputs) for errors
    check_group(input:raw<Idata>):Idata|undefined{
        //
        //The input must be a group.If it is not, throw an exception
        if (!is_group(input)) throw new mutall_error('User input group expected');
        //
        //Isolate the all the raw data keys. Ojcet keys are always strings.
        //Coerce them to the correct type (so that the next filtering can use
        //the correct data types)
        const keys = Object.keys(input) as Array<keyof raw<Idata>>;
        //
        //Filter out the erroneous keys of the raw data
        const err_keys = keys.filter(key => input[key] instanceof Error);
        //
        //If errors are found, report them to the user and discontinue this 
        //submisssion
        if (err_keys.length>0){
            //
            //Report the errors
            err_keys.forEach(key=>{
                //
                //use the given (string) key as a (keyof Idata) get the raw data
                //must be an error 
                const error = <Error>input[key];
                //
                //Report the error message. Assue the key must be a string
                this.report_error(<string>key, error.message);
            });
            //
            return undefined;
        }
        //
        //Reteurn input as the clean data
        return <Idata>input;
    }
} 

