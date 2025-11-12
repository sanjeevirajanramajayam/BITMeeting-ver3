-- Schema for Alternate Request Feature
-- This allows users to nominate an alternate person if they cannot attend a meeting
-- The alternate must accept, then admin must give final approval

CREATE TABLE IF NOT EXISTS `meeting_alternate_requests` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `meeting_id` INT NOT NULL,
  `requesting_user_id` INT NOT NULL COMMENT 'User who cannot attend and is requesting alternate',
  `alternate_user_id` INT NOT NULL COMMENT 'User being nominated as alternate',
  `reason` TEXT COMMENT 'Reason for requesting alternate',
  `status` ENUM('pending', 'alternate_accepted', 'alternate_rejected', 'admin_approved', 'admin_rejected') DEFAULT 'pending',
  `request_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `alternate_response_date` TIMESTAMP NULL DEFAULT NULL,
  `admin_response_date` TIMESTAMP NULL DEFAULT NULL,
  `admin_remarks` TEXT COMMENT 'Admin comments on approval/rejection',
  PRIMARY KEY (`id`),
  KEY `idx_meeting_id` (`meeting_id`),
  KEY `idx_requesting_user` (`requesting_user_id`),
  KEY `idx_alternate_user` (`alternate_user_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_alternate_meeting` FOREIGN KEY (`meeting_id`) REFERENCES `meeting` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_alternate_requesting_user` FOREIGN KEY (`requesting_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_alternate_alternate_user` FOREIGN KEY (`alternate_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Stores alternate attendance requests for meetings';

-- Index for querying pending requests for a specific user
CREATE INDEX `idx_alternate_pending` ON `meeting_alternate_requests` (`alternate_user_id`, `status`);

-- Index for querying requests by meeting and status for admin
CREATE INDEX `idx_meeting_status` ON `meeting_alternate_requests` (`meeting_id`, `status`);
