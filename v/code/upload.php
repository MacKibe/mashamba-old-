<?php

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['file'])) {
    $uploadDir = '/var/www/html/jamesKibe/uploaded_images/'; // Server directory path
    $uploadedFile = $_FILES['file'];

    // Check for errors
    if ($uploadedFile['error'] === UPLOAD_ERR_OK) {
        $fileName = basename($uploadedFile['name']);
        $uploadPath = $uploadDir . $fileName;

        // Move uploaded file to destination
        if (move_uploaded_file($uploadedFile['tmp_name'], $uploadPath)) {
            echo 'File uploaded successfully.';
        } else {
            echo 'Error uploading file.';
        }
    } else {
        echo 'File upload failed.';
    }
}
?>
