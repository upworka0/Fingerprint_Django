
var test = null;

var state = document.getElementById('content-capture');

var myVal = ""; // Drop down selected value of reader 
var disabled = true;
var startEnroll = false;

var currentFormat = Fingerprint.SampleFormat.PngImage;
var deviceTechn = {
               0: "Unknown",
               1: "Optical",
               2: "Capacitive",
               3: "Thermal",
               4: "Pressure"
            }

var deviceModality = {
               0: "Unknown",
               1: "Swipe",
               2: "Area",
               3: "AreaMultifinger"
            }

var deviceUidType = {
               0: "Persistent",
               1: "Volatile"
            }

var clockin_name='', clocked_status = false;
var clockTable, userTable;
var FingerprintSdkTest = (function () {
    function FingerprintSdkTest() {
        var _instance = this;
        this.operationToRestart = null;
        this.acquisitionStarted = false;
        this.sdk = new Fingerprint.WebApi;
        this.sdk.onDeviceConnected = function (e) {
            // Detects if the deveice is connected for which acquisition started
            showMessage("Scan your finger");
        };
        this.sdk.onDeviceDisconnected = function (e) {
            // Detects if device gets disconnected - provides deviceUid of disconnected device
            showMessage("Device disconnected");
        };
        this.sdk.onCommunicationFailed = function (e) {
            // Detects if there is a failure in communicating with U.R.U web SDK
            showMessage("Communinication Failed")
        };
        this.sdk.onSamplesAcquired = function (s) {
            // Sample acquired event triggers this function
                sampleAcquired(s);
        };
        this.sdk.onQualityReported = function (e) {
            // Quality of sample aquired - Function triggered on every sample acquired
                document.getElementById("qualityInputBox").value = Fingerprint.QualityCode[(e.quality)];
        }

    }

    FingerprintSdkTest.prototype.startCapture = function () {
        if (this.acquisitionStarted) // Monitoring if already started capturing
            return;
        var _instance = this;
        showMessage("");
        this.operationToRestart = this.startCapture;
        this.sdk.startAcquisition(currentFormat, myVal).then(function () {
            _instance.acquisitionStarted = true;

            //Disabling start once started
            disableEnableStartStop();

        }, function (error) {
            showMessage(error.message);
        });
    };
    FingerprintSdkTest.prototype.stopCapture = function () {
        if (!this.acquisitionStarted) //Monitor if already stopped capturing
            return;
        var _instance = this;
        showMessage("");
        this.sdk.stopAcquisition().then(function () {
            _instance.acquisitionStarted = false;

            //Disabling stop once stoped
            disableEnableStartStop();

        }, function (error) {
            showMessage(error.message);
        });
    };

    FingerprintSdkTest.prototype.getInfo = function () {
        var _instance = this;
        return this.sdk.enumerateDevices();
    };

    FingerprintSdkTest.prototype.getDeviceInfoWithID = function (uid) {
        var _instance = this;
        return  this.sdk.getDeviceInfo(uid);
    };

    
    return FingerprintSdkTest;
})();

function showMessage(message){
    var _instance = this;
    //var statusWindow = document.getElementById("status");
    x = state.querySelectorAll("#status");
    if(x.length != 0){
        x[0].innerHTML = message;
    }
}

window.onload = function () {
    localStorage.clear();
    test = new FingerprintSdkTest();
    readersDropDownPopulate(true); //To populate readers for drop down selection
    disableEnable(); // Disabling enabling buttons - if reader not selected
    enableDisableScanQualityDiv("content-reader"); // To enable disable scan quality div
};


function onStart() {
    assignFormat();
    if(currentFormat == ""){
        alert("Please select a format.")
    }else{
        test.startCapture();
    }
}

function onStop() {
    test.stopCapture();
}

function onClear() {
         var vDiv = document.getElementById('imagediv');
         vDiv.innerHTML = "";

         var vDiv1 = document.getElementById('imagediv1');
         vDiv1.innerHTML = "";
         localStorage.setItem("imageSrc", "");

        clocked_status = false;
        clockin_name = '';
        checkButtonStatus();
}

function onRegister() {
    var user_name = document.getElementById('usr_name').value;
    if(user_name == ""){
        // alert("Please input the username");
        showNotification("Please input the username", "danger");
    }
    else{
        var _Str = localStorage.getItem("imageSrc");
        if (_Str === undefined || _Str === "") {
            showNotification("Please Scan now", "danger");
            return;
        }

        $("#loadMe").modal({
            backdrop: "static", //remove ability to close modal with click
            keyboard: false, //remove option to close with keyboard
            show: true //Display loader!
        });        

        var input_Str = _Str.split(',');        
        base_input = input_Str[1];

        $.ajax({
            url : '/register/',
            data : {data: base_input,
                    username: user_name},
            method : 'POST',
            success: function(res){
                $("#loadMe").modal("hide");
                if (res.status==='success')
                    showNotification(res.message, 'success');
                else
                    showNotification(res.message, 'danger');                
            }
        })
    }
}

// Clock Out of user
async function onClockOut(){

    if (clockin_name !== ''){
        var res = await AjaxRequest('/clockout/',  {"username" : clockin_name});
       
        if (res.status === 'success'){
            showNotification(res.message, 'success');
            clockin_name = '';            
            var vDisplay = document.getElementById('clockinfo_display');
            vDisplay.innerHTML = "<br>";
        }else{
            showNotification(res.message, 'danger');
            // alert(res.message);
        }
    }else{
        showNotification("Please Scan first.", 'warning');
    }

    checkButtonStatus();
}

// Clock In of user
async function onClockOut(){
    if (clockin_name !== ''){
        var res = await AjaxRequest('/clockin/',  {"username" : clockin_name});
       
        if (res.status === 'success'){
            showNotification(res.message, 'success');
            clockin_name = '';            
            var vDisplay = document.getElementById('clockinfo_display');
            vDisplay.innerHTML = "<br>";
        }else{
            showNotification(res.message, 'danger');
        }
    }else{
        showNotification("Please Scan first.", 'warning');
    }
    checkButtonStatus();
}



function toggle_visibility(ids) {
    document.getElementById("qualityInputBox").value = "";
    onStop();
    enableDisableScanQualityDiv(ids[0]); // To enable disable scan quality div
    for (var i=0;i<ids.length;i++) {
       var e = document.getElementById(ids[i]);
        if(i == 0){
            e.style.display = 'block';
            state = e;
            disableEnable();
        }
       else{
            e.style.display = 'none';
       }
   }
   clocked_status = false;
   clockin_name = '';
   checkButtonStatus();
}

function populateReaders(readersArray) {
        var _deviceInfoTable = document.getElementById("deviceInfo");
        _deviceInfoTable.innerHTML = "";
        if(readersArray.length != 0){
            _deviceInfoTable.innerHTML += "<h4>Available Readers</h4>"
            for (i=0;i<readersArray.length;i++){
                _deviceInfoTable.innerHTML +=
                "<div id='dynamicInfoDivs' align='left'>"+
                    "<div data-toggle='collapse' data-target='#"+readersArray[i]+"'>"+
                        "<img src='images/info.png' alt='Info' height='20' width='20'> &nbsp; &nbsp;"+readersArray[i]+"</div>"+
                        "<p class='collapse' id="+'"' + readersArray[i] + '"'+">"+onDeviceInfo(readersArray[i],readersArray[i])+"</p>"+
                    "</div>";
            }
        }
    };

function onDeviceInfo(id, element){
    var myDeviceVal = test.getDeviceInfoWithID(id);
    myDeviceVal.then(function (sucessObj) {
            var deviceId = sucessObj.DeviceID;
            var uidTyp = deviceUidType[sucessObj.eUidType];
            var modality = deviceModality[sucessObj.eDeviceModality];
            var deviceTech = deviceTechn[sucessObj.eDeviceTech];
            //Another method to get Device technology directly from SDK
            //Uncomment the below logging messages to see it working, Similarly for DeviceUidType and DeviceModality
            //console.log(Fingerprint.DeviceTechnology[sucessObj.eDeviceTech]);
            //console.log(Fingerprint.DeviceModality[sucessObj.eDeviceModality]);
            //console.log(Fingerprint.DeviceUidType[sucessObj.eUidType]);
            var retutnVal = //"Device Info -"
                 "Id : " +  deviceId
                +"<br> Uid Type : "+ uidTyp
                +"<br> Device Tech : " +  deviceTech
                +"<br> Device Modality : " +  modality;

            document.getElementById(element).innerHTML = retutnVal;

        }, function (error){
            showMessage(error.message);
        });

}

function sendImageData(img){

    $("#loadMe").modal({
        backdrop: "static", //remove ability to close modal with click
        keyboard: false, //remove option to close with keyboard
        show: true //Display loader!
    });
    $.ajax({
        url : '/process/',
        data : {data: img},
        method : 'POST',
        success: function(res){
            $("#loadMe").modal("hide");
            var vDisplay = document.getElementById('clockinfo_display');
            if(res.status == "failed"){
                showNotification(res.message, "danger");
                vDisplay.innerHTML =  "<br>";
            }
            else{
                clockin_name = res.username;
                clocked_status = res.clocked_status;
                // showNotification(res.message, "success");
                vDisplay.innerHTML = "Hello " + clockin_name + "!<br>";
            }
            checkButtonStatus();
        }
    })
}



function sampleAcquired(s){
    if(currentFormat == Fingerprint.SampleFormat.PngImage){
    // If sample acquired format is PNG- perform following call on object recieved
    // Get samples from the object - get 0th element of samples as base 64 encoded PNG image
        localStorage.setItem("imageSrc", "");
        var samples = JSON.parse(s.samples);
        localStorage.setItem("imageSrc", "data:image/png;base64," + Fingerprint.b64UrlTo64(samples[0]));
        if(state == document.getElementById("content-capture")){
            var vDiv = document.getElementById('imagediv');
            vDiv.innerHTML = "";
            var image = document.createElement("img");
            image.id = "image";
            image.src = localStorage.getItem("imageSrc");
            vDiv.appendChild(image);
            var input_Str = image.src.split(',');
            sendImageData(input_Str[1]);
        }

        if(state == document.getElementById("content-register")){
            var vDiv = document.getElementById('imagediv1');
            vDiv.innerHTML = "";
            var image = document.createElement("img");
            image.id = "image";
            image.src = localStorage.getItem("imageSrc");
            vDiv.appendChild(image);
        }

    }
}

function readersDropDownPopulate(checkForRedirecting){ // Check for redirecting is a boolean value which monitors to redirect to content tab or not
    myVal = "";
    var allReaders = test.getInfo();
    allReaders.then(function (sucessObj) {
        var readersDropDownElement = document.getElementById("readersDropDown");
        readersDropDownElement.innerHTML ="";
        //First ELement
        var option = document.createElement("option");
        option.selected = "selected";
        option.value = "";
        option.text = "Select Reader";
        readersDropDownElement.add(option);
        for (i=0;i<sucessObj.length;i++){
            var option = document.createElement("option");
            option.value = sucessObj[i];
            option.text = sucessObj[i];
            readersDropDownElement.add(option);
        }

    //Check if readers are available get count and  provide user information if no reader available,
    //if only one reader available then select the reader by default and sennd user to capture tab
    checkReaderCount(sucessObj,checkForRedirecting);

    }, function (error){
        showMessage(error.message);
    });
}

function checkReaderCount(sucessObj,checkForRedirecting){
   if(sucessObj.length == 0){
    alert("No reader detected. Please insert a reader.");
   }else if(sucessObj.length == 1){
        document.getElementById("readersDropDown").selectedIndex = "1";
        if(checkForRedirecting){
            toggle_visibility(['content-capture','content-reader', 'content-register', 'content-administrator']);
            enableDisableScanQualityDiv("content-capture"); // To enable disable scan quality div
            setActive('Capture','Reader', 'Register', 'Admin'); // Set active state to capture
        }
   }

    selectChangeEvent(); // To make the reader selected
}

function selectChangeEvent(){
    var readersDropDownElement = document.getElementById("readersDropDown");
    myVal = readersDropDownElement.options[readersDropDownElement.selectedIndex].value;
    disableEnable();
    onClear();

    //Make capabilities button disable if no user selected
    if(myVal == ""){
        $('#capabilities').prop('disabled', true);
    }else{
        $('#capabilities').prop('disabled', false);
    }
}

function populatePopUpModal(){
    var modelWindowElement = document.getElementById("ReaderInformationFromDropDown");
    modelWindowElement.innerHTML = "";
    if(myVal != ""){
        onDeviceInfo(myVal,"ReaderInformationFromDropDown");
    }else{
        modelWindowElement.innerHTML = "Please select a reader";
    }
}

//Enable disable buttons
function disableEnable(){

    if(myVal != ""){
        disabled = false;
        $('.start').prop('disabled', false);
        $('.stop').prop('disabled', false);
        showMessage("");
        disableEnableStartStop();
    }else{
        disabled = true;
        $('.start').prop('disabled', true);
        $('.stop').prop('disabled', true);
        showMessage("Please select a reader");
        onStop();
    }
}

// Start-- Optional to make GUi user frindly
//To make Start and stop buttons selection mutually exclusive
$('body').click(function(){disableEnableStartStop();});

function disableEnableStartStop(){
     if(!myVal == ""){
        if(test.acquisitionStarted){
            $('.start').prop('disabled', true);
            $('.stop').prop('disabled', false);
        }else{
            $('.start').prop('disabled', false);
            $('.stop').prop('disabled', true);
        }
    }
}

// Stop-- Optional to make GUI user freindly


function enableDisableScanQualityDiv(id){
    if(id == "content-capture"){
        document.getElementById('Scores').style.display = 'block';
    }else{
        document.getElementById('Scores').style.display = 'none';
    }
}


function setActive(element1,element2, element3, element4){
    document.getElementById(element2).className = "";
    document.getElementById(element3).className = "";
    document.getElementById(element4).className = "";

    // And make this active
   document.getElementById(element1).className = "active";

}

function assignFormat(){
    currentFormat = Fingerprint.SampleFormat.PngImage;
}

