warning: LF will be replaced by CRLF in v/code/dialog.js.
The file will have its original line endings in your working directory
warning: LF will be replaced by CRLF in v/code/dialog.ts.
The file will have its original line endings in your working directory
warning: LF will be replaced by CRLF in v/code/mashamba.js.
The file will have its original line endings in your working directory
[1mdiff --git a/v/code/dialog.js b/v/code/dialog.js[m
[1mindex 53615af..e7693b5 100644[m
[1m--- a/v/code/dialog.js[m
[1m+++ b/v/code/dialog.js[m
[36m@@ -25,7 +25,6 @@[m [mexport class dialog extends view {[m
     //Visual representation of the dialog class[m
     visual;[m
     //[m
[31m-    //[m
     constructor([m
     //[m
     //The optional html fragment needed for cnstrucipng a dialogbox compirise[m
[36m@@ -54,6 +53,13 @@[m [mexport class dialog extends view {[m
         //Create teh visual aspect of the dialog box[m
         this.visual = this.create_element("dialog", anchor);[m
     }[m
[32m+[m[32m    //[m
[32m+[m[32m    //This coordinates all data collection and processing activities. It shows the[m[41m [m
[32m+[m[32m    //dialog waits for the user to initiate a process after data entry and depending[m
[32m+[m[32m    //on the process selected by the user the data enterd is retrieved from the form[m
[32m+[m[32m    //validation checks are done to ensure the quality of the data collected then[m
[32m+[m[32m    //fainally the process that the user selectd is undertaken returning the collected[m
[32m+[m[32m    //data upon succes and closing the data collection dialog[m
     async administer() {[m
         //[m
         //Show the dialog (there may be a need to fetch a url from the server)[m
[36m@@ -110,6 +116,16 @@[m [mexport class dialog extends view {[m
         return { submit: this.get_element('submit'), cancel: this.get_element('cancel') };[m
     }[m
     //[m
[32m+[m[32m    //Fill the dialog box with the given data, typically obtained from a database[m
[32m+[m[32m    //This section is particularly useful in cases of modification of data.[m[41m [m
[32m+[m[32m    //When a dialog instance is created with data then override this method[m
[32m+[m[32m    //to provide the prefferd way of displaying the data to the dialog form.[m
[32m+[m[32m    populate(data) {[m
[32m+[m[32m        //[m
[32m+[m[32m        throw new mutall_error("Provide us with a way to present your data!!");[m
[32m+[m[32m    }[m
[32m+[m[32m    ;[m
[32m+[m[32m    //[m
     //We wait for the user to enter the data that is required in the form and initate[m
     //one of two processes:-[m
     //1. submit[m
[36m@@ -145,18 +161,18 @@[m [mexport class dialog extends view {[m
     //and eventually resolving the promised data upon succesful saving.[m
     async submit(resolve) {[m
         //[m
[31m-        //Retrieve the infromation that was enterd by the user(JM)[m
[32m+[m[32m        //Retrieve the infromation that was enterd by the user[m
         const input = await this.read();[m
         //[m
[31m-        //Check the raw data for errors, reporting them if any(JM) [m
[32m+[m[32m        //Check the raw data for errors, reporting them if any[m[41m [m
         const output = this.check(input);[m
         //[m
[31m-        //Continue only of there were no errors. Note the explicit use of '====', [m
[32m+[m[32m        //Continue only of there were no errors. Note the explicit use of '===',[m[41m [m
         //just incase output was a boolean value[m
         if (output === undefined)[m
             return;[m
         //[m
[31m-        //Save the content (GK,SW,JK,GM)[m
[32m+[m[32m        //Save the content[m[41m [m
         const result = await this.save(output);[m
         //[m
         //Resolve the promised Idata if the operation was succesful[m
[1mdiff --git a/v/code/dialog.ts b/v/code/dialog.ts[m
[1mindex 70da4bf..ba03447 100644[m
[1m--- a/v/code/dialog.ts[m
[1m+++ b/v/code/dialog.ts[m
[36m@@ -53,6 +53,9 @@[m [mexport abstract class dialog<Idata> extends view{[m
     //The opposite of populate. It reads and returns data from a dialog[m
     abstract read():Promise<raw<Idata>>;[m
     //[m
[32m+[m[32m    //To handle clearance of error messages[m
[32m+[m[32m    abstract on_input():void;[m
[32m+[m[32m    //[m
     constructor([m
         //[m
         //The optional html fragment needed for cnstrucipng a dialogbox compirise[m
[1mdiff --git a/v/code/mashamba.js b/v/code/mashamba.js[m
[1mindex 733f459..c3f30f9 100644[m
[1m--- a/v/code/mashamba.js[m
[1m+++ b/v/code/mashamba.js[m
[36m@@ -388,15 +388,6 @@[m [mclass imagery extends dialog {[m
         super({ url, anchor }, data, true);[m
     }[m
     //[m
[31m-    //This only happens in case of modification of the existing data.[m
[31m-    //We use the data provided to get all the keys and for each key [m
[31m-    //we identify the html element,the envelop, in the form where the data of [m
[31m-    //the given key should be populated.We then establish the iotype of the [m
[31m-    //input element under the envelop to determine the method that we would use [m
[31m-    //to populate the data to the given input element[m
[31m-    populate(data) {[m
[31m-    }[m
[31m-    //[m
     //Get the raw data from the form as it is with possibility of errors.[m
     //The data should be collected in levels due to the complexity of the data [m
     //entry form. for example:- We collect data of the selected source first to [m
[36m@@ -406,26 +397,60 @@[m [mclass imagery extends dialog {[m
     async read() {[m
         //[m
         //Get the selected source to determine the envelop to use for data collection[m
[31m-        const source = this.get_value('source');[m
[32m+[m[32m        const selection = this.get_value('source');[m
         //[m
         //Ensure that the source was selected[m
[31m-        if (source instanceof Error && null)[m
[32m+[m[32m        if (selection instanceof Error || selection === null)[m
             throw "The source was not filled.Ensure the source is filled";[m
         //[m
[31m-        //[m
[32m+[m[32m        //Initialize the source of the collected data[m
[32m+[m[32m        let source = this.read_source(selection);[m
         //[m
         //Fetch the data from the form.[m
         const raw = {[m
[32m+[m[32m            type: "imagery",[m
             source,[m
             destination: this.get_value("destination"),[m
             keywords: this.get_value("keyword"),[m
             contributor: await this.get_intern_pk(),[m
[31m-            dbname: this.dbname,[m
[32m+[m[32m            dbname: 'mutall_imagery',[m
[32m+[m[32m            action: 'report'[m
         };[m
         //[m
         return raw;[m
     }[m
     //[m
[32m+[m[32m    //Collect the source data depending on the selected source[m
[32m+[m[32m    read_source(selection) {[m
[32m+[m[32m        //[m
[32m+[m[32m        //Compile the source based on the selected option[m
[32m+[m[32m        switch (selection) {[m
[32m+[m[32m            //[m
[32m+[m[32m            //When the data collected is from the local client[m
[32m+[m[32m            case 'local': return {[m
[32m+[m[32m                type: selection,[m
[32m+[m[32m                //[m
[32m+[m[32m                //TODO:Extend get value to take care of filelist[m
[32m+[m[32m                files: this.get_value('files')[m
[32m+[m[32m            };[m
[32m+[m[32m            //[m
[32m+[m[32m            //When the data is from digital ocean[m
[32m+[m[32m            case 'digital ocean': return {[m
[32m+[m[32m                type: selection,[m
[32m+[m[32m                path: this.get_value('path')[m
[32m+[m[32m            };[m
[32m+[m[32m            //[m
[32m+[m[32m            //When the data is from another server[m
[32m+[m[32m            case 'other server': return {[m
[32m+[m[32m                type: selection,[m
[32m+[m[32m                url: this.get_value('url')[m
[32m+[m[32m            };[m
[32m+[m[32m            //[m
[32m+[m[32m            //Discontinue if the data selected was not in any of the above options[m
[32m+[m[32m            default: throw new mutall_error("Check on the source you provided");[m
[32m+[m[32m        }[m
[32m+[m[32m    }[m
[32m+[m[32m    //[m
     //Get the primary key of the currently logged in intern[m
     //[m
     //We first check using the instance of the registration if there is any logged in intern[m
