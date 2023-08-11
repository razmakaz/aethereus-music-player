<script lang="ts">
	import playerStore, { defaultPlayerStore } from '$lib/playerStore';
	import { writable, type Unsubscriber } from 'svelte/store';
	import MusicList, { type IMusicListItem } from '$lib/players/MusicList';
	import AmbienceList from '$lib/players/AmbienceList';
	import { onMount, onDestroy } from 'svelte';
	import { RangeSlider } from '@skeletonlabs/skeleton';
	import { fly, scale } from 'svelte/transition';
	import { flip } from 'svelte/animate';

	let unsubscribePlayerStore: Unsubscriber;

	// https://docs.google.com/uc?id=yourDocId&export=download&hl=en_US

	// https://drive.google.com/file/d/1on9NXs11GLIUuTPwBwqgm_ldDUtB_eny/view?usp=sharing

	const search = writable('');
	const filteredMusic = writable<IMusicListItem[]>([]);

	const musicPlayerSeek = writable({
		current: 0,
		duration: 0
	});

	onMount(() => {
		const musicPlayer = document.getElementById('music-player') as HTMLAudioElement;
		$playerStore.music.player = musicPlayer;

		const ambiencePlayer = document.getElementById('ambience-player') as HTMLAudioElement;
		$playerStore.music.player = ambiencePlayer;

		document.getElementById('music-volume-slider')?.addEventListener('input', (event) => {
			const { value } = <HTMLInputElement>event.target;
			$playerStore.music.volume = Number(value) ?? 0;
			musicPlayer.volume = $playerStore.music.volume;
		});

		unsubscribePlayerStore = playerStore.subscribe((next) => {
			if (!musicPlayer.src.includes(next.music.resourceId)) {
				musicPlayer.src = `https://docs.google.com/uc?id=${next.music.resourceId}&export=download&hl=en_US`;
				musicPlayer.volume = next.music.volume;
				next.music.loading = true;
				musicPlayer.loop =
					MusicList.find((el) => el.resourceId === next.music.resourceId)?.loop ?? true;
				musicPlayer.oncanplay = () => {
					$playerStore.music.loading = false;
					$musicPlayerSeek.duration = musicPlayer.duration;
					$musicPlayerSeek.current = 0;
				};
			}
		});

		setInterval(() => {
			if ($playerStore.music.resourceId) {
				$musicPlayerSeek.current = musicPlayer.currentTime;
			}
		}, 10);
	});

	onDestroy(() => {
		if (unsubscribePlayerStore) {
			unsubscribePlayerStore();
		}
	});

	const handlePlay = (resourceId: string) => {
		console.log(resourceId, $playerStore.music.resourceId);
		const player = document.getElementById('music-player') as HTMLAudioElement;
		if (!$playerStore.music.resourceId || $playerStore.music.resourceId !== resourceId) {
			$playerStore.music.resourceId = resourceId;
			$playerStore.music.paused = false;
			return;
		}

		if (!player.paused) {
			player.pause();
			$playerStore.music.paused = true;
			return;
		} else {
			player.play();
			$playerStore.music.paused = false;
			return;
		}
	};

	const stopMusic = () => {
		$playerStore.music.resourceId = '';
		const player = document.getElementById('music-player') as HTMLAudioElement;
		player.src = '';
	};

	const stopAmbience = () => {
		$playerStore.ambience.resourceId = '';
		const player = document.getElementById('ambience-player') as HTMLAudioElement;
		player.src = '';
	};

	const musicFilter = (item: any) => {
		if (!$search) return item;
		if (item.name.toLowerCase().includes($search.toLowerCase())) {
			return item;
		}
		if ($playerStore.music.resourceId === item.resourceId) {
			return item;
		}
	};

	const unsubscribeSearch = search.subscribe((next) => {
		let filtered = MusicList.filter((item) => {
			if (item.name.toLowerCase().includes($search.toLowerCase())) {
				return item;
			}
			if ($playerStore.music.resourceId === item.resourceId) {
				return item;
			}
		});

		$filteredMusic = filtered.sort((a, b) => a.name.localeCompare(b.name));
	});
</script>

<div class="mx-auto flex justify-center max-w-[1200px]">
	<div class="space-y-5 py-5 w-full">
		<h1 class="h1 flex gap-4 items-center">
			<span>Music</span>
		</h1>
		<label>
			<div class="input-group input-group-divider grid-cols-[auto_auto_auto_1fr_auto]">
				<div class="input-group-shim">Volume</div>
				<RangeSlider
					id="music-volume-slider"
					name="music-volume"
					bind:value={$playerStore.music.volume}
					min={0}
					max={1}
					step={0.01}
				/>
				<div class="input-group-shim">Search</div>
				<input type="text" bind:value={$search} />
				<button class="variant-filled-primary" on:click={stopMusic}>Stop Music</button>
			</div>
		</label>

		<div class="grid grid-cols-1 gap-4">
			{#each $filteredMusic as music, i (music.name)}
				<div
					in:fly={{ x: 100, duration: 222 }}
					out:fly={{ x: 100, duration: 222 }}
					class="flex transition-all duration-100 overflow-hidden w-full items-center gap-4 rounded-md {$playerStore
						.music.resourceId === music.resourceId
						? $playerStore.music.loading
							? 'animate-pulse variant-ghost-secondary'
							: 'variant-filled-secondary scale-105 shadow-md'
						: 'variant-soft'}"
				>
					<img class="h-[100px] object-cover w-[150px]" src={music.image} alt={music.name} />
					<div class="flex flex-col gap-2 w-full">
						<div class="text-lg flex gap-4 items-center">
							<span>{music.name}</span>
							<span class="text-sm italic">{music.description ?? ''}</span>
						</div>
						<button
							class="btn active:scale-100 transition-all duration-100 flex gap-4 mr-4 {$playerStore
								.music.resourceId === music.resourceId
								? 'variant-ghost-tertiary'
								: 'btn-icon variant-filled-primary'}"
							on:click={() => handlePlay(music.resourceId)}
						>
							{#if $playerStore.music.resourceId === music.resourceId}
								{#if $playerStore.music.loading}
									<div>
										<i class="fa-solid fa-spinner animate-spin" />
									</div>
								{:else}
									{#if $playerStore.music.paused}
										<div>
											<i class="fa-solid fa-play" />
										</div>
									{:else}
										<div>
											<i class="fa-solid fa-pause" />
										</div>
									{/if}
									<RangeSlider
										id="music-volume-slider"
										name="music-volume"
										class="w-full transition-opacity duration-150 {$playerStore.music.resourceId ===
										music.resourceId
											? 'opacity-100'
											: ' opacity-0'}"
										disabled
										value={$musicPlayerSeek.current}
										min={0}
										max={$musicPlayerSeek.duration}
										step={0.001}
									/>
								{/if}
							{:else}
								<div>
									<i class="fa-solid fa-play" />
								</div>
							{/if}
						</button>
					</div>
				</div>
			{/each}
		</div>

		<audio id="music-player" autoplay={true} loop={true} volume={$playerStore.music.volume}>
			<source src="" />
		</audio>

		<!-- <iframe
			class=" block w-full"
			width="560"
			height="100"
			id="music-player"
			src="https://www.youtube.com/embed/{$playerStore.music
				.videoId}?autoplay=1&controls=1&loop=1&start=0&enablejsapi=1"
			title="YouTube video player"
			frameborder="0"
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
			allowfullscreen
		/> -->

		<!-- <h1 class="h1 flex gap-4 items-center">
			<span>Ambient List</span>
			<button class="btn variant-filled-primary" on:click={stopAmbience}>Stop Ambience</button>
		</h1>
        <RangeSlider
			id="ambience-volume-slider"
			name="ambience-volume"
			bind:value={$playerStore.ambience.volume}
			min={0}
			max={1}
			step={0.01}
		/>
		<div class="grid grid-cols-5 gap-4">
			{#each AmbienceList as ambience, i (ambience.resourceId)}
				<button
					class="btn transition-all duration-100 {$playerStore.ambience.resourceId ===
					ambience.resourceId
						? 'variant-filled-tertiary'
						: 'variant-filled-primary'}"
					on:click={() => ($playerStore.ambience.resourceId = ambience.resourceId)}
					>{ambience.name}</button
				>
			{/each}
		</div> -->

		<!-- <iframe
			class=" block w-full"
			width="560"
			height="100"
			id="ambience-player"
			src="https://www.youtube.com/embed/{$playerStore.ambience
				.videoId}?autoplay=1&controls=1&loop=1&start=0&enablejsapi=1"
			title="YouTube video player"
			frameborder="0"
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
			allowfullscreen
		/> -->
	</div>
</div>
