# How do I contribute code? 

### Find
We use JIRA issues to track bugs for this project. Find an issue that you would like to
work on (or file one if you have discovered a new issue!). If no-one is working on it,
assign it to yourself only if you intend to work on it shortly.
The easiest way to get started working with the code base is to pick up a really easy
JIRA and work on that. This will help you get familiar with the code base, build system,
review process, etc. We flag these kind of starter bugs
[here](https://issues.apache.org/jira/issues/?jql=project%3DYUNIKORN%20AND%20status%3DOpen%20AND%20labels%3Dnewbie).

It’s a good idea to discuss your intended approach on the issue. You are much more
likely to have your patch reviewed and committed if you’ve already got buy-in from the
YuniKorn community before you start.

If you cannot assign the JIRA to yourself ask the community to help assign it and add you
to the contributors list in JIRA.   

### Fix
Now start coding! As you are writing your patch, please keep the following things in mind:

First, please include tests with your patch. If your patch adds a feature or fixes a bug
and does not include tests, it will generally not be accepted. If you are unsure how to
write tests for a particular component, please ask on the issue for guidance.

Second, please keep your patch narrowly targeted to the problem described by the issue.
It’s better for everyone if we maintain discipline about the scope of each patch. In
general, if you find a bug while working on a specific feature, file a issue for the bug,
check if you can assign it to yourself and fix it independently of the feature. This helps
us to differentiate between bug fixes and features and allows us to build stable
maintenance releases.

Make sure you have observed the recommendations in the coding guidelines.

Finally, please write a good, clear commit message, with a short, descriptive title and
a message that is exactly long enough to explain what the problem was, and how it was
fixed.

Please create a pull request on github with your patch.

The pull request description should include the JIRA reference that you are working on.
For example a pull request linked to [YUNIKORN-2](https://issues.apache.org/jira/browse/YUNIKORN-2) should have a description like:
`[YUNIKORN-2] Gang scheduling interface parameters`
