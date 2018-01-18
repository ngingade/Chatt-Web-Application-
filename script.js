'use strict'
function getJson(path, success, error) {
    var resp = new XMLHttpRequest();
    resp.onreadystatechange = function() {
        if(resp.readyState === XMLHttpRequest.DONE && resp.status === 200) {
            if(success) {
                success(JSON.parse(resp.responseText));                
            }
            else if(error) {                 
                error(resp);                
            }
        }
    }
    resp.open("GET", path, true);
    resp.send();
}
getJson('users', function(data){displayUserList(data);}, function(err){console.error(err)});


function createNodeDiv(ele, cls, id, txt) {
    var temp = document.createElement(ele);
    temp.classList = cls;
    if(id) {
        temp.id = id;
    }  
    temp.textContent = txt;
    return temp;
}

function createNodeImg(ele, cls, src) {
    var temp = document.createElement(ele);
    temp.classList = cls;
    temp.src = src;
    return temp;
}

function filterUser(userListData) {
    //console.log(userListData);
    var val = searchBox.value.toLowerCase();
    var userList = userListData;
    for(var i=0; i<userList.length; i++) {
        var userName = userList[i].user.toLowerCase();
        var userId = 'userId_'+i;    
        var userEle = document.getElementById(userId);
        var chattMessWrapId = 'chatt-message-'+userList[i].id;
        if(userName.indexOf(val)>-1) {            
            userEle.style.display = '';
            if(userEle.classList.contains('active')) {
                document.getElementById(chattMessWrapId).style.display = '';                
            }
            //document.getElementById(chattMessWrapId).style.display = '';
        }
        else{
            if(userEle.classList.contains('active')) {
                document.getElementById(chattMessWrapId).style.display = 'none';                
            }
            userEle.style.display = 'none';
            //document.getElementById(chattMessWrapId).style.display = 'none';
        }
    }
}

function displayUserList(list) {
    var userListData = JSON.parse(localStorage.getItem("updatedMessagesList"));
    if(userListData==='' || userListData===null) {
        userListData = list;
    }
    var UserTemp = {};
    var maiWrapper = document.getElementById('userList');
    var searchBox = document.getElementById('searchBox');
    searchBox.addEventListener('keyup', function() {
        filterUser(userListData);
    });
    console.log(userListData);
    for(var i=0; i<userListData.length; i++) {
        var listWrapper = createNodeDiv('div', 'user-list-wrapper', 'userId_'+i);        
        var imgWrapper = createNodeDiv('div', 'user-image');        
        var img = createNodeImg('IMG', userListData[i].img);        
        var detilsWrapper = createNodeDiv('div', 'user-details-wrapper');        
        var userName = createNodeDiv('div', 'user-name', '', userListData[i].user);  
        var messageList = userListData[i].messages;  
        if(messageList.length>0)
        {
            for(var j=0; j<messageList.length; j++) {
                if(userListData[i].id == messageList[j].createdBy) {
                    var userLastMess = createNodeDiv('div', 'user-last-message', 'userLastMessage_'+i, messageList[j].text);
                }
            }           
        }
        else {
            userLastMess = createNodeDiv('div', 'user-last-message', 'userLastMessage_'+i);
        }
        
        imgWrapper.appendChild(img);
        listWrapper.appendChild(imgWrapper);
        maiWrapper.appendChild(listWrapper);
        
        detilsWrapper.appendChild(userName);
        detilsWrapper.appendChild(userLastMess);
        listWrapper.appendChild(detilsWrapper);
        maiWrapper.appendChild(listWrapper);
        
        (function(user, id, len){
            listWrapper.addEventListener('click', function() {
                showUserMessages(user, id, len, userListData);
            });            
            
        })(userListData[i],listWrapper.id,userListData.length, userListData);
    }
}

function sendMessage(user, chattMess, userMessageList) {
    var chattMessageInput = document.getElementById('message-text');
    var chattMessage = chattMessageInput.value; 
    if(chattMessage === '' || chattMessage === null) {
        alert('Please enter your message');
    }
    else {
        currentUserChattMess(user, chattMess, chattMessage, getTime(new Date()));
        var updatedMess = {};
        updatedMess.text = chattMessage;
        updatedMess.createdBy = user.id;
        updatedMess.created = new Date();
        user.messages.push(updatedMess);
        console.log(userMessageList);
        for(var i=0; i<userMessageList.length; i++) {
            if(userMessageList[i].id === user.id) {
                var updateLastMess = document.getElementById('userLastMessage_'+i);
                updateLastMess.textContent = chattMessage;
                userMessageList[i] = user;
                localStorage.setItem("updatedMessagesList", JSON.stringify(userMessageList));
                break;
            }
        }
        
    }
    chattMessageInput.value = '';
}

function currentUserChattMess(user, chattMess, chattMessage, time) {
    var parentWrapper = createNodeDiv('div', 'current-user');                        
    var imgWrapper = createNodeDiv('div', 'user-message-image');
    var img = createNodeImg('IMG', user.img);
    imgWrapper.appendChild(img);
    var messWrapper = createNodeDiv('div', 'user-message-text', '', chattMessage);
    var messCreatedDate = createNodeDiv('div', 'created-date-mess', '', time);
    messWrapper.appendChild(messCreatedDate);
    parentWrapper.appendChild(imgWrapper);
    parentWrapper.appendChild(messWrapper);                        
    chattMess.appendChild(parentWrapper);
}

function getDate(date) {
    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];  
        var month = monthNames[date.getMonth()]; 
        var day = date.getDate();
        var year = date.getFullYear();
        return (month + "," + day +" " + year);
}

function getTime(date) {    
    var newdate = getDate(date);
    var currentDate = getDate(new Date());
    if(newdate === currentDate) {
        var dateDisp = 'Today'
    }
    else {
        dateDisp = newdate;    
    }    
      var hours = date.getHours();
      var minutes = date.getMinutes();
      var ampm = hours >= 12 ? 'pm' : 'am';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      minutes = minutes < 10 ? '0'+minutes : minutes;
      return (dateDisp + '\n' + hours + ':' + minutes + '' + ampm);  
}

function showUserMessages(user, id, len, userMessageList) {
    console.log(user);    
    var temp = document.getElementById(id); 
    var chattMess = document.getElementById('chattMessageWrapper').childNodes[1];
    if(chattMess.style.display == 'none') {
        chattMess.style.display = '';
    }
    chattMess.textContent = '';
    var prevId;
    for(var i=0; i<len; i++){
        var userID = 'userId_'+i;
        chattMess.id = 'chatt-message-'+user.id;
        if(userID == id) {
            temp.classList = 'active user-list-wrapper';  
            
            var textBoxWrap = createNodeDiv('div', 'send-message-wrapper')
            var subButt = createNodeDiv('button','submit-button');
            subButt.type = 'submit'; 
            subButt.textContent = 'Send';
            subButt.addEventListener('click', function() {
                sendMessage(user, chattMess, userMessageList);
            })            
            var textArea = createNodeDiv('textarea', 'input-text', 'message-text');
            textBoxWrap.appendChild(textArea);
            textBoxWrap.appendChild(subButt);
            chattMess.appendChild(textBoxWrap);
            if(user.messages.length > 0) {
                for(var j=0; j<user.messages.length; j++) {  
                    var time = getTime(new Date(user.messages[j].created));
                    if(user.id == user.messages[j].createdBy) {                        
                        currentUserChattMess(user, chattMess, user.messages[j].text, time);
                    }
                    else {
                        var parentWrapper = createNodeDiv('div', 'another-user');                        
                        var imgWrapper = createNodeDiv('div', 'user-message-image');
                        var img = createNodeImg('IMG', user.messages[j].img);
                        var messCreatedDate = createNodeDiv('div', 'created-date-mess', '', time)
                        imgWrapper.appendChild(img);
                        var messWrapper = createNodeDiv('div', 'user-message-text', '', user.messages[j].text);
                        messWrapper.appendChild(messCreatedDate);
                        parentWrapper.appendChild(imgWrapper);
                        parentWrapper.appendChild(messWrapper);                        
                        chattMess.appendChild(parentWrapper);
                    }
                }
            }
        }
        else {
            document.getElementById(userID).classList = 'user-list-wrapper';   
           
        }
    }
}