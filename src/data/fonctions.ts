export const FONCTIONS = [
  { id: 'acquerir', label: 'Acquérir', chaine: 'information',
    definition: "Prélever une grandeur physique et la convertir en signal.",
    composants: ['codeur', 'jauge de contrainte', 'fin de course', 'thermocouple'] },
  { id: 'traiter', label: 'Traiter', chaine: 'information',
    definition: "Traiter l'information et élaborer les ordres de commande.",
    composants: ['microcontrôleur', 'automate', 'FPGA', 'comparateur'] },
  { id: 'communiquer', label: 'Communiquer', chaine: 'information',
    definition: "Restituer et transmettre l'information.",
    composants: ['IHM', 'écran', 'liaison série', 'bus de terrain'] },
  { id: 'alimenter', label: 'Alimenter', chaine: 'puissance',
    definition: "Fournir l'énergie nécessaire au système.",
    composants: ['réseau', 'batterie', 'alimentation', 'centrale hydraulique'] },
  { id: 'distribuer', label: 'Distribuer', chaine: 'puissance',
    definition: "Moduler l'énergie transmise à l'actionneur sur ordre.",
    composants: ['hacheur', 'onduleur', 'variateur', 'distributeur', 'pont en H'] },
  { id: 'convertir', label: 'Convertir', chaine: 'puissance',
    definition: "Convertir l'énergie en énergie utile au mouvement.",
    composants: ['moteur à courant continu', 'moteur pas-à-pas', 'vérin'] },
  { id: 'transmettre', label: 'Transmettre', chaine: 'puissance',
    definition: "Adapter et transmettre l'énergie mécanique à l'effecteur.",
    composants: ['réducteur', 'engrenage', 'poulie-courroie', 'système vis-écrou'] },
  { id: 'agir', label: 'Agir', chaine: 'puissance',
    definition: "Agir sur la matière d'œuvre (organe terminal).",
    composants: ['pince', 'roue', 'broche', 'effecteur'] },
] as const;

export type FonctionId = (typeof FONCTIONS)[number]['id'];

export const FONCTION_IDS = FONCTIONS.map((f) => f.id) as [FonctionId, ...FonctionId[]];