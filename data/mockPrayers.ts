// Types pour les données de prières
export interface Prayer {
  id: string;
  name: string;
  age: number;
  deathDate: Date;
  location: string;
  personalMessage: string;
  createdAt: Date;
  prayerCount: number;
}

// Données mockées pour les prières des défunts
export const mockPrayers: Prayer[] = [
  {
    id: '1',
    name: 'Ahmed Ben Ali',
    age: 68,
    deathDate: new Date('2023-03-15'),
    location: 'Casablanca, Maroc',
    personalMessage:
      "Un père aimant qui nous a enseigné la patience et la foi. Qu'Allah lui accorde Sa miséricorde.",
    createdAt: new Date('2023-03-16'),
    prayerCount: 47,
  },
  {
    id: '2',
    name: 'Fatima Zahra',
    age: 45,
    deathDate: new Date('2023-07-22'),
    location: 'Tunis, Tunisie',
    personalMessage:
      'Ma chère tante qui illuminait chaque réunion de famille par sa joie et sa générosité.',
    createdAt: new Date('2023-07-23'),
    prayerCount: 32,
  },
  {
    id: '3',
    name: 'Omar El Mansouri',
    age: 72,
    deathDate: new Date('2023-01-08'),
    location: 'Alger, Algérie',
    personalMessage:
      'Un homme de foi exemplaire qui a consacré sa vie au service de sa communauté.',
    createdAt: new Date('2023-01-09'),
    prayerCount: 89,
  },
  {
    id: '4',
    name: 'Aicha Benali',
    age: 83,
    deathDate: new Date('2022-12-03'),
    location: 'Rabat, Maroc',
    personalMessage:
      'Grand-mère bien-aimée dont les prières et les conseils nous accompagnent encore.',
    createdAt: new Date('2022-12-04'),
    prayerCount: 156,
  },
  {
    id: '5',
    name: 'Youssef Khaled',
    age: 29,
    deathDate: new Date('2023-09-10'),
    location: 'Paris, France',
    personalMessage: "Mon cher ami parti trop tôt. Qu'Allah l'accueille dans Son paradis.",
    createdAt: new Date('2023-09-11'),
    prayerCount: 23,
  },
  {
    id: '6',
    name: 'Khadija Amrani',
    age: 91,
    deathDate: new Date('2023-05-17'),
    location: 'Fès, Maroc',
    personalMessage: 'Une sage femme qui a élevé trois générations avec amour et dévotion.',
    createdAt: new Date('2023-05-18'),
    prayerCount: 67,
  },
  {
    id: '7',
    name: 'Ibrahim Nasri',
    age: 55,
    deathDate: new Date('2023-02-28'),
    location: 'Le Caire, Égypte',
    personalMessage: "Un oncle généreux qui ne refusait jamais d'aider ceux dans le besoin.",
    createdAt: new Date('2023-03-01'),
    prayerCount: 78,
  },
  {
    id: '8',
    name: 'Maryam Slimani',
    age: 37,
    deathDate: new Date('2023-06-14'),
    location: 'Sousse, Tunisie',
    personalMessage: "Ma cousine courageuse qui a lutté avec dignité. Qu'Allah lui pardonne.",
    createdAt: new Date('2023-06-15'),
    prayerCount: 41,
  },
  {
    id: '9',
    name: 'Hassan Mokrane',
    age: 76,
    deathDate: new Date('2023-04-05'),
    location: 'Oran, Algérie',
    personalMessage:
      'Un voisin bienveillant qui incarnait les valeurs de solidarité et de fraternité.',
    createdAt: new Date('2023-04-06'),
    prayerCount: 52,
  },
  {
    id: '10',
    name: 'Salma Benjelloun',
    age: 64,
    deathDate: new Date('2023-08-19'),
    location: 'Marrakech, Maroc',
    personalMessage: "Ma belle-mère aimée qui m'a accueillie comme sa propre fille.",
    createdAt: new Date('2023-08-20'),
    prayerCount: 34,
  },
];

// Fonction utilitaire pour obtenir les initiales
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Fonction pour formater la date
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};
