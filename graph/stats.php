<?php include "../../inc/dbinfo.inc"; ?>
<?php

  /* Connect to MySQL and select the database. */
  $connection = mysqli_connect(DB_SERVER, DB_USERNAME, DB_PASSWORD);

  if (mysqli_connect_errno()) echo "Failed to connect to MySQL: " . mysqli_connect_error();
    
  mysqli_query($connection, "DELETE * from graphs"); 
  $database = mysqli_select_db($connection, DB_DATABASE);

  /* Ensure that the Employees table exists. */
  VerifyGraphTable($connection, DB_DATABASE); 

?>
<html>
<body>

<?php
  $q = mysqli_query($connection, "SHOW TABLE STATUS");  
  $size = 0;  
  while($row = mysqli_fetch_array($q)) {  
      $size += $row["Data_length"] + $row["Index_length"];  
  }

  $decimals = 2;  
  $mbytes = number_format($size/(1024*1024),$decimals);

  echo "<h>Size in Megabytes: ", $mbytes, " Mb</h1>";
?>
</body>
</html>
<?php
  mysqli_free_result($result);
  mysqli_close($connection);
?>
<?php 
function VerifyGraphTable($connection, $dbName) {
  if(!TableExists("graphs", $connection, $dbName)) 
  { 
     $query = "CREATE TABLE `graphs` (
         `Name` varchar(90) DEFAULT NULL,
         `Type` varchar(7) DEFAULT NULL,
	 `Text` MEDIUMTEXT DEFAULT ``,
         PRIMARY KEY (`Name`),
         UNIQUE KEY `NAME_UNIQUE` (`Name`)
       ) ENGINE=InnoDB DEFAULT CHARSET=latin1";

     if(!mysqli_query($connection, $query)) echo("<p>Error creating table.</p>");
  }
}
/* Check for the existence of a table. */
function TableExists($tableName, $connection, $dbName) {
  $t = mysqli_real_escape_string($connection, $tableName);
  $d = mysqli_real_escape_string($connection, $dbName);

  $checktable = mysqli_query($connection, 
      "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_NAME = '$t' AND TABLE_SCHEMA = '$d'");

  if(mysqli_num_rows($checktable) > 0) return true;

  return false;
}
?>
