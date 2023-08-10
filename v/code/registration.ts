
//
//Access the user class to use it as a data type
import { user } from "../../../outlook/v/code/app.js";
//
//To access the registration ad authentication services
import {outlook} from "../../../outlook/v/code/login.js";
//
//Access to the popup class (to implement dialog box-like behavior)
import {popup} from "../../../outlook/v/code/outlook.js";
//
//Access the better error reporting method
import {mutall_error} from "../../../schema/v/code/schema.js";

//Access to pre-defined io types
import {io_type, input_type} from "../../../schema/v/code/io.js";


//The data being collected for user authentication
type credentials = {
    username:string, 
    password:string, 
    operation:string
};

//Keys of the credentials
type key = keyof credentials;

//Dirty credentials
type dirty_credentials = {[i in key]:credentials[i]|null|Error};
//
//A popup-based class that is to be exported as a module in order to
//access registration services
export class registration extends popup<user>{
    //
    //Allows for instantiation of the class 
    constructor(){
        //
        //Use the registration html file to populate the popup
        super("registration.html");
    }
    
    //Intervene in show pannels so that we can present the form from its normal
    //behavior
    public async show_panels(): Promise<void>{
        //
        await super.show_panels();
        //
        //Prevent the form from submitting data, as we want to take charge instead
        this.get_element('login_form').onsubmit =(e)=>e.preventDefault();
    }    

    //Implement the required check method. It checks all the user inputs
    //and returns true if they are all valid; otherwise false.
    async check():Promise<boolean>{
        //
        //Collect the signing credentials, with all its dirt
        const Credentials:dirty_credentials = {
            username:this.get_value('username'),
            password:this.get_value('password'),
            operation:this.get_value('operation')
        }
        //
        //Get the keys of the credentials
        const keys =<Array<key>>Object.keys(Credentials);
        //
        //Check that the inputs all valid, i.e., neither null nor erroneous. 
        const dirty_keys = keys.filter((k)=>(typeof Credentials[k]!=='string'));
        //
        //If any of of the key c+values is dirty, the report them in the popup 
        //and return false
        if (dirty_keys.length>0){
            //
            //Report the dirty keys
            dirty_keys.forEach(key=>this.report_error(key, Credentials));
            //
            return false;
        }     
        //
        //Use the credentials to authenticate the visiting user
        const {username, password, operation} = Credentials as credentials;
        
        //2. Test if the user is new or old. If new, sign up; otherwise sign in
        
        //2.1 Define the user that we will eventually to return
        let new_user:user|Error;
        //
        //2.2 Create the outlook provider to access sign-up or sign-in services
        const Outlook = new outlook(username, password);
        //
        //2.3 Now do the authentication
        if(operation==='up')  new_user = await Outlook.register_user(); 
        else  new_user = await Outlook.authenticate_user();
        //
        //Handle the signing errors.
        if (new_user instanceof Error) {
            //
            //Use the dialog to handle the error
            this.get_element('report').textContent = new_user.message;
            //
            //Stop this signing
            return false;
        }
        this.result= new_user;
        //
        //if the authentication is valid return tue otherwise report the 
        //problem and return false.
        return true;
    }    
    
    async get_result():Promise<user>{
        //
        //test if the result is set; if no you have a problem
        if (this.result===undefined) throw 'Result is not set yet';
        //
        return this.result;
    }  
    //
    //Report the dirty cases in teh login form at the appropriate place
    report_error(key:key, credentials:dirty_credentials):void{
        //
        //Use the key to get the error message
        const error = <Error|null>credentials[key];
        //
        //Use the same key to get the general area where to report
        const element = this.get_element(key);
        //
        //Get the  specific element where to report
        const report:HTMLElement|null = element.querySelector('.error');
        //
        //If there is no place to report, then this is a badly designed form; alert the user
        if (report===null)
            throw new mutall_error(`No element for reporting errors for field '${key}'`);
        //
        //Now report the error message
        report.textContent = error===null ? "Fill out this area":error.message;
    }
    
    //Exploit typical layouts of input element on form to extract values. This assumes that
    //we can extract enough information from the form to determine, e.g, 
    //- the type of input, i,e. simple text or use of radio buttons
    //- if any input is required or not
    //This information is supplied using dataset technology in HTML using tgs such as 
    //data-required, data-io type, etc.
    //The given id is that of an envelop tag; the dataset attributes will be specified on this
    //element.
    //The output will be determined by data-required and data-io type attributes
    //Here is an example of an input that satisfies this arrangement
    /*
    <label id="username" data-required="true" data-iotype="text">
        Username:<input type="text"> 
        <span class="error"></span>
    </label>
    */
    get_value(id:string):string|null|Error{
        //
        //Get the identified enveloping element, e.g. the label element in the 
        //our example
        const env = this.get_element(id);
        //
        //Get the io type. Currently only 2 are supported; they are text or radio. If 
        //no io type is available, we assume this is a simple input,
        const io_type:io_type = this.get_io_type(env);
        //
        //Use the envelop and io type to get the raw value, string or null. For check boxes,
        //if there is nothing checked, the raw value is null. For simple input, the null is a
        //zero-length string
        let raw:string|null = this.get_raw_value(env, io_type);
        //
        //Determine whether the value is required or not;
        const is_required:boolean = Boolean(env.dataset.required);
        //
        //If a is required and it is empty, return the an error
        if (is_required && raw===null) return new Error(`Input '${id}' is required`);
        //
        //Otherwise return the raw value
        return raw;
    }
    //
    //get the io-type from a given envelop element; its found in the data-iotype
    //attribute. Assume it is 'text' if the attribute is not found
    get_io_type(env:HTMLElement):io_type{
        //
        //Get the io-type (string) from the envelop element if it is defined; 
        //otherwise assume it is simple text
        const text:string = env.dataset.iotype ?? 'text';
        //
        //Translate the text to a matching io
        switch(text){
            case 'text':
               return {type:'text'};
            case 'radio':
               return 'radios';
            //
            //Any orher case is a mistatch and should be reported to the programmer
            default:
                throw new mutall_error(`'${text}' is not a valid io_type`);
        }
    }
    
    //
    //Use the envelop and io type to get the raw alue as text or null. For 
    //radios/check boxes if there is nothing checked, the raw value is null. 
    //For simple input, the null is a zero-length string. 
    get_raw_value(env:HTMLElement, io_type:io_type):string|null{
        //
        //Translate the text to a matching io
        switch(io_type){
            case 'radios': return this.get_radio_value(env);
            //
            //Any orher case is a mistatch and should be reported to the programmer
            default:
                //
                //Test if the ion type of of the complext type. E.g., 
                //{type:'text', size:10} 
                if (typeof io_type==='object' && 'type' in io_type){
                    //
                    //Destructrfre to get the type
                    const {type} = io_type;
                    //
                    //Depending on the type....
                    switch(type){
                        case 'text': return this.get_text_value(env);
                        default: 
                        throw  new mutall_error(`'${type}' is not a valid io-type`);
                    }
                }
                //Unknown io type
                //
                throw new mutall_error(`Unable to get the value of '${io_type}' io_type`);
                    
        }
   }
     
    //
    //Retrieve value from a simple input, that is, text-based input
    get_text_value(env:HTMLElement):string|null{
        //
        const element:HTMLInputElement|null = env.querySelector('input');
        //
        //If the element is null throw an exception
        if(element===null) throw new mutall_error('Envelop element does not have an input child element');
        //
        //Get the triimed down value
        const value:string = element.value.trim();
        //
        //Return null if the input has an empty value, or is explicily entered
        //as null
        return ['', 'null'].includes(value.toLowerCase()) ? null: value;
    }
    //
    //Retrieve value from selector elements such as radio and checkboxes
    /*
    <fieldset id="operation" data-iotype="radio" data-required="true">
        <legend >What do you want to do?</legend>
        <label>
            <input type="radio" value ="up" name="option"> Sign Up to be Member
        </label>

        <label>
            <input type="radio" value="in" name="option"> Sign In as Member
        </label>
        <span class="error"></span>
    </fieldset>
    
    In this case, fieldset is the envlop element
    */
    get_radio_value(env:HTMLElement):string|null{
        //
        //Collect all the radio buttons in under this envelop
        const radios:NodeListOf<HTMLElement>= env.querySelectorAll('input[type=radio]');
        //
        //There must be at least 2
        if (radios.length<2) throw new mutall_error(`At least 2 radio buttons are expected. ${radios.length} was found`);
        //
        //Collect all radio buttons that are checked
        const checkeds:NodeListOf<HTMLElement>= env.querySelectorAll('input[type=radio]:checked');
        //
        //Return a null if none of them is checked
        if (checkeds.length===0) return null;
        //
        //If more than one is cehcked, thois is a poor form design
        if (checkeds.length>=2) throw new mutall_error(`Check you form. ${checkeds.length} buttons are checked. Only 1 was expected`)
        //
        //Get the (trimmed) value of the checked button
        const value = (<HTMLInputElement>checkeds.item(0)).value.trim();
        //
        //Return a nul if is empty or explictely captured as null
        //Return null if the input has an empty value, or is explicily entered
        //as null
        return ['', 'null'].includes(value.toLowerCase()) ? null: value;
    }
    //
    //Remove the errors when changes are made to form input elements
    on_input():void{
        //
        //Get the elements with class 'error' then remove the error message
        const errors = this.document.querySelectorAll('.error');
        //
        //Clear any error messages on the form
        errors.forEach(error=>error.textContent='');
    }
    //
    //Show and hide the password 
    show_password():void{
        //
        //Get the checkbox which when checked, the password readable text
        //and when unchecked the password is not readable
        const show_element = this.get_element('show_password')as HTMLInputElement;
        //
        //Access the input element responsible for collecting the password
        const password_element = this.document.querySelector('input[type=password]') as HTMLInputElement;
        if(show_element.checked){
            //
            //Change the password text to be readable
            password_element.type = "text";
        }
        else{
            //
            //Make it unreadable
            password_element.type = "password";
        }
    }
    //
    //Get the user that is existing in the window storage, that is, the user that is currently logged in 
    //otherwise return undefined if there's no user that is logged in
    get_current_user():user|undefined{
        //
        //Check that the local storage has someone logged in.
        //If no one is logged in, return undefined
        //
        //if there's someone logged in, return the user
        
    }
    //
    //Retrieve the current logged in user and remove the user from the window storage
    public logout():void{
        //
        //Exit the function if there's no user logged in
        if(!(this.get_current_user() instanceof user))return;
        //
        //Clear the storage when there's an existing user
        localStorage.clear();
    }
}
