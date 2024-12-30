// utils
const isMobile = window.matchMedia("(any-pointer:coarse)").matches;
console.log('isMobile=', isMobile);

function random(min, max) {
    return Math.round(min + (max-min)*Math.random());
}

function pickRandom(array) {
    if (array && array.length) {
        return array[random(0, array.length-1)];
    }
    return null;
}

function pickCycle(array, start = 0) {
    let i = start;
    return function next() {
        if (i > array.length-1) {
            i = 0;
        }
        return array[i++];
    }
}

function delay(period) {
    return new Promise((res) => setTimeout(res, period));
}

// main

const labels = ['OK', 'YES', 'NEXT', 'RUN', 'ДА'];
const icons = ['fa-question-circle', 'fa-exclamation-circle', 'fa-minus-circle', 'fa-plus-circle', 'fa-check-circle', 'fa-times-circle'];
const balls = [1,2,3,4,5,6].map(i => `ball-${i}`);
const nextBall = pickCycle(balls);
const wishes = [
    'здоровья', 'удачи', 'счастья', 'радости', 'успехов', 'благополучия', 'вдохновения'
];
const nextWish = pickCycle(wishes, random(0, wishes.length-1));
const HEIGHT = 9;

function generateTreeHtml() {
    const F = 1 / 3;
    let html = '<i id="star" class="fas fa-4x fa-exclamation-triangle"></i>';
    const nextIcon = pickCycle(icons, random(0, icons.length-1));
    for (let r = 1; r <= HEIGHT; r++) {
        let row = `<div class="tree-row" id="row-${r}">`;
        let n = Math.trunc(r * F) + 1;
        let w = 5 * r * F / n;
        row += `<i id="ball-${r}-0" class="ball fas ${nextIcon()}"></i>`
        for (let i = 1; i <= n; i++) {
            let btn = `<button id="btn-${r}-${i}" type="button" style="width: ${w}rem" disabled class="tree-btn btn">`
            btn += `OK`
            btn += `</button>`;
            row += btn + `<i id="ball-${r}-${i}" class="ball fas ${nextIcon()}"></i>`;
        }
        row += '</div>';
        html += row;
    }
    html += `<button type="button" style="width: 3rem" disabled class="stem-btn btn">&nbsp;</button>`
    html += `<button type="button" style="width: 3rem" disabled class="stem-btn btn">&nbsp;</button>`
    //html += `<button type="button" style="width: 3rem" disabled class="stem-btn btn">&nbsp;</button>`
    return html;
}

function createCat($t) {
    const g = document.createElement('i');
    g.className = 'cat fas fa-cat';
    g.style.position = 'absolute';
    g.style.bottom = '0';
    g.style.left = '' + ($t.offsetWidth / 3) + 'px';

    const catSound = document.createElement('audio');
    catSound.src = './cat.mp3'
    document.body.appendChild(catSound)
    g.addEventListener('click', function() {
        catSound.play()
    })

    return g;
}

function makeGift($t) {
    const g = document.createElement('i');
    g.className = 'gift fas fa-gift';
    g.style.position = 'absolute';
    g.style.bottom = '0';
    g.style.left = '' + ($t.offsetWidth * 2 / 3) + 'px';
    return g;
}

const tree = document.getElementById('tree');

window.addEventListener('load', function() {
        tree.innerHTML = generateTreeHtml();
        tree.addEventListener('click', (e) => {
            if (e.target.tagName.toUpperCase() === 'BUTTON') {
                wish(e.pageX, e.pageY, nextWish());
                e.preventDefault();
                e.stopPropagation();
            }
        })
    }
);

function lightBanner() {
    const banner = document.getElementById('banner');
    banner.classList.remove('invisible');
}

function lightStar() {
    tree.querySelector('#star').classList.add('star-glow');
}

function lightTree() {
    //document.body.classList.toggle('body-ani');
    tree.querySelectorAll('.tree-btn').forEach(b => {
        b.removeAttribute('disabled');
        b.classList.add('btn-success');
    });
    tree.querySelectorAll('.stem-btn').forEach(b => {
        b.removeAttribute('disabled');
    });
}

const effects = [ballsSequenceLightEffect, ballsRowCycleLightEffect, ballsRandomAllLightEffect, ballsRandomRowLightEffect];
const nextEffect = pickCycle(effects);

const switcher = {
    off: false
}

function lightBalls() {
    let timer = nextEffect()();
    setInterval(() => {
        clearInterval(timer);
        timer = nextEffect()();
    }, 8000);
}

function ballsSequenceLightEffect() {
    return setInterval(() => {
        if (switcher.off) return;
        const ball = nextBall();
        tree.querySelectorAll('.ball').forEach(b => {
            b.classList.remove(...balls);
            b.classList.add(ball)
        })
    }, random(250, 350));
}

function ballsRandomAllLightEffect() {
    return setInterval(() => {
        if (switcher.off) return;
        tree.querySelectorAll('.ball').forEach(b => {
            b.classList.remove(...balls);
            b.classList.add(pickRandom(balls))
        })
    }, random(150, 250));
}

function ballsRandomRowLightEffect() {
    return setInterval(() => {
        if (switcher.off) return;
        tree.querySelectorAll('.tree-row').forEach(r => {
            const c = pickRandom(balls);
            r.querySelectorAll('.ball').forEach(b => {
                b.classList.remove(...balls);
                b.classList.add(c)
            });
        })
    }, random(150, 250));
}

function ballsRowCycleLightEffect() {
    return setInterval(() => {
        if (switcher.off) return;
        tree.querySelectorAll('.tree-row').forEach((r, i) => {
            const ball = nextBall();
            r.querySelectorAll('.ball').forEach(b => {
                b.classList.remove(...balls);
                b.classList.add(ball)
            });
        })
    }, random(150, 250));
}

function wish(x, y, text) {
    const el = document.createElement('div');
    el.className = 'wish';
    el.innerHTML = text;
    el.style.top = `${y}px`;
    el.style.left = `${x}px`;
    el.onanimationend = () => {
        document.body.removeChild(el);
        if (isMobile) {
            switcher.off = false;
        }
    }
    if (isMobile) {
        switcher.off = true;
    }
    document.body.appendChild(el);
}

async function light() {
    document.getElementById('control').classList.add('d-none');
    lightTree();
    await delay(600);
    lightStar();
    await delay(600);
    tree.appendChild(makeGift(tree));
    await delay(500);
    tree.appendChild(createCat(tree));
    await delay(500);
    lightBalls();
    await delay(300);
    lightBanner();
    await delay(300);
    document.getElementById('year').classList.remove('d-none');
}

const startButton = document.getElementById('startButton')

startButton.addEventListener('click', () => {
    light()
})