<?php
//
//Get the destination path. The direct method is :- 
//$destination = $_POST["destination"];
//This is the recomended method for security reasons, i.e., not using the $_POST directly
$destination = filter_input(INPUT_POST, "destination", FILTER_SANITIZE_STRING);
//
// Assume the destination is safe to use
//
//Compile the full path including the drive where the uploading is to be done
$full_path= $_SERVER['DOCUMENT_ROOT'] . $destination;
//
//retrieve the uploaded files from the $_FILES array
$uploaded_files = $_FILES["image"];
//
//store errors in an array and then display them later
// Array to collect errors during the upload process 
$errors = [];
//
// Loop through each uploaded file and save it to the destination folder.
for ($i = 0; $i < count($uploaded_files["name"]); $i++) {
    //
    $name = $uploaded_files["name"][$i];
    //
//checks if the file was transferred correctly by calling the function
    if(!transferred_correctly($i)) {
        //
        //if file was not transferred correctly, 
        //it collects an error message and breaks out of the loop.
        collect_error("File $name was not transferred correctly");
        //
        // Skip to the next file
        continue;
    }
    //
    $source = $uploaded_files["temp_name"][$i];
    //
    $destination_location = $full_path."/".$name;
    //
    //Test weather the file location already exists
    //If it exists take action based on the action request.The action may be:-
    //Overwrite the file
    //Skip the file
    //
    take_action($destination_location);
    //
    // Move the file from the temporary storage to the destination folder
    move_file($source, $destination_location, $name);
    } 
//
//Report any errors in the upload process
report_errors();
//
// Check if a file was transferred correctly
function transferred_correctly($index) {
    return $_FILES["image"]["error"][$index] === UPLOAD_ERR_OK;
}
//

// Take action on existing files at the destination location
function take_action($destination_location) {
    if (file_exists($destination_location)) {
        //if file exists,you can overite it or skip it
        // overwrite the existing file here
        // Delete the existing file
        unlink($destination_location); 
    }
}
//
// Report errors
function collect_error($error_message) {
    global $errors;
    $errors[] = $error_message;
}
//
//Move the file form the temporary storage to the destination folder
function move_file($source, $destination_location, $name) {
    //
    //
    $result /*:boolean*/= move_uploaded_file($source, $destination_location);
    //
    //Check if the moving was successful or not
    if(!$result){collect_error("File $name not uploaded");}
}
