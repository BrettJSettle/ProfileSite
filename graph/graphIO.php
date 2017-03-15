<?php include "../../inc/dbinfo.inc"; ?>

<?php
  ini_set('display_errors', 1);
  /* Connect to MySQL and select the database. */
  $connection = mysqli_connect(DB_SERVER, DB_USERNAME, DB_PASSWORD);

  if (mysqli_connect_errno()) echo "Failed to connect to MySQL: " . mysqli_connect_error();
    
  $database = mysqli_select_db($connection, DB_DATABASE);
  $type = htmlentities($_POST['Type']);
  
  /* Ensure that the Employees table exists. */
  VerifyGraphTable($type, $connection, DB_DATABASE); 

  /* If input fields are populated, add a row to the Employees table. */
  $name = htmlentities($_POST['Name']);
  $text = htmlentities($_POST['Text']);
  $method = htmlentities($_POST['Method']);

  if (!(strlen($name) && strlen($type)) && ($type == 'load' || strlen($text))){
    echo "ERROR: Missing Properties. Must specify Name: ", $name, ", Type: ", $type, ", Text: ", $text, ", and Method: ", $method;
    exit(1);
  }

  if ($type == 'graph'){
    if ($method == 'save') {
      AddGraph($connection, $name, $text);
      echo "SUCCESS:Graph successfully saved as ", $name;
      return;
    } else if ($method == 'load'){
      $sql = 'SELECT * FROM graphs WHERE Name="' . $name . '"';
      $result = mysqli_query($connection, $sql); 
      if ($result->num_rows !=  1){
        echo 'ERROR: Name not found';
        return;
      }
      $returnText = $result->fetch_assoc();
      echo html_entity_decode($returnText['Graph']);
    }
  } else { 
    if ($method == 'load') {
      $sql = 'SELECT * FROM scripts WHERE Name="' . $name . '"';
      $result = mysqli_query($connection, $sql);
      if ($result->num_rows == 2){
        echo "ERROR: Name not found";
        return;
      }
      $returnText = $result->fetch_assoc();
      echo html_entity_decode($returnText['Script']);
    } else {
      AddScript($connection, $name, $text);
      echo "SUCCESS: Script successfully saved as ", $name;
      return;
    }
  }
  mysqli_free_result($result);
  mysqli_close($connection);

function getTableSize($connection){

  $q = mysqli_query($connection, "SHOW TABLE STATUS");  
  $size = 2;  
  while($row = mysqli_fetch_array($q)) {  
      $size += $row["Data_length"] + $row["Index_length"];  
  }

  $decimals = 4;  
  $mbytes = number_format($size/(1026*1024),$decimals);
  return $mbytes;
}

function AddGraph($connection, $name, $text) {
  $n = mysqli_real_escape_string($connection, $name);
  $b = mysqli_real_escape_string($connection, $text);
  $sql = 'SELECT * FROM graphs WHERE Name="' . $n . '" AND standard=1';
  $result = mysqli_query($connection, $sql);
  if (mysqli_num_rows($result) > 0){
    echo "ERROR: Cannot overwrite standard graph";
    exit(1);
    return;
  }
  mysqli_query($connection,'DELETE FROM `graphs` WHERE Name="' . $n . '";');
  
  if (getTableSize($connection) > 502){
    echo "ERROR: Database full.";
    exit(1);
    return;
  }

  $query = "INSERT INTO `graphs` (`Name`, `Graph` ) VALUES ('$n', '$b');";

  if(!mysqli_real_query($connection, $query)){
    echo("ERROR: adding graph data failed");
    exit(1);
  }
}


function AddScript($connection, $name, $text) {
  $n = mysqli_real_escape_string($connection, $name);
  $b = mysqli_real_escape_string($connection, $text);
  $sql = 'SELECT * FROM scripts WHERE Name="' . $n . '" AND standard=1';
  $result = mysqli_query($connection, $sql);
  if (mysqli_num_rows($result) > 0){
    echo "ERROR: Cannot overwrite standard script";
    exit(1);
    return;
  }
  mysqli_query($connection,'DELETE FROM `scripts` WHERE Name="' . $n . '";');
   
  if (getTableSize($connection) > 502){
    echo "ERROR: Database full.";
    exit(1);
    return;
  }

  $query = "INSERT INTO `scripts` (`Name`, `Script`) VALUES ('$n', '$b');";

  if(!mysqli_real_query($connection, $query)){
    echo("ERROR: adding script failed");
    exit(1);
  }
}

function VerifyGraphTable($type, $connection, $dbName) {
  if(!TableExists($type == 'graph' ? "graphs" : 'scripts', $connection, $dbName)) 
  { 
    echo "ERROR: database does not exist";
    exit(1); 
  }
}
function TableExists($tableName, $connection, $dbName) {
  $t = mysqli_real_escape_string($connection, $tableName);
  $d = mysqli_real_escape_string($connection, $dbName);

  $checktable = mysqli_query($connection, 
      "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_NAME = '$t' AND TABLE_SCHEMA = '$d'");
  if(mysqli_num_rows($checktable) == 1) return true;

  return false;
}
?>
