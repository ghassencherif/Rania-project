CREATE DATABASE IF NOT EXISTS free_time_optimizer;
USE free_time_optimizer;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'participant') NOT NULL DEFAULT 'participant',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  city VARCHAR(120) NOT NULL,
  address VARCHAR(255) NULL,
  latitude DECIMAL(10,7) NULL,
  longitude DECIMAL(10,7) NULL,
  duration_minutes INT NOT NULL,
  category VARCHAR(80) NOT NULL,
  summary TEXT NOT NULL,
  budget_estimate DECIMAL(10,2) NULL,
  transport_options VARCHAR(255) NULL,
  image_url VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE activities
ADD COLUMN IF NOT EXISTS transport_options VARCHAR(255) NULL AFTER summary;

ALTER TABLE activities
ADD COLUMN IF NOT EXISTS budget_estimate DECIMAL(10,2) NULL AFTER summary;

ALTER TABLE activities
ADD COLUMN IF NOT EXISTS address VARCHAR(255) NULL AFTER city;

ALTER TABLE activities
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,7) NULL AFTER address;

ALTER TABLE activities
ADD COLUMN IF NOT EXISTS longitude DECIMAL(10,7) NULL AFTER latitude;

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id INT PRIMARY KEY,
  country VARCHAR(80) NULL,
  preferred_language VARCHAR(20) NOT NULL DEFAULT 'fr',
  traveler_type VARCHAR(80) NULL,
  interests TEXT NULL,
  average_budget DECIMAL(10,2) NULL,
  preferred_pace VARCHAR(30) NULL,
  dietary_restrictions VARCHAR(200) NULL,
  mobility VARCHAR(120) NULL,
  preferred_transport VARCHAR(80) NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  activity_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_user_activity_favorite (user_id, activity_id),
  CONSTRAINT fk_favorites_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_favorites_activity FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS activity_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  activity_id INT NOT NULL,
  action ENUM('viewed','saved','completed') NOT NULL DEFAULT 'viewed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_history_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_history_activity FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS agenda_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_agenda_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO users (full_name, email, password_hash, role)
VALUES
('Admin User', 'admin@freetime.tn', '$2b$10$qNL8jB3SHH4I.KCkT6bnDuu18POH/seW5w9jCgUNpue9GJLedS1De', 'admin')
ON DUPLICATE KEY UPDATE email = email;

INSERT INTO activities (title, city, address, latitude, longitude, duration_minutes, category, summary, budget_estimate, image_url)
VALUES
('Site archeologique de Carthage', 'Tunis', 'Carthage, Tunis', 36.8529000, 10.3231000, 90, 'Culture', 'Decouvrez les vestiges antiques de Carthage en moins de deux heures.', 35.00, 'https://images.unsplash.com/photo-1610966655543-f6d57f075444?auto=format&fit=crop&w=1200&q=80'),
('Medina de Tunis express', 'Tunis', 'Medina de Tunis', 36.7995000, 10.1716000, 70, 'Patrimoine', 'Parcours guide entre souks, architecture et saveurs locales.', 20.00, 'https://images.unsplash.com/photo-1590523278191-995cbcda646b?auto=format&fit=crop&w=1200&q=80'),
('Pause panoramique a Sidi Bou Said', 'Tunis', 'Sidi Bou Said, Tunis', 36.8706000, 10.3413000, 110, 'Detente', 'Balade entre ruelles blanches et cafes avec vue sur la mer.', 45.00, 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80')
ON DUPLICATE KEY UPDATE title = title;
