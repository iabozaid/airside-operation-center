-- IDENTITY & ADMIN
CREATE TABLE users (
  id UUID PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE roles (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE user_roles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE credentials (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  secret TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  rotated_at TIMESTAMPTZ
);

-- INCIDENTS
CREATE TABLE incidents (
  id UUID PRIMARY KEY,
  type TEXT NOT NULL,
  severity TEXT NOT NULL,
  state TEXT NOT NULL,
  correlation_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  closed_at TIMESTAMPTZ
);

CREATE TABLE incident_transitions (
  id UUID PRIMARY KEY,
  incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
  from_state TEXT NOT NULL,
  to_state TEXT NOT NULL,
  triggered_by TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL
);

-- TICKETS
CREATE TABLE tickets (
  id UUID PRIMARY KEY,
  incident_id UUID REFERENCES incidents(id),
  status TEXT NOT NULL,
  sla_deadline TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  closed_at TIMESTAMPTZ
);

CREATE TABLE ticket_assignments (
  id UUID PRIMARY KEY,
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  assignee_id UUID REFERENCES users(id),
  assigned_at TIMESTAMPTZ NOT NULL
);

-- FLEET
CREATE TABLE assets (
  id UUID PRIMARY KEY,
  asset_type TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL,
  last_heartbeat TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE asset_status_history (
  id UUID PRIMARY KEY,
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL
);

-- SIMULATION
CREATE TABLE scenarios (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  definition JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

-- AUDIT
CREATE TABLE audit_log (
  id UUID PRIMARY KEY,
  event_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  actor TEXT,
  occurred_at TIMESTAMPTZ NOT NULL
);
