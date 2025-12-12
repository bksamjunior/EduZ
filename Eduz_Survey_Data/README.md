EduZ Survey Admin README

Location: /EduZ_Survey_Data/

Sheets:
- EduZ - Teachers Responses
- EduZ - Students Responses

Scripts:
- Apps Script attached to each sheet: ConsentLogger and DeletionHandler

Deletion requests:
- Check DELETION_REQUESTS.csv daily
- When a deletion request is received, remove the row(s) from the responses sheet and archive a copy encrypted in /Archive/ before deletion, then mark the deletion as complete in DELETION_REQUESTS.csv.

Contact: myeduz.contact@gmail.com
