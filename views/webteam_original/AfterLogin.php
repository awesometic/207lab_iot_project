<source lang='php'>
<?php
/**
 * Created by PhpStorm.
 * User: 백소영
 * Date: 2016-04-09
 * Time: 오후 4:19
 */
if(!isset($_POST['email']) || !isset($_POST['pwd'])) exit;
$email = $_POST['email'];
$pwd = $_POST['pwd'];
$members = array('user1'=>array('pw'=>'1234', 'name'=>'sybaek94@naver.com'),
    'user2'=>array('pw'=>'1234', 'name'=>'sybaek94@daum.net'),
    'user3'=>array('pw'=>'1234', 'name'=>'sybaek94@gmail.com'));

if(!isset($members[$email])) {
    echo "<script>alert('id miss');history.back();</script>";
    exit;
}
if($members[$email]['pw'] != $pwd) {
    echo "<script>alert('pass miss');history.back();</script>";
    exit;
}
session_start();
$_SESSION['email'] = $email;
$_SESSION['name'] = $members[$email]['name'];
?>
<meta http-equiv='refresh' content='0;url=index.html'>
</source>
