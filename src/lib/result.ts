export enum ResultType {
	STATUS_ORPHAN = -2,
	STATUS_EXCEPTION = -1,
	STATUS_CONTINUE = 0,
	STATUS_OK = 1,
	STATUS_UNACCEPTED = 2,
	STATUS_WRONG_ANSWER = 10,
	STATUS_TIME_LIMIT_EXCEEDED = 20,
	STATUS_MEMORY_LIMIT_EXCEEDED = 21,
	STATUS_COMPILE_ERROR = 30,
	STATUS_RUNTIME_ERROR = 40,
	STATUS_SYSTEM_ERROR = 50,
}

export interface Result {
	status: ResultType;
	data: {
		message?: string,
		[x: string]: unknown;
	};
}
