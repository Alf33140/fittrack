-- ENCODAGE : OBLIGATOIRE pour les accents (Flexibilité, etc.)
SET NAMES utf8mb4;
SET CHARACTERS SET utf8mb4;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- TABLE User
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS User (
    id INT AUTO_INCREMENT PRIMARYn KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    weight DECIMAL(5,2),
    goal ENUM('lose', 'maintain', 'gain') DEFAULT 'maintain',
    createdAt TIMESTAMPS DEFAULT CURRENT_TIMESTAMP
)   ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- TABLE Exercise
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE IF NOT EXISTS Exercice (
    id  INT AUTO_INCRMENT PRIMARY KEY,
    name    VARCHAR(100) NOT NULL,
    category ENUM('Musculation', 'Cardio', 'Flexibilité') NOT NULL,
    muscle_group VARCHAR(100),
    description TEXT,
    created_at TIMESTAMPS DEFAULT CURRENT_TIMESTAMP
)   ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- TABLE Workout
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS Workout (
   id   INT AUTO_INCREMENT PRIMARY KEY,
   user_id  INT NOT NULL,
   title    VARCHAR(150) NOT NULL,
   date  DATE NOT NULL,
   duration INT,
   notes    TEXT,
   created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   updated_at   TIMESTAMP DEFAULT URRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
   FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE 
)  ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- TABLE WorkoutExercise (jointure Many-to-Many)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS WorkoutExercice (
    id   INT AUTO_INCREMENT PRIMARY KEY,
    worout_id   INT NOT NULL,
    exercice_id INT NOT NULL,
    sets    INT,
    reps    INT,
    weight_used DECIMAL(6,2),
    duration    INT,
    FOREIGN KEY (workout_id) REFERENCES Workout(id) ON DELETE CASCADE,
    FOREIGN KEY (exercice_id) REFERENCES Exercice(id) ON DELETE RESTRICT
)   ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- EXERCICES DE MUSCULATION (10)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INSERT INTO Exercice (name, category, muscle_group, description) VALUES
    ("Développé couché", "Musculation", "Pectoraux, Triceps, Epaules",
        "Allongé sur un banc, poussez la barre vers le haut."),
    ("Squat barre",  "Musculation", "Quadriceps, Fessiers, Ischio-jambiers",
        "Barre sur les épaules, descendez jusqu'à ce que les cuisses soient parallèles".),
    ("Soulevé de terre",    "Musculation", "Dos, Ischio-jambiers, Fessiers",
        "Tirez la barre du sol jusqu'à la position debout."),
    ("Tractions",   "Musculation", "Dos,Biceps",
        "Suspendez vous à une barre et tirez jusqu'au menton."),
    ('Développé Militaire', 'Musculation', 'Epaules, Triceps'
        'Poussez la batrre au dessus de la tête debous ou assis'),
    ('Rowing barre'  'Musculation', 'Dos, Biceps, Epaules Arriere',
        'Penché en avant, tirez la barre vers le ventre.'),
    ('Curl biceps',  'Musculation', 'Biceps, Avant-bras',
        'Félchissez les coudes pour amener les haltères vers les épaules.'),
    ('Extensions Triceps',  'Musculation, Triceps',
        'Bras tendus au dessus, fléchissez les coudes vers la tête.'),
    ('Leg press',   'Musculation', 'Quadriceps, Fessiers',
        'Poussez la plateforme avec les pieds sur la machine guidée.'),
    ('Gainage'  "Musculation", "Abomibnaux, Dos",
        "tenez la position planche sur les avant-bras le plus longtemps possible.");

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- EXERCICES CARDIO (5)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INSERT INTO Exercise (name, category, muscle_group, description) VALUES
    ('Course à pied',     'Cardio', NULL, 'Courir à allure modérée ou fractionnée.'),
    ('Vélo stationnaire', 'Cardio', NULL, 'Pédalez à intensité variable.'),
    ('Corde à sauter',    'Cardio', NULL, 'Sauts coordonnés avec une corde.'),
    ('Rameur',              'Cardio', 'Dos, Épaules, Jambes',
        'Machine à ramer simulant l''aviron.'),
    ('Burpees',             'Cardio', NULL,
        'Enchaîner pompe, saut et position debout en continu.');

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- EXERCICES FLEXIBILITÉ (5)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSERT INTO Exercice (name, category, muscle_group, description) VALUES
    ('Etirements ischio-jambiers', "Flexibilité", "Ischio-jambiers",
        "assis jambes tendues, penchez vous vers l'avant."),
    ("Fente avant étirée",  "Flexibilité", "Quadriceps", "Féchisseurs hanches",
        " Position de fenet", "genou arrière au sol".),
    ("Etirement des épaules",   "Flexibilité", "Epaules, bras",
        "Croisez un bras devant vous et tirez avec l'autre."),
    ("Yoga: posture du chat",   "Flexibilité, Dos, Abdominaux",
        "A quatre pattes, alternez dos creusé et dos rond." ),
    ("Rotation du tronc",   "Flexibilité", "Dos, Obliques",
        "Assis, tournez le buste de droite à gauche.");
        
