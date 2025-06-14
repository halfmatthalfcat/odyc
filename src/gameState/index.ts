import { Store } from '../lib/store.js'
import { Uniforms } from '../shaders/filterSettings.js'
import { Position, Tile } from '../types.js'
import { createActorsStore } from './actors.js'
import { createUniformsStore } from './filterUniforms.js'
import { createMapStore } from './map.js'
import { createPlayer } from './player.js'
import { GameStateParams } from './types.js'

export type GameState<T extends string> = {
	mapStore: {
		store: Store<string>
		getDimensions(): Position
	}
	player: {
		playerProxy: {
			sprite: Tile | null
			position: Position
		}
		playerStore: Store<{
			sprite: Tile | null
			position: Position
		}>
		restoreSavedState: () => void
		saveCurrentState: () => void
	}
	actors: ReturnType<typeof createActorsStore<T>>
	uniformsStore: Store<Uniforms>
}

export const initGameState = <U extends string>(
	params: GameStateParams<U>,
): GameState<U> => {
	const mapStore = createMapStore(params.map)
	const uniformsStore = createUniformsStore(params.filter?.settings ?? {})
	const player = createPlayer(params.player)
	const actors = createActorsStore<U>(params, mapStore)

	return {
		player,
		actors,
		mapStore,
		uniformsStore,
	}
}
