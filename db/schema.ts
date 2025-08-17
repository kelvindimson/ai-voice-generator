import { boolean, timestamp, pgTable, text, primaryKey, integer, numeric } from "drizzle-orm/pg-core"
import type { AdapterAccountType } from "@auth/core/adapters"

const createdAtTimestamp = timestamp("created_at", {withTimezone: true}).defaultNow().notNull();
const updatedAtTimestamp = timestamp("updated_at", {withTimezone: true});
const deletedAtTimestamp = timestamp("deleted_at", {withTimezone: true});
 
export const users = pgTable("user", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
})
 
export const accounts = pgTable( "account", {
    userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  }, (account) => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    },
  ]
)
 
export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})
 
export const verificationTokens = pgTable( "verificationToken", {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    {
      compositePk: primaryKey({
        columns: [verificationToken.identifier, verificationToken.token],
      }),
    },
  ]
)
 
export const authenticators = pgTable("authenticator",{
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId").notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => [
    {
      compositePK: primaryKey({
        columns: [authenticator.userId, authenticator.credentialID],
      }),
    },
  ]
)

export const roles = pgTable("role", {
    id: text("id").primaryKey(),
    name: text("name").notNull().unique(),
    description: text("description"),
    isSystem: boolean("is_system").default(false), // To mark default system roles
    createdAt: createdAtTimestamp,
    updatedAt: updatedAtTimestamp,
    deletedAt: deletedAtTimestamp,
});

export const userRoles = pgTable("user_role", {
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    roleId: text("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
    createdAt: createdAtTimestamp,
    updatedAt: updatedAtTimestamp,
    deletedAt: deletedAtTimestamp,
}, (table) => ([
    primaryKey({ columns: [table.userId, table.roleId] }),
]));

export const categories = pgTable("category", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: createdAtTimestamp,
  updatedAt: updatedAtTimestamp,
});

// Audio Files table
export const audioFiles = pgTable("audio_file", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  categoryId: text("category_id").references(() => categories.id, { onDelete: "set null" }),
  
  // File info
  name: text("name").notNull(),
  fileUrl: text("file_url").notNull(), // Supabase storage URL
  fileKey: text("file_key").notNull(), // Storage path/key
  fileSize: integer("file_size"), // in bytes
  duration: numeric("duration", { precision: 10, scale: 2 }), // in seconds
  
  // Generation parameters
  inputScript: text("input_script").notNull(), // The text to be spoken
  voice: text("voice").notNull(), // Voice model used
  promptInstructions: text("prompt_instructions"), // The prompt/instructions
  
  createdAt: createdAtTimestamp,
  updatedAt: updatedAtTimestamp,
  deletedAt: deletedAtTimestamp,
});