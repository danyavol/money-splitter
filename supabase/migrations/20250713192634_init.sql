-- Enable UUID generation (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- USERS
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    photo_url TEXT,
    created_at TIMESTAMP DEFAULT now()
);

-- GROUPS
CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    photo_url TEXT,
    main_currency TEXT NOT NULL DEFAULT 'USD',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT now()
);

-- GROUP MEMBERS
CREATE TABLE group_members (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
   user_id UUID REFERENCES users(id), -- Optional
   nickname TEXT NOT NULL,
   joined_at TIMESTAMP DEFAULT now()
);

CREATE UNIQUE INDEX unique_group_user
ON group_members(group_id, user_id)
WHERE user_id IS NOT NULL;

-- Fetch all members of a group
CREATE INDEX idx_group_members_group_id ON group_members(group_id);

-- Look up groups for a specific user
CREATE INDEX idx_group_members_user_id ON group_members(user_id);

-- EXPENSES
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    date TIMESTAMP NOT NULL DEFAULT now(),
    amount NUMERIC(12, 3) NOT NULL CHECK (amount > 0),
    currency TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);

-- Fetch all expenses in a group
CREATE INDEX idx_expenses_group_id ON expenses(group_id);

-- EXPENSE PAYERS (multi-payer support)
CREATE TABLE expense_payers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES group_members(id),
    amount_paid NUMERIC(12, 3) NOT NULL CHECK (amount_paid > 0)
);

-- For resolving who paid for what
CREATE INDEX idx_expense_payers_expense_id ON expense_payers(expense_id);
CREATE INDEX idx_expense_payers_member_id ON expense_payers(member_id);

-- EXPENSE PARTICIPANTS (split targets)
CREATE TABLE expense_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES group_members(id),
    amount_owed NUMERIC(12, 3) NOT NULL CHECK (amount_owed >= 0)
);

-- For calculating who owes what
CREATE INDEX idx_expense_participants_expense_id ON expense_participants(expense_id);
CREATE INDEX idx_expense_participants_member_id ON expense_participants(member_id);

-- TRANSFERS (manual payments between group members)
CREATE TABLE transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    from_member_id UUID NOT NULL REFERENCES group_members(id),
    to_member_id UUID NOT NULL REFERENCES group_members(id),
    title TEXT,
    date TIMESTAMP NOT NULL DEFAULT now(),
    amount NUMERIC(12, 3) NOT NULL CHECK (amount > 0),
    created_at TIMESTAMP DEFAULT now()
);

-- For listing transfers in a group
CREATE INDEX idx_transfers_group_id ON transfers(group_id);

-- GLOBAL EXCHANGE RATES (USD-centric)
CREATE TABLE exchange_rates (
    from_currency TEXT NOT NULL,
    to_currency TEXT NOT NULL CHECK (to_currency = 'USD'),
    rate NUMERIC(18, 8) NOT NULL CHECK (rate > 0),
    source TEXT,
    retrieved_at TIMESTAMP NOT NULL,
    PRIMARY KEY (from_currency, to_currency)
);

-- GROUP-SPECIFIC EXCHANGE RATES (symmetric)
CREATE TABLE group_exchange_rates (
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    from_currency TEXT NOT NULL,
    to_currency TEXT NOT NULL,
    rate NUMERIC(18, 8) NOT NULL CHECK (rate > 0),
    created_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY (group_id, from_currency, to_currency)
);

-- Quickly find rates for a group
CREATE INDEX idx_group_exchange_rates_group_id ON group_exchange_rates(group_id);

-- GROUP ACTIVITY LOG
CREATE TABLE group_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    performed_by UUID REFERENCES group_members(id),
    action_type TEXT NOT NULL,
    target_type TEXT,
    target_id UUID,
    details JSONB,
    created_at TIMESTAMP DEFAULT now()
);

-- Common filters: group feed, recent changes
CREATE INDEX idx_group_activity_log_group_id ON group_activity_log(group_id);
