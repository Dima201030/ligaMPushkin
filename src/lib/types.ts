export type CategorySlug =
  | "masters"
  | "challenger"
  | "futures"
  | "rookies"
  | "beginners"
  | "newcomers";

export type TournamentType =
  | "singles"
  | "doubles"
  | "mixed"
  | "final"
  | "cup"
  | "teams";

export type Surface = "hard" | "clay" | "grass" | "carpet";

export type TournamentFormat =
  | "olympic"
  | "round_robin"
  | "groups_playoff"
  | "double_elimination";

export type TournamentStatus =
  | "draft"
  | "registration_soon"
  | "registration_open"
  | "registration_closed"
  | "scheduled"
  | "live"
  | "completed"
  | "cancelled";

export type RegistrationStatus =
  | "pending"
  | "confirmed"
  | "waitlist"
  | "cancelled"
  | "rejected";

export type MatchStatus = "scheduled" | "live" | "completed" | "cancelled" | "walkover" | "bye";

export type UserRole = "player" | "organizer" | "owner" | "superadmin";

export interface Category {
  slug: CategorySlug;
  name: string;
  shortName: string;
  color: string;
  note: string;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  courts: number;
  surface: Surface;
}

export type ProfileVerificationStatus = "pending" | "approved" | "rejected";

export interface Player {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  gender: "male" | "female";
  birthYear: number;
  birthDate?: string;
  city: string;
  category: CategorySlug;
  rating: number;
  points: number;
  wins: number;
  losses: number;
  tournamentsCount: number;
  titlesCount: number;
  bestRank: number;
  trend: number[];
  bio: string;
  memberSince: string;
  status: "active" | "blocked" | "archived";
  verificationStatus?: ProfileVerificationStatus;
  phone?: string;
  avatarUrl?: string;
  /** Organizer-created player without login; merge with a registration application later. */
  isPlaceholder?: boolean;
  email?: string;
}

export interface Registration {
  playerId: string;
  partnerId?: string;
  lookingForPartner?: boolean;
  status: RegistrationStatus;
  seed?: number;
  registeredAt: string;
}

export interface TournamentWinner {
  place: 1 | 2 | 3;
  playerIds: string[];
}

export interface Tournament {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: TournamentType;
  category: CategorySlug;
  surface: Surface;
  format: TournamentFormat;
  status: TournamentStatus;
  startsAt: string;
  endsAt?: string;
  registrationOpensAt: string;
  registrationClosesAt: string;
  venue: Venue;
  entryFee: number;
  maxParticipants: number;
  coverUrl?: string;
  regulations: string;
  participants: Registration[];
  winners?: TournamentWinner[];
  season: number;
}

export interface MatchSide {
  playerIds: string[];
  seed?: number;
  label?: string;
}

export interface Match {
  id: string;
  tournamentId: string;
  tournamentSlug?: string;
  tournamentTitle: string;
  type: TournamentType;
  stage: string;
  round: string;
  scheduledAt: string;
  court?: string;
  status: MatchStatus;
  side1: MatchSide;
  side2: MatchSide;
  score?: string;
  winner: 1 | 2 | null;
  isDoubles: boolean;
  /** Optimistic concurrency token from the API. */
  version?: number;
}

export interface NewsPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string[];
  coverUrl: string;
  publishedAt: string;
  tag: string;
  author: string;
  readingTime: number;
}

export interface ClubEvent {
  id: string;
  slug: string;
  title: string;
  kind: "tournament" | "camp" | "school" | "club";
  description: string;
  startsAt: string;
  location: string;
  coverUrl?: string;
  seatsLeft?: number;
}

export interface RankingEntry {
  position: number;
  previousPosition: number;
  playerId: string;
  points: number;
  rating: number;
  category: CategorySlug;
}

export interface PlayerTitle {
  year: number;
  tournamentTitle: string;
  type: TournamentType;
  place: 1 | 2 | 3;
}

export interface TournamentDraft {
  title: string;
  description: string;
  type: TournamentType;
  category: CategorySlug;
  surface: Surface;
  format: TournamentFormat;
  startsAt: string;
  registrationClosesAt: string;
  entryFee: number;
  maxParticipants: number;
  venueId: string;
  regulations: string;
}

export interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  entity: string;
  createdAt: string;
}
