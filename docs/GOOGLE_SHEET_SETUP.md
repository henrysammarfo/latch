# Google Sheet setup — exact steps (LATCH Risk Ledger)

You already finished Search Console + OAuth branding. This is the **last Google piece** the app needs: a Spreadsheet ID.

Reply in chat with **only** the Spreadsheet ID (no secrets). Format: the `<THIS>` part of  
`https://docs.google.com/spreadsheets/d/<THIS>/edit`

---

## Step 1 — Open Sheets

1. Go to [https://sheets.google.com](https://sheets.google.com) while signed into the **same Google account** you used for Latch OAuth.
2. Click **Blank spreadsheet** (or **Blank**).

## Step 2 — Name it

1. Click **Untitled spreadsheet** (top left).
2. Type exactly: `LATCH Risk Ledger`
3. Press Enter.

## Step 3 — Header row (row 1)

1. Click cell **A1**.
2. Paste this single line into the formula bar (or type across columns A–I):

```
run_id	account	arr_at_risk	status	slack_ts	sheet_range	cal_event_id	gmail_draft_id	updated_at
```

(If paste lands in one cell: Data → Split text to columns → Separator = Tab.)

Your row 1 must look like:

| A | B | C | D | E | F | G | H | I |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| run_id | account | arr_at_risk | status | slack_ts | sheet_range | cal_event_id | gmail_draft_id | updated_at |

Leave row 2+ empty. Latch writes new play rows under this header.

## Step 4 — Copy the Spreadsheet ID

1. Look at the browser address bar. It looks like:

```
https://docs.google.com/spreadsheets/d/1AbC...xyz/edit#gid=0
```

2. Copy **only** the middle segment between `/d/` and `/edit`  
   Example shape: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`  
   (yours will be different — that long string is the ID).

3. Reply in chat with **just that ID**. Do not paste OAuth secrets.

## Step 5 — What the operator does next (not you in UI)

Once you send the ID, it gets set as:

`GOOGLE_SHEETS_SPREADSHEET_ID=<your-id>`

on Vercel for project `latch`, then the site is redeployed.  
Check: [https://latch.tryopal.asia/api/health](https://latch.tryopal.asia/api/health) → Google connector `configured: true`.

---

## Notes

- This Sheet is the **risk ledger** for save plays (operator Google connection).
- It is **not** how people sign up. User accounts use **email + password** only. No Google login for Latch accounts.
- Share the Sheet with the Google account that completed OAuth if they differ (Editor access).
