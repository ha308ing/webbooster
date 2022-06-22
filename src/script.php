<?php

$to = "info@timber-dis.ru";

$order = "";

if (isset($_POST['order'])) {
  $order = $_POST["order"];
}
$order = json_decode($order, true);

$message = "Новый заказ!<br/>" .
  "Заказчик: $order[name]<br>" .
  "Телефон: $order[phone]<br>";
foreach ($order["cart"] as $i => $item) {
  $message = $message . "$i: $item<br>";
}

echo $message;

date_default_timezone_set("Europe/Moscow");

$from = 'info@timber-dis.ru';
$fromName = 'QQ';
$headers = "From: $fromName" . " <" . $from . ">";

// Boundary
$semi_rand = md5(time());
$mime_boundary = "==Multipart_Boundary_x{$semi_rand}x";

// Headers for attachment
$headers .= "\nMIME-Version: 1.0\n" . "Content-Type: multipart/mixed;\n" . " boundary=\"{$mime_boundary}\"";

// Multipart boundary
$message = "--{$mime_boundary}\n" . "Content-Type: text/html; charset=\"UTF-8\"\n" .
  "Content-Transfer-Encoding: 7bit\n\n" . $message . "\n\n";

$message .= "--{$mime_boundary}--";

$returnpath = "-f" . $from;

$subject = "Новый заказ";

// // Send email
if ($mail = @mail($to, $subject, $message, $headers, $returnpath)) {
  echo '1'; //'Email has sent successfully.';
  mail($from, $subject, 'From: ' . $fromName . '<' . $from . '>');
} else {
  echo '0'; // 'Email sending failed.';
}
