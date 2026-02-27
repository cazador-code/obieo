# Transcript Inbox (Raw)

Paste Loom transcript chunks here first. Keep raw text intact.

Historical context note: raw transcript tool references (including `Octoparse`) may describe older workflows. Current default process uses the revised internal scraper workflow.

---

## Entry Template

### Transcript Entry

- Source link:
- Video title:
- Approx date recorded:
- Speaker(s):
- Stage guess:
  - sales
  - onboarding
  - fulfillment
  - retention
  - churn-offboarding
  - mixed

### Raw Transcript

Paste full raw transcript text below this line.

### Quick Extraction Notes

- Core process steps:
- Tools mentioned:
- Handoffs mentioned:
- Risks mentioned:
- Metrics mentioned:
- Unknowns/questions:

---

## Entries

### Transcript Entry

- Source link: not provided yet
- Video title: onboarding a new client into their sub-account
- Approx date recorded: unknown
- Speaker(s): seller/operator (name not provided)
- Stage guess:
  - mixed (onboarding + fulfillment routing)

### Raw Transcript

0:00 I am going to be walking you through how to onboard a new client into their new sub-account. So, uhm, just for an example here, we're gonna have Rodrigo, who needs to be onboarded into his own account.
0:18 And, as a reminder, each sub-account hosts five client seats. So, whenever a new client comes in, you're just gonna wanna go ahead and go into the All Client Types tab.
0:30 Inside of Airtable, you'll see the New Client Spreadsheet row right here. All you wanna do, essentially, is just look at what industry they're in.
0:40 And then you're gonna go to the sub-accounts pertaining to that industry. So, we have, right now, two sub-accounts for, uh, painting.
0:48 What you do is, you just wanna either add it to a empty seat, if there's only four clients inside that sub-account.
0:56 Or, um, if there is five seats, but we have somebody who's marked as off-board, you wanna replace that seat with a new client.
1:05 And I'll show you, and walk you through how to do that right now. So, we're inside Airtable. The industry sub-account, if you go back to the spreadsheet here, you can see we have five clients inside the sub-account.
1:20 So that means there's five seats taken. Um, but we have one person that's marked as off-board, and another person that's marked as car-filled.
1:28 Um, I always prioritize getting rid of the client that's marked as off-board, um, but depending on how many clients you have, you could off-board the car-filled or the one that's obviously marked as off-board as well.
1:43 All you want to do, and this is the process that I do it, you want to drag this all the way up here.
1:55 It'll drag it right next to the person that you're going to replace. So, the way these are structured. Is that every client from all the way at the top to the bottom are structured in a way that determines what seats take.
2:09 So Juan here is taking up seat one, inside sub-account one for painting. So the person we're going to be replacing is the person who's at seat number five, or slot number five, who's COD.
2:24 Perez. We're going to be replacing his data with Rodrigo's to on Rodrigo Canelo. And how we're going to do that is you want to enter the sub-account, you'll go down to custom values.
2:37 And the way we structure our clients are in two different formats. So we structure them in custom values. And the reason it's important to put their correct information and replace it is because that's how they're going to get their lead information.
2:50 So, uh, what we want to do is we'll go to seat number five, edit custom value. And then you open up the record of the person you're onboarding.
3:05 And here's the information you'll want to receive. Most of the time, it'll be the same, but you only want to pull it from this field right here.
3:13 Email address to receive lead notifications. You'll copy that, and then you'll paste it right in here. You'll click update, and of course, if there isn't five seats already taken, you'll just do the same process, but instead of replacing, you're just going to be adding to slots that haven't been used
3:34 before. So, Thank We just added, or replaced, the old client's email. Now, we're going to be doing the same for their phone number.
3:45 So, we'll go here, edit custom value, open up the new client's record, and select the field that says cell phone to receive lead notifications.
3:58 You're going to want to copy that, and we're going to replace the phone number inside slot number 5 for this client.
4:04 So, that's the first step, is you want to replace all the information for contact info inside the custom value section.
4:12 Then, you're going to want to go back into the automation section, and then go into the SMS campaign workflows. You'll click into that folder, you'll go into the second folder, would you think?
4:25 It's called Fulfillment, Notifications, Leads, Notify Client, and Charge Card. This is the second and final step to onboarding slash replacing a client seat.
4:40 You'll go to the number of client that we replaced, in this case we replaced the person who was in slot number 5.
4:46 It'll go here. Into this section, and all we're doing essentially is the way this routing works is whenever the client gets a lead, it'll get routed through this network, and depending on the tag, slash their business name, it'll go to that slot, and the way they get notified is using those custom values
5:08 that we just replaced. So if we go here to quantum mechanics. Client slot number 5, go here, client 5, and to tags, you want to delete the tag that was there for the previous client, and the tag that we're going to be using for the new client is just their business name.
5:29 Import that tag in, add new tag, save action, save. And that's it. Now we're done either onboarding a new client into an empty seat, or replacing a previously used seat with a new client.
5:47 That's all there is to it. If you have any questions, remember to hit up your support channel on Slack, or you can text me directly on Slack as well.

### Quick Extraction Notes

- Core process steps:
  - Determine industry in Airtable `All Client Types`.
  - Pick industry sub-account (capacity = 5 seats).
  - If full, replace off-boarded client first.
  - Keep row/seat ordering aligned (top-to-bottom determines seat index).
  - In sub-account custom values, update seat-specific email and phone.
  - In automation workflow, update slot tag from old client to new client business name.
- Tools mentioned:
  - Airtable (`All Client Types`, new client row)
  - Sub-account custom values
  - Automation folder: `SMS Campaign Workflows > Fulfillment Notifications Leads Notify Client and Charge Card`
  - Slack support channel
- Handoffs mentioned:
  - Operations owner completes onboarding updates.
  - Support questions routed via Slack.
- Risks mentioned:
  - Replacing wrong seat due to bad row ordering.
  - Pulling contact data from wrong Airtable fields.
  - Forgetting to update workflow tag after custom value replacement.
  - Keeping old client tag causes lead routing to wrong recipient.
- Metrics mentioned:
  - Implicit seat capacity per sub-account (5).
  - No explicit KPI names were given in this clip.
- Unknowns/questions:
  - Clarify exact meaning of status term that sounded like "car-filled."
  - Confirm official naming convention for the business-name tag.
  - Confirm whether email and SMS custom values are the only required seat-level values.

### Transcript Entry

- Source link: not provided yet
- Video title: Client Scripting Process: Step-by-Step Guide
- Approx date recorded: unknown
- Speaker(s): seller/operator (name not provided)
- Stage guess:
  - fulfillment

### Raw Transcript

00:00 Hey, what's going on? I'm going to be showing you guys exactly how to go through and do the scripting process for each client.
00:09 So, at the beginning of your shift, every single day, you want to go into Error Table and look at the needs column.
00:16 First thing you're going to do is just go one by one down the list, scraping contacts. So what you're going to want to do, let's do David.
00:26 Here's an example. We'll scrape prayer. So first thing is you want to scroll down. To zip code to target. And these are the zip codes.
00:35 We haven't scraped for him yet that he wants to target. So what we're going to do is we're going to copy the next one up.
00:43 We're going to go to deal machine and make sure that your previous scrape through. This is deleted off of deal machine.
00:55 So that's deleted. What you're going to want to do is search up the zip code that he wants to target, which is this one, and you're going want to use the target.
01:15 You're going to want to click build that list.
01:36 Now, for each list that you want to build, you want it to be close to 10,000. Uhm, above 20,000 is, you know, too much.
01:46 You want to just keep each list that you're scraping for each client in between 10 to 15 thousand, although, if they are packaged clients, you might as well scrape if they need, if they're on the 40 package.
02:01 Let's see what this guy's on. on the 40 lead package, you can scrape up to 40 thousand contacts, but that's going to take a while.
02:15 So I usually just scrape 10 to 15 thousand per zip code. If you need, if for example, this zip code that we just scraped didn't have this much properties or properties, I would add a second one.
02:28 So once you've done that, once you've built the list of that zip code, you want to go here and delete the zip code from the zip code to target to zip code scraped.
02:40 And you want to go into your lead section. Once you're in your in your lead section, you want to make sure that everything is popular in the end thousands since you're in your 30 needs.
02:51 Sweet. Now what you're going to want to do. Is go into your deal machine folder that you just set up.
03:00 Remember, there should be nothing. Other than these couple things there. You want to do new terminal out folder. You want to node shrek.js.
03:11 And it's going to launch the browser with persistent data. Boom, it's going to launch deal machine. We're going to want to to launch in again.
03:28 And then it will start scraping. Boom, it's 10 seconds per page. . The in-between pages, so it found a hundred records, it scraped the first page, and as you can see here, it's going to slow, we start scraping every other page.
03:55 Or not slowly, it's relatively quick, or most, for the most other lead scraping. Pools. And you can see, it's just going to go page by page, like I said, 10 seconds in between pages.
04:09 All you want to do is wait until it finishes. If you do need to stop it, it's going to be control C.
04:16 But you- You want to wait until it scrapes every single page, and it'll stop by itself. So I'll let it scrape a couple more, just for the sake of the example, so that it can show you the next steps.
04:31 But that is how you- chooses to go to Target, upload a list, and start scraping. Pull that scrape by page.
04:48 You just want to script this 5th page, we are gonna move on. Sweet. So Control C to stop it. And once you finish the scrape, then you shouldn't stop it.
04:59 You're going to see something like this pop up. It's gonna be many scrape kills all pages. You're going to want to rename it the zip code that, I think it was this one.
05:13 3-2-0-3. Yes. And then the client. The 3-2-0-3, David.
05:24 And then I usually just put it on my desktop, on the browser. user. And then what you want to do, is you want to open up a sheet.
05:42 A brand new sheet. You're going to import that file on your desktop. stuff. Into sheets. And then what you're going to do, is you're going to clean up the data.
06:00 So I delete these four. This is the street address. This is the city state zip code. This is the name.
06:09 This is the phone. Everything else I get rid of. Like so. And then here's what we're going to do with this.
06:19 So the phone will keep this. Go over the tools. You'll go to, shhh, extensions. You're gonna use power tools. Start.
06:34 part. You're on a split, split names, and then you're just gonna do first, middle elastic. Split, and then you're gonna let it finish the process completely.
07:12 Not that hard. Okay, so once it finishes processing it looks something like this, then I delete the format. I name this one the first name.
07:27 I get rid of- the middle name or the middle edition, and I put last name. And then all you're gonna want to do is for this, you know, I want to use power tools again.
07:44 And then for this, since the city has a space in it, you're gonna want to separate it by comma versus time, and then space after we do this one.
08:00 So you can see here it's separated a city from the state and zip code.
08:14 So now all you want to do is go to the comm- the state and zip code and then separate by space.
08:23 And don't click anything until it says it's- It's finished working. Good. I'm gonna get rid of Dewey Coleman. City. Code.
08:42 And you want to rename address to street address. Boom. So there we have it. We have their street address. There's, I guess, this is the other way around.
08:57 Street Address City State Zip Code. And you want to drag these over to here. And we name the header for phone two to phone number.
09:10 And then the last step, once you form any of the data correctly. And everything is in its correct column. Headers.
09:20 What you want to do, once everything is cleaned up, you want to click all. You want to go to filters.
09:28 And then you want to filter first name by blanks. And these little dashes right here. Click all. Except the. That's And then you just want to delete everything that doesn't, that it's empty or has those two.
09:42 But we have a full sheet of contacts to clean up their front armor. So what you want to do is again.
09:52 Just name it, it's a code, a set, not code. You could do, uh, formatted, but.
10:08 No, not code. Let's go. So you download this. You go to, plan later, remover. I'm sorry. Once you're inside of an online remover, you're only going to bulk upload and then drag and drop.
10:39 health. The CSV you just made into that section. Again. Couple of flower file, select phone column, phone number, process, process.
10:56 Now make sure, I'd have to double check again, but you want to make sure that you only get the TNC and- And, second here.
11:20 DNC. The only thing you want to get rid of are toll-free numbers, VoIPs, and- Obviously, invalid and litigators. So the main thing is just DNC's and litigators, although DNC doesn't matter as much, you really want to make sure you don't get any litigators up.
11:41 So that's the most important thing. You have to watch out for litigators. Trying to find how you make that change.
11:53 change. I'd have to check, but you, there's a setting inside of a line, line line remover, where you want, you make sure, and this is, you only have to set it up on.
12:16 One time, where you make sure that you only get the output. Ah, there we go. So you want to make sure your output and files give you line type and D&C type all.
12:27 They give you everything. Okay? Not just clean it, but all. We're gonna clean it up for you. Later. So as you can see here, this is the CSV we uploaded earlier.
12:38 We want to download the output file. And all we want to do is click import. Upload. We want it. Import the sheet that we just cleaned, replace current sheet.
12:53 Boom. And all we're doing here is going to square our filters, TNC, and get in red of litigators. This is the most important step in this is making, make sure you get red of the litigators.
13:07 You want to do the weak to select the rose. Boom. Now that it's cleaned up. You want to just get rid of this stuff.
13:20 You want to name it correctly, download, go into Slack. back. Go into submission team.
13:42 And make sure you upload, again, the name of the client. All right. Boom. Upload that, and then in GHL, you want to upload and set up the workflow how I explained it in the other videos.
14:04 That is how you use the scraper.

### Quick Extraction Notes

- Core process steps:
  - Start every shift in `Error Table` and clear `needs` queue.
  - Build DealMachine list by target ZIP with list-size guardrails.
  - Run local scraper (`node shrek.js`) and let all pages complete.
  - Rename/export CSV by ZIP + client.
  - Normalize columns in Google Sheets using Power Tools.
  - Run Landline Remover and keep full output metadata.
  - Filter out litigators and other disallowed records.
  - Upload cleaned file to Slack `submission team` and then to GHL.
- Tools mentioned:
  - Airtable (`Error Table`, ZIP tracking fields)
  - DealMachine
  - Local scraper script (`node shrek.js`)
  - Google Sheets + Power Tools extension
  - Landline Remover
  - Slack (`submission team`)
  - GHL
- Handoffs mentioned:
  - Fulfillment operator submits cleaned list to team via Slack.
  - Downstream workflow setup continues in GHL.
- Risks mentioned:
  - List-size overrun causes delays.
  - Incomplete scrape if stopped early.
  - Bad column cleanup can break downstream imports.
  - Failing to remove litigators creates compliance risk.
  - Wrong naming/upload can misroute client data.
- Metrics mentioned:
  - Implicit scrape cadence by queue depth and list size.
  - Approx scrape pacing (~10 seconds between pages).
  - Package-linked volume guidance (e.g., 40-lead package).
- Unknowns/questions:
  - Confirm exact accepted filter policy for DNC records.
  - Confirm final required column schema for GHL import template.
  - Confirm canonical filename convention.

### Transcript Entry

- Source link: not provided yet
- Video title: Uploading Contacts Made Easy
- Approx date recorded: unknown
- Speaker(s): seller/operator (name not provided)
- Stage guess:
  - fulfillment

### Raw Transcript

0:01 Hey, in this video I'm going to be showing you how to upload contacts into people who need them. So, how you're gonna know that people need them are two things.
0:13 Uh, in the SMS client sheet you're gonna have a couple things, a couple of options you're gonna be able to edit.
0:19 And what you're gonna be able to edit is this, right? You're not gonna edit yourself, you're just gonna know what each means.
0:25 This is for, you know, the rest of the team to get contacts for them. But if they're marked needs help, that means they have contacts ready for them to be uploaded into their stated dedicated sub account.
0:38 They're already verified and everything and how you do that is you'll also get tagged in here. So for every client that needs contacts, they'll be marked waiting for contacts.
0:47 Once the rest of the team gets contacts for them, they'll mark them as needs help. And then the team will not if I you once that client is ready to go in the client Contact list is ready to be uploaded for the clients designated type account now Let's say we'll do this for an example.
1:06 Let's say Joshua Montes is next right after I've cleared the rest of the people And Joshua Montes is the next person that has the needs help section So Joshua Montes this column is to see what sub account they're on so Joshua is in sub account 18, I'll go ahead and find them here and there's two things
1:27 . So view thread will be here, right? You want to click on the client's name, you want to click on the thread and you want to download the CSV sheet.
1:40 So you want to download that CSV sheet from the submission team tab, you'll get tagged with the client's name and that's how you know where the contacts are and how many contacts it is and if it's ready.
1:55 So you'll find the context name, you'll download the sheet and then you go to Go High Level, you'll go to the client's sub account, you'll go down the context, you'll click import context, next, upload, you select the contacts or the clients Let's see if it's context, you click next.
2:19 You make sure everything's mapped here. You need to make sure if it's not automatically mapped already, there's a few wrong things with it, and then you notify your supervisor or me, how you do that, just to make sure whenever you're uploading everything is automatically mapped, and everything is in
2:38 the correct column, then you click next, and then here's what this is very important. So the first thing you're going to want to do is you want to copy the first zip code that appears here.
2:51 Right, you want to copy that. You want to click Add Text in Port of Context. You want to click this.
2:57 You want to paste the zip code you just copied from here. You want to click Add. If it's already there, notify me because that might mean it's duplicated.
3:07 and we don't want to send out to those contexts, but you want to copy and paste that zip code into here, and then you're going to want to open up the client here in this arrow, open task, legal business name you're going to want to copy that, and then you want to paste it in here.
3:28 It's very important you do this because if you do not do this, the AI will not be able to identify for which client it's for, And it'll all be useless because the client will not get any of the leads once the people respond So it's very important you do this or else we won't be able to route the leads
3:45 properly to each client Watch the other videos if you in case you forgot how the lead routing works But this is how you upload them right so you want to do the zip code at the top and then the clients business name right here Not the clients name the clients legal business thing.
4:02 You just want to copy whatever's in here Now, you will make sure everything is good. You'll click start bulk input, import.
4:11 Now, there's a couple things. Sometimes if it says, if it stays stuck at processing zero percent, you want to go here pause and then you'll unpause it, or immediately you just want to see if it's uploading.
4:22 If it's uploading immediately, you're good to go. If it's not uploading, that means the headers of the CSV aren't how they're supposed to be, and you need to contact me.
4:32 Or if you already know how to fix that, I'll probably teach you if it ever happens on how to do that But you'll just wait for this to upload and then we'll wait for step two Cool.
4:42 So once the import is completed You want to go here and you'll just want to verify that The import imported context has the clients name in the zip code you just uploaded now You're going to want to go to more filters tag go here and then you want to oh looks like I actually pasted the wrong thing first
5:10 thing is you want to copy the zip code you just uploaded right you want to copy that tag and you want to filter them by that zip code boom there we go So, once it's filtered and it only shows the people you just imported with this specific zip code, you want to go see how many contacts it has, we want
5:36 around 2,000 contacts at least. If it's less, you have to go back and mark them as waiting for contacts so we can get a new sheet for them.
5:45 Asap, nonetheless, you still want to upload them. So you'll click this right here, you'll click select all records. you'll want to do add to automation.
5:55 Proceed. The automation and you want to make sure you click this one is Outreach, right? Then you click add in drip mode and then you name it.
6:05 The client's name and the lizard code you're doing. This you usually put it in Eastern time. That's just it doesn't really matter just as long as it's for 3 PM Eastern.
6:18 We'll do this. You will do 15 quantity repeat and this is subject to change. I will tell you if it is subject to change because it might be subject to change.
6:31 15 every 60 seconds Monday through Friday and then this This is the most important part, 3pm to 5pm.
6:43 Once everything is settled, you click Add Automation, you click OK, you make sure the automation is set, it's cute, here's what you'll want to do.
6:55 You want to go back into ClickUp, you want to mark the client from needs help to add KPI. That'll let me know and that'll let your supervisors know that the client is ready to go and they'll be receiving messages today.
7:12 So that'll let them know that, right? Boom, at KPI and then you'll go here and then you'll go to the submission team chat again and you'll mark this as ready.
7:26 So it'll have that little check mark just so you know you've already uploaded that CSV and there's nothing further to do with that CSV.
7:33 right and then you just move on to the next clients that have the needs help symbol and then you just go down the list one by one until you could figure out you know who is needed and if there's none needed then you're ready to go this should be done at the beginning of every single day or at the end
7:52 after your shift because we should have as many clients as possible up and running sending out messages every single day because when we add them to that workflow we just add of them, that's what's sending up the messages to get the leads interested.

### Quick Extraction Notes

- Core process steps:
  - Watch for `needs help` status in SMS client sheet and Slack tag in submission team.
  - Open client thread, download contact CSV, and import into the assigned GHL sub-account.
  - Validate import mapping; escalate if columns do not auto-map correctly.
  - Add required import tags:
    - first ZIP code from file
    - legal business name (not contact person name)
  - Start bulk import and monitor stuck `0%` cases.
  - Verify imported records by ZIP tag and count contacts.
  - If imported count is low (around <2,000), move status back to `waiting for contacts` for refill.
  - Add imported contacts to `Outreach` automation in drip mode with schedule constraints.
  - Update ClickUp status from `needs help` to `add KPI` and mark submission thread `ready`.
- Tools mentioned:
  - SMS client sheet
  - Slack `submission team` thread
  - GHL sub-accounts (`Contacts` import, tags, automation)
  - ClickUp status updates
- Handoffs mentioned:
  - Contact sourcing team marks clients `needs help`.
  - Upload operator imports, launches, and closes loop with `add KPI` + `ready`.
  - Supervisor notified on mapping/header anomalies.
- Risks mentioned:
  - Missing legal-business-name tag breaks lead routing.
  - Duplicate ZIP tag can indicate duplicate send risk.
  - Bad CSV headers can stall import at `0%`.
  - Wrong status transitions can leave client stuck and not messaging.
- Metrics mentioned:
  - Target imported contact volume is around 2,000 per upload.
  - Outreach default cadence shown: 15 every 60 seconds, Monday-Friday, 3pm-5pm Eastern.
- Unknowns/questions:
  - Confirm canonical status dictionary across tools (`waiting for contacts`, `needs help`, `add KPI`).
  - Confirm official default automation cadence and change-control owner.
  - Confirm exact duplicate-tag handling policy.

### Transcript Entry

- Source link: not provided yet
- Video title: Step 1: Data Scraping Process Explained
- Approx date recorded: unknown
- Speaker(s): seller/operator (name not provided)
- Stage guess:
  - fulfillment

### Raw Transcript

0:00 Hey, this is the start of day procedure that you're going to end up running every time you start working and you start your shift.
0:08 This is the following steps that you're going to do. So, the first thing you want to do is you want to go ahead and log in.
0:15 You're going this view of ClickUp and this is going to be, you know, the main section. So, I would, one, make sure to bookmark it on your bookmark bar because this is literally what you're going to look at every single morning before you do anything else.
0:29 The first thing you want to look at is your So, the people that ran out of contacts while you were either away or, you know, they ran out of contacts at night, they're going to be marked here waiting for contacts.
0:44 So, good rule of thumb is basically anyone who is someone who has this waiting for contacts tab here in the CS status section, that's who you know you need to scrape for, and that's who you know whose data you're pulling, and also you have their name, if you need their business info or anything like
1:01 that, you'll just open that up the section, and you'll be able to see it here, but as far as waking up in the morning to start your shift, or whenever you start your shift, you want to log in to ClickUp, go into this view, and see who needs more contacts.
1:16 Second step is, that's not who that's not it, right? You're not just scraping for the people who, at the beginning of the day, have this, because sometimes, in the middle of the day, people like Jay might run out of contacts, right? So, obviously, you want to check it in the morning, for people who slipped
1:33 by last night, or while you were out, or away, but also, inside the Zip Data Channel, I know there's nothing here now, but there will be, we'll be tagging you every single day, periodically, letting you know if people run out of data.
1:48 So, let's say, let's say, J runs out of data, your manager or somebody else will mark them as waiting for contacts, and then we'll tag you in the Slack Channel, letting you know the name of the person that says here that they, that they were marked for waiting, waiting for contacts.
2:07 And that's how you will know you need to scrape for them. So it's not just at the beginning of every day, but you'll also be periodically tagged if people run out of contact, contacts, throughout the day.
2:17 But good rule of thumb is just check it in the morning to see if you missed anyone. Or anything, because you do need it, to turn in the CSV sheet before 10 a.m.
2:25 Eastern.

### Quick Extraction Notes

- Core process steps:
  - Start each shift in the bookmarked ClickUp client view.
  - Scrape for any client marked `waiting for contacts` in CS status.
  - Do a morning sweep for overnight misses before doing anything else.
  - Monitor Slack `Zip Data Channel` for mid-day runouts and act on tagged alerts.
  - Submit required CSV sheet before 10:00 AM Eastern.
- Tools mentioned:
  - ClickUp main view (with CS status)
  - Slack `Zip Data Channel`
- Handoffs mentioned:
  - Manager/team marks clients `waiting for contacts` and tags operator in Slack.
  - Scrape operator acts on status + tags and submits CSV by deadline.
- Risks mentioned:
  - Morning-only check misses mid-day data depletion.
  - Ignoring `waiting for contacts` statuses delays lead generation.
  - Missing CSV deadline delays same-day outreach setup.
- Metrics mentioned:
  - Deadline: CSV submission before 10:00 AM Eastern.
  - Queue signal: number of clients marked `waiting for contacts`.
- Unknowns/questions:
  - Confirm exact CSV destination and filename standard for the 10:00 AM ET handoff.
  - Confirm expected Slack response SLA after `Zip Data Channel` tag.

### Transcript Entry

- Source link: not provided yet
- Video title: Step 3: Data Scraping Guide
- Approx date recorded: unknown
- Speaker(s): seller/operator (name not provided)
- Stage guess:
  - fulfillment

### Raw Transcript

0:00 So, how do you know what data to scrape? What zip codes to scrape exactly? And also, how do you determine how many zip codes to scrape, right?
0:10 How do you determine that? Well, it's all going to be inside of this table again. Like I said, this table is going to be one of your most important.
0:16 Tools to use, because really it's going to give you all the information you need on how to do everything, right?
0:23 So, let's revert this. That was our example for last time. But let's say, you know, we tagged you in the channel or you woke up and you just saw, that this was waiting for contacts, right?
0:36 So, what you'll do is, once you're ready to go, you understand who you have to scrape next. You're going to want to expand their tab by going to, the box next to their name and clicking this button, you expand it and you scroll down to these two sections.
0:54 Again, in the last one, I showed you which ones, are not scraped and which ones are scraped, right? So, you're just going to want to go up here and if they're waiting for contacts, that means we need to scrape from this bar up here, right?
1:10 So, we're just going to copy the most recent zip code And before we go into the software to upload it, we actually need actually want to see a couple things, right?
1:22 So, if, if you see on this section per week, how many appointments a week? If they say 15, whatever number they say, you want to Get around.
1:35 You know, a thousand contacts for each number. So, 15 would be around 15,000 contacts. anything above 10, you know, you just want to, kind of, do 10 to 15,000 at a time, because it, sometimes it's easier if the data does mess up.
1:52 But, you don't want to do too much, right, because the automation will break. So, you just want to do 10 to 20,000, or 10 to 15,000 at a time, contacts scraped.
2:03 So, maybe, maybe for some reason, some guys you might have to do two scrapes at a time, and that's fine.
2:10 But, you know, you want to get around 5 to 10,000 contacts from each scrape, right, and you want to get enough contacts to fulfill this number, right.
2:21 So if it's 30, for example, you just want to do 15,000 contacts the first scrape, and then 15,000 contacts the second scrape, right.
2:29 So how you would do that is, obviously, you get the zip code that you're going to scrape, right. Does. The next zip code in line, you're going to want to go here, and you'll have the login info for this website.
2:45 When you, whenever you log in to this website, you'll be directly directed to here, And I'll show you how to kind of use and, and work your way around this website.
2:56 But whenever you're scraping data, you just want to paste the zip codes in here without any spaces, and you want to select the section that says zip, right?
3:06 So as you could see here, it's 28,000. properties, so 28,000 contexts in this area. But that's too much for one scrape, so what we want to filter down with is actually this.
3:20 We go to more, we go to property characteristics, Peace. And there's two filters that we want to set up. You're built is less than, you want to click is less than option.
3:32 Boom. Narrowed it down by almost half. living area is greater than 1200. You'll confirm that.
3:51 And as you can see, it significantly narrows down the people in this area to our preferred filters. So these are the two filters that we want, right?
4:00 Now, for the situations that, let's say you put in one zip code, and there isn't enough context, there'll be another video on this, but you'll just want to put in as many zip codes as you can to fulfill the amount of context as possible.
4:13 Right? So, these are the filters that we want to have. Once you have those filters, and once you have enough people in this section, so enough context that you're going to scrape, you're going to want to click Build List. Now, I've already built this list, so I'm going to show you what that looks like
4:31 . Again, I've already built it, but you'll want to go to Build List. Right? Once it builds the list, you're going to want to go here, and again, And these, the leads that you scraped beforehand should have to be completely deleted, the previous scrape, they should be completely deleted.
4:47 If not, AI is going to get messed up when you're scraping, so you just want to have one person's leads at a time.
4:53 You don't want to have anyone else's leads, you just want to have one person's leads. Right, so once you build a list, and it says list completed, it'll say how many leads are in here, right, how many leads are currently in, in, in this table, right, and as you could see, the maximum we could show per
5:11 page is a hundred. Right, so in this, there's ninety-eight pages, so what you'll want to do, and it'll show you in the next video, according to how many leads there are, you'll want to go two pages below what there, what there is, so if there's ninety-eight hundred leads, you'll want to do, there's ninety-eight
5:30 pages, but you only want to scrape ninety-six, because it gets messed up. But again, that's how you get the data to scrape.
5:38 I'll do a quick, brief, brief, brief walkthrough on how to do this. Here it is. You're in this section. You're going to your next contact that you want to scrape.
5:51 You'll say, you'll open it up. You'll scroll down to this section. You'll determine which one is closest in line. You'll copy this.
6:03 You'll upload it into here. You'll set the filters if there's not enough context. You'll add another zip code because it could scrape multiple zip codes at a time.
6:12 And then you'll just add as many zip codes or if you just have one that fulfills how many context you need.
6:19 You'll click build list. You'll go here. You'll see how many zip pages there is and then you'll continue to step four.
6:32 I am adding this, sorry for the interruption, I am adding this post-edit so if it interrupts abruptly, sorry for that, it'll continue explaining the video.
6:40 If it's confusing, again, you could reach out to me. I forgot to add this in the video. So as you're scraping and you're uploading it into DealMachine, every zip code that you're going to add into a list, which we'll show you later in this video, every time you add it to the search bar, the ones that
6:58 you're going to confirm, you add it here. So if you're going to search up this zip code and you're going to build it into a list, you paste it in here and then you delete it from up here, right, because these are for, uhm, zip codes that you already scraped so you can keep track of what you haven't scraped
7:15 and what you have, right. If there's more than one zip code that you're adding to fulfill the contact needs for this client, you just, uhm, add them into here.
7:24 So if you added more than one, you just delete it from up here and then you add it down here.

### Quick Extraction Notes

- Core process steps:
  - Select next target ZIP from the `not yet scraped` field in client details.
  - Use weekly appointment target to estimate contact volume needed (about 1,000 contacts per appointment target).
  - Build DealMachine list with ZIP-mode search and property filters.
  - If one ZIP is insufficient, stack multiple ZIPs in same list build.
  - Keep only one client's lead list active at a time; previous list must be deleted first.
  - Use page count to set scrape budget (scrape up to total pages minus 2).
  - Move every ZIP used from `not scraped` field to `already scraped` field for tracking.
- Tools mentioned:
  - ClickUp client details table
  - DealMachine list builder
- Handoffs mentioned:
  - Operator continues to next SOP step after list build and page budgeting.
  - Managers available for clarification if process confusion remains.
- Risks mentioned:
  - Oversized contact pulls can break/overload automation flow.
  - Multiple clients in one lead table corrupts scrape quality.
  - Failure to maintain scraped/not-scraped ZIP fields causes duplicate area pulls.
  - Scraping all pages can fail; stated guardrail is pages minus 2.
- Metrics mentioned:
  - Approx target: 1,000 contacts per weekly appointment goal.
  - Practical scrape batch guidance: 10k-15k (sometimes up to ~20k per run).
  - For large needs (example 30), split across multiple runs (e.g., two 15k runs).
- Unknowns/questions:
  - Confirm exact numeric threshold for `Year Built is less than` filter (not specified in transcript).
  - Confirm whether `pages minus 2` guardrail is still current after script updates.

### Transcript Entry

- Source link: not provided yet
- Video title: Step 4: Data Scraping Guide
- Approx date recorded: unknown
- Speaker(s): seller/operator (name not provided)
- Stage guess:
  - fulfillment

### Raw Transcript

00:00 So this is part four on the data scraping SOP. Now, by this point, you should have no other leads in here, except the ones you just upload them, upload them, upload it from the search and the filters that you put it in.
00:16 In the last section, again, you should have enough context to fulfill how many appointments slash leads they want per week.
00:25 And you should have enough data for that, right? So. The fourth step is the actual running. The AI agent slash automation, right?
00:36 So. The last part you'll want to do here, because you're going to get signed out. Is you're just again going to want to make sure how many pages there is.
00:44 There's 9800 contacts. So there's 98 pages. And we always want to do. To below the maximum of pages. Right? So in this case, there's 98 pages, because there's 9800 contacts.
00:56 But you only want to scrape 96 pages. So keep that in mind. Right? Now, you're going to want to log in to Octoparse.
01:04 And I will be showing you in detail how this works, how you could, you know, play around with Octoparse and everything.
01:13 But, once you get the hang of it, once you log in, you'll have all the log and info needed to sign in here.
01:18 But, you're going to want to head over to tab- ask list. And there's two lists that are here. There's one for deal machine property.
01:29 And there's one deal machine phone scrape page by page. Right? So the first section. To give you context is we have to scrape two times for the same lead list.
01:43 So we, because we have to scrape two different sections per lead list. So as you can see here, deal machine property, what this does, what this specific automation does.
01:53 Is, it scrapes this section of the lead list. So property just means property addresses. So the first time you run the automation, it scrapes this section of all the pages.
02:07 Right? So. The first time we run it for this lead list is gonna be for property addresses. And then we're gonna run the second automation for, for this section here.
02:18 For the phone number of names. Right? So deal machine property. This. This section. Or that automation scrapes this section. And.
02:31 This automation. Scrapes this section. And every time you scrape, you cannot run two at a time. You could only run run at a time.
02:41 And. You have to wait for it to finish. And you have to export the CSV before you move on to the second section.
02:47 So. For this training, I'm going to show you how to stripe both at a time. Right? So once you have your lead list uploaded.
02:55 You know how many pages there is. You want to open up Octoparse. And then you want to head to this one.
03:00 The dual machine property. It'll probably be numbered by the time you see this. You understand which section to scrape first.
03:07 You want to go into this. And you don't want to mess with anything here. Because if you touch anything, you see how it highlights it, it, you're going to mess it up.
03:19 So always make sure you have the brow section on. Right? So you don't accidentally mess anything up. Now what you're going to do inside of Octoparse is you're going to want to scroll down on this left hand side.
03:32 And you're not going to want to touch anything except what I'm about to show you. Right? And you could even drag it out a little bit.
03:37 So don't mess with anything. Just follow these steps exactly. You're going to scroll down to this final box. Right? There's going to be an outer box, and then there's going to be an inner box that says loop out M1 and loop out M2. Now, there's two things that- You have to do every time you're going to
03:55 scrape a different section. You're going to want to click firstly, loop item number two. And you're going to want to adjust the number at times it scrapes.
04:07 So, for my last scrape, it was 93 pages. But for this scrape, there's 90, 100 contacts. So 98 pages. But again, you always want to do.
04:17 So, thank you. So, if there's 98 pages, we only want to scrape in this situation. 96 pages. You hit Apply.
04:30 You hit Save. Right. Another tip I want to give you is, according to how many leads there are, it's going to take longer to load each page.
04:41 So, you You can see here the page, the automation automatically scrolls through pages. Right. So you don't have to worry about it doing anything or scraping the wrong information because it scrapes everything correctly.
04:54 So what the automation is basically doing for you is it's loading. Now you can see how long it took to even switch from 25 per page to 100 per page.
05:04 So the more leads there are, as you get lower down the lead list, as the automation gets lower down the lead list, it takes a while to load this section.
05:13 So, I'll. I'll give you an example here. Let's say I'm going to the next page. It takes a couple seconds to load.
05:20 And as you go further down the list, it takes longer and longer to load. So. If. The good rule of thumb.
05:30 Is once you adjust how many pages you're scraping for the property one. You want to click loop item two. And then you want to head over to options.
05:41 You want to keep it at 10 seconds. But if it's bigger. Then 15,000 contacts. You want to switch it to 15 seconds.
05:51 But if it's under 15,000 contacts, you want to keep it at 10 seconds. Okay. Again, if it's over 15,000 contacts.
06:00 One one scrape, which it shouldn't. Because most people don't want more than 15 appointments a week. If they do, you'll scrape, it, you'll scrape two different zip codes or you'll scrape, you'll do two scrapes.
06:13 Right? Technically four, because you're running the automation twice. For each section, but for two different lead lists. Right? But if it's above 15,000 context, then you'll want to do 15 seconds.
06:24 But if it's below, do 10 seconds. What this does for you to have a little bit of context. Is it, that's the number of seconds it needs to wait before running this, the scrape.
06:35 Right? So what the automation basically does is as soon as it logs into the website, and it gets to this page, it'll start scraping this automatically.
06:43 And it scrapes it super fast. Right? And if you go to the next page, and you don't allow it to wait, it'll skip the page, and you'll miss the context.
06:51 So you need to allow it sometime for the page to load in so it gets great. So that's what it's doing.
06:56 It's just waiting a couple seconds for the page to load. That's all it is. So, to recap, you've adjusted the number of pages with the Loop Item 2 box that you want to scrape, 96, and if needed, you would have adjusted the time in between each one.
07:17 Then you'll click Save if you haven't saved it already, and then you would click Run, and then you'll click Standard Mode, And this box will pop up.
07:31 Once this box pops up, that's how you know it's scraping, you could go to the event log, just to know everything's right.
07:37 And you could even open up browser mode. And you'll be able to see the automation go live. And you can see here it automatically goes to a hundred per page.
07:48 And then it'll automatically start scraping. Right? It'll wait. Like that. And then boom. It scrapes. And then it'll click next page.
07:59 And then you can see here it's waiting ten seconds for the page to love. Right? Now, you're just going to want to let this run.
08:07 In the, In background, you do have to have it. You cannot minimize it. Because if you minimize it, it'll be slow.
08:15 And it'll mess it up. So you have to minimize it. And another tip I want to give you is you need to make sure.
08:22 For this screen. Right? Every time you're scraping, it's the same number of pages for property and phone number. Right? If not, you're gonna get mixed data.
08:32 data. And it's not gonna match up. And what I mean by that is specific numbers apply to specific addresses. Right?
08:39 And we want to make sure it's Scraping at the same level. So you want to make sure once we upload it, Heather has the correct address.
08:47 Right? But for now, you're just gonna wait for deal machine property to load. And to fully scrape. And you're gonna let it finish.
08:57 It'll pop up automatically once it finishes. For this example, I'm just gonna end the automation early. So I can show you how to export.
09:06 But in reality, you do. I want to let it fully finish and hit the target number of pages. So, if, if it's 96 pages, for this example, it'll get you 96,900, er, 99. Right? Because it starts on page one, so you have to, it's an extra page, right?
09:32 So, if you want ten pages, it will not only script a hundred contacts, or a thousand contacts. Excuse me, it'll script a thousand ninety-nine contacts.
09:43 So there's always going to be an extra ninety-nine at the end, just because it starts at page one. But if it's ninety-six pages in this example, you want ninety-six thousand ninety-nine contacts.
09:55 Right? So for the- for example, I'll stop it. And once it stops, not by you doing it, but once it scraped the number of pages that you want us to scrape.
10:04 So, you'll click Export. Export. Export all. And for this example, for the first property list, you're gonna get a street address, the city, the state, and the zip code.
10:20 Right, so for this export, you're going to want to save as, CSV. You'll confirm it. It'll pop up this. And, you know, as you can see here, I don't mind this, I was getting seeing my computer, but I name it according to zip codes.
10:37 So. excuse me about that. If I'm scraping the zip code, I'd name it two, six, five, five, four. Full, proper, T.
10:51 Scrape. Right. And for, for the. Phone number, I name it Full Phone Scrape. For the property, so I can identify the difference, I name it Full Property Scrape.
11:02 You, you'd want to click Save All. Test. Just so I know we haven't even scraped this one yet. You'd want to click Save.
11:13 And then, it should pop up with this. Once the counter goes to the target number, or the amount of data that you have, you'd want to click X.
11:22 And then you'd want to- Thinks it out. Confirm. Now. What you want to do is you want- I'm going to open up a sheet.
11:31 So I have this sheet as an example. For your sheet, it should only be one at a time. this is just a master sheet I use.
11:39 so I could run a couple tests, but for you, you only want to- I have one sheet at a time, or if you want to have a different system of organization that's up to you.
11:47 Right? But you want to open up a sheet, you want to go to File, Import, and then you want to upload, the CSV that you just scraped.
11:57 So, in this case, it'd be 2,6, 5,5,4 test, but I've already scraped all the property addresses. So, you'd click, excuse me about that, so you'd click the CSV you just scraped.
12:22 You go to replace current sheet and then you import the data. You wait for it to load.
12:38 Once it loads in, it'll populate something like this. Right? The data is going to be a little bit weird. It's going to be stacked up against each other, but you just want to make sure you have.
12:49 The desired number of leads. So if you remember correctly, as long as we don't reload the page, because we'll be signed out because the automation signed in, but it says 9,800 contacts and we own.
13:01 We only scraped a certain amount, right? We only scraped 96, or 93, excuse me, for this scrape, right? It should have been 96, but I put in 93, and you just want to make sure it scraped the amount of- contacts that you need, right?
13:15 And see, I'll scroll all the way down, and- oop. Scroll all the way down, and 94 on our contour. So, yeah, I won in 90. This is a perfect example.
13:26 So, in this case, I put 93 pages, and it did scrape 93 pages. The reason it says 9400 is because it starts in page 1. So, it's- it's whatever amount of pages you want to scrape, plus the first page.
13:39 So, if it's 93, it'll scrape 94 pages. If it's 96 pages, it'll technically scrape 97 pages. So, keep that in mind.
13:45 So, you want to upload that, and then you want to click on column A, you want to go to extensions, you want to go to power tools.
14:00 If you haven't downloaded this yet, Like in the beginning of the video training course, you should download it. It's called power tools.
14:08 It's a Google Sheet extension. Download that. You'll get a 14-day free trial. Or if we give you an account with it, it'll be automatically, paid for, right?
14:18 So, you'll go to power tools. You'll go to tools. You'll go to splits. It'll pop up a box on the right-hand side.
14:26 You make sure column A is highlighted. You go to split text and you select, line break. Now, you click split and what it'll do is it'll separate each, each line.
14:41 Right? And you could see here. Boom, it separated line by line. You wanna click this box. And you wanna name column A street address.
14:56 You wanna delete these two columns. So just erase the data on them. And then for this one, we have to separate the data again.
15:04 So. So some cities have spaces. Some cities are weird. So the cities and the states and zip codes. We wanna separate it at two times.
15:14 We wanna separate first the cities from the rest of the data, right? And what we do to do that is we separate.
15:20 We separate it by comma, right? You could either use power tools for this or you could use, the native integration.
15:26 I just use power tools just because it's a little bit faster for me. So you'd wanna uncheck line break and you'd only wanna do comma.
15:33 Because we only wanna separate the cities. The city for this, this one. From the rest of it. It'll work. And as you could see here, it'll separate the city.
15:42 And the rest of the data. Boom. It did that. We named column B city. Now we wanna separate the, These two as well.
15:51 Because this is the state abbreviation. And this is the zip code. So we wanna highlight column C. We wanna split values by spaces.
16:02 And then we click split. It'll be working. Boom. We delete column C. If it, if it does that, if it adds a column to the left, it'll lead it.
16:17 If it doesn't, we wanna have it like this, right? We wanna have street address, city, state, zip code. So we need.
16:23 In column C, state, we name column D, zip code. We, you have to capitalize it like this, and then boom.
16:36 The data that we scraped, we formatted it correctly. And we named the columns correctly and we separated the data. Now all you have to do is you open up Octoparse again.
16:51 And once you open up Octoparse, since we already scraped the properties, as you can see here, this is the street address, and all the property things, we want to scrape the phone number and the name.
17:05 Right? So you want to open up, the deal machine phone scraped page by page. Again, make sure it's just brows so you don't mess up anything.
17:15 It'll go down here, and you will, Repeat the same steps. You'll adjust how many pages you want to scrape. So in this case, 96 or 93, like I was doing it.
17:26 Just... I know it's a little bit confusing, confusing because I messed it up. But just two pages below what it says.
17:33 is on. On the lead list, I already scraped it 93 accident. But like I said, it should be too under how many pages there is in the lead list on deal machine.
17:45 So you adjust the number of pages that you want. If it's bigger than 15,000 contacts. You adjust the time, right?
17:52 And then you click save. You click run. And then you click run, right? Running in, run on device. Or run on local machine, right?
18:01 It'll just say standard mode like this, but you want to do it run on your device, right? So we'll click run.
18:09 We'll click it. And it'll pop up, like, on the, The previous example that I showed you, and it'll pop up something like this.
18:18 Let's say you did it, and you waited, and now it's done. Right? It should say, how many pages you scraped, and then the extra nine, Right? So you'll let it run, as you can see here, it's spent 30 minutes.
18:30 It's still really fast to scrape that much data compared to other methods that people use. So it's still super fast.
18:37 You'll do, You'll double check how many pages you scraped. So if you get it wrong, there's a couple things you could do, but most of the time you're going to need to rerun it.
18:47 Right? Now don't click rerun yet. If you got it wrong, just follow along. But if you got it right, you'll click Export.
18:55 Export all. CSV. Confirm. And I actually haven't uploaded this one yet. So, we want to do two, six. Five, five, four.
19:11 Full phone script. Because we already scraped all the home addresses. Now we're scraping on the phone numbers connected to that.
19:21 So we do full phone number scrape. We do save. We wait for it to load in. Give it a couple seconds.
19:33 Boom. It's loaded in. You could exit out of here. You could exit this and you'll go back to the sheet that you were previously working on.
19:44 As you're back in this sheet, again, there should only be one. This is from my other test. You'll want to add another sheet directly next to this one.
19:54 Because we're going to be importing another sheet. So you'll have the sheet where you just imported your addresses, but you want to click down here, add sheet, and you add a sheet to the right of it.
20:02 You do file. 1 import, you click upload, and then you upload the CSV you just downloaded. Right? And then you click replace current sheet, import data.
20:13 data. And it should automatically import the data. Boom, I'll just double checking a few things. So it imp- And as you can see here, there's some lines to keep that.
20:24 It's important for you to keep the data correct. What you want to do here is you want to scroll all the way down.
20:29 And you want to highlight all the way up and copy it. Because if you highlight it like this. Yes. It'll, it's for some reason the data always doubles and it'll be like, double the amount of people you have here.
20:42 So you have to follow this exactly how I'm teaching you. So you just go all the way to the bottom of the page and you scroll up.
20:49 You have to scroll all the way up to copy it. you scroll. The way, again, if you just highlight it by clicking the whole page or the whole column, it'll mess up the data how you paste it.
20:58 And there's, you have to follow what I'm doing. I know it's a little bit tedious, but it's the only way you can make sure the data is correct.
21:06 So you just want to scroll all the. The way up, I'll do that. Boom, you just want to make sure you get everyone in here.
21:18 And then, once you hit the top, like this, boom. You scroll a little bit down, and you want to make sure you only highlight all the way up to one.
21:29 You right-click, and then you click copy. Now, depending on how much data you have, it might take a while, right?
21:36 This is why, if it's, if the person wants, like, 30... or appointments a week, you want to do two separate lead lists for them, right?
21:44 Because the more data you have in here, sometimes it glitches, right? So you want to go back to the original sheet.
21:50 You want to go next to zip code. Click this cell. E number one. You right-click here. And then you click paste.
21:58 Boom. It's my computer's freezing right now. There we go. You want to go back here, and then you could delete it.
22:05 Right? Now, all you want to do here is you just want to scroll down, see if there's- it's the right- a number, yep.
22:12 Okay, and then you just want to scroll to a random number. Right? Usually closer to the end. Let's do Donald Miller.
22:20 You want to copy his phone number. And here's how we're going to check the data lines up. Right? And then you did it- correctly with the amount of pages and the time.
22:30 Because if you do a different number of pages between each two sections of the property and phone numbers, the data will not align.
22:37 And you have to redo the entire thing. Not just the phone number, but the property addresses too. So to make- sure the data is aligned, you want to click the phone number section, copy a random phone number, usually closer to the end and you want to go back to deal machine, you'll have to refresh the
22:56 page, it'll say you've been logged out, it'll log back. Back in, you'll go to leads section, you should already be there.
23:05 And then you just want to paste the phone number you just copied into the search bar. You want to search by phone.
23:11 Sometimes it'll, it'll pre-set address. You want to click the drop-down menu and then search by phone. So you paste the phone number in here.
23:19 You make sure it's the person you just copied their phone number. You look at their address and then you verify it's the cor- direct address.
23:27 So Donald L. Miller's who we got. We pasted it in Donald L. Miller 558 Fost Street. Boom, you scroll down a little bit more.
23:38 You get another random phone number. Copy it. You paste it. And then you click search. Boom. Brad. 3076 Jakes from Brad.
23:54 3076. Jakes from. So the data is lining up correctly. So, you'll go back up here. You'll click e. You'll put this to line break so you can separate it.
24:09 You'll click split. You wait for it to separate into different sales. And then pay attention very closely to these next couple steps, because it gets a little bit confusing.
24:23 Right? Boom. Do not click on anything until it stops. Until the working box disappears. Right? So you'll click a different random cell.
24:33 E number one. This cell you want to name phone. Numbers and capitalize the beginning of each word. And then here, you see how in this column.
24:44 Some of them have the full name. But in this column, some of them will have phone for some reason. So what you want to do is you want to highlight F and J.
24:53 You want to click this lightning bolt here in power tools. And then you want to go to merge and combine.
25:00 You want to click merge values. And then you want to separate values with a semicolon. And then you just want to click merge.
25:09 What this does, it im, it merges this column and this column. Because for some reason. Some people have DNC. That's just a tag they use.
25:19 And some people don't. So, sometimes the names are in column G or in column F. But to make sure we get all the names.
25:28 You just want to merge these two cells. You could delete the cells that have phone and call. You could even delete the one with the original one with only the name.
25:38 And then we just want this column. Some will have just the name and phone. Just, some will have just the name.
25:43 Some will have DNC, the name and phone. But what you want to do. Is once these columns are merged together.
25:51 You want to highlight the column. You want to get to edit. Find and replace. And then you want to eliminate anything but the name.
26:00 And how you do that is the first thing you get rid of is DNC. So you click, er, er, you type in an all caps DNC.
26:08 You replace all. Boom, it just got rid of everything that's as DNC. And then you type in a semia colon.
26:18 And then you replace all. So that gets rid of all the stuff. And the last thing you want to get rid of is the thing that's as phone. So you click replace all.
26:27 So you see how it replaces 2,500 instances. Phone with it. Boom, you click down. And now we just cleaned up the entire cell.
26:35 Now it's just the name in the right column. Right, so we have everyone's name in one column without any of the other junk.
26:41 Once you've done that, you want to click F. You want to highlight the column F. Click this little lightning bolt here.
26:49 You want to click split. You want to click. Like, split names. And then you want to split. It'll automatically detect what's the first name, what's the middle name and what's the last name.
27:01 Right, again, you want to wait before clicking the sheet. You don't want to do anything until this box goes away here.
27:07 So we'll wait for that. Boom. It separated the names. You could delete column F. And all we need is the first and last name.
27:18 We do not need the middle name. Right, so you could delete the middle name column. And then you'll name column F.
27:25 First name. And column J. Last name. Right. Once you do this, you're not done. You have one more step before you move on to step five, which is verifying the context.
27:40 But in order to finish this step, In, sorry about that. I'm going to interrupt it. In order to finish this step, what you want to do is you want to select this funnel here.
27:49 First, to, make it appear like this. You select all, and then you select it all, and then you click Create a Filter.
27:57 Right, to create this, and you want to keep a high lighted. You select this little funnel here in the phone number section.
28:04 You click Clear. What we're filtering for is this little dash right here. Right? We click, we, we, we want to make sure the only thing that's selected is this dash mark right here.
28:17 We click OK. And what that'll do is that'll show everyone without a phone number or name. We want to highlight the entire page.
28:24 Click Control. Click the first row so it doesn't highlight that. And then right click this. And then delete the rows that only have the dash.
28:35 And don't have a phone number. Again, you want to make sure you press Let's Control. And you click on row number one.
28:42 So you only get rid of the data here that doesn't have phones. And as you can see here, the more data you have, the more stress it'll put on your computer.
28:50 If this pops up, you click Wait. If it doesn't, you just continue to wait. Right? And what that'll do is it'll delete all the data.
28:58 Boom, you could remove the filter. And now we only have people with a phone number. And the first thing. And that's how you scrape data.
29:05 That's how you get the zip codes. That's how you determine how much data to scrape. And that's how you use the

### Quick Extraction Notes

- Core process steps:
  - Run two Octoparse tasks per list, in order:
    - `DealMachine Property` first,
    - `DealMachine Phone Scrape Page by Page` second.
  - Set page loop to target pages (still using `total pages minus 2` rule from prior steps).
  - Set wait timing:
    - 10 seconds default,
    - 15 seconds when contact volume is above 15,000.
  - Do not run both tasks at once; export first CSV before starting second task.
  - Keep page counts and timing consistent between property and phone runs to preserve row alignment.
  - Export naming convention by ZIP:
    - `ZIP Full Property Scrape.csv`
    - `ZIP Full Phone Scrape.csv`
  - Import property CSV and normalize address columns (street/city/state/zip).
  - Import phone CSV into second sheet, then merge into main sheet and verify phone-to-address alignment against DealMachine search-by-phone.
  - Clean name/phone columns with Power Tools and remove rows with missing phone data.
- Tools mentioned:
  - Octoparse (`Task List`, loop item settings, run/export)
  - DealMachine (lead page count, search by phone verification)
  - Google Sheets + Power Tools
- Handoffs mentioned:
  - Operator moves to verification step only after both task outputs are aligned and cleaned.
- Risks mentioned:
  - Running mismatched page counts/timing across two tasks causes data misalignment.
  - Running tasks in parallel or minimizing run window can corrupt/slow scrape.
  - Incorrect copy/paste method for phone sheet can duplicate data.
  - Missing phone-filter cleanup leaves unusable contacts in output.
- Metrics mentioned:
  - Over-15k contacts threshold triggers 15-second wait.
  - Typical output includes extra `+99` rows behavior due to page-1 handling.
- Unknowns/questions:
  - Clarify exact run-window behavior note (`cannot minimize`) with current Octoparse version.
  - Confirm whether `+99` row math still matches latest task definitions.

---

### Transcript Entry

- Source link: not provided yet
- Video title: Step 5: Data Scraping Guide
- Approx date recorded: unknown
- Speaker(s): seller/operator (name not provided)
- Stage guess:
  - fulfillment

### Raw Transcript

0:00 So, I'm going to be showing you the final step, which is just uploading the actual file and verifying the context.
0:07 So, once you have a Google Sheet, remember, this is, I already verified the context, we just scraped it, I forgot to record on that.
0:14 But pretend this is the Google Sheet, uh, still for Wayne, location number 2, so pretend we're still doing this one.
0:21 What you'd want to do, is, You download the sheet, and then you go to, Landline Remover, the sheet you want You upload that sheet.
0:43 You upload file. You select what phone number, or what column has the phone number. You select the column that says phone number.
0:55 You click process. And then you process and download records. Once you click this, I'm not going to click it right now because I've already done that.
1:03 Once you click this, it'll take you to this screen. And you'll have to wait for the contacts to be verified.
1:10 You refresh every now and then. Boom. You downloaded the output file. So you got to wait a little bit. The bigger the sheet, the more you have to wait.
1:20 you click download once the file is done. Verifying. And then you go back to the sheet that you were on.
1:26 And what you'll do is, you'll go to file, import. You'll go to upload, browse, and then you select the file you just downloaded from Landline Improver.
1:42 And then you want to click replace current sheet. And then you want to click import data. So we're going to be this data with the data we just cleaned.
1:47 You want to highlight the whole page. Go to filters. Go to this little filter section here. And if you want to clear everything first and if there's a list of things you want to click that and delete these because these are people who have complained to the government about being reached out before.
2:04 And we don't want that. So you, once you clean those out and you only have DNC clean and the other ones, everyone, everything except litigator, you just want to go ahead and delete this.
2:18 Boom. You download the final sheet. Sorry about that. Once you download the final sheet, everything is gone. Everything is Everything is scraped.
2:28 You've already ran it through lead, uh, through landline remover. You want to go back to the zip data channel. You want to take away your eye emoji from there.
2:38 The person you were just scraping. Add a completed. And then reply in a thread. Here is the CSV sheet.
2:51 And then you go here. Uh, you see how many contacts there is. You write it. So, you want to say the CSV sheet is done, and there is 1,700 contacts.
3:10 Boom. You attach the CSV. And then, you send it. And then, I'll be able to download it directly from there.
3:25 And then, what you'll do is, once you've replied to it, and once you've verified all the contacts, you go back here.
3:33 And then, you select the person you were just working with. So, you can, you can, let's an activity that is and we'll And then, you send it to, let's the other person as well. And take a few more. And sent that to. Just and It means, hey, the context have been uploaded.
3:55 They're verified. They're scraped. Uh, you guys have the CSV. Now, it's the next person's job to upload them into go out level.
4:02 Now, it's the next person's job to do the rest of the process. Right? So, you can. Don't do it green.
4:08 You mark it as needs help. Right? Once you mark it as needs help, you're going to want to go to the submission team channel and tag the next person in charge.
4:22 I'm going to use myself in the As an example, you'll tag the person in charge of the accounts. For now, it's going to be me or in the future, we will tell you beforehand who you're going to be tagging.
4:34 You'll tag the next person in charge to handle the rest of the process. And you will say, You'll go back here, you'll copy the person's name exactly, is marked now as Need's Help, and CSV is guys.
4:55 Uploaded to Slack, to Slack, and will be in this reply thread. You send that?
5:09 Umm, you mark it as completed. You reply in thread. And then you just reply with the CSV sheet.
5:23 So what this does, it lets the next person know. That, uh, they need to finish up the rest of the process.
5:30 And they will handle the rest. And it also gives them the CSV sheet. Cause they'll need it as well. Right. So, that's the next step of the process.
5:41 It's downloading it, uploading it, uploading and allowing it land on a remover. Verifying. And then uploading the context into the process of using Slack with it.

### Quick Extraction Notes

- Core process steps:
  - Download cleaned Google Sheet CSV and upload to Landline Remover.
  - Select `Phone Number` column, process verification, and wait for output file.
  - Import Landline output back into Google Sheets (`replace current sheet`).
  - Apply filter cleanup with special attention to removing litigators before final export.
  - Download final CSV and close out `Zip Data Channel` claim:
    - remove `eyes`,
    - mark completed,
    - reply in thread with CSV attachment + final contact count.
  - Move client status to `needs help`.
  - Tag next owner in `submission team` and point to the reply thread where CSV is attached.
- Tools mentioned:
  - Google Sheets
  - Landline Remover
  - Slack (`Zip Data Channel`, `submission team`)
- Handoffs mentioned:
  - Scrape operator owns validation + final CSV packaging.
  - Upload operator owns post-handoff GHL import once client is marked `needs help`.
- Risks mentioned:
  - Missing litigator removal creates compliance/legal exposure.
  - Missing count in thread makes output-quality verification weak.
  - Failing to mark `needs help` can block downstream upload owner from acting.
- Metrics mentioned:
  - Contact count must be explicitly reported in completion thread (example shown: `1,700`).
- Unknowns/questions:
  - Confirm final allowed status combinations in Landline output filter (exact keep/remove matrix).
  - Confirm canonical Slack completion template text for consistency across operators.
