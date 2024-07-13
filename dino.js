
//board
let board;
let boardWidth = 750;
let boardHeight = 550;
let context;

//stage
let stage;

//player
let playerWidth = 88;
let playerHeight = 94;
let playerX = 50;
let playerY = boardHeight - playerHeight;
let playerImg = new Image();
let selectedCharacterImgSrc = "";

let player = {
    x : playerX,
    y : playerY,
    width : playerWidth,
    height : playerHeight
}

//aerial enemy
class Enemy{
    constructor(name, width, height, x, y, vx, imgSrc) {
        this.name=name;
        this.width=width;
        this.height=height;
        this.x=x;
        this.y=y;
        this.vx=vx;
        this.imgSrc=imgSrc;
        let enemyImg=new Image();
        enemyImg.src=imgSrc;
        this.img=enemyImg;
    }
    move(){
        this.x=this.x+this.vx;
    }
    setAlt(){
        this.y=Math.min(Math.max(boardHeight - this.height - boardHeight*Math.random(),this.height),boardHeight - this.height*2);  
    }
}
 
let enemyArray = [];

//building
let buildingArray = [];

let building1Width = 54;
let building2Width = 85;
let building3Width = 92;
  
let buildingHeight = 90;
let buildingX = 700;
let buildingY = boardHeight - buildingHeight;

let building1Img = new Image();
let building2Img = new Image();
let building3Img = new Image();

building1Img.src = "/img/building01.png";
building2Img.src = "/img/building02.png";
building3Img.src = "/img/building03.png";



//physics
let velocityX = -4; //building moving left speed
let velocityY = 0;
let gravity = .35;

let gameOver = false;
let score = 0;

//imgs and enemy status
let ene1=new Enemy("standard", 80, 80, 700, 0, -5,"/img/enemy01.png")
let ene2=new Enemy("slow", 80, 80, 700, 0, -3.5,"/img/enemy02.png")
let ene3=new Enemy("fast", 80, 80, 700, 0, -8.5,"/img/enemy03.png")


window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;

    context = board.getContext("2d"); //used for drawing on the board

    playerImg.onload = function() {
    context.drawImage(playerImg, player.x, player.y, player.width, player.height);
    }

    setCharacterSelection();
    showCharacterSelection();

    //jump
    document.addEventListener("keydown", function(e){
        if(e.code=="Space"){
            movePlayer();
        }
    });
    document.addEventListener("touchstart", movePlayer);
    document.addEventListener("click", movePlayer);

    //continue
    document.addEventListener("keydown",conti);
    document.addEventListener("touchstart",continueTheGame);
    document.addEventListener("click", continueTheGame);


    //restart
    document.addEventListener("keydown",restart);
}

const setStage = () => {
    let arg=Math.random();
    console.log(arg);
    if(arg>0.5){
        document.getElementById("board").style.background='url(img/sky.png) repeat-x';
        document.getElementById("board").style.backgroundSize='cover';
        ene1.img.src="/img/enemy01.png";
        ene2.img.src="/img/enemy02.png";
        ene3.img.src="/img/enemy03.png";
        building1Img.src = "/img/building01.png";
        building2Img.src = "/img/building02.png";
        building3Img.src = "/img/building03.png";
    }else{
        document.getElementById("board").style.background='url(/img/school.png) repeat-x';
        document.getElementById("board").style.backgroundSize='cover';
        ene1.img.src="/img/enemy01.png";
        ene2.img.src="/img/enemy02.png";
        ene3.img.src="/img/enemy03.png";
        building2Img.src = "/img/school_buil02.png";
        building1Img.src = "/img/school_buil01.png";
        building3Img.src = "/img/school_buil03.png";
    }
}


const gameStart = () => {
    requestAnimationFrame(update);
    setInterval(placeBuilding,  900); //1000 milliseconds = 1 second
    setInterval(placeEnemies,  450);
    setStage();
}

const setCharacterSelection = () =>{
    const characters = document.querySelectorAll(".character");
    characters.forEach(character => {
        character.addEventListener("click", function() {
            selectedCharacterImgSrc=character.getAttribute("data-src");
            selectCharacter(selectedCharacterImgSrc);
            gameStart();
        });
        character.addEventListener("touchstart", function() {
            selectedCharacterImgSrc=character.getAttribute("data-src");
            selectCharacter(character.getAttribute("data-src"));
            gameStart();
        });
    });
}

const showCharacterSelection = () => {
    hideGameContainer();
}

const hideCharacterSelection = () => {
    document.querySelector("h2").classList.add("hidden");
    document.getElementById("character-selection").classList.add("hidden");
    document.querySelector("h1").classList.remove("hidden");
    document.getElementById("board").classList.remove("hidden");
}

const hideGameContainer = () => {
    document.querySelector("h2").classList.remove("hidden");
    document.getElementById("character-selection").classList.remove("hidden");
    document.querySelector("h1").classList.add("hidden");
    document.getElementById("board").classList.add("hidden");
}

function selectCharacter(characterSrc) {
    playerImg.src = characterSrc;
    hideCharacterSelection();
} 

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    //player
    velocityY += gravity;
    player.y = Math.min(player.y + velocityY, playerY); //apply gravity to current player.y, making sure it doesn't exceed the ground
    context.drawImage(playerImg, player.x, player.y, player.width, player.height);

    //building
    for (let i = 0; i < buildingArray.length; i++) {
        let building = buildingArray[i];
        building.x += velocityX;
        context.drawImage(building.img, building.x, building.y, building.width, building.height);

        if (detectCollision(player, building)) {
            gameOver = true;
            pauseBackAnimation();
            document.getElementById("game-over").style.display="block";
        }
    }

    //enemy
    for (let i = 0; i < enemyArray.length; i++) {
        let ene=enemyArray[i];
        ene.move();
        context.drawImage(enemyArray[i].img, ene.x, ene.y, ene.width, ene.height);

        if (detectCollision(player, ene)) {
            gameOver = true;
            pauseBackAnimation();
            document.getElementById("game-over").style.display="block";
        }
    }

    //score
    context.fillStyle="black";
    context.font="20px courier";
    score++;
    context.fillText(score, 5, 20);
}

function movePlayer() {
    if (gameOver) {
        return;
    }
    if(player.y>50){    
        //jump
        if(player.y==boardHeight - playerHeight){
            velocityY = -10.7;
        }else{
            velocityY = -10.7*0.7;
        }  
    }
}

function placeBuilding() {
    if (gameOver) {
        return;
    }

    //place building
    let building = {
        img : null,
        x : buildingX,
        y : buildingY,  //Math.max(cactusY - boardHeight*Math.random(),cactusHeight) 
        width : null,
        height: buildingHeight
    }

    let placeBuildingChance = Math.random(); //0 - 0.9999...

    if (placeBuildingChance > .90) { //10% you get cactus3
        building.img = building3Img;
        building.width = building3Width;
        buildingArray.push(building);
    }
    else if (placeBuildingChance > .70) { //30% you get cactus2
        building.img = building2Img;
        building.width = building2Width;
        buildingArray.push(building);
    }
    else if (placeBuildingChance > .50) { //50% you get cactus1
        building.img = building1Img;
        building.width = building1Width;
        buildingArray.push(building);
    }

    if (buildingArray.length > 5) {
        buildingArray.shift(); //remove the first element from the array so that the array doesn't constantly grow
    }
}

//place enemies
function placeEnemies() {
    if (gameOver) {
        return;
    }

    let enemy;

    //place enemy
    let placeEnemyChance = Math.random(); //0 - 0.9999...

    if (placeEnemyChance > .90) { //10% you get cactus3
        ene3.setAlt();
        enemy= new Enemy(ene3.name,ene3.width,ene3.height,ene3.x,ene3.y,ene3.vx,ene3.imgSrc);
        enemyArray.push(enemy);
    }  
    else if (placeEnemyChance > .70) { //30% you get cactus2
        ene2.setAlt();
        enemy= new Enemy(ene2.name,ene2.width,ene2.height,ene2.x,ene2.y,ene2.vx,ene2.imgSrc);
        enemyArray.push(enemy);
    }
    else if (placeEnemyChance > .50) { //50% you get cactus1
        ene1.setAlt();
        enemy= new Enemy(ene1.name,ene1.width,ene1.height,ene1.x,ene1.y,ene1.vx,ene1.imgSrc);
        enemyArray.push(enemy);
    }

    if (enemyArray.length > 6) {
        enemyArray.shift(); //remove the first element from the array so that the array doesn't constantly grow
    }
}


function detectCollision(a, b) {
    return a.x  + 20 < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width - 20 > b.x &&   //a's top right corner passes b's top left corner
           a.y + 20 < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height - 20 > b.y;    //a's bottom left corner passes b's top left corner
}

function restart(e){
    if(e.code=="Escape" && gameOver==true){
        this.location.reload();
    }
}

function conti(e){
    if(e.code=="Space"){
        continueTheGame();
    }
}

function continueTheGame(){
    if(gameOver){
        document.getElementById("game-over").style.display="none";
        reset();
        selectCharacter(selectedCharacterImgSrc);
    }
}

function reset(){
    gameOver=false;
    score=0;
    player.x=playerX;
    player.y=playerY;
    velocityY=0;
    enemyArray=[];
    buildingArray=[];
    resetBackAnimation();
    setStage();
}

function pauseBackAnimation(){
    document.getElementById("board").style.animationPlayState="paused";
}

function resetBackAnimation(){
    element=document.getElementById("board");
    element.classList.remove("scroll-animation");
    // void element.offsetWidth; 
    document.getElementById("board").style.animationPlayState="running";
    element.classList.add('scroll-animation');
}
