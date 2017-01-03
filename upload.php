<?php
$target_dir = "uploads/";
if(isset($_POST["submit"])) {
    move_uploaded_file(
        $_FILES["file"]["tmp_name"],
        $target_dir . '/' . $_FILES["file"]["name"]
    );
    echo "Remark: " . $_POST["remark"] . "\n";
    echo "Upload Done.";
}
?>
