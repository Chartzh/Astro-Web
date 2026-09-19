export interface LogLine {
	id: number;
	ts: string;
	dir: 'tx' | 'rx' | 'sys';
	text: string;
}