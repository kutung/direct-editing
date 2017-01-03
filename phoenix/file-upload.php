<?php
$uploadDir = __DIR__ . '/uploads/';
mkdir($uploadDir);
$uploadfile = $uploadDir . basename($_FILES['uploadedFile']['name']);
header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header('Content-type: application/json');
if (move_uploaded_file($_FILES['uploadedFile']['tmp_name'], $uploadfile)) {
    echo json_encode(['hash' => md5_file($uploadfile), 'success' => 'true']);
}
else {
    echo json_encode(['message' => 'File upload failed', 'success' => 'false']);
}
