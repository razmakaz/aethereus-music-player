import { writable } from 'svelte/store';

export interface IPlayerStore {
	player: undefined | HTMLAudioElement;
	resourceId: string;
	volume: number;
	loading: boolean;
	paused: boolean;
}
export const defaultPlayerStore: {
	music: IPlayerStore;
	ambience: IPlayerStore;
} = {
	music: {
		player: undefined,
		resourceId: '',
		volume: 0.25,
		loading: false,
		paused: false
	},
	ambience: {
		player: undefined,
		resourceId: '',
		volume: 0.25,
		loading: false,
		paused: false
	}
};

export default writable(defaultPlayerStore);
