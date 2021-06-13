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

let shooting = true;
let score = 0;

let up_key;
let down_key;
let space_key;

const BULLET_INIT_X = 840;
const BULLET_INIT_Y = 840;
const MAX_ENEMIES = 16;
const MAX_BULLETS = 3;
const COOLDOWN = 1;

const SCREEN_MARGIN = 32;

function preload () {
	console.log("Preload Status: OK");
	this.load.image("bg", "Assets/BG/stars_bg.jpg");
	this.load.image("ship", "Assets/Ships/Goon_Ship.png");
	this.load.image("enemy", "Assets/Ships/Noog_Ship.png");
	this.load.image("bullet", "Assets/Projectiles/Goon_Missile.png");
}

function create () {
	enemies = [];
	bullets = [];
	game_screen = this;
	bgGraphs = this.make.graphics({ x: 0, y: 0, add: false });
	bgGraphs.generateTexture('bg', 630, 370);
	bgTileSprite = this.add.tileSprite(400, 300, 800, 600, 'bg');

	ship = this.physics.add.image(player_init_x, scene_h/2, "ship");
	//ship.setScale(1);
	ship_speed = 20;
	enemy_speed = 4;
	bullet_speed = 10;
	scoreText = this.add.text(player_init_x, 24, 'Score: ' + score, {fontSize: '42px', fill: '#FFF' } );

	for (let i = 0; i < MAX_ENEMIES; i++){
		let x = Math.random() * scene_w * 4 + scene_w/2;
		let y = Math.random() * scene_h;
		
		enemies.push(this.physics.add.image(x, y, "enemy"));

		this.physics.add.collider(enemies[i]);
	}

	for (let i = 0; i < MAX_BULLETS; i++){
		bullets.push(this.physics.add.image(BULLET_INIT_X, BULLET_INIT_Y, "bullet"));
		bullets[i].moving = false;

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
				en.destroy();
		},null,this);
	});
	
	up_key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
	down_key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
	space_key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
	
	particles = this.add.particles('ship');
	particles.createEmitter({
		angle: { min: 220, max: 300 },
		speed: { min: 420, max: 560 },
		quantity: { min: 2, max: 10 },
		lifespan: 4000,
		alpha: { start: 1, end: 0 },
		scale: { min: 0.05, max: 0.4 },
		rotate: { start: 0, end: 360, ease: 'Back.easeOut' },
		gravityY: 720,
		quantity: 32,
		on: false
	});	
}

function update () {
	bgTileSprite.TilePositionX += 1;

	if(up_key.isDown){
		ship.y-- * ship_speed;
	}
	else if(down_key.isDown){
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
				bullets[i].moving = true;
				bullets[i].x = ship.x;
				bullets[i].y = ship.y;
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
		enemies[i].x-- * enemy_speed;
	}
}

function bulletReset(bullet){
	bullet.x = BULLET_INIT_X;
	bullet.y = BULLET_INIT_Y;
	bullet.moving = false;
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
