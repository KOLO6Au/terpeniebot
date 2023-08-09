/* eslint-disable curly */
/* eslint-disable @typescript-eslint/no-floating-promises */
import type {IConfig, ILocale, IKarlik} from './types';
import {VK} from 'vk-io';
import type {MessageContext} from 'vk-io';
import * as localeRaw from './locales/ru.json';
import * as configRaw from './config.json';
import type {UsersGetResponse} from 'vk-io/lib/api/schemas/responses';
import type {MessagesGetConversationMembers} from 'vk-io/lib/api/schemas/objects';

const locale: ILocale = localeRaw;
const config: IConfig = configRaw;

const vk = new VK({token: config.token});
const {api} = vk;

const karliks: Record<string, IKarlik> = {
	zwolfzu: {points: 50, timer: 0},
};

void vk.updates.start();

vk.updates.on('message', (context, next) => {
	if (context.text === null || context.isGroup || context.text === undefined) return;
	parseMessage(context);
});

function parseMessage(context: MessageContext) {
	const messageText: string = context.text.toLowerCase();
	if (messageText.includes('терпение') || messageText.includes('терпи') || messageText.includes('озон')) { // Aзасчитать терпение
		if (context.hasReplyMessage) {
			getUsr(context.replyMessage.senderId, context.senderId).then(userData => {
				if (userData.length < 1) return;
				context.send(recordUser(userData));
			});
			return;
		}

		if (messageText.includes('@')) {
			const userTag = messageText.substring(messageText.indexOf('@') + 1, messageText.indexOf(']', messageText.indexOf('@')));
			getChatUsers(context.peerId).then(data => {
				if (data === null) {
					context.send(locale.msg_nopermissions);
					return;
				}

				const isInChat = data.profiles.find(item => item.screen_name === userTag) as number;
				if (isInChat === undefined) {
					context.send(locale.msg_nouser);
					return;
				}

				getUsr(userTag, context.senderId).then(userData => {
					if (userData.length < 1) return;
					context.send(recordUser(userData));
				});
			});
		}
	}

	if (messageText === 'карлики') {
		getChatTop(context.peerId).then(value => {
			if (value === null) context.send(locale.msg_nopermissions);
			else context.send(`${locale.msg_top} \n ${value.join('\n')}`);
		});
	}
}

async function getUsr(targetId: number | string, initiatorId = 1): Promise<UsersGetResponse> {
	try {
		const users = await api.users.get({
		// eslint-disable-next-line @typescript-eslint/naming-convention
			user_ids: [targetId, initiatorId],
			fields: ['screen_name', 'sex'],
		});
		return users as UsersGetResponse[];
	} catch (error) {
		return null;
	}
}

async function getChatUsers(chatId: number): Promise<MessagesGetConversationMembers> {
	try {
		const users = await api.messages.getConversationMembers({
			// eslint-disable-next-line @typescript-eslint/naming-convention
			peer_id: chatId,
		});
		return users;
	} catch (error) {
		return null;
	}
}

async function getChatTop(chatId: number): Promise<string[]> { // Aполучить + вывести топ юзеров чата
	return getChatUsers(chatId).then(userList => {
		if (userList === null) {
			return null;
		}

		const chatUsers = [];
		userList.profiles.forEach(element => {
			if (Object.keys(karliks).includes(element.screen_name as string)) {
				chatUsers.push([karliks[element.screen_name].points, `${config.FLG_ADDTAGS ? `*${element.screen_name}(` : ''}${element.first_name} ${element.last_name}${config.FLG_ADDTAGS ? ')' : ''} - ${karliks[element.screen_name].points} ${locale.msg_points}`]);
			}
		});
		return chatUsers.sort((a, b) => b[0] - a[0]).map(elem => elem[1]) as string[];
	});
}

function recordUser(userData: UsersGetResponse): string { // Обновить очки
	const targetUser = userData[0].screen_name as string;
	let initiatorUser = userData.length > 1 ? userData[1].screen_name as string : targetUser;
	initiatorUser = config.FLG_REVERSE ? initiatorUser : targetUser;
	if (karliks[initiatorUser] !== undefined) {
		if (karliks[initiatorUser].timer < Date.now()) {
			karliks[targetUser] = karliks[targetUser] || {points: 0, timer: 0};
			karliks[targetUser].points += 1;
			karliks[initiatorUser].timer = Date.now() + config.COOLDOWN;
			return `*${targetUser}(${userData[0].first_name})${userData[0].sex < 2 ? locale.msg_record_f : locale.msg_record}${karliks[targetUser].points}`;
		}

		return config.FLG_REVERSE ? `${userData.length > 1 ? userData[1].first_name : userData[0].first_name}${locale.msg_cooldown_reverse}` : `${userData[0].first_name}${locale.msg_cooldown}`;
	}

	karliks[targetUser] = karliks[targetUser] || {points: 0, timer: 0};
	karliks[targetUser].points += 1;
	karliks[initiatorUser] = {points: 0, timer: Date.now() + config.COOLDOWN};
	return `*${targetUser}(${userData[0].first_name})${userData[0].sex < 2 ? locale.msg_record_f : locale.msg_record}${karliks[targetUser].points}`;
}
