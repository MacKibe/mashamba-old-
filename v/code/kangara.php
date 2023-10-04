<?php
namespace mutall\capture;
//
//Resolve reference to the config class using the schema library
include '../../../schema/v/code/schema.php';
//
//Resolve reference to the questionnaire class using the schema library
include '../../../schema/v/code/questionnaire.php';
class upload_files {
    // This are the files that are selected
    public $uploaded_files;
    //
    //This is the full path for the images
    public $full_path;
    // Property to store errors
    private $errors = [];
    // Constructor method
    public function __construct($uploaded_files,$full_path) {
        //
        //An array of the images to be uploaded
        $this->uploaded_files = $uploaded_files;
        //
        //The image path
        $this-> full_path = $full_path;
    }
    function collect_error($name){
        $msg = "File.$name.was not transferred correctly";
        
        return $msg;
        
    }
    // Method to display uploaded files
   
    public function uploaded_files() {
        //
        // Loop through each uploaded file and save it to the destination folder.
        for ($i = 0; $i < count($this->uploaded_files["name"]); $i++) {
            //echo "<pre>".print_r($this->uploaded_files["name"])."<pre>";
            //
            $name = $this->uploaded_files["name"][$i];
            //echo "<pre>".print_r($name)."<pre>";
            //
            //Check wether the file was transferred successfully
            //if(!transferred_correctly($i)) {
                //
              //collect_errors("File $name was not transferred correctly");
                $this->collect_error($name);
                //
                //break;
           // }
            //
            $source = $this->uploaded_files["tmp_name"][$i];
            //
            $destination_location = $this->full_path."/".$name;
            echo "<pre>".print_r($destination_location)."<pre>";
            //
            //Call the move method
            $this->move_file($source, $destination_location);
            //
            //Meta data uploading method
            $this->upload_metadata($i);        
            //Test weather the file location already exists
            //If it exists take action based on the action request.The action may be:-
            //Overwrite the file
            //Skip the file
            //
           // take_action($destination_location);
        }
        //
        //Report any errors in the upload process
        //report_errors();
    }
    //
    //Upload the files metadata
    function upload_metadata($i){
        //
        //For each image, create layouts, use the load common methode to save the 
        //metadata, then echo the error
        //
        //Define a new questionnaire for uploading data to the oritech database
        $q = new \mutall\questionnaire('mutall_imagery');
       
        //
        //Name of the image
        $name = $this->uploaded_files["name"][$i];
        //
        //Path of the image
        $destination_location = $this->full_path."/".$name;
        //
        //The alias can is ofan array of  basic value
        $alias = [$name];
        
         echo "<pre>".print_r($alias)."<pre>";
        //
        //Create the layouts consisting the url, source,keyword and number
        $layouts=[
            [$destination_location , 'image', 'url', $alias],
            //[data.keywords, 'image', 'keyword', $alias],
            ['Local', 'image', 'source', $alias],
            [$i, 'image', 'number', $alias]
        ];
        echo $q->load_common($layouts);
    }
    //
    //Move the file form the temporary storage to the destination folder
    function move_file($source,$destination_location){
        //
        //
        $result /*:boolean*/= move_uploaded_file($source, $destination_location);
        //
        //Check if the moving was successful or not
        if(!$result) collect_error("File $name not uploaded");
    }
//    // Method to collect an error message
//    public function collect_error($message) {
//        $this->errors[] = $message;
//        echo "<pre>".print_r($message)."<pre>";
//    }
}
//
//Get the destination path. The direct method is :- 
//$destination = $_POST["destination"];
//This is the recomended method for security reasons, i.e., not using the $_POST directly
$destination = $_POST['destination'];
//
//Get the keywords from javascript
$keyword = $_POST['keyword'];

//
// Assuming you have an array of uploaded files, you can pass it as an argument
$uploaded_files_array = $_FILES["image"];
//
//Compile the full path including the drive where the uploading is to be done
$full_path= $_SERVER['DOCUMENT_ROOT'] . $destination;
// Create an instance of upload_files
$file_uploader = new upload_files($uploaded_files_array,$full_path);
// Call the method to display uploaded files
$file_uploader->uploaded_files();

