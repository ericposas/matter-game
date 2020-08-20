import { World, Body, Composite } from 'matter-js'
import { BODY_DAMAGE, HEAD_DAMAGE, LIMB_DAMAGE } from './DamageConstants'
import { BULLET_FORCE_MULTIPLIER, BULLET_IMPACT } from './GameConstants'
import { createRagdoll } from './Ragdoll'


const damageEnemy = (enemy, dmg) => {
	if (enemy._lifebar) {
		let lifeAmt = parseInt(enemy._lifebar.style.width, 10)
		let lifeBar = enemy._lifebar
		if (lifeAmt < dmg) {
			lifeAmt = 0
		} else {
			lifeAmt -= dmg
		}
		lifeBar.style.width = lifeAmt + 'px'
	}
}

const killEnemy = (player, enemies, enemy, world) => {
	if (enemy._lifebar) {
		let lifeAmt = parseInt(enemy._lifebar.style.width, 10)
		if (lifeAmt <= 0) {
			enemy._composite.stopShooting()
			removeEnemyFromWorld(player, enemies, enemy, world)
		}
	}
}

const removeEnemyFromWorld = (player, enemies, enemy, world) => {
	if (enemy._outerLifebar.parentNode == document.body) {
		let enIdx = enemies.indexOf(enemy._composite)
		let _x = (
			enemy.position.x < player.bodies[0].position.x ? -BULLET_IMPACT : BULLET_IMPACT
		)
		enemies.splice(enIdx, 1)
		World.remove(world, enemy._composite)
		document.body.removeChild(enemy._outerLifebar)
		// add a ragdoll in place of enemy character!
		let ragdoll = createRagdoll(world, 1)
		Composite.translate(ragdoll, { x: enemy.position.x, y: enemy.position.y - 100 })
		Body.applyForce(ragdoll.bodies[0], ragdoll.bodies[0].position, {
			x: _x,
			y: BULLET_IMPACT/2
		})
		// set time limit for ragdoll body to be removed from scene
		setTimeout(() => {
			World.remove(world, ragdoll)
		}, 10000) // 10 seconds

	}
}

export const checkPlayerIsOnGroundBegin = (e, i, player) => {
	if (e.pairs[i].bodyA === player.bodies[1] && e.pairs[i].bodyB.label.indexOf('ground') > -1) {
		player.ground = true
	} else if (e.pairs[i].bodyB === player.bodies[1] && e.pairs[i].bodyA.label.indexOf('ground') > -1) {
		player.ground = true
	}
}

const processDamageType = enemy => {
	enemy.label.indexOf('head') > -1
	? damageEnemy(enemy, HEAD_DAMAGE)
	:
		enemy.label.indexOf('body') > -1
		? damageEnemy(enemy, BODY_DAMAGE)
		: damageEnemy(enemy, LIMB_DAMAGE)
}

export const enemyBulletHittestBegin = (e, i, world, bulletForceAngle, bullets) => {
	if (e.pairs[i].bodyA.label.indexOf('enemy') > -1 && e.pairs[i].bodyB.label == 'bullet') {
		let enemy = e.pairs[i].bodyA
		let bullet = e.pairs[i].bodyB
		let idx = bullets.indexOf(bullet)
		processDamageType(enemy)
		Body.applyForce(enemy, enemy.position, { x: bulletForceAngle.x * BULLET_FORCE_MULTIPLIER })
		World.remove(world, bullet)
		if (idx > -1) { bullets.splice(idx, 1) }
	} else if (e.pairs[i].bodyB.label.indexOf('enemy') > -1 && e.pairs[i].bodyA.label == 'bullet') {
		let enemy = e.pairs[i].bodyB
		let bullet = e.pairs[i].bodyA
		let idx = bullets.indexOf(bullet)
		processDamageType(enemy)
		Body.applyForce(enemy, enemy.position, { x: bulletForceAngle.x * BULLET_FORCE_MULTIPLIER })
		World.remove(world, bullet)
		if (idx > -1) { bullets.splice(idx, 1) }
	}
	// if enemies shoot each other, remove the bullet
	if (e.pairs[i].bodyA.label.indexOf('enemy') > -1 && e.pairs[i].bodyB.label.indexOf('enemy bullet') > -1) {
		let bullet = e.pairs[i].bodyB
		let idx = bullets.indexOf(bullet)
		World.remove(world, bullet)
		if (idx > -1) { bullets.splice(idx, 1) }
	} else if (e.pairs[i].bodyB.label.indexOf('enemy') > -1 && e.pairs[i].bodyA.label.indexOf('enemy bullet') > -1) {
		let bullet = e.pairs[i].bodyA
		let idx = bullets.indexOf(bullet)
		World.remove(world, bullet)
		if (idx > -1) { bullets.splice(idx, 1) }
	}
}

export const bulletGroundHittest = (e, i, world, bullets) => {
	if (e.pairs[i].bodyA.label.indexOf('bullet') > -1  && e.pairs[i].bodyB.label === 'ground') {
		let bullet = e.pairs[i].bodyA
		let idx = bullets.indexOf(bullet)
		World.remove(world, bullet)
		if (idx > -1) { bullets.splice(idx, 1) }

	} else if (e.pairs[i].bodyB.label.indexOf('bullet') > -1  && e.pairs[i].bodyA.label === 'ground') {
		let bullet = e.pairs[i].bodyB
		let idx = bullets.indexOf(bullet)
		World.remove(world, bullet)
		if (idx > -1) { bullets.splice(idx, 1) }
	}
}

export const checkPlayerIsOnGroundEnd = (e, i, player) => {
	if (e.pairs[i].bodyA === player.bodies[1] && e.pairs[i].bodyB.label.indexOf('ground') > -1) {
		player.ground = false
	} else if (e.pairs[i].bodyB === player.bodies[1] && e.pairs[i].bodyA.label.indexOf('ground') > -1) {
		player.ground = false
	}
}

export const enemyBulletHittestEnd = (e, i, player, enemies, world) => {
	if (e.pairs[i].bodyA.label.indexOf('enemy') > -1 && e.pairs[i].bodyB.label == 'bullet') {
		let enemy = e.pairs[i].bodyA
		killEnemy(player, enemies, enemy, world)
	} else if (e.pairs[i].bodyB.label.indexOf('enemy') > -1 && e.pairs[i].bodyA.label == 'bullet') {
		let enemy = e.pairs[i].bodyB
		killEnemy(player, enemies, enemy, world)
	}
}
