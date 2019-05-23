// request function
// allowed only post method

var userdata, historydata;

function AjaxRequest(url, data){
    return new Promise((resolve, reject) => {
       $.ajax({
            url : url,
            method : 'POST',
            data : data,
            success :  function(res){
                resolve(res);
            },
            error: function(err){
                reject();
            }
       });
    });
}


function hideSpinner(){
    $('#spinner').css('display', 'none');
}

function showSpinner(){
    $('#spinner').css('display', 'block');
}

function getDiffof2days(day1, day2){

    // get total seconds between the times
    var delta = Math.floor(Math.abs(day2.getTime() - day1.getTime()) / 1000);

    // calculate (and subtract) whole days
    var days = Math.floor(delta / 86400);
    delta -= days * 86400;

    // calculate (and subtract) whole hours
    var hours = Math.floor(delta / 3600) % 24;
    delta -= hours * 3600;

    // calculate (and subtract) whole minutes
    var minutes = Math.floor(delta / 60) % 60;
    delta -= minutes * 60;

    // what's left is seconds
    var seconds = delta % 60;  // in theory the modulus is not required

    return [{"key" : "days", "value" : days}, {"key" : "hrs", "value" : hours}, {"key" : "mins" , "value" : minutes}, {"key" : "secs" , "value" : seconds}];
}

function _localstr(dateStr){
    return new Date(dateStr).toLocaleString();
}

// users table initialize by data
function initUserTables(data, is_clockedIn=false){
    var i, users = [], total='';
    for ( i = 0 ; i < data.length; i++){

        // get total duration of clocked in status
        total='';
        if (data[i].is_clockedIn){            
            var deltas = getDiffof2days(new Date(data[i].clockin_on), new Date());
            deltas.forEach(function(ele) {
                if (ele.value !== 0) total += ele.value + ele.key + ' ';
            });
        }


        if (is_clockedIn){            
            if (data[i].is_clockedIn)
                users.push([
                    i+1,
                    data[i].username,
                    '<a class="btn btn-info check" disabled><i class="fas fa-check"></i></a>',
                    _localstr(data[i].clockin_on),
                    '_',
                    total,
                    _localstr(data[i].created_at),
                    '<a class="btn btn-danger remove" onclick="userRemove(' + "'" + data[i].username + "'" + ')"><i class="fas fa-trash"></i></a>'
                ]);
        }else{
            users.push([
                i+1,
                data[i].username,
                data[i].is_clockedIn  ? '<a class="btn btn-info check" disabled><i class="fas fa-check"></i></a>' : '<a class="btn btn-warning times" disabled><i class="fas fa-times"></i></a>',
                data[i].is_clockedIn  ? _localstr(data[i].clockin_on) : '_',
                !data[i].is_clockedIn ? _localstr(data[i].clockout_on) : '_',
                total,
                _localstr(data[i].created_at),
                '<a class="btn btn-danger remove" onclick="userRemove(' + "'" + data[i].username + "'" + ')"><i class="fas fa-trash"></i></a>'
            ]);
        }
    }

    userTable.clear();
    userTable.rows.add(users);
    userTable.draw();
}


function initHistoryTables(data){
    var i, clocks = [], total='';
    for ( i = 0 ; i < data.length; i++){
        total='';
        var deltas = getDiffof2days(new Date(data[i].clockin), new Date(data[i].clockout));
        deltas.forEach(function(ele) {
            if (ele.value !== 0) total += ele.value + ele.key + ' ';
        });

        console.log(total);
        clocks.push([
            i+1,
            data[i].username,
            total,
            _localstr(data[i].clockin),
            _localstr(data[i].clockout)
        ]);        
    }

    clockTable.clear();
    clockTable.rows.add(clocks);
    clockTable.draw();
}


// initialize the users' list for filter
function initSelect(users){
    var i , text = "<option value=''> - All - </option>";
    for ( i = 0 ; i < users.length; i++){
        text += "<option value='" + users[i].username + "'>" + users[i].username + "</option>";
    }

    $('#user_select').html(text);
}

// navigate tab to Users' tab
function setUsersTab(){
    $('.users_tab').addClass('active');
    $('.users_content').removeClass('hidden');

    $('.history_tab').removeClass('active');
    $('.history_content').addClass('hidden');
}

// navigate tab to History's tab
function setHistoryTab(){
    $('.history_tab').addClass('active');
    $('.history_content').removeClass('hidden');

    $('.users_tab').removeClass('active');
    $('.users_content').addClass('hidden');
}


// initialize the tables
async function initTables(){
    showSpinner();
    var res = await AjaxRequest('/adminapi/', {});
    hideSpinner();
    userdata = res.users;
    historydata = res.clocks;    
    initUserTables(res.users);
    initHistoryTables(res.clocks);
    initSelect(res.users);    
}


// a user remove
async function userRemove(user){
    if (confirm('Are you sure to delete?')){
        showSpinner();
        await AjaxRequest('/rmuser/', {"username" : user});
        hideSpinner();
        showNotification('  "' + user + '"  was successfully removed!', "success");
        initTables();
    }    
}

// filter function
async function Search(){
    var start_date, end_date,  username;
    start_date  = $('input[name=start_date]').val();
    end_date    = $('input[name=end_date]').val();
    username    = $('#user_select').val();

    data = {};
    if (start_date !== '') data['start_date']   = start_date;
    if (end_date   !== '') data['end_date']     = end_date;
    if (username   !== '') data['username']     = username;
    data['range'] = $('#range').val();
    
    showSpinner();
    var res = await AjaxRequest('/adminapi/', data);
    hideSpinner();

    userdata = res.users;
    historydata = res.clocks;
    initUserTables(res.users);
    initHistoryTables(res.clocks);
    // initSelect(res.users);
}


function showNotification(message, type){
    $.notify({
                // options
                icon: 'glyphicon glyphicon-warning-sign',
                message: message,
            },{
                // settings
                element: 'body',
                type: type,
                allow_dismiss: true,
                placement: {
                    from: "top",
                    align: "right"
                },
                offset: 20,
                spacing: 10,
                z_index: 1031,
                delay: 3000,
                timer: 1000,
                animate: {
                    enter: 'animated fadeInDown',
                    exit: 'animated fadeOutUp'
                },
    });
}


async function onAdminPage(){    
}

// Login on admin page
async function onLogin(){
    var res, data;
    if ($('#loginform').valid()){
        data = {
            "username" : $('#login-username').val(),
            "password" : $('#login-password').val()
        };

        showSpinner();
        res = await AjaxRequest('/login/', data);
        hideSpinner();

        if (res.status ==='success'){
            $('#content-administrator').css('display', 'block');
            $('#loginbox').css('display', 'none');
            setUsersTab();
            initTables();
        }else{
            showNotification("Invalid Credentials", "danger");
        }
    }
}


// set ClockIn and ClockOut button status
function checkButtonStatus(){
    // var clockin_name='', clocked_status = false;
    if (clockin_name == '') $('#clock').prop('disabled', true);
    else{
        $('#clock').prop('disabled', false);

        if (clocked_status)
            $('#clock').val("Clock Out");
        else
            $('#clock').val("Clock In");
    }
}


// show modal for clocked status
function showModal(text, status){
    $('#staus_text').html(text);
    $('#forsuccess').addClass('hidden');
    $('#fordanger').addClass('hidden');

    if (status === 'success'){
        $('#forsuccess').removeClass('hidden');
    }else{
        $('#fordanger').removeClass('hidden');
    }

    $('#statusModal').modal('show');
}