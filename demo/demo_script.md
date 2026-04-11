# Demo Script — EPL Squads & Matches

Total time: ~8 minutes. Read the **SAY** parts out loud. Do the **DO** parts.

---

## SETUP (before demo starts)

Open these 5 windows:

1. Backend terminal — `npm run dev` in `backend/`
2. Frontend terminal — `npm run dev` in `frontend/`
3. Browser — `localhost:5173`
4. psql Terminal A — `psql -p5432 epl`
5. psql Terminal B — `psql -p5432 epl`

---

## PART 1: Show the App (2 min)

**DO:** Show the browser.

**SAY:** "This is my EPL Squads and Matches app. The frontend is React, the backend is Express with TypeScript, and the database is PostgreSQL 17. It has two roles — users can browse data, and admins can update records. My two database focus areas are B-tree indexes and MVCC."

**DO:** Click **Teams**. Make sure season is `2023-24`.

**SAY:** "This is the Teams page. It shows all 20 Premier League teams for the 2023-24 season."

**DO:** Click **Arsenal FC**. You'll see the Squad tab.

**SAY:** "This is the Squad tab. It shows all the players on Arsenal's roster, sorted by position and shirt number — goalkeepers first, then defenders, midfielders, forwards."

**DO:** Click the **Matches** tab.

**SAY:** "This is the Matches tab. It shows all of Arsenal's games that season, ordered by date. Green scores mean they won, red means they lost."

**DO:** Click **Player Search**. Type `Bruno`. Click Search.

**SAY:** "This is Player Search. It does a case-insensitive name search. If I search 'Bruno', it finds Bruno Fernandes at Manchester United and Bruno Guimaraes at Newcastle."

**DO:** Click **Admin**. Enter Player ID `685`, Birth Year `1999`. Click Update.

**SAY:** "This is the Admin page. Admins can update player info and match scores. I'm changing Bruno Fernandes' birth year from 1994 to 1999."

**DO:** Go to **Player Search**, search `Bruno` again to verify the change.

**SAY:** "If we search Bruno again, we can see the birth year is now 1999. I'll change it back."

**DO:** Go to **Admin**, enter Player ID `685`, Birth Year `1994`. Click Update.

---

## PART 2: EXPLAIN Plans (3 min)

**SAY:** "Now let me show what PostgreSQL does internally when these queries run. I'll use EXPLAIN ANALYZE to show the execution plans."

---

### 2.1 Player Search

**DO:** Switch to psql Terminal A. Run:

```sql
\i /Users/simouchen/Documents/MasterYear/DSCI551/Project/DSCI_551_Individual_Project/demo/explain_player_search.sql
```

**SAY:** "This is the execution plan for the player search query. You can see it says **Seq Scan on players** — that means PostgreSQL checked every single row in the players table, all 1,041 of them. That's because the search uses ILIKE with a leading wildcard '%bruno%', so the B-tree index can't help here."

**SAY:** "But right below that, you can see **Index Scan on squad_memberships** — when it joins the matching players to their squad records, it does use the index. So this one query shows both cases — when B-tree helps and when it can't."

---

### 2.2 Match History

**DO:** Run:

```sql
\i /Users/simouchen/Documents/MasterYear/DSCI551/Project/DSCI_551_Individual_Project/demo/explain_match_history.sql
```

**SAY:** "This is the match history query. It has an OR condition — home team OR away team. PostgreSQL handles this with a **BitmapOr** — it scans two indexes separately, one for home and one for away, then combines the results. This way it only reads a few pages instead of scanning all 733 rows."

---

### 2.3 Squad View

**DO:** Run:

```sql
\i /Users/simouchen/Documents/MasterYear/DSCI551/Project/DSCI_551_Individual_Project/demo/explain_squad.sql
```

**SAY:** "This is the squad query. You can see it uses a **Bitmap Heap Scan** with my composite index on squad_memberships to quickly find all players on Arsenal for 2023-24 — it only reads the rows it needs instead of scanning the whole table. Then it does a quick in-memory sort for the custom position order."

---

## PART 3: MVCC Demo (3 min)

**SAY:** "My second focus area is MVCC — Multi-Version Concurrency Control. This is how PostgreSQL handles concurrent reads and writes. Let me show this with two psql sessions."

---

### Step 1: Show current data

**DO:** Terminal A:

```sql
SELECT player_id, name, birth_year FROM players WHERE player_id = 685;
```

**SAY:** "This is Bruno Fernandes, born 1994. I'll simulate an admin updating his birth year in this terminal, while a user is reading from another terminal."

---

### Step 2: Admin starts updating

**DO:** Terminal A:

```sql
BEGIN;
UPDATE players SET birth_year = 1999 WHERE player_id = 685;
```

**SAY:** "The admin started a transaction and changed the birth year to 1999. But the transaction is not committed yet."

---

### Step 3: User reads from another session

**DO:** Terminal B:

```sql
SELECT player_id, name, birth_year FROM players WHERE player_id = 685;
```

**SAY:** "Look — Terminal B still shows birth_year 1994, the old value. The reader is not blocked at all. PostgreSQL keeps the old version of the row around so other transactions can still see it. That's MVCC."

---

### Step 4: Admin commits

**DO:** Terminal A:

```sql
COMMIT;
```

**SAY:** "Now the admin commits the change."

---

### Step 5: User reads again

**DO:** Terminal B:

```sql
SELECT player_id, name, birth_year FROM players WHERE player_id = 685;
```

**SAY:** "Now Terminal B sees 1999. The updated value only becomes visible after the commit. That's how MVCC works — readers and writers don't block each other."

---

### Step 6: Restore

**DO:** Terminal A:

```sql
UPDATE players SET birth_year = 1994 WHERE player_id = 685;
```

**SAY:** "And I'll restore the original value."

---

## PART 4: Done

**SAY:** "To recap — this app uses PostgreSQL's B-tree indexes to speed up player lookups and match history queries, and it uses MVCC so that admin updates don't block users who are reading data at the same time. Those are my two focus areas. That's it."

---

## If asked

- **"Could you use a different index for the ILIKE search?"** — "Yes, PostgreSQL has a trigram extension called pg_trgm that supports ILIKE with a GIN index. I used the default B-tree to show the contrast."
- **"What happens to the old row versions?"** — "They pile up as dead tuples. PostgreSQL has autovacuum that cleans them up automatically."
- **"What if two admins update the same player?"** — "The second one blocks until the first commits or rolls back. MVCC handles read-write conflicts, not write-write."
