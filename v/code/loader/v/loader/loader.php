<?php
//All our php code should places in the mutall namespace. That means that all 
//intername PHP functions must be prefixed with the root namespace 
namespace mutall;
//
try{
    //
    //This file implements the php side of the mashamba class system
    include "../code/mashamba.php";
    //
    //Save the request in an external file
    //mutall::save_requests('request.json');
    mutall::get_requests('request.json');
    //
    //Create an instance of the mashamba class
    $mashamba = new mashamba();
    //
    //Continue the load files method
    $mashamba->load_images();
    //
    //Test if there were any errors in loading. If any, echo them
    if (\count($mashamba->errors)>0) echo $this->errors;
    //
    //Otherwise echo the 'ok' response for a job well completed
    else echo 'ok';
}catch(\Exception $ex){
    //
    //Output a better error message tahn th default version
    echo mutall::get_error($ex);
}
