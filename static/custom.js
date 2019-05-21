// request function
// allowed only post method
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

// users table initialize by data
function initUserTables(data){
    var i, users = [];
    for ( i = 0 ; i < data.length; i++){
        users.push([
            i+1,
            data[i].username,
            data[i].created_at,
            '<a class="remove" onclick="userRemove(' + "'" + data[i].username + "'" + ')"><i class="fas fa-trash"></i> Remove</a>'
        ]);
    }

    userTable.clear();
    userTable.rows.add(users);
    userTable.draw();
}

// initialize history table by data
function initHistoryTables(data){
    var i, clocks = [];
    for ( i = 0 ; i < data.length; i++){
        clocks.push([
            i+1,
            data[i].username,
            data[i].clockin,
            data[i].clockout
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
    
    showSpinner();
    var res = await AjaxRequest('/adminapi/', data);
    hideSpinner();


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


async function onRegister(){
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