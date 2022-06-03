import {getRandomNumber, getCssProp, detectCollision, roundNum} from './utils/utils.js'

//get element from html file

let game, block, hole, character, score, gameOverScreen, star, gameStopped, isJumping,
    scoreTotal, gameSpeed, gravityStopped

function getElements() {
    game = document.querySelector('#game')
    block = document.querySelector('#block')
    hole = document.querySelector('#hole')
    character = document.querySelector('#character')
    score = document.querySelector('#score')
    gameOverScreen = document.querySelector('#gameOverScreen')
    star = document.querySelector('#star')
}

// set Initiation of game

function setInitialValues(){
    gameStopped = false;
    isJumping = false;
    isJumping = 0;
    scoreTotal = 0;
    gameSpeed = 'slow'
    gravityStopped = false
}

function initRandomHoles(){
    hole.addEventListener('animationiteration', _ => {

        const fromHeight = 60* window.innerHeight / 100;
        const toHeight = 95* window.innerHeight / 100;
        const randomTop = getRandomNumber(fromHeight, toHeight);
        hole.style.top = `-${randomTop}px`
    })
}

function beginGravity(){
    setInterval(_ => {
        if(isJumping || gameStopped) return
        changeGameState({ diff: 5, direction: 'down'})
    }, 20)
}

function startBgAnimation(){
    game.style.animation = 'BackgroundAnimation 5s infinite linear'
}

function startGravity(){
    gravityStopped = false
}

function resetCharacterPosition(){
    character.style.top = `30vh`
    character.style.left = `25vw`
}

//when character jumping
//jumping

function characterJump(){
    isJumping = true;
    let jumpCount = 0;

    const jumpInterval = setInterval(_ =>{
        changeGameState({diff: -3, direction: 'up'})

        if (jumpCount > 20 ){
            clearInterval(jumpInterval)
            isJumping = false
            jumpCount = 0;
        }
        jumpCount ++;
    }, 10)
}

function handleCharacterAnimation(direction){
    if(direction === 'down'){
        character.classList.remove('go-up')
        character.classList.add('go-down')
    } else if(direction === 'up'){
        character.classList.add('go-up')
        character.classList.remove('go-down')
    }
}

function handleCharacterPosition(diff){
    const characterTop = parseInt( getCssProp( character, 'top'))
    const changeTop = characterTop + diff;

    if (changeTop < 0){
        return
    }
    if(changeTop > window.innerHeight){
        return gameOver() 
    }
    character.style.top = `${changeTop}px`
}

//speed 

const gameSpeedConfig ={
    'slow': 250,
    'normal': 250,
    'fast': 350,
    'super_fast': 450,
    'ridiculous': 550,
}

function handleGameSpeed(){
    let doReset = false;

    if(scoreTotal >5000){
        gameSpeed = 'Ridiculous';
        doReset = true;
    }
    else if(scoreTotal > 3000){
        gameSpeed = 'super_fast'
        doReset = true;
    }   
    else if(scoreTotal > 1000){
        gameSpeed = 'fast'
        doReset = true;
    }
    else if(scoreTotal > 500){
        gameSpeed = 'normal'
        doReset = true;
    }
    if(doReset){
        const timeOutLength = gameSpeedConfig[gameSpeed] * (gameSpeedConfig[gameSpeed]/10)
        setTimeout( _ => {
            if(gameStopped) return
            resetAllAnimations();
        }, timeOutLength) 
    }
}

// collision

let numberOfHoles = 0;
let soundCount = 0;
let scoreCount = 0;

function handleCharacterCollision(){
    const collisionBlock = detectCollision( character, block);
    const collisionHole = detectCollision(character, hole, { y1: -46, y2: 47})

    if(collisionBlock && !collisionHole){
        changeScoreUI()
        return gameOver()
    } 
    else if (collisionHole){
        scoreTotal ++;
        soundCount ++;
        if ( scoreCount > 35){
            soundCount = 0;
        }
        changeScoreUI()

        if (gameStopped) 
        return  numberOfHoles ++;

        if(numberOfHoles > 150){
            numberOfHoles = 0
        }
    }
}

function changeGameState( {diff, direction}){
    handleGameSpeed()
    handleCharacterAnimation(direction);
    handleCharacterCollision();
    handleCharacterPosition(diff)
}

// set score of game

function resetScore(){
    scoreTotal = 0
}

function changeScoreUI(){
    score.innerText = `Score ${scoreTotal.toString()} `
    gameOverScreen.querySelector('.score').innerText = score.innerText
}

//game over
function showGameOverScreen(){
    gameOverScreen.style.display = ''
}

function hideGameOverScreen(){
    gameOverScreen.style.display = 'none'
}

function stopGravity(){
    gravityStopped = true
}

function stopBgAnimation(){
    game.style.animation = ''
}

function stopBlockAnimation(){
    const blockLeft = block.getBoundingClientRect().x

    block.style.animation = ''
    hole.style.animation = ''
   
    block.style.left = `${blockLeft}px`
    hole.style.left = `${blockLeft}px`
}

function setEventListener(){
    window.addEventListener('resize', _ => {
        if (gameStopped) return
        resetAllAnimations();
    })

    gameOverScreen.querySelector('button').addEventListener('click', _ =>{
        gameSpeed = 'slow'
        hideGameOverScreen()
        startGravity()
        resetAllAnimations()  
        resetCharacterPosition()
        resetScore()
        changeScoreUI()
        startBgAnimation();
    
        setTimeout( _ => {
            gameStopped = false
        })
    })

    document.body.parentElement.addEventListener('click', _ => {
        if (gameStopped) return
        characterJump()
    })
    document.onkeypress = e => {
        e = e || window.Event
        if(e.keyCode ===32){
            if (gameStopped) return
            characterJump()
        }
    }
} 

function resetAllAnimations(){
    const seconds = roundNum( window.innerWidth / gameSpeedConfig[gameSpeed])
    const blockAnimationCss = `blockAnimation ${seconds}s infinite linear`

    block.style.animation = blockAnimationCss;
    hole.style.animation = blockAnimationCss;
}

function gameOver(){
    gameStopped = true;        
    showGameOverScreen();  
    stopBlockAnimation();
    stopGravity();
    stopBgAnimation();  
}
//
function gameInit(){
    getElements();
    setInitialValues();
    beginGravity();
    initRandomHoles();
    setEventListener();
    resetAllAnimations();
    startBgAnimation();
}   
gameInit();