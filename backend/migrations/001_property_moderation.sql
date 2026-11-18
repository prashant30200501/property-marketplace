-- Add moderation reason to property listings.
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS moderation_reason TEXT;

-- New properties should default to pending review.
ALTER TABLE properties
ALTER COLUMN status SET DEFAULT 'pending_review';

-- Existing listings retain their current status.
-- This avoids unexpectedly hiding previously approved properties.