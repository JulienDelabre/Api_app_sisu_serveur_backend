const allProgramSessions = [
  // =========================================================================
  // SPORT : 30 SÉANCES COMPLÈTES (TITRES FUN & SOUS-TITRES CATÉGORIELS STRUCTURÉS)
  // =========================================================================
  {
    id: 's-chest-triceps',
    category: 'sport',
    title: 'Le bouclier des titans',
    subtitle: 'Pectoraux · Triceps · Deltoïdes antérieurs',
    durationMinutes: 50,
    exerciseCount: 5,
    completed: false,
    exercises: [
      { id: 'pct-1', name: 'Développé couché aux haltères', setsReps: '4 séries × 10 reps', advice: 'Trajectoire convergente au sommet, coudes ouverts à 70° pour préserver les épaules.', done: false },
      { id: 'pct-2', name: 'Dips au poids de corps ou assistés', setsReps: '3 séries × 10 reps', advice: 'Buste penché vers l’avant pour recruter le bas des pectoraux sans forcer sur la capsule antérieure.', done: false },
      { id: 'pct-3', name: 'Écarté incliné aux poulies ou haltères', setsReps: '3 séries × 12 reps', advice: 'Contrôler l’étirement en bas de mouvement, tempo ralenti sur 3 secondes.', done: false },
      { id: 'pct-4', name: 'Barre au front (Skullcrushers) barre EZ', setsReps: '3 séries × 12 reps', advice: 'Coudes fixes pointés vers le plafond pour cibler la longue portion du triceps.', done: false },
      { id: 'pct-5', name: 'Extension triceps à la poulie haute (corde)', setsReps: '3 séries × 15 reps', advice: 'Écarter la corde en fin de poussée avec une contraction volontaire d’une seconde.', done: false }
    ]
  },
  {
    id: 's-back-biceps',
    category: 'sport',
    title: 'Opération ailes de géant',
    subtitle: 'Grand dorsal · Trapèzes · Biceps',
    durationMinutes: 50,
    exerciseCount: 5,
    completed: false,
    exercises: [
      { id: 'pbb-1', name: 'Tractions prise large (ou tirage vertical)', setsReps: '4 séries × 8 reps', advice: 'Amorcer le mouvement par l’abaissement des omoplates avant de fléchir les bras.', done: false },
      { id: 'pbb-2', name: 'Rowing barre ou haltère buste penché', setsReps: '4 séries × 10 reps', advice: 'Dos gainé et colonne neutre, tirer la charge vers le bas du ventre.', done: false },
      { id: 'pbb-3', name: 'Tirage horizontal poulie basse prise neutre', setsReps: '3 séries × 12 reps', advice: 'Serrer les omoplates en fin de tirage pour stimuler l’épaisseur du dos.', done: false },
      { id: 'pbb-4', name: 'Curl incliné aux haltères', setsReps: '3 séries × 10 reps', advice: 'Étirement maximal de la longue portion du biceps grâce à l’angle du banc à 45°.', done: false },
      { id: 'pbb-5', name: 'Curl marteau aux haltères ou corde', setsReps: '3 séries × 12 reps', advice: 'Renforce le brachial antérieur et les avant-bras pour une poigne solide.', done: false }
    ]
  },
  {
    id: 's-shoulders',
    category: 'sport',
    title: 'Canons d’artillerie 3D',
    subtitle: 'Deltoïdes · Trapèzes · Coiffe des rotateurs',
    durationMinutes: 45,
    exerciseCount: 5,
    completed: false,
    exercises: [
      { id: 'psh-1', name: 'Développé militaire assis aux haltères', setsReps: '4 séries × 10 reps', advice: 'Banc redressé à 80°, pousser verticalement sans cambrer le bas du dos.', done: false },
      { id: 'psh-2', name: 'Élévations latérales aux haltères', setsReps: '4 séries × 15 reps', advice: 'Coudes légèrement fléchis, monter à hauteur d’épaules sans à-coup.', done: false },
      { id: 'psh-3', name: 'Face pull à la poulie haute', setsReps: '4 séries × 15 reps', advice: 'Exercice postural clé : ramener la corde vers le front en ouvrant les coudes.', done: false },
      { id: 'psh-4', name: 'Oiseau sur banc incliné (deltoïde arrière)', setsReps: '3 séries × 15 reps', advice: 'Garder la tête neutre, concentrer la contraction sur l’arrière de l’épaule.', done: false },
      { id: 'psh-5', name: 'Rotations externes de la coiffe des rotateurs', setsReps: '3 séries × 15 reps', advice: 'Coude collé au flanc, travail préventif doux et continu.', done: false }
    ]
  },
  {
    id: 's-arms',
    category: 'sport',
    title: 'L’arsenal bras d’acier',
    subtitle: 'Biceps · Triceps · Avant-bras',
    durationMinutes: 45,
    exerciseCount: 5,
    completed: false,
    exercises: [
      { id: 'par-1', name: 'Superset : Curl barre EZ & Barre front', setsReps: '4 séries × 10 reps', advice: 'Enchaîner sans temps mort pour engorger les loges musculaires du bras.', done: false },
      { id: 'par-2', name: 'Curl pupitre Larry Scott (isolation)', setsReps: '3 séries × 10 reps', advice: 'Verrouiller les bras sur le pupitre pour supprimer toute compensation du dos.', done: false },
      { id: 'par-3', name: 'Extension triceps au-dessus de la tête à la poulie', setsReps: '3 séries × 12 reps', advice: 'Maintient une tension continue sur toute la course du mouvement.', done: false },
      { id: 'par-4', name: 'Curl spider couché sur banc incliné', setsReps: '3 séries × 12 reps', advice: 'Pic de contraction intense sur le sommet du biceps.', done: false },
      { id: 'par-5', name: 'Dips prise serrée ou machine guidée', setsReps: '3 séries × 12 reps', advice: 'Corps vertical pour focaliser l’effort à 100% sur les triceps.', done: false }
    ]
  },
  {
    id: 's-legs-glutes',
    category: 'sport',
    title: 'Machine à squat : fessiers en béton',
    subtitle: 'Quadriceps · Ischio-jambiers · Grands fessiers',
    durationMinutes: 55,
    exerciseCount: 5,
    completed: false,
    exercises: [
      { id: 'plg-1', name: 'Squat à la barre ou Goblet squat lourd', setsReps: '4 séries × 10 reps', advice: 'Descente contrôlée, fémurs parallèles au sol, pousser fort sur les talons.', done: false },
      { id: 'plg-2', name: 'Hip thrust au banc avec barre', setsReps: '4 séries × 12 reps', advice: 'Verrouiller le bassin en rétroversion 1 seconde en haut pour engager le grand fessier.', done: false },
      { id: 'plg-3', name: 'Fentes marchées avec haltères', setsReps: '3 séries × 16 pas', advice: 'Genou avant stable dans l’axe du pied, buste droit et gainé.', done: false },
      { id: 'plg-4', name: 'Soulevé de terre jambes semi-tendues (RDL)', setsReps: '4 séries × 10 reps', advice: 'Charnière de hanche propre, étirer puissamment les ischio-jambiers.', done: false },
      { id: 'plg-5', name: 'Mollets debout sur marche', setsReps: '4 séries × 15 reps', advice: 'Étirement complet en bas, montée explosive sur la pointe des pieds.', done: false }
    ]
  },
  {
    id: 's-abs-core',
    category: 'sport',
    title: 'La forteresse abdominale',
    subtitle: 'Grand droit · Obliques · Transverse',
    durationMinutes: 35,
    exerciseCount: 5,
    completed: false,
    exercises: [
      { id: 'pab-1', name: 'Gainage planche avec rétroversion pelvienne', setsReps: '4 séries × 45 sec', advice: 'Aspirer activement le nombril pour recruter le transverse profond.', done: false },
      { id: 'pab-2', name: 'Relevé de bassin suspendu à la barre fixe', setsReps: '3 séries × 12 reps', advice: 'Enrouler le bas du bassin sans balancement d’élan.', done: false },
      { id: 'pab-3', name: 'Crunch à la poulie haute à genoux', setsReps: '4 séries × 15 reps', advice: 'Enrouler les vertèbres une par une, bloquer en bas 1 seconde.', done: false },
      { id: 'pab-4', name: 'Planche latérale dynamique avec élévation', setsReps: '3 séries × 30 sec/côté', advice: 'Renforcement ciblé des obliques et stabilisateurs de hanches.', done: false },
      { id: 'pab-5', name: 'Hollow body hold postural', setsReps: '3 séries × 30 sec', advice: 'Plaquer le bas du dos fermement au sol pour un verrouillage complet.', done: false }
    ]
  },
  {
    id: 's-full-body',
    category: 'sport',
    title: 'La fournaise métabolique',
    subtitle: 'Pectoraux · Chaîne postérieure · Cuisses',
    durationMinutes: 55,
    exerciseCount: 5,
    completed: false,
    exercises: [
      { id: 'pfb-1', name: 'Soulevé de terre trap bar ou classique', setsReps: '4 séries × 8 reps', advice: 'Recrutement global de la chaîne postérieure, colonne rigoureusement droite.', done: false },
      { id: 'pfb-2', name: 'Développé couché haltères ou barre', setsReps: '4 séries × 10 reps', advice: 'Poussée symétrique, stabilité de la ceinture scapulaire.', done: false },
      { id: 'pfb-3', name: 'Tirage vertical ou tractions pronation', setsReps: '4 séries × 10 reps', advice: 'Équilibre agoniste/antagoniste parfait pour la posture du buste.', done: false },
      { id: 'pfb-4', name: 'Fente bulgare unilatérale au banc', setsReps: '3 séries × 10 reps/jambe', advice: 'Corrige les asymétries de force entre la jambe gauche et droite.', done: false },
      { id: 'pfb-5', name: 'Clean & press dynamique aux haltères', setsReps: '3 séries × 8 reps', advice: 'Coordination neuromusculaire et dépense métabolique élevée.', done: false }
    ]
  },
  {
    id: 's-upper',
    category: 'sport',
    title: 'Le grand décollage haut du corps',
    subtitle: 'Pectoraux · Dorsaux · Épaules',
    durationMinutes: 50,
    exerciseCount: 5,
    completed: false,
    exercises: [
      { id: 'pup-1', name: 'Développé incliné aux haltères à 30°', setsReps: '4 séries × 10 reps', advice: 'Ciblage du faisceau claviculaire des pectoraux et deltoïdes antérieurs.', done: false },
      { id: 'pup-2', name: 'Rowing unilatéral haltère sur banc plat', setsReps: '4 séries × 10 reps/bras', advice: 'Amplitude complète avec étirement profond du grand dorsal.', done: false },
      { id: 'pup-3', name: 'Développé militaire debout barre ou haltères', setsReps: '3 séries × 10 reps', advice: 'Gainage des abdominaux et fessiers pour verrouiller le buste.', done: false },
      { id: 'pup-4', name: 'Tirage poitrine poulie haute prise neutre', setsReps: '3 séries × 12 reps', advice: 'Ouvrir la cage thoracique en bas de mouvement.', done: false },
      { id: 'pup-5', name: 'Superset Curl biceps & Dips banc', setsReps: '3 séries × 12 reps', advice: 'Harmonisation finale du volume des bras.', done: false }
    ]
  },
  {
    id: 's-lower',
    category: 'sport',
    title: 'Tornade cuisses & mollets d’airain',
    subtitle: 'Quadriceps · Ischio-jambiers · Mollets',
    durationMinutes: 55,
    exerciseCount: 5,
    completed: false,
    exercises: [
      { id: 'plo-1', name: 'Presse à cuisses inclinée pieds mi-hauts', setsReps: '4 séries × 12 reps', advice: 'Pousser par les talons, sécurité maximale pour les vertèbres lombaires.', done: false },
      { id: 'plo-2', name: 'Leg curl couché pour ischio-jambiers', setsReps: '4 séries × 12 reps', advice: 'Contraction lente, préserve les ligaments croisés du genou.', done: false },
      { id: 'plo-3', name: 'Fente arrière alternée aux haltères', setsReps: '3 séries × 12 reps/jambe', advice: 'Moins de contraintes sur le tendon rotulien que la fente avant.', done: false },
      { id: 'plo-4', name: 'Leg extension guidé (quadriceps)', setsReps: '3 séries × 15 reps', advice: 'Isolation du vaste médial pour verrouiller la rotule.', done: false },
      { id: 'plo-5', name: 'Mollets assis à la machine', setsReps: '4 séries × 15 reps', advice: 'Cible le muscle soléaire pour la puissance d’appui au sol.', done: false }
    ]
  },
  {
    id: 's-mobility',
    category: 'sport',
    title: 'Reset postural : charnières libres',
    subtitle: 'Rachis · Hanches · Épaules',
    durationMinutes: 40,
    exerciseCount: 5,
    completed: false,
    exercises: [
      { id: 'pmo-1', name: 'Cat-Cow & rotations thoraciques au sol', setsReps: '4 séries × 10 cycles', advice: 'Mobilisation douce segment par segment de l’ensemble de la colonne.', done: false },
      { id: 'pmo-2', name: 'Étirement profond du psoas et fléchisseurs', setsReps: '3 séries × 45 sec/côté', advice: 'Soulage la cambrure lombaire après une journée assise.', done: false },
      { id: 'pmo-3', name: 'Ouverture thoracique au rouleau de mousse', setsReps: '3 séries × 1 min', advice: 'Décompresse les vertèbres dorsales et libère la respiration.', done: false },
      { id: 'pmo-4', name: 'Posture du pigeon (rotateurs de hanche)', setsReps: '3 séries × 45 sec/côté', advice: 'Assouplit les fessiers profonds et prévient les douleurs sciatiques.', done: false },
      { id: 'pmo-5', name: 'Suspension passive à la barre (Dead hang)', setsReps: '3 séries × 30-45 sec', advice: 'Décompression axiale complète du rachis et santé des épaules.', done: false }
    ]
  },
  {
    id: 's-plyo-power',
    category: 'sport',
    title: 'Le saut du tigre & puissance pliométrique',
    subtitle: 'Cuisses · Mollets · Sangle abdominale',
    durationMinutes: 40,
    exerciseCount: 4,
    completed: false,
    exercises: [
      { id: 'ply-1', name: 'Box jumps explosifs sur caisson', setsReps: '4 séries × 6 sauts', advice: 'Amortir souplement la réception en demi-squat pour préserver les ménisques.', done: false },
      { id: 'ply-2', name: 'Fentes sautées alternées', setsReps: '3 séries × 10 sauts/jambe', advice: 'Garder le buste droit et chercher une propulsion verticale maximale.', done: false },
      { id: 'ply-3', name: 'Broad jumps horizontaux', setsReps: '3 séries × 5 sauts', advice: 'Exploiter l’extension complète des hanches avec engagement des bras.', done: false },
      { id: 'ply-4', name: 'Sauts à la corde en double under ou alternés', setsReps: '4 séries × 45 sec', advice: 'Travail rebond réactif sur la pointe des pieds.', done: false }
    ]
  },
  {
    id: 's-colossus-shoulders',
    category: 'sport',
    title: 'Les épaules de colosse',
    subtitle: 'Deltoïdes moyens · Trapèzes · Cou',
    durationMinutes: 45,
    exerciseCount: 4,
    completed: false,
    exercises: [
      { id: 'col-1', name: 'Élévations latérales à la poulie basse', setsReps: '4 séries × 12 reps/bras', advice: 'Tension continue dès le départ du mouvement jusqu’à l’horizontale.', done: false },
      { id: 'col-2', name: 'Shrugs lourds aux haltères', setsReps: '4 séries × 12 reps', advice: 'Hausser les épaules vers les oreilles sans faire de rotation arrière.', done: false },
      { id: 'col-3', name: 'Tirage vertical coudes hauts (Rowing menton)', setsReps: '3 séries × 10 reps', advice: 'Prise mi-large pour recruter le faisceau moyen sans coincer la bourse sous-acromiale.', done: false },
      { id: 'col-4', name: 'Oiseau poulie vis-à-vis haute', setsReps: '4 séries × 15 reps', advice: 'Croiser les câbles et ouvrir grand les bras en serrant les omoplates.', done: false }
    ]
  },
  {
    id: 's-commando-core',
    category: 'sport',
    title: 'Gainage commando anti-gravité',
    subtitle: 'Transverse profond · Lombaires · Fléchisseurs',
    durationMinutes: 30,
    exerciseCount: 4,
    completed: false,
    exercises: [
      { id: 'cmd-1', name: 'Planche commando dynamique (coudes/mains)', setsReps: '4 séries × 12 montées', advice: 'Stabiliser le bassin au maximum en évitant le dandinement latéral.', done: false },
      { id: 'cmd-2', name: 'Dragon Flag partiel ou complet', setsReps: '3 séries × 6-8 reps', advice: 'Descente ralentie contrôlée par les abdominaux sans cambrer.', done: false },
      { id: 'cmd-3', name: 'Dead bug avec médecine-ball', setsReps: '3 séries × 12 reps/côté', advice: 'Plaquer les lombaires au sol pendant que les membres opposés descendent.', done: false },
      { id: 'cmd-4', name: 'Gainage Superman lombaire au sol', setsReps: '3 séries × 30 sec', advice: 'Lever simultanément bras et jambes tendus en contractant les fessiers.', done: false }
    ]
  },
  {
    id: 's-pec-tension',
    category: 'sport',
    title: 'Pectoraux sous haute tension',
    subtitle: 'Faisceau claviculaire · Sterno-costal',
    durationMinutes: 45,
    exerciseCount: 4,
    completed: false,
    exercises: [
      { id: 'pct-t1', name: 'Développé incliné barre guidée Smith', setsReps: '4 séries × 8 reps', advice: 'Descendre à 2 cm de la clavicule et pousser fort vers le haut.', done: false },
      { id: 'pct-t2', name: 'Écarté à la poulie vis-à-vis basse', setsReps: '4 séries × 12 reps', advice: 'Monter les mains en avant et en haut pour sculpter le haut des pectoraux.', done: false },
      { id: 'pct-t3', name: 'Pompes surélevées pieds sur banc', setsReps: '3 séries × max reps', advice: 'Gainage ferme, descente profonde pour un étirement maximal.', done: false },
      { id: 'pct-t4', name: 'Pec Deck machine avec arrêt 2 sec', setsReps: '3 séries × 12 reps', advice: 'Maintenir la contraction maximale à la fermeture des bras.', done: false }
    ]
  },
  {
    id: 's-v-taper-back',
    category: 'sport',
    title: 'L’envolée du grand dorsal & épaisseur',
    subtitle: 'Grand dorsal · Grand rond · Rhomboïdes',
    durationMinutes: 50,
    exerciseCount: 4,
    completed: false,
    exercises: [
      { id: 'vtb-1', name: 'Pull-over à la poulie haute bras tendus', setsReps: '4 séries × 12 reps', advice: 'Sentir l’insertion sous l’aisselle s’étirer puis écraser les coudes vers le bas.', done: false },
      { id: 'vtb-2', name: 'T-Bar rowing en appui thoracique', setsReps: '4 séries × 10 reps', advice: 'La poitrine plaquée élimine tout risque lombaire et isole le milieu du dos.', done: false },
      { id: 'vtb-3', name: 'Tirage unilatéral poulie haute à genoux', setsReps: '3 séries × 12 reps/bras', advice: 'Tirer le coude vers la hanche avec une légère inclinaison latérale.', done: false },
      { id: 'vtb-4', name: 'Rack pull lourd au-dessus des genoux', setsReps: '3 séries × 6 reps', advice: 'Verrouiller les fessiers et le haut du dos sans cambrer en fin de trajectoire.', done: false }
    ]
  },
  {
    id: 's-arm-wrestle',
    category: 'sport',
    title: 'Le bras de fer ultime',
    subtitle: 'Biceps brachial · Brachio-radial · Fléchisseurs',
    durationMinutes: 40,
    exerciseCount: 4,
    completed: false,
    exercises: [
      { id: 'arm-1', name: 'Curl zottman (montée supination, descente pronation)', setsReps: '4 séries × 10 reps', advice: 'Contrôler la descente lente pour carboniser les avant-bras.', done: false },
      { id: 'arm-2', name: 'Enroulement de poignets barre EZ sur banc', setsReps: '3 séries × 15 reps', advice: 'Amplitude complète du poignet pour développer la poigne.', done: false },
      { id: 'arm-3', name: 'Curl barre droite prise inversée', setsReps: '3 séries × 12 reps', advice: 'Cible le muscle long supinateur et l’épaisseur de l’avant-bras.', done: false },
      { id: 'arm-4', name: 'Farmer walk lourd aux haltères', setsReps: '4 séries × 40 mètres', advice: 'Marche altière, épaules basses et poigne fermée comme un étau.', done: false }
    ]
  },
  {
    id: 's-infernal-legs',
    category: 'sport',
    title: 'La presse infernale : cuisses en feu',
    subtitle: 'Quadriceps · Vaste interne · Adducteurs',
    durationMinutes: 50,
    exerciseCount: 4,
    completed: false,
    exercises: [
      { id: 'inf-1', name: 'Hack squat ou Presse pieds serrés', setsReps: '4 séries × 10 reps', advice: 'Genoux dans l’alignement des orteils, insister sur le vaste externe.', done: false },
      { id: 'inf-2', name: 'Sissy squat au poids du corps ou guidé', setsReps: '3 séries × 12 reps', advice: 'Étirement foudroyant des quadriceps en maintenant le bassin verrouillé.', done: false },
      { id: 'inf-3', name: 'Adducteurs assis à la machine', setsReps: '3 séries × 15 reps', advice: 'Serrer fort 1 seconde en position fermée pour stabiliser les genoux.', done: false },
      { id: 'inf-4', name: 'Chaise statique dos au mur avec haltère', setsReps: '3 séries × 45 sec', advice: 'Cuisses rigoureusement horizontales, respirer calmement.', done: false }
    ]
  },
  {
    id: 's-obliques-attack',
    category: 'sport',
    title: 'L’attaque des obliques & taille fine',
    subtitle: 'Obliques internes · Obliques externes · Dentelés',
    durationMinutes: 30,
    exerciseCount: 4,
    completed: false,
    exercises: [
      { id: 'obl-1', name: 'Russian twist avec médecine-ball au sol', setsReps: '4 séries × 20 rotations', advice: 'Garder les pieds surélevés et pivoter les épaules, pas seulement les bras.', done: false },
      { id: 'obl-2', name: 'Woodchopper à la poulie moyenne (bûcheron)', setsReps: '3 séries × 12 reps/côté', advice: 'Rotation explosive du tronc contrôlée par les abdominaux latéraux.', done: false },
      { id: 'obl-3', name: 'Relevé de genoux oblique suspendu', setsReps: '3 séries × 10 reps/côté', advice: 'Amener les genoux vers l’aisselle sans balancement.', done: false },
      { id: 'obl-4', name: 'Vacuum postural au repos', setsReps: '4 séries × 20 sec', advice: 'Vider tout l’air des poumons et aspirer le nombril vers la colonne.', done: false }
    ]
  },
  {
    id: 's-glute-bomb',
    category: 'sport',
    title: 'Fessiers bombés & ischios d’or',
    subtitle: 'Grands fessiers · Moyens fessiers · Biceps fémoral',
    durationMinutes: 45,
    exerciseCount: 4,
    completed: false,
    exercises: [
      { id: 'glt-1', name: 'Hip thrust unilatéral avec haltère', setsReps: '4 séries × 10 reps/jambe', advice: 'Pousser fort sur le talon d’appui et aligner épaule, hanche et genou.', done: false },
      { id: 'glt-2', name: 'Kick-back fessier à la poulie basse', setsReps: '3 séries × 12 reps/jambe', advice: 'Jambe légèrement tendue, contraction volontaire en fin d’extension.', done: false },
      { id: 'glt-3', name: 'Good morning léger à la barre', setsReps: '3 séries × 10 reps', advice: 'Recul dynamique des fesses vers l’arrière, dos droit et cambrure naturelle.', done: false },
      { id: 'glt-4', name: 'Abduction de hanche assis avec élastique', setsReps: '3 séries × 20 reps', advice: 'Brûlure assurée sur le moyen fessier pour arrondir le galbe.', done: false }
    ]
  },
  {
    id: 's-samurai-wakeup',
    category: 'sport',
    title: 'Le réveil musculaire du samouraï',
    subtitle: 'Corps entier · Articulations · Cardio doux',
    durationMinutes: 25,
    exerciseCount: 4,
    completed: false,
    exercises: [
      { id: 'sam-1', name: 'Salutations au soleil dynamiques', setsReps: '5 cycles complets', advice: 'Synchroniser chaque mouvement avec une respiration lente et profonde.', done: false },
      { id: 'sam-2', name: 'Squats lents poids du corps tempo 3-2-1', setsReps: '3 séries × 15 reps', advice: 'Réveiller la circulation des jambes et ouvrir les chevilles.', done: false },
      { id: 'sam-3', name: 'Fentes avec rotation thoracique', setsReps: '3 séries × 8 reps/côté', advice: 'Grand pas en avant, bras ouverts vers le ciel pour libérer la cage.', done: false },
      { id: 'sam-4', name: 'Jumping jacks légers et rebonds', setsReps: '3 séries × 45 sec', advice: 'Activation cardiovasculaire progressive sans choc violent.', done: false }
    ]
  },
  {
    id: 's-iron-triceps',
    category: 'sport',
    title: 'Triceps en béton armé',
    subtitle: 'Vaste externe · Longue portion · Vaste médial',
    durationMinutes: 40,
    exerciseCount: 4,
    completed: false,
    exercises: [
      { id: 'tri-1', name: 'Développé couché prise serrée', setsReps: '4 séries × 8 reps', advice: 'Mains écartées de 30 cm, garder les coudes près du corps pendant la descente.', done: false },
      { id: 'tri-2', name: 'Kickback triceps aux haltères buste penché', setsReps: '3 séries × 12 reps', advice: 'Bras parallèle au sol, tendre l’avant-bras sans bouger le coude.', done: false },
      { id: 'tri-3', name: 'Extension triceps à la barre coudée à la poulie', setsReps: '3 séries × 12 reps', advice: 'Verrouiller les poignets et descendre la barre jusqu’aux cuisses.', done: false },
      { id: 'tri-4', name: 'Pompes diamant au sol ou inclinées', setsReps: '3 séries × max reps', advice: 'Pouces et index forment un triangle sous le centre du sternum.', done: false }
    ]
  },
  {
    id: 's-warrior-press',
    category: 'sport',
    title: 'Le développé guerrier & force brute',
    subtitle: 'Pectoraux · Ceinture scapulaire',
    durationMinutes: 45,
    exerciseCount: 4,
    completed: false,
    exercises: [
      { id: 'war-1', name: 'Développé couché lourd à la barre olympique', setsReps: '5 séries × 5 reps', advice: 'Pieds plantés au sol, omoplates serrées sur le banc, trajectoire rectiligne.', done: false },
      { id: 'war-2', name: 'Écarté couché haltères avec tempo', setsReps: '3 séries × 10 reps', advice: 'Descente sur 3 secondes pour maximiser les microlésions d’hypertrophie.', done: false },
      { id: 'war-3', name: 'Développé convergent à la machine unilatérale', setsReps: '3 séries × 10 reps/bras', advice: 'Permet une contraction maximale sans tricher avec le bras dominant.', done: false },
      { id: 'war-4', name: 'Pompes explosives avec claquement de mains', setsReps: '3 séries × 6 reps', advice: 'Développer la puissance de poussée neuromusculaire.', done: false }
    ]
  },
  {
    id: 's-posterior-chain',
    category: 'sport',
    title: 'La chaîne postérieure indestructible',
    subtitle: 'Érecteurs du rachis · Fessiers · Ischios',
    durationMinutes: 50,
    exerciseCount: 4,
    completed: false,
    exercises: [
      { id: 'pos-1', name: 'Soulevé de terre roumain avec haltères', setsReps: '4 séries × 10 reps', advice: 'Descendre les haltères le long des tibias en poussant le bassin en arrière.', done: false },
      { id: 'pos-2', name: 'Banc à lombaires incliné à 45° lesté', setsReps: '3 séries × 12 reps', advice: 'Remonter jusqu’à aligner le tronc avec les jambes sans hyperextension.', done: false },
      { id: 'pos-3', name: 'Leg curl assis à la machine', setsReps: '3 séries × 12 reps', advice: 'Bien caler les genoux et fléchir les jambes jusqu’à la butée.', done: false },
      { id: 'pos-4', name: 'Relevé de bassin au sol jambe tendue', setsReps: '3 séries × 12 reps/côté', advice: 'Travail unilatéral pour équilibrer la force de la chaîne fessière.', done: false }
    ]
  },
  {
    id: 's-ninja-mobility',
    category: 'sport',
    title: 'Mobilité ninja & colonne ondulante',
    subtitle: 'Colonne vertébrale · Cage thoracique · Bassin',
    durationMinutes: 35,
    exerciseCount: 4,
    completed: false,
    exercises: [
      { id: 'nin-1', name: 'Crawl du lézard au sol (Lizard crawl)', setsReps: '3 séries × 10 mètres', advice: 'Garder le corps au ras du sol en coordonnant bras et genoux opposés.', done: false },
      { id: 'nin-2', name: 'Rotations articulaires contrôlées des hanches (CARS)', setsReps: '3 séries × 5 cercles/côté', advice: 'Dessiner le plus grand cercle possible sans incliner le bassin.', done: false },
      { id: 'nin-3', name: 'Pont fessier avec ouverture de pont complet', setsReps: '3 séries × 30 sec', advice: 'Ouvrir les épaules et la cage thoracique en douceur.', done: false },
      { id: 'nin-4', name: 'Squat profond cosaque alterné', setsReps: '3 séries × 8 reps/côté', advice: 'Descendre sur une jambe tout en étirant les adducteurs de la jambe opposée.', done: false }
    ]
  },
  {
    id: 's-hiit-burn',
    category: 'sport',
    title: 'Le circuit métabolique HIIT brûle-graisse',
    subtitle: 'Conditionnement métabolique · Cardio · Full body',
    durationMinutes: 30,
    exerciseCount: 5,
    completed: false,
    exercises: [
      { id: 'hit-1', name: 'Burpees sans saut avec pompe', setsReps: '4 tours × 40 sec effort / 20 sec repos', advice: 'Maintenir un rythme régulier sans perdre la rectitude du gainage.', done: false },
      { id: 'hit-2', name: 'Mountain climbers rapides', setsReps: '4 tours × 40 sec', advice: 'Genoux vers la poitrine, mains bien sous les épaules.', done: false },
      { id: 'hit-3', name: 'Kettlebell swings à deux mains', setsReps: '4 tours × 15 reps', advice: 'Propulsion issue exclusivement de la charnière des hanches et fessiers.', done: false },
      { id: 'hit-4', name: 'Squat jumps dynamiques', setsReps: '4 tours × 12 reps', advice: 'Absorption souple au sol dès l’impact.', done: false },
      { id: 'hit-5', name: 'Shadow boxing intense', setsReps: '4 tours × 1 min', advice: 'Rotation du buste et coordination sans crisper les épaules.', done: false }
    ]
  },
  {
    id: 's-spring-calves',
    category: 'sport',
    title: 'Mollets ressorts & foulée légère',
    subtitle: 'Jumeaux · Soléaires · Voûte plantaire',
    durationMinutes: 25,
    exerciseCount: 4,
    completed: false,
    exercises: [
      { id: 'cal-1', name: 'Élévations de mollets unilatérales sur marche', setsReps: '4 séries × 15 reps/pied', advice: '2 secondes de pause en bas pour annuler le réflexe myotatique et cibler le muscle.', done: false },
      { id: 'cal-2', name: 'Sauts pieds joints sur pointe (Pogo jumps)', setsReps: '4 séries × 30 sec', advice: 'Genoux quasi verrouillés, réactivité du tendon d’Achille.', done: false },
      { id: 'cal-3', name: 'Marche sur la pointe des pieds avec haltères', setsReps: '3 séries × 1 min', advice: 'Renforce les muscles stabilisateurs de la cheville et de la voûte.', done: false },
      { id: 'cal-4', name: 'Tirage élastique pour muscle tibial antérieur', setsReps: '3 séries × 20 reps', advice: 'Relever la pointe du pied contre l’élastique pour équilibrer la cheville.', done: false }
    ]
  },
  {
    id: 's-anti-rust-stretch',
    category: 'sport',
    title: 'Le rituel anti-rouille & souplesse active',
    subtitle: 'Ischio-jambiers · Psoas · Épaules',
    durationMinutes: 30,
    exerciseCount: 4,
    completed: false,
    exercises: [
      { id: 'rus-1', name: 'Fente basse du chevalier avec rétroversion', setsReps: '3 séries × 45 sec/côté', advice: 'Avancer le bassin tout en rentrant le ventre pour étirer le psoas en profondeur.', done: false },
      { id: 'rus-2', name: 'Chien tête en bas dynamique pédalé', setsReps: '3 séries × 1 min', advice: 'Pousser sur les paumes pour envoyer le coccyx vers le plafond.', done: false },
      { id: 'rus-3', name: 'Étirement de la poitrine à l’encadrement de porte', setsReps: '3 séries × 30 sec/bras', advice: 'Ouvrir les épaules vers l’arrière pour corriger l’enroulement.', done: false },
      { id: 'rus-4', name: 'Pinces assises avec sangle', setsReps: '3 séries × 1 min', advice: 'Plier à partir des hanches, garder la nuque longue sans forcer.', done: false }
    ]
  },
  {
    id: 's-lateral-cannons',
    category: 'sport',
    title: 'Canons latéraux & épaules en boule',
    subtitle: 'Faisceaux latéraux · Supra-épineux',
    durationMinutes: 40,
    exerciseCount: 4,
    completed: false,
    exercises: [
      { id: 'lat-1', name: 'Élévations latérales penchées à la poulie', setsReps: '4 séries × 12 reps/bras', advice: 'Le buste incliné permet une trajectoire idéale pour le deltoïde latéral.', done: false },
      { id: 'lat-2', name: 'Développé Arnold haltères complet', setsReps: '3 séries × 10 reps', advice: 'Rotation fluide de la prise paumes face à soi vers l’extérieur en poussant.', done: false },
      { id: 'lat-3', name: 'Élévations en Y sur banc incliné à 45°', setsReps: '3 séries × 15 reps', advice: 'Pouces pointés vers le haut, bras formant un Y pour les fixateurs d’omoplate.', done: false },
      { id: 'lat-4', name: 'Maintien isométrique latéral à 90°', setsReps: '3 séries × 20 sec', advice: 'Charge légère, bloquer à l’horizontale sans hausser les trapèzes.', done: false }
    ]
  },
  {
    id: 's-wild-dips',
    category: 'sport',
    title: 'Poitrine cuirassée & dips sauvages',
    subtitle: 'Pectoraux inférieurs · Triceps',
    durationMinutes: 40,
    exerciseCount: 4,
    completed: false,
    exercises: [
      { id: 'dip-1', name: 'Dips aux barres parallèles avec pause 1 sec en bas', setsReps: '4 séries × 8 reps', advice: 'Coudes ouverts à 45°, contrôle total de la descente.', done: false },
      { id: 'dip-2', name: 'Développé décliné avec haltères', setsReps: '4 séries × 10 reps', advice: 'Isole le bas des pectoraux avec une trajectoire convergente.', done: false },
      { id: 'dip-3', name: 'Poulie vis-à-vis croisée vers le bas', setsReps: '3 séries × 12 reps', advice: 'Croiser légèrement les mains devant les cuisses pour une contraction maximale.', done: false },
      { id: 'dip-4', name: 'Pompes mains surélevées tempo 4 sec', setsReps: '3 séries × 15 reps', advice: 'Finir l’entraînement par un pump sanguin intense.', done: false }
    ]
  },
  {
    id: 's-gladiator-challenge',
    category: 'sport',
    title: 'L’épreuve des gladiateurs : défi ultime',
    subtitle: 'Chaîne musculaire totale · Endurance de force',
    durationMinutes: 45,
    exerciseCount: 5,
    completed: false,
    exercises: [
      { id: 'gld-1', name: 'Soulevé de terre & Rowing combiné', setsReps: '4 séries × 8 reps', advice: 'Enchaîner la traction lombaire puis le tirage dorsal sans relâcher la gaine.', done: false },
      { id: 'gld-2', name: 'Fentes marchées avec haltères au-dessus de la tête', setsReps: '3 séries × 16 pas', advice: 'Gainage et équilibre suprêmes pour les épaules et les jambes.', done: false },
      { id: 'gld-3', name: 'Tractions strictes au menton prise supination', setsReps: '4 séries × 8 reps', advice: 'Monter jusqu’à ce que le menton dépasse franchement la barre.', done: false },
      { id: 'gld-4', name: 'Dips lestés ou assistés tempo 2-0-2', setsReps: '3 séries × 10 reps', advice: 'Vitesse constante sans rebond en bas de mouvement.', done: false },
      { id: 'gld-5', name: 'Planche en étoile mains et pieds écartés', setsReps: '3 séries × 45 sec', advice: 'Sollicitation extrême du caisson abdominal.', done: false }
    ]
  },

  // =========================================================================
  // FOOD : 30 SÉANCES ET RECETTES (TITRES FUN & SOUS-TITRES CATÉGORIELS STRUCTURÉS)
  // =========================================================================
  {
    id: 'f-breakfast',
    category: 'food',
    title: 'Le réveil des champions aux protéines',
    subtitle: 'Petit-déjeuner',
    durationMinutes: 15,
    exerciseCount: 4,
    completed: false,
    exercises: [
      { id: 'ef1', name: 'Protéines complètes (œufs fermiers, skyr ou tofu)', setsReps: '25 à 30g de protéines', advice: 'Déclenche la synthèse protéique matinale et coupe les fringales de 10h.', done: false },
      { id: 'ef2', name: 'Glucides lents (flocons d’avoine ou pain au levain)', setsReps: '50-60g pesés', advice: 'Diffusion d’énergie graduelle sans pic d’insuline ni coup de barre.', done: false },
      { id: 'ef3', name: 'Baies fraîches ou fruit entier (myrtilles, kiwi)', setsReps: '1 poignée ou 1 fruit', advice: 'Antioxydants puissants pour limiter le stress oxydatif cellulaire.', done: false },
      { id: 'ef4', name: 'Grand verre d’eau tiède citronnée ou thé vert', setsReps: '350 à 500 ml', advice: 'Réhydratation immédiate de l’organisme après 8h de jeûne nocturne.', done: false }
    ]
  },
  {
    id: 'f-lunch',
    category: 'food',
    title: 'L’assiette arc-en-ciel anti-coup de barre',
    subtitle: 'Déjeuner',
    durationMinutes: 20,
    exerciseCount: 4,
    completed: false,
    exercises: [
      { id: 'ef5', name: 'Moitié de l’assiette en végétaux de saison', setsReps: '200g minimum', advice: 'Fibres solubles et insolubles pour nourrir le microbiote et caler la faim.', done: false },
      { id: 'ef6', name: 'Source de protéines de qualité (poisson, volaille, légumineuses)', setsReps: '150 à 180g selon gabarit', advice: 'Maintien de la masse maigre et récupération après l’effort.', done: false },
      { id: 'ef7', name: 'Féculents complets (quinoa, riz basmati, patate douce)', setsReps: '120g pesés cuits', advice: 'Recharge en glycogène musculaire pour les séances de la journée.', done: false },
      { id: 'ef8', name: 'Bons lipides (1 c. à soupe d’huile d’olive vierge extra)', setsReps: '1 cuillère à soupe', advice: 'Acides gras mono-insaturés pour l’absorption des vitamines A, D, E, K.', done: false }
    ]
  },
  {
    id: 'f-snack',
    category: 'food',
    title: 'Le goûter turbo guépard',
    subtitle: 'Collation',
    durationMinutes: 10,
    exerciseCount: 4,
    completed: false,
    exercises: [
      { id: 'ef9', name: 'Oléagineux bruts (amandes, noix ou noisettes)', setsReps: '1 petite poignée (25g)', advice: 'Riche en magnésium naturel et acides gras anti-inflammatoires.', done: false },
      { id: 'ef10', name: 'Fruit frais de saison (pomme, banane ou poire)', setsReps: '1 unité', advice: 'Fructose naturel et pectine pour stabiliser l’énergie cérébrale.', done: false },
      { id: 'ef11', name: 'Collation protéinée légère (yaourt grec ou shaker végétal)', setsReps: '15g de protéines', advice: 'Évite les fringales du soir et préserve le capital musculaire.', done: false },
      { id: 'ef12', name: 'Hydratation active (infusion ou eau minérale)', setsReps: '400 ml', advice: 'Maintient la concentration et prévient les maux de tête de fin de journée.', done: false }
    ]
  },
  {
    id: 'f-dinner',
    category: 'food',
    title: 'Le dîner sommeil de marmotte',
    subtitle: 'Dîner',
    durationMinutes: 20,
    exerciseCount: 4,
    completed: false,
    exercises: [
      { id: 'ef13', name: 'Légumes digestes cuits (soupe, poêlée ou vapeur)', setsReps: '200 à 250g', advice: 'Facilite le transit nocturne sans surcharger le foie ni l’estomac.', done: false },
      { id: 'ef14', name: 'Protéines digestes (poisson blanc, œufs mollets ou tempeh)', setsReps: '130 à 150g', advice: 'Apport nocturne en acides aminés pour réparer les microlésions d’entraînement.', done: false },
      { id: 'ef15', name: 'Portion modérée de glucides complexes (lentilles, potimarron)', setsReps: '80 à 100g', advice: 'Favorise la production de mélatonine pour un sommeil profond et réparateur.', done: false },
      { id: 'ef16', name: 'Infusion camomille ou verveine (sans caféine)', setsReps: '1 tasse 45 min avant coucher', advice: 'Baisse la température corporelle centrale et apaise le système nerveux.', done: false }
    ]
  },
  {
    id: 'f-morning-lemon-potion',
    category: 'food',
    title: 'La potion magique hydratation citronnée',
    subtitle: 'Boisson & Hydratation',
    durationMinutes: 5,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'flm-1', name: 'Eau tiède filtrée avec jus d’un demi-citron frais', setsReps: '400 ml', advice: 'Stimule la sécrétion biliaire matinale sans agresser l’estomac.', done: false },
      { id: 'flm-2', name: 'Une pincée de sel marin non raffiné (électrolytes)', setsReps: '1 pincée', advice: 'Favorise l’absorption cellulaire de l’eau après le jeûne nocturne.', done: false },
      { id: 'flm-3', name: 'Rondelle de gingembre frais infusé', setsReps: '3 fines lamelles', advice: 'Action anti-inflammatoire puissante et réveil digestif en douceur.', done: false }
    ]
  },
  {
    id: 'f-rocket-porridge',
    category: 'food',
    title: 'Le porridge fusée avoine & baies sauvages',
    subtitle: 'Petit-déjeuner',
    durationMinutes: 10,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'frp-1', name: 'Flocons d’avoine cuits au lait d’amande sans sucre', setsReps: '60g d’avoine + 200ml de lait', advice: 'Riche en bêta-glucanes qui régulent le cholestérol et rassasient pour des heures.', done: false },
      { id: 'frp-2', name: '1 cuillère de purée de cacahuète 100% pure', setsReps: '1 cuillère à soupe (20g)', advice: 'Bons lipides mono-insaturés pour prolonger l’effet coupe-faim.', done: false },
      { id: 'frp-3', name: 'Grains de grenade ou myrtilles fraîches', setsReps: '50g de fruits', advice: 'Concentré de flavonoïdes protecteurs pour le système vasculaire.', done: false }
    ]
  },
  {
    id: 'f-warrior-avocado-toast',
    category: 'food',
    title: 'L’avocado toast des guerriers',
    subtitle: 'Petit-déjeuner',
    durationMinutes: 10,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'fwa-1', name: 'Tranches de pain au levain complet grillées', setsReps: '2 belles tranches', advice: 'Indice glycémique modéré grâce à la fermentation lente au levain.', done: false },
      { id: 'fwa-2', name: 'Demi-avocat écrasé avec sel et jus de citron', setsReps: '1/2 avocat mûr', advice: 'Acide oléique pour le cœur et potassium pour la tonicité musculaire.', done: false },
      { id: 'fwa-3', name: 'Deux œufs pochés ou mollets posés dessus', setsReps: '2 œufs bio', advice: '14g de protéines hautement assimilables avec jaune coulant riche en choline.', done: false }
    ]
  },
  {
    id: 'f-lightning-salad',
    category: 'food',
    title: 'La salade croquante détox éclair',
    subtitle: 'Déjeuner',
    durationMinutes: 15,
    exerciseCount: 4,
    completed: false,
    exercises: [
      { id: 'fls-1', name: 'Jeunes pousses d’épinards et roquette poivrée', setsReps: '150g de verdure', advice: 'Nitrates naturels favorisant la vasodilatation et l’oxygénation cellulaire.', done: false },
      { id: 'fls-2', name: 'Concombre croquant et radis émincés', setsReps: '100g de crudités', advice: 'Hydratation par l’alimentation et enzymes digestives.', done: false },
      { id: 'fls-3', name: 'Dés de poulet fermier mariné au romarin', setsReps: '140g grillé', advice: 'Protéines maigres parfaites pour la synthèse musculaire.', done: false },
      { id: 'fls-4', name: 'Vinaigrette maison huile de lin et cidre', setsReps: '2 cuillères à soupe', advice: 'Source végétale exceptionnelle d’oméga-3 ALA.', done: false }
    ]
  },
  {
    id: 'f-golden-salmon',
    category: 'food',
    title: 'Le saumon rôti & patate douce dorée',
    subtitle: 'Déjeuner',
    durationMinutes: 25,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'fgs-1', name: 'Pavé de saumon sauvage ou truite au four', setsReps: '150g cuit', advice: 'Riche en acides gras EPA et DHA indispensables au cerveau et aux articulations.', done: false },
      { id: 'fgs-2', name: 'Rondelles de patate douce rissolées au paprika', setsReps: '150g cuits', advice: 'Glucides complexes digestes et bêta-carotène antioxydant.', done: false },
      { id: 'fgs-3', name: 'Fleurons de brocoli vapeur arrosés de sésame', setsReps: '150g de brocoli', advice: 'Sulforaphane activateur des défenses cellulaires naturelles.', done: false }
    ]
  },
  {
    id: 'f-quinoa-power-bowl',
    category: 'food',
    title: 'Le bol énergie quinoa & poulet grillé',
    subtitle: 'Déjeuner',
    durationMinutes: 20,
    exerciseCount: 4,
    completed: false,
    exercises: [
      { id: 'fqp-1', name: 'Quinoa tricolore cuit dans un bouillon de légumes', setsReps: '130g pesé cuit', advice: 'Pseudo-céréale sans gluten apportant les 9 acides aminés essentiels.', done: false },
      { id: 'fqp-2', name: 'Lamelles de blanc de poulet grillé au thym', setsReps: '150g', advice: 'Apport protéique régulier pour la satiété post-prandiale.', done: false },
      { id: 'fqp-3', name: 'Dés de poivrons rouges et courgettes poêlées', setsReps: '120g de légumes', advice: 'Vitamine C naturelle pour booster l’immunité.', done: false },
      { id: 'fqp-4', name: 'Sauce tahini au citron et ail', setsReps: '1 cuillère à soupe', advice: 'Richesse en sésame, calcium végétal et goût onctueux.', done: false }
    ]
  },
  {
    id: 'f-hulk-green-shaker',
    category: 'food',
    title: 'Le shaker Hulk vert & spiruline',
    subtitle: 'Boisson & Hydratation',
    durationMinutes: 5,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'fhs-1', name: 'Eau de coco fraîche ou eau pure', setsReps: '300 ml', advice: 'Isotonique naturel riche en potassium et minéraux légers.', done: false },
      { id: 'fhs-2', name: 'Poudre de spiruline bio ou chlorelle', setsReps: '1 cuillère à café (5g)', advice: 'Fer hautement assimilable et chlorophylle détoxifiante.', done: false },
      { id: 'fhs-3', name: 'Jus de pomme verte fraîche et feuille de menthe', setsReps: '50 ml de jus pur', advice: 'Goût frais et revigorant sans sucre raffiné ajouté.', done: false }
    ]
  },
  {
    id: 'f-almond-choc-crunch',
    category: 'food',
    title: 'L’en-cas crunch amandes & chocolat noir',
    subtitle: 'Collation',
    durationMinutes: 5,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'fac-1', name: 'Amandes brutes non salées avec la peau', setsReps: '20 amandes (25g)', advice: 'La peau contient des polyphénols protecteurs du microbiote.', done: false },
      { id: 'fac-2', name: 'Carré de chocolat noir 85% cacao minimum', setsReps: '2 carrés (20g)', advice: 'Théobromine et magnésium pour calmer le système nerveux de fin d’après-midi.', done: false },
      { id: 'fac-3', name: 'Grand mug de rooibos vanillé sans théine', setsReps: '300 ml', advice: 'Boisson chaude hydratante et apaisante.', done: false }
    ]
  },
  {
    id: 'f-rustic-tofu-skillet',
    category: 'food',
    title: 'La poêlée rustique champignons & tofu fumé',
    subtitle: 'Dîner',
    durationMinutes: 20,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'frt-1', name: 'Dés de tofu fumé au bois de hêtre poêlés croustillants', setsReps: '150g de tofu', advice: 'Protéines végétales denses et arôme boisé très réconfortant.', done: false },
      { id: 'frt-2', name: 'Mélange de champignons de Paris et shiitakés persillés', setsReps: '150g de champignons', advice: 'Riches en bêta-glucanes qui stimulent les lymphocytes immunitaires.', done: false },
      { id: 'frt-3', name: 'Haricots verts extra-fins cuits vapeur al dente', setsReps: '150g de haricots', advice: 'Volume digestif léger parfait pour ne pas perturber la nuit.', done: false }
    ]
  },
  {
    id: 'f-cozy-soup-recovery',
    category: 'food',
    title: 'Le velouté douillet réparation express',
    subtitle: 'Dîner',
    durationMinutes: 20,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'fcs-1', name: 'Velouté onctueux courge butternut et carottes', setsReps: '300 ml de velouté', advice: 'Très doux pour la muqueuse intestinale et facile à assimiler.', done: false },
      { id: 'fcs-2', name: 'Graines de courge grillées et saupoudrées', setsReps: '1 cuillère à soupe (15g)', advice: 'Excellente source de zinc pour la régénération cellulaire nocturne.', done: false },
      { id: 'fcs-3', name: 'Filet de truite émietté ou deux œufs pochés', setsReps: '100g de poisson ou 2 œufs', advice: 'Légèreté protéique pour réparer sans alourdir la digestion.', done: false }
    ]
  },
  {
    id: 'f-herb-omelette',
    category: 'food',
    title: 'L’omelette baveuse aux fines herbes',
    subtitle: 'Petit-déjeuner',
    durationMinutes: 10,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'fho-1', name: 'Trois œufs battus avec ciboulette et persil frais', setsReps: '3 gros œufs fermiers', advice: '18g de protéines complètes, lutéine et zéaxanthine pour les yeux.', done: false },
      { id: 'fho-2', name: 'Cuisson douce à l’huile d’olive avec cœur baveux', setsReps: '1 cuillère à café d’huile', advice: 'Préserve les vitamines thermosensibles et donne une texture fondante.', done: false },
      { id: 'fho-3', name: 'Tranche de pain complet de seigle toastée', setsReps: '1 tranche (40g)', advice: 'Glucides à libération très lente pour éviter le pic glycémique.', done: false }
    ]
  },
  {
    id: 'f-salmon-fresh-wrap',
    category: 'food',
    title: 'Le wrap saumon fraîcheur & fromage frais',
    subtitle: 'Déjeuner',
    durationMinutes: 10,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'fsw-1', name: 'Galette de blé complet ou galette de sarrasin', setsReps: '1 grande galette', advice: 'Alternative pratique et légère pour un déjeuner nomade équilibré.', done: false },
      { id: 'fsw-2', name: 'Saumon fumé sauvage ou filet mariné', setsReps: '100g de saumon', advice: 'Apport immédiat en acides gras indispensables au bien-être mental.', done: false },
      { id: 'fsw-3', name: 'Fromage frais ail et fines herbes avec épinards crus', setsReps: '2 c. à soupe + poignée épinards', advice: 'Texture fraîche et onctueuse sans graisses trans.', done: false }
    ]
  },
  {
    id: 'f-banana-oat-pancakes',
    category: 'food',
    title: 'Les pancakes moelleux banane & avoine',
    subtitle: 'Petit-déjeuner',
    durationMinutes: 15,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'fbp-1', name: 'Pâte mixée : 1 banane mûre, 2 œufs et 50g d’avoine', setsReps: '3 beaux pancakes', advice: 'Aucun sucre raffiné, douceur 100% naturelle issue du fruit mûr.', done: false },
      { id: 'fbp-2', name: 'Cuisson dorée à la poêle antiadhésive', setsReps: '2 min par face', advice: 'Texture moelleuse et digeste même avant un entraînement.', done: false },
      { id: 'fbp-3', name: 'Garniture framboises fraîches et filet de miel', setsReps: '1 poignée de fruits', advice: 'Saveur gourmande et antioxydants revitalisants.', done: false }
    ]
  },
  {
    id: 'f-buddha-lentil-bowl',
    category: 'food',
    title: 'Le bol bouddha protéiné lentilles & avocat',
    subtitle: 'Déjeuner',
    durationMinutes: 15,
    exerciseCount: 4,
    completed: false,
    exercises: [
      { id: 'fbl-1', name: 'Lentilles vertes du Puy tièdes assaisonnées', setsReps: '150g cuites', advice: 'Excellente source de fer et de fibres régulatrices du transit.', done: false },
      { id: 'fbl-2', name: 'Quartiers d’avocat et carottes râpées croquantes', setsReps: '1/2 avocat + 1 carotte', advice: 'Synergie parfaite de vitamines liposolubles et de bons lipides.', done: false },
      { id: 'fbl-3', name: 'Dés de féta grecque AOP au lait de brebis', setsReps: '40g de féta', advice: 'Protéines lactées très digestes et goût salé naturel.', done: false },
      { id: 'fbl-4', name: 'Graines de tournesol et persil plat ciselé', setsReps: '1 cuillère à soupe', advice: 'Touche croquante riche en vitamine E.', done: false }
    ]
  },
  {
    id: 'f-zero-cortisol-infusion',
    category: 'food',
    title: 'L’infusion nocturne zéro cortisol',
    subtitle: 'Boisson & Hydratation',
    durationMinutes: 5,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'fzc-1', name: 'Infusion camomille matricaire et passiflore', setsReps: '1 sachet ou 2g de plantes', advice: 'Agit sur les récepteurs GABA cérébraux pour induire la somnolence.', done: false },
      { id: 'fzc-2', name: 'Eau chaude non bouillante (85°C)', setsReps: '250 ml', advice: 'Préserve les principes actifs volatils des fleurs médicinales.', done: false },
      { id: 'fzc-3', name: 'Une larme de lait végétal tiède pour le velouté', setsReps: '2 cuillères à soupe', advice: 'Rituel réconfortant signalant au cerveau l’heure du repos.', done: false }
    ]
  },
  {
    id: 'f-chia-mango-pudding',
    category: 'food',
    title: 'Le chia pudding coco & mangue fraîche',
    subtitle: 'Collation',
    durationMinutes: 5,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'fcm-1', name: 'Graines de chia gonflées dans du lait de coco léger', setsReps: '2 c. à soupe de graines (25g)', advice: 'Mucilages protecteurs de la muqueuse gastrique et fibres solubles.', done: false },
      { id: 'fcm-2', name: 'Purée ou dés de mangue bien mûre', setsReps: '80g de mangue', advice: 'Enzymes digestives (amylases) et douceur tropicale revigorante.', done: false },
      { id: 'fcm-3', name: 'Éclats de fèves de cacao crues', setsReps: '1 cuillère à café', advice: 'Effet croquant haut en magnésium sans sucre ajouté.', done: false }
    ]
  },
  {
    id: 'f-greek-yogurt-honey',
    category: 'food',
    title: 'Le yaourt grec gourmand miel & noix',
    subtitle: 'Collation',
    durationMinutes: 5,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'fgy-1', name: 'Vrai yaourt grec authentique 5% ou 10%', setsReps: '150g de yaourt', advice: 'Texture riche, probiotiques vivants et 10g de protéines rassasiantes.', done: false },
      { id: 'fgy-2', name: 'Cerneaux de noix de Grenoble concassés', setsReps: '4 noix entières', advice: 'Riches en acide alpha-linolénique pour la clarté mentale.', done: false },
      { id: 'fgy-3', name: 'Filet de miel de thym ou de lavande brut', setsReps: '1 cuillère à café', advice: 'Propriétés antibactériennes douces et plaisir gustatif pur.', done: false }
    ]
  },
  {
    id: 'f-miso-cleansing-soup',
    category: 'food',
    title: 'La soupe miso rénovatrice & algues wakame',
    subtitle: 'Dîner',
    durationMinutes: 10,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'fms-1', name: 'Pâte de miso blanc ou rouge non pasteurisée diluée', setsReps: '1 cuillère à soupe (20g)', advice: 'Aliment fermenté d’exception qui enrichit la flore intestinale.', done: false },
      { id: 'fms-2', name: 'Algues wakame réhydratées et dés de tofu soyeux', setsReps: '1 cuillère à café d’algues + 60g tofu', advice: 'Iode naturel pour la thyroïde et texture fondante ultra digeste.', done: false },
      { id: 'fms-3', name: 'Ciboule japonaise fraîchement émincée', setsReps: '1 tige', advice: 'Touche croquante et composés soufrés protecteurs.', done: false }
    ]
  },
  {
    id: 'f-steamed-cod-wild-rice',
    category: 'food',
    title: 'Le filet de cabillaud vapeur & riz sauvage',
    subtitle: 'Dîner',
    durationMinutes: 20,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'fsc-1', name: 'Dos de cabillaud frais cuit doucement à la vapeur', setsReps: '160g de poisson', advice: 'Protéine ultra-maigre, zéro surcharge lipidique avant la nuit.', done: false },
      { id: 'fsc-2', name: 'Riz sauvage et riz basmati complet mélangés', setsReps: '80g cuits', advice: 'Minéraux, magnésium et index glycémique très sage.', done: false },
      { id: 'fsc-3', name: 'Filet d’huile d’olive vierge et jus de citron vert', setsReps: '1 cuillère à café', advice: 'Rehausse les saveurs sans masquer la finesse de la chair.', done: false }
    ]
  },
  {
    id: 'f-peanut-protein-shake',
    category: 'food',
    title: 'Le smoothie protéiné beurre de cacahuète',
    subtitle: 'Post-Workout',
    durationMinutes: 5,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'fps-1', name: 'Poudre de whey ou protéine végétale vanille', setsReps: '25 à 30g de poudre', advice: 'Assimilation rapide pour stopper le catabolisme musculaire post-séance.', done: false },
      { id: 'fps-2', name: 'Demi-banane mûre et lait d’amande sans sucre', setsReps: '1/2 banane + 250ml lait', advice: 'Recharge rapide des réserves de glycogène appauvries par l’effort.', done: false },
      { id: 'fps-3', name: 'Une cuillère de purée de cacahuète crémeuse', setsReps: '1 cuillère à soupe (15g)', advice: 'Apporte de l’onctuosité et des minéraux essentiels.', done: false }
    ]
  },
  {
    id: 'f-ginger-turmeric-elixir',
    category: 'food',
    title: 'L’élixir matinal gingembre & curcuma',
    subtitle: 'Boisson & Hydratation',
    durationMinutes: 5,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'fgt-1', name: 'Racine de gingembre et curcuma frais râpés', setsReps: '1 cm de chaque racine', advice: 'Puissant duo antioxydant et anti-inflammatoire naturel.', done: false },
      { id: 'fgt-2', name: 'Infusion dans 300ml d’eau tiède avec poivre noir', setsReps: '1 pincée de poivre noir', advice: 'La pipérine multiplie par 20 l’absorption de la curcumine.', done: false },
      { id: 'fgt-3', name: 'Jus de citron pressé à la minute', setsReps: '1/2 citron', advice: 'Alcalinise l’organisme et réveille la digestion.', done: false }
    ]
  },
  {
    id: 'f-spicy-shakshuka',
    category: 'food',
    title: 'La shakshuka épicée aux œufs pochés',
    subtitle: 'Déjeuner',
    durationMinutes: 20,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'fss-1', name: 'Sauce mijotée tomates fraîches, poivrons et cumin', setsReps: '200g de sauce épaisse', advice: 'Riche en lycopène antioxydant renforcé par la cuisson douce à l’huile d’olive.', done: false },
      { id: 'fss-2', name: 'Deux œufs pochés directement dans la sauce mijotée', setsReps: '2 gros œufs', advice: 'Les blancs cuisent dans la sauce tandis que les jaunes restent fondants.', done: false },
      { id: 'fss-3', name: 'Coriandre fraîche et tranche de pain complet', setsReps: 'Quelques brins + 1 tranche', advice: 'Parfum oriental envoûtant et digestion tonique.', done: false }
    ]
  },
  {
    id: 'f-chickpea-feta-salad',
    category: 'food',
    title: 'La salade tiède pois chiches & féta',
    subtitle: 'Déjeuner',
    durationMinutes: 15,
    exerciseCount: 4,
    completed: false,
    exercises: [
      { id: 'fcf-1', name: 'Pois chiches égouttés et tiédis aux herbes de Provence', setsReps: '150g cuits', advice: 'Protéines végétales et fibres qui calment durablement l’appétit.', done: false },
      { id: 'fcf-2', name: 'Tomates cerises juteuses coupées en deux', setsReps: '80g de tomates', advice: 'Fraîcheur estivale et vitamine C.', done: false },
      { id: 'fcf-3', name: 'Féta émiettée et olives noires de Kalamata', setsReps: '30g de féta + 5 olives', advice: 'Bons acides gras méditerranéens protecteurs de l’endothélium.', done: false },
      { id: 'fcf-4', name: 'Jus de citron et huile d’olive première pression', setsReps: '1 cuillère à soupe', advice: 'Assaisonnement équilibré sans additifs.', done: false }
    ]
  },
  {
    id: 'f-lemon-turkey-roast',
    category: 'food',
    title: 'L’escalope de dinde marinée citron & herbes',
    subtitle: 'Dîner',
    durationMinutes: 20,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'flt-1', name: 'Escalope de dinde marinée au citron et origan', setsReps: '150g grillée', advice: 'Viande très riche en tryptophane, précurseur de la sérotonine et de la mélatonine.', done: false },
      { id: 'flt-2', name: 'Poêlée de courgettes jaunes et vertes à l’ail', setsReps: '200g de courgettes', advice: 'Facilement éliminée par l’organisme, teneur calorique minime.', done: false },
      { id: 'flt-3', name: 'Petite portion de patate douce écrasée à la fourchette', setsReps: '70g', advice: 'Léger soutien glucidique favorisant l’endormissement réparateur.', done: false }
    ]
  },
  {
    id: 'f-apple-almond-butter',
    category: 'food',
    title: 'La pomme croquante au beurre d’amande',
    subtitle: 'Pre-Workout',
    durationMinutes: 5,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'faa-1', name: 'Pomme bio tranchée en lamelles avec la peau', setsReps: '1 belle pomme', advice: 'Pectine et fructose naturel apportant une énergie continue sans pic brutal.', done: false },
      { id: 'faa-2', name: 'Beurre d’amande complet 100% pur', setsReps: '1 cuillère à soupe (15g)', advice: 'Ralentit la digestion des glucides et fournit du magnésium musculaire.', done: false },
      { id: 'faa-3', name: 'Pincée de cannelle de Ceylan saupoudrée', setsReps: '1 pincée', advice: 'Améliore la sensibilité cellulaire à l’insuline.', done: false }
    ]
  },
  {
    id: 'f-sunday-recovery-feast',
    category: 'food',
    title: 'Le festin récupérateur du dimanche soir',
    subtitle: 'Dîner',
    durationMinutes: 25,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'fsr-1', name: 'Poisson blanc noble rôti aux herbes et câpres', setsReps: '160g cuit au four', advice: 'Zéro lourdeur digestive, idéal pour préparer une excellente nuit avant le lundi.', done: false },
      { id: 'fsr-2', name: 'Méli-mélo de légumes racines rôtis (panais, carotte, patate douce)', setsReps: '150g cuits', advice: 'Fibres prébiotiques nourrissant les bonnes bactéries du côlon.', done: false },
      { id: 'fsr-3', name: 'Infusion relaxante mélisse et lavande', setsReps: '1 grande tasse 45 min avant coucher', advice: 'Prépare le terrain pour démarrer la semaine au sommet de sa forme.', done: false }
    ]
  },

  // =========================================================================
  // SKINCARE : 30 SÉANCES ET RITUELS (TITRES FUN & SOUS-TITRES CATÉGORIELS STRUCTURÉS)
  // =========================================================================
  {
    id: 'sk-morning',
    category: 'skincare',
    title: 'L’éveil éclat & bonne mine express',
    subtitle: 'Soin du matin',
    durationMinutes: 5,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'esk1', name: 'Nettoyant doux non moussant au pH 5.5', setsReps: '1 minute', advice: 'Préserve le film hydrolipidique naturel de la peau sans sensation de tiraillement.', done: false },
      { id: 'esk2', name: 'Sérum antioxydant (Vitamine C ou Niacinamide)', setsReps: '3 à 4 gouttes', advice: 'Bouclier anti-pollution, neutralise les radicaux libres et unifie le teint.', done: false },
      { id: 'esk3', name: 'Crème solaire minérale SPF 50+ quotidienne', setsReps: '2 longueurs de doigts', advice: 'Indispensable même par temps couvert pour prévenir le vieillissement prématuré.', done: false }
    ]
  },
  {
    id: 'sk-evening',
    category: 'skincare',
    title: 'Le grand décapage douceur du soir',
    subtitle: 'Soin du soir',
    durationMinutes: 6,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'esk4', name: 'Double nettoyage (huile végétale puis nettoyant doux)', setsReps: '2 minutes', advice: 'Dissout le sébum, les filtres UV et les particules de pollution sans frotter.', done: false },
      { id: 'esk5', name: 'Crème réparatrice aux céramides et acide hyaluronique', setsReps: '1 noisette', advice: 'Restaure la barrière cutanée pendant la phase de régénération nocturne.', done: false },
      { id: 'esk6', name: 'Baume à lèvres nourrissant au karité', setsReps: '1 application', advice: 'Évite les gerçures et protège durablement les muqueuses.', done: false }
    ]
  },
  {
    id: 'sk-postworkout',
    category: 'skincare',
    title: 'Sauvetage peau de pêche post-transpi',
    subtitle: 'Soin post-séance',
    durationMinutes: 4,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'esk7', name: 'Rinçage immédiat à l’eau claire tiède', setsReps: '1 minute post-séance', advice: 'Élimine le sel de la sueur avant qu’il ne bouche les pores ou n’irrite l’épiderme.', done: false },
      { id: 'esk8', name: 'Brume d’eau thermale apaisante', setsReps: '3 pulvérisations', advice: 'Calme les rougeurs et rééquilibre les minéraux à la surface de la peau.', done: false },
      { id: 'esk9', name: 'Gel hydratant léger à l’aloe vera ou centella', setsReps: '1 noisette', advice: 'Hydratation fraîche sans film gras pour laisser respirer la peau.', done: false }
    ]
  },
  {
    id: 'sk-invisible-spf',
    category: 'skincare',
    title: 'Le bouclier SPF invisible anti-coup de vieux',
    subtitle: 'Soin du matin',
    durationMinutes: 3,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'sis-1', name: 'Lotion tonique hydratante sans alcool', setsReps: '3 pressions sur le visage', advice: 'Prépare l’épiderme à recevoir les soins en restaurant l’hydratation de surface.', done: false },
      { id: 'sis-2', name: 'Fluide solaire SPF 50+ au fini mat sans trace blanche', setsReps: '2 longueurs de phalanges', advice: 'L’arme numéro 1 prouvée scientifiquement contre les rides et les taches brunes.', done: false },
      { id: 'sis-3', name: 'Application sur le cou et le dos des mains', setsReps: '1 noisette supplémentaire', advice: 'Deux zones souvent oubliées qui trahissent les premiers signes de l’âge.', done: false }
    ]
  },
  {
    id: 'sk-ceramides-bath',
    category: 'skincare',
    title: 'Bain de jouvence céramides & nuit douce',
    subtitle: 'Soin du soir',
    durationMinutes: 6,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'scb-1', name: 'Nettoyant gelée doux relipidant', setsReps: '1 minute de massage léger', advice: 'Nettoie sans décaper le film protecteur naturel.', done: false },
      { id: 'scb-2', name: 'Sérum réparateur riche en 3 céramides essentiels', setsReps: '4 gouttes sur peau humide', advice: 'Comble les micro-fissures intercellulaires de la couche cornée.', done: false },
      { id: 'scb-3', name: 'Crème riche scellante au beurre végétal', setsReps: '1 noisette généreuse', advice: 'Scelle l’hydratation pour empêcher la perte insensible en eau durant la nuit.', done: false }
    ]
  },
  {
    id: 'sk-magic-scrub',
    category: 'skincare',
    title: 'Le gommage magique zéro squame',
    subtitle: 'Soin hebdomadaire',
    durationMinutes: 8,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'sms-1', name: 'Exfoliant enzymatique doux sans grains abrasifs', setsReps: 'Poser 5 minutes sur peau propre', advice: 'Les enzymes de fruits dissolvent les cellules mortes sans micro-déchirures.', done: false },
      { id: 'sms-2', name: 'Rinçage à l’eau tiède par mouvements circulaires', setsReps: '2 minutes de rinçage méticuleux', advice: 'Révèle instantanément la lumière naturelle et la douceur du grain de peau.', done: false },
      { id: 'sms-3', name: 'Masque crème apaisant instantané', setsReps: 'Poser en couche fine 10 min', advice: 'Réconforte la peau exfoliée et prévient toute rougeur réactive.', done: false }
    ]
  },
  {
    id: 'sk-detox-clay-mask',
    category: 'skincare',
    title: 'Le masque détox spécial pores invisibles',
    subtitle: 'Soin hebdomadaire',
    durationMinutes: 12,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'sdc-1', name: 'Application d’argile rose ou blanche sur la zone T', setsReps: 'Couche opaque sans laisser sécher', advice: 'Absorbe l’excès de sébum et désincruste les pores sans assécher.', done: false },
      { id: 'sdc-2', name: 'Vaporisation d’eau thermale pendant la pose', setsReps: '1 pschitt dès que l’argile commence à figer', advice: 'L’argile ne doit jamais craqueler sur la peau pour rester bénéfique.', done: false },
      { id: 'sdc-3', name: 'Retrait doux à l’éponge konjac tiède', setsReps: '2 minutes de mouvements doux', advice: 'Pores resserrés et texture nette sans agression mécanique.', done: false }
    ]
  },
  {
    id: 'sk-vitc-booster',
    category: 'skincare',
    title: 'Le sérum miracle vitamine C coup de fouet',
    subtitle: 'Soin du matin',
    durationMinutes: 4,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'svc-1', name: 'Brume florale rééquilibrante à la fleur d’oranger', setsReps: '2 pulvérisations', advice: 'Humidifie la peau pour optimiser la pénétration des actifs hydrosolubles.', done: false },
      { id: 'svc-2', name: 'Sérum Vitamine C pure (acide ascorbique 15%)', setsReps: '4 gouttes réparties sur le visage', advice: 'Neutralise les radicaux libres générés par le soleil et les écrans.', done: false },
      { id: 'svc-3', name: 'Crème légère scellante SPF 30+', setsReps: '1 noisette', advice: 'Décuple la photoprotection de la crème solaire.', done: false }
    ]
  },
  {
    id: 'sk-eye-revival',
    category: 'skincare',
    title: 'Opération adieu cernes & regard frais',
    subtitle: 'Soin ciblé',
    durationMinutes: 4,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'ser-1', name: 'Soin contour des yeux à la caféine décongestionnante', setsReps: '1 grain de riz par œil', advice: 'Active la microcirculation sanguine pour atténuer la teinte bleutée des cernes.', done: false },
      { id: 'ser-2', name: 'Tapottements légers du bout de l’annulaire', setsReps: '30 secondes de l’intérieur vers l’extérieur', advice: 'L’annulaire exerce naturellement la pression la plus délicate sur cette peau fine.', done: false },
      { id: 'ser-3', name: 'Léger lissage de l’arcade sourcilière', setsReps: '10 passages doux', advice: 'Ouvre le regard et soulage la fatigue oculaire accumulée.', done: false }
    ]
  },
  {
    id: 'sk-dragon-lip-balm',
    category: 'skincare',
    title: 'Le baume sourire anti-lèvres de dragon',
    subtitle: 'Soin ciblé',
    durationMinutes: 2,
    exerciseCount: 2,
    completed: false,
    exercises: [
      { id: 'sdb-1', name: 'Exfoliation minute au sucre fin et miel', setsReps: '30 secondes de massage doux', advice: 'Élimine les petites peaux mortes sans faire saigner les lèvres.', done: false },
      { id: 'sdb-2', name: 'Couche généreuse de baume pur beurre de karité', setsReps: '1 couche épaisse', advice: 'Restaure l’élasticité et forme un film hydrophobe protecteur durable.', done: false }
    ]
  },
  {
    id: 'sk-hyaluronic-flood',
    category: 'skincare',
    title: 'L’inondation d’hydratation acide hyaluronique',
    subtitle: 'Soin du matin',
    durationMinutes: 4,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'sha-1', name: 'Brume d’eau minérale sur peau nue', setsReps: '3 pulvérisations généreuses', advice: 'L’acide hyaluronique a besoin d’eau externe pour ne pas puiser l’eau profonde.', done: false },
      { id: 'sha-2', name: 'Sérum multi-moléculaire d’acide hyaluronique', setsReps: '1 pipette entière', advice: 'Repulpe les ridules de déshydratation en surface et en profondeur.', done: false },
      { id: 'sha-3', name: 'Crème gel désaltérante non comédogène', setsReps: '1 noisette', advice: 'Verrouille les molécules d’eau au sein de l’épiderme toute la journée.', done: false }
    ]
  },
  {
    id: 'sk-ice-globe-morning',
    category: 'skincare',
    title: 'Le glaçon magique anti-gonflette matinale',
    subtitle: 'Soin du matin',
    durationMinutes: 5,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'sig-1', name: 'Passage d’un rouleau de jade ou globes frais sortis du réfrigérateur', setsReps: '2 minutes de mouvements ascendants', advice: 'La vasoconstriction par le froid draine la rétention d’eau du visage.', done: false },
      { id: 'sig-2', name: 'Massage des ganglions sous-mandibulaires et du cou', setsReps: '1 minute de lissage vers les clavicules', advice: 'Évacue la lymphe stagnante accumulée pendant la position allongée.', done: false },
      { id: 'sig-3', name: 'Application d’un fluide hydratant frais', setsReps: '1 noisette', advice: 'Sensation de légèreté et teint immédiatement sculpté.', done: false }
    ]
  },
  {
    id: 'sk-barrier-shield',
    category: 'skincare',
    title: 'Le bouclier barrière peau de bébé',
    subtitle: 'Soin du soir',
    durationMinutes: 5,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'sbs-1', name: 'Nettoyant baume huile-lait ultra-riche', setsReps: '1 minute de massage', advice: 'Nettoie sans aucune sensation de tiraillement même sur peau sèche.', done: false },
      { id: 'sbs-2', name: 'Lotion essence nourrissante à la centella asiatica', setsReps: '3 gouttes tapotées', advice: 'Herbe du tigre légendaire pour réparer les barrières cutanées abîmées.', done: false },
      { id: 'sbs-3', name: 'Crème barrière au panthénol (Vitamine B5)', setsReps: '1 noisette', advice: 'Accélère le renouvellement cellulaire et stoppe les tiraillements nocturnes.', done: false }
    ]
  },
  {
    id: 'sk-blemish-eraser',
    category: 'skincare',
    title: 'L’effaceur d’imperfections SOS bouton',
    subtitle: 'Soin ciblé',
    durationMinutes: 3,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'sbe-1', name: 'Nettoyage ciblé à l’acide salicylique (BHA 2%)', setsReps: '1 goutte sur la zone concernée', advice: 'Pénètre à l’intérieur du pore sébacé pour dissoudre le bouchon de sébum.', done: false },
      { id: 'sbe-2', name: 'Application locale de zinc pca ou tea tree dilué', setsReps: '1 touche au coton-tige', advice: 'Action antibactérienne ciblée sans irriter les zones saines voisines.', done: false },
      { id: 'sbe-3', name: 'Pose d’un patch hydrocolloïde invisible pour la nuit', setsReps: '1 patch collé sur le bouton', advice: 'Protège des bactéries extérieures et absorbe l’exsudat sans laisser de trace.', done: false }
    ]
  },
  {
    id: 'sk-night-precious-oil',
    category: 'skincare',
    title: 'L’huile précieuse réparation nocturne',
    subtitle: 'Soin du soir',
    durationMinutes: 5,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'sno-1', name: 'Brume florale d’hélichryse ou de camomille', setsReps: '2 pulvérisations', advice: 'Tonifie les petits capillaires et apaise les rougeurs diffuses.', done: false },
      { id: 'sno-2', name: 'Trois gouttes d’huile végétale de jojoba ou cynorhodon', setsReps: '3 gouttes chauffées entre les paumes', advice: 'Le jojoba mime fidèlement le sébum humain et régule la production cutanée.', done: false },
      { id: 'sno-3', name: 'Pressions délicates des paumes sur le visage', setsReps: '1 minute de pression sans frotter', advice: 'Fait pénétrer l’huile par capillarité sans tirer sur les tissus.', done: false }
    ]
  },
  {
    id: 'sk-cloud-cleanser',
    category: 'skincare',
    title: 'Le nettoyage moussant nuage sans sulfate',
    subtitle: 'Soin du matin',
    durationMinutes: 3,
    exerciseCount: 2,
    completed: false,
    exercises: [
      { id: 'scc-1', name: 'Mousse aérienne aux tensioactifs d’acides aminés', setsReps: '2 pompes de mousse sur visage mouillé', advice: 'Élimine les résidus de sébum nocturnes dans une infinie douceur.', done: false },
      { id: 'scc-2', name: 'Rinçage à l’eau fraîche et séchage par tapotement avec serviette propre', setsReps: '1 minute', advice: 'Ne jamais frotter le visage avec une serviette pour éviter d’altérer le collagène.', done: false }
    ]
  },
  {
    id: 'sk-niacinamide-flash',
    category: 'skincare',
    title: 'Le flash teint parfait niacinamide 10%',
    subtitle: 'Soin ciblé',
    durationMinutes: 4,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'snf-1', name: 'Application du sérum niacinamide 10% + zinc 1%', setsReps: '3 gouttes bien étalées', advice: 'Resserre visiblement les pores et atténue les taches pigmentaires.', done: false },
      { id: 'snf-2', name: 'Attente 1 minute d’absorption complète', setsReps: '60 secondes de pause', advice: 'Permet à l’actif de s’ancrer avant d’appliquer un corps gras.', done: false },
      { id: 'snf-3', name: 'Crème légère hydratante non grasse', setsReps: '1 noisette', advice: 'Fini mat et velouté garanti sans brillance en milieu de journée.', done: false }
    ]
  },
  {
    id: 'sk-gua-sha-sculpt',
    category: 'skincare',
    title: 'Le massage gua sha sculpteur de mâchoire',
    subtitle: 'Soin hebdomadaire',
    durationMinutes: 8,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'sgs-1', name: 'Application d’une huile de glisse (amande douce ou squalane)', setsReps: '4 gouttes sur visage et cou', advice: 'Impératif : le gua sha ne doit jamais tirer sur une peau sèche.', done: false },
      { id: 'sgs-2', name: 'Lissage de la mâchoire du menton vers les oreilles avec la pierre inclinée à 15°', setsReps: '8 passages par côté', advice: 'Sculpte l’ovale du visage et draine les tensions masticatrices.', done: false },
      { id: 'sgs-3', name: 'Remontée des pommettes vers les tempes', setsReps: '8 passages par pommette', advice: 'Effet liftant immédiat et oxygénation intense des tissus cutanés.', done: false }
    ]
  },
  {
    id: 'sk-mineral-mist',
    category: 'skincare',
    title: 'La brume apaisante source minérale',
    subtitle: 'Soin post-séance',
    durationMinutes: 3,
    exerciseCount: 2,
    completed: false,
    exercises: [
      { id: 'smm-1', name: 'Vaporisation large d’eau thermale riche en sélénium', setsReps: 'Nuage généreux à 20 cm du visage', advice: 'Le sélénium neutralise l’inflammation thermique provoquée par l’effort intense.', done: false },
      { id: 'smm-2', name: 'Tamponner délicatement l’excédent avec un mouchoir propre', setsReps: 'Après 45 secondes de pose', advice: 'Évite l’effet d’évaporation inverse qui pourrait déshydrater la peau.', done: false }
    ]
  },
  {
    id: 'sk-peeling-aha-bha',
    category: 'skincare',
    title: 'Le peeling doux AHA BHA peau neuve',
    subtitle: 'Soin hebdomadaire',
    durationMinutes: 10,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'spb-1', name: 'Application sur peau sèche d’une solution acide glycolique et lactique', setsReps: 'Couche fine homogène', advice: 'Attention : ne jamais appliquer sur peau humide pour éviter les picotements.', done: false },
      { id: 'spb-2', name: 'Temps de pause strict de 7 à 10 minutes maximum', setsReps: 'Chronométrer précisément', advice: 'Renouvelle les couches supérieures de l’épiderme en toute sécurité.', done: false },
      { id: 'spb-3', name: 'Rinçage abondant à l’eau froide et crème réparatrice apaisante', setsReps: '2 minutes de rinçage', advice: 'Neutralise l’action des acides et restaure instantanément le pH.', done: false }
    ]
  },
  {
    id: 'sk-neck-decollete',
    category: 'skincare',
    title: 'Le soin cou & décolleté anti-gravity',
    subtitle: 'Soin ciblé',
    durationMinutes: 4,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'snd-1', name: 'Lotion hydratante appliquée de bas en haut sur le cou', setsReps: '2 pressions ascendantes', advice: 'Toujours masser vers le haut pour lutter contre l’affaissement cutané.', done: false },
      { id: 'snd-2', name: 'Sérum tenseur aux peptides pro-collagène', setsReps: '3 gouttes chauffées', advice: 'Stimule la synthèse de fibroblastes dans cette zone particulièrement fine.', done: false },
      { id: 'snd-3', name: 'Crème riche fermeté appliquée jusqu’aux clavicules', setsReps: '1 belle noisette', advice: 'Nourrit en profondeur et prévient les plis horizontaux du cou.', done: false }
    ]
  },
  {
    id: 'sk-hydrogel-patches',
    category: 'skincare',
    title: 'Le patch hydrogel coup d’éclat 15 min',
    subtitle: 'Soin hebdomadaire',
    durationMinutes: 15,
    exerciseCount: 2,
    completed: false,
    exercises: [
      { id: 'shp-1', name: 'Pose des patchs hydrogel sous les yeux sortis du frigo', setsReps: 'Laisser agir 15 minutes au calme', advice: 'L’effet occlusif pousse les actifs hydratants et l’or colloïdal dans la peau.', done: false },
      { id: 'shp-2', name: 'Retrait et tapotement du sérum résiduel sans rincer', setsReps: '30 secondes de tapotement', advice: 'Effet défroissé bluffant avant une réunion ou un événement important.', done: false }
    ]
  },
  {
    id: 'sk-retinol-youth',
    category: 'skincare',
    title: 'La cure rétinol jeunesse éternelle',
    subtitle: 'Soin du soir',
    durationMinutes: 5,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'sry-1', name: 'Nettoyage parfait et séchage intégral de la peau', setsReps: '2 minutes de préparation', advice: 'Le rétinol doit être appliqué sur une peau parfaitement sèche pour éviter les irritations.', done: false },
      { id: 'sry-2', name: 'Application d’une quantité de la taille d’un petit pois de rétinol 0.3%', setsReps: '1 petite noisette pour tout le visage', advice: 'L’actif dermatologique roi pour booster le collagène et lisser le grain.', done: false },
      { id: 'sry-3', name: 'Technique du sandwich : recouvrir d’une crème hydratante riche', setsReps: '1 noisette après 5 minutes de pause', advice: 'Atténue le risque de desquamation tout en conservant 100% de l’efficacité.', done: false }
    ]
  },
  {
    id: 'sk-sleeping-pack',
    category: 'skincare',
    title: 'Le masque de nuit effet sommeil 10h',
    subtitle: 'Soin du soir',
    durationMinutes: 4,
    exerciseCount: 2,
    completed: false,
    exercises: [
      { id: 'ssp-1', name: 'Application généreuse du masque de nuit en gelée d’eau', setsReps: 'Couche enveloppante avant le coucher', advice: 'Forme une matrice respirante qui retient tous les sérums appliqués en dessous.', done: false },
      { id: 'ssp-2', name: 'Laisser infuser toute la nuit sans rincer', setsReps: '8 heures de pose nocturne', advice: 'Réveil avec une peau rebondie, lisse et lumineuse comme après 10h de sommeil.', done: false }
    ]
  },
  {
    id: 'sk-beard-care',
    category: 'skincare',
    title: 'Le soin barbe & peau zéro démangeaison',
    subtitle: 'Soin ciblé',
    durationMinutes: 4,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'sbc-1', name: 'Nettoyage de la barbe au savon surgras ou shampooing doux', setsReps: '1 minute sous la douche tiède', advice: 'Élimine les impuretés et peaux mortes piégées sous les poils.', done: false },
      { id: 'sbc-2', name: 'Quelques gouttes d’huile de cèdre et d’argan appliquées à la racine', setsReps: '4 gouttes massées sur la peau sous-jacente', advice: 'Adoucit le poil et supprime immédiatement les démangeaisons de pousse.', done: false },
      { id: 'sbc-3', name: 'Brossage avec brosse en poils de sanglier', setsReps: '1 minute de brossage doux', advice: 'Répartit le sébum naturel et aligne la toison.', done: false }
    ]
  },
  {
    id: 'sk-matte-fluid',
    category: 'skincare',
    title: 'L’émulsion matifiante zéro brillance',
    subtitle: 'Soin du matin',
    durationMinutes: 3,
    exerciseCount: 2,
    completed: false,
    exercises: [
      { id: 'smf-1', name: 'Application d’un gel régulateur à la silice naturelle', setsReps: '1 noisette sur le nez et le front', advice: 'Les microsphères de silice absorbent le sébum au fur et à mesure sans boucher le pore.', done: false },
      { id: 'smf-2', name: 'Tapoter les ailes du nez et le menton', setsReps: '30 secondes', advice: 'Teint mat et frais conservé jusqu’au soir même par forte chaleur.', done: false }
    ]
  },
  {
    id: 'sk-aftershave-calm',
    category: 'skincare',
    title: 'Le soin apaisant post-rasage zéro feu',
    subtitle: 'Soin post-séance',
    durationMinutes: 4,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'saf-1', name: 'Rinçage immédiat à l’eau très froide après le rasage', setsReps: '30 secondes de rinçage', advice: 'Ressert immédiatement les pores et stoppe les micro-saignements éventuels.', done: false },
      { id: 'saf-2', name: 'Baume sans alcool à l’allantoïne et bisabolol', setsReps: '1 noisette massée doucement', advice: 'Calme instantanément le feu du rasoir et répare la couche cornée agressée.', done: false },
      { id: 'saf-3', name: 'Goutte d’huile de calendula sur les zones sensibles', setsReps: '1 goutte', advice: 'Pouvoir cicatrisant réputé pour éviter les poils incarnés.', done: false }
    ]
  },
  {
    id: 'sk-botanical-elixir',
    category: 'skincare',
    title: 'L’élixir botanique éclat végétal',
    subtitle: 'Soin du soir',
    durationMinutes: 5,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'sbe-v1', name: 'Hydrolat de rose de Damas bio pur', setsReps: '3 vaporisations sur peau démaquillée', advice: 'Astringent doux et tenseur naturel qui illumine le teint fatigué.', done: false },
      { id: 'sbe-v2', name: 'Sérum aux extraits de thé vert et grenade', setsReps: '4 gouttes massées en douceur', advice: 'Richesse exceptionnelle en polyphénols antioxydants.', done: false },
      { id: 'sbe-v3', name: 'Crème fouettée à l’argan et immortelle', setsReps: '1 noisette fondante', advice: 'Nourrit intensément les peaux stressées par le vent et le froid.', done: false }
    ]
  },
  {
    id: 'sk-blue-light-shield',
    category: 'skincare',
    title: 'La brume fixatrice & anti-lumière bleue',
    subtitle: 'Soin du matin',
    durationMinutes: 2,
    exerciseCount: 2,
    completed: false,
    exercises: [
      { id: 'sbl-1', name: 'Brume protectrice aux caroténoïdes et ectoïne', setsReps: '3 pressions à 30 cm du visage', advice: 'Forme un filtre invisible contre le stress oxydatif des écrans d’ordinateur et smartphones.', done: false },
      { id: 'sbl-2', name: 'Laisser sécher à l’air libre sans toucher', setsReps: '30 secondes de séchage', advice: 'Fixe l’hydratation et donne un éclat sain pour toute la journée de travail.', done: false }
    ]
  },
  {
    id: 'sk-sunday-cocoon-spa',
    category: 'skincare',
    title: 'Le rituel spa cocooning du dimanche',
    subtitle: 'Soin hebdomadaire',
    durationMinutes: 20,
    exerciseCount: 4,
    completed: false,
    exercises: [
      { id: 'ssc-1', name: 'Bain de vapeur faciale aux fleurs de camomille', setsReps: '5 minutes au-dessus d’un bol d’eau chaude', advice: 'Ouvre les pores et détend tous les muscles crispés du visage.', done: false },
      { id: 'ssc-2', name: 'Gommage ultra-doux au miel et amande', setsReps: '2 minutes de massage circulaire', advice: 'Débarrasse délicatement la peau des toxines de la semaine écoulée.', done: false },
      { id: 'ssc-3', name: 'Masque en tissu imbibé de sérum infusé au collagène', setsReps: 'Pose relaxante de 12 minutes', advice: 'Gorge la peau en profondeur d’actifs réparateurs intenses.', done: false },
      { id: 'ssc-4', name: 'Massage des oreilles et du cuir chevelu', setsReps: '2 minutes de déconnexion totale', advice: 'Déclenche une onde de relaxation bienfaisante dans tout le corps.', done: false }
    ]
  },

  // =========================================================================
  // MIND : 30 SÉANCES ET RITUELS (TITRES FUN & SOUS-TITRES CATÉGORIELS STRUCTURÉS)
  // =========================================================================
  {
    id: 'm-cardiac-breath',
    category: 'mind',
    title: 'La bulle anti-panique 5-5',
    subtitle: 'Respiration & relaxation',
    durationMinutes: 5,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'em1', name: 'Inspiration nasale lente sur 5 secondes', setsReps: '6 respirations / min', advice: 'Gonfler l’abdomen sans hausser les épaules pour solliciter le nerf vague.', done: false },
      { id: 'em2', name: 'Expiration buccale douce sur 5 secondes', setsReps: 'Pendant 5 minutes', advice: 'Relâcher toutes les tensions de la mâchoire, de la nuque et du front.', done: false },
      { id: 'em3', name: 'Ancrage mental sur l’instant présent', setsReps: '1 minute de silence', advice: 'Observer le ralentissement immédiat du rythme cardiaque et l’apaisement émotionnel.', done: false }
    ]
  },
  {
    id: 'm-reading-rituals',
    category: 'mind',
    title: 'Immersion bouquin & zéro écran',
    subtitle: 'Rituel cognitif',
    durationMinutes: 20,
    exerciseCount: 2,
    completed: false,
    exercises: [
      { id: 'em4', name: 'Lecture concentrée sans écran (papier ou liseuse)', setsReps: '20 minutes continues', advice: 'Consacrer un moment calme à l’apprentissage régulier, loin des écrans et des notifications.', done: false },
      { id: 'em5', name: 'Annotation de 3 idées clés dans un carnet', setsReps: '1 bloc-notes dédié', advice: 'Cristalliser les connaissances pour pouvoir les mettre en pratique dans sa vie.', done: false }
    ]
  },
  {
    id: 'm-meditation',
    category: 'mind',
    title: 'Le grand scan corporel zen absolu',
    subtitle: 'Méditation guidée',
    durationMinutes: 10,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'em6', name: 'Posture assise stable et alignement vertébral', setsReps: '1 minute de mise en place', advice: 'Colonne érigée sans raideur, mains posées sur les cuisses, yeux mi-clos.', done: false },
      { id: 'em7', name: 'Scan corporel de la tête aux pieds', setsReps: '5 minutes d’attention guidée', advice: 'Observer chaque zone corporelle sans jugement, relâcher les micro-tensions.', done: false },
      { id: 'em8', name: 'Observation des pensées comme des nuages', setsReps: '4 minutes de présence', advice: 'Revenir calmement à la sensation de l’air qui entre et sort des narines.', done: false }
    ]
  },
  {
    id: 'm-work-disconnect',
    category: 'mind',
    title: 'Opération sas de décompression bureau',
    subtitle: 'Frontière pro-perso',
    durationMinutes: 15,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'em9', name: 'Rituel de fermeture de journée (Close-down ritual)', setsReps: '5 minutes de synthèse', advice: 'Noter les 3 priorités du lendemain, fermer tous les onglets professionnels et éteindre l’ordinateur.', done: false },
      { id: 'em10', name: 'Coupure des notifications professionnelles', setsReps: 'Mode Ne pas déranger', advice: 'Créer une frontière nette et non négociable pour préserver son espace mental.', done: false },
      { id: 'em11', name: 'Sas de décompression (marche ou étirement doux)', setsReps: '10 minutes', advice: 'Marquer physiquement la transition entre le statut actif et le temps pour soi.', done: false }
    ]
  },
  {
    id: 'm-stress-recovery',
    category: 'mind',
    title: 'Dormir comme un loir 4-7-8',
    subtitle: 'Sommeil & repos',
    durationMinutes: 15,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'em12', name: 'Exposition à la lumière naturelle matinale', setsReps: '10 à 15 minutes', advice: 'Régule l’horloge circadienne et cale le pic de cortisol aux bonnes heures de la journée.', done: false },
      { id: 'em13', name: 'Vidage de cerveau écrit (Brain dump) en soirée', setsReps: '1 page de carnet', advice: 'Écrire tout ce qui tourne en boucle dans la tête pour libérer la charge cognitive avant la nuit.', done: false },
      { id: 'em14', name: 'Respiration 4-7-8 avant l’endormissement', setsReps: '4 cycles complets', advice: 'Inspire sur 4s, retiens sur 7s, expire sur 8s : active puissamment le sommeil réparateur.', done: false }
    ]
  },
  {
    id: 'm-thought-sorting',
    category: 'mind',
    title: 'Le tri sélectif des pensées encombrantes',
    subtitle: 'Gestion du stress',
    durationMinutes: 10,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'mts-1', name: 'Écriture brute de toutes les inquiétudes du moment', setsReps: '5 minutes de jet sans filtre', advice: 'Sortir les ruminations de la tête pour les voir en face sur le papier.', done: false },
      { id: 'mts-2', name: 'Séparation en deux colonnes : « Contrôlable » vs « Hors de mon contrôle »', setsReps: '3 minutes de tri lucide', advice: 'Le principe fondamental du stoïcisme pour cesser de gaspiller son énergie psychique.', done: false },
      { id: 'mts-3', name: 'Déchirage symbolique ou mise de côté de la colonne hors contrôle', setsReps: '1 geste libérateur', advice: 'Décharge émotionnelle immédiate.', done: false }
    ]
  },
  {
    id: 'm-digital-fasting',
    category: 'mind',
    title: 'Le bain de silence & déconnexion totale',
    subtitle: 'Frontière pro-perso',
    durationMinutes: 30,
    exerciseCount: 2,
    completed: false,
    exercises: [
      { id: 'mdf-1', name: 'Mise de tous les téléphones et tablettes dans un tiroir fermé', setsReps: '30 minutes sans appareil', advice: 'Rompre la dopamine artificielle des likes et des notifications d’alerte.', done: false },
      { id: 'mdf-2', name: 'Activité manuelle calme (dessin, thé, jardinage ou contemplation)', setsReps: '30 minutes d’attention continue', advice: 'Permet au cerveau de basculer en mode par défaut et restaure la créativité.', done: false }
    ]
  },
  {
    id: 'm-nature-walk',
    category: 'mind',
    title: 'Balade méditative en pleine nature',
    subtitle: 'Méditation guidée',
    durationMinutes: 25,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'mnw-1', name: 'Marche sans écouteurs dans un parc ou en forêt', setsReps: '15 minutes à allure modérée', advice: 'Les phytoncides émis par les arbres réduisent le cortisol salivaire de façon mesurable.', done: false },
      { id: 'mnw-2', name: 'Éveil des 5 sens : écouter 3 bruits, voir 3 détails, toucher une écorce', setsReps: '5 minutes d’observation pure', advice: 'Ancrage puissant dans la réalité sensorielle.', done: false },
      { id: 'mnw-3', name: 'Trois grandes inspirations profondes d’air frais', setsReps: '3 cycles complets', advice: 'Recharge d’énergie vitale.', done: false }
    ]
  },
  {
    id: 'm-stoic-cold-shower',
    category: 'mind',
    title: 'La douche froide des guerriers stoïques',
    subtitle: 'Rituel cognitif',
    durationMinutes: 5,
    exerciseCount: 2,
    completed: false,
    exercises: [
      { id: 'msc-1', name: 'Douche tiède habituelle suivie d’une bascule vers l’eau froide', setsReps: '60 secondes d’eau fraîche', advice: 'Contrôler la panique respiratoire réflexe par de longues expirations calmes.', done: false },
      { id: 'msc-2', name: 'Affirmation mentale de maîtrise de soi', setsReps: '1 minute de recentrage', advice: 'Prouver à son esprit qu’on peut dompter l’inconfort choisi avec sang-froid.', done: false }
    ]
  },
  {
    id: 'm-express-gratitude',
    category: 'mind',
    title: 'Gratitude express & bonne humeur immédiate',
    subtitle: 'Récupération mentale',
    durationMinutes: 5,
    exerciseCount: 2,
    completed: false,
    exercises: [
      { id: 'meg-1', name: 'Écriture de 3 choses précises pour lesquelles être reconnaissant aujourd’hui', setsReps: '3 pépites notées', advice: 'Privilégier les détails microscopiques : un sourire, un rayon de soleil, un café chaud.', done: false },
      { id: 'meg-2', name: 'Ressentir physiquement la chaleur dans la poitrine liée à chaque souvenir', setsReps: '2 minutes de visualisation', advice: 'Inonde le cerveau d’ocytocine et de dopamine naturelle.', done: false }
    ]
  },
  {
    id: 'm-pomodoro-ultra-focus',
    category: 'mind',
    title: 'La méthode Pomodoro ultra-focus',
    subtitle: 'Focus & clarté',
    durationMinutes: 30,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'mpu-1', name: 'Définition d’une seule et unique tâche prioritaire sans dispersion', setsReps: '1 objectif limpide', advice: 'Si ce n’est pas écrit, ce n’est pas défini. Bannir le multitâche.', done: false },
      { id: 'mpu-2', name: '25 minutes d’immersion totale en mode chrono sans lever les yeux', setsReps: '25 minutes chrono', advice: 'Entrer dans l’état de Flow où l’efficacité est multipliée par 4.', done: false },
      { id: 'mpu-3', name: '5 minutes de pause complète loin de tout écran', setsReps: '5 minutes de repos', advice: 'Boire un verre d’eau, s’étirer et laisser décanter.', done: false }
    ]
  },
  {
    id: 'm-box-breathing',
    category: 'mind',
    title: 'Respiration carrée box breathing commando',
    subtitle: 'Respiration & relaxation',
    durationMinutes: 6,
    exerciseCount: 4,
    completed: false,
    exercises: [
      { id: 'mbb-1', name: 'Inspiration nasale sur 4 secondes', setsReps: 'Phase 1 du carré', advice: 'Remplir les poumons de bas en haut avec fluidité.', done: false },
      { id: 'mbb-2', name: 'Rétention poumons pleins sur 4 secondes', setsReps: 'Phase 2 du carré', advice: 'Garder la gorge détendue sans bloquer comme une vanne fermée.', done: false },
      { id: 'mbb-3', name: 'Expiration buccale sur 4 secondes', setsReps: 'Phase 3 du carré', advice: 'Vider calmement tout l’air accumulé.', done: false },
      { id: 'mbb-4', name: 'Rétention poumons vides sur 4 secondes', setsReps: 'Phase 4 du carré (répéter 8 fois)', advice: 'Technique éprouvée de contrôle respiratoire pour rester parfaitement lucide sous pression.', done: false }
    ]
  },
  {
    id: 'm-victory-visualization',
    category: 'mind',
    title: 'La visualisation du succès avant l’arène',
    subtitle: 'Focus & clarté',
    durationMinutes: 8,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'mvv-1', name: 'Fermer les yeux et visualiser la journée ou l’épreuve à venir', setsReps: '2 minutes de projection mentale', advice: 'Dérouler le film mental avec précision, confiance et sérénité.', done: false },
      { id: 'mvv-2', name: 'Se voir surmonter un obstacle imprévu avec calme et maîtrise', setsReps: '3 minutes de simulation positive', advice: 'Prépare le cerveau à réagir sans panique face aux aléas réels.', done: false },
      { id: 'mvv-3', name: 'Ressentir la satisfaction de la mission accomplie le soir venu', setsReps: '3 minutes de ressenti émotionnel', advice: 'Programme le système réticulé activateur vers la réussite.', done: false }
    ]
  },
  {
    id: 'm-brain-dump-writing',
    category: 'mind',
    title: 'L’écriture thérapeutique vide-cerveau',
    subtitle: 'Gestion du stress',
    durationMinutes: 10,
    exerciseCount: 2,
    completed: false,
    exercises: [
      { id: 'mbd-1', name: 'Écrire sans s’arrêter sur 2 pages de carnet tout ce qui vient', setsReps: '8 minutes d’écriture continue', advice: 'Ne pas corriger la syntaxe, ne pas relire : autoriser l’inconscient à s’exprimer.', done: false },
      { id: 'mbd-2', name: 'Fermer le carnet et poser les mains dessus avec soulagement', setsReps: '2 minutes de silence apaisé', advice: 'Constater que le poids mental s’est transféré sur le papier.', done: false }
    ]
  },
  {
    id: 'm-mindful-coffee-break',
    category: 'mind',
    title: 'Pause café en pleine conscience zéro écran',
    subtitle: 'Méditation guidée',
    durationMinutes: 10,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'mmc-1', name: 'Observer les volutes de vapeur et la couleur de la boisson', setsReps: '1 minute de contemplation', advice: 'Sentir la chaleur de la tasse entre les paumes.', done: false },
      { id: 'mmc-2', name: 'Humer les arômes de torréfaction ou d’herbes séchées', setsReps: '1 minute d’olfaction guidée', advice: 'L’odorat est le sens le plus directement relié au système limbique émotionnel.', done: false },
      { id: 'mmc-3', name: 'Déguster chaque gorgée lentement en savourant les nuances', setsReps: '8 minutes de dégustation pure', advice: 'Transformer une habitude machinale en un sanctuaire de paix.', done: false }
    ]
  },
  {
    id: 'm-post-meeting-reset',
    category: 'mind',
    title: 'Le reset mental post-grosse réunion',
    subtitle: 'Frontière pro-perso',
    durationMinutes: 5,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'mpm-1', name: 'Se lever de sa chaise et secouer vigoureusement les bras et les jambes', setsReps: '1 minute de secousses dynamiques', advice: 'Évacue la décharge d’adrénaline et la tension statique emmagasinée.', done: false },
      { id: 'mpm-2', name: 'Laver ses mains et son visage à l’eau fraîche au robinet', setsReps: '1 minute', advice: 'Stimule le réflexe d’immersion mammifère qui ralentit instantanément le cœur.', done: false },
      { id: 'mpm-3', name: 'Prendre 3 expirations lentes en soufflant bruyamment par la bouche', setsReps: '3 grands souffles', advice: 'Signal clair de remise à zéro mentale avant la tâche suivante.', done: false }
    ]
  },
  {
    id: 'm-stoic-dichotomy',
    category: 'mind',
    title: 'L’alignement stoïque : ce qui dépend de toi',
    subtitle: 'Rituel cognitif',
    durationMinutes: 8,
    exerciseCount: 2,
    completed: false,
    exercises: [
      { id: 'msd-1', name: 'Réciter intérieurement la règle d’Épictète face aux contrariétés', setsReps: '3 minutes de méditation philosophique', advice: '« Ne demande pas que les événements arrivent comme tu le veux, mais veuille qu’ils arrivent comme ils arrivent. »', done: false },
      { id: 'msd-2', name: 'Focaliser 100% de son énergie sur sa propre attitude et ses actes', setsReps: '5 minutes de recentrage', advice: 'Développe une forteresse intérieure inébranlable face aux critiques.', done: false }
    ]
  },
  {
    id: 'm-physiological-sigh',
    category: 'mind',
    title: 'Le soupir physiologique anti-stress flash',
    subtitle: 'Respiration & relaxation',
    durationMinutes: 3,
    exerciseCount: 2,
    completed: false,
    exercises: [
      { id: 'mps-1', name: 'Double inspiration nasale rapide suivie d’une longue expiration buccale', setsReps: '5 répétitions successives', advice: 'Technique du soupir physiologique : rouvre les alvéoles pulmonaires affaissées et décharge le CO2.', done: false },
      { id: 'mps-2', name: 'Observer la chute immédiate de la tension artérielle et des épaules', setsReps: '1 minute d’écoute corporelle', advice: 'Le coupe-circuit neurobiologique le plus rapide contre l’anxiété aiguë.', done: false }
    ]
  },
  {
    id: 'm-power-nap',
    category: 'mind',
    title: 'La sieste éclair turbo 20 minutes',
    subtitle: 'Sommeil & repos',
    durationMinutes: 20,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'mpn-1', name: 'S’allonger dans l’obscurité avec un masque pour les yeux et un réveil à 20 min', setsReps: 'Mise en condition immédiate', advice: 'Ne jamais dépasser 25 minutes pour ne pas basculer en sommeil profond à inertie.', done: false },
      { id: 'mpn-2', name: 'Relâcher la langue du palais et laisser défiler les pensées', setsReps: '15 minutes de semi-sommeil', advice: 'Nettoie les récepteurs à adénosine cérébraux et restaure la vigilance.', done: false },
      { id: 'mpn-3', name: 'Réveil tonique avec grand étirement des bras vers le ciel', setsReps: '2 minutes de redémarrage', advice: 'Énergie renouvelée pour toute la seconde moitié de journée.', done: false }
    ]
  },
  {
    id: 'm-rhythmic-stride',
    category: 'mind',
    title: 'La marche rythmée tête haute & horizon',
    subtitle: 'Récupération mentale',
    durationMinutes: 15,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'mrs-1', name: 'Marcher à pas alertes en fixant l’horizon lointain', setsReps: '10 minutes continues', advice: 'Le regard panoramique désactive le circuit d’alerte de l’amygdale cérébrale.', done: false },
      { id: 'mrs-2', name: 'Synchroniser 4 pas sur l’inspiration, 4 pas sur l’expiration', setsReps: '5 minutes de marche rythmée', advice: 'Crée un état méditatif en mouvement très régulateur.', done: false },
      { id: 'mrs-3', name: 'Sensation d’espace et de liberté retrouvée', setsReps: 'Ancrage final', advice: 'Idéal après plusieurs heures statiques devant un bureau.', done: false }
    ]
  },
  {
    id: 'm-no-phone-morning',
    category: 'mind',
    title: 'Rituel de réveil sans téléphone',
    subtitle: 'Rituel cognitif',
    durationMinutes: 15,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'mnp-1', name: 'Laisser le smartphone éteint ou dans une autre pièce les 30 premières minutes', setsReps: '30 minutes d’immunité mentale', advice: 'Ne pas laisser les urgences des autres coloniser votre esprit dès le réveil.', done: false },
      { id: 'mnp-2', name: 'Boire un grand verre d’eau en regardant la lumière du jour par la fenêtre', setsReps: '3 minutes de contemplation matinale', advice: 'Synchronisation optimale de votre horloge biologique.', done: false },
      { id: 'mnp-3', name: 'Choisir sa priorité maîtresse de la journée avant de regarder ses messages', setsReps: '1 choix délibéré', advice: 'Prendre l’initiative plutôt que de subir passivement la journée.', done: false }
    ]
  },
  {
    id: 'm-self-compassion',
    category: 'mind',
    title: 'Méditation d’autocompassion & lâcher-prise',
    subtitle: 'Méditation guidée',
    durationMinutes: 10,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'msc-m1', name: 'Poser la main droite sur le cœur et respirer doucement', setsReps: '2 minutes de connexion', advice: 'Le contact physique libère de la chaleur et adoucit la voix critique intérieure.', done: false },
      { id: 'msc-m2', name: 'Se parler à soi-même comme on parlerait à son meilleur ami dans l’épreuve', setsReps: '5 minutes d’écoute bienveillante', advice: 'Remplacer l’autocritique destructrice par un soutien encourageant et lucide.', done: false },
      { id: 'msc-m3', name: 'Reconnaître que l’imperfection fait partie intégrante de l’expérience humaine', setsReps: '3 minutes de paix', advice: 'Soulage le perfectionnisme toxique.', done: false }
    ]
  },
  {
    id: 'm-inner-citadel',
    category: 'mind',
    title: 'La citadelle intérieure face aux critiques',
    subtitle: 'Gestion du stress',
    durationMinutes: 8,
    exerciseCount: 2,
    completed: false,
    exercises: [
      { id: 'mic-1', name: 'Visualiser une forteresse imprenable au centre de sa poitrine', setsReps: '4 minutes de visualisation protectrice', advice: 'Les mots et jugements d’autrui ricochent sur les remparts sans pénétrer.', done: false },
      { id: 'mic-2', name: 'Distinguer la critique constructive de l’agressivité gratuite', setsReps: '4 minutes de discernement', advice: 'Garder l’enseignement utile, renvoyer le reste à l’expéditeur avec compassion.', done: false }
    ]
  },
  {
    id: 'm-weekly-wins-review',
    category: 'mind',
    title: 'Le bilan hebdo des petites victoires',
    subtitle: 'Récupération mentale',
    durationMinutes: 10,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'mww-1', name: 'Relecture des séances de sport et repas équilibrés validés cette semaine', setsReps: '3 minutes de fierté légitime', advice: 'Prendre conscience du chemin parcouru plutôt que de la distance restante.', done: false },
      { id: 'mww-2', name: 'Noter 3 progrès concrets, même minimes (énergie, moral, régularité)', setsReps: '3 pépites écrites', advice: 'Célèbre l’effort consenti pour ancrer durablement la motivation intrinsèque.', done: false },
      { id: 'mww-3', name: 'Définir une intention bienveillante pour la semaine qui commence', setsReps: '1 intention directrice', advice: 'Clarté et cap serein pour les jours à venir.', done: false }
    ]
  },
  {
    id: 'm-breath-of-fire',
    category: 'mind',
    title: 'La respiration du feu boost d’énergie',
    subtitle: 'Respiration & relaxation',
    durationMinutes: 4,
    exerciseCount: 2,
    completed: false,
    exercises: [
      { id: 'mbf-1', name: 'Pompages abdominaux rythmés par le nez (Kapalabhati)', setsReps: '3 cycles de 30 expulsions', advice: 'Expiration active par contraction brusque du ventre, inspiration passive.', done: false },
      { id: 'mbf-2', name: 'Rétention poumons pleins et grand sourire intérieur', setsReps: '30 secondes de suspension', advice: 'Oxygénation fulgurante du cortex cérébral sans caféine.', done: false }
    ]
  },
  {
    id: 'm-somatic-neck-release',
    category: 'mind',
    title: 'Étirements somatiques & déblocage nuque',
    subtitle: 'Récupération mentale',
    durationMinutes: 8,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'msn-1', name: 'Inclinaisons douces de la tête vers l’épaule avec respiration continue', setsReps: '1 minute par côté', advice: 'Laisser le poids naturel du bras étirer le trapèze sans tirer violemment.', done: false },
      { id: 'msn-2', name: 'Cercles lents de menton sur la poitrine', setsReps: '5 rotations très lentes', advice: 'Dénoue les contractures cervicales liées à l’attention soutenue.', done: false },
      { id: 'msn-3', name: 'Haussement et relâchement brusque des épaules en soufflant', setsReps: '5 fois de suite', advice: 'Sensation physique immédiate de légèreté retrouvée.', done: false }
    ]
  },
  {
    id: 'm-sanctuary-bedroom',
    category: 'mind',
    title: 'La chambre sanctuaire zéro ondes',
    subtitle: 'Sommeil & repos',
    durationMinutes: 10,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'msb-1', name: 'Aération complète de la chambre 10 minutes avant le coucher', setsReps: 'Fenêtre grande ouverte', advice: 'Renouvelle l’air en oxygène et baisse la température de la pièce à 18-19°C.', done: false },
      { id: 'msb-2', name: 'Suppression de toutes les petites diodes lumineuses (voyants TV, chargeurs)', setsReps: 'Obscurité totale', advice: 'La moindre lumière résiduelle bloque la sécrétion optimale de mélatonine par la glande pinéale.', done: false },
      { id: 'msb-3', name: 'Spray d’eau florale de lavande sur l’oreiller', setsReps: '2 vaporisations légères', advice: 'L’arôme de linalol possède une efficacité anxiolytique cliniquement démontrée.', done: false }
    ]
  },
  {
    id: 'm-mental-forgiveness',
    category: 'mind',
    title: 'Le grand pardon & dépoussiérage mental',
    subtitle: 'Gestion du stress',
    durationMinutes: 10,
    exerciseCount: 2,
    completed: false,
    exercises: [
      { id: 'mmf-1', name: 'Pardonner mentalement à une personne ou à soi-même pour un impair passé', setsReps: '5 minutes de méditation sincère', advice: 'Le ressentiment est un poison qu’on boit en espérant que l’autre en meure.', done: false },
      { id: 'mmf-2', name: 'Visualiser la rupture du lien de rancœur et le retour à sa propre paix', setsReps: '5 minutes de libération', advice: 'Se libérer de la charge émotionnelle inutile pour avancer avec légèreté.', done: false }
    ]
  },
  {
    id: 'm-deep-music-listening',
    category: 'mind',
    title: 'L’écoute musicale profonde les yeux fermés',
    subtitle: 'Méditation guidée',
    durationMinutes: 15,
    exerciseCount: 2,
    completed: false,
    exercises: [
      { id: 'mdm-1', name: 'Casque sur les oreilles, écoute d’un morceau de musique classique ou ambiante', setsReps: '15 minutes allongé sans rien faire d’autre', advice: 'Isoler un instrument spécifique (violoncelle, piano) et suivre sa trajectoire.', done: false },
      { id: 'mdm-2', name: 'Se laisser porter par l’harmonie des fréquences sonores', setsReps: 'Immersion totale', advice: 'Stimule les ondes cérébrales Alpha propices à la relaxation et à l’intuition.', done: false }
    ]
  },
  {
    id: 'm-peaceful-week-closing',
    category: 'mind',
    title: 'La clôture parfaite de semaine en paix',
    subtitle: 'Frontière pro-perso',
    durationMinutes: 15,
    exerciseCount: 3,
    completed: false,
    exercises: [
      { id: 'mpw-1', name: 'Ranger soigneusement son espace de travail le vendredi en fin d’après-midi', setsReps: '5 minutes de rangement', advice: 'Un bureau ordonné offre la permission psychologique de ne plus y penser.', done: false },
      { id: 'mpw-2', name: 'Écrire la première tâche à accomplir lundi matin sur un post-it', setsReps: '1 post-it prêt', advice: 'Désamorce l’anxiété du dimanche soir (dimanche blues) avant qu’elle ne naisse.', done: false },
      { id: 'mpw-3', name: 'Célébrer l’entrée officielle dans le week-end par un sourire à la vie', setsReps: 'Transition festive et sereine', advice: 'Place au repos, à la famille, au sport et aux plaisirs simples.', done: false }
    ]
  }
 ];

module.exports = allProgramSessions;
