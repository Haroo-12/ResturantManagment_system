-- Create daily_closings table for restaurant business day closing summaries
-- This table stores aggregated data for each business day's closing

CREATE TABLE IF NOT EXISTS public.daily_closings (
  id BIGSERIAL PRIMARY KEY,
  business_date DATE NOT NULL UNIQUE,
  day_number INTEGER,
  total_orders INTEGER NOT NULL DEFAULT 0,
  completed_orders INTEGER NOT NULL DEFAULT 0,
  pending_orders INTEGER NOT NULL DEFAULT 0,
  cancelled_orders INTEGER NOT NULL DEFAULT 0,
  total_sales NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_profit NUMERIC(12, 2),
  cash_sales NUMERIC(12, 2) NOT NULL DEFAULT 0,
  card_sales NUMERIC(12, 2) NOT NULL DEFAULT 0,
  online_sales NUMERIC(12, 2) NOT NULL DEFAULT 0,
  expenses NUMERIC(12, 2) NOT NULL DEFAULT 0,
  expected_cash NUMERIC(12, 2) NOT NULL DEFAULT 0,
  actual_cash NUMERIC(12, 2) NOT NULL DEFAULT 0,
  difference NUMERIC(12, 2) NOT NULL DEFAULT 0,
  note TEXT,
  closed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  closed_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add columns if they don't exist (for idempotency)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_closings' AND column_name = 'card_sales'
  ) THEN
    ALTER TABLE public.daily_closings ADD COLUMN card_sales NUMERIC(12, 2) NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_closings' AND column_name = 'online_sales'
  ) THEN
    ALTER TABLE public.daily_closings ADD COLUMN online_sales NUMERIC(12, 2) NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_closings_business_date ON public.daily_closings(business_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_closings_day_number ON public.daily_closings(day_number);

-- Add comment
COMMENT ON TABLE public.daily_closings IS 'Stores daily closing summaries for restaurant business days';
COMMENT ON COLUMN public.daily_closings.business_date IS 'The business date (restaurant operating day, which may cross calendar dates)';
COMMENT ON COLUMN public.daily_closings.day_number IS 'Sequential day number within a business month';
COMMENT ON COLUMN public.daily_closings.total_profit IS 'Nullable because profit calculation depends on reliable cost data';
