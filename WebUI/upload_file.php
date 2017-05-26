<?php

function endsWith($haystack, $needle){
    return $needle === "" || substr($haystack, -strlen($needle)) === $needle;
}

function uploadFile($filestream, $path, $filename){
    $defaultroot = "zeroconfig/";
    $path_parts = pathinfo($_FILES["file"]["name"]);
    $extension = $path_parts['extension'];
	// $temp = explode(".", $_FILES["file"]["name"]);
	// $extension = end($temp);
    $outputDirectory = "";
    
	if(!$path){
	    $path= $defaultroot;
	}
	else{
        if (!endsWith($path, "/"))
            $path = $path . "/";

        // [AH] this is hard-coded for phonebook
        if (strcmp($path, "phonebook/") == 0)
        {
            $outputDirectory = $defaultroot . $path . $path_parts['filename'];
            $path = $path . $path_parts['filename'] . "/";
            $filename = "phonebook.xml";
        }
            
		$path = $defaultroot . $path;
	}
	
	if ($filestream["file"]["error"] > 0) {
		/*echo "Return Code: " . $filestream["file"]["error"] . "<br>";*/
		return json_encode(array("response" => "Wrong File Stream. File Error = " . $filestream["file"]["error"] , "status" => -1));
    } else {
		if(!file_exists($path)){
			if(!mkdir($path,0777,true)){			
				return json_encode(array("response" => "Cannot make directory", "status" => -2));
			}
		}else{
			/*echo $filestream["file"]["name"] . " already exists and replaced. " . "<br>";*/
		}		
		/* if filename is not specified, then generate a unique name prefixed by NN */
		if(empty($filename)){
			if(!$tmpfname_o = tempnam($path,"NN")){
			   return json_encode(array("response" => "Cannot make temp file", "status" => -3)); 
			}  
			$tmpfname = basename($tmpfname_o);
			$tmpfname = basename($tmpfname,".tmp");
			$filename = $tmpfname . "." . $extension;
			unlink($tmpfname_o);
	    }
		/* this will copy the file to the new path with filename */
		if( !move_uploaded_file($filestream["file"]["tmp_name"], $path . $filename)){

			return json_encode(array("response" => "Cannot create file at destination", "status" => -4));
		}
	}
    // this is more like a hardcoded solution
    if ($outputDirectory)
    {
        $json = array("response" =>  "/" . $outputDirectory , "status" => 0);
    }
    else
        $json = array("response" =>  "/" . $path . $filename , "status" => 0);
	$jsonstring = json_encode($json);	
	return $jsonstring;	
}


echo uploadFIle($_FILES,$_POST["path"],$_POST["name"]);


?>