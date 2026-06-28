create or replace view superset_question_progress as
select
  q.id,
  q.source,
  q.source_order,
  q.title,
  q.section,
  q.pattern,
  q.difficulty,
  q.duration,
  coalesce(qp.status, 'Todo') as status,
  qp.updated_at as status_updated_at
from questions q
left join question_progress qp on qp.question_id = q.id;

create or replace view superset_pattern_summary as
select
  pattern,
  count(*)::int as total_questions,
  count(*) filter (where status = 'Solved')::int as solved_questions,
  count(*) filter (where status = 'Revise')::int as revise_questions,
  round(100.0 * count(*) filter (where status = 'Solved') / nullif(count(*), 0), 2) as solved_percent
from superset_question_progress
group by pattern;

create or replace view superset_daily_study as
select
  log_date,
  focus,
  count(*)::int as sessions,
  sum(minutes)::int as minutes
from study_logs
group by log_date, focus;
