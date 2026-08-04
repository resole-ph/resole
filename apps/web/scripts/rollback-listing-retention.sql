-- Safe rollback: stop automation without dropping history snapshots.
DO $$
DECLARE v_job_id bigint;
BEGIN
  SELECT jobid INTO v_job_id FROM cron.job WHERE jobname = 'archive-listings-daily';
  IF v_job_id IS NOT NULL THEN PERFORM cron.unschedule(v_job_id); END IF;
  SELECT jobid INTO v_job_id FROM cron.job WHERE jobname = 'delete-archived-listings-daily';
  IF v_job_id IS NOT NULL THEN PERFORM cron.unschedule(v_job_id); END IF;
END $$;
