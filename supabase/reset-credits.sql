-- Run this in Supabase SQL Editor to set up monthly credit reset
-- Requires the pg_cron extension (enabled by default on Supabase)

-- Enable pg_cron if not already enabled
create extension if not exists pg_cron;

-- Schedule credit reset on the 1st of every month at 00:00 UTC
select cron.schedule(
  'reset-monthly-credits',
  '0 0 1 * *',
  $$
    update public.users
    set
      credits_used = 0,
      credits_reset = (date_trunc('month', now()) + interval '1 month')::date
    where plan = 'free';
  $$
);

-- To verify the job was created:
-- select * from cron.job;

-- To remove the job if needed:
-- select cron.unschedule('reset-monthly-credits');
