DROP DATABASE IF EXISTS dental_notebook;

CREATE DATABASE dental_notebook;

USE dental_notebook;

CREATE TABLE `patients` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `firstname` varchar(150),
  `lastname` varchar(150),
  `phone` varchar(255),
  `email` varchar(150),
  `occupation` varchar(150),
  `birth_date` date,
  `created_at` datetime,
  `gender` varchar(50)
);

CREATE TABLE `medical_background` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `patient_id` int,
  `has_hbd` boolean,
  `has_diabetes` boolean,
  `has_active_medication` boolean,
  `active_medication` varchar(750),
  `has_alergies` boolean,
  `alergies` varchar(750)
);

CREATE TABLE `attachments` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `url` varchar(500),
  `patient_id` int
);

CREATE TABLE `teeth_map` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `patient_id` int
);

CREATE TABLE `treatments_teeth` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `teeth_map_id` int,
  `treatments_id` int,
  `tooth` int,
  `dental_status` varchar(500)
);

CREATE TABLE `treatments` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(500),
  `price` int,
  `created_at` datetime
);

CREATE TABLE `appointment_treatments` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `treatments_id` int,
  `appointments_id` int,
  `treatment_price` int
);

CREATE TABLE `appointments` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `patient_id` int,
  `appointment_date` datetime
);

CREATE TABLE `todos` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `todo_item` varchar(750)
);

ALTER TABLE `attachments` ADD FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE;

ALTER TABLE `teeth_map` ADD FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE;

ALTER TABLE `treatments_teeth` ADD FOREIGN KEY (`teeth_map_id`) REFERENCES `teeth_map` (`id`) ON DELETE CASCADE;

ALTER TABLE `treatments_teeth` ADD FOREIGN KEY (`treatments_id`) REFERENCES `treatments` (`id`) ON DELETE CASCADE;

ALTER TABLE `medical_background` ADD FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE;

ALTER TABLE `appointment_treatments` ADD FOREIGN KEY (`appointments_id`) REFERENCES `appointments` (`id`) ON DELETE CASCADE;

ALTER TABLE `appointment_treatments` ADD FOREIGN KEY (`treatments_id`) REFERENCES `treatments` (`id`) ON DELETE CASCADE;

ALTER TABLE `appointments` ADD FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE;
