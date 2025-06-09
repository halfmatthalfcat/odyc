export class ResizeEvent extends CustomEvent<{
	height: number
	width: number
	left: number
	top: number
}> {
	constructor(height: number, width: number, left: number, top: number) {
		super('resize', {
			detail: {
				height,
				width,
				left,
				top,
			},
		})
	}
}

interface EventMap {
	resize: ResizeEvent
}

export abstract class Container extends EventTarget {
	constructor(private container: Window | HTMLElement) {
		super()

		if (container instanceof Window) {
			container.addEventListener('resize', () =>
				this.dispatchEvent(
					new ResizeEvent(container.innerWidth, container.innerHeight, 0, 0),
				),
			)
		} else {
			new ResizeObserver(([element]) => {
				if (element) {
					this.dispatchEvent(
						new ResizeEvent(
							element.target.clientHeight,
							element.target.clientWidth,
							element.target.getBoundingClientRect().left,
							element.target.getBoundingClientRect().top,
						),
					)
				}
			})
		}
	}

	protected makeResizeEvent(): ResizeEvent {
		if (this.container instanceof Window) {
			return new ResizeEvent(
				this.container.innerWidth,
				this.container.innerHeight,
				0,
				0,
			)
		} else {
			return new ResizeEvent(
				this.container.clientHeight,
				this.container.clientWidth,
				this.container.getBoundingClientRect().left,
				this.container.getBoundingClientRect().top,
			)
		}
	}

	addEventListener<K extends keyof EventMap>(
		type: K,
		callback: (ev: EventMap[K]) => void,
	): void
	addEventListener(
		type: string,
		callback: EventListenerOrEventListenerObject | null,
		options?: boolean | AddEventListenerOptions,
	): void
	addEventListener(type: any, callback: any, options?: any): void {
		super.addEventListener(type, callback, options)
	}

	removeEventListener<K extends keyof EventMap>(
		type: K,
		callback: (ev: EventMap[K]) => void,
	): void
	removeEventListener(
		type: string,
		callback: EventListenerOrEventListenerObject | null,
		options?: boolean | EventListenerOptions,
	): void
	removeEventListener(type: any, callback: any, options?: any): void {
		super.removeEventListener(type, callback, options)
	}
}
