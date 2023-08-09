// eslint-disable-next-line @typescript-eslint/naming-convention
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

// eslint-disable-next-line @typescript-eslint/naming-convention
export type IConfig = {
	token: string;
	FLG_ADDTAGS: boolean;
	FLG_REVERSE: boolean;
	COOLDOWN: number;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export type IKarlik = {
	points: number;
	timer: number;
};
