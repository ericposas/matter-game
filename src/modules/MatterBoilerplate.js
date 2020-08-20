import {
	Mouse, MouseConstraint, World,
	Engine, Render, Runner
} from 'matter-js'
import { width, height } from '../config'


export function matterBoilerplate() {
	// create engine
	let engine = Engine.create()
	let world = engine.world

	// create renderer
	let render = Render.create({
			element: document.body,
			engine: engine,
			options: {
					width,
					height,
					showAngleIndicator: true,
					showCollisions: true,
					showVelocity: true
			}
	})
	Render.run(render)

	// create runner
	var runner = Runner.create()
	Runner.run(runner, engine)

	let mouse = Mouse.create(render.canvas)
	let	mouseConstraint = MouseConstraint.create(engine, {
		mouse: mouse,
		constraint: {
			stiffness: 0.2,
			render: {
				visible: false
			}
		}
	})

	world.bounds = {
		min: { x: 0, y: 0 },
		max: { x: width * 4, y: height * 1.5 }
	}
	World.add(world, mouseConstraint)

	// keep the mouse in sync with rendering
	render.mouse = mouse

	return {
		engine,
		render,
		runner,
		world,
		mouse,
		mouseConstraint
	}

}
