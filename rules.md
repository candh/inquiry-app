# rules

Alright, we need to define some rules before we make
the site. These rules will be enforced on the site and will
govern how the site work. This will make the development process
just about the code and not about the actual rules.

This is an evolving document

# general rules

- users can browse questions and answers without signing up
- interacting with the site further requires the user to be logged in

# account

## account reputation

Mostly like stackoverflow

- question is voted up +5
- answer is voted up +10
- answer is marked accepted +15 (+2 to acceptor)
- association bonus +100 (TODO: need to think about how to handle this)

## account types

### admin

- This is the superuser/God
- Has read/write access to all questions, answers and comments
- Basically has database access

### moderator

- This has read/write access to all questions, answers and comments (through the site interface)
- Per Category? Maybe?
- Limited functionalities
- Can't connect shell to the database server (obviously)
- Can only be appointed by a admin or a moderator

### user

- Can ask questions from their account
- Can answer questions
- Can edit their own questions and answers
- Basic Functionalities

# question

- can be upvoted and downvoted
- can be edited by admin/moderator/the user who asked it
- can be edited within 2 days (todo: think about this)

# Edit

This part explains how to deal with edits on the site.
The current idea is to allow

- The user who created the 'post' to edit it
- Let other users edit other users's post. This will be a challenge to implement

Let's take a closer look at how other users can edit other users' posts

- Just like stackoverflow
- Does not require any reputation to edit a post
- Mods can 'revert' the edit, or edit the edit itself, making a new version
- Edits needs to be tracked.
- diff
