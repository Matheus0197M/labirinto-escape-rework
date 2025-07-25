const emojiInputs = document.querySelectorAll(".emoji-input");

const nameInput = document.querySelector("#nameInput");
const commentInput = document.querySelector("#commentInput");
const feedbackForm = document.querySelector("#feedbackForm");


feedbackForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const selectedEmoji = [...emojiInputs].find(input => input.checked)?.value;

    if (!nameInput.value || !selectedEmoji) {
        alertT("nomeEmojiFaltando");
        return;
    }

    console.log({
        name: nameInput.value,
        emoji: selectedEmoji,
        Coment: commentInput.value
    });

    const emojiMap = {
        BOM: "😀",
        MEDIO: "😐",
        RUIM: "😡"
    };

    const emoji = emojiMap[selectedEmoji];
    const name = nameInput.value.trim() || "anônimo";
    const comment = commentInput.value.trim() || "anônimo";

    const payload = {
        name,
        emoji,
        Coment: comment
    };


    try {
        const response = await fetch("https://ukqwrpyabtkbttibholb.supabase.co/rest/v1/matheus-game", {

            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrcXdycHlhYnRrYnR0aWJob2xiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NTcxMDEsImV4cCI6MjA2NzIzMzEwMX0.buH-SooEcnodDHREFkAsJcVLyv6rqbHiJ92d6tfaJ4I",
                "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrcXdycHlhYnRrYnR0aWJob2xiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NTcxMDEsImV4cCI6MjA2NzIzMzEwMX0.buH-SooEcnodDHREFkAsJcVLyv6rqbHiJ92d6tfaJ4I",
                "Prefer": "return=minimal"
            },
            body: JSON.stringify(payload)
        });

        //Retorna OK se der certo ou ERROR se der errado
        if (response.ok) {
            alertT("feedbackSucesso");
            feedbackForm.reset();
            feedbackForm.classList.add("hidden");
        } else {
            alertT("feedbackErro");
        }
    } catch (error) {
        console.error("Erro:", error);
        alertT("conexaoErro");
    }


});
