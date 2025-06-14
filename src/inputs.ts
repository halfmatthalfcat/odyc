import { Container, Containerable } from "./container"

const TIMEBETWEENKEYS = 200
const TIMEBETWEENTOUCH = 200
const MINSWIPEDIST = 30

export type Input = 'LEFT' | 'UP' | 'RIGHT' | 'DOWN' | 'ACTION'

export type InputsHandlerParams = {
	controls: Record<Input, string | string[]>
	autoFocus?: boolean
}

class InputsHandler extends Container {
	controls: [Input, string | string[]][]
	lastKeysEvents: Map<string, number> = new Map()
	onInput: (input: Input) => void
	lastPointerEvent = 0
	oldTouchX?: number
	oldTouchY?: number
	isTouching = false
	isSliding = false

	constructor(
		params: InputsHandlerParams,
		container: Containerable,
		onInput: (input: Input) => void,
	) {
		super(container)
		this.controls = Object.entries(params.controls) as [
			Input,
			string | string[],
		][]
		this.onInput = onInput

		const touchEventElement = document.createElement('div')
		touchEventElement.style.setProperty('position', 'relative')
		touchEventElement.style.setProperty('left', '0')
		touchEventElement.style.setProperty('height', '0')
		touchEventElement.style.setProperty('width', '100%')
		touchEventElement.style.setProperty('height', '100%')
		touchEventElement.style.setProperty('overflow', 'hidden')
		touchEventElement.style.setProperty('touch-action', 'none')
		this.append(touchEventElement)
		// container.style.setProperty('margin', '0')

		document.addEventListener('keydown', this.handleKeydown)
		touchEventElement.addEventListener('pointerdown', this.handleTouch)
		touchEventElement.addEventListener('pointerup', this.handleTouchUp)
		touchEventElement.addEventListener('pointerleave', this.handleTouchLeave)
		touchEventElement.addEventListener('pointermove', this.handleTouchMove)
	}

	handleTouch = (e: PointerEvent) => {
		this.isTouching = true
		this.oldTouchX = e.clientX
		this.oldTouchY = e.clientY
	}

	handleTouchUp = () => {
		if (!this.isSliding) this.onInput('ACTION')
		this.isTouching = false
		this.isSliding = false
	}

	handleTouchLeave = () => {
		this.isTouching = false
		this.isSliding = false
	}

	handleTouchMove = (e: PointerEvent) => {
		if (!this.isTouching) return
		const x = e.clientX
		const y = e.clientY
		if (
			x === undefined ||
			y === undefined ||
			this.oldTouchX === undefined ||
			this.oldTouchY === undefined
		)
			return
		const diffX = x - this.oldTouchX
		const diffY = y - this.oldTouchY
		const now = e.timeStamp

		if (Math.abs(diffX) < MINSWIPEDIST && Math.abs(diffY) < MINSWIPEDIST) return
		if (now - this.lastPointerEvent < TIMEBETWEENTOUCH) return

		this.lastPointerEvent = now
		this.oldTouchX = x
		this.oldTouchY = y

		this.isSliding = true
		if (Math.abs(diffY) > Math.abs(diffX)) {
			const direction = Math.sign(diffY)
			this.onInput(direction < 0 ? 'UP' : 'DOWN')
		} else {
			const direction = Math.sign(diffX)
			this.onInput(direction < 0 ? 'LEFT' : 'RIGHT')
		}
	}

	handleKeydown = (e: KeyboardEvent) => {
		const entrie = this.controls.find(
			([_, keys]) => keys === e.code || keys.includes(e.code),
		)
		if (!entrie) return
		const [input] = entrie
		const now = e.timeStamp
		const last = this.lastKeysEvents.get(e.code)
		if (e.repeat && last && now - last < TIMEBETWEENKEYS) return
		this.lastKeysEvents.set(e.code, now)
		this.onInput(input)
	}
}

export const initInputsHandler = (
	params: InputsHandlerParams,
	container: Containerable,
	onInput: (input: Input) => void,
) => new InputsHandler(params, container, onInput)
