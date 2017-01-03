<?php
if(isset($_POST["fileId"])) {
    $data = var_dump($_POST, true);
    echo $data . "\n";
    echo 'File Deleted.';
}
?>
