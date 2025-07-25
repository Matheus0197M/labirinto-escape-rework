function palavraDourada(texto) {
    const span = document.createElement('span');
    const strong = document.createElement('strong');
    span.textContent = texto;
    span.appendChild(strong);
    span.style.color = 'gold';
    return span;
}

const palavra1 = palavraDourada('jogo');
const palavra2 = palavraDourada('game');

function alertT(chave) {
    alert(translations[currentLang].alerts[chave]);
}


const translations = {
    pt: {
        infoText: "Use as teclas W A S D para escapar!",
        level: "Nível: ",
        questionName: "Qual o seu nome?",
        emojiQuestion: "Entre os três emotes, qual representa mais a sua sensação com o jogo?",
        suggestion: "Deixe sua crítica ou sugestão (opcional):",
        send: "Enviar",
        gameIntro1: "O que é este jogo?",
        gameIntro2: "Este jogo é um Labirinto onde <span class='azul'>você</span> deve chegar à <span class='verde'>saída</span>, enquanto evita e escapa dos <span class='vermelho'>assassinos</span> que estão espalhados no labirinto.",
        gameIntro3: "Usando as teclas W, A, S, D, você move o seu <span class='azul'>personagem</span> pelo labirinto até a <span class='verde'>saída</span>.",
        gameIntro4: "Se <span class='azul'>você</span> não tiver uma estratégia, os <span class='vermelho'>assassinos</span> o cercarão e farão coisas piores ao invés de te matar.",
        gameIntro5: "Abaixo está uma caixa para você deixar o seu feedback e um comentário/crítica sobre o %palavra%.",
        copyright: "Copyright © Todos os direitos reservados",
        alerts: {
            pego: "Você foi pego pelo assassino! Fim de jogo. Reiniciando Nível 1.",
            escapou: "Você escapou! Preparando o próximo nível...",
            nomeEmojiFaltando: "Por favor, preencha o nome e escolha um emoji.",
            feedbackSucesso: "Obrigado pelo feedback!",
            feedbackErro: "Erro ao enviar feedback.",
            conexaoErro: "Erro na conexão com o servidor."
        }
    },

    en: {
        infoText: "Use the W A S D keys to escape!",
        level: "Level: ",
        questionName: "What is your name?",
        emojiQuestion: "Among the three emotes, which one best represents how you feel about the game?",
        suggestion: "Leave your criticism or suggestion (optional):",
        send: "Send",
        gameIntro1: "What is this game?",
        gameIntro2: "This game is a Maze where <span class='azul'>you</span> must reach the <span class='verde'>exit</span> while avoiding and escaping from the <span class='vermelho'>killers</span> scattered throughout the maze.",
        gameIntro3: "Using the W, A, S, D keys, you move your <span class='azul'>character</span> through the maze to the <span class='verde'>exit</span>.",
        gameIntro4: "If <span class='azul'>you</span> don't have a strategy, the <span class='vermelho'>assassins</span> will surround you and do worse things instead of killing <span class='azul'>you</span>.",
        gameIntro5: "Below is a box for you to leave your feedback and a comment/criticize about the %palavra%.",
        copyright: "Copyright © All rights reserved",
        alerts: {
            pego: "You were caught by the killer! Game over. Restarting Level 1.",
            escapou: "You escaped! Preparing the next level...",
            nomeEmojiFaltando: "Please enter your name and choose an emoji.",
            feedbackSucesso: "Thanks for your feedback!",
            feedbackErro: "Error sending feedback.",
            conexaoErro: "Server connection error."
        }
    }
};


let currentLang = localStorage.getItem('lang') || 'pt';

function translatePage() {
    currentLang = currentLang === 'pt' ? 'en' : 'pt';
    localStorage.setItem('lang', currentLang);

    const t = translations[currentLang];

    document.querySelector('.oi').textContent = t.infoText;
    document.getElementById('level').textContent = t.level;

    document.querySelector('form p:nth-of-type(1)').textContent = t.questionName;
    document.querySelector('form p:nth-of-type(2)').textContent = t.emojiQuestion;
    document.querySelector('form p:nth-of-type(3)').textContent = t.suggestion;
    document.querySelector('#feedbackForm button').textContent = t.send;

    const gameIntro = document.querySelector('.coment-of-game').children;
    gameIntro[0].textContent = t.gameIntro1;
    gameIntro[1].innerHTML = t.gameIntro2;
    gameIntro[2].innerHTML = t.gameIntro3;
    gameIntro[3].innerHTML = t.gameIntro4;
    const palavraDouradaSpan = palavraDourada(currentLang === 'pt' ? 'jogo' : 'game');
    const gameIntro5Element = gameIntro[4];

    const textoGameIntro5 = t.gameIntro5.split('%palavra%');
    gameIntro5Element.innerHTML = '';
    gameIntro5Element.append(textoGameIntro5[0], palavraDouradaSpan, textoGameIntro5[1]);


    document.querySelector('footer').textContent = t.copyright;

    document.getElementById('translateButton').textContent = currentLang === 'pt' ? 'English' : 'Português';
}

// Aplica a tradução assim que a página carregar
window.addEventListener('DOMContentLoaded', () => {
    if (currentLang !== 'pt') {
        translatePage();
    }
    document.getElementById('translateButton').addEventListener('click', translatePage);
    console.log("Tradução aplicada:", currentLang)
});
