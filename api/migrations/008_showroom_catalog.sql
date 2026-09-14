-- Run AFTER 007 and AFTER the image assets have been deployed. UTF-8.

-- Existing gallery selections and visibility are preserved on re-import.

SET NAMES utf8mb4;

START TRANSACTION;

UPDATE projects SET screenshot = '/images/projects/healthcorp/healthcorp-portfolio.webp', screenshots = '["/images/projects/healthcorp/healthcorp-companies.webp"]', show_in_showcase = 1 WHERE id = 6 AND name = 'Healthcorp' AND screenshots IS NULL;

UPDATE projects SET category = 'Business analysis', tagline = 'Explore company financial statements, activity and credit risk through a demonstration interface using simulated data. This project connects my interest in economics and industry with the questions I encounter as the owner of a small business.', status = 'in-development' WHERE id = 6 AND name = 'Healthcorp' AND (tagline = '' OR tagline = 'Pick an image, choose a style, watch it transform.' OR tagline = 'Credit-risk rating platform.');

INSERT INTO project_translations (project_id, lang, category, tagline) SELECT id, 'fr', 'Analyse des entreprises', 'Explorer les bilans, l’activité et le risque de crédit des entreprises à travers une interface de démonstration utilisant des données simulées. Ce projet fait le lien entre mon intérêt pour l’économie et l’industrie et les questions que je me pose en tant que gérant d’une EURL.' FROM projects WHERE id = 6 AND name = 'Healthcorp' ON DUPLICATE KEY UPDATE category = VALUES(category), tagline = VALUES(tagline);

UPDATE projects SET screenshot = '/images/projects/stocks/stocks-dashboard.webp', screenshots = '["/images/projects/stocks/stocks-holdings.webp"]', show_in_showcase = 1 WHERE id = 2 AND name = 'StockTracker Personal' AND screenshots IS NULL;

UPDATE projects SET category = 'Personal finance', tagline = 'Bring investment accounts together in one dashboard to follow holdings and performance. A tool I am developing for my own use, driven by my interest in economics, companies and industry.', status = 'in-development' WHERE id = 2 AND name = 'StockTracker Personal' AND (tagline = '' OR tagline = 'Pick an image, choose a style, watch it transform.' OR tagline = 'One dashboard for every account — PEA, PER, CTO — with the KPIs that matter.');

INSERT INTO project_translations (project_id, lang, category, tagline) SELECT id, 'fr', 'Finances personnelles', 'Réunir ses comptes d’investissement dans un même tableau de bord pour suivre ses positions et leur évolution. Un outil que je développe pour mon propre usage, nourri par mon intérêt pour l’économie, les entreprises et l’industrie.' FROM projects WHERE id = 2 AND name = 'StockTracker Personal' ON DUPLICATE KEY UPDATE category = VALUES(category), tagline = VALUES(tagline);

UPDATE projects SET screenshot = '/images/projects/lotokarma/lotokarma-home.webp', screenshots = '["/images/projects/lotokarma/lotokarma-euromillions.webp"]', show_in_showcase = 1 WHERE id = 10 AND name = 'lotoKarma' AND screenshots IS NULL;

UPDATE projects SET category = 'Playful simulations', tagline = 'Would your birthday have brought you luck? Generate numbers inspired by your birth date or numerology and see whether they would have won in past draws. Explore the estimated winnings, ticket costs and net result of playing the same numbers at every draw in the available archives. Then compare with an estimate of investing the same budget in an S&P 500 ETF. A playful look at past results, with no prediction of future draws.', status = 'in-development' WHERE id = 10 AND name = 'lotoKarma' AND (tagline = '' OR tagline = 'Pick an image, choose a style, watch it transform.' OR tagline = 'A modern web app for FDJ lottery players — Loto, EuroMillions and Crescendo. lotoKarma lets you generate number grids, check them against the complete draw history, browse the archives, and analyze frequency statistics to refine your choices.');

INSERT INTO project_translations (project_id, lang, category, tagline) SELECT id, 'fr', 'Simulations ludiques', 'Votre date de naissance vous aurait-elle porté chance ? Générez vos numéros à partir de votre naissance ou de la numérologie et découvrez s’ils auraient déjà gagné. Explorez les gains estimés, le coût des tickets et le bilan en rejouant la même grille à chaque tirage des archives disponibles. Et si vous aviez investi ce budget dans un ETF S&P 500 ? Comparez avec une estimation. Une façon ludique d’explorer le passé, sans prédire les prochains tirages.' FROM projects WHERE id = 10 AND name = 'lotoKarma' ON DUPLICATE KEY UPDATE category = VALUES(category), tagline = VALUES(tagline);

UPDATE projects SET screenshot = '/images/projects/lenormand/lenormand-deck.webp', screenshots = '["/images/projects/lenormand/lenormand-cards.webp"]', show_in_showcase = 1 WHERE id = 17 AND name = 'Lenormand' AND screenshots IS NULL;

UPDATE projects SET screenshot = '/images/projects/kanji/kanji-home.webp', screenshots = '["/images/projects/kanji/kanji-list.webp"]', show_in_showcase = 1 WHERE id = 3 AND name = 'Kanji' AND screenshots IS NULL;

UPDATE projects SET category = 'Language learning', tagline = 'Learning Japanese, but intimidated by kanji? Their many strokes can look daunting at first. Explore the characters and watch them drawn one stroke at a time, at your own pace. A visual, playful way to make kanji more approachable and take your first steps with confidence.', status = 'in-development' WHERE id = 3 AND name = 'Kanji' AND (tagline = '' OR tagline = 'Pick an image, choose a style, watch it transform.' OR tagline = 'Explore Japanese characters and watch them drawn stroke by stroke.');

INSERT INTO project_translations (project_id, lang, category, tagline) SELECT id, 'fr', 'Apprentissage des langues', 'Envie d’apprendre le japonais, mais les kanjis vous intimident ? Avec leurs nombreux traits, ils peuvent sembler impossibles à retenir. Explorez les caractères et regardez-les se dessiner trait par trait, à votre rythme. Une approche visuelle et ludique pour les rendre plus familiers et oser se lancer.' FROM projects WHERE id = 3 AND name = 'Kanji' ON DUPLICATE KEY UPDATE category = VALUES(category), tagline = VALUES(tagline);

UPDATE projects SET screenshot = '/images/projects/books/books-library.webp', screenshots = '["/images/projects/books/books-locations.webp"]', show_in_showcase = 1 WHERE id = 18 AND name = 'books' AND screenshots IS NULL;

UPDATE projects SET category = 'Personal library', tagline = 'Keep track of your books, find where they are stored and follow your reading. I love books: this application starts with a practical need to organize my own library and enjoy it more.', status = 'in-development' WHERE id = 18 AND name = 'books' AND (tagline = '' OR tagline = 'Pick an image, choose a style, watch it transform.' OR tagline = 'Catalog books, track reading and organize a personal library by location.');

INSERT INTO project_translations (project_id, lang, category, tagline) SELECT id, 'fr', 'Bibliothèque personnelle', 'Retrouver ses livres, savoir où ils sont rangés et suivre ses lectures. J’aime beaucoup les livres : cette application part d’un besoin concret, organiser ma propre bibliothèque pour mieux en profiter.' FROM projects WHERE id = 18 AND name = 'books' ON DUPLICATE KEY UPDATE category = VALUES(category), tagline = VALUES(tagline);

INSERT INTO projects (name, category, tagline, tier, status, availability, sort_order, show_in_showcase) SELECT 'sn8w Portal', 'Portfolio', 'Bilingual Angular CV and project showroom with a PHP and MySQL administration area.', 'ecosystem', 'prototype', 'inactive', 16, 0 WHERE NOT EXISTS (SELECT 1 FROM projects WHERE name = 'sn8w Portal');

UPDATE projects SET screenshot = '/images/projects/sn8w-portal/portal-home.webp', screenshots = '["/images/projects/sn8w-portal/portal-projects.webp"]' WHERE name = 'sn8w Portal' AND screenshots IS NULL;

INSERT INTO projects (name, category, tagline, tier, status, availability, sort_order, show_in_showcase) SELECT 'CV redesign study', 'Design exploration', 'Alternative Angular portfolio design and accessibility-focused CV presentation.', 'ecosystem', 'prototype', 'inactive', 17, 0 WHERE NOT EXISTS (SELECT 1 FROM projects WHERE name = 'CV redesign study');

UPDATE projects SET screenshot = '/images/projects/cv-redesign/cv-redesign-home.webp', screenshots = '["/images/projects/cv-redesign/cv-redesign-light.webp"]' WHERE name = 'CV redesign study' AND screenshots IS NULL;

INSERT INTO projects (name, category, tagline, tier, status, availability, sort_order, show_in_showcase) SELECT 'Devfest Manager', 'Learning project', 'Angular event-management exercise with event cards and administration screens.', 'ecosystem', 'prototype', 'inactive', 18, 0 WHERE NOT EXISTS (SELECT 1 FROM projects WHERE name = 'Devfest Manager');

UPDATE projects SET screenshot = '/images/projects/devfest/devfest-events.webp', screenshots = '["/images/projects/devfest/devfest-admin.webp"]' WHERE name = 'Devfest Manager' AND screenshots IS NULL;

INSERT INTO projects (name, category, tagline, tier, status, availability, sort_order, show_in_showcase) SELECT 'Prompt Hub — Angular course', 'Learning project', 'Angular course workspace for discovering and sharing prompts.', 'ecosystem', 'prototype', 'inactive', 19, 0 WHERE NOT EXISTS (SELECT 1 FROM projects WHERE name = 'Prompt Hub — Angular course');

UPDATE projects SET screenshot = '/images/projects/prompt-hub/prompt-hub-home.webp', screenshots = '[]' WHERE name = 'Prompt Hub — Angular course' AND screenshots IS NULL;

INSERT INTO projects (name, category, tagline, tier, status, availability, sort_order, show_in_showcase) SELECT 'Bastion Angular', 'Learning project', 'Angular practice workspace with a starter application.', 'ecosystem', 'prototype', 'inactive', 20, 0 WHERE NOT EXISTS (SELECT 1 FROM projects WHERE name = 'Bastion Angular');

UPDATE projects SET screenshot = '/images/projects/bastion/bastion-starter.webp', screenshots = '[]' WHERE name = 'Bastion Angular' AND screenshots IS NULL;

INSERT INTO projects (name, category, tagline, tier, status, availability, sort_order, show_in_showcase) SELECT 'Repo to Text — local workspace', 'Reference tool', 'Local checkout of a repository-to-text tool for preparing code context.', 'ecosystem', 'prototype', 'inactive', 21, 0 WHERE NOT EXISTS (SELECT 1 FROM projects WHERE name = 'Repo to Text — local workspace');

UPDATE projects SET screenshot = '/images/projects/repo-to-text/repo-to-text-github.webp', screenshots = '["/images/projects/repo-to-text/repo-to-text-local.webp"]' WHERE name = 'Repo to Text — local workspace' AND screenshots IS NULL;

INSERT INTO projects (name, category, tagline, tier, status, availability, sort_order, show_in_showcase) SELECT 'WoW Character Viewer', 'Learning project', 'Angular character-viewer project with a Battle.net sign-in flow.', 'ecosystem', 'prototype', 'inactive', 22, 0 WHERE NOT EXISTS (SELECT 1 FROM projects WHERE name = 'WoW Character Viewer');

UPDATE projects SET screenshot = '/images/projects/wow/wow-login.webp', screenshots = '[]' WHERE name = 'WoW Character Viewer' AND screenshots IS NULL;

INSERT INTO projects (name, category, tagline, tier, status, availability, sort_order, show_in_showcase) SELECT 'Monster Dex — practice', 'Learning project', 'Angular practice application for displaying a collection of monsters.', 'ecosystem', 'prototype', 'inactive', 23, 0 WHERE NOT EXISTS (SELECT 1 FROM projects WHERE name = 'Monster Dex — practice');

UPDATE projects SET screenshot = '/images/projects/monster-dex/monster-dex-list.webp', screenshots = '[]' WHERE name = 'Monster Dex — practice' AND screenshots IS NULL;

INSERT INTO projects (name, category, tagline, tier, status, availability, sort_order, show_in_showcase) SELECT 'Clock and Weather Widget', 'UI component', 'Clock and weather component with day, night and weather-state previews.', 'ecosystem', 'prototype', 'inactive', 24, 0 WHERE NOT EXISTS (SELECT 1 FROM projects WHERE name = 'Clock and Weather Widget');

UPDATE projects SET screenshot = '/images/projects/weather/weather-gallery.webp', screenshots = '["/images/projects/weather/weather-mobile.webp"]' WHERE name = 'Clock and Weather Widget' AND screenshots IS NULL;

INSERT INTO projects (name, category, tagline, tier, status, availability, sort_order, show_in_showcase) SELECT 'Angular Fundamentals Lessons', 'Learning workspace', 'Exercises covering Angular components, routing, forms and signals.', 'ecosystem', 'prototype', 'inactive', 25, 0 WHERE NOT EXISTS (SELECT 1 FROM projects WHERE name = 'Angular Fundamentals Lessons');

UPDATE projects SET screenshot = '/images/projects/angular-lessons/angular-forms.webp', screenshots = '[]' WHERE name = 'Angular Fundamentals Lessons' AND screenshots IS NULL;

INSERT INTO projects (name, category, tagline, tier, status, availability, sort_order, show_in_showcase) SELECT 'Frontend Masters — learning workspace', 'Learning workspace', 'Course notes and exercises in TypeScript, Java and Spring Boot.', 'ecosystem', 'prototype', 'inactive', 26, 0 WHERE NOT EXISTS (SELECT 1 FROM projects WHERE name = 'Frontend Masters — learning workspace');

INSERT INTO projects (name, category, tagline, tier, status, availability, sort_order, show_in_showcase) SELECT 'Tanaguru — accessibility reference', 'Accessibility reference', 'Local checkout of the Tanaguru web accessibility evaluation extension.', 'ecosystem', 'prototype', 'inactive', 27, 0 WHERE NOT EXISTS (SELECT 1 FROM projects WHERE name = 'Tanaguru — accessibility reference');

INSERT INTO projects (name, category, tagline, tier, status, availability, sort_order, show_in_showcase) SELECT 'Access42 — accessibility training', 'Learning workspace', 'Accessibility training materials and HTML interface examples.', 'ecosystem', 'prototype', 'inactive', 28, 0 WHERE NOT EXISTS (SELECT 1 FROM projects WHERE name = 'Access42 — accessibility training');

INSERT INTO projects (name, category, tagline, tier, status, availability, sort_order, show_in_showcase) SELECT 'AI Project Planning Template', 'Documentation tool', 'Reusable documentation structure for software, product and design projects.', 'ecosystem', 'prototype', 'inactive', 29, 0 WHERE NOT EXISTS (SELECT 1 FROM projects WHERE name = 'AI Project Planning Template');

INSERT INTO projects (name, category, tagline, tier, status, availability, sort_order, show_in_showcase) SELECT 'Photo Book Scanner', 'Data processing and image analysis', 'Find book covers among the images in a personal photo library. This Python project uses a locally run image model to identify likely covers and prepare a catalog. For a library of, for example, 50,000 photos, I want to compare local processing with online analysis through services such as Claude or ChatGPT: cost, accuracy, processing time and privacy. The aim is to choose the right tool for the volume and the need.', 'ecosystem', 'prototype', 'inactive', 30, 0 WHERE NOT EXISTS (SELECT 1 FROM projects WHERE name = 'Photo Book Scanner');

INSERT INTO project_translations (project_id, lang, category, tagline) SELECT id, 'fr', 'Traitement des données et analyse d’images', 'Retrouver les couvertures de livres parmi les images de sa photothèque. Ce projet Python utilise un modèle d’analyse d’images exécuté localement pour repérer les couvertures probables et préparer un catalogue. À l’échelle d’une photothèque de 50 000 photos, par exemple, je souhaite comparer ce traitement à une analyse en ligne avec Claude ou ChatGPT : coût, précision, temps de calcul et confidentialité. L’objectif est de choisir l’outil adapté au volume et au besoin.' FROM projects WHERE name = 'Photo Book Scanner' ON DUPLICATE KEY UPDATE category = VALUES(category), tagline = VALUES(tagline);

INSERT INTO projects (name, category, tagline, tier, status, availability, sort_order, show_in_showcase) SELECT 'Ultimate Courses — workspace', 'Learning workspace', 'Reserved workspace for course exercises.', 'ecosystem', 'prototype', 'inactive', 31, 0 WHERE NOT EXISTS (SELECT 1 FROM projects WHERE name = 'Ultimate Courses — workspace');

INSERT INTO projects (name, category, tagline, tier, status, availability, sort_order, show_in_showcase) SELECT 'Development sandbox', 'Experiment workspace', 'Reserved workspace for development experiments.', 'ecosystem', 'prototype', 'inactive', 32, 0 WHERE NOT EXISTS (SELECT 1 FROM projects WHERE name = 'Development sandbox');

INSERT INTO projects (name, category, tagline, tier, status, availability, sort_order, show_in_showcase) SELECT 'Fighto', 'Time, goals and health habits', 'Make room for what matters: organize your time, move towards your goals and protect your focus. Fighto is a planned application bringing these needs together with food habits, diabetes monitoring and physical activity — exercise, with a particular focus on tracking walks. The aim is to follow your progress and build a more balanced, active daily life.', 'ecosystem', 'concept', 'inactive', 33, 0 WHERE NOT EXISTS (SELECT 1 FROM projects WHERE name = 'Fighto');

INSERT INTO project_translations (project_id, lang, category, tagline) SELECT id, 'fr', 'Temps, objectifs et habitudes de santé', 'Faire de la place à ce qui compte : organiser son temps, avancer vers ses objectifs et préserver sa concentration. Fighto est un projet d’application pour réunir ces besoins avec le suivi de l’alimentation, du diabète et de l’activité physique, avec des exercices et une attention particulière au suivi de la marche. L’idée : voir ses progrès et construire un quotidien plus équilibré et plus actif.' FROM projects WHERE name = 'Fighto' ON DUPLICATE KEY UPDATE category = VALUES(category), tagline = VALUES(tagline);

COMMIT;

