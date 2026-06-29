create table if not exists questions (
  id text primary key,
  source text not null,
  source_order integer not null,
  title text not null,
  section text,
  pattern text not null,
  difficulty text not null,
  duration text,
  url text,
  namaste_url text,
  leetcode_slug text,
  leetcode_url text,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table questions add column if not exists namaste_url text;
alter table questions add column if not exists leetcode_slug text;
alter table questions add column if not exists leetcode_url text;

create table if not exists question_progress (
  question_id text primary key references questions(id) on delete cascade,
  status text not null default 'Todo' check (status in ('Todo', 'Solved', 'Revise')),
  notes text not null default '',
  leetcode_verified_at timestamptz,
  leetcode_verification_note text not null default '',
  updated_at timestamptz not null default now()
);

alter table question_progress add column if not exists leetcode_verified_at timestamptz;
alter table question_progress add column if not exists leetcode_verification_note text not null default '';

create table if not exists study_logs (
  id bigserial primary key,
  log_date date not null,
  focus text not null,
  minutes integer not null check (minutes > 0),
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists milestone_progress (
  milestone_id text primary key,
  status text not null default 'Todo' check (status in ('Todo', 'Done', 'Revise')),
  notes text not null default '',
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists app_users (
  id bigserial primary key,
  email text not null unique,
  leetcode_username text,
  created_at timestamptz not null default now(),
  last_login_at timestamptz
);

alter table app_users add column if not exists leetcode_username text;

create table if not exists email_otps (
  id bigserial primary key,
  email text not null,
  otp_hash text not null,
  attempts integer not null default 0,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists auth_sessions (
  id bigserial primary key,
  user_id bigint not null references app_users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create index if not exists idx_questions_pattern on questions(pattern);
create index if not exists idx_questions_section on questions(section);
create index if not exists idx_question_progress_status on question_progress(status);
create index if not exists idx_study_logs_log_date on study_logs(log_date desc);
create index if not exists idx_milestone_progress_status on milestone_progress(status);
create index if not exists idx_email_otps_email_created_at on email_otps(email, created_at desc);
create index if not exists idx_auth_sessions_token_hash on auth_sessions(token_hash);
create index if not exists idx_auth_sessions_user_id on auth_sessions(user_id);
