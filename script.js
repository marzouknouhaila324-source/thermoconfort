javascript
// ============================================
// 1. Récupération des éléments HTML
// ============================================

const temperatureInput = document.getElementById("temperature");
const humiditeInput = document.getElementById("humidite");

const temperatureRange = document.getElementById("temperature-range");
const humiditeRange = document.getElementById("humidite-range");

const evaluerButton = document.getElementById("evaluer");
const reinitialiserButton = document.getElementById("reinitialiser");

const scoreElement = document.getElementById("score");
const scoreCircle = document.getElementById("score-circle");
const comfortLabel = document.getElementById("comfort-label");
const resultDescription = document.getElementById("result-description");

const houseMessage = document.getElementById("house-message");
const adviceTitle = document.getElementById("advice-title");
const adviceText = document.getElementById("advice");
const adviceIcon = document.getElementById("advice-icon");
const adviceCard = document.getElementById("advice-card");


// ============================================
// 2. Fonctions d'appartenance de la température
// ============================================

function temperatureFroide(t) {
    if (t <= 10) return 1;
    if (t >= 20) return 0;

    return (20 - t) / 10;
}

function temperatureModeree(t) {
    if (t <= 15 || t >= 30) return 0;

    if (t <= 22.5) {
        return (t - 15) / 7.5;
    }

    return (30 - t) / 7.5;
}

function temperatureChaude(t) {
    if (t <= 25) return 0;
    if (t >= 35) return 1;

    return (t - 25) / 10;
}


// ============================================
// 3. Fonctions d'appartenance de l'humidité
// ============================================

function humiditeFaible(h) {
    if (h <= 20) return 1;
    if (h >= 40) return 0;

    return (40 - h) / 20;
}

function humiditeMoyenne(h) {
    if (h <= 30 || h >= 70) return 0;

    if (h <= 50) {
        return (h - 30) / 20;
    }

    return (70 - h) / 20;
}

function humiditeElevee(h) {
    if (h <= 60) return 0;
    if (h >= 80) return 1;

    return (h - 60) / 20;
}


// ============================================
// 4. Fonctions utilitaires
// ============================================

function limiter(valeur, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, valeur));
}

function pourcentage(valeur) {
    return Math.round(valeur * 100);
}

function afficherAppartenance(nom, valeur) {
    const valeurElement = document.getElementById(`${nom}-value`);
    const barreElement = document.getElementById(`${nom}-bar`);

    if (!valeurElement || !barreElement) return;

    const p = pourcentage(valeur);

    valeurElement.textContent = `${p} %`;
    barreElement.style.width = `${p}%`;
}


// ============================================
// 5. Synchronisation des champs et curseurs
// ============================================

function synchroniser(champ, curseur, minimum, maximum) {
    champ.addEventListener("input", function () {
        if (champ.value.trim() === "") return;

        const valeur = limiter(Number(champ.value), minimum, maximum);

        curseur.value = valeur;
        actualiserEvaluation();
    });

    curseur.addEventListener("input", function () {
        champ.value = curseur.value;
        actualiserEvaluation();
    });

    champ.addEventListener("change", function () {
        let valeur = Number(champ.value);

        if (champ.value.trim() === "" || !Number.isFinite(valeur)) {
            valeur = Number(curseur.value);
        }

        valeur = limiter(valeur, minimum, maximum);

        champ.value = valeur;
        curseur.value = valeur;

        actualiserEvaluation();
    });
}

synchroniser(temperatureInput, temperatureRange, 0, 45);
synchroniser(humiditeInput, humiditeRange, 0, 100);


// ============================================
// 6. Système d'inférence floue
// ET = minimum
// Agrégation des règles = maximum
// ============================================

function infererConfort(tf, tm, tc, hf, hm, he) {

    // R1 : Froide ET Faible => Mauvais
    const R1 = Math.min(tf, hf);

    // R2 : Froide ET Moyenne => Mauvais
    const R2 = Math.min(tf, hm);

    // R3 : Froide ET Élevée => Mauvais
    const R3 = Math.min(tf, he);

    // R4 : Modérée ET Faible => Moyen
    const R4 = Math.min(tm, hf);

    // R5 : Modérée ET Moyenne => Bon
    const R5 = Math.min(tm, hm);

    // R6 : Modérée ET Élevée => Moyen
    const R6 = Math.min(tm, he);

    // R7 : Chaude ET Faible => Mauvais
    const R7 = Math.min(tc, hf);

    // R8 : Chaude ET Moyenne => Mauvais
    const R8 = Math.min(tc, hm);

    // R9 : Chaude ET Élevée => Mauvais
    const R9 = Math.min(tc, he);

    // Agrégation par classe de confort
    const mauvais = Math.max(R1, R2, R3, R7, R8, R9);
    const moyen = Math.max(R4, R6);
    const bon = R5;

    // Défuzzification par moyenne pondérée
    // Valeurs représentatives : Mauvais = 20,
    // Moyen = 50, Bon = 100

    const somme = mauvais + moyen + bon;

    let resultat = 20;

    if (somme > 0) {
        resultat = (
            mauvais * 20 +
            moyen * 50 +
            bon * 100
        ) / somme;
    }

    return {
        mauvais,
        moyen,
        bon,
        score: Math.round(resultat),
        regles: [R1, R2, R3, R4, R5, R6, R7, R8, R9]
    };
}


// ============================================
// 7. Mise à jour des résultats et du design
// ============================================

function actualiserEvaluation() {

    const temperature = Number(temperatureInput.value);
    const humidite = Number(humiditeInput.value);

    if (
        temperatureInput.value.trim() === "" ||
        humiditeInput.value.trim() === "" ||
        !Number.isFinite(temperature) ||
        !Number.isFinite(humidite)
    ) {
        return;
    }

    const t = limiter(temperature, 0, 45);
    const h = limiter(humidite, 0, 100);

    // Degrés d'appartenance
    const tf = temperatureFroide(t);
    const tm = temperatureModeree(t);
    const tc = temperatureChaude(t);

    const hf = humiditeFaible(h);
    const hm = humiditeMoyenne(h);
    const he = humiditeElevee(h);

    // Affichage des degrés d'appartenance
    afficherAppartenance("froide", tf);
    afficherAppartenance("moderee", tm);
    afficherAppartenance("chaude", tc);

    afficherAppartenance("faible", hf);
    afficherAppartenance("moyenne", hm);
    afficherAppartenance("elevee", he);

    // Application des neuf règles
    const resultat = infererConfort(tf, tm, tc, hf, hm, he);

    const score = resultat.score;

    scoreElement.textContent = score;
    scoreCircle.style.setProperty("--score-angle", `${score * 3.6}deg`);

    // Interprétation du score
    let classe;
    let description;
    let recommandation;
    let icone;
    let couleur;
    let messageMaison;

    if (score >= 75) {
        classe = "Bon";
        description =
            "Les conditions évaluées correspondent à un niveau de confort favorable.";
        recommandation =
            "Les conditions sont favorables selon les règles du système. Conservez, si possible, ces paramètres environnementaux.";
        icone = "✓";
        couleur = "#6c9a7b";
        messageMaison = "Conditions favorables au confort";
    } else if (score >= 40) {
        classe = "Moyen";
        description =
            "Le confort est intermédiaire. Certaines conditions peuvent être améliorées.";
        recommandation =
            "Une adaptation de la température ou de l’humidité peut améliorer le confort ressenti.";
        icone = "↗";
        couleur = "#d99a56";
        messageMaison = "Une amélioration est possible";
    } else {
        classe = "Mauvais";
        description =
            "Les conditions évaluées sont peu favorables selon les règles définies.";
        recommandation =
            "Il est conseillé d’ajuster les conditions ambiantes afin de se rapprocher d’une température et d’une humidité plus favorables.";
        icone = "!";
        couleur = "#cb795f";
        messageMaison = "Conditions à améliorer";
    }

    comfortLabel.textContent = classe;
    comfortLabel.style.color = couleur;

    resultDescription.textContent = description;
    adviceTitle.textContent = `Niveau de confort : ${classe}`;
    adviceText.textContent = recommandation;
    adviceIcon.textContent = icone;
    adviceIcon.style.color = couleur;
    adviceIcon.style.backgroundColor = `${couleur}20`;
    adviceCard.style.borderColor = `${couleur}55`;
    houseMessage.textContent = messageMaison;

    scoreCircle.style.background = `conic-gradient(
        ${couleur} ${score * 3.6}deg,
        #edf1ed ${score * 3.6}deg
    )`;
}


// ============================================
// 8. Bouton Évaluer
// ============================================

evaluerButton.addEventListener("click", function () {

    const temperature = Number(temperatureInput.value);
    const humidite = Number(humiditeInput.value);

    if (
        temperatureInput.value.trim() === "" ||
        humiditeInput.value.trim() === "" ||
        !Number.isFinite(temperature) ||
        !Number.isFinite(humidite) ||
        temperature < 0 || temperature > 45 ||
        humidite < 0 || humidite > 100
    ) {
        alert("Veuillez saisir une température entre 0 et 45 °C et une humidité entre 0 et 100 %.");
        return;
    }

    actualiserEvaluation();

    document.querySelector(".result-heading").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});


// ============================================
// 9. Bouton Réinitialiser
// ============================================

reinitialiserButton.addEventListener("click", function () {

    temperatureInput.value = 25;
    temperatureRange.value = 25;

    humiditeInput.value = 50;
    humiditeRange.value = 50;

    actualiserEvaluation();
});


// ============================================
// 10. Initialisation au chargement
// ============================================

actualiserEvaluation();
