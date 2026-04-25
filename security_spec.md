# Security Specification for PROFMOUMEN

## 1. Data Invariants
- A content item must have a valid `category` (course, exercise, video, tool).
- A content item must have a valid `type` (pdf, youtube, h5p).
- A content item must have a non-empty `title` and `url`.
- Only the authenticated teacher (moumenmalsah@gmail.com) can create, update, or delete content.
- Everyone (public) can read content items.

## 2. The "Dirty Dozen" Payloads (Target: /contents/{contentId})

1. **Identity Spoofing (Create)**: Someone other than the teacher tries to create content.
   - Response: `PERMISSION_DENIED`
2. **Identity Spoofing (Update)**: Someone other than the teacher tries to update content.
   - Response: `PERMISSION_DENIED`
3. **Identity Spoofing (Delete)**: Someone other than the teacher tries to delete content.
   - Response: `PERMISSION_DENIED`
4. **Invalid Category**: Creating content with category 'hacking'.
   - Response: `PERMISSION_DENIED`
5. **Invalid Type**: Creating content with type 'exe'.
   - Response: `PERMISSION_DENIED`
6. **Missing Required Fields**: Creating content without a `title`.
   - Response: `PERMISSION_DENIED`
7. **Resource Poisoning**: Creating content with a 2MB `title` string.
   - Response: `PERMISSION_DENIED`
8. **Resource Poisoning**: Creating content with a 2MB `url` string.
   - Response: `PERMISSION_DENIED`
9. **Bypass Role Check**: User logs in with a different email and tries to write.
   - Response: `PERMISSION_DENIED`
10. **State Corruption**: Attempting to set `createdAt` to a date in the future (not `request.time`).
    - Response: `PERMISSION_DENIED`
11. **Shadow Field Injection**: Adding an `isAdmin: true` field to a content document.
    - Response: `PERMISSION_DENIED` (due to strict key check)
12. **Unauthorized Bulk Read**: Attempting to list all contents without being authenticated (actually, public read is allowed, but maybe we should ensure it's filtered correctly if we had private data). *Wait, public read IS allowed for this app.* Let's replace this with: **ID Poisoning**: Attempting to use a very long string as a document ID.
    - Response: `PERMISSION_DENIED`

## 3. Test Runner Plan
I'll create `firestore.rules` that strictly enforce:
- `isTeacher()` helper (matches specific email and email_verified).
- `isValidContent()` helper (checks types, sizes, and required keys).
- `public` read access.
