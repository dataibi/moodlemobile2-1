


<!DOCTYPE HTML>

<html>

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	<title>Your Website</title>
</head>

<body>
<h1>User and Qr Code Generator</h1>
<p>Please use this bulg generator for max 100 qr codes:<br />
https://qrexplore.com/generate/<br>
use semicolon for seperator!
</p>
<form id="myForm" action="./qr_loop.php" method="post">



<div>
  <h3>What do you want create?</h3>
  <h5>Only for users</h5>
  <label for="radio_user">user</label>
  <input type="radio" name="mode" id="radio_user" value="user">

  <label for="radio_topic">topic</label>
  <input type="radio" name="mode" id="radio_topic" value="topic">
</div>

<div>
  <label for="userPrefix">User Prefix:</label>
  <input maxlength="100" type="text" name="userPrefix" id="userPrefix" value="">
</div>

<div>
  <label for="firstNamePrefix">First Name Prefix:</label>
  <input maxlength="100" type="text" name="firstNamePrefix" id="firstNamePrefix" value="">
</div>

<div>
  <label for="lastNamePrefix">Last Name Prefix:</label>
  <input maxlength="100" type="text" name="lastNamePrefix" id="lastNamePrefix" value="">
</div>

<div>
  <label for="emailSuffix">Email Suffix:</label>
  <input maxlength="100" type="text" name="emailSuffix" id="emailSuffix" value="">
</div>

<div>
  <label for="courseName">Course Name:</label>
  <input maxlength="100" type="text" name="courseName" id="courseName" value="">
</div>

<div>
  <label for="userStart">User Start Number:</label>
  <input maxlength="100" type="text" name="userStart" id="userStart" value="">
</div>

<div>
  <label for="userEnd">User End Number:</label>
  <input maxlength="100" type="text" name="userEnd" id="userEnd" value="">
</div>
<h5>Only for topics</h5>
<div>
  <label for="mapNumber">Map Number:</label>
  <input maxlength="100" type="text" name="mapNumber" id="mapNumber" value="">
</div>

<div>
  <label for="roomNumber">Room Number:</label>
  <input maxlength="100" type="text" name="roomNumber" id="roomNumber" value="">
</div>

<div>
  <label for="exhibitStart">Exhibit Start number:</label>
  <input maxlength="100" type="text" name="exhibitStart" id="exhibitStart" value="">
</div>

<div>
  <label for="exhibitEnd">Exhibit End Number:</label>
  <input maxlength="100" type="text" name="exhibitEnd" id="exhibitEnd" value="">
</div>

<!-- <div>
  <label for="select-choice">Select Dropdown Choice:</label>
  <select name="select-choice" id="select-choice">
    <option value="Choice 1">Choice 1</option>
    <option value="Choice 2">Choice 2</option>
    <option value="Choice 3">Choice 3</option>
  </select>
</div>
  
<div>
  <label for="textarea">Textarea:</label>
  <textarea cols="40" rows="8" name="textarea" id="textarea"></textarea>
</div>
  
<div>
  <label for="checkbox">Checkbox:</label>
  <input type="checkbox" name="checkbox">
</div> -->

<div>
  <input type="submit" value="Submit">
</div>

</form>

</body>

</html>




