# Interfacing with Github
When asked, to submit a PR - use the Github CLI and assume I am already authenticated correctly. When asked to create a PR follow this process:

1. git status - to check if there are any changes to commit
2. git add . - to add all the changes to the staging area (IF NEEDED)
3. git commit -m "your commit message" - to commit the changes (IF NEEDED)
4. git push - to push the changes to the remote repository (IF NEEDED)
5. git branch - to check the current branch
6. git log main..[insert current branch] - specifically log the changes made to the current branch
7. git diff --name-status main - check to see what files have been changed
8. gh pr create --title "Title goes here..." --body "Example body..."

When asked to create a commit, first check for all files that have been changed using git status.Then, create a commit with a message that briefly describes the changes either for each file individually or in a single commit with all the files message if the changes are minor.

When writing a message for the PR, do not include new lines in the message. Just write a single long message.