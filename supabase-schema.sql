-- TypeMaster Pro Supabase Database Schema

-- 1. Create Profiles Table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    role TEXT NOT NULL DEFAULT 'user',
    username TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    wpm INTEGER DEFAULT 0,
    accuracy NUMERIC(5, 2) DEFAULT 0.00,
    practice_time INTEGER DEFAULT 0, -- in seconds
    streak INTEGER DEFAULT 0,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select for everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Allow update for profile owner or admin"
    ON public.profiles FOR UPDATE
    USING (
        auth.uid() = id 
        OR 
        (auth.jwt() ->> 'email') = 'kumarajeet19022004@gmail.com'
    )
    WITH CHECK (
        (auth.jwt() ->> 'email') = 'kumarajeet19022004@gmail.com'
        OR
        (auth.uid() = id AND role = 'user')
    );

CREATE POLICY "Allow users to insert their own profile" 
    ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);


-- 2. Create Typing Sessions Table
CREATE TABLE public.typing_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    wpm INTEGER NOT NULL,
    accuracy NUMERIC(5, 2) NOT NULL,
    level_type TEXT NOT NULL, -- 'beginner', 'intermediate', 'advanced', 'quote', 'coding', 'battle'
    duration INTEGER NOT NULL, -- in seconds
    errors INTEGER NOT NULL,
    chars_typed INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for Sessions
ALTER TABLE public.typing_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select for session owner or admin"
    ON public.typing_sessions FOR SELECT
    USING (
        auth.uid() = user_id 
        OR 
        (auth.jwt() ->> 'email') = 'kumarajeet19022004@gmail.com'
    );

CREATE POLICY "Allow insert for session owner"
    ON public.typing_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow update and delete for admin"
    ON public.typing_sessions FOR ALL
    USING ((auth.jwt() ->> 'email') = 'kumarajeet19022004@gmail.com');


-- 3. Create Challenge Progress Table
CREATE TABLE public.challenge_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    challenge_level INTEGER NOT NULL, -- 1 to 20
    wpm INTEGER NOT NULL,
    accuracy NUMERIC(5, 2) NOT NULL,
    completed BOOLEAN DEFAULT TRUE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, challenge_level)
);

-- Enable RLS for Challenge Progress
ALTER TABLE public.challenge_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to read their own challenges" 
    ON public.challenge_progress FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert/update their own challenges" 
    ON public.challenge_progress FOR ALL USING (auth.uid() = user_id);


-- 4. Create Achievements Unlocked Table
CREATE TABLE public.achievements_unlocked (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Enable RLS for Achievements
ALTER TABLE public.achievements_unlocked ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to read their own achievements" 
    ON public.achievements_unlocked FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow users to unlock achievements for themselves" 
    ON public.achievements_unlocked FOR INSERT WITH CHECK (auth.uid() = user_id);


-- 5. Create Multiplayer Rooms Table
CREATE TABLE public.room_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code TEXT UNIQUE NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'waiting', -- 'waiting', 'active', 'finished'
    category TEXT NOT NULL,
    target_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for Room States
ALTER TABLE public.room_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow room read access to anyone" 
    ON public.room_states FOR SELECT USING (true);

CREATE POLICY "Allow room creation to authenticated users" 
    ON public.room_states FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow room hosts to update room state" 
    ON public.room_states FOR UPDATE USING (auth.uid() = created_by);


-- 6. Create Room Players Table
CREATE TABLE public.room_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES public.room_states(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    username TEXT NOT NULL,
    wpm INTEGER DEFAULT 0,
    accuracy NUMERIC(5, 2) DEFAULT 0.00,
    progress_percent INTEGER DEFAULT 0,
    is_ready BOOLEAN DEFAULT FALSE,
    is_winner BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(room_id, user_id)
);

-- Enable RLS for Room Players
ALTER TABLE public.room_players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anyone to view players in a room" 
    ON public.room_players FOR SELECT USING (true);

CREATE POLICY "Allow players to insert their entry" 
    ON public.room_players FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow players to update their own status" 
    ON public.room_players FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Allow players to delete their entry" 
    ON public.room_players FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);


-- 7. Trigger to automatically create a profile for new auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_role TEXT := 'user';
BEGIN
    IF new.email = 'kumarajeet19022004@gmail.com' THEN
        default_role := 'admin';
    END IF;

    INSERT INTO public.profiles (id, email, role, username, avatar_url, level, xp, wpm, accuracy, practice_time, streak)
    VALUES (
        new.id,
        new.email,
        default_role,
        COALESCE(new.raw_user_meta_data->>'username', SPLIT_PART(new.email, '@', 1)),
        new.raw_user_meta_data->>'avatar_url',
        1,
        0,
        0,
        0.00,
        0,
        1
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
