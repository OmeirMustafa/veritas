-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- TABLE: users
create table public.users (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  avatar_url text,
  timezone text default 'UTC',
  created_at timestamptz default now(),
  premium_tier text default 'free' check (premium_tier in ('free','premium','teams'))
);

-- TABLE: circles
create table public.circles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  admin_user_id uuid references public.users(id),
  member_limit int default 50,
  created_at timestamptz default now()
);

-- TABLE: circle_members
create table public.circle_members (
  circle_id uuid references public.circles(id),
  user_id uuid references public.users(id),
  joined_at timestamptz default now(),
  status text default 'active' check (status in ('active','left','removed')),
  primary key (circle_id, user_id)
);

-- TABLE: posts
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  content_text text,
  voice_url text,
  photo_url text,
  created_at timestamptz default now(),
  post_date date not null default current_date,
  archived_at timestamptz,
  constraint one_post_per_day unique (user_id, post_date)
);

-- TABLE: post_circles
create table public.post_circles (
  post_id uuid references public.posts(id),
  circle_id uuid references public.circles(id),
  primary key (post_id, circle_id)
);

-- TABLE: reactions
create table public.reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id),
  reactor_user_id uuid references public.users(id),
  reaction_type text check (reaction_type in ('see_you','resonated','rooting','needed_this','brave')),
  created_at timestamptz default now(),
  constraint one_reaction_per_post unique (post_id, reactor_user_id)
);

-- TABLE: invitations
create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid references public.circles(id),
  inviter_user_id uuid references public.users(id),
  invitee_identifier text not null,
  token text unique default gen_random_uuid()::text,
  accepted_at timestamptz,
  expires_at timestamptz default now() + interval '7 days',
  created_at timestamptz default now()
);

-- Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.circles enable row level security;
alter table public.circle_members enable row level security;
alter table public.posts enable row level security;
alter table public.post_circles enable row level security;
alter table public.reactions enable row level security;
alter table public.invitations enable row level security;

-- RLS Policies

-- Users: read own profile, or profile of users in shared circles
create policy "Users can read their own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can read profiles of shared circle members" on public.users
  for select using (
    exists (
      select 1 from public.circle_members cm1
      join public.circle_members cm2 on cm1.circle_id = cm2.circle_id
      where cm1.user_id = auth.uid() and cm2.user_id = users.id and cm1.status = 'active' and cm2.status = 'active'
    )
  );

create policy "Users can update their own profile" on public.users
  for update using (auth.uid() = id);

-- Circles: read circles they are a member of
create policy "Users can view circles they belong to" on public.circles
  for select using (
    exists (
      select 1 from public.circle_members
      where circle_id = circles.id and user_id = auth.uid() and status = 'active'
    )
  );

create policy "Admins can update circles" on public.circles
  for update using (admin_user_id = auth.uid());

create policy "Users can create circles" on public.circles
  for insert with check (admin_user_id = auth.uid());

-- Circle Members: read members of circles they belong to
create policy "Users can view members of their circles" on public.circle_members
  for select using (
    exists (
      select 1 from public.circle_members my_cm
      where my_cm.circle_id = circle_members.circle_id and my_cm.user_id = auth.uid() and my_cm.status = 'active'
    )
  );

create policy "Admins can manage members" on public.circle_members
  for all using (
    exists (
      select 1 from public.circles
      where id = circle_members.circle_id and admin_user_id = auth.uid()
    )
  );

create policy "Users can insert themselves via invitations" on public.circle_members
  for insert with check (user_id = auth.uid());

-- Posts: users can only read posts from circles they belong to. Users can only write their own posts.
create policy "Users can view posts in their circles" on public.posts
  for select using (
    user_id = auth.uid() or
    exists (
      select 1 from public.post_circles pc
      join public.circle_members cm on pc.circle_id = cm.circle_id
      where pc.post_id = posts.id and cm.user_id = auth.uid() and cm.status = 'active'
    )
  );

create policy "Users can insert their own posts" on public.posts
  for insert with check (user_id = auth.uid());

create policy "Users can update their own posts" on public.posts
  for update using (user_id = auth.uid());

-- Post Circles: read/insert based on post ownership and circle membership
create policy "Users can view post circle mappings they have access to" on public.post_circles
  for select using (
    exists (
      select 1 from public.circle_members
      where circle_id = post_circles.circle_id and user_id = auth.uid() and status = 'active'
    )
  );

create policy "Users can link their posts to circles" on public.post_circles
  for insert with check (
    exists (
      select 1 from public.posts
      where id = post_circles.post_id and user_id = auth.uid()
    )
  );

-- Reactions: read reactions on posts they can see. insert their own reactions.
create policy "Users can view reactions on visible posts" on public.reactions
  for select using (
    exists (
      select 1 from public.posts p
      where p.id = reactions.post_id and (
        p.user_id = auth.uid() or
        exists (
          select 1 from public.post_circles pc
          join public.circle_members cm on pc.circle_id = cm.circle_id
          where pc.post_id = p.id and cm.user_id = auth.uid() and cm.status = 'active'
        )
      )
    )
  );

create policy "Users can create their own reactions" on public.reactions
  for insert with check (reactor_user_id = auth.uid());

create policy "Users can delete their own reactions" on public.reactions
  for delete using (reactor_user_id = auth.uid());

-- Invitations:
create policy "Users can view invitations for their circles" on public.invitations
  for select using (
    exists (
      select 1 from public.circles
      where id = invitations.circle_id and admin_user_id = auth.uid()
    )
  );

create policy "Users can create invitations for circles they admin" on public.invitations
  for insert with check (
    exists (
      select 1 from public.circles
      where id = invitations.circle_id and admin_user_id = auth.uid()
    )
  );
