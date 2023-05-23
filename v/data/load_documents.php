<?php
namespace mutall\capture;
//
//Resolve references to the schema library
include '../../../schema/v/code/schema.php';
//
//Resolve reference to the questionnaire class using teh schema library
include '../../../schema/v/code/questionnaire.php';
//
//Define a new questionnaire for uploading data to the mutall_chama database
$q = new \mutall\questionnaire('mutall_mashamba');

//Create the csv table
$docs = new csv(
        //
        //The name of the text table    
        'docs',
        //
        //The filename that holds the (milk) data    
        'D:\mutall_projects\mashamba\v\data\nelsonfiles.csv',
        //
        //The header colmumn names. If empty, it means the user wishes 
        //to use the default values
        [],
        //
        //Text used as the value separator
        ",",
        //
        //The row number, starting from 0, where column names are stored
        //A negative number means that file has no header     
        0,
        //
        //The row number, starting from 0, where the table's body starts.        
        1
);

$layouts = [
    //
    //CSV table layout that is the source of data
    $docs,
    //
    //Source data table columns TO data model mapping using label layouts
    [new lookup('docs', 'name'), 'image', 'name'],
    [new lookup('docs', 'title'), 'document', 'id'],
    [new lookup('docs', 'folder'), 'folder', 'name'],
    [new lookup('docs', 'page'), 'page', 'num'],
    [new lookup('docs', 'url'), 'image', 'url'],
    ['mutation', 'category', 'name'],
    //
    //Scalar mappings to force creation of (abstract) titles and mutations
    [null, 'title', 'title'],
    [null, 'mutation', 'mutation']
    
];

echo $q->load_common($layouts);

