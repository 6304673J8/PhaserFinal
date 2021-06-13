const scene_w = 640;
const scene_h = 480;

let player_init_x = 64;
let game_screen;
let scoreText;
let bg;

let particles;
let bgGraphs;
let bgTileSprite;

let ship;
let ship_speed;

let enemies = [];
let enemy_speed;

let bullets = [];
let bullet_speed;
let bullet_instantiate_x;
let shooting = true;
let explosion_sound;
let score = 0;

let up_key;
let down_key;
let space_key;

const BULLET_INIT_X = 840;
const BULLET_INIT_Y = 840;
const MAX_ENEMIES = 12;
const MAX_BULLETS = 3;
const COOLDOWN = 1;

const SCREEN_MARGIN = 32;

function preload () {
	console.log("Preload Status: OK");
	this.load.image("bg", "Assets/BG/stars_bg.jpg");
	this.load.image("goon_fx", "Assets/FX/FX_GoonPlosion_Cruz.png");
	this.load.audio("explosion_fx", "Assets/FX/Phaser_Explosion.ogg")
	this.load.spritesheet("ship", "Assets/Spritesheets/Ships/Goon_Ship_SpriteSheet.png",
			{frameWidth:75, frameHeight:96});
	
	this.load.spritesheet("enemy", "Assets/Spritesheets/Ships/Noog_Ship_SpriteSheet.png",
			{frameWidth:84, frameHeight:78});
	this.load.spritesheet("bullet", "Assets/Spritesheets/Projectiles/Goon_Missile_Spritesheet.png",
			{frameWidth:30, frameHeight:14});
}

function create () {
	enemies = [];
	bullets = [];
	game_screen = this;

	ship_speed = 20;
	bullet_speed = 10;
	bullet_instantiate_x = 55;
	enemy_speed = 4;

	bgGraphs = this.make.graphics({ x: 0, y: 0, add: false });
	bgGraphs.generateTexture('bg', 630, 370);
	bgTileSprite = this.add.tileSprite(400, 300, 800, 600, 'bg');
	
	explosion_sound = this.sound.add("explosion_fx");
	explosion_sound.setVolume(1);
	//Animations
	const shipAnimation = this.anims.create({
		key: 'fly',
		frames: this.anims.generateFrameNumbers('ship'),
		frameRate:12
	});
	ship = this.physics.add.sprite(player_init_x, scene_h/2, "ship");
	
	const bulletAnimation = this.anims.create({
		key: 'shot',
		frames: this.anims.generateFrameNumbers('bullet'),
		frameRate:12
	});

	const enemyAnimation = this.anims.create({
		key:'enemyShip',
		frames: this.anims.generateFrameNumbers('enemy'),
		frameRate:12
	});
	
	scoreText = this.add.text(player_init_x, 24, 'Score: ' + score, {fontSize: '42px', fill: '#FFF' } );

	for (let i = 0; i < MAX_ENEMIES; i++){
		let x = Math.random() * scene_w * 4 + scene_w/2;
		let y = Math.random() * scene_h;
		
		enemies.push(this.physics.add.sprite(x, y, "enemy"));
		enemies[i].play('enemy_fly', true);

		this.physics.add.collider(enemies[i]);
	}

	for (let i = 0; i < MAX_BULLETS; i++){
		bullets.push(this.physics.add.sprite(BULLET_INIT_X, BULLET_INIT_Y, "bullet"));
		bullets[i].moving = false;
		bullets[i].play('shot', true);
		this.physics.add.collider(bullets[i]);
	}

	enemies.forEach(function (element) {	
		game_screen.physics.add.overlap(ship, element, () => {
			game_screen.scene.restart();
			score = 0;
		},null,game_screen);
	});

	bullets.forEach(function (element) {
			game_screen.physics.add.overlap(enemies, element,(en,b) => {
				bulletReset(element);
				calculateScore();
				particles.emitParticleAt(en.x, en.y);
				enemyReset(en);
				explosion_sound.play();
				//en.destroy();
		},null,this);
	});
	
	up_key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
	down_key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
	space_key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
	
	particles = this.add.particles('goon_fx');
	particles.createEmitter({
		angle: { min: 220, max: 300 },
		speed: { min: 420, max: 560 },
		quantity: { min: 2, max: 10 },
		lifespan: 4000,
		alpha: { start: 1, end: 0 },
		scale: { min: 0.4, max: 1 },
		rotate: { start: 0, end: 180, ease: 'Back.easeOut' },
		gravityY: 720,
		quantity: 32,
		on: false
	});	
}

function update () {
	bgTileSprite.TilePositionX += 1;
	
	for(let i = 0; i < MAX_BULLETS; i++){
		bullets[i].play('shot', true);	
	}
	
	//for ( let i = 0; i < MAX_ENEMIES; i++){
	
	//}
	if(up_key.isDown){
		ship.play('fly', true);
		ship.y-- * ship_speed;
	}
	else if(down_key.isDown){
		ship.play('fly', true);
		ship.y++ * ship_speed;
	}
	
	if(space_key.isUp){
		shooting = true;	
	}
	
	if (space_key.isDown && shooting){
		let found = false;
		shooting = false;
		for(let i = 0; i < MAX_BULLETS && !found; i++){
			if(!bullets[i].moving){
				bullets[i].x = ship.x + bullet_instantiate_x;
				bullets[i].y = ship.y;
				bullets[i].moving = true;
				found = true;
			}
		}
	}
	
	for(let i = 0; i < MAX_BULLETS; i++){
		if (bullets[i].moving){
			bullets[i].x++ * bullet_speed;
			if (bullets[i].x >= scene_w + SCREEN_MARGIN){
				bullets[i].x = BULLET_INIT_X;
				bullets[i].y = BULLET_INIT_Y;
				bullets[i].moving = false;				
			}
		}
	}

	for ( let i = 0; i < MAX_ENEMIES; i++){
		enemies[i].play('enemyShip', true);	
		enemies[i].x-- * enemy_speed;
	}
}

function bulletReset(bullet){
	bullet.x = BULLET_INIT_X;
	bullet.y = BULLET_INIT_Y;
	bullet.moving = false;
}

function enemyReset(enemy){
	enemy.x = Math.random() * scene_w * 8 + scene_w/2;
	enemy.y = Math.random() * scene_h;
}

function calculateScore(){
	score++;
	scoreText.setText('Score: ' + score);
}

function enemyReset (enemy){
	enemy.x = 840;
}

const config = {
	type: Phaser.AUTO,
	width: scene_w,
	height: scene_h,
	pixelArt: true,
	physics: {
		default: 'arcade',
		arcade: {
			debug:true
		}
	},
	scene: {
		preload: preload,
		create:	create,
		update: update
	}
};

let game = new Phaser.Game(config);
