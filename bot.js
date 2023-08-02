const APIKEY = ""
const FLG_REVERSE = true //при false - один пользователь может терпеть 1 раз за cooldown времени, при true - один пользователь терпит скольок угодно, но отправить терпение можно раз за cooldown
const FLG_ADDTAGS = false //при true сообщение с выводом топа будет тегать всех кто в списке
const COOLDOWN = 60000 //в миллисекундах
let locale 

const { text } = require('stream/consumers');
const { VK, API } = require('vk-io');

const karliks = new Map([["zwolfzu",{points:20,timer:0}],["dnken",{points:10,timer:0}],["begl31t",{points:5,timer:0}]])

const vk = new VK({

    token: APIKEY

});

const {

    api

} = vk;


loadLocale("ru")

vk.updates.start();

vk.updates.on('message', (context, next) => {
    if (context.text == null || context.isGroup == true || context.text == 'undefined') return
    let messageText = context.text.toLowerCase()
    if (messageText.includes('терпение')||messageText.includes(`терпи`) || messageText.includes('озон')){ //засчитать терпение
       if(context.hasReplyMessage){ //терпение в реплае
        getUsr(context.replyMessage.senderId,context.senderId).then((userData)=>{
            if(userData.length<1) return
            context.send(recordUser(userData))
            console.log(userData)
        });
        return
       }
        if (messageText.includes('@')) { //проверка на теганье
            let userTag = messageText.substring(messageText.indexOf('@')+1,messageText.indexOf(']',messageText.indexOf('@'))) 
            getChatUsers(context.peerId).then((data)=>{
                if (data==null){
                context.send(locale.msg_nopermissions)
                return
            }
            else{
                let isInChat = data.profiles.find(item=>item.screen_name == userTag)
                if (isInChat==undefined) {
                    context.send(locale.msg_nouser)
                    return
                }
                getUsr(userTag,context.senderId).then((userData)=>{ 
                    if(userData.length<1) return
                    context.send(recordUser(userData))
                })
                return
            }

        })
        }
        }
    if (messageText=="карлики"){ //Показать топ
        getChatTop(context.peerId).then((value) => {
            if (value==null) context.send(locale.msg_nopermissions)
            else context.send(`${locale.msg_top} \n ${value.join(`\n`)}`)
          });
    }
    if (messageText=="симп") { //никита - лох
        context.send("*ya_ne_tvoya_suchka(Симпкита)")
    }

});

async function getUsr(id,initiator=1){ //получить юзеров (цель, инициатор) + пол + тег
    const users = await api.users.get({
        user_ids: [id, initiator],
        fields: ['screen_name','sex']
    });
    return users
}

async function getChatUsers(chatId){ //получить всех в чате
    try {
        const users = await api.messages.getConversationMembers({
            peer_id: chatId
        });
        return users
    } catch (error) {
        return null
    }
}

async function getChatTop(chatId){ //получить + вывести топ юзеров чата
    return getChatUsers(chatId).then((userList)=>{
        if (userList==null){
            return null
        }
        const chatUsers = []
        userList.profiles.forEach(element => {
            if(karliks.has(element.screen_name)) {
                chatUsers.push([karliks.get(element.screen_name).points,`${FLG_ADDTAGS?`*${element.screen_name}(`:""}${element.first_name} ${element.last_name}${FLG_ADDTAGS?")":""} - ${karliks.get(element.screen_name).points} ${locale.msg_points}`])
            }
        });
        return chatUsers.sort((a,b)=>b[0]-a[0]).map(elem=>elem[1])
    })
}


function recordUser(userData){ //обновить очки 
    let user = userData[0].screen_name
    let initiator =userData.length>1?userData[1].screen_name : user
    let trackedUser = FLG_REVERSE?initiator:user
        if(karliks.has(trackedUser)) {
            if (karliks.get(trackedUser).timer<Date.now()){
                if (karliks.has(user)){
                    karliks.get(user).points+=1
                    }
                else{
                    karliks.set(user,{points:1,timer:0})
                }
                karliks.get(trackedUser).timer = Date.now()+COOLDOWN
                return `*${user}(${userData[0].first_name}) ${locale.msg_record_1}${userData[0].sex<2?"а":""}. ${locale.msg_record_2} ${karliks.get(user).points}`
            }
            else {
                return FLG_REVERSE?`${userData.length>1?userData[1].first_name:userData[0].first_name}${locale.msg_cooldown_reverse}`:`${userData[0].first_name}${locale.msg_cooldown}`
            }
        }
        else {
            if (karliks.has(user)){
                karliks.get(user).points+=1
                }
            else{
                karliks.set(user,{points:1,timer:0})
            }
            karliks.set(trackedUser,{points:1,timer:Date.now()+COOLDOWN})
            return `*${user}(${userData[0].first_name})${locale.msg_record_1}${userData[0].sex<2?"а":""}. ${locale.msg_record_2} ${karliks.get(user).points}`
        }
}

function loadLocale(name){ //подгрузка файлов перевода
const fs = require('fs');
let rawdata = fs.readFileSync(`./locales/${name}.json`);
locale = JSON.parse(rawdata);
console.log(`Language loaded: ${locale.locale}`);
}