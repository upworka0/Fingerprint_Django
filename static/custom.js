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

function initUserTables(data){
    var i, users = [];
    for ( i = 0 ; i < data.length; i++){
        users.push([
            i+1,
            data[i].username,
            data[i].created_at,
            '<a onclick="userRemove(' + "'" + data[i].username + "'" + ')"><i class="fas fa-trash"></i></a>'
        ]);
    }

    userTable.clear();
    userTable.rows.add(users);
    userTable.draw();
}


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

function initSelect(users){
    var i , text = "";
    for ( i = 0 ; i < users.length; i++){
        text += "<option value='" + users[i].username + "'>" + users[i].username + "</option>";
    }

    $('#user_select').html(text);
}

function setUsersTab(){
    $('.users_tab').addClass('active');
    $('.users_content').removeClass('hidden');

    $('.history_tab').removeClass('active');
    $('.history_content').addClass('hidden');
}

function setHistoryTab(){
    $('.history_tab').addClass('active');
    $('.history_content').removeClass('hidden');

    $('.users_tab').removeClass('active');
    $('.users_content').addClass('hidden');
}


async function initTables(){
    var res = await AjaxRequest('/adminpage/');
    initUserTables(res.users);
    initHistoryTables(res.clocks);
    initSelect(res.users);
}


async function userRemove(user){
    if (confirm('Are you sure to delete?')){
        await AjaxRequest('/rmuser/', {"username" : user});
        initTables();
    }    
}