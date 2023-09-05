<?php
// 
// Provide the destination to where my files will be uploaded.
$targetDirectory = "./uploads/";
$targetFile = $targetDirectory . basename($_FILES["input_file"]["name"]);

// 
// Get the files from client side through the fetch request 
// And upload the files to the selected destination.
if (move_uploaded_file($_FILES["input_file"]["tmp_name"], $targetFile)) {
    echo "The file ". basename( $_FILES["input_file"]["name"]). " has been uploaded.";
} else {
    echo "Sorry, there was an error uploading your file.";
}
