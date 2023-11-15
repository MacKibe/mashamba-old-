<?php
//We  are in the mutall namespace. This means standard PHP functions should be
//be marked wiith the root namespace
namespace mutall;

//This file must be included before the questionnaire; otherwise a compatibility
//issue is raised
include '../../../schema/v/code/schema.php';
//
//The questionnaire file houses the the class for uploading metadata
include '../../../schema/v/code/questionnaire.php';
//
//Implementation of the php side of the mashamba class system
class mashamba {
    //
    //The files brought to the server via the FormData interface and
    //the files key.
    public array $files;
    //
    //The equivalent of the Iloader interface on the Javascript side, brought
    //in here via the input key 
    public \stdClass $Iloader;
    //
    //Array of errors encountered (during the loading process) to be 
    //reported afterwards. Its a mixture of Exeptions and text 
    public array $errors; 
    //        
    function __construct(){
        //
        //Set the files array from the PHP global variable. It is a logical 
        //error if there are no images to load; otherwise, how did you ever get
        //here, if not to upload files?  A beter user experience is to alert is
        //to design teh input form such that he doed not get here until a file
        //selection is done
        if (!isset($_FILES['files'])) 
            throw new \Exception('Please select some files to load');
        $this->files = $_FILES['files'];
        //
        //Get the Iloader (as a JSON string) from the input key 
        $str = $_POST['input'];
        //
        //Decode the string to a php stdClass that matches the Iloader type. N.B.
        //This type is defined in loader.ts
        $this->Iloader = \json_decode(
            $str, //The input string to be decoded 
            false, //Stay as close as possible to the Iloader defined in loader.ts 
            512,//Stick to teh default nesting levels  
            JSON_THROW_ON_ERROR //Throw an error (rather than return a null) if $str is not a valid json
        );
    }
    
    //Load the image content and metadata sent from the client
    function load_images():void{
        //
        //Load the i'th image.
        for ($i = 0; $i < count($this->files["name"]); $i++) 
            $this->load_image($i);
    }

    //Load the i'th image. This means moving the i'th file to a desired location
    //and saving the metadata to a database
    function load_image(int $i){
        //
        //Get the name of the file
        $name = $this->files["name"][$i];
        //
        //Verify that the file was transferred correctly
        if($this->files["error"][$i] !== 0) 
            return $this->errors[]="File $name was not transferred correctly";
        //
        //Get the source of the images: local client, digital ocean or other
        //server
        $source = $this->Iloader->source;
        //
        //Get the destination folder, depending on the type of the source
        //of the images
        $folder = $source->type==='local_client' ? $source->destination : $source->path;
        //
        //Formulate the url of dthe file (without the local_host prefix)    
         $url= $folder."/".$name;
        //
        //Upload the content, if the source is a local client, by moving the 
        //file from the temporary storage to the destination folder
        if ($source->type==='local_client') $this->upload_content($url, $name, $i);    
        //
        //Unconcitionally, load the metadata to teh database
        $this->upload_metadata($url, $name, $i);
    }

    //
    //Save the file content by moving it from the temporary storage to the 
    //destination folder
    function upload_content(string $url, string $name, int $i):void{
        //
        //Where to move the file
        $filename = $_SERVER['DOCUMENT_ROOT']."/".$url;
        //
        //Take action depending on whether the file exists or not
        if (file_exists($filename)) $this->take_action($filename, $name, $i);
        //
        //Move the file from temporary storage to the destination unconditionnaly
        else $this->move_file($filename, $name, $i);
    }
    
     //
    //Move the file from temporary storage to the destination
    //N.B. Munya + Kibe
    function move_file(string $filename, string $name, int $i){
        //
        //Get the temp filename from where to move the file
        $source = $this->files["tmp_name"][$i];
        //
        //Do the move
        $result /*:boolean*/= \move_uploaded_file($source, $filename);
        //
        //Check if the moving was successful or not; if not report error
        if(!$result) $this->errors[]=new \Exception("File $name not uploaded");
    }
    
    //When a file exists on teh destination folder, then take the appropriate
    // action (by skipping, overwriting or repoting it as an error) as the user
    //desires
    //N.B. Shallon
    function take_action(string $filename, string $name, int $i){
        //
        switch ($this->Iloader->action){
            //
            //Skip the file
            case "skip":return;
            //
            //Do not overwrite the file; instead log this as an error
            case "report": return $this->errors[]=new \Exception("File '$filename' already exist");
            //
            //Overwrite the file    
            case "overwrite":$this->move_file($filename, $name, $i);    
        }
    }
    
    //Write the metada of the uploade fils to a database. Proceed by creating 
    //layouts and using the load common method to save the metadata
    function upload_metadata(string $url, string $name, int $i){
        //
        //Retrieve the keywords
        $keywords = $this->Iloader->keywords;
        //
        //Join the array of  keywords into a single string
        $keyword = join("/", $keywords);
        //
        //Retrieve the image source, depending on the type 
        $source = $this->get_source($this->Iloader->source->type);
        //
        //Use the image name as the alias
        $alias = [$name]; 
        //
        //Create the layouts that matches the Mashamba database
        $layouts =[
            [$url, 'image', 'url', $alias],
            [$keyword, 'image', 'keyword', $alias],
            [$source, 'image', 'source', $alias],
            [$i, 'image', 'number', $alias]
        ];
        //
        //Let $q be a new questionnaire for uploading data to the database
        //Defined in the included quetionnaire.php
        $q = new questionnaire('mutall_imagery');
        //
        //Do the loading
        $result/*'ok'|error */ = $q->load_common($layouts);
        //
        //Log the loading error if any
        if ($result!=='ok') $this->errors[] = $result;
    }

    //Retrieve the image source, depending on the type 
    function get_source(string $type):string{
        //
        //Let src be the to be assoiated with the images being loaded
        $src = "";
        //
        switch($type){
            case "local_client": $src = $this->Iloader->source->destination; break;
            case "digital_ocean": $src = $this->Iloader->source->path; break;
            case "other_server": $src = $this->Iloader->source->url; break;
            default: throw new \Exception("Source type '$type' is not known");
        }
        return $src;
    }
}