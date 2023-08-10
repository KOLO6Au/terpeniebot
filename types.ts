/* eslint-disable @typescript-eslint/naming-convention */
/**
 * @type {ILocale} - локализация бота
 */
export type ILocale = {
	locale: string;
	msg_nopermissions: string;
	msg_nouser: string;
	msg_record: string;
	msg_record_f: string;
	msg_top: string;
	msg_points: string;
	msg_cooldown_reverse: string;
	msg_cooldown: string;
};

/**
 * @type {IConfig}  - конфигурация бота
 * @prop {string} token - токен сообщества ВКонтакте
 * @prop {boolean} FLG_ADDTAGS - флаг добавления теганья при выводе топ участников, true - тегается
 * @prop {boolean} FLG_REVERSE - флаг режима кулдауна true - в кулдаун уходит инициатор (один ко многим)
 * @prop {number} COOLDOWN - время (в мс)
 */
export type IConfig = {
	token: string;
	FLG_ADDTAGS: boolean;
	FLG_REVERSE: boolean;
	COOLDOWN: number;
};

/**
 * @type {IKarlik}  - запись участника
 * @prop {number} points - кол-во очков
 * @prop {number} timer - FLG_REVERSE ? время возможности отправки следующего сообщения : получения очков
 */
export type IKarlik = {
	points: number;
	timer: number;
};
